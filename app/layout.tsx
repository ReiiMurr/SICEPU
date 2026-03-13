import type { Metadata } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNavigation } from "@/components/bottom-navigation";


const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laporin",
  description: "Website laporan pengaduan masyarakat",
  icons: {
    icon: "/images/logolaporin.png",
    apple: "/images/logolaporin.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${lexend.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <head />

      <body
        className="transition-colors duration-200 min-h-dvh antialiased"
      >
        <div className="pb-24 md:pb-0">
          {children}
        </div>
        <BottomNavigation />

      </body>
    </html>
  );
}
