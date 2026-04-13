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
    Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

type Complaint = {
    id: string;
    user_id: string;
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
        email?: string | null;
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
    const [progressStatus, setProgressStatus] = useState("Diproses");
    const [progressDesc, setProgressDesc] = useState("");
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from("complaints")
            .select("*, profiles(full_name, email)")
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

    const handleUpdateProgress = async () => {
        if (!selectedReport || !progressDesc) {
            alert("Harap isi deskripsi progress!");
            return;
        }

        setIsUpdatingProgress(true);
        const supabase = getSupabaseClient();
        
        try {
            // 1. Update the status in complaints table
            let mainStatus = "diproses";
            if (progressStatus.toLowerCase() === "selesai") mainStatus = "selesai";
            if (progressStatus.toLowerCase() === "ditolak") mainStatus = "ditolak";
            if (progressStatus.toLowerCase() === "verifikasi") mainStatus = "baru";

            const { error: statusError } = await supabase
                .from("complaints")
                .update({ status: mainStatus })
                .eq("id", selectedReport.id);

            if (statusError) throw statusError;

            // 2. Insert into complaint_progress
            const { error: progressError } = await supabase
                .from("complaint_progress")
                .insert({
                    complaint_id: selectedReport.id,
                    status: progressStatus,
                    description: progressDesc,
                    admin_name: "ADMIN DESA"
                });

            if (progressError) throw progressError;

            // 3. Send notification to user
            try {
                if (selectedReport.user_id) {
                    const userProfile = (selectedReport as any).profiles;
                    const res = await fetch("/api/notify-user", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: selectedReport.user_id,
                            userEmail: userProfile?.email || null,
                            reportTitle: selectedReport.title,
                            reportId: selectedReport.id,
                            status: progressStatus,
                            message: progressDesc
                        }),
                    });
                    
                    if (!res.ok) {
                        const errorData = await res.json();
                        console.error("Notification API failed:", errorData);
                        alert("Progress disimpan, tapi GAGAL mengirim notifikasi ke warga: " + (errorData.error || "Unknown error"));
                    } else {
            
                    }
                } else {
                    alert("Progress berhasil diperbarui (Warga tidak memiliki ID untuk dinotifikasi).");
                }
            } catch (notifyError) {
                console.error("Failed to notify user:", notifyError);
            }

            alert("Progress berhasil diperbarui dan warga telah dinotifikasi!");
            setProgressDesc("");
            fetchReports();
            if (selectedReport) {
                setSelectedReport(prev => prev ? { ...prev, status: mainStatus as "baru" | "diproses" | "selesai" | "ditolak" } : null);
            }
        } catch (err: any) {
            console.error(err);
            alert("Gagal update progress: " + err.message + "\n\nPastikan tabel 'complaint_progress' sudah dibuat di Supabase.");
        } finally {
            setIsUpdatingProgress(false);
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
            text: `Detail Laporan Laporin:\nJudul: ${selectedReport.title}\nLokasi: ${selectedReport.location}\nStatus: ${selectedReport.status}\nDeskripsi: ${selectedReport.description}`,
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manajemen Laporan</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola, verifikasi, dan pantau aspirasi masyarakat.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchReports} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-border shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <RefreshCw size={16} className="text-slate-600" />
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all">
                        <Download size={14} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-border shadow-sm">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        id="search-admin-reports"
                        name="search-admin-reports"
                        type="text"
                        placeholder="Cari ID atau judul laporan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-lg py-2 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                    {["Semua", "Baru", "Diproses", "Selesai", "Ditolak"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                filter === f ? "bg-primary text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
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
                <div className={cn("xl:col-span-1 space-y-2 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar", selectedReport ? "hidden xl:block" : "block")}>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border animate-pulse" />)
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-border">
                            <Inbox size={32} className="mb-3 opacity-30" />
                            <p className="text-xs font-bold">Tidak ada laporan ditemukan</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer group",
                                    selectedReport?.id === report.id 
                                        ? "bg-primary/5 border-primary shadow-sm" 
                                        : "bg-white dark:bg-slate-950 border-border hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-slate-400 font-mono">#{report.id.slice(0, 8).toUpperCase()}</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                                        report.status === "baru" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            report.status === "diproses" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                report.status === "selesai" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {report.status}
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{report.title}</h4>
                                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 truncate max-w-[100px]">
                                        <User size={10} />
                                        {report.profiles?.full_name || "Masyarakat"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Details View */}
                <div className={cn("xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden flex flex-col", !selectedReport ? "hidden xl:flex items-center justify-center bg-slate-50 dark:bg-slate-950" : "flex")}>
                    {selectedReport ? (
                        <>
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedReport(null)} className="xl:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Arsip Laporan</h3>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">#{selectedReport.id.slice(0, 12).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleShare}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{selectedReport.title}</h2>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <User size={12} />
                                            {selectedReport.profiles?.full_name || "Masyarakat"}
                                        </div>
                                        {selectedReport.date && (
                                            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-md text-amber-600 flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(selectedReport.date).toLocaleDateString("id-ID")}
                                            </div>
                                        )}
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            <MapPin size={12} />
                                            {selectedReport.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-left">Deskripsi Laporan</h4>
                                    <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-border">
                                        {selectedReport.description}
                                    </div>
                                </div>

                                    {/* Progress Update Form */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-left">Update Progress (Terbaru)</h4>
                                        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-border space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-1">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Jenis Progress</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Verifikasi", "Diproses", "Selesai", "Ditolak"].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => setProgressStatus(s)}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border",
                                                                    progressStatus === s
                                                                        ? "bg-primary border-primary text-white shadow-sm"
                                                                        : "bg-white dark:bg-slate-900 border-border text-slate-500"
                                                                )}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Keterangan / Pesan untuk Warga</label>
                                                    <textarea
                                                        value={progressDesc}
                                                        onChange={(e) => setProgressDesc(e.target.value)}
                                                        placeholder="Contoh: Laporan telah kami terima dan akan segera ditinjau oleh tim teknis di lapangan."
                                                        className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <button
                                                        onClick={handleUpdateProgress}
                                                        disabled={isUpdatingProgress}
                                                        className="w-full bg-slate-900 dark:bg-primary text-white py-3 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                                    >
                                                        {isUpdatingProgress ? <RefreshCw size={14} className="animate-spin" /> : "Simpan & Publikasi Progress"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documentation Lampiran */}
                                    <div className="space-y-4">
                                        {(() => {
                                            const attachments = selectedReport.image ?
                                                (selectedReport.image.startsWith('[') ? JSON.parse(selectedReport.image) : [selectedReport.image]) :
                                                [];

                                            return (
                                                <>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-left">Dokumentasi Lampiran ({attachments.length})</h4>
                                                    {attachments.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                            {attachments.map((url: string, idx: number) => {
                                                                const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
                                                                const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
                                                                
                                                                return (
                                                                    <a 
                                                                        key={idx} 
                                                                        href={url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-slate-50 flex items-center justify-center"
                                                                    >
                                                                        {isImage ? (
                                                                            <img src={url} alt="Lampiran" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center justify-center p-2 text-primary/40">
                                                                                <Archive size={20} />
                                                                                <span className="text-[8px] font-bold uppercase mt-1 truncate w-full text-center">{ext}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <ExternalLink size={14} className="text-white" />
                                                                        </div>
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest">Tidak ada lampiran gambar</p>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-10 max-w-sm">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-6 border border-border">
                                <Archive size={32} />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Pilih Laporan</h3>
                            <p className="text-xs text-slate-500">Silakan pilih salah satu laporan dari daftar di samping untuk melihat rincian arsip.</p>
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-sm:w-full max-w-sm bg-white dark:bg-slate-900 border border-border rounded-xl p-6 shadow-xl"
                        >
                            <div className="space-y-6">
                                <div className="h-12 w-12 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hapus Laporan?</h3>
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        Data laporan <span className="font-bold text-slate-700 dark:text-slate-200">"{selectedReport?.title}"</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={isDeleting}
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? <RefreshCw size={12} className="animate-spin" /> : "Hapus Laporan"}
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
