"use client";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
    Mountain,
    Target,
    Users,
    Shield,
    Zap,
    CheckCircle,
    Search,
    User,
    LogOut,
    MapPin,
    Mail,
    Phone
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
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
                setUser(user);
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
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 px-4 py-4 md:px-10 lg:px-20",
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
                                    <span className="text-xs font-bold capitalize">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
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

                {/* Vision & Mission */}
                <section className="section-padding">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-12"
                            >
                                <div className="space-y-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <Target size={28} />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Visi Kami</h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        Menjadi jembatan digital terdepan dalam mewujudkan tata kelola desa yang cerdas, inklusif, dan sepenuhnya transparan bagi seluruh lapisan masyarakat.
                                    </p>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                        <Shield size={28} />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Misi Kami</h2>
                                    <ul className="space-y-4">
                                        {[
                                            "Menyederhanakan proses penyampaian aspirasi masyarakat.",
                                            "Menjamin keamanan dan kerahasiaan identitas setiap pelapor.",
                                            "Mempercepat waktu penanganan masalah di lapangan.",
                                            "Mewujudkan tata kelola desa yang transparan, profesional, dan responsif melalui platform SICEPU."
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4 items-start text-muted-foreground group">
                                                <div className="mt-1 h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <CheckCircle size={16} className="text-emerald-500" />
                                                </div>
                                                <span className="text-base group-hover:text-foreground transition-colors">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative aspect-square rounded-[3rem] overflow-hidden border border-border shadow-premium group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
                                    alt="Vision"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="section-padding bg-muted/30">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="mb-20 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Nilai-Nilai Utama</h2>
                            <p className="mt-4 text-muted-foreground text-lg">Prinsip dasar yang kami pegang teguh dalam melayani.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <Shield size={24} />, title: "Integritas", desc: "Kejujuran mutlak dalam setiap pengelolaan data publik." },
                                { icon: <Zap size={24} />, title: "Kecepatan", desc: "Respon tanggap darurat untuk setiap laporan mendesak." },
                                { icon: <Users size={24} />, title: "Inklusivitas", desc: "Layanan adil and merata bagi seluruh lapisan warga." },
                                { icon: <CheckCircle size={24} />, title: "Akuntabilitas", desc: "Setiap progres pekerjaan dapat diawasi bersama." }
                            ].map((value, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-10 rounded-[2.5rem] bg-card border border-border hover-card group text-center flex flex-col items-center"
                                >
                                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Official Message */}
                <section className="section-padding">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="bg-slate-900 dark:bg-black rounded-[4rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                            
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-white/5 shadow-2xl shrink-0 group">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuABoTd3dvDtgZSn8o5c-cG2xzj0pjqASlNzZTI-eqJyaKNIYbcvRxidE340NI2QxLh3tX8mOmm6iKJ6bCd_4QdIIO9kiYMhaVPVCzDLUgFE1dn7ETkoyR2nL7jiuzZNsIwVOB1GYvcOHLb0c0WHyFzvncUU_ZToMioPMq-2l6Kleh5u5nGXKrSlxCnqmuWaNNFAI1mV3Qteez25MUpPaeYDt2QDT5Utc4LJzCZu_FHfur8R3Z0SLQ-BI33dkV3wz8Mw_Sx7aru-iXE" alt="Kepala Desa" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="space-y-8 text-center md:text-left relative z-10">
                                <div className="h-1 w-16 bg-primary mx-auto md:mx-0" />
                                <blockquote className="text-2xl md:text-3xl font-medium italic text-slate-100 leading-snug">
                                    "Platform SICEPU adalah langkah nyata kami untuk mendengar suara rakyat lebih dekat. Tidak ada kemajuan tanpa kolaborasi transparan antara warga dan pemerintah."
                                </blockquote>
                                <div>
                                    <h4 className="text-xl font-bold text-white tracking-tight">Sudirjo, S.Sos</h4>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">Kepala SICEPU</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="section-padding">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-20 group">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Pusat Informasi</h2>
                            <p className="mt-4 text-muted-foreground text-lg">Kunjungi kantor pelayanan kami untuk konsultasi tatap muka.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: <MapPin size={28} />, title: "Alamat Kantor", val: "Jl. Melati No. 45, SICEPU", sub: "Gedung Pelayanan Publik, Lantai 1" },
                                { icon: <Mail size={28} />, title: "Email Resmi", val: "kontak@sicepu.go.id", sub: "Respon harian 1x24 jam kerja" },
                                { icon: <Phone size={28} />, title: "Layanan Darurat", val: "+62 821 1234 5678", sub: "Senin - Jumat, 08:00 - 16:00" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center p-12 rounded-[2.5rem] bg-muted/30 border border-transparent hover:border-border transition-all text-center group">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-xl mb-4">{item.title}</h3>
                                    <p className="font-bold text-foreground mb-1 leading-snug">{item.val}</p>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
