"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Boxes, Zap, Shield, Database } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-rose rounded-full blur-3xl opacity-10 animate-pulse" />
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-white relative leading-none">
          Aether
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
        className="text-xl md:text-2xl text-white/40 max-w-2xl font-medium tracking-tight mb-16"
      >
        简单、实用的开发者工具集合
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4"
      >
        <ToolCard
          href="/docker"
          icon={<Terminal className="w-7 h-7" />}
          title="Docker 指令生成"
          description={"快速生成常用的 Docker\n运行、构建与管理指令"}
          color="cyan"
        />
        <ToolCard
          href="/sql-generator"
          icon={<Database className="w-7 h-7" />}
          title="SQL 指令生成"
          description={"解析建表语句快速生成\nSELECT、WHERE 等查询"}
          color="emerald"
        />
        <ToolCard
          href="/case-converter"
          icon={<Boxes className="w-7 h-7" />}
          title="变量命名转换"
          description={"支持驼峰、下划线、中划线等\n多种命名规范的互转"}
          color="violet"
        />
        <ToolCard
          href="/git-scribe"
          icon={<Zap className="w-7 h-7" />}
          title="Git 提交规范"
          description={"通过描述自动生成符合规范的\nGit Commit 信息"}
          color="amber"
        />
        <ToolCard
          href="/data-forge"
          icon={<Shield className="w-7 h-7" />}
          title="数据加解密"
          description={"支持文本加解密以及二进制\n.dat 档案的解析与修改"}
          color="rose"
        />
      </motion.div>
    </div>
  );
}

function ToolCard({ 
  href, 
  icon, 
  title, 
  description, 
  color, 
  disabled = false 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  disabled?: boolean;
}) {
  const colorMap = {
    cyan: 'text-accent-cyan border-accent-cyan/20 group-hover:border-accent-cyan/50',
    violet: 'text-accent-violet border-accent-violet/20 group-hover:border-accent-violet/50',
    emerald: 'text-accent-emerald border-accent-emerald/20 group-hover:border-accent-emerald/50',
    amber: 'text-accent-amber border-accent-amber/20 group-hover:border-accent-amber/50',
    rose: 'text-accent-rose border-accent-rose/20 group-hover:border-accent-rose/50',
  };
  
  const iconColorClass = colorMap[color].split(' ')[0];
  const borderColorClass = colorMap[color].split(' ').slice(1).join(' ');
  
  return (
    <Link 
      href={disabled ? "#" : href}
      className={`group relative glass-card p-8 rounded-[2rem] transition-all duration-500 overflow-hidden border-2 ${disabled ? 'opacity-50 cursor-not-allowed' : `hover:scale-[1.03] hover:bg-white/[0.07] ${borderColorClass}`}`}
    >
      <div className={`mb-6 ${iconColorClass} group-hover:scale-110 transition-transform duration-500 ease-out`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-glow transition-all duration-300">
        {title}
      </h3>
      <p className="text-white/40 text-base leading-relaxed whitespace-pre-line font-medium group-hover:text-white/60 transition-colors duration-300">
        {description}
      </p>
      
      {!disabled && (
        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">
          <ArrowRight className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      )}

      {disabled && (
        <div className="absolute top-6 right-8 text-[10px] font-mono tracking-widest text-white/20 uppercase font-bold">
          Coming Soon
        </div>
      )}
      
      {/* Subtle glow effect on hover */}
      <div className={`absolute -inset-20 bg-gradient-to-br from-transparent via-transparent to-${color === 'cyan' ? 'accent-cyan' : color === 'violet' ? 'accent-violet' : color === 'emerald' ? 'accent-emerald' : color === 'amber' ? 'accent-amber' : 'accent-rose'}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
    </Link>
  );
}
