"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Copy, Check, RefreshCw, ArrowRight, ArrowLeft,
  Info, Terminal, Globe, Calendar, Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConversionMode = "ts-to-utc" | "utc-to-ts";

interface FormatOutput {
  label: string;
  value: string;
  description: string;
}

export default function TimestampConverter() {
  const [mode, setMode] = useState<ConversionMode>("ts-to-utc");
  const [tsInput, setTsInput] = useState("");
  const [tsUnit, setTsUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [utcInput, setUtcInput] = useState("");
  const [outputs, setOutputs] = useState<FormatOutput[]>([]);
  const [error, setError] = useState("");
  const [nowTs, setNowTs] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Update "now" timestamp every second
  useEffect(() => {
    const update = () => {
      setNowTs(Math.floor(Date.now() / 1000).toString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format a Date object into multiple UTC string formats
  const formatUtcOutputs = useCallback((date: Date): FormatOutput[] => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[date.getUTCDay()];
    const monthName = months[date.getUTCMonth()];

    return [
      {
        label: "ISO 8601",
        value: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`,
        description: "国际标准格式",
      },
      {
        label: "RFC 2822",
        value: `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes}:${seconds} +0000`,
        description: "邮件/HTTP 头部格式",
      },
      {
        label: "可读格式",
        value: `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`,
        description: "便于阅读的格式",
      },
      {
        label: "日期简写",
        value: `${year}-${month}-${day}`,
        description: "仅日期部分",
      },
      {
        label: "时间简写",
        value: `${hours}:${minutes}:${seconds}`,
        description: "仅时间部分 (UTC)",
      },
    ];
  }, []);

  // Timestamp → UTC
  useEffect(() => {
    if (mode !== "ts-to-utc") return;
    setError("");

    if (!tsInput.trim()) {
      setOutputs([]);
      return;
    }

    const raw = tsInput.trim();
    // Check if it's a valid number (allow scientific notation)
    if (!/^-?\d+(\.\d+)?$/.test(raw)) {
      setError("请输入有效的数字时间戳");
      setOutputs([]);
      return;
    }

    const numVal = parseFloat(raw);
    const ms = tsUnit === "seconds" ? numVal * 1000 : numVal;

    if (ms < -8640000000000000 || ms > 8640000000000000) {
      setError("时间戳超出有效范围");
      setOutputs([]);
      return;
    }

    try {
      const date = new Date(ms);
      if (isNaN(date.getTime())) throw new Error();
      setOutputs(formatUtcOutputs(date));
    } catch {
      setError("无法解析该时间戳");
      setOutputs([]);
    }
  }, [tsInput, tsUnit, mode, formatUtcOutputs]);

  // UTC → Timestamp
  const handleUtcConvert = useCallback(() => {
    setError("");
    if (!utcInput.trim()) {
      setOutputs([]);
      return;
    }

    try {
      // Try parsing as ISO format or common date strings
      const date = new Date(utcInput.trim());
      if (isNaN(date.getTime())) throw new Error();

      const tsMs = date.getTime();
      const tsSec = Math.floor(tsMs / 1000);

      setOutputs([
        {
          label: "毫秒时间戳",
          value: tsMs.toString(),
          description: "13 位毫秒级时间戳",
        },
        {
          label: "秒级时间戳",
          value: tsSec.toString(),
          description: "10 位秒级时间戳",
        },
      ]);
    } catch {
      setError("无法解析该日期时间字符串，请尝试 ISO 8601 格式 (如 2024-01-15T08:30:00Z)");
      setOutputs([]);
    }
  }, [utcInput]);

  useEffect(() => {
    if (mode === "utc-to-ts") {
      handleUtcConvert();
    }
  }, [utcInput, mode, handleUtcConvert]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fillCurrentTs = () => {
    setTsInput(tsUnit === "seconds" ? nowTs : (parseInt(nowTs) * 1000).toString());
  };

  const fillCurrentUtc = () => {
    setUtcInput(new Date().toISOString());
  };

  const clearAll = () => {
    setTsInput("");
    setUtcInput("");
    setOutputs([]);
    setError("");
  };

  const switchMode = () => {
    setMode(mode === "ts-to-utc" ? "utc-to-ts" : "ts-to-utc");
    setTsInput("");
    setUtcInput("");
    setOutputs([]);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center lg:text-left"
      >
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-cyan/10 rounded-2xl">
            <Clock className="text-accent-cyan w-10 h-10" />
          </div>
          时间戳转换
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          在 Unix 时间戳与 UTC 日期时间之间自由转换
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Area */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Switcher */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode("ts-to-utc")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                  mode === "ts-to-utc"
                    ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-lg"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                )}
              >
                <Hash className="w-4 h-4" />
                时间戳 → UTC
              </button>
              <button
                onClick={switchMode}
                className="p-2.5 rounded-lg bg-white/5 text-white/30 hover:text-white/50 transition-all"
                title="切换方向"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode("utc-to-ts")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                  mode === "utc-to-ts"
                    ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shadow-lg"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                )}
              >
                <Globe className="w-4 h-4" />
                UTC → 时间戳
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mode: Timestamp → UTC */}
              {mode === "ts-to-utc" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-mono text-accent-cyan tracking-widest uppercase flex items-center gap-2 font-bold">
                      <Hash className="w-4 h-4" /> 输入时间戳
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={fillCurrentTs}
                        className="text-[10px] text-accent-cyan/70 hover:text-accent-cyan transition-colors uppercase font-bold"
                      >
                        填入当前
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-white/20 hover:text-white/60 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase ml-1">时间戳数值</label>
                    <input
                      type="text"
                      value={tsInput}
                      onChange={(e) => setTsInput(e.target.value)}
                      placeholder={nowTs}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-cyan/50 transition-all text-lg font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase ml-1">单位</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTsUnit("seconds")}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                          tsUnit === "seconds"
                            ? "bg-accent-cyan/20 border-accent-cyan/50 text-white"
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        秒 (10位)
                      </button>
                      <button
                        onClick={() => setTsUnit("milliseconds")}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                          tsUnit === "milliseconds"
                            ? "bg-accent-cyan/20 border-accent-cyan/50 text-white"
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        毫秒 (13位)
                      </button>
                    </div>
                  </div>

                  {/* Live now display */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-4 h-4 text-accent-cyan/60" />
                    <span className="text-sm text-white/40 font-mono">
                      当前时间戳：
                    </span>
                    <span className="text-sm text-accent-cyan font-mono font-bold">
                      {nowTs}
                    </span>
                    <span className="text-xs text-white/20">(秒)</span>
                  </div>
                </div>
              )}

              {/* Mode: UTC → Timestamp */}
              {mode === "utc-to-ts" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-mono text-accent-cyan tracking-widest uppercase flex items-center gap-2 font-bold">
                      <Globe className="w-4 h-4" /> 输入 UTC 时间
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={fillCurrentUtc}
                        className="text-[10px] text-accent-cyan/70 hover:text-accent-cyan transition-colors uppercase font-bold"
                      >
                        填入当前
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-white/20 hover:text-white/60 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase ml-1">日期时间字符串</label>
                    <input
                      type="text"
                      value={utcInput}
                      onChange={(e) => setUtcInput(e.target.value)}
                      placeholder="例如: 2024-01-15T08:30:00Z"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-cyan/50 transition-all text-lg font-mono"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> 支持的格式
                    </h4>
                    <ul className="space-y-1 text-[11px] text-white/30 leading-relaxed">
                      <li>• ISO 8601: 2024-01-15T08:30:00Z</li>
                      <li>• 完整日期: 2024-01-15 08:30:00</li>
                      <li>• RFC 2822: Mon, 15 Jan 2024 08:30:00 GMT</li>
                      <li>• 简写: 2024-01-15 (默认为 UTC 00:00)</li>
                    </ul>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-accent-cyan/20">
            <h3 className="text-sm font-mono text-accent-cyan tracking-widest uppercase mb-6 flex items-center gap-2 font-bold">
              <Terminal className="w-4 h-4" /> 转换结果
            </h3>

            {outputs.length > 0 ? (
              <div className="space-y-4">
                {outputs.map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div className="glass-card p-4 flex items-center justify-between group-hover:bg-white/5 transition-all duration-300 border-accent-cyan/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-mono text-accent-cyan tracking-widest uppercase font-black">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-white/20">
                            {item.description}
                          </span>
                        </div>
                        <div className="font-mono text-white text-lg truncate">
                          {item.value}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(item.value, item.label)}
                        className={cn(
                          "ml-4 p-3 rounded-xl transition-all duration-300 flex items-center gap-2 shrink-0",
                          copiedId === item.label
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {copiedId === item.label ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-white/10">
                {mode === "ts-to-utc" ? (
                  <>
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono italic">输入时间戳查看 UTC 时间...</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono italic">输入 UTC 时间查看对应时间戳...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="glass-card p-6">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">快速参考</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/40">
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span>1 分钟</span>
                <span className="font-mono text-white/60">60 秒</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span>1 小时</span>
                <span className="font-mono text-white/60">3,600 秒</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span>1 天</span>
                <span className="font-mono text-white/60">86,400 秒</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/5">
                <span>1 年 (约)</span>
                <span className="font-mono text-white/60">31,536,000 秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
