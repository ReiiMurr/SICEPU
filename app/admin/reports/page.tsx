"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
    RefreshCw,
    Download,
    Search,
    Inbox,
    Calendar,
    MapPin,
    ArrowLeft,
    Share2,
    Trash2,
    User,
    Eye,
    ExternalLink,
    ImageOff,
    Archive,
    Trash
} from "lucide-react";
import { cn } from "@/lib/utils";

type Complaint = {
    id: string;
    created_at: string;
    date?: string;
    title: string;
    description: string;
    location: string;
    status: "baru" | "diproses" | "selesai" | "ditolak";
    visibility: "Publik" | "Privat";
    image: string | null;
    profiles?: {
        full_name: string | null;
    };
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Semua");
    const [search, setSearch] = useState("");
    const [selectedReport, setSelectedReport] = useState<Complaint | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from("complaints")
            .select("*, profiles(full_name)")
            .order("created_at", { ascending: false });

        if (data) setReports(data as any[]);
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: Complaint["status"]) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from("complaints")
            .update({ status: newStatus })
            .eq("id", id);

        if (!error) {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedReport?.id === id) {
                setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedReport) return;
        setIsDeleting(true);
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from("complaints")
            .delete()
            .eq("id", selectedReport.id);

        if (!error) {
            setReports(prev => prev.filter(r => r.id !== selectedReport.id));
            setSelectedReport(null);
            setShowDeleteConfirm(false);
        }
        setIsDeleting(false);
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
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\nLink: ${shareData.url}`);
                alert("Detail laporan telah disalin ke clipboard!");
            } catch (err) {
                console.error("Error copying:", err);
            }
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesFilter = filter === "Semua" || r.status.toLowerCase() === filter.toLowerCase();
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toString().includes(search);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Laporan</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-1">Kelola, verifikasi, dan pantau aspirasi masyarakat.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchReports} className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-colors text-muted-foreground shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none">
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                        id="search-admin-reports"
                        name="search-admin-reports"
                        type="text"
                        placeholder="Cari ID atau judul laporan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/30 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                    {["Semua", "Baru", "Diproses", "Selesai", "Ditolak"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all outline-none",
                                filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List & Details View */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[600px]">
                {/* Reports List */}
                <div className={cn("xl:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar", selectedReport ? "hidden xl:block" : "block")}>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-2xl border border-border animate-pulse" />)
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-semibold">Tidak ada laporan ditemukan</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <motion.div
                                key={report.id}
                                layoutId={report.id}
                                onClick={() => setSelectedReport(report)}
                                className={cn(
                                    "p-5 rounded-2xl bg-card border transition-all cursor-pointer group",
                                    selectedReport?.id === report.id ? "border-primary ring-4 ring-primary/10 shadow-lg" : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded uppercase leading-none">#{report.id.slice(0, 8)}</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                        report.status === "baru" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                            report.status === "diproses" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                report.status === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                    "bg-rose-50 text-rose-600 border-rose-200"
                                    )}>
                                        {report.status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2 mb-3 text-slate-800 dark:text-slate-200 leading-snug">{report.title}</h4>
                                <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground/60">
                                    <div className="flex items-center gap-1.5 leading-none">
                                        <Calendar size={12} />
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate leading-none">
                                        <User size={12} />
                                        {report.profiles?.full_name || "Warga Anonymous"}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Details View */}
                <div className={cn("xl:col-span-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col", !selectedReport ? "hidden xl:flex items-center justify-center bg-muted/20" : "flex")}>
                    {selectedReport ? (
                        <>
                            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedReport(null)} className="xl:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary font-mono leading-none">Lap-{selectedReport.id.slice(0, 8)}</h3>
                                        <p className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-tight opacity-60">Detail Laporan Masyarakat</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleShare}
                                        className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                        title="Bagikan Laporan"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs flex items-center gap-2"
                                        title="Hapus Laporan"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold leading-tight text-foreground">{selectedReport.title}</h2>
                                    <div className="flex flex-wrap gap-2.5">
                                        <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-tight">
                                            <User size={14} />
                                            Pelapor: {selectedReport.profiles?.full_name || "Warga Anonymous"}
                                        </div>
                                        {selectedReport.date && (
                                            <div className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center gap-2 text-[10px] font-semibold text-orange-600">
                                                <Calendar size={14} />
                                                Kejadian: {new Date(selectedReport.date).toLocaleDateString("id-ID")}
                                            </div>
                                        )}
                                        <div className="px-3.5 py-1.5 rounded-xl bg-muted/50 border border-border flex items-center gap-2 text-[10px] font-semibold text-foreground">
                                            <Eye size={14} className="text-primary" />
                                            {selectedReport.visibility}
                                        </div>
                                        <div className="px-3.5 py-1.5 rounded-xl bg-muted/50 border border-border flex items-center gap-2 text-[10px] font-semibold text-foreground">
                                            <MapPin size={14} className="text-primary" />
                                            {selectedReport.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-muted/20 border border-border/50">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 opacity-50">Isi Laporan</p>
                                    <div className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans">
                                        {selectedReport.description}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-50">Ubah Status</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["baru", "diproses", "selesai", "ditolak"] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(selectedReport.id, s)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border outline-none",
                                                        selectedReport.status === s
                                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                            : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {(() => {
                                            const images = selectedReport.image ?
                                                (selectedReport.image.startsWith('[') ? JSON.parse(selectedReport.image) : [selectedReport.image]) :
                                                [];

                                            return (
                                                <>
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-50">Lampiran ({images.length})</p>
                                                    {images.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {images.map((img: string, idx: number) => (
                                                                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-border aspect-video bg-muted/30">
                                                                    <img
                                                                        src={img}
                                                                        alt={`Lampiran ${idx + 1}`}
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <a
                                                                            href={img}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all font-semibold text-xs flex items-center gap-2 border border-white/20"
                                                                        >
                                                                            <ExternalLink size={16} />
                                                                            Buka
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-32 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/5">
                                                            <ImageOff size={32} className="mb-2 opacity-50" />
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest">Tidak ada file terlampir</p>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-10 max-w-sm">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-xl shadow-primary/5">
                                <Archive size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground">Pilih Laporan</h3>
                            <p className="text-sm font-semibold text-muted-foreground/70">Silakan pilih salah satu laporan dari daftar di samping untuk melihat detail dan mengambil tindakan.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Trash size={120} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <Trash2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">Hapus Laporan?</h3>
                                    <p className="text-sm font-semibold text-muted-foreground mt-2 leading-relaxed">
                                        Tindakan ini tidak dapat dibatalkan. Laporan <span className="text-foreground">"{selectedReport?.title}"</span> akan dihapus permanen dari sistem.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        disabled={isDeleting}
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-6 py-3.5 rounded-2xl bg-muted/50 font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                        className="flex-1 px-6 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : "Ya, Hapus"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
