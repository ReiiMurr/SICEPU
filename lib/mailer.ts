import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "Laporin"}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: "Kode OTP Pendaftaran Anda",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verifikasi Akun Laporin</h2>
        <p>Terima kasih telah mendaftar di Laporin. Gunakan kode OTP di bawah ini untuk menyelesaikan pendaftaran Anda. Kode ini berlaku selama 10 menit.</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0070f3; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2024 Laporin. Semua hak dilindungi.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
