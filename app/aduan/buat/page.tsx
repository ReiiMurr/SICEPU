"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Instagram,
    AlertCircle,
    Mountain,
    LogOut,
    FileText,
    ShieldCheck,
    Wrench,
    CheckCircle,
    Send,
    Shield,
    Zap,
    HelpCircle,
    PlusCircle,
    PlayCircle,
    FileWarning,
    Info,
    Trash2,
    Image as ImageIcon,
    MapPin,
    ChevronRight,
    TrendingUp,
    Share2,
    Calendar,
    Phone,
    Mail,
    Github
} from "lucide-react";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

interface Attachment {
    file: File;
    preview: string;
}

export default function CreateAduanPage() {
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        description: "",
        location: "",
        visibility: "Publik"
    });

    // Load saved form data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("aduan_draft");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Merge with default to avoid undefined values if keys were added later
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse saved form data", e);
            }
        }
    }, []);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("aduan_draft", JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error("Auth check failed:", error);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        checkUser();
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            attachments.forEach(att => {
                if (att.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(att.preview);
                }
            });
        };
    }, [attachments]);

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

    const processFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const availableSlots = 3 - attachments.length;

        if (availableSlots <= 0) return;

        const filesToAdd = newFiles.slice(0, availableSlots);
        const newAttachments: Attachment[] = filesToAdd.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        processFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setAttachments(prev => {
            const itemToRemove = prev[index];
            if (itemToRemove && itemToRemove.preview.startsWith('blob:')) {
                URL.revokeObjectURL(itemToRemove.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            router.push("/login");
            return;
        }

        if (!formData.title || !formData.description || !formData.location) {
            setError("Harap isi semua bidang yang diperlukan.");
            return;
        }

        setLoading(true);

        try {
            const supabase = getSupabaseClient();

            // Upload all attachments
            const imageUrls: string[] = [];

            for (const att of attachments) {
                const file = att.file;
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `reports/${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("complaints")
                    .upload(filePath, file);

                if (uploadError) {
                    console.warn(`Upload failed for ${file.name}:`, uploadError);
                    continue; // Skip failed file and continue with others
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from("complaints")
                        .getPublicUrl(filePath);
                    imageUrls.push(publicUrl);
                }
            }

            const { error: insertError } = await supabase
                .from("complaints")
                .insert({
                    user_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    visibility: formData.visibility,
                    status: "baru",
                    image: imageUrls.length > 0 ? (imageUrls.length === 1 ? imageUrls[0] : JSON.stringify(imageUrls)) : null,
                    date: formData.date
                });

            if (insertError) {
                if (insertError.message.includes("column") && insertError.message.includes("not found")) {
                    throw new Error("Kolom 'date' atau 'image' belum ada di database. Silakan jalankan SQL di Supabase editor.");
                }
                throw insertError;
            }

            localStorage.removeItem("aduan_draft");
            window.location.href = "/aduan?success=1";
        } catch (err: any) {
            console.error("Submission error details:", JSON.stringify(err, null, 2));
            setError(err.message || "Gagal mengirim laporan. Silakan coba lagi.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 lg:px-8">
                    {/* Left: Logo */}
                    <div className="flex flex-1 items-center justify-start gap-3">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                <Mountain size={20} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Desa Sejahtera</h1>
                        </Link>
                    </div>

                    {/* Center: Nav */}
                    <nav className="hidden items-center justify-center gap-8 lg:flex">
                        <Link className="text-sm font-semibold transition-all hover:text-primary" href="/">Home</Link>
                        <Link className="text-sm font-medium text-muted-foreground transition-all hover:text-primary" href="/tentang">Tentang</Link>
                        <Link className="text-sm font-medium text-muted-foreground transition-all hover:text-primary" href="/laporan">Laporan</Link>
                        <Link className="text-sm font-medium text-muted-foreground transition-all hover:text-primary" href="/aduan">Laporanku</Link>
                        <Link className="text-sm font-medium text-muted-foreground transition-all hover:text-primary" href="/#contact">Contact</Link>
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex flex-1 items-center justify-end gap-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <motion.button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="hidden items-center gap-3 rounded-xl border border-border bg-card/50 p-1 pr-3 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 sm:flex"
                                >
                                    <div className="flex flex-col items-end pl-2">
                                        <span className="text-xs font-bold tracking-tight text-foreground line-clamp-1">
                                            {user.user_metadata?.full_name || user.email?.split("@")[0]}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                                            Pengguna
                                        </span>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
                                        <span className="text-sm font-bold uppercase">{user.email?.[0]}</span>
                                    </div>
                                </motion.button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl"
                                        >
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                                            >
                                                <LogOut size={18} />
                                                Keluar
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                className="items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 flex"
                                href="/login"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-16 flex-1">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center md:text-left"
                >
                    <h2 className="text-4xl font-bold tracking-tight mb-3">Buat Laporan</h2>
                    <p className="text-muted-foreground text-lg">Sampaikan keluhan atau aspirasi Anda demi kemajuan desa kita tercinta.</p>
                </motion.div>

                {/* Progress Stepper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-16"
                >
                    <div className="relative flex justify-between items-start px-2 border-b-2 border-muted pb-4">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 z-10 scale-110">
                                <FileText size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-primary">Tulis Laporan</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">Sedang diisi</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center gap-3 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-card border-2 border-border text-muted-foreground flex items-center justify-center z-10">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">Verifikasi</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider">Menunggu</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center gap-3 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-card border-2 border-border text-muted-foreground flex items-center justify-center z-10">
                                <Wrench size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">Tindak Lanjut</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider">Proses</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center gap-3 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-card border-2 border-border text-muted-foreground flex items-center justify-center z-10">
                                <CheckCircle size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">Selesai</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider">Arsip</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card/50 backdrop-blur-md rounded-3xl shadow-2xl border border-border overflow-hidden"
                >
                    <div className="p-8 md:p-12">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm font-bold"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                            {/* Title */}
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Judul Laporan</label>
                                <input
                                    name="title"
                                    value={formData.title || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium font-display"
                                    placeholder="Contoh: Jalan berlubang di Dusun Krajan"
                                    type="text"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Date Only */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tanggal Kejadian</label>
                                    <input
                                        name="date"
                                        value={formData.date || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium font-display"
                                        type="date"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Isi Laporan / Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium min-h-[150px] font-display"
                                    placeholder="Ceritakan detail kejadian atau aspirasi Anda..."
                                    rows={5}
                                    required
                                ></textarea>
                            </div>

                            {/* Location */}
                            <div className="space-y-3">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Lokasi Kejadian</label>
                                <div className="relative group">
                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="location"
                                        value={formData.location || ""}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium font-display"
                                        placeholder="Nama jalan, RT/RW, atau patokan lokasi"
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>

                            {/* File Upload (Functional & Expanded Support) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Lampiran Foto/Dokumen/Video (Maks. 3)</label>
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{attachments.length}/3 Terpilih</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {attachments.map((att, index) => (
                                            <motion.div
                                                key={att.preview}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="relative group h-40 rounded-2xl overflow-hidden border border-border bg-muted/30"
                                            >
                                                {att.file.type.startsWith('image/') ? (
                                                    <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : att.file.type.startsWith('video/') ? (
                                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                        <PlayCircle size={40} className="text-white/50" />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                        <FileText size={40} className="text-primary/40" />
                                                    </div>
                                                )}

                                                {/* Overlay Tooltip */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                                                    <p className="text-[10px] font-bold truncate w-full">{att.file.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="mt-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {attachments.length < 3 && (
                                            <motion.div
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-2xl h-40 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer text-center p-4"
                                            >
                                                <PlusCircle size={32} className="text-primary/40 mb-2" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Tambah File</p>
                                            </motion.div>
                                        )}

                                        {/* Placeholders */}
                                        {Array.from({ length: Math.max(0, 2 - attachments.length) }).map((_, i) => (
                                            <div key={`placeholder-${i}`} className="hidden sm:flex border border-dashed border-muted/50 rounded-2xl h-40 items-center justify-center opacity-30">
                                                <ImageIcon size={40} className="text-muted-foreground" />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    className="hidden"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf,.doc,.docx,video/mp4"
                                />
                                <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Info size={14} />
                                        Format: PNG, JPG, PDF, DOCX, MP4 (Maks. 10MB/file)
                                    </p>
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="space-y-5 pt-8 border-t border-border">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Privasi Laporan</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className="flex-1 cursor-pointer group">
                                        <input
                                            name="visibility"
                                            type="radio"
                                            value="Publik"
                                            checked={formData.visibility === "Publik"}
                                            onChange={handleInputChange}
                                            className="hidden peer"
                                        />
                                        <div className="p-5 rounded-2xl border border-border bg-muted/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-2 peer-checked:ring-primary/20 peer-checked:[&_div:first-child]:bg-primary peer-checked:[&_div:first-child]:border-primary transition-all flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-all bg-background shadow-inner">
                                                <div className="w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <div>
                                                <p className="text-base font-black">Publik</p>
                                                <p className="text-xs font-medium text-muted-foreground">Dapat dilihat semua warga</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer group">
                                        <input
                                            name="visibility"
                                            type="radio"
                                            value="Privat"
                                            checked={formData.visibility === "Privat"}
                                            onChange={handleInputChange}
                                            className="hidden peer"
                                        />
                                        <div className="p-5 rounded-2xl border border-border bg-muted/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-2 peer-checked:ring-primary/20 peer-checked:[&_div:first-child]:bg-primary peer-checked:[&_div:first-child]:border-primary transition-all flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-all bg-background shadow-inner">
                                                <div className="w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <div>
                                                <p className="text-base font-black">Privat</p>
                                                <p className="text-xs font-medium text-muted-foreground">Hanya Admin & Anda</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-10">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 text-lg font-display"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Kirim Laporan
                                        </>
                                    )}
                                </motion.button>
                                <p className="text-center text-xs font-black text-muted-foreground mt-6 uppercase tracking-widest opacity-60">
                                    Pastikan data yang Anda masukkan sudah benar dan sesuai fakta lapangan.
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border transition-all shadow-sm"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-tight">Keamanan Data</h4>
                            <p className="text-xs font-semibold text-muted-foreground mt-1 leading-relaxed">Identitas pelapor dilindungi sesuai kebijakan privasi.</p>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border transition-all shadow-sm"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-tight">Respon Cepat</h4>
                            <p className="text-xs font-semibold text-muted-foreground mt-1 leading-relaxed">Laporan akan diverifikasi maksimal 1x24 jam kerja.</p>
                        </div>
                    </motion.div>
                    <motion.div
                        id="contact"
                        whileHover={{ y: -5 }}
                        className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border transition-all shadow-sm"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-tight">Butuh Bantuan?</h4>
                            <p className="text-xs font-semibold text-muted-foreground mt-1 leading-relaxed">Hubungi customer service kami di (021) 1234567.</p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
