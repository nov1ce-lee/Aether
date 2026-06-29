"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Copy, Check, RefreshCw, ArrowRight,
  Info, Terminal, Globe, Calendar, Hash, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

// Timezone data: offset in hours, label, regions
const TIMEZONES = [
  { offset: -12, label: "UTC-12", regions: "美国贝克岛" },
  { offset: -11, label: "UTC-11", regions: "美属萨摩亚、纽埃" },
  { offset: -10, label: "UTC-10", regions: "美国夏威夷、法属波利尼西亚" },
  { offset: -9, label: "UTC-9", regions: "美国阿拉斯加(部分)" },
  { offset: -8, label: "UTC-8", regions: "美国洛杉矶、加拿大温哥华" },
  { offset: -7, label: "UTC-7", regions: "美国丹佛、加拿大卡尔加里" },
  { offset: -6, label: "UTC-6", regions: "墨西哥城、美国芝加哥" },
  { offset: -5, label: "UTC-5", regions: "美国纽约、加拿大渥太华、秘鲁" },
  { offset: -4, label: "UTC-4", regions: "智利、委内瑞拉、加拿大大西洋" },
  { offset: -3, label: "UTC-3", regions: "巴西、阿根廷、格陵兰" },
  { offset: -2, label: "UTC-2", regions: "南乔治亚岛" },
  { offset: -1, label: "UTC-1", regions: "亚速尔群岛、佛得角" },
  { offset: 0, label: "UTC+0", regions: "英国伦敦、葡萄牙、冰岛" },
  { offset: 1, label: "UTC+1", regions: "法国巴黎、德国柏林、意大利罗马" },
  { offset: 2, label: "UTC+2", regions: "希腊雅典、芬兰、南非、以色列" },
  { offset: 3, label: "UTC+3", regions: "俄罗斯莫斯科、沙特阿拉伯、肯尼亚" },
  { offset: 4, label: "UTC+4", regions: "阿联酋迪拜、阿塞拜疆" },
  { offset: 5, label: "UTC+5", regions: "巴基斯坦、马尔代夫" },
  { offset: 5.5, label: "UTC+5:30", regions: "印度" },
  { offset: 6, label: "UTC+6", regions: "孟加拉国、哈萨克斯坦(东部)" },
  { offset: 7, label: "UTC+7", regions: "泰国、越南、印尼雅加达" },
  { offset: 8, label: "UTC+8", regions: "中国、新加坡、马来西亚、菲律宾" },
  { offset: 9, label: "UTC+9", regions: "日本、韩国" },
  { offset: 9.5, label: "UTC+9:30", regions: "澳大利亚达尔文" },
  { offset: 10, label: "UTC+10", regions: "澳大利亚悉尼、巴布亚新几内亚" },
  { offset: 11, label: "UTC+11", regions: "所罗门群岛、瓦努阿图" },
  { offset: 12, label: "UTC+12", regions: "新西兰、斐济" },
  { offset: 13, label: "UTC+13", regions: "汤加、萨摩亚" },
];

type ConversionMode = "ts-to-datetime" | "datetime-to-ts";

interface FormatOutput {
  label: string;
  value: string;
  description: string;
}

