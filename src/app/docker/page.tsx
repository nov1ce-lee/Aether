"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, Check, Terminal, Plus, Trash2, 
  Play, Settings, HardDrive, Network, 
  User, Folder, Shield, Zap, Search,
  Box, Layers, Trash, History, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandType = 'run' | 'exec' | 'build' | 'ps' | 'images' | 'logs' | 'cleanup';

interface Port { host: string; container: string; }
interface Env { key: string; value: string; }
interface Volume { host: string; container: string; }

export default function DockerGenerator() {
  const [activeTab, setActiveTab] = useState<CommandType>('run');
  const [command, setCommand] = useState("");
  const [copied, setCopied] = useState(false);

  // Common States
  const [image, setImage] = useState("");
  const [containerName, setContainerName] = useState("");
  
  // Run States
  const [ports, setPorts] = useState<Port[]>([]);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isDetached, setIsDetached] = useState(true);
  const [shouldRemove, setShouldRemove] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [restartPolicy, setRestartPolicy] = useState("no");
  const [network, setNetwork] = useState("");
  const [workingDir, setWorkingDir] = useState("");
  const [user, setUser] = useState("");
  const [customCommand, setCustomCommand] = useState("");

  // Exec States
  const [execTarget, setExecTarget] = useState("");
  const [execCommand, setExecCommand] = useState("bash");

  // Build States
  const [tag, setTag] = useState("");
  const [dockerfilePath, setDockerfilePath] = useState(".");

  // PS/Images States
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cmd = "docker";
    
    if (activeTab === 'run') {
      cmd += " run";
      if (isDetached) cmd += " -d";
      if (shouldRemove) cmd += " --rm";
      if (isInteractive) cmd += " -it";
      if (containerName) cmd += ` --name ${containerName}`;
      if (restartPolicy !== "no") cmd += ` --restart ${restartPolicy}`;
      if (network) cmd += ` --network ${network}`;
      if (workingDir) cmd += ` -w ${workingDir}`;
      if (user) cmd += ` -u ${user}`;
      
      ports.forEach(p => p.host && p.container && (cmd += ` -p ${p.host}:${p.container}`));
      envs.forEach(e => e.key && (cmd += ` -e ${e.key}=${e.value}`));
      volumes.forEach(v => v.host && v.container && (cmd += ` -v ${v.host}:${v.container}`));
      
      cmd += ` ${image || "<image-id>"}`;
      if (customCommand) cmd += ` ${customCommand}`;
    } 
    else if (activeTab === 'exec') {
      cmd += " exec";
      if (isInteractive) cmd += " -it";
      cmd += ` ${execTarget || "<container-id>"} ${execCommand}`;
    }
    else if (activeTab === 'build') {
      cmd += " build";
      if (tag) cmd += ` -t ${tag}`;
      cmd += ` ${dockerfilePath}`;
    }
    else if (activeTab === 'ps') {
      cmd += " ps";
      if (showAll) cmd += " -a";
      if (filter) cmd += ` --filter "${filter}"`;
    }
    else if (activeTab === 'images') {
      cmd += " images";
      if (showAll) cmd += " -a";
    }
    else if (activeTab === 'logs') {
      cmd += " logs";
      if (isDetached) cmd += " -f"; // Using detached state for "follow"
      cmd += ` ${execTarget || "<container-id>"}`;
    }
    else if (activeTab === 'cleanup') {
      cmd = "docker system prune -a --volumes";
    }
    
    setCommand(cmd);
  }, [
    activeTab, image, containerName, ports, envs, volumes, 
    isDetached, shouldRemove, isInteractive, restartPolicy, 
    network, workingDir, user, customCommand, execTarget, 
    execCommand, tag, dockerfilePath, showAll, filter
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: CommandType; label: string; icon: any }[] = [
    { id: 'run', label: '运行 (Run)', icon: Play },
    { id: 'exec', label: '执行 (Exec)', icon: Terminal },
    { id: 'build', label: '构建 (Build)', icon: Layers },
    { id: 'ps', label: '容器 (PS)', icon: Box },
    { id: 'images', label: '镜像 (Images)', icon: History },
    { id: 'logs', label: '日志 (Logs)', icon: Search },
    { id: 'cleanup', label: '清理 (Prune)', icon: Trash },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-cyan/10 rounded-2xl">
            <Terminal className="text-accent-cyan w-10 h-10" />
          </div>
          Docker 指令生成
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          快速生成常用的 Docker 运行、构建与管理指令
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 glass rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-accent-cyan" : "")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* RUN TAB */}
              {activeTab === 'run' && (
                <>
                  <Section title="核心配置" icon={Settings}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="镜像 ID / 名称" value={image} onChange={setImage} placeholder="例如: nginx:latest" />
                      <Input label="容器名称 (--name)" value={containerName} onChange={setContainerName} placeholder="my-app" />
                    </div>
                    <div className="flex flex-wrap gap-6 pt-4">
                      <Checkbox label="后台运行 (-d)" checked={isDetached} onChange={setIsDetached} />
                      <Checkbox label="自动删除 (--rm)" checked={shouldRemove} onChange={setShouldRemove} />
                      <Checkbox label="交互模式 (-it)" checked={isInteractive} onChange={setIsInteractive} />
                    </div>
                  </Section>

                  <Section title="网络与存储" icon={HardDrive}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Input label="网络名称 (--network)" value={network} onChange={setNetwork} placeholder="bridge" />
                      <Input label="工作目录 (-w)" value={workingDir} onChange={setWorkingDir} placeholder="/app" />
                    </div>
                    
                    <div className="space-y-4">
                      <DynamicList 
                        title="端口映射 (-p)" 
                        items={ports} 
                        onAdd={() => setPorts([...ports, { host: "", container: "" }])}
                        onRemove={(i) => setPorts(ports.filter((_, idx) => idx !== i))}
                        renderItem={(p, i) => (
                          <div className="flex gap-2 items-center">
                            <input placeholder="宿主机" value={p.host} onChange={e => {
                              const n = [...ports]; n[i].host = e.target.value; setPorts(n);
                            }} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm" />
                            <span className="text-white/20">:</span>
                            <input placeholder="容器" value={p.container} onChange={e => {
                              const n = [...ports]; n[i].container = e.target.value; setPorts(n);
                            }} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm" />
                          </div>
                        )}
                      />

                      <DynamicList 
                        title="挂载卷 (-v)" 
                        items={volumes} 
                        onAdd={() => setVolumes([...volumes, { host: "", container: "" }])}
                        onRemove={(i) => setVolumes(volumes.filter((_, idx) => idx !== i))}
                        renderItem={(v, i) => (
                          <div className="flex gap-2 items-center">
                            <input placeholder="宿主机路径" value={v.host} onChange={e => {
                              const n = [...volumes]; n[i].host = e.target.value; setVolumes(n);
                            }} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm" />
                            <span className="text-white/20">→</span>
                            <input placeholder="容器路径" value={v.container} onChange={e => {
                              const n = [...volumes]; n[i].container = e.target.value; setVolumes(n);
                            }} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm" />
                          </div>
                        )}
                      />
                    </div>
                  </Section>

                  <Section title="进阶配置" icon={Shield}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase ml-1">重启策略</label>
                        <select 
                          value={restartPolicy} 
                          onChange={(e) => setRestartPolicy(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none text-sm appearance-none"
                        >
                          <option value="no" className="bg-[#050505]">不自动重启</option>
                          <option value="always" className="bg-[#050505]">总是重启 (always)</option>
                          <option value="unless-stopped" className="bg-[#050505]">除非停止 (unless-stopped)</option>
                          <option value="on-failure" className="bg-[#050505]">失败时重启</option>
                        </select>
                      </div>
                      <Input label="运行用户 (-u)" value={user} onChange={setUser} placeholder="root" />
                    </div>
                    <div className="mt-4">
                      <Input label="自定义启动命令" value={customCommand} onChange={setCustomCommand} placeholder="例如: npm start" />
                    </div>
                  </Section>
                </>
              )}

              {/* EXEC TAB */}
              {activeTab === 'exec' && (
                <Section title="执行配置" icon={Zap}>
                  <div className="space-y-4">
                    <Input label="目标容器 ID / 名称" value={execTarget} onChange={setExecTarget} placeholder="my-running-container" />
                    <Input label="执行命令" value={execCommand} onChange={setExecCommand} placeholder="bash" />
                    <div className="pt-2">
                      <Checkbox label="交互模式 (-it)" checked={isInteractive} onChange={setIsInteractive} />
                    </div>
                  </div>
                </Section>
              )}

              {/* BUILD TAB */}
              {activeTab === 'build' && (
                <Section title="构建配置" icon={Layers}>
                  <div className="space-y-4">
                    <Input label="镜像标签 (-t)" value={tag} onChange={setTag} placeholder="my-image:v1" />
                    <Input label="上下文路径" value={dockerfilePath} onChange={setDockerfilePath} placeholder="." />
                  </div>
                </Section>
              )}

              {/* PS / IMAGES TAB */}
              {(activeTab === 'ps' || activeTab === 'images') && (
                <Section title="列表配置" icon={Search}>
                  <div className="space-y-4">
                    <Checkbox label="显示所有 (包括已停止/中间层)" checked={showAll} onChange={setShowAll} />
                    {activeTab === 'ps' && (
                      <Input label="过滤 (--filter)" value={filter} onChange={setFilter} placeholder="status=running" />
                    )}
                  </div>
                </Section>
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <Section title="日志配置" icon={Search}>
                  <div className="space-y-4">
                    <Input label="目标容器 ID / 名称" value={execTarget} onChange={setExecTarget} placeholder="container-id" />
                    <Checkbox label="实时跟随 (-f)" checked={isDetached} onChange={setIsDetached} />
                  </div>
                </Section>
              )}

              {/* CLEANUP TAB */}
              {activeTab === 'cleanup' && (
                <div className="glass-card p-8 border-red-500/20">
                  <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                    <Trash className="w-5 h-5" /> 危险操作
                  </h3>
                  <p className="text-white/40 text-sm mb-6 leading-relaxed">
                    此命令将删除所有停止的容器、未使用的网络、悬空镜像以及未使用的卷。
                    <br />
                    指令：<code className="text-red-300">docker system prune -a --volumes</code>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 sticky top-10">
          <div className="glass-card p-6 flex flex-col h-full border-accent-cyan/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-cyan tracking-widest uppercase flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" /> 实时指令输出
              </h3>
              <button 
                onClick={copyToClipboard}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "点击复制"}
              </button>
            </div>
            
            <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm leading-relaxed border border-white/5 min-h-[160px] relative group overflow-hidden">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <div className="mt-8 text-accent-cyan/90 break-words">
                <span className="text-white/20 select-none mr-2">$</span>
                {command}
              </div>
              
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-cyan/5 blur-3xl rounded-full" />
            </div>

            <div className="mt-8 space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Box className="w-3 h-3" /> 指令说明
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  {getExplanation(activeTab)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-mono text-accent-cyan tracking-widest uppercase mb-2 flex items-center gap-2 font-bold">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/40 uppercase ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-cyan/50 transition-all text-sm"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
      <div className={cn(
        "w-5 h-5 rounded-lg border transition-all flex items-center justify-center",
        checked ? "bg-accent-cyan border-accent-cyan shadow-[0_0_10px_rgba(0,245,255,0.3)]" : "border-white/20 group-hover:border-white/40"
      )}>
        {checked && <Check className="w-3 h-3 text-black font-bold" />}
      </div>
      <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">{label}</span>
    </label>
  );
}

function DynamicList({ title, items, onAdd, onRemove, renderItem }: { 
  title: string; items: any[]; onAdd: () => void; onRemove: (i: number) => void; renderItem: (item: any, i: number) => React.ReactNode 
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs text-white/40 uppercase ml-1">{title}</label>
        <button onClick={onAdd} className="p-1.5 hover:bg-white/10 rounded-lg text-accent-cyan transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 group">
            {renderItem(item, i)}
            <button onClick={() => onRemove(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-white/20 text-center py-2 italic border border-dashed border-white/5 rounded-lg">点击 + 添加配置</p>}
      </div>
    </div>
  );
}

function getExplanation(tab: CommandType) {
  switch (tab) {
    case 'run': return "创建一个新容器并运行命令。这是最常用的指令，支持端口、挂载、环境变量等完整配置。";
    case 'exec': return "在正在运行的容器中执行新命令。常用于进入容器终端 (bash/sh)。";
    case 'build': return "从 Dockerfile 构建镜像。-t 参数用于指定生成的镜像名称和标签。";
    case 'ps': return "列出容器。-a 可以查看包括已停止在内的所有容器。";
    case 'images': return "列出本地所有镜像。";
    case 'logs': return "获取容器的日志输出。-f 参数可以实现实时滚动查看。";
    case 'cleanup': return "深度清理系统。一键删除所有无用的容器、网络、镜像和数据卷。";
    default: return "";
  }
}
