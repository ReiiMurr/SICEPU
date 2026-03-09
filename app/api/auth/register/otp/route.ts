import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const supabase = getSupabaseClient();

        console.log("Sending OTP to:", email);

        // Use a service role key if you want to bypass RLS, but here we assume the client has permissions
        // or we are using a custom backend logic. 
        // IMPORTANT: For production, use a SERVICE_ROLE_KEY to manage OTPs securely from the server.

        const { error } = await supabase
            .from("user_otps")
            .upsert(
                { email, otp, expires_at: expiresAt.toISOString() },
                { onConflict: "email" }
            );

        if (error) {
            console.error("Supabase Error Detail:", error);
            return NextResponse.json({ error: `Gagal menyimpan OTP: ${error.message}. Pastikan tabel 'user_otps' sudah dibuat dan RLS sudah diatur.` }, { status: 500 });
        }

        // Send email
        await sendOtpEmail(email, otp);

        return NextResponse.json({ message: "OTP berhasil dikirim ke email Anda" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
    }
}
