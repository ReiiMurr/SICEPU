# 🏔️ SICEPU - Sistem Informasi Cepat Pengaduan Umum

> **Transforming Village Governance through Professional Digital Transparency.**

SICEPU is a premium, high-performance citizen complaint and aspiration platform designed specifically for modern Indonesian village governance. It bridges the gap between citizens and village officials with a sleek, intuitive, and real-time interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

---

## ✨ Key Features

### 🏛️ For Citizens (Masyarakat)
- **Seamless Reporting**: Easy-to-use form with multi-file attachment support (Images, Videos, Documents).
- **Public & Private Reports**: Choose your privacy level for every report.
- **Real-time Tracking**: Monitor the status of your reports from "Baru" to "Selesai".
- **Village Map**: Visual geographic distribution of reports.

### 🛡️ For Admin (Perangkat Desa)
- **Mature Dashboard**: A professional, distraction-free interface built for efficiency.
- **Report Management**: Verify, process, and archive citizen aspirations in one place.
- **Real-time Notifications**: Get instantly notified when a new report is submitted.
- **User Management**: Monitor and manage registered citizen accounts.
- **System Logs**: Track system performance and operational history.

---

## 🚀 Tech Stack

- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Hooks**: React Hooks & Context API

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ReiiMurr/SICEPU.git
cd SICEPU
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application in action.

---

## 🎨 Design Philosophy
SICEPU is built with a **Mature & Professional** aesthetic. We avoid flashy "AI-slop" gradients and oversized elements, focusing instead on:
- **High Information Density**: Built for productive administrative work.
- **Clean Typography**: Using Lexend for maximum readability.
- **Responsiveness**: Fully optimized for both desktop and mobile users.
- **Subtle Micro-animations**: Enhancing user experience without distraction.

---

## 📊 Project Structure
```text
├── app/              # Next.js App Router (Pages & API)
├── components/       # Reusable UI Components
├── lib/              # Utility functions and Supabase Client
├── public/           # Static assets and .htaccess
└── supabase/         # SQL migrations and schema notes
```

---

## 📄 License
This project is for educational and administrative purposes in village governance.

---
Built with ❤️ by [ReiiMurr](https://github.com/ReiiMurr)
