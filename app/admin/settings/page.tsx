"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    Settings,
    Shield,
    Bell,
    Terminal,
    Info,
    Layout,
    Mail,
    Globe,
    Wrench,
    CheckCircle,
    AlertCircle,
    Building2,
    RefreshCw,
    Activity,
    ChevronRight,
    Lock
} from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "Laporin (Sistem Informasi Cerdas Pelayanan Umum)",
        notifyEmail: "laporin.service@gmail.com",
        allowPublic: true,
        maintenance: false,
        theme: "system",
        notifyNewReport: true,
        notifyStatusChange: true,
        sessionTimeout: "30 menit",
        ipWhitelist: "0.0.0.0/0",
        apiKey: "sc_live_************************"
    });
    const [activeTab, setActiveTab] = useState("Umum");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("admin_settings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem("admin_settings", JSON.stringify(settings));
            setMessage({ text: "Pengaturan berhasil diperbarui!", type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ text: "Gagal menyimpan pengaturan.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan Sistem</h1>
                    <p className="text-sm text-slate-500 mt-1">Konfigurasikan operasional dan parameter portal administrasi.</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-sm border",
                                message.type === 'success' 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-rose-50 text-rose-600 border-rose-100"
                            )}
                        >
                            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-1.5">
                    {[
                        { id: "Umum", icon: Settings, label: "Umum" },
                        { id: "Notifikasi", icon: Bell, label: "Notifikasi" }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between group border",
                                activeTab === item.id 
                                    ? "bg-slate-900 dark:bg-primary text-white border-transparent shadow-sm" 
                                    : "bg-white dark:bg-slate-900 text-slate-500 border-border hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={16} />
                                {item.label}
                            </div>
                            <ChevronRight size={14} className={cn("opacity-0 transition-all", activeTab === item.id ? "opacity-100 translate-x-0" : "group-hover:opacity-40 -translate-x-1")} />
                        </button>
                    ))}

                    <div className="mt-8 p-5 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Informasi Sistem</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400 uppercase tracking-tight">Versi</span>
                                <span className="text-slate-600 dark:text-slate-300">v4.2.0-STABLE</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400 uppercase tracking-tight">Database</span>
                                <span className="text-emerald-500 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                                    Online
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400 uppercase tracking-tight">Environment</span>
                                <span className="text-amber-600">PRODUCTION</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                        {/* Header Section */}
                        <div className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-border">
                                    {activeTab === "Umum" && <Layout size={16} />}
                                    {activeTab === "Notifikasi" && <Bell size={16} />}
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{activeTab}</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {activeTab === "Umum" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nama Portal Laporin</label>
                                            <div className="relative">
                                                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={settings.siteName}
                                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Administratif</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={settings.notifyEmail}
                                                    onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-border rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-border">
                                            <div className="flex items-center gap-3">
                                                <Globe size={16} className="text-slate-400" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Laporan Publik</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Visibilitas Masyarakat</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, allowPublic: !settings.allowPublic })}
                                                className={cn("w-9 h-5 rounded-full transition-all relative", settings.allowPublic ? "bg-primary" : "bg-slate-300 dark:bg-slate-800")}
                                            >
                                                <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all", settings.allowPublic ? "left-4.75" : "left-0.75")} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-border">
                                            <div className="flex items-center gap-3">
                                                <Wrench size={16} className="text-slate-400" />
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kunci Fitur Input</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, maintenance: !settings.maintenance })}
                                                className={cn("w-9 h-5 rounded-full transition-all relative", settings.maintenance ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-800")}
                                            >
                                                <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all", settings.maintenance ? "left-4.75" : "left-0.75")} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Notifikasi" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-950/30">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">Alert Email Laporan Baru</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Berikan notifikasi seketika saat ada aspirasi masuk</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, notifyNewReport: !settings.notifyNewReport })}
                                            className={cn("w-9 h-5 rounded-full transition-all relative", settings.notifyNewReport ? "bg-primary" : "bg-slate-300 dark:bg-slate-800")}
                                        >
                                            <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all", settings.notifyNewReport ? "left-4.75" : "left-0.75")} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-5 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-950/30">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">Email Feedback Warga</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Pantau respon masyarakat terhadap tindak lanjut laporan</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, notifyStatusChange: !settings.notifyStatusChange })}
                                            className={cn("w-9 h-5 rounded-full transition-all relative", settings.notifyStatusChange ? "bg-primary" : "bg-slate-300 dark:bg-slate-800")}
                                        >
                                            <div className={cn("w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all", settings.notifyStatusChange ? "left-4.75" : "left-0.75")} />
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border flex justify-end gap-3">
                            <button
                                onClick={() => setMessage({ text: "Operasi dibatalkan.", type: 'error' })}
                                className="px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-2.5 rounded-lg bg-slate-900 dark:bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                            >
                                {loading ? <RefreshCw size={12} className="animate-spin" /> : "Simpan Pengaturan"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
