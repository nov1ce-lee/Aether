"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Boxes, Copy, Check, RefreshCw, Type, Settings, Info, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseType = 'camel' | 'snake' | 'pascal' | 'kebab' | 'constant';

interface CaseOption {
  id: CaseType;
  label: string;
  example: string;
}

const caseOptions: CaseOption[] = [
  { id: 'camel', label: '小驼峰 (camelCase)', example: 'aetherProjectTool' },
  { id: 'pascal', label: '大驼峰 (PascalCase)', example: 'AetherProjectTool' },
  { id: 'snake', label: '下划线 (snake_case)', example: 'aether_project_tool' },
  { id: 'kebab', label: '中划线 (kebab-case)', example: 'aether-project-tool' },
  { id: 'constant', label: '大写下划线 (CONSTANT_CASE)', example: 'AETHER_PROJECT_TOOL' },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<CaseType, string>>({
    camel: "",
    snake: "",
    pascal: "",
    kebab: "",
    constant: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toWords = (str: string) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_\-]/g, ' ')
      .trim()
      .split(/\s+/)
      .map(word => word.toLowerCase())
      .filter(word => word.length > 0);
  };

  const convert = (text: string) => {
    if (!text.trim()) {
      return { camel: "", snake: "", pascal: "", kebab: "", constant: "" };
    }
    const words = toWords(text);
    return {
      camel: words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(''),
      pascal: words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
      snake: words.join('_'),
      kebab: words.join('-'),
      constant: words.join('_').toUpperCase(),
    };
  };

  useEffect(() => {
    setResults(convert(input));
  }, [input]);

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-violet/10 rounded-2xl">
            <Boxes className="text-accent-violet w-10 h-10" />
          </div>
          变量命名转换器
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          在各种编程命名规范间自由切换，支持批量词组识别
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-violet tracking-widest uppercase flex items-center gap-2">
                <Settings className="w-4 h-4" /> 输入配置
              </h3>
              <button onClick={() => setInput("")} className="text-white/20 hover:text-white/60 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <label className="text-xs text-white/40 uppercase ml-1">源文本内容</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入任何命名方式的文本，例如：helloWorld 或 user_profile_image"
                className="w-full h-[250px] bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-violet/50 transition-all resize-none font-mono text-lg"
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info className="w-3 h-3" /> 提示
              </h4>
              <p className="text-[11px] text-white/30 leading-relaxed italic">
                工具会自动识别输入中的大写字母、下划线和中划线作为分隔符。
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 border-accent-violet/20">
            <h3 className="text-sm font-mono text-accent-violet tracking-widest uppercase mb-6 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> 转换结果预览
            </h3>
            
            <div className="space-y-4">
              {caseOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className={cn(
                    "glass-card p-4 flex items-center justify-between group-hover:bg-white/5 transition-all duration-300",
                    results[option.id] ? "border-accent-violet/20" : "opacity-60"
                  )}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-accent-violet tracking-widest uppercase font-black">
                          {option.label}
                        </span>
                      </div>
                      <div className="font-mono text-white text-lg break-all min-h-[1.5rem]">
                        {results[option.id] || <span className="text-white/10">{option.example}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(results[option.id], option.id)}
                      disabled={!results[option.id]}
                      className={cn(
                        "ml-4 p-3 rounded-xl transition-all duration-300 flex items-center gap-2",
                        copiedId === option.id 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-0"
                      )}
                    >
                      {copiedId === option.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tighter">Copied</span>
                        </>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="absolute -inset-0.5 bg-accent-violet/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
