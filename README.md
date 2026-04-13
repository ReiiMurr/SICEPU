# 🏔️ Laporin - Ekosistem Pelaporan Desa Cerdas

> **Memberdayakan Transparansi melalui Tata Kelola Digital Mutakhir.**

Laporin (v4.2.0-STABLE) adalah platform pengaduan dan aspirasi masyarakat premium berperforma tinggi yang dirancang khusus untuk tata kelola desa modern di Indonesia. Dibangun dengan fokus pada **Kepadatan Informasi** dan **UX yang Matang**, platform ini menjembatani kesenjangan antara warga dan perangkat desa dengan antarmuka yang elegan dan *real-time*.

---

## 💎 Filosofi Desain Premium
Laporin dibangun untuk kerja produktif. Kami mengutamakan **Kepadatan Informasi** dibandingkan elemen yang berukuran besar, memastikan administrator dapat mengelola volume data yang besar dengan efisien.
- **Tipografi Lexend**: Dioptimalkan untuk keterbacaan jangka panjang.
- **Native Dark Mode**: Dukungan penuh untuk lingkungan cahaya rendah.
- **Glassmorphism UI**: Efek blur dan border halus untuk pengalaman visual yang mendalam.
- **Mikro-interaktivitas**: Didukung oleh Framer Motion untuk antarmuka yang terasa "hidup".

---

## ✨ Fitur Utama

### 🏛️ Untuk Masyarakat (Warga)
- **Pelaporan Secepat Kilat**: Formulir intuitif yang mendukung lampiran multi-format (Gambar, Video 4K, Dokumen PDF/DOCX).
- **Prioritas Privasi**: Pilih antara laporan Publik atau Privat untuk aspirasi yang bersifat sensitif.
- **Pelacakan Siklus Hidup**: Timeline visual untuk memantau status dari `Baru` → `Diproses` → `Selesai`.
- **Pencarian Cerdas**: Temukan laporan publik dan lacak status via ID laporan unik.

### 🛡️ Untuk Admin (Perangkat Desa)
- **Pusat Komando Kritis**: Dashboard *real-time* dengan metrik performa layanan dan grafik pertumbuhan.
- **Validasi Cepat**: Proses, verifikasi, dan tanggapi laporan dalam satu antarmuka administrasi terpadu.
- **Tata Kelola Berbasis Peran (RBAC)**: Manajemen akun warga dan peran administratif yang aman.
- **Wawasan Geospasial**: Tampilan peta interaktif untuk visualisasi distribusi laporan di seluruh wilayah desa.
- **Notifikasi Pintar**: Peringatan email instan untuk laporan baru dan pembaruan status.

---

## 🚀 Tech Stack Modern

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Autentikasi**: Supabase Auth (Magic Links & Password)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Manajemen State**: Server Components + Client Hooks

---

## 🛠️ Instalasi & Konfigurasi

### 1. Persyaratan Sistem
- Node.js 18.x atau versi lebih tinggi
- Proyek Supabase aktif

### 2. Mulai Cepat
```bash
# Clone repositori
git clone https://github.com/ReiiMurr/Laporin.git

# Masuk ke direktori
cd Laporin

# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

### 3. Konfigurasi Environment
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=url_proyek_anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_anda
# Opsional: Konfigurasi NodeMailer untuk sistem notifikasi
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_USER=email_anda
EMAIL_SERVER_PASSWORD=app_password_anda
```

---


## 📜 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  <b>Laporin</b> • Dibuat dengan ❤️ untuk Desa Digital Indonesia
</p>
