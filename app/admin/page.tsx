"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

import {
  BarChart3,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Megaphone,
  Users,
  ClipboardList,
  Database,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  ChevronRight
} from "lucide-react";

type Complaint = {
  id: string;
  created_at: string;
  title: string;
  status: "baru" | "diproses" | "selesai" | "ditolak";
  profiles: {
    full_name: string | null;
  } | null;
};

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState([
    { label: "Total Laporan", value: "0", trend: "+12%", icon: <BarChart3 size={24} />, color: "from-blue-500 to-indigo-600", key: "total" },
    { label: "Menunggu", value: "0", trend: "-5%", icon: <Clock3 size={24} />, color: "from-amber-400 to-orange-500", key: "baru" },
    { label: "Selesai", value: "0", trend: "+18%", icon: <CheckCircle2 size={24} />, color: "from-emerald-400 to-teal-500", key: "selesai" },
    { label: "Ditolak", value: "0", trend: "+2%", icon: <XCircle size={24} />, color: "from-rose-500 to-red-600", key: "ditolak" },
  ]);
  const [recentReports, setRecentReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("id, status, created_at, title, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (complaints) {
        const total = complaints.length;
        const baru = complaints.filter(c => c.status === "baru").length;
        const selesai = complaints.filter(c => c.status === "selesai").length;
        const ditolak = complaints.filter(c => c.status === "ditolak").length;

        setStats(prev => prev.map(s => {
          if (s.key === "total") return { ...s, value: total.toString() };
          if (s.key === "baru") return { ...s, value: baru.toString() };
          if (s.key === "selesai") return { ...s, value: selesai.toString() };
          if (s.key === "ditolak") return { ...s, value: ditolak.toString() };
          return s;
        }));

        setRecentReports(complaints.slice(0, 5) as any);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (id: string) => {
    const num = parseInt(id.slice(0, 2), 16) || 0;
    if (num > 180) return "Tinggi";
    if (num > 100) return "Sedang";
    return "Rendah";
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    if (hrs < 1) return "Baru saja";
    if (hrs < 24) return `${hrs}j lalu`;
    return `${Math.floor(hrs / 24)}h lalu`;
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tighter"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2 font-semibold uppercase text-[10px] tracking-[0.2em] opacity-60"
          >
            Pusat Kendali SICEPU
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-card/40 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[2rem] shadow-2xl shadow-primary/5"
        >
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-primary mb-1">Local Time</p>
            <p className="text-xl md:text-2xl font-bold font-mono">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="h-10 w-[1px] bg-border/50" />
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">System Status</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <p className="text-xs font-semibold uppercase tracking-widest">Optimal</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid - Optimal for Mobile Scroll */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative group overflow-hidden p-5 md:p-8 rounded-[1.75rem] md:rounded-[2.5rem] bg-card border border-border shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className={cn("absolute -top-4 -right-4 w-24 h-24 opacity-5 bg-gradient-to-br transition-all duration-700 group-hover:opacity-20", stat.color)} style={{ clipPath: 'circle(50% at 100% 0%)' }} />
            <div className="relative z-10">
              <div className={cn("inline-flex p-3 md:p-4 rounded-2xl text-white shadow-xl", "bg-gradient-to-br " + stat.color)}>
                {stat.icon}
              </div>
              <div className="mt-4 md:mt-8">
                <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate opacity-70">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight">{loading ? "..." : stat.value}</h3>
                  <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full", stat.trend.includes('+') ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Chart Area - Responsive Height */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <h3 className="text-lg md:text-2xl font-bold tracking-tight leading-none text-foreground">Pelayanan</h3>
              <p className="text-[10px] md:text-sm font-semibold text-muted-foreground mt-2">Performa mingguan reports</p>
            </div>
            <button onClick={fetchDashboardData} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-muted/50 hover:bg-primary hover:text-white transition-all">
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="flex items-end justify-between h-40 md:h-64 gap-3 md:gap-8 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar max-w-[40px]">
                <div className="w-full flex gap-1 items-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1.5, delay: 0.6 + (i * 0.1), ease: "circOut" }}
                    className="flex-1 bg-primary/20 rounded-t-lg md:rounded-t-xl group-hover/bar:bg-primary/30 transition-all"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 0.7}%` }}
                    transition={{ duration: 1.5, delay: 0.8 + (i * 0.1), ease: "circOut" }}
                    className="flex-1 bg-primary rounded-t-lg md:rounded-t-xl shadow-[0_0_20px_rgba(20,184,20,0.3)]"
                  />
                </div>
                <span className="text-[9px] md:text-[10px] font-black text-muted-foreground/50">{"SMTWRFS"[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions - List View for Mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-primary/[0.03] border border-primary/10 shadow-sm relative overflow-hidden"
        >
          <h3 className="text-lg md:text-xl font-black tracking-tight mb-6 md:mb-10">Aksi Cepat</h3>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {[
              { title: "Pengumuman", icon: <Megaphone size={18} />, color: "bg-primary/10 text-primary", href: "/admin/settings" },
              { title: "Masyarakat", icon: <Users size={18} />, color: "bg-orange-500/10 text-orange-600", href: "/admin/users" },
              { title: "Laporan", icon: <ClipboardList size={18} />, color: "bg-blue-500/10 text-blue-600", href: "/admin/reports" },
            ].map((act, idx) => (
              <Link
                key={idx}
                href={act.href}
                className="flex items-center gap-4 p-4 md:p-5 rounded-2xl md:rounded-[1.75rem] bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
              >
                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", act.color)}>
                  {act.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-semibold text-foreground">{act.title}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl md:rounded-3xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-primary/80">Cluster SICEPU-01</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-widest leading-none">
                <span className="text-muted-foreground">Database</span>
                <span className="text-emerald-500">Live</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-widest leading-none">
                <span className="text-muted-foreground">Encryption</span>
                <span className="text-blue-500">AES-256</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Responsive Table / Card List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm"
      >
        <div className="p-6 md:p-12 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50">
          <div>
            <h3 className="text-xl md:text-3xl font-bold tracking-tighter text-foreground">Antrean Baru</h3>
            <p className="text-[10px] md:text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Memerlukan Validasi Segera</p>
          </div>
          <Link href="/admin/reports" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-primary text-white border-none py-4 px-10 rounded-2xl font-semibold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all outline-none">
              Semua Antrean
            </button>
          </Link>
        </div>

        {/* Responsive Table UI */}
        <div className="overflow-x-auto selection:bg-primary/20">
          {/* Table for Tablet/Desktop */}
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-left">Pelapor</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-left">Subjek</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-center">Status</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-center">Prioritas</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-left">Waktu</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">Loading core data...</td></tr>
              ) : recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/20 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 text-primary flex items-center justify-center font-bold text-sm border border-primary/10 shadow-sm transition-transform group-hover:scale-110">
                        {report.profiles?.full_name?.[0] || "?"}
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">{report.profiles?.full_name || "Anonim"}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">{report.title}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-1 opacity-50">#ID-{report.id.slice(0, 6).toUpperCase()}</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={cn(
                      "inline-flex px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                      report.status === "baru" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        report.status === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          report.status === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            "bg-rose-50 text-rose-600 border-rose-200"
                    )}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border/50",
                      getPriority(report.id) === "Tinggi" ? "text-rose-600 bg-rose-500/5" :
                        getPriority(report.id) === "Sedang" ? "text-amber-600 bg-amber-500/5" :
                          "text-emerald-600 bg-emerald-500/5"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm",
                        getPriority(report.id) === "Tinggi" ? "bg-rose-600" :
                          getPriority(report.id) === "Sedang" ? "bg-amber-600" :
                            "bg-emerald-600"
                      )} />
                      {getPriority(report.id)}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-left">
                    <p className="text-xs font-semibold text-foreground text-left">{formatTimeAgo(report.created_at)}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground/40 mt-1 uppercase tracking-widest text-left">Waktu SICEPU</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link href={`/admin/reports?id=${report.id}`}>
                      <button className="w-12 h-12 rounded-2xl bg-muted/30 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-500 flex items-center justify-center shadow-sm">
                        <ClipboardList size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cards for Mobile View */}
          <div className="md:hidden divide-y divide-border/50">
            {loading ? (
              <div className="p-10 text-center font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">Syncing...</div>
            ) : recentReports.map((report) => (
              <div key={report.id} className="p-6 space-y-4 active:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                      {report.profiles?.full_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">{report.profiles?.full_name || "Anonim"}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{formatTimeAgo(report.created_at)}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                    report.status === "baru" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      report.status === "diproses" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        report.status === "selesai" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  )}>
                    {report.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-foreground line-clamp-1">{report.title}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-muted/50",
                    getPriority(report.id) === "Tinggi" ? "text-rose-600" :
                      getPriority(report.id) === "Sedang" ? "text-amber-600" :
                        "text-emerald-600"
                  )}>
                    {getPriority(report.id)}
                  </div>
                  <Link href={`/admin/reports?id=${report.id}`}>
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Detail &rarr;</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
