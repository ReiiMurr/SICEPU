"use client";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
    Mountain,
    User,
    LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { MapSection } from "@/components/map-section";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function TentangPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const checkUser = async () => {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
                    setUser({ ...user, profile });
                }
            } catch (error) {
                console.error("Error checking auth:", error);
            }
        };

        window.addEventListener("scroll", handleScroll);
        checkUser();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const supabase = getSupabaseClient();
            await supabase.auth.signOut();
            setUser(null);
            setIsProfileOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
            {/* Header */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 px-4 py-4 md:px-10 lg:px-20",
                isScrolled ? "glass py-3 shadow-premium border-b border-border/50" : "bg-background border-b border-border"
            )}>
                <motion.div
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary origin-left z-[60]"
                    style={{ scaleX }}
                />
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Mountain size={18} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">SICEPU</h1>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Home</Link>
                        <Link href="/tentang" className="px-4 py-2 text-sm font-bold text-primary bg-primary/5 rounded-full transition-all">Tentang</Link>
                        <Link href="/laporan" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Laporan</Link>
                        <Link href="/aduan" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Laporanku</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-border mx-2" />
                        
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <motion.button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 rounded-full border border-border bg-card/50 p-1 pr-4 shadow-sm hover:border-primary/30 transition-all"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-inner">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold capitalize">
                                            {user.profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                                        </span>
                                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                                            Pengguna
                                        </span>
                                    </div>
                                </motion.button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-premium backdrop-blur-xl">
                                            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                                                <LogOut size={18} /> Keluar
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Login</Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-40 pb-24 overflow-hidden bg-muted/30">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container relative z-10 mx-auto px-4 max-w-7xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                                Mengenal Lebih Dekat
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-8">
                                Membangun Desa Melalui <br />
                                <span className="text-primary italic">Transparansi Digital</span>
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                SICEPU adalah platform resmi aspirasi dan pengaduan online yang dirancang khusus untuk mempercepat respon pemerintah desa terhadap kebutuhan warga.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <div className="py-24">
                   <MapSection />
                </div>
            </main>

            <Footer />
        </div>
    );
}
