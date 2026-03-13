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
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronLeft,
    ChevronRight,
    Map,
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
        <div className="flex h-full flex-col p-5">
            {/* Logo Section */}
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-transparent">
                    <img src="/images/logolaporin.png" alt="Laporin Logo" className="h-full w-full object-contain" />
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="overflow-hidden"
                    >
                        <h1 className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 dark:text-white">Laporin Admin</h1>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Digital Portal</p>
                    </motion.div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors duration-200",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                )}
                            >
                                <div className="shrink-0">
                                    {item.icon}
                                </div>
                                {(isSidebarOpen || isMobileMenuOpen) && (
                                    <span className="text-sm font-medium tracking-tight">
                                        {item.label}
                                    </span>
                                )}
                            </div>
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
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{user.profile?.full_name || user.email?.split('@')[0]}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Main Administrator</p>
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
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
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
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-white dark:bg-slate-950 lg:block transition-all duration-300"
            >
                <NavContent />
            </motion.aside>

            {/* Mobile Nav Top */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-border lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent">
                        <img src="/images/logolaporin.png" alt="Laporin Logo" className="h-full w-full object-contain" />
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
                    "flex-1 w-full transition-all duration-300 pt-16 lg:pt-0",
                    isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-[80px]"
                )}
            >
                {/* Desktop Header */}
                <header className="sticky top-0 z-30 hidden w-full border-b border-border bg-white/80 dark:bg-slate-950/80 py-3 backdrop-blur-md px-8 lg:block">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                            >
                                {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                            </button>
                            <div className="h-4 w-[1px] bg-border mx-2" />
                            <div>
                                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {pathname === "/admin" ? "SISTEM OVERVIEW" : pathname.split('/').pop()?.toUpperCase()}
                                </h2>
                            </div>
                        </div>
                       <div className="flex items-center gap-6">
                            {/* Real-time Notification Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className={cn(
                                        "relative flex items-center justify-center w-9 h-9 rounded-lg border transition-colors",
                                        notifications.length > 0 
                                            ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                                    )}
                                >
                                    <Bell size={18} />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_#fff] dark:shadow-[0_0_0_2px_#020617]" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-border bg-white dark:bg-slate-950 p-3 shadow-xl z-[100]"
                                        >
                                            <div className="flex items-center justify-between px-2 py-2 border-b border-border/50 mb-3">
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notifikasi Laporan</h3>
                                                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-[9px] font-bold text-emerald-600 uppercase">Baru</span>
                                            </div>

                                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif, i) => (
                                                        <Link 
                                                            key={notif.id || i} 
                                                            href="/admin/reports"
                                                            onClick={() => {
                                                                setIsNotifOpen(false);
                                                                try {
                                                                    const stored = localStorage.getItem('admin_read_notifs');
                                                                    const readIds = stored ? JSON.parse(stored) : [];
                                                                    if (!readIds.includes(notif.id)) {
                                                                        readIds.push(notif.id);
                                                                        localStorage.setItem('admin_read_notifs', JSON.stringify(readIds));
                                                                    }
                                                                } catch (e) { console.error("LS Error:", e); }
                                                                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent transition-all group">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-4 group-hover:text-primary transition-colors">{notif.title || "Laporan Tanpa Judul"}</p>
                                                                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                                                        {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 line-clamp-1">{notif.description}</p>
                                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                    <p className="text-[8px] font-bold uppercase tracking-wider text-amber-600">{notif.location}</p>
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
                                                    className="block mt-3 text-center py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-primary text-slate-600 dark:text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
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
