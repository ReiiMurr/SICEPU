"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle2, X, RefreshCw } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    complaint_id?: string;
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data, error } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(10);
                
                if (data) setNotifications(data);
            }
        };

        fetchNotifications();

        // Subscribe to changes
        const supabase = getSupabaseClient();
        const channel = supabase
            .channel("notifications_sync")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async (id: string) => {
        const supabase = getSupabaseClient();
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllAsRead = async () => {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                        >
                            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity"
                                    >
                                        Tandai Semua Dibaca
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[380px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-10 text-center"><RefreshCw size={24} className="animate-spin text-slate-300 mx-auto" /></div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                            <Bell size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Belum ada notifikasi</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {notifications.map((n) => (
                                            <div 
                                                key={n.id} 
                                                className={cn(
                                                    "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group",
                                                    !n.is_read && "bg-blue-50/30 dark:bg-blue-500/5"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                                        n.type === "success" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-blue-50 text-blue-500 border-blue-100"
                                                    )}>
                                                        {n.type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
                                                    </div>
                                                    <div className="space-y-1 pr-4">
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{n.title}</h4>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">{n.message}</p>
                                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                            {new Date(n.created_at).toLocaleDateString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <button 
                                                        onClick={() => markAsRead(n.id)}
                                                        className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                {n.complaint_id && (
                                                    <Link 
                                                        href={`/aduan?id=${n.complaint_id}`}
                                                        onClick={() => { setIsOpen(false); markAsRead(n.id); }}
                                                        className="absolute inset-0 z-0"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
