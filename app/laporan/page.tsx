"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Search, 
  MapPin, 
  Calendar, 
  Filter, 
  Mountain,
  ArrowLeft,
  ArrowRight,
  Activity,
  User,
  LogOut,
  ChevronLeft,
  Share2,
  X,
  PlusCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { ComplaintDetail } from "@/components/complaint-detail";

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

export default function LaporanPublikPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        setUser({ ...user, profile });
      }
    };

    const fetchAllReports = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) {
          setReports(data);
          setFilteredReports(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    checkUser();
    fetchAllReports();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let result = reports;
    if (searchQuery) {
      result = result.filter(r => 
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedStatus !== "Semua") {
      result = result.filter(r => r.status?.toLowerCase() === selectedStatus.toLowerCase());
    }
    setFilteredReports(result);
  }, [searchQuery, selectedStatus, reports]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
    router.push("/");
  };

  const handleShare = async () => {
    if (!selectedReport) return;
    
    const shareData = {
        title: `Laporan: ${selectedReport.title}`,
        text: `Detail Laporon SICEPU:\nJudul: ${selectedReport.title}\nLokasi: ${selectedReport.location}\nStatus: ${selectedReport.status}\nDeskripsi: ${selectedReport.description}`,
        url: window.location.origin + `/laporan?id=${selectedReport.id}`
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error("Error sharing:", err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\nLink: ${shareData.url}`);
            alert("Detail laporan telah disalin ke clipboard!");
        } catch (err) {
            console.error("Error copying:", err);
        }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <header className={cn(
        "sticky top-0 z-[100] w-full transition-all duration-300 px-4 py-4 md:px-10 lg:px-20",
        isScrolled ? "glass py-3 shadow-premium border-b border-border/50" : "bg-background border-b border-border"
      )}>
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
            <Link href="/laporan" className="px-4 py-2 text-sm font-bold text-primary bg-primary/5 rounded-full transition-all">Laporan</Link>
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
                  <span className="text-xs font-bold capitalize">{user.profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
                </motion.button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-48 origin-top-right rounded-lg border border-border bg-card p-2 shadow-premium backdrop-blur-xl">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
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
        <AnimatePresence mode="wait">
          {!selectedReport ? (
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <section className="bg-muted/30 py-20 border-b border-border">
                <div className="container max-w-7xl mx-auto px-4 text-center">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4 inline-block">Masyarakat Terbuka</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Eksplorasi Aduan Publik</h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                      Wadah keterbukaan informasi atas seluruh aduan masyarakat SICEPU.
                    </p>
                  </motion.div>
                </div>
              </section>

              <section className="container max-w-7xl mx-auto px-4 py-16">
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between sticky top-24 z-30 py-4 bg-background/80 backdrop-blur-md px-2 -mx-2 rounded-lg border border-transparent focus-within:border-border transition-all">
                  <div className="relative flex-1 max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <input
                      id="search-reports"
                      name="search-reports"
                      type="text"
                      placeholder="Cari kata kunci, lokasi, atau judul..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {["Semua", "Baru", "Diproses", "Selesai"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "px-6 py-2.5 rounded-lg text-xs font-bold transition-all border uppercase tracking-widest",
                          selectedStatus === status
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                            : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="grid gap-10 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[16/10] rounded-[2rem] bg-muted animate-pulse" />)}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-border">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Activity size={40} />
                    </div>
                    <h3 className="text-2xl font-bold">Tidak ada laporan ditemukan</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm mx-auto">Coba gunakan kata kunci berbeda atau hapus semua filter status.</p>
                    <button onClick={() => { setSearchQuery(""); setSelectedStatus("Semua"); }} className="mt-8 font-bold text-primary hover:underline flex items-center gap-2">
                      Reset Filter <PlusCircle className="rotate-45" size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-10 md:grid-cols-2">
                    {filteredReports.map((report) => {
                      const img = report.image ? (report.image.startsWith('[') ? JSON.parse(report.image)[0] : report.image) : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop";
                      return (
                        <motion.article 
                          key={report.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => { setSelectedReport(report); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                          className="group cursor-pointer bg-card border border-border rounded-lg overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.2)] hover:border-primary/40 transition-all duration-300"
                        >
                          <div className="aspect-[16/10] overflow-hidden">
                            <img src={img} alt={report.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-10">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                              <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                report.status?.toLowerCase() === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                report.status?.toLowerCase() === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                              )}>
                                {report.status || "Baru"}
                              </span>
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Calendar size={14} className="text-primary" />
                                {new Date(report.date || report.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{report.title}</h3>
                            <p className="mt-4 text-muted-foreground line-clamp-2 leading-relaxed">{report.description}</p>
                            <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-bold text-foreground opacity-80">
                                <MapPin size={16} className="text-primary" />
                                {report.location}
                              </div>
                              <ArrowRight size={20} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-4xl px-4 py-20">
              <button
                onClick={() => { setSelectedReport(null); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                className="group mb-12 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Kembali ke Daftar
              </button>

              <ComplaintDetail 
                report={selectedReport} 
                onClose={() => { setSelectedReport(null); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
                onShare={handleShare}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
