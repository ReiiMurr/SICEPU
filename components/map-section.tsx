"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export function MapSection() {
    const Map = useMemo(() => dynamic(
        () => import('react-leaflet').then((mod) => mod.MapContainer),
        { 
            loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-[3rem] flex items-center justify-center font-bold text-muted-foreground uppercase tracking-widest text-xs">Peta Sedang Dimuat...</div>,
            ssr: false 
        }
    ), []);

    const TileLayer = useMemo(() => dynamic(
        () => import('react-leaflet').then((mod) => mod.TileLayer),
        { ssr: false }
    ), []);

    return (
        <section className="section-padding bg-muted/30">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 shadow-premium"
                    >
                        <MapPin size={32} />
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter"
                    >
                        Peta Wilayah
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mt-6 text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto"
                    >
                        Cakupan area operasional dan layanan kami. Kami menjangkau setiap sudut untuk transparansi yang maksimal.
                    </motion.p>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative h-[600px] w-full rounded-[3rem] lg:rounded-[4rem] overflow-hidden border border-border shadow-premium group bg-card"
                >
                    <Map
                        center={[-7.1539, 111.59]} 
                        zoom={14} 
                        scrollWheelZoom={false}
                        className="h-full w-full grayscale-[0.2] contrast-[1.1] transition-all duration-700 group-hover:grayscale-0"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </Map>
                    
                    {/* Overlay info box */}
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 z-[1000] pointer-events-none">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-card/90 backdrop-blur-xl border border-border/50 p-10 rounded-[2.5rem] max-w-md shadow-2xl pointer-events-auto transition-all group-hover:bg-card group-hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.3)]"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                <h4 className="font-black text-2xl tracking-tighter uppercase">Area Operasional</h4>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed font-medium">
                                Sistem SICEPU dirancang untuk melayani wilayah geografis yang luas. Data koordinat yang ditampilkan membantu dalam pemetaan sebaran aduan warga secara akurat.
                            </p>
                            <div className="mt-8 flex items-center gap-2">
                                <span className="inline-block w-8 h-0.5 bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Koordinat belum ditentukan</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Decorative border internal */}
                    <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none z-[1001] rounded-[3rem] lg:rounded-[4rem]" />
                </motion.div>
            </div>
        </section>
    );
}
