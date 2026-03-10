"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  Eye,
  Image as ImageIcon,
  ChevronRight,
  Info,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComplaintDetailProps = {
    report: any;
    onClose: () => void;
    onShare?: () => void;
};

export function ComplaintDetail({ report, onClose, onShare }: ComplaintDetailProps) {
    const [selectedImageIdx, setSelectedImageIdx] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (selectedImageIdx !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImageIdx]);
    const images = report.image ? (report.image.startsWith('[') ? JSON.parse(report.image) : [report.image]) : [];
    
    const getStatusConfig = (status: string) => {
        const s = (status || "baru").toLowerCase();
        if (s === 'selesai') return { label: "Selesai", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
        if (s === 'diproses') return { label: "Progress", color: "text-amber-600 bg-amber-50 border-amber-200" };
        if (s === 'ditolak') return { label: "Ditolak", color: "text-rose-600 bg-rose-50 border-rose-200" };
        return { label: "Baru", color: "text-blue-600 bg-blue-50 border-blue-200" };
    };

    const statusObj = getStatusConfig(report.status);

    // Mock timeline based on status
    const getTimeline = () => {
        const steps = [
            { title: "Laporan Diterima", desc: "Aduan telah berhasil dikirim oleh masyarakat dan masuk antrean sistem.", time: report.created_at, icon: <MessageSquare size={16} />, active: true }
        ];

        if (report.status !== "baru") {
            steps.push({ title: "Verifikasi", desc: "Aduan telah diverifikasi oleh admin SICEPU dan diteruskan ke perangkat desa.", time: report.created_at, icon: <ShieldCheck size={16} />, active: true });
        }

        if (report.status === "diproses" || report.status === "selesai") {
            steps.push({ title: "Progress", desc: "Aduan sedang dalam tahap penanganan oleh pihak terkait.", time: report.created_at, icon: <Clock size={16} />, active: true });
        }

        if (report.status === "selesai") {
            steps.push({ title: "Selesai", desc: "Laporan dinyatakan selesai. Terima kasih atas partisipasi Anda.", time: report.created_at, icon: <CheckCircle2 size={16} />, active: true });
        }

        return steps.reverse();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Image Modal Lightbox */}
            <AnimatePresence>
                {selectedImageIdx !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
                        onClick={() => setSelectedImageIdx(null)}
                    >
                        <motion.button 
                            className="absolute top-8 right-8 text-white/70 hover:text-white transition-all hover:scale-110 z-[10000]"
                            onClick={(e) => { e.stopPropagation(); setSelectedImageIdx(null); }}
                        >
                            <X size={36} />
                        </motion.button>
                        
                        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={e => e.stopPropagation()}>
                            <img 
                                src={images[selectedImageIdx]} 
                                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none" 
                                alt="Gallery Preview"
                            />
                            
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setSelectedImageIdx(prev => prev === 0 ? images.length - 1 : prev! - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <ChevronRight className="rotate-180" size={24} />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedImageIdx(prev => prev === images.length - 1 ? 0 : prev! + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Detail Aduan</h1>
                <p className="text-sm text-muted-foreground font-medium">Lihat detail lengkap aduan #{report.id?.slice(0, 10).toUpperCase()}</p>
            </div>

            {/* Rincian Aduan Card */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rincian Aduan</h2>
                            <p className="text-sm font-mono font-bold text-primary mt-1">#{report.id?.toUpperCase()}</p>
                        </div>
                        <div className="flex gap-2">
                            <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2", statusObj.color)}>
                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                {statusObj.label}
                            </div>
                            <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-600 flex items-center gap-2">
                                <Eye size={12} />
                                {report.visibility || "Public"}
                            </div>
                        </div>
                    </div>

                    {/* Lampiran */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                            <ImageIcon size={18} className="text-primary" />
                            <span>Lampiran</span>
                        </div>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map((img: string, idx: number) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className="aspect-video rounded-2xl overflow-hidden border border-border group relative cursor-pointer"
                                    >
                                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Lampiran ${idx+1}`} />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white">
                                                <Eye size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-2xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                                <Info size={24} className="mb-2 opacity-50" />
                                <p className="text-xs font-semibold">Tidak ada lampiran gambar</p>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-muted-foreground pb-6 mb-6 border-b border-border/50">
                        <div className="flex items-center gap-2 uppercase tracking-wide">
                            <MapPin size={14} className="text-primary" />
                            {report.location || "Lokasi tidak diketahui"}
                        </div>
                        <div className="flex items-center gap-2 uppercase tracking-wide">
                            <Calendar size={14} className="text-primary" />
                            {new Date(report.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10 text-sm md:text-base italic">
                        {report.description}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap gap-4 pt-8 border-t border-border/50">
                        <button 
                            onClick={onShare}
                            className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
                        >
                            <Share2 size={16} />
                            Bagikan Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Proses Section */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-center p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <MessageSquare size={16} />
                        Proses
                    </div>
                </div>
                <div className="p-6 md:p-10 space-y-6">
                    <div className="relative border-l-2 border-primary/20 ml-4 space-y-8 py-2">
                        {getTimeline().map((step, idx) => (
                            <div key={idx} className="relative pl-10">
                                {/* Dot */}
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center text-primary z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                                
                                <div className="p-6 rounded-2xl border border-border bg-card/50 shadow-sm space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">{step.title}</h4>
                                        <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                                            {new Date(step.time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(step.time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-primary opacity-80 uppercase tracking-widest">SICEPU SYSTEM</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Back Button */}
            <div className="flex justify-center pt-8">
                <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    Selesai Membaca
                </button>
            </div>
        </div>
    );
}
