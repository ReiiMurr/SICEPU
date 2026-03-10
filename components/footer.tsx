"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram, MapPin, Phone, Mail, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="mt-auto border-t border-border bg-card text-muted-foreground selection:bg-primary/10">
            <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent">
                                <img src="/images/logolaporin.png" alt="SiLapor Logo" className="h-full w-full object-contain" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">SiLapor</h2>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Mewujudkan tata kelola desa yang transparan, profesional, dan responsif terhadap
                            aspirasi masyarakat demi kemajuan bersama.
                        </p>
                        <ul className="social-list">
                            <li className="instagram">
                                <a
                                    href="https://www.instagram.com/argareialdii"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} />
                                </a>
                            </li>
                            <li className="github">
                                <a
                                    href="https://github.com/ReiiMurr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Github"
                                >
                                    <Github size={18} />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div id="contact">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Kontak Kami</h3>
                        <ul className="space-y-5 text-sm">
                            <li className="flex items-start gap-3 group">
                                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <MapPin size={16} className="text-primary" />
                                </div>
                                <span className="leading-relaxed group-hover:text-foreground transition-colors">
                                    Jl. Melati No. 45, SiLapor, Kec. Jaya Makmur, Kabupaten Bogor, 16810
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <Phone size={16} className="text-primary" />
                                </div>
                                <span className="group-hover:text-foreground transition-colors">(021) 1234-5678</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <Mail size={16} className="text-primary" />
                                </div>
                                <span className="group-hover:text-foreground transition-colors">kontak@SiLapor.go.id</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Tautan Cepat</h3>
                        <ul className="space-y-4 text-sm">
                            {[
                                { label: "Tentang", href: "/tentang" },
                                { label: "Anggaran Desa", href: "#" },
                                { label: "Produk Hukum", href: "#" },
                                { label: "Layanan Umum", href: "#" },
                                { label: "Data Penduduk", href: "#" }
                            ].map((link) => (
                                <li key={link.label}>
                                    <motion.a 
                                        whileHover={{ x: 4 }} 
                                        className="inline-block transition-colors hover:text-primary font-medium" 
                                        href={link.href}
                                    >
                                        {link.label}
                                    </motion.a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Location Info */}
                    <div>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">Pusat Layanan</h3>
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border group">
                            <img
                                alt="Map location"
                                className="h-full w-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN2cLedlFTITzw3ql_eIKaB-b9XbfWU9464a3blpZAKLP4UE9VD2m6LQaG1dIklLgz0qNjnnS7ZYX51rjKoymFdUseSLKOCSMFSXQ0IBDcSMCaqG7L__W6tQIJvYrYZSIAFO5_o6KffTqjOQq6FaFboLGjdR8kHA_Ruwmgg3uo8vLFcEnns5dJp8nsWRNLMRdKPpalZWQ"
                            />
                            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
                    <p>© 2024 Pemerintah SiLapor. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
