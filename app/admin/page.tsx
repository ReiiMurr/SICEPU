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
    { label: "Total Laporan", value: "0", trend: "+12%", icon: <BarChart3 size={20} />, status: "total", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
    { label: "Menunggu", value: "0", trend: "-5%", icon: <Clock3 size={20} />, status: "baru", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
    { label: "Selesai", value: "0", trend: "+18%", icon: <CheckCircle2 size={20} />, status: "selesai", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Ditolak", value: "0", trend: "+2%", icon: <XCircle size={20} />, status: "ditolak", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10" },
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
          if (s.status === "total") return { ...s, value: total.toString() };
          if (s.status === "baru") return { ...s, value: baru.toString() };
          if (s.status === "selesai") return { ...s, value: selesai.toString() };
          if (s.status === "ditolak") return { ...s, value: ditolak.toString() };
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau rincian aktivitas dan laporan masyarakat hari ini.</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-border p-3 rounded-xl shadow-sm">
          <div className="text-right px-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">System Time</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-border" />
          <div className="text-right px-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Server Status</p>
            <div className="flex items-center gap-1.5 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-bold uppercase text-emerald-600">Stable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Optimal for Mobile Scroll */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="relative overflow-hidden p-6 rounded-xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={cn("inline-flex p-2.5 rounded-lg shadow-sm border border-black/5", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{loading ? "..." : stat.value}</h3>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", stat.trend.includes('+') ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10")}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Chart Area - Responsive Height */}
        <div
          className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Performa Pelayanan</h3>
              <p className="text-xs text-slate-500 mt-1">Statistik laporan masuk dalam 7 hari terakhir.</p>
            </div>
            <button onClick={fetchDashboardData} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between h-48 md:h-56 gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-lg relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.05), ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0 bg-primary/40 group-hover/bar:bg-primary/60 transition-colors"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 0.6}%` }}
                    transition={{ duration: 1, delay: 0.4 + (i * 0.05), ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0 bg-primary shadow-sm"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 capitalize">{"sen,sel,rab,kam,jum,sab,min".split(',')[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - List View for Mobile */}
        <div
          className="p-6 md:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border shadow-sm"
        >
          <h3 className="text-sm font-bold tracking-tight mb-6 uppercase text-slate-500">Aksi Cepat</h3>

          <div className="grid grid-cols-1 gap-3">
            {[
              { title: "Buat Pengumuman", icon: <Megaphone size={16} />, color: "bg-primary text-white", href: "/admin/settings" },
              { title: "Kelola Masyarakat", icon: <Users size={16} />, color: "bg-slate-800 text-white", href: "/admin/users" },
              { title: "Verifikasi Laporan", icon: <ClipboardList size={16} />, color: "bg-slate-200 text-slate-700", href: "/admin/reports" },
            ].map((act, idx) => (
              <Link
                key={idx}
                href={act.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform", act.color)}>
                  {act.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{act.title}</p>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white dark:bg-slate-800 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Zone</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest leading-none">
                <span className="text-slate-400">Node</span>
                <span className="text-slate-600 dark:text-slate-300">SICEPU-01</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest leading-none">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-500">Active</span>
              </div>
            </div>
          </div>
        </div>
     </div>

      {/* Responsive Table / Card List */}
      <div
        className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm"
      >
        <div className="p-6 md:px-8 md:py-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Laporan Terbaru</h3>
            <p className="text-xs text-slate-500 mt-1">Laporan masuk yang perlu segera divalidasi oleh petugas.</p>
          </div>
          <Link href="/admin/reports" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-slate-900 dark:bg-primary text-white py-2.5 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-sm">
              Lihat Semua
            </button>
          </Link>
        </div>

        {/* Responsive Table UI */}
        <div className="overflow-x-auto selection:bg-primary/20">
          {/* Table for Tablet/Desktop */}
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pelapor</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Judul Laporan</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Prioritas</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Waktu</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat data...</td></tr>
              ) : recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-border shadow-sm">
                        {report.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{report.profiles?.full_name || "Masyarakat"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{report.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">#{report.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                      "inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                      report.status === "baru" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        report.status === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          report.status === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            "bg-rose-50 text-rose-600 border-rose-200"
                    )}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase border border-transparent",
                      getPriority(report.id) === "Tinggi" ? "text-rose-600 bg-rose-50" :
                        getPriority(report.id) === "Sedang" ? "text-amber-600 bg-amber-50" :
                          "text-emerald-600 bg-emerald-50"
                    )}>
                      {getPriority(report.id)}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{formatTimeAgo(report.created_at)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link href={`/admin/reports?id=${report.id}`}>
                      <button className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold transition-colors">
                        DETAIL
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
      </div>
    </div>
  );
}
