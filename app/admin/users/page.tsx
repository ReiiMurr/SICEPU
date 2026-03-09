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
    Edit2,
    Ban,
    User
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

            // Note: We can only fetch auth.users if we have service_role,
            // but we can fetch profiles. 
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (profiles) {
                // In a real app, you might need a secondary join or 
                // store email in profile for easy admin viewing if not using service_role
                setUsers(profiles as UserProfile[]);

                setStats({
                    total: profiles.length,
                    activeToday: profiles.filter(p => {
                        const today = new Date().toISOString().split('T')[0];
                        return p.created_at.startsWith(today);
                    }).length,
                    suspended: 0 // Logic for suspension could be added here
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-foreground">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Masyarakat</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-1">Kelola akun dan pantau profil warga terdaftar.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchUsers} className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-colors text-muted-foreground shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none">
                        <UserPlus size={16} />
                        Tambah Petugas
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">{loading ? "..." : stats.total}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Warga Terdaftar</p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">{loading ? "..." : stats.activeToday}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Pendaftar Baru</p>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">{loading ? "..." : stats.suspended}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Akun Ditangguhkan</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-card">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <input
                            type="text"
                            placeholder="Cari nama atau ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-muted/30 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 text-foreground"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profil Pengguna</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID Unik</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Peran</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Bergabung</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center font-semibold text-muted-foreground">Memuat data warga...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center font-semibold text-muted-foreground">Tidak ada data warga ditemukan.</td></tr>
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/10 transition-transform group-hover:scale-110 shadow-sm">
                                                {u.full_name?.[0] || <User size={16} />}
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{u.full_name || "Tanpa Nama"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-mono font-medium text-muted-foreground">{u.id.slice(0, 13)}...</td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                            u.role === "admin" ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
                                                u.role === "petugas" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                    "bg-muted/50 text-muted-foreground border-border"
                                        )}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center text-xs font-semibold text-muted-foreground/70">
                                        {new Date(u.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10")} />
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Aktif</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right flex items-center justify-end gap-1">
                                        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                            <Ban size={16} />
                                        </button>
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
