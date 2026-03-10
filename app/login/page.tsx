"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Load remembered email
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    async function checkExistingAuth() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          const isAdmin = profile?.role === "admin" || profile?.role === "petugas" || user.email === "laporin.service@gmail.com";
          if (isAdmin) {
            router.push("/admin");
          } else {
            router.push(redirectPath);
          }
        }
      } catch (e) {
        console.error("Auth check error:", e);
      }
    }
    checkExistingAuth();
  }, [router, redirectPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Save/Clear remembered email
    if (rememberMe) {
      localStorage.setItem("remembered_email", email);
    } else {
      localStorage.removeItem("remembered_email");
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Supabase is not configured.");
      return;
    }

    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Check if this email is actually pending OTP verification
      try {
        const { data: otpData } = await supabase
          .from("user_otps")
          .select("email")
          .eq("email", email)
          .maybeSingle();

        if (otpData) {
          setError(null);
          setUnverifiedEmail(email);
          // Simpan password sementara agar bisa dipakai saat SignUp di halaman OTP
          sessionStorage.setItem("pending_signup_password", password);
        } else {
          setError(signInError.message);
        }
      } catch (err) {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdminEmail = user.email === "laporin.service@gmail.com";
      const role = profile?.role;

      if (role === "admin" || role === "petugas" || isAdminEmail) {
        // Also sync email on login to ensure it exists for notifications
        await supabase.from("profiles").upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
        router.push("/admin");
      } else {
        await supabase.from("profiles").upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
        router.push(redirectPath);
      }
    } else {
      router.push(redirectPath);
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-display flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <PageTransition>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-6xl min-h-[700px] bg-white dark:bg-zinc-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Form Section */}
          <div className="flex flex-col p-8 md:p-14 lg:p-20">
            <div className="mb-auto">
              <Link href="/" className="inline-flex items-center gap-2 group mb-12">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                   <img src="/images/logolaporin.png" alt="SiLapor" className="h-8 w-8 object-contain" />
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-foreground">SiLapor</span>
              </Link>

              <div className="space-y-3 mb-12">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Selamat Datang</h1>
                <p className="text-muted-foreground font-medium text-lg">Masuk untuk mengelola laporan Anda.</p>
              </div>

              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</Label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="nama@email.com"
                        className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-11 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Kata Sandi</Label>
                      <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-500">Lupa sandi?</Link>
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 pl-11 pr-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-semibold"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <button
                      id="rememberMe"
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                        rememberMe ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-zinc-300 dark:border-zinc-700"
                      )}
                    >
                      {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                    </button>
                    <Label htmlFor="rememberMe" onClick={() => setRememberMe(!rememberMe)} className="text-sm font-semibold text-muted-foreground cursor-pointer">Ingat saya</Label>
                  </div>
                </div>

                <AnimatePresence>
                   {error && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                       <AlertCircle size={18} /> {error}
                     </motion.div>
                   )}
                </AnimatePresence>

                <Button className="h-14 w-full rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all" type="submit" disabled={loading}>
                  {loading ? "..." : "Masuk"}
                </Button>
              </form>
            </div>

            <div className="mt-12 text-center border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <p className="text-sm font-bold text-muted-foreground">
                Belum punya akun? <Link href="/register" className="text-emerald-500 hover:underline">Daftar sekarang</Link>
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden lg:block relative p-8">
            <div className="h-full w-full rounded-[2.5rem] overflow-hidden relative shadow-2xl">
              <img src="/images/village_login.png" alt="Desa Modern" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-brightness-75" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                <div className="h-1 w-16 bg-emerald-400 mb-8 rounded-full" />
                <h3 className="text-4xl font-black leading-tight mb-4">Transparansi Desa <br />di Genggaman Anda</h3>
                <p className="text-emerald-50/80 text-lg max-w-sm leading-relaxed">
                  Platform digital iLapor hadir untuk memudahkan interaksi antara warga dan pemerintah desa secara profesional.
                </p>
              </div>

              {/* Floating Dashboard Elements (Simulation) */}
              <motion.div 
                 initial={{ x: 30, opacity: 0 }} 
                 animate={{ x: 0, opacity: 1 }} 
                 transition={{ delay: 0.5 }}
                 className="absolute top-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Live Status</span>
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-white/20 rounded-full" />
                  <div className="h-1.5 w-[70%] bg-white/20 rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </PageTransition>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
