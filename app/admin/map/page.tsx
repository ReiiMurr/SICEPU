"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapSection } from "@/components/map-section";
import { Map, Info, Maximize2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMapPage() {
    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold tracking-tighter"
                    >
                        Peta Wilayah
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-2 font-semibold uppercase text-[10px] tracking-[0.2em] opacity-60"
                    >
                        Dashboard Geografis SICEPU
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 bg-card/40 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-[2rem] shadow-2xl shadow-primary/5"
                >
                    <div className="text-right">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-primary mb-1">Status Geospasial</p>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold uppercase tracking-widest">Sinkron</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                {/* Information Side Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-[2rem] bg-card border border-border shadow-sm space-y-6"
                    >
                        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight">Informasi Peta</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: "Layer Aktif", val: "OpenStreetMap", icon: <Layers size={14} /> },
                                { label: "Cakupan", val: "Seluruh Desa", icon: <Maximize2 size={14} /> },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 p-4 rounded-xl bg-muted/30 border border-border/50">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    <p className="text-sm font-bold">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Petunjuk Navigasi</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Gunakan mouse untuk menggeser peta. Klik kanan atau gunakan tombol zoom untuk memperjelas tampilan area tertentu.
                            </p>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10 shadow-sm"
                    >
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                <Map size={16} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Quick Stats</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Markers</span>
                                <span className="text-foreground">0 Point</span>
                            </div>
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[0%]" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Map Display Panel */}
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-card border border-border shadow-2xl relative"
                    >
                        <div className="absolute top-8 left-8 z-[1000]">
                            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-xl">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live Map Engine</span>
                            </div>
                        </div>
                        
                        {/* We use a slightly modified version of MapSection or just call it directly */}
                        <div className="h-[750px] w-full">
                            <MapSection />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
