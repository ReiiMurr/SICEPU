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
    <div className="relative min-h-dvh w-full overflow-hidden bg-background font-display selection:bg-primary/20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-[480px]">
          <PageTransition>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="mb-8 flex flex-col items-center">
                <Link href="/" className="group mb-4 flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary text-white shadow-xl shadow-primary/20 transition-transform group-hover:rotate-6">
                    <UserPlus size={24} />
                  </div>
                </Link>
                <h1 className="text-3xl font-bold tracking-tighter text-foreground">Buat Akun Baru</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2 opacity-60 text-center">Pendaftaran Masyarakat SICEPU</p>
              </div>

              <Card className="overflow-hidden border-border/40 bg-card/40 shadow-2xl backdrop-blur-3xl rounded-[2.5rem]">
                <CardContent className="p-8 md:p-10">
                  <AnimatePresence mode="wait">
                    {step === "email" ? (
                      <motion.form
                        key="email-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                        onSubmit={onSendOtp}
                      >
                        <div className="space-y-4">
                          <div className="space-y-2.5">
                            <Label htmlFor="fullName" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap Sesuai KTP</Label>
                            <div className="relative group">
                              <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="fullName"
                                name="fullName"
                                autoComplete="name"
                                placeholder="Masukkan nama lengkap kamu"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-12 border-transparent bg-muted/30 pl-11 pr-4 font-semibold placeholder:text-muted-foreground/30 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all text-foreground"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="email" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alamat Email Aktif</Label>
                            <div className="relative group">
                              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="h-12 border-transparent bg-muted/30 pl-11 pr-4 font-semibold placeholder:text-muted-foreground/30 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all text-foreground"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <Label htmlFor="password" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kata Sandi Baru</Label>
                            <div className="relative group">
                              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Minimal 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                className="h-12 border-transparent bg-muted/30 pl-11 pr-4 font-semibold placeholder:text-muted-foreground/30 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all text-foreground"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {error && (
                          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                            <AlertCircle size={16} />
                            {error}
                          </div>
                        )}

                        <Button className="h-12 w-full rounded-2xl bg-primary font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50" type="submit" disabled={loading}>
                          {loading ? "Mengirim Kode OTP..." : "Daftar Sekarang"}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="otp-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                        onSubmit={onVerifyOtp}
                      >
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                            <MailCheck size={14} />
                            OTP Terkirim
                          </div>
                          <p className="text-xs font-bold text-muted-foreground">Silakan periksa inbox email <span className="text-foreground">{email}</span></p>
                        </div>

                        <div className="space-y-4">
                           <Label htmlFor="otp" className="text-center block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Masukkan 6 Digit Kode OTP</Label>
                          <Input
                            id="otp"
                            name="otp"
                            autoComplete="one-time-code"
                            placeholder="0 0 0 0 0 0"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-center text-3xl font-bold tracking-[0.8rem] bg-muted/30 border-transparent focus:border-primary/50 h-20 rounded-3xl transition-all outline-none text-foreground"
                            maxLength={6}
                            required
                          />
                        </div>

                        {error && (
                          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                            <AlertCircle size={16} />
                            {error}
                          </div>
                        )}

                        {message && (
                          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            <CheckCircle size={16} />
                            {message}
                          </div>
                        )}

                        <div className="space-y-4">
                          <Button className="h-14 w-full rounded-2xl bg-primary font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all outline-none" type="submit" disabled={loading}>
                            {loading ? "Memverifikasi..." : "Aktivasi Akun"}
                          </Button>
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                          >
                            <PencilLine size={14} />
                            Ganti Email
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-10 py-6 border-t border-border/40 text-center">
                    <p className="text-xs font-bold text-muted-foreground">
                      Sudah menjadi bagian dari kami?{" "}
                      <Link className="font-black text-primary hover:opacity-80 transition-all decoration-2 underline-offset-4 hover:underline" href="/login">
                        Masuk Sekarang
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 flex justify-center">
                <Link
                  className="flex items-center gap-2.5 rounded-2xl border border-border/50 bg-card/20 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-card/50 hover:text-foreground hover:shadow-lg"
                  href="/"
                >
                  <ArrowLeft size={16} />
                  Beranda
                </Link>
              </div>
            </motion.div>
          </PageTransition>
        </div>
      </div>
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
