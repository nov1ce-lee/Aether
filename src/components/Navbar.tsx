"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, Home, Terminal, Zap, Shield, Database, Clock, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { name: "首页", href: "/", icon: Home, color: "text-white" },
  { name: "Docker", href: "/docker", icon: Terminal, color: "text-accent-cyan" },
  { name: "SQL", href: "/sql-generator", icon: Database, color: "text-accent-emerald" },
  { name: "命名", href: "/case-converter", icon: Boxes, color: "text-accent-violet" },
  { name: "时间戳", href: "/timestamp", icon: Clock, color: "text-accent-indigo" },
  { name: "Git", href: "/git-scribe", icon: Zap, color: "text-accent-amber" },
  { name: "数据", href: "/data-forge", icon: Shield, color: "text-accent-rose" },
];

function matchPath(pathname: string, href: string): boolean {
  // Handle trailingSlash: compare with and without trailing /
  if (href === "/") return pathname === "/";
  return pathname === href || pathname === href + "/";
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { theme, toggle } = useTheme();
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovered = useRef(false);

  // On route change: homepage → always show; tool page → show briefly then hide
  useEffect(() => {
    if (isHome) {
      setHidden(false);
    } else {
      // Show the navbar, then auto-hide after a delay
      setHidden(false);
      hovered.current = false;
      hideTimer.current = setTimeout(() => {
        if (!hovered.current) setHidden(true);
      }, 2000);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, isHome]);

  const handleMouseEnter = () => {
    hovered.current = true;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHidden(false);
  };

  const handleMouseLeave = () => {
    hovered.current = false;
    if (isHome) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hovered.current) setHidden(true);
    }, 1500);
  };

  // Hidden: slide down so ~24px peeks above the bottom edge
  const yOffset = isHome ? 0 : (hidden ? 24 : 0);

  return (
    <motion.nav
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 glass flex items-center gap-1 p-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: yOffset,
        opacity: isHome ? 1 : (hidden ? 0.2 : 1),
      }}
      transition={{
        type: "spring",
        damping: 26,
        stiffness: 200,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {navItems.map((item) => {
        const isActive = matchPath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group",
              isActive
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-all duration-300",
                isActive ? item.color : ""
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {item.name}
            </span>
          </Link>
        );
      })}

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300"
        title={theme === "dark" ? "切换到日间模式" : "切换到夜间模式"}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    </motion.nav>
  );
}
