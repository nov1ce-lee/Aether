"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Copy, Check, Terminal, Info, Star, Settings, Bug, Book, Sparkles, Code, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'ci' | 'revert';

interface CommitOption {
  type: CommitType;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const commitOptions: CommitOption[] = [
  { type: 'feat', label: 'Feat', description: '引入新功能', icon: Sparkles, color: 'text-green-400' },
  { type: 'fix', label: 'Fix', description: '修复 Bug', icon: Bug, color: 'text-red-400' },
  { type: 'docs', label: 'Docs', description: '文档更新', icon: Book, color: 'text-blue-400' },
  { type: 'style', label: 'Style', description: '格式修改 (不影响代码运行)', icon: Star, color: 'text-pink-400' },
  { type: 'refactor', label: 'Refactor', description: '重构 (既不是修复也不是新功能)', icon: Code, color: 'text-yellow-400' },
  { type: 'perf', label: 'Perf', description: '性能优化', icon: Zap, color: 'text-purple-400' },
  { type: 'test', label: 'Test', description: '增加测试', icon: Check, color: 'text-cyan-400' },
  { type: 'chore', label: 'Chore', description: '构建过程或辅助工具变动', icon: Settings, color: 'text-gray-400' },
];

export default function GitScribe() {
  const [selectedType, setSelectedType] = useState<CommitType>('feat');
  const [scope, setScope] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  
  // API Config States
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("https://api.openai.com/v1/chat/completions");
  const [apiModel, setAiModel] = useState("gpt-3.5-turbo");

  // Load config from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('aether_ai_key');
    const savedEndpoint = localStorage.getItem('aether_ai_endpoint');
    const savedModel = localStorage.getItem('aether_ai_model');
    if (savedKey) setApiKey(savedKey);
    if (savedEndpoint) setApiEndpoint(savedEndpoint);
    if (savedModel) setAiModel(savedModel);
  }, []);

  // Save config to localStorage
  const saveConfig = () => {
    localStorage.setItem('aether_ai_key', apiKey);
    localStorage.setItem('aether_ai_endpoint', apiEndpoint);
    localStorage.setItem('aether_ai_model', apiModel);
    setShowConfig(false);
  };

  useEffect(() => {
    let msg = `${selectedType}${scope ? `(${scope})` : ""}: ${subject || "<summary>"}`;
    if (body) msg += `\n\n${body}`;
    if (footer) msg += `\n\n${footer}`;
    setResult(msg);
  }, [selectedType, scope, subject, body, footer]);

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          config: {
            apiKey,
            apiEndpoint,
            model: apiModel
          }
        }),
      });
      
      const data = await response.json();
      if (data.result) {
        setSelectedType(data.result.type || 'feat');
        setScope(data.result.scope || "");
        setSubject(data.result.subject || "");
        setBody(data.result.body || "");
        setFooter(data.result.footer || "");
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!subject) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setScope("");
    setSubject("");
    setBody("");
    setFooter("");
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-amber/10 rounded-2xl">
            <Zap className="text-accent-amber w-10 h-10 animate-pulse" />
          </div>
          Git 提交规范
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          自动生成符合 Conventional Commits 规范的提交信息
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Section */}
          <div className="glass-card p-6 border-accent-amber/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-amber tracking-widest uppercase flex items-center gap-2 font-bold">
                <Zap className="w-4 h-4" /> AI 智能生成
              </h3>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  showConfig ? "bg-accent-amber/20 text-accent-amber" : "text-white/20 hover:text-white/60"
                )}
                title="API 配置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">API Key</label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-amber/50 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">API Model</label>
                        <input
                          type="text"
                          value={apiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          placeholder="gpt-3.5-turbo"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-amber/50 text-xs font-mono"
                        />
                      </div>
                    </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">API Endpoint</label>
                        <input
                          type="text"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          placeholder="例如: https://api.deepseek.com/v1"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-amber/50 text-xs font-mono"
                        />
                      </div>
                    <div className="flex justify-end">
                      <button
                        onClick={saveConfig}
                        className="px-4 py-1.5 bg-accent-amber/10 text-accent-amber border border-accent-amber/20 rounded-lg text-xs font-bold hover:bg-accent-amber/20 transition-all"
                      >
                        保存配置
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="输入你的改动想法，例如：我修复了侧边栏在手机上显示不全的问题"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-amber/50 transition-all text-sm"
                onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
              />
              <button
                onClick={generateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isGenerating 
                    ? "bg-accent-amber/20 text-accent-amber/50 cursor-not-allowed" 
                    : "bg-accent-amber/10 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    智能生成
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-mono text-accent-amber tracking-widest uppercase mb-6 flex items-center gap-2 font-bold">
              <Star className="w-4 h-4" /> 选择提交类型
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commitOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setSelectedType(opt.type)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 group",
                    selectedType === opt.type 
                      ? "bg-white/10 border-accent-amber/50 shadow-lg shadow-accent-amber/10" 
                      : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <opt.icon className={cn("w-6 h-6 mb-1", selectedType === opt.type ? opt.color : "text-white/20 group-hover:text-white/50")} />
                  <span className={cn("text-xs font-bold uppercase tracking-wider", selectedType === opt.type ? "text-white" : "text-white/40")}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-white/20 text-center leading-tight">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-amber tracking-widest uppercase flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" /> 详细信息
              </h3>
              <button onClick={clearAll} className="text-white/20 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase ml-1">影响范围 (Scope)</label>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="例如: auth, ui, core"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-amber/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase ml-1">简短描述 (Subject)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="修复了登录按钮无法点击的问题"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-amber/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase ml-1">详细正文 (Body)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="详细解释改动的原因和影响..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-amber/50 transition-all text-sm min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase ml-1">页脚 (Footer)</label>
              <input
                type="text"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="例如: Closes #123, BREAKING CHANGE"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-amber/50 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-5 sticky top-10">
          <div className="glass-card p-6 flex flex-col h-full border-accent-amber/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-amber tracking-widest uppercase flex items-center gap-2 font-bold">
                <Info className="w-4 h-4" /> 规范预览
              </h3>
              <button 
                onClick={copyToClipboard}
                disabled={!subject}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed",
                  copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-accent-amber/10 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/20"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "点击复制"}
              </button>
            </div>

            <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm leading-relaxed border border-white/5 min-h-[200px] relative group overflow-hidden">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <div className="mt-8 text-white/90 whitespace-pre-wrap break-words">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={result}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-accent-amber font-bold">{selectedType}</span>
                    {scope && <span className="text-accent-amber/60">{`(${scope})`}</span>}
                    <span className="text-white/40">: </span>
                    <span>{subject || "<summary>"}</span>
                    {body && <div className="mt-4 text-white/50">{body}</div>}
                    {footer && <div className="mt-4 text-white/30 border-t border-white/5 pt-2 italic">{footer}</div>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-amber/5 blur-3xl rounded-full" />
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">规范指南</h4>
              <ul className="space-y-2">
                {[
                  "Subject 长度建议控制在 50 字符内",
                  "使用祈使句，首字母不要大写",
                  "结尾不要加句号",
                  "Body 建议在 72 字符处换行",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-white/40">
                    <div className="w-1 h-1 rounded-full bg-accent-amber/40 mt-1.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
