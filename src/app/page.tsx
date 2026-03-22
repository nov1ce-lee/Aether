"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Boxes, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full blur-2xl opacity-20 animate-pulse" />
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white mb-4 relative">
          AETHER
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-xl md:text-2xl text-white/60 max-w-2xl font-light tracking-wide mb-12"
      >
        <span className="text-white font-medium">实验性工具站，简单、实用的开发者工具集合</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
      >
        <ToolCard
          href="/docker"
          icon={<Terminal className="w-6 h-6" />}
          title="Docker 指令生成"
          description={"快速生成常用的 Docker\n运行、构建与管理指令"}
          color="cyan"
        />
        <ToolCard
          href="/case-converter"
          icon={<Boxes className="w-6 h-6" />}
          title="变量命名转换"
          description={"支持驼峰、下划线、中划线等\n多种命名规范的互转"}
          color="violet"
        />
        <ToolCard
          href="/git-scribe"
          icon={<Zap className="w-6 h-6" />}
          title="Git 提交规范"
          description={"通过描述自动生成符合规范的\nGit Commit 信息"}
          color="cyan"
        />
        <ToolCard
          href="/data-forge"
          icon={<Shield className="w-6 h-6" />}
          title="数据加解密"
          description={"支持文本加解密以及二进制\n.dat 档案的解析与修改"}
          color="violet"
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
  color: 'cyan' | 'violet';
  disabled?: boolean;
}) {
  const colorClass = color === 'cyan' ? 'text-accent-cyan' : 'text-accent-violet';
  
  return (
    <Link 
      href={disabled ? "#" : href}
      className={`group relative glass-card p-6 rounded-2xl transition-all duration-500 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:bg-white/5'}`}
    >
      <div className={`mb-4 ${colorClass} group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-glow transition-all">
        {title}
      </h3>
      <p className="text-white/40 text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
      
      {!disabled && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          <ArrowRight className={`w-5 h-5 ${colorClass}`} />
        </div>
      )}

      {disabled && (
        <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-white/20 uppercase">
          Coming Soon
        </div>
      )}
    </Link>
  );
}
