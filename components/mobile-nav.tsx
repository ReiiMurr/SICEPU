"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, FileText, PlusCircle, History, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Laporan", href: "/laporan", icon: FileText },
  { name: "Lapor", href: "/aduan/buat", icon: PlusCircle, isCenter: true },
  { name: "Aduanku", href: "/aduan", icon: History },
  { name: "Tentang", href: "/tentang", icon: Info },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on admin, login, or register pages
  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" />
      
      <div className="relative flex items-center justify-around h-20 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 border-4 border-background"
                >
                  <item.icon size={28} />
                </motion.div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-2 transition-all relative"
            >
              <motion.div
                animate={isActive ? { y: -2 } : { y: 0 }}
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground/60"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                isActive ? "text-primary opacity-100" : "text-muted-foreground/60 opacity-100"
              )}>
                {item.name}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