export default function TimestampConverter() {
  const [mode, setMode] = useState<ConversionMode>("ts-to-datetime");
  const [tsInput, setTsInput] = useState("");
  const [tsUnit, setTsUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [datetimeInput, setDatetimeInput] = useState("");
  const [timezoneOffset, setTimezoneOffset] = useState(8); // Default UTC+8 (China)
  const [outputs, setOutputs] = useState<FormatOutput[]>([]);
  const [error, setError] = useState("");
  const [nowTs, setNowTs] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTz, setExpandedTz] = useState(false);

  // Update "now" timestamp every second
  useEffect(() => {
    const update = () => {
      setNowTs(Math.floor(Date.now() / 1000).toString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // When unit changes, convert the input value
  const prevUnit = useRef(tsUnit);
  useEffect(() => {
    if (tsUnit === prevUnit.current) return;
    const old = prevUnit.current;
    prevUnit.current = tsUnit;

    if (!tsInput.trim()) return;
    const numVal = parseFloat(tsInput);
    if (isNaN(numVal)) return;

    if (old === "seconds" && tsUnit === "milliseconds") {
      setTsInput((numVal * 1000).toString());
    } else if (old === "milliseconds" && tsUnit === "seconds") {
      setTsInput(Math.floor(numVal / 1000).toString());
    }
  }, [tsUnit]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTz = useMemo(() => TIMEZONES.find(tz => tz.offset === timezoneOffset) || TIMEZONES[0], [timezoneOffset]);

  // Convert a Date to the selected timezone and format
  const formatDatetimeOutputs = useCallback((date: Date): FormatOutput[] => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const offsetMs = timezoneOffset * 60 * 60 * 1000;
    const localDate = new Date(date.getTime() + offsetMs);

    const year = localDate.getUTCFullYear();
    const month = pad(localDate.getUTCMonth() + 1);
    const day = pad(localDate.getUTCDate());
    const hours = pad(localDate.getUTCHours());
    const minutes = pad(localDate.getUTCMinutes());
    const seconds = pad(localDate.getUTCSeconds());
    const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[localDate.getUTCDay()];
    const monthName = months[localDate.getUTCMonth()];

    const tzLabel = selectedTz.label.replace("UTC", "");

    return [
      {
        label: "完整格式",
        value: `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${selectedTz.label}`,
        description: `${selectedTz.regions}`,
      },
      {
        label: "ISO 8601",
        value: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${tzLabel}`,
        description: "国际标准格式",
      },
      {
        label: "日期简写",
        value: `${year}-${month}-${day}`,
        description: "仅日期部分",
      },
      {
        label: "时间简写",
        value: `${hours}:${minutes}:${seconds}`,
        description: "仅时间部分",
      },
      {
        label: "UTC 时间",
        value: `${pad(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC+0`,
        description: "UTC 零时区参考",
      },
    ];
  }, [timezoneOffset, selectedTz]);

  // Timestamp → Datetime
  useEffect(() => {
    if (mode !== "ts-to-datetime") return;
    setError("");

    if (!tsInput.trim()) {
      setOutputs([]);
      return;
    }

    const raw = tsInput.trim();
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
      setOutputs(formatDatetimeOutputs(date));
    } catch {
      setError("无法解析该时间戳");
      setOutputs([]);
    }
  }, [tsInput, tsUnit, mode, timezoneOffset, formatDatetimeOutputs]);

  // Datetime → Timestamp
  const handleDatetimeConvert = useCallback(() => {
    setError("");
    if (!datetimeInput.trim()) {
      setOutputs([]);
      return;
    }

    try {
      const date = new Date(datetimeInput.trim());
      if (isNaN(date.getTime())) throw new Error();

      // Account for the selected timezone offset — the parsed date is treated as UTC by JS
      const offsetMs = timezoneOffset * 60 * 60 * 1000;
      const utcMs = date.getTime() - offsetMs;
      const tsMs = utcMs;
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
      setError("无法解析该日期时间字符串，请使用 ISO 8601 或常用格式");
      setOutputs([]);
    }
  }, [datetimeInput, timezoneOffset]);

  useEffect(() => {
    if (mode === "datetime-to-ts") {
      handleDatetimeConvert();
    }
  }, [datetimeInput, mode, handleDatetimeConvert]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fillCurrentTs = () => {
    setTsInput(tsUnit === "seconds" ? nowTs : (parseInt(nowTs) * 1000).toString());
  };

  const fillCurrentDatetime = () => {
    setDatetimeInput(new Date().toISOString().replace("Z", ""));
  };

  const clearAll = () => {
    setTsInput("");
    setDatetimeInput("");
    setOutputs([]);
    setError("");
  };

  const switchMode = () => {
    setMode(mode === "ts-to-datetime" ? "datetime-to-ts" : "ts-to-datetime");
    setTsInput("");
    setDatetimeInput("");
    setOutputs([]);
    setError("");
  };

  // Format the offset display nicely
  const formatOffset = (offset: number) => {
    if (offset === 0) return "UTC+0";
    const sign = offset > 0 ? "+" : "";
    const hours = Math.floor(Math.abs(offset));
    const mins = Math.abs(offset) % 1;
    if (mins === 0.5) return `UTC${sign}${hours}:30`;
    return `UTC${sign}${hours}`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center lg:text-left"
      >
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-indigo/10 rounded-2xl">
            <Clock className="text-accent-indigo w-10 h-10" />
          </div>
          时间戳转换
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          Unix 时间戳与全球时区时间互转，支持秒/毫秒切换
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Area */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Switcher */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("ts-to-datetime")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                  mode === "ts-to-datetime"
                    ? "bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 shadow-lg"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                )}
              >
                <Hash className="w-4 h-4" />
                时间戳 → 日期
              </button>
              <button
                onClick={switchMode}
                className="p-2.5 rounded-lg bg-white/5 text-white/30 hover:text-white/50 transition-all shrink-0"
                title="切换方向"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode("datetime-to-ts")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                  mode === "datetime-to-ts"
                    ? "bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 shadow-lg"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                )}
              >
                <Globe className="w-4 h-4" />
                日期 → 时间戳
              </button>
            </div>
          </div>

          {/* Timezone Selector */}
          <div className="glass-card p-5 space-y-3 border-accent-indigo/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-accent-indigo tracking-widest uppercase flex items-center gap-2 font-bold">
                <MapPin className="w-4 h-4" /> 目标时区
              </h3>
              <button
                onClick={() => setExpandedTz(!expandedTz)}
                className="text-[10px] text-accent-indigo/60 hover:text-accent-indigo transition-colors uppercase font-bold"
              >
                {expandedTz ? "收起" : "展开全部"}
              </button>
            </div>

            {/* Current selection */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20">
              <span className="text-base font-mono text-accent-indigo font-bold">
                {selectedTz.label}
              </span>
              <span className="text-xs text-white/50">
                {selectedTz.regions}
              </span>
            </div>

            {/* Expanded timezone grid */}
            <AnimatePresence>
              {expandedTz && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar pt-2">
                    {TIMEZONES.map((tz) => (
                      <button
                        key={tz.offset}
                        onClick={() => { setTimezoneOffset(tz.offset); setExpandedTz(false); }}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg text-xs transition-all",
                          timezoneOffset === tz.offset
                            ? "bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 font-bold"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <span className="font-mono">{tz.label}</span>
                        <span className="ml-2 text-[10px] text-white/20 truncate block">
                          {tz.regions}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mode: Timestamp → Datetime */}
              {mode === "ts-to-datetime" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-mono text-accent-indigo tracking-widest uppercase flex items-center gap-2 font-bold">
                      <Hash className="w-4 h-4" /> 输入时间戳
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={fillCurrentTs}
                        className="text-[10px] text-accent-indigo/70 hover:text-accent-indigo transition-colors uppercase font-bold"
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
                      placeholder={tsUnit === "seconds" ? nowTs : (parseInt(nowTs || "0") * 1000).toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-indigo/50 transition-all text-lg font-mono"
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
                            ? "bg-accent-indigo/20 border-accent-indigo/50 text-white"
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        秒（10 位）
                      </button>
                      <button
                        onClick={() => setTsUnit("milliseconds")}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                          tsUnit === "milliseconds"
                            ? "bg-accent-indigo/20 border-accent-indigo/50 text-white"
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        毫秒（13 位）
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Mode: Datetime → Timestamp */}
              {mode === "datetime-to-ts" && (
                <div className="glass-card p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-mono text-accent-indigo tracking-widest uppercase flex items-center gap-2 font-bold">
                      <Globe className="w-4 h-4" /> 输入日期时间
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={fillCurrentDatetime}
                        className="text-[10px] text-accent-indigo/70 hover:text-accent-indigo transition-colors uppercase font-bold"
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
                    <label className="text-xs text-white/40 uppercase ml-1">
                      日期时间字符串（{selectedTz.label}）
                    </label>
                    <input
                      type="text"
                      value={datetimeInput}
                      onChange={(e) => setDatetimeInput(e.target.value)}
                      placeholder="例如: 2024-01-15 08:30:00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-indigo/50 transition-all text-lg font-mono"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> 支持的格式
                    </h4>
                    <ul className="space-y-1 text-[11px] text-white/30 leading-relaxed">
                      <li>• 完整格式: 2024-01-15 08:30:00</li>
                      <li>• ISO 8601: 2024-01-15T08:30:00</li>
                      <li>• 简写: 2024-01-15（默认 00:00）</li>
                      <li className="text-accent-indigo/40">• 输入时间将被视为所选时区时间</li>
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
          <div className="glass-card p-6 border-accent-indigo/20">
            <h3 className="text-sm font-mono text-accent-indigo tracking-widest uppercase mb-6 flex items-center gap-2 font-bold">
              <Terminal className="w-4 h-4" /> 转换结果
            </h3>

            {outputs.length > 0 ? (
              <div className="space-y-3">
                {outputs.map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div className="glass-card p-4 flex items-center justify-between group-hover:bg-white/5 transition-all duration-300 border-accent-indigo/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-mono text-accent-indigo tracking-widest uppercase font-black">
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
                {mode === "ts-to-datetime" ? (
                  <>
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono italic">输入时间戳查看对应时区时间...</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono italic">输入日期时间查看对应时间戳...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="glass-card p-6">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">快速参考</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-white/40">
              <div className="flex flex-col items-center p-3 rounded-lg bg-white/5">
                <span>1 分钟</span>
                <span className="font-mono text-white/60">60 秒</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-white/5">
                <span>1 小时</span>
                <span className="font-mono text-white/60">3,600 秒</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-white/5">
                <span>1 天</span>
                <span className="font-mono text-white/60">86,400 秒</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-white/5">
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
