"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

interface VillageOfficialCardProps {
    name: string;
    role: string;
    image: string;
}

export function VillageOfficialCard({ name, role, image }: VillageOfficialCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative h-[450px] w-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2"
        >
            {/* Image with subtle zoom on hover */}
            <div className="h-full w-full overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 group-hover:via-black/40" />

            {/* Information Section */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-md ">
                        <User size={12} />
                        Aparat Desa
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                        {name}
                    </h3>
                    <p className="text-lg font-medium text-slate-300/90">
                        {role}
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
