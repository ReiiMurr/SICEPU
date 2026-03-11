"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutList, 
  Plus, 
  ClipboardList, 
  Info 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Beranda", icon: <Home size={22} />, href: "/" },
  { label: "Laporan", icon: <LayoutList size={22} />, href: "/laporan" },
  { label: "Lapor", icon: <Plus size={24} />, href: "/aduan/buat", isCenter: true },
  { label: "Aduanku", icon: <ClipboardList size={22} />, href: "/aduan" },
  { label: "Tentang", icon: <Info size={22} />, href: "/tentang" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Hide on admin routes and auth pages
  const isExcluded = 
    pathname.startsWith("/admin") || 
    pathname === "/login" || 
    pathname === "/register";

  if (isExcluded) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-10 pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      <nav className="relative mx-auto max-w-md pointer-events-auto">
        <div className="bg-card/80 backdrop-blur-xl flex items-center justify-around px-2 py-3 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/50">
          {NAV_ITEMS.map((item) => {
            const isActive = item.isCenter 
              ? pathname === item.href 
              : (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

            if (item.isCenter) {
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="relative -top-10 group"
                >
                  <div className="bg-primary text-white p-5 rounded-full shadow-[0_10px_20px_rgba(16,185,129,0.3)] border-4 border-background group-active:scale-90 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">{item.label}</span>
                  </div>
                </Link>
              );
            }

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-300",
                  isActive ? "text-primary bg-primary/5" : "text-muted-foreground/60 active:scale-95"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
                  className="relative"
                >
                  {item.icon}
                </motion.div>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest transition-all",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

