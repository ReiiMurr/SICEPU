"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Map,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Mountain,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Overview", icon: <LayoutDashboard size={20} />, href: "/admin" },
    { label: "Laporan", icon: <ClipboardList size={20} />, href: "/admin/reports" },
    { label: "Masyarakat", icon: <Users size={20} />, href: "/admin/users" },
    { label: "Peta Wilayah", icon: <Map size={20} />, href: "/admin/map" },
    { label: "Pengaturan", icon: <Settings size={20} />, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Role check
            const { data: profile } = await supabase
                .from("profiles")
                .select("role, full_name")
                .eq("id", user.id)
                .maybeSingle();

            const isAdminEmail = user.email === "laporin.service@gmail.com";

            if (profile?.role !== "admin" && profile?.role !== "petugas" && !isAdminEmail) {
                router.push("/");
                return;
            }

            setUser({ ...user, profile });
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    // Notifications & Realtime Logic
    useEffect(() => {
        const getReadIds = (): string[] => {
            try {
                const stored = localStorage.getItem('admin_read_notifs');
                return stored ? JSON.parse(stored) : [];
            } catch { return []; }
        };

        const fetchNewReports = async () => {
            const supabase = getSupabaseClient();
            const { data } = await supabase
                .from('complaints')
                .select('*')
                .eq('status', 'baru')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data) {
                const readIds = getReadIds();
                const unreadNotifs = data.filter((n: any) => !readIds.includes(n.id));
                setNotifications(unreadNotifs.slice(0, 5));
            }
        };

        fetchNewReports();

        const supabase = getSupabaseClient();
        const channel = supabase
            .channel('admin-notifs')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'complaints' 
            }, (payload) => {
                const readIds = getReadIds();
                if (!readIds.includes(payload.new.id)) {
                    setNotifications(prev => [payload.new, ...prev].slice(0, 5));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Handle Click Outside for Notifications
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update sidebars state on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const NavContent = () => (
        <div className="flex h-full flex-col p-4 lg:p-6">
            {/* Logo Section */}
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
                    <Mountain size={24} />
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="overflow-hidden"
                    >
                        <h1 className="whitespace-nowrap text-lg font-semibold tracking-tight leading-none">Admin Laporin</h1>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70 mt-1">Sistem Desa</p>
                    </motion.div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative flex items-center gap-4 rounded-[1.25rem] px-4 py-3.5 transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-white shadow-2xl shadow-primary/30"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary group"
                                )}
                            >
                                <div className={cn(
                                    "transition-transform",
                                    !isActive && "group-hover:scale-110"
                                )}>
                                    {item.icon}
                                </div>
                                {(isSidebarOpen || isMobileMenuOpen) && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-sm font-semibold tracking-wide"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {isActive && (isSidebarOpen || isMobileMenuOpen) && (
                                    <motion.div layoutId="active-pill" className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Sidebar */}
            <div className="mt-auto pt-6 border-t border-border/50">
                <div className="flex items-center justify-between px-2 gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        {(isSidebarOpen || isMobileMenuOpen) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                                <p className="text-sm font-bold truncate max-w-[100px]">{user.profile?.full_name || user.email?.split('@')[0]}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Administrator</p>
                            </motion.div>
                        )}
                    </div>

                    {(isSidebarOpen || isMobileMenuOpen) && (
                        <button
                            onClick={async () => {
                                const supabase = getSupabaseClient();
                                await supabase.auth.signOut();
                                router.push("/login");
                            }}
                            className="p-2.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all duration-300"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 100 }}
                className="fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-card/40 backdrop-blur-3xl lg:block transition-all duration-500"
            >
                <NavContent />
            </motion.aside>

            {/* Mobile Nav Top */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-border lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Mountain size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight leading-none uppercase">Laporin</h2>
                        <span className="text-[9px] font-bold uppercase text-primary/70 tracking-widest">Admin</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2.5 rounded-xl bg-card border border-border shadow-sm text-foreground"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[70] w-[80%] max-w-[300px] bg-card border-r border-border shadow-2xl lg:hidden"
                        >
                            <div className="absolute top-6 right-6">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <NavContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 w-full transition-all duration-500 pt-20 lg:pt-0",
                    isSidebarOpen ? "lg:ml-[280px]" : "lg:ml-[100px]"
                )}
            >
                {/* Desktop Header */}
                <header className="sticky top-0 z-30 hidden w-full border-b border-border bg-background/60 py-4 backdrop-blur-xl px-10 lg:block">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                            </button>
                            <div>
                                <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60 mb-0.5">Control Center</h2>
                                <p className="text-sm font-semibold">{pathname === "/admin" ? "DASHBOARD OVERVIEW" : pathname.split('/').pop()?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Real-time Notification Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300",
                                        notifications.length > 0 
                                            ? "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20" 
                                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    <div className="relative">
                                        <Bell size={18} className={cn(notifications.length > 0 && "animate-bounce")} />
                                        {notifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                        {notifications.length > 0 ? `${notifications.length} Alert Baru` : "Tidak Ada Alert"}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isNotifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-[360px] origin-top-right rounded-[2rem] border border-border bg-card p-4 shadow-2xl backdrop-blur-3xl z-[100]"
                                        >
                                            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 mb-4">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Notifikasi Laporan</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-[9px] font-bold text-orange-600 uppercase">Baru</span>
                                            </div>

                                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif, i) => (
                                                        <Link 
                                                            key={notif.id || i} 
                                                            href="/admin/reports"
                                                            onClick={() => {
                                                                setIsNotifOpen(false);
                                                                // Simpan ke localStorage agar tidak muncul lagi saat refresh
                                                                try {
                                                                    const stored = localStorage.getItem('admin_read_notifs');
                                                                    const readIds = stored ? JSON.parse(stored) : [];
                                                                    if (!readIds.includes(notif.id)) {
                                                                        readIds.push(notif.id);
                                                                        localStorage.setItem('admin_read_notifs', JSON.stringify(readIds));
                                                                    }
                                                                } catch (e) { console.error("LS Error:", e); }
                                                                
                                                                // Update state lokal
                                                                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-1 p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-bold truncate pr-4 group-hover:text-primary transition-colors">{notif.title || "Laporan Tanpa Judul"}</p>
                                                                    <span className="text-[9px] font-bold text-muted-foreground/60 whitespace-nowrap">
                                                                        {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground line-clamp-1">{notif.description}</p>
                                                                <div className="flex items-center gap-1.5 mt-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-600">{notif.location}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                                                            <Bell size={20} />
                                                        </div>
                                                        <p className="text-xs font-bold uppercase tracking-widest">Semua Terpantau</p>
                                                        <p className="text-[10px] mt-1">Belum ada laporan baru masuk.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {notifications.length > 0 && (
                                                <Link 
                                                    href="/admin/reports" 
                                                    className="block mt-4 text-center py-3 rounded-xl bg-muted/30 hover:bg-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary transition-all"
                                                    onClick={() => setIsNotifOpen(false)}
                                                >
                                                    Lihat Semua Laporan
                                                </Link>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-6 w-[1px] bg-border" />
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
