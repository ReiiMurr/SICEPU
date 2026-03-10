"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    Settings,
    Shield,
    Bell,
    Share2,
    Terminal,
    Info,
    Layout,
    Mail,
    Globe,
    Wrench,
    CheckCircle,
    AlertCircle,
    Building2,
    Check,
    RefreshCw,
    Activity
} from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "SICEPU (Sistem Informasi Cerdas Pelayanan Umum)",
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
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [isLoggingLoading, setIsLoggingLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // In a real app, settings would be fetched from a 'configs' table.
    // For now, we'll simulate the persistence.
    useEffect(() => {
        const saved = localStorage.getItem("admin_settings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const fetchLogs = async () => {
        setIsLoggingLoading(true);
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from("audit_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);
            
            if (error) {
                // If table doesn't exist (code 42P01), we use fallback without logging error
                if (error.code === '42P01') {
                    setSystemLogs([
                        { action: "Login Admin", user_email: "admin@sicepu.id", created_at: new Date().toISOString(), type: "info" },
                        { action: "Status Update #LAP-01", user_email: "staff@sicepu.id", created_at: new Date(Date.now() - 3600000).toISOString(), type: "success" },
                        { action: "Update Profil Desa", user_email: "admin@sicepu.id", created_at: new Date(Date.now() - 7200000).toISOString(), type: "info" },
                        { action: "Ganti Password", user_email: "admin@sicepu.id", created_at: new Date(Date.now() - 86400000).toISOString(), type: "warning" }
                    ]);
                    return;
                }
                throw error;
            }
            setSystemLogs(data || []);
        } catch (err) {
            console.error("Gagal sinkronisasi log:", err);
        } finally {
            setIsLoggingLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "Log Sistem") {
            fetchLogs();
        }
    }, [activeTab]);

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Persist to localStorage for demo purposes in this environment
            localStorage.setItem("admin_settings", JSON.stringify(settings));

            setMessage({ text: "Pengaturan berhasil diperbarui!", type: 'success' });

            // Auto hide message
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ text: "Gagal menyimpan pengaturan.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-1">Konfigurasikan operasional dan parameter portal administrasi.</p>
                </div>
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg",
                                message.type === 'success' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
                            )}
                        >
                            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Menu */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { name: "Umum", icon: Settings },
                        { name: "Notifikasi", icon: Bell },
                        { name: "Log Sistem", icon: Terminal }
                    ].map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all flex items-center gap-4 group",
                                activeTab === item.name ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-card hover:border-border border border-transparent"
                            )}
                        >
                            <item.icon size={20} className={cn("transition-transform", activeTab === item.name ? "" : "group-hover:scale-110")} />
                            {item.name}
                        </button>
                    ))}

                    <div className="pt-10 border-t border-border mt-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-5 mb-5 flex items-center gap-2">
                            <Info size={14} />
                            Informasi Sistem
                        </p>
                        <div className="px-5 space-y-3">
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Versi Aplikasi</span>
                                <span className="bg-muted px-2 py-0.5 rounded text-[10px]">v4.2.0-stable</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Database</span>
                                <span className="text-emerald-500 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Uptime API</span>
                                <span>99.99%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-10 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-10"
                    >
                        {activeTab === "Umum" && (
                            <>
                                {/* Section: Umum */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Layout size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-foreground">Profil Portal SICEPU</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Nama Instansi / Portal</label>
                                            <div className="relative group">
                                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                                <input
                                                    id="siteName"
                                                    name="siteName"
                                                    type="text"
                                                    value={settings.siteName}
                                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                    className="w-full bg-muted/20 hover:bg-muted/40 border border-transparent focus:border-primary/30 rounded-2xl py-4 pl-12 pr-5 text-sm font-semibold focus:ring-4 focus:ring-primary/5 outline-none transition-all text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email Notifikasi Admin</label>
                                            <div className="relative group">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                                <input
                                                    id="notifyEmail"
                                                    name="notifyEmail"
                                                    type="email"
                                                    value={settings.notifyEmail}
                                                    onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })}
                                                    className="w-full bg-muted/20 hover:bg-muted/40 border border-transparent focus:border-primary/30 rounded-2xl py-4 pl-12 pr-5 text-sm font-semibold focus:ring-4 focus:ring-primary/5 outline-none transition-all text-foreground"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Fitur */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                            <Settings size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-foreground">Konfigurasi Fitur & Modul</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Globe size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Laporan Publik</p>
                                                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Visibilitas tanpa login</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, allowPublic: !settings.allowPublic })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative shadow-inner overflow-hidden",
                                                    settings.allowPublic ? "bg-primary" : "bg-muted-foreground/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-md",
                                                    settings.allowPublic ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border group hover:border-rose-300 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-rose-500 transition-colors">
                                                    <Wrench size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Mode Pemeliharaan</p>
                                                    <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Kunci fitur pelaporan</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, maintenance: !settings.maintenance })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative shadow-inner overflow-hidden",
                                                    settings.maintenance ? "bg-rose-500" : "bg-muted-foreground/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-md",
                                                    settings.maintenance ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "Notifikasi" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Pengaturan Pemberitahuan</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border">
                                        <div>
                                            <p className="text-sm font-bold">Email Laporan Baru</p>
                                            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Dapatkan email setiap ada aduan masuk</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, notifyNewReport: !settings.notifyNewReport })}
                                            className={cn("w-12 h-6 rounded-full transition-all relative shadow-inner", settings.notifyNewReport ? "bg-primary" : "bg-muted-foreground/30")}
                                        >
                                            <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", settings.notifyNewReport ? "right-1" : "left-1")} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border">
                                        <div>
                                            <p className="text-sm font-bold">Email Feedback Warga</p>
                                            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Dapatkan email jika warga membalas tanggapan</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, notifyStatusChange: !settings.notifyStatusChange })}
                                            className={cn("w-12 h-6 rounded-full transition-all relative shadow-inner", settings.notifyStatusChange ? "bg-primary" : "bg-muted-foreground/30")}
                                        >
                                            <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", settings.notifyStatusChange ? "right-1" : "left-1")} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Keamanan" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <Shield size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-foreground">Sekuritas Administrasi</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Session Timeout</label>
                                        <select 
                                            value={settings.sessionTimeout}
                                            onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                                            className="w-full bg-muted/20 border border-transparent focus:border-primary/30 rounded-2xl py-4 px-5 text-sm font-semibold outline-none transition-all text-foreground appearance-none"
                                        >
                                            <option>15 menit</option>
                                            <option>30 menit</option>
                                            <option>1 jam</option>
                                            <option>Selamanya</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">IP Whitelist</label>
                                        <input
                                            type="text"
                                            value={settings.ipWhitelist}
                                            onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
                                            className="w-full bg-muted/20 border border-transparent focus:border-primary/30 rounded-2xl py-4 px-5 text-sm font-semibold outline-none transition-all text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Log Sistem" && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
                                            <Terminal size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-foreground">Aktivitas Sistem Terakhir</h3>
                                    </div>
                                    <button 
                                        onClick={fetchLogs}
                                        disabled={isLoggingLoading}
                                        className="p-2 hover:bg-muted rounded-lg transition-all"
                                    >
                                        <RefreshCw size={18} className={cn(isLoggingLoading && "animate-spin")} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {isLoggingLoading ? (
                                        <div className="py-20 text-center font-bold text-muted-foreground uppercase tracking-widest text-[10px] animate-pulse">
                                            Sinkronisasi Log...
                                        </div>
                                    ) : systemLogs.length === 0 ? (
                                        <div className="py-20 text-center text-muted-foreground">
                                            <p className="font-bold uppercase tracking-widest text-[10px]">Belum Ada Log</p>
                                            <p className="text-xs mt-2">Seluruh aktivitas admin akan tercatat di sini.</p>
                                        </div>
                                    ) : (
                                        systemLogs.map((log, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 rounded-[1.75rem] bg-muted/20 border border-border/50 group hover:bg-muted/40 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                                        log.type === "success" ? "bg-emerald-500/10 text-emerald-500" : 
                                                        log.type === "warning" ? "bg-amber-500/10 text-amber-500" : 
                                                        "bg-blue-500/10 text-blue-500"
                                                    )}>
                                                        <Activity size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold block">{log.action}</span>
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{log.user_email || "System"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono font-bold text-foreground">
                                                        {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                                                        {new Date(log.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab !== "Log Sistem" && (
                            <div className="pt-8 flex justify-end gap-4 border-t border-border/50">
                                <button
                                    onClick={() => setMessage({ text: "Perubahan dibatalkan.", type: 'error' })}
                                    className="px-8 py-4 rounded-2xl text-sm font-black text-muted-foreground hover:bg-muted transition-all active:scale-95"
                                >
                                    Batalkan
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-10 py-4 rounded-2xl bg-primary text-white text-sm font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
