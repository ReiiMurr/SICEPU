"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  Mail,
  Lock,
  AlertCircle,
  MailCheck,
  CheckCircle,
  PencilLine,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    if (!init) {
      const stepParam = searchParams.get("step");
      const emailParam = searchParams.get("email");
      if (stepParam === "otp" && emailParam) {
        setEmail(emailParam);
        setStep("otp");
        
        // Coba ambil password yang disimpan saat login tadi
        const savedPwd = sessionStorage.getItem("pending_signup_password");
        if (savedPwd) {
          setPassword(savedPwd);
          // sessionStorage.removeItem("pending_signup_password"); // Kita tahan dulu sampai berhasil verif
        }
        
        // Ambil nama jika ada
        const savedName = sessionStorage.getItem("pending_signup_name");
        if (savedName) setFullName(savedName);
      }
      setInit(true);
    }
  }, [searchParams, init]);

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim OTP");
      }

      setMessage(data.message);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim OTP");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verifikasi gagal");
      }

      setMessage(data.message);
      
      // Bersihkan session storage setelah berhasil
      sessionStorage.removeItem("pending_signup_password");
      sessionStorage.removeItem("pending_signup_name");

      setTimeout(() => {
        router.push(`/login${redirectPath !== "/" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat verifikasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-display flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <PageTransition>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-6xl min-h-[700px] bg-white dark:bg-zinc-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Image Section (Left) */}
          <div className="hidden lg:block relative p-8">
            <div className="h-full w-full rounded-[2.5rem] overflow-hidden relative shadow-2xl">
              <img src="/images/village_register.png" alt="Masyarakat Desa" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-brightness-75" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                <div className="h-1 w-16 bg-emerald-400 mb-8 rounded-full" />
                <h3 className="text-4xl font-black leading-tight mb-4">Satu Suara <br />Membangun Bangsa</h3>
                <p className="text-emerald-50/80 text-lg max-w-sm leading-relaxed">
                  Jadilah bagian dari transparansi digital desa untuk pelayanan publik yang lebih efisien dan akuntabel.
                </p>
              </div>

              {/* Floating Dashboard Elements */}
              <motion.div 
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 transition={{ delay: 0.5 }}
                 className="absolute top-10 left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                   <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Verified Access</p>
                   <p className="text-xs font-bold text-white">100% Data Aman</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Form Section (Right) */}
          <div className="flex flex-col p-8 md:p-14 lg:p-20">
            <div className="mb-auto">
              <Link href="/" className="inline-flex items-center gap-2 group mb-12">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                   <img src="/images/logolaporin.png" alt="SiLapor" className="h-8 w-8 object-contain" />
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-foreground">SiLapor</span>
              </Link>

              <div className="space-y-3 mb-10">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                   {step === "email" ? "Daftar Akun" : "Verifikasi OTP"}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                   {step === "email" ? "Silakan isi data diri Anda di bawah ini." : "Masukkan kode yang dikirim ke email Anda."}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.form key="email-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5" onSubmit={onSendOtp}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Nama Lengkap</Label>
                        <div className="relative">
                          <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                          <Input id="fullName" name="fullName" autoComplete="name" placeholder="Sesuai KTP" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-11 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-semibold" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</Label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                          <Input id="email" name="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-11 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-semibold" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Kata Sandi</Label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                          <Input id="password" name="password" autoComplete="new-password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-11 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-semibold" required />
                        </div>
                      </div>
                    </div>
                    {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3"><AlertCircle size={18} /> {error}</div>}
                    <Button className="h-14 w-full rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all" type="submit" disabled={loading}>{loading ? "..." : "Lanjutkan"}</Button>
                  </motion.form>
                ) : (
                  <motion.form key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8" onSubmit={onVerifyOtp}>
                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10 text-center">
                       <p className="text-sm font-semibold text-muted-foreground leading-relaxed">Kode verifikasi telah dikirim ke:<br/><span className="text-foreground font-black">{email}</span></p>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="otp" className="text-center block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Kode OTP</Label>
                      <Input id="otp" name="otp" autoComplete="one-time-code" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} className="h-20 text-center text-4xl font-black tracking-[1.5rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl focus:border-emerald-500/50 transition-all outline-none" maxLength={6} required />
                    </div>
                    <div className="space-y-4">
                      <Button className="h-14 w-full rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all" type="submit" disabled={loading}>{loading ? "..." : "Aktivasi Akun"}</Button>
                      <button type="button" onClick={() => setStep("email")} className="w-full text-sm font-bold text-muted-foreground hover:text-emerald-500 flex items-center justify-center gap-2"><PencilLine size={16} /> Ganti Email</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-12 text-center border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <p className="text-sm font-bold text-muted-foreground">Sudah punya akun? <Link href="/login" className="text-emerald-500 hover:underline">Masuk sekarang</Link></p>
            </div>
          </div>
        </motion.div>
      </PageTransition>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </React.Suspense>
  );
}
