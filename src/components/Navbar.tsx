"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, Home, Terminal, Zap, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "首页", href: "/", icon: Home, color: "text-accent-cyan" },
  { name: "Docker", href: "/docker", icon: Terminal, color: "text-accent-cyan" },
  { name: "SQL 生成", href: "/sql-generator", icon: Database, color: "text-accent-emerald" },
  { name: "命名转换", href: "/case-converter", icon: Boxes, color: "text-accent-violet" },
  { name: "Git 提交", href: "/git-scribe", icon: Zap, color: "text-accent-amber" },
  { name: "数据工具", href: "/data-forge", icon: Shield, color: "text-accent-rose" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="glass flex items-center gap-1 p-2 px-3"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group",
                isActive ? "text-white" : "text-white/50 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-4 h-4", isActive ? item.color : "group-hover:scale-110 transition-transform")} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
