"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Search,
  Mountain,
  User,
  LogOut,
  History,
  Activity,
  ChevronRight,
  Filter,
  ArrowLeft,
  Share2,
  ChevronLeft
} from "lucide-react";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ReportImageGallery({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <div className="relative h-full w-full group/gallery overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          src={images[currentIndex]}
          alt={title}
          className="h-full w-full object-cover transition-all duration-500"
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-0 group-hover/gallery:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover/gallery:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 rounded-full bg-black/10 backdrop-blur-md border border-white/10">
            {images.map((_: any, idx: number) => (
              <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", idx === currentIndex ? "bg-white w-4" : "bg-white/40 w-1.5")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LaporankuPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    router.push("/login");
                    return;
                }
                
                setUser(user);

                const { data, error } = await supabase
                    .from("complaints")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setComplaints(data || []);
            } catch (error) {
                console.error("Error fetching complaints:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [router]);

    const handleLogout = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const getStatusConfig = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'selesai') return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircle size={14} /> };
        if (s === 'diproses') return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <Clock size={14} /> };
        if (s === 'ditolak') return { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: <AlertCircle size={14} /> };
        return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: <Activity size={14} /> };
    };

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 py-4 md:px-10 lg:px-20">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Mountain size={18} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">SICEPU</h1>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Home</Link>
                        <Link href="/tentang" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Tentang</Link>
                        <Link href="/laporan" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">Laporan</Link>
                        <Link href="/aduan" className="px-4 py-2 text-sm font-bold text-primary bg-primary/5 rounded-full transition-all">Laporanku</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-border mx-2" />
                        
                        {user && (
                            <div className="relative" ref={dropdownRef}>
                                <motion.button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 rounded-full border border-border bg-card p-1 pr-4 shadow-sm hover:border-primary/30 transition-all"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-inner">
                                        <User size={16} />
                                    </div>
                                    <span className="text-xs font-bold capitalize">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                                </motion.button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-48 origin-top-right rounded-lg border border-border bg-card p-2 shadow-premium backdrop-blur-xl">
                                            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                                                <LogOut size={18} /> Keluar Akun
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 container max-w-7xl mx-auto px-4 py-20">
              <AnimatePresence mode="wait">
                {!selectedReport ? (
                  <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">
                                <History size={16} /> Riwayat Pengaduan
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Daftar Aduanku</h2>
                            <p className="mt-4 text-muted-foreground text-lg max-w-xl">
                                Pantau status dan tindak lanjut dari laporan yang telah Anda sampaikan.
                            </p>
                        </motion.div>
                        
                        <Link 
                            href="/aduan/buat" 
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-premium shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-center justify-center"
                        >
                            <PlusCircle size={20} />
                            Buat Aduan Baru
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 w-full rounded-lg bg-muted animate-pulse border border-border" />)}
                        </div>
                    ) : complaints.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-border rounded-lg bg-muted/20"
                        >
                            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/30 mb-8 border border-primary/10">
                                <Activity size={48} />
                            </div>
                            <h3 className="text-2xl font-bold">Belum ada aduan</h3>
                            <p className="mt-2 text-muted-foreground text-center px-4">Anda belum pernah mengirimkan laporan pengaduan apapun.</p>
                            <Link href="/aduan/buat" className="mt-10 font-bold text-primary flex items-center gap-2 hover:underline">
                                Mulai melapor sekarang <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {complaints.map((complaint, idx) => {
                                const config = getStatusConfig(complaint.status);
                                return (
                                    <motion.div
                                        key={complaint.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => { setSelectedReport(complaint); window.scrollTo(0, 0); }}
                                        className="group relative flex flex-col md:flex-row items-start md:items-center gap-8 rounded-lg border border-border bg-card p-8 cursor-pointer transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.2)] hover:border-primary/40 transition-all duration-300"
                                    >
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2", config.bg, config.color, config.border)}>
                                                    {config.icon}
                                                    {complaint.status || "Baru"}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Calendar size={14} />
                                                    {new Date(complaint.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{complaint.title}</h3>
                                            <p className="text-muted-foreground line-clamp-2 leading-relaxed">{complaint.description}</p>
                                            <div className="flex items-center gap-2 text-sm font-bold text-foreground/70">
                                                <MapPin size={16} className="text-primary" />
                                                {complaint.location}
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end gap-6 pt-6 md:pt-0 border-t md:border-t-0 border-border">
                                            <div className="text-right flex flex-col items-center md:items-end">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">ID LAPORAN</span>
                                                <span className="text-xs font-mono font-bold bg-muted px-2 py-1 rounded">#{complaint.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="h-14 w-14 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-5xl">
                    <button
                      onClick={() => { setSelectedReport(null); window.scrollTo(0, 0); }}
                      className="group mb-12 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      Kembali ke Daftar
                    </button>

                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-premium">
                      <div className="aspect-video w-full overflow-hidden">
                        {(() => {
                          const images = selectedReport.image ? (selectedReport.image.startsWith("[") ? JSON.parse(selectedReport.image) : [selectedReport.image]) : ["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"];
                          return <ReportImageGallery images={images} title={selectedReport.title} />;
                        })()}
                      </div>
                      <div className="p-10 md:p-20">
                        <div className="flex flex-wrap items-center gap-4 mb-10 pb-10 border-b border-border">
                          <span className={cn(
                            "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest border",
                            selectedReport.status?.toLowerCase() === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            selectedReport.status?.toLowerCase() === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                          )}>
                            Status: {selectedReport.status || "Baru"}
                          </span>
                          <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm bg-muted/50 px-6 py-2 rounded-lg">
                            <Calendar size={18} className="text-primary" />
                            {new Date(selectedReport.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-12">{selectedReport.title}</h1>
                        
                        <div className="space-y-12">
                           <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-muted-foreground border-l-8 border-primary pl-10">
                            {selectedReport.description}
                          </p>
                          
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-muted px-8 py-6 rounded-lg flex items-center gap-4">
                              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <MapPin size={24} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Lokasi Kejadian</p>
                                <p className="text-lg font-bold">{selectedReport.location}</p>
                              </div>
                            </div>
                            <div className="bg-muted px-8 py-6 rounded-lg flex items-center gap-4">
                              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Clock size={24} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Terakhir Diperbarui</p>
                                <p className="text-lg font-bold">Baru saja</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-10 bg-primary/5 rounded-lg border border-primary/10">
                            <h4 className="flex items-center gap-3 font-bold text-xl mb-4">
                              <Activity className="text-primary" size={24} />
                              Progres Penanganan
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Laporan Anda sedang dalam tahap peninjauan oleh tim admin SICEPU. Anda akan menerima notifikasi jika ada perubahan status atau kebutuhan informasi tambahan.
                            </p>
                          </div>
                        </div>

                        <div className="mt-20 pt-10 border-t border-border flex flex-wrap gap-6">
                          <button onClick={() => { setSelectedReport(null); window.scrollTo(0, 0); }} className="px-12 py-5 bg-primary text-white font-bold rounded-lg shadow-premium shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                            Selesai Membaca
                          </button>
                          <button className="px-12 py-5 bg-card border border-border font-bold rounded-lg flex items-center gap-2 hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                            <Share2 size={20} /> Bagikan Laporan
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
