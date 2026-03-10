"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
    RefreshCw,
    UserPlus,
    Users,
    UserCheck,
    ShieldAlert,
    Search,
    User,
    Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserProfile = {
    id: string;
    full_name: string | null;
    role: string;
    created_at: string;
    email?: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        activeToday: 0,
        suspended: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (profiles) {
                const masyarakatOnly = profiles.filter(p => p.role !== "admin" && p.role !== "petugas");
                setUsers(masyarakatOnly as UserProfile[]);

                setStats({
                    total: masyarakatOnly.length,
                    activeToday: masyarakatOnly.filter((p: any) => {
                        const today = new Date().toISOString().split('T')[0];
                        return p.created_at.startsWith(today);
                    }).length,
                    suspended: 0
                });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (u.id.toLowerCase()).includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Data Masyarakat</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola akun dan pantau profil warga terdaftar.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchUsers} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-border shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <RefreshCw size={16} className="text-slate-600" />
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all">
                        <UserPlus size={14} />
                        Tambah Petugas
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{loading ? "..." : stats.total}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Warga Terdaftar</p>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{loading ? "..." : stats.activeToday}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pendaftar Baru</p>
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{loading ? "..." : stats.suspended}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Akun Ditangguhkan</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="search-users"
                            name="search-users"
                            type="text"
                            placeholder="Cari nama atau ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-border rounded-lg py-2 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Profil Pengguna</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID Unik</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Peran</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Bergabung</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                             {loading ? (
                                 [1, 2, 3].map(i => (
                                     <tr key={i}><td colSpan={5} className="p-8 text-center animate-pulse"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full max-w-md mx-auto" /></td></tr>
                                 ))
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400"><div className="flex flex-col items-center"><Inbox size={32} className="mb-3 opacity-20" /><p className="text-xs font-bold uppercase tracking-widest">Tidak ada data ditemukan</p></div></td></tr>
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs border border-border">
                                                {u.full_name?.[0] || <User size={14} />}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{u.full_name || "Tanpa Nama"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono font-medium text-slate-400">{u.id.toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                                            u.role === "admin" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                u.role === "petugas" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-slate-50 text-slate-500 border-slate-200"
                                        )}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500">
                                        {new Date(u.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                     <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Aktif</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
