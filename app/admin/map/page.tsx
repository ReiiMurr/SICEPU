"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapSection } from "@/components/map-section";
import { Map, Info, Maximize2, Layers, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMapPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Peta Wilayah</h1>
                    <p className="text-sm text-slate-500 mt-1">Dashboard Geografis SiLapor - Visualisasi data spasial desa.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-lg border border-border shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Sinkronasi Geospasial Berlaku</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Information Side Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                            <Info size={16} className="text-slate-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Informasi Peta</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                {[
                                    { label: "Layer Aktif", val: "OpenStreetMap", icon: <Layers size={14} /> },
                                    { label: "Cakupan", val: "Seluruh Desa", icon: <Maximize2 size={14} /> },
                                ].map((item, i) => (
                                    <div key={i} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-border">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                            {item.icon}
                                            {item.label}
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
                                <div className="flex gap-3">
                                    <Compass size={16} className="text-blue-600 mt-0.5" />
                                    <p className="text-[10px] font-bold text-blue-600/80 leading-relaxed uppercase tracking-tight">
                                        Gunakan mouse untuk navigasi. Klik pada marker untuk detail laporan wilayah.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Display Panel */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden relative">
                        {/* Map Overlay Badge */}
                        <div className="absolute top-4 left-4 z-[1000]">
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border shadow-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-200">Live Map Engine</span>
                            </div>
                        </div>
                        
                        <div className="h-[680px] w-full">
                            <MapSection />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
