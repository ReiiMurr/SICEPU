"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mountain,
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

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
            router.push("/");
          }
        }
      } catch (e) {
        console.error("Auth check error:", e);
      }
    }
    checkExistingAuth();
  }, [router]);

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
      setLoading(false);
      setError(signInError.message);
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
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background font-display selection:bg-primary/20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-[440px]">
          <PageTransition>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Logo & Header */}
              <div className="mb-10 flex flex-col items-center">
                <Link href="/" className="group mb-6 flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary text-white shadow-2xl shadow-primary/30 transition-transform group-hover:scale-110">
                    <Mountain size={32} />
                  </div>
                  <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter">Selamat Datang</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-1.5 opacity-60">Portal SICEPU</p>
                  </div>
                </Link>
              </div>

              <Card className="overflow-hidden border-border/40 bg-card/40 shadow-2xl backdrop-blur-3xl rounded-[2.5rem]">
                <CardContent className="p-8 md:p-10">
                  <form className="space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-5">
                      {/* Email Field */}
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alamat Email</Label>
                        <div className="relative group">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="nama@email.com"
                            className="h-12 border-transparent bg-muted/30 pl-11 pr-4 font-semibold placeholder:text-muted-foreground/30 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between ml-1">
                          <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kata Sandi</Label>
                          <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">Lupa Sandi?</Link>
                        </div>
                        <div className="relative group">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 border-transparent bg-muted/30 pl-11 pr-12 font-semibold placeholder:text-muted-foreground/30 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-all"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center gap-3 px-1">
                        <button
                          type="button"
                          onClick={() => setRememberMe(!rememberMe)}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                            rememberMe
                              ? "bg-primary border-primary shadow-lg shadow-primary/20"
                              : "bg-muted border-border/50 hover:border-primary/30"
                          )}
                        >
                          {rememberMe && <Check size={12} strokeWidth={4} className="text-white" />}
                        </button>
                        <Label
                          onClick={() => setRememberMe(!rememberMe)}
                          className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors selection:none"
                        >
                          Ingat Saya
                        </Label>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-bold text-rose-600">
                            <AlertCircle size={16} />
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      className="h-12 w-full rounded-2xl bg-primary font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : (
                        "Masuk Sekarang"
                      )}
                    </Button>

                    <div className="relative pt-4">
                      <div className="absolute inset-x-0 top-1/2 flex h-[1px] -translate-y-1/2 bg-border/40" />
                      <div className="relative flex justify-center">
                        <span className="bg-card px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Atau</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground">
                        Belum memiliki akun?{" "}
                        <Link className="font-black text-primary hover:opacity-80 transition-all decoration-2 underline-offset-4 hover:underline" href="/register">
                          Daftar Akun Baru
                        </Link>
                      </p>
                    </div>
                  </form>
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
