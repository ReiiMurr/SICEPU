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
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // 4. Masukkan data ke tabel profiles (DATABASE)
        if (authData.user) {
            const role = email === "laporin.service@gmail.com" ? "admin" : "masyarakat";
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: authData.user.id,
                    role: role,
                    full_name: fullName || email.split('@')[0],
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
