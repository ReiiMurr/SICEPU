"use client";

import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  AnimatePresence,
  useAnimationFrame
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Github,
  HelpCircle,
  History,
  Info,
  Instagram,
  Layout,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Share2,
  ShieldCheck,
  TrendingUp,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { VillageOfficialCard } from "@/components/village-official-card";
import { ComplaintDetail } from "@/components/complaint-detail";
import { NotificationBell } from "@/components/notification-bell";
import CountUp from "@/components/count-up";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";


function ReportImageGallery({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative h-full w-full group/gallery overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          src={images[currentIndex]}
          alt={title}
          className="h-full w-full object-cover"
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-0 group-hover/gallery:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover/gallery:opacity-100 transition-all duration-300">
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

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stats, setStats] = useState({ total: 0, diproses: 0, selesai: 0, baru: 0 });
  const officialX = useMotionValue(0);
  const [isOfficialInteracting, setIsOfficialInteracting] = useState(false);
  const router = useRouter();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
   const [mounted, setMounted] = useState(false);
   const [currentBg, setCurrentBg] = useState(0);
   const heroImages = [
     "https://images.unsplash.com/photo-1559628233-eb1b1a45564b?q=80&w=2070&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
   ];

   useEffect(() => {
     setMounted(true);
     const timer = setInterval(() => {
       setCurrentBg((prev) => (prev + 1) % heroImages.length);
     }, 6000);
    return () => clearInterval(timer);
  }, []);

  useAnimationFrame((t, delta) => {
    if (!isOfficialInteracting && mounted) {
      const currentX = officialX.get();
      const moveBy = delta * 0.04;
      const totalWidth = officials.length * 332;
      
      let newX = currentX - moveBy;
      if (newX <= -totalWidth) {
        newX = 0;
      }
      officialX.set(newX);
    }
  });

   useEffect(() => {
     const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
        setUser({ ...user, profile });
        
        // Auto-redirect admin to dashboard
        if (profile?.role === 'admin') {
          router.push('/admin');
        }
      }
    };
    const fetchReports = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Fetch real-time stats
        const { count: totalCount } = await supabase.from("complaints").select("*", { count: 'exact', head: true });
        const { count: diprosesCount } = await supabase.from("complaints").select("*", { count: 'exact', head: true }).eq("status", "diproses");
        const { count: selesaiCount } = await supabase.from("complaints").select("*", { count: 'exact', head: true }).eq("status", "selesai");
        const { count: baruCount } = await supabase.from("complaints").select("*", { count: 'exact', head: true }).or("status.is.null,status.eq.baru");

        setStats({
          total: totalCount || 0,
          diproses: diprosesCount || 0,
          selesai: selesaiCount || 0,
          baru: baruCount || 0
        });

        const { data } = await supabase
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        setReports(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReports(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    checkUser();
    fetchReports();

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
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      router.push(`/laporan?search=${encodeURIComponent(searchQuery)}`);
    }, 800);
  };

  const handleCreateReport = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/aduan/buat");
    } else {
      router.push("/login?redirect=/aduan/buat");
    }
  };

  const handleShare = async () => {
    if (!selectedReport) return;
    
    const shareData = {
        title: `Laporan: ${selectedReport.title}`,
        text: `Detail Laporon SiLapor:\nJudul: ${selectedReport.title}\nLokasi: ${selectedReport.location}\nStatus: ${selectedReport.status}\nDeskripsi: ${selectedReport.description}`,
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
            console.error("Error copy:", err);
        }
    }
  };

  // Village Officials Data
  const officials = [
    { name: "Sudirjo, S.Sos", role: "Kepala Desa", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop" },
    { name: "Siti Aminah", role: "Sekretaris Desa", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" },
    { name: "Budi Santoso", role: "Bendahara Desa", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" },
    { name: "Dedi Kurniawan", role: "KAUR Pembangunan", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
    { name: "Lestari Putri", role: "KAUR Kesejahteraan", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
    { name: "Agus Pratama", role: "Kepala Dusun I", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop" },
    { name: "Heri Wijaya", role: "Kepala Dusun II", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
  ];

  const constraintsRef = useRef(null);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 px-4 py-4 md:px-10 lg:px-20",
          isScrolled 
            ? "glass py-3 shadow-premium border-b border-border/50" 
            : "bg-transparent"
        )}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-primary origin-left z-[60]"
          style={{ scaleX }}
        />
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent group-hover:scale-110 transition-transform duration-300">
              <img src="/images/logolaporin.png" alt="SiLapor Logo" className="h-full w-full object-contain" />
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight transition-colors duration-300",
              isScrolled ? "text-foreground" : "text-white"
            )}>
              SiLapor
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {[
              { label: "Home", href: "/" },
              { label: "Tentang", href: "/tentang" },
              { label: "Laporan", href: "/laporan" },
              { label: "Laporanku", href: "/aduan" },
              { label: "Contact", href: "/#contact" }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  isScrolled 
                    ? "text-muted-foreground hover:text-primary hover:bg-primary/5" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-border/20 mx-2" />
            
            {user && (
              <>
                <NotificationBell />
                <div className="h-6 w-px bg-border/20 mx-2" />
              </>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-full border p-1 pr-4 transition-all duration-300",
                    isScrolled 
                      ? "border-border bg-card/50 text-foreground" 
                      : "border-white/20 bg-white/10 text-white backdrop-blur-md"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-inner">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold capitalize">
                      {user.profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </div>
                </motion.button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-52 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-premium backdrop-blur-xl"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut size={18} />
                        Keluar Akun
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 transform active:scale-95",
                  isScrolled 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" 
                    : "bg-white text-primary hover:bg-white/90"
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!selectedReport ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-20">
                <div className="absolute inset-0">
                  <AnimatePresence>
                    <motion.img
                      key={currentBg}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ 
                        opacity: { duration: 1.5 },
                        scale: { duration: 10 }
                      }}
                      src={heroImages[currentBg]}
                      className="absolute inset-0 h-full w-full object-cover brightness-[0.4]"
                      alt={`Hero Background ${currentBg + 1}`}
                    />
                  </AnimatePresence>
                   <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
                   
                    {/* Decorative floating elements */}
                    {mounted && [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-primary/40 blur-sm"
                        initial={{ 
                          x: Math.random() * 100 + "%", 
                          y: Math.random() * 100 + "%",
                          opacity: 0.1
                        }}
                        animate={{ 
                          y: ["-20px", "20px"],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ 
                          duration: Math.random() * 3 + 4, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                      />
                    ))}
                 </div>

                <div className="relative z-10 w-full max-w-5xl text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                      Portal Resmi Desa Digital
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl">
                      Layanan Aspirasi & <br />
                      <span className="text-[#10b981] italic font-medium">Pengaduan Rakyat</span>
                    </h1>
                    <p className="mt-8 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                      Wadah aspirasi masyarakat SiLapor yang transparan, profesional, dan responsif terhadap seluruh laporan Anda.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mx-auto max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl"
                  >
                    <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-lg p-1.5 focus-within:ring-4 focus-within:ring-primary/20 transition-all duration-300">
                      <div className="pl-4 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground mr-3" size={20} />
                      </div>
                      <input
                        id="search-complaint"
                        name="search-complaint"
                        type="text"
                        placeholder="Contoh: 'Jalan rusak di Dusun II'..."
                        className="w-full py-3 bg-transparent border-none focus:ring-0 text-foreground font-medium placeholder:text-muted-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-primary text-white rounded-lg px-6 py-3 font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                      >
                        {isSearching ? <Clock className="animate-spin" size={18} /> : <Search size={18} />}
                        Lacak Aduan
                      </button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                  >
                    <button 
                      onClick={handleCreateReport}
                      className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl overflow-hidden shadow-premium hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Buat Laporan Baru <PlusCircle size={20} />
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                    <Link href="/laporan" className="flex items-center gap-2 text-white font-bold group hover:text-primary transition-colors">
                      Lihat Laporan Publik <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </section>

              <section className="section-padding container max-w-6xl mx-auto px-6 lg:px-8">
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   className="mb-20 text-center"
                 >
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Statistik Transparansi</h2>
                   <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                     Data real-time penanganan aduan masyarakat tahun berjalan.
                   </p>
                 </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: "Total Laporan", val: stats.total, icon: <FileText className="text-blue-500" />, bg: "bg-blue-50" },
                    { label: "Dalam Proses", val: stats.diproses, icon: <Clock className="text-amber-500" />, bg: "bg-amber-50" },
                    { label: "Selesai", val: stats.selesai, icon: <CheckCircle className="text-emerald-500" />, bg: "bg-emerald-50" },
                    { label: "Aspirasi Baru", val: stats.baru, icon: <PlusCircle className="text-emerald-500" />, bg: "bg-emerald-50/50" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1, duration: 0.5 }}
                       whileHover={{ y: -10, scale: 1.02 }}
                       className="bg-card border border-border rounded-lg p-8 transition-all hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.2)] group"
                     >
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-colors", stat.bg)}>
                        {stat.icon}
                      </div>
                      <h4 className="text-4xl font-extrabold tracking-tight">
                         <CountUp 
                           from={0}
                           to={stat.val}
                           duration={2.5}
                           className="text-4xl font-extrabold tracking-tight"
                         />
                      </h4>
                      <p className="text-muted-foreground font-semibold mt-2 uppercase tracking-widest text-[10px] opacity-70">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="section-padding bg-muted/30">
                <div className="container max-w-6xl mx-auto px-6 lg:px-8">
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8 }}
                     className="mb-16"
                   >
                     <div className="max-w-xl">
                       <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center md:text-left">Laporan Terkini</h2>
                       <p className="mt-4 text-muted-foreground text-lg text-center md:text-left max-w-xl">
                         Pantau transparansi penanganan yang sedang kami kerjakan.
                       </p>
                     </div>
                   </motion.div>

                  {loadingReports ? (
                    <div className="grid gap-8 md:grid-cols-2">
                       {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[16/10] rounded-lg bg-muted animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="grid gap-10 md:grid-cols-2">
                      {reports.map((report) => {
                        const images = report.image ? (report.image.startsWith('[') ? JSON.parse(report.image) : [report.image]) : ["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"];
                        return (
                          <motion.article
                            key={report.id}
                             initial={{ opacity: 0, y: 30 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             transition={{ delay: (reports.indexOf(report) % 2) * 0.1, duration: 0.6 }}
                             whileHover={{ y: -8 }}
                             onClick={() => {
                               setSelectedReport(report);
                               window.scrollTo({ top: 0, behavior: 'instant' });
                             }}
                             className="group cursor-pointer bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-2xl hover:border-primary/40"
                           >
                             <div className="aspect-[16/10] overflow-hidden relative">
                               <img src={images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={report.title} />
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             </div>
                            <div className="p-8">
                              <div className="flex items-center gap-4 mb-4">
                                <span className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                  report.status?.toLowerCase() === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                  report.status?.toLowerCase() === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                )}>
                                  {report.status || "Baru"}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                  <Calendar size={14} />
                                  {new Date(report.date || report.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                              <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{report.title}</h3>
                              <p className="mt-4 text-muted-foreground line-clamp-2 leading-relaxed">{report.description}</p>
                              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-sm text-foreground/70 font-bold">
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
                    <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     className="mt-16 flex justify-center"
                    >
                    <Link href="/laporan" className="group flex items-center gap-3 font-bold text-primary px-10 py-5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all text-center">
                      Buka Semua Laporan <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                    </motion.div>
                </div>
              </section>

              <section className="section-padding overflow-hidden">
                <div className="container max-w-6xl mx-auto px-6 lg:px-8">
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8 }}
                     className="mb-16"
                   >
                     <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center md:text-left">Perangkat Desa</h2>
                     <p className="mt-4 text-muted-foreground text-lg text-center md:text-left">Tokoh-tokoh penggerak pembangunan SiLapor.</p>
                   </motion.div>

                   <div className="relative overflow-hidden">
                     
                     <motion.div
                       className="flex gap-8 pb-12 cursor-grab active:cursor-grabbing"
                       style={{ x: officialX, width: "fit-content" }}
                       drag="x"
                       onDragStart={() => setIsOfficialInteracting(true)}
                       onDragEnd={() => setIsOfficialInteracting(false)}
                       onMouseEnter={() => setIsOfficialInteracting(true)}
                       onMouseLeave={() => setIsOfficialInteracting(false)}
                     >
                       {[...officials, ...officials].map((official, i) => (
                         <div 
                           key={i} 
                           className="min-w-[300px] select-none"
                         >
                           <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.2)] relative group/card">
                             <img src={official.image} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt={official.name} />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                               <h4 className="text-white text-xl font-bold">{official.name}</h4>
                               <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{official.role}</p>
                             </div>
                           </div>
                         </div>
                       ))}
                     </motion.div>
                   </div>
                </div>
              </section>

              <section className="section-padding container max-w-4xl mx-auto px-4">
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   className="text-center mb-16"
                 >
                   <h2 className="text-3xl font-bold tracking-tight">Tanya Jawab</h2>
                   <p className="mt-4 text-muted-foreground">Persiapan sebelum Anda menyampaikan aspirasi.</p>
                 </motion.div>
                 <div className="space-y-4">
                   {[
                     { q: "Apakah identitas saya aman?", a: "Kami menjamin 100% kerahasiaan identitas pelapor untuk semua jenis aduan." },
                     { q: "Berapa lama proses verifikasi?", a: "Rata-rata verifikasi admin dilakukan dalam kurun waktu 1x24 jam kerja." },
                     { q: "Bisa melampirkan video?", a: "Untuk saat ini kami mengutamakan dukungan foto resolusi tinggi sebagai bukti." },
                      { q: "Apakah melapor dipungut biaya?", a: "Tidak. Layanan pengaduan ini 100% gratis untuk seluruh warga desa." },
                      { q: "Bagaimana cara melacak status?", a: "Anda dapat menggunakan fitur 'Lacak Aduan' di halaman utama dengan memasukkan kata kunci laporan Anda." },
                      { q: "Siapa yang memproses laporan?", a: "Laporan akan diverifikasi oleh Admin Desa dan diteruskan langsung ke Perangkat Desa terkait." }
                   ].map((item, idx) => (
                     <motion.div
                       key={idx}
                       initial={{ opacity: 0, scale: 0.98 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.1 }}
                       onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                       className={cn(
                         "rounded-2xl border border-border bg-card p-6 cursor-pointer transition-all duration-300",
                         openFaq === idx ? "ring-2 ring-primary/20 border-primary shadow-lg" : "hover:border-primary/30"
                       )}
                     >
                      <h4 className="font-bold flex items-center justify-between">
                        {item.q}
                        <PlusCircle className={cn("text-primary transition-transform duration-300", openFaq === idx && "rotate-45")} size={20} />
                      </h4>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="mx-auto max-w-4xl px-4 py-20">
              <button
                onClick={() => { setSelectedReport(null); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                className="group mb-12 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Kembali
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
