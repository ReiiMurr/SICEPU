import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    try {
        const { email, otp, password, fullName } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email dan OTP wajib diisi" }, { status: 400 });
        }

        const supabase = getSupabaseClient();

        // Check OTP
        const { data: otpData, error: otpError } = await supabase
            .from("user_otps")
            .select("*")
            .eq("email", email)
            .eq("otp", otp)
            .single();

        if (otpError || !otpData) {
            return NextResponse.json({ error: "Kode OTP salah atau tidak ditemukan" }, { status: 400 });
        }

        // Check expiry
        if (new Date(otpData.expires_at) < new Date()) {
            return NextResponse.json({ error: "Kode OTP telah kedaluwarsa" }, { status: 400 });
        }

        // 3. Daftarkan user ke Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (authError) {
          // Jika user sudah terdaftar, kita anggap auth sukses (mungkin dari attempt sebelumnya yang terputus)
          if (authError.message.toLowerCase().includes("already registered") || authError.status === 422) {
            // Lanjutkan saja untuk membereskan profile dan hapus OTP
          } else {
            return NextResponse.json({ error: authError.message }, { status: 500 });
          }
        }

        // 4. Masukkan data ke tabel profiles (DATABASE)
        // Kita butuh ID user. Jika authData.user ada (baru daftar), gunakan itu.
        // Jika tidak ada (karena sudah terdaftar), kita coba ambil ID-nya dari login sementara 
        // atau biarkan logic upsert yang mencari.
        let userId = authData?.user?.id;
        
        if (!userId) {
          // Coba cari profil yang sudah ada berdasarkan email atau lewat auth login singkat
          const { data: existingUser } = await supabase.from("profiles").select("id").eq("id", authData?.user?.id).maybeSingle();
          userId = existingUser?.id;
        }

        if (userId || authData.user) {
            const finalUserId = userId || authData.user?.id;
            const role = email === "laporin.service@gmail.com" ? "admin" : "masyarakat";
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: finalUserId,
                    role: role,
                    full_name: fullName || email.split('@')[0],
                    email: email,
                }, { onConflict: 'id' });

            if (profileError) {
                console.error("Gagal update profil di DB:", profileError);
            }
        }

        // 5. Hapus OTP karena sudah tidak digunakan
        await supabase.from("user_otps").delete().eq("email", email);

        return NextResponse.json({
            message: "Akun berhasil diaktifkan! Silakan masuk.",
            user: authData.user
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
    }
}
