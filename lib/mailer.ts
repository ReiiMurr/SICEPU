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

export async function sendAdminNotification(adminEmail: string, reportDetails: { title: string, location: string, reporter: string, description: string }) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "Laporin"}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: adminEmail,
    subject: "🔔 Laporan Baru Masuk - SiLapor",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eef2f6; border-radius: 24px; background-color: #ffffff; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #0070f3; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 18px; display: inline-block; font-size: 24px; font-weight: bold;">S</div>
          <h2 style="margin-top: 15px; color: #1a1a1a; font-size: 24px; letter-spacing: -0.5px;">Notifikasi SiLapor</h2>
        </div>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #0070f3; font-size: 18px;">📋 Detail Laporan Terbaru</h3>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 30%;">Judul</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">: ${reportDetails.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Lokasi</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">: ${reportDetails.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Pelapor</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">: ${reportDetails.reporter}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Deskripsi:</p>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; font-size: 14px; color: #334155; line-height: 1.6;">
              ${reportDetails.description}
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #0070f3; color: white; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 112, 243, 0.3);">
            Buka Dashboard Admin
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
          Ini adalah pesan otomatis dari sistem SiLapor.<br/>
          &copy; 2024 SiLapor. Semua hak dilindungi.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendUserNotification(userEmail: string, reportDetails: { title: string, status: string, message: string, reportId: string }) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "Laporin"}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: `🔔 Update Laporan: ${reportDetails.status} - SiLapor`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eef2f6; border-radius: 24px; background-color: #ffffff; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #10b981; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 18px; display: inline-block; font-size: 24px; font-weight: bold;">S</div>
          <h2 style="margin-top: 15px; color: #1a1a1a; font-size: 24px; letter-spacing: -0.5px;">Update Laporan SiLapor</h2>
        </div>
        
        <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #10b981; font-size: 18px;">✨ Progress Telah Diperbarui</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Halo, kami ingin memberitahukan bahwa laporan Anda "<strong>${reportDetails.title}</strong>" telah mendapatkan update terbaru dari admin.
          </p>
          <hr style="border: 0; border-top: 1px solid #dcfce7; margin: 15px 0;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 30%;">Status</td>
              <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 700;">: ${reportDetails.status}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Pesan Admin:</p>
            <div style="background-color: #ffffff; border: 1px solid #dcfce7; border-radius: 12px; padding: 15px; font-size: 14px; color: #334155; line-height: 1.6;">
              ${reportDetails.message}
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/aduan" style="background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
            Lihat Detail Aduan Saya
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
          Ini adalah pesan otomatis dari sistem SiLapor.<br/>
          &copy; 2024 SiLapor. Semua hak dilindungi.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
