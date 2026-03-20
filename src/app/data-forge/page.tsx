"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, FileJson, FileCode, Copy, Check, 
  RefreshCw, Upload, Download, Key, Lock, 
  Unlock, Info, HardDrive, Terminal, Code,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import CryptoJS from "crypto-js";

type ForgeMode = 'text' | 'dat';
type CryptoAlgo = 'AES-ECB' | 'NONE';
type Encoding = 'Base64' | 'Base64URL' | 'Hex';

export default function DataForge() {
  const [mode, setMode] = useState<ForgeMode>('text');
  const [algo, setAlgo] = useState<CryptoAlgo>('AES-ECB');
  const [encoding, setEncoding] = useState<Encoding>('Base64');
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [datFile, setDatFile] = useState<File | null>(null);
  const [datBinary, setDatBinary] = useState<Uint8Array | null>(null);
  const [datInfo, setDatInfo] = useState({ prefix: new Uint8Array(0), suffix: new Uint8Array(0) });

  // Text Crypt Logic
  const handleEncrypt = () => {
    try {
      if (!input) return;
      
      let resultBytes;
      if (algo === 'AES-ECB') {
        if (!key) {
          setOutput("错误: AES 加密需要 Key");
          return;
        }
        const encrypted = CryptoJS.AES.encrypt(input, CryptoJS.enc.Utf8.parse(key), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
        resultBytes = encrypted.ciphertext;
      } else {
        resultBytes = CryptoJS.enc.Utf8.parse(input);
      }

      let finalResult;
      if (encoding === 'Hex') {
        finalResult = CryptoJS.enc.Hex.stringify(resultBytes);
      } else if (encoding === 'Base64URL') {
        finalResult = CryptoJS.enc.Base64.stringify(resultBytes)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      } else {
        finalResult = CryptoJS.enc.Base64.stringify(resultBytes);
      }
      setOutput(finalResult);
    } catch (e) {
      console.error(e);
      setOutput("加密失败: 请检查参数");
    }
  };

  const handleDecrypt = () => {
    try {
      if (!input) return;

      let sourceBytes;
      if (encoding === 'Base64URL') {
        const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - input.length % 4) % 4);
        sourceBytes = CryptoJS.enc.Base64.parse(base64);
      } else if (encoding === 'Hex') {
        sourceBytes = CryptoJS.enc.Hex.parse(input);
      } else {
        sourceBytes = CryptoJS.enc.Base64.parse(input);
      }

      if (algo === 'AES-ECB') {
        if (!key) {
          setOutput("错误: AES 解密需要 Key");
          return;
        }
        // CryptoJS.AES.decrypt expects a CipherParams object or a base64 string
        const base64 = CryptoJS.enc.Base64.stringify(sourceBytes);
        const decrypted = CryptoJS.AES.decrypt(base64, CryptoJS.enc.Utf8.parse(key), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) throw new Error("解密结果为空，可能是 Key 错误");
        setOutput(result);
      } else {
        setOutput(CryptoJS.enc.Utf8.stringify(sourceBytes));
      }
    } catch (e) {
      console.error(e);
      setOutput("解密失败: 请检查参数或 Key");
    }
  };

  // .dat Forge Logic
  const read7BitEncodedInt = (buffer: Uint8Array, offset: number) => {
    let count = 0;
    let shift = 0;
    let b;
    let bytesRead = 0;
    do {
      if (shift === 5 * 7) throw new Error("Invalid 7-bit encoded integer");
      b = buffer[offset + bytesRead];
      count |= (b & 0x7F) << shift;
      shift += 7;
      bytesRead++;
    } while ((b & 0x80) !== 0);
    return { value: count, bytesRead };
  };

  const write7BitEncodedInt = (value: number) => {
    const bytes = [];
    let v = value;
    while (v >= 0x80) {
      bytes.push((v | 0x80) & 0xFF);
      v >>= 7;
    }
    bytes.push(v & 0xFF);
    return new Uint8Array(bytes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDatFile(file);

    const buffer = new Uint8Array(await file.arrayBuffer());
    let stringOffset = -1;
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0x06) {
        stringOffset = i + 1;
        break;
      }
    }

    if (stringOffset !== -1) {
      try {
        const { value: length, bytesRead } = read7BitEncodedInt(buffer, stringOffset);
        const dataOffset = stringOffset + bytesRead;
        const encodedStr = new TextDecoder().decode(buffer.slice(dataOffset, dataOffset + length));
        
        setDatInfo({
          prefix: buffer.slice(0, dataOffset),
          suffix: buffer.slice(dataOffset + length)
        });
        setInput(encodedStr);
        // Auto decrypt if key exists
        if (key) {
          // Manual trigger needed or handle in useEffect
        }
      } catch (e) {
        alert("无法解析 .dat 文件中的字符串结构");
      }
    } else {
      alert("未能在文件中找到 0x06 引导的字符串对象");
    }
  };

  const handleExportDat = () => {
    if (!datInfo.prefix.length) return;
    
    // First encrypt current output back to the encoded string
    try {
      let encrypted;
      if (algo === 'AES-ECB') {
        encrypted = CryptoJS.AES.encrypt(output, CryptoJS.enc.Utf8.parse(key), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }).toString();
      } else {
        encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(output));
      }

      if (encoding === 'Base64URL') {
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } else if (encoding === 'Hex') {
        encrypted = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(encrypted));
      }

      const encodedBytes = new TextEncoder().encode(encrypted);
      const newLenBytes = write7BitEncodedInt(encodedBytes.length);
      
      // The prefix includes the 0x06, we need to replace the length bytes after 0x06
      // Find 0x06 in prefix
      let idx06 = -1;
      for(let i=0; i<datInfo.prefix.length; i++) if(datInfo.prefix[i] === 0x06) idx06 = i;
      
      const finalPrefix = datInfo.prefix.slice(0, idx06 + 1);
      const combined = new Uint8Array(finalPrefix.length + newLenBytes.length + encodedBytes.length + datInfo.suffix.length);
      combined.set(finalPrefix);
      combined.set(newLenBytes, finalPrefix.length);
      combined.set(encodedBytes, finalPrefix.length + newLenBytes.length);
      combined.set(datInfo.suffix, finalPrefix.length + newLenBytes.length + encodedBytes.length);

      const blob = new Blob([combined], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forged_${datFile?.name || 'file.dat'}`;
      a.click();
    } catch (e) {
      alert("导出失败: 请确保已正确解密并编辑了内容");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-violet/10 rounded-2xl">
            <Shield className="text-accent-violet w-10 h-10" />
          </div>
          数据加解密
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          支持文本加解密与二进制 .dat 档案的解析修改
        </p>
      </motion.div>

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-8 p-1 glass rounded-2xl w-fit mx-auto lg:mx-0">
        <button
          onClick={() => setMode('text')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
            mode === 'text' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
          )}
        >
          <Code className="w-4 h-4" /> 文本加解密
        </button>
        <button
          onClick={() => setMode('dat')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
            mode === 'dat' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/70"
          )}
        >
          <HardDrive className="w-4 h-4" /> .dat 档案解析
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-sm font-mono text-accent-violet tracking-widest uppercase mb-2 flex items-center gap-2 font-bold">
                  <Settings className="w-4 h-4" /> 算法配置
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase ml-1">加密算法</label>
                    <select 
                      value={algo} 
                      onChange={(e) => setAlgo(e.target.value as CryptoAlgo)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none text-sm appearance-none"
                    >
                      <option value="AES-ECB" className="bg-[#050505]">AES-ECB (Pkcs7)</option>
                      <option value="NONE" className="bg-[#050505]">不加密 (仅编码转换)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase ml-1">输出编码</label>
                    <div className="flex gap-2">
                      {['Base64', 'Base64URL', 'Hex'].map((enc) => (
                        <button
                          key={enc}
                          onClick={() => setEncoding(enc as Encoding)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                            encoding === enc ? "bg-accent-violet/20 border-accent-violet/50 text-white" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                          )}
                        >
                          {enc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {algo !== 'NONE' && (
                    <div className="space-y-2">
                      <label className="text-xs text-white/40 uppercase ml-1">密钥 (Key)</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => setKey(e.target.value)}
                          placeholder="输入加密密钥..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-accent-violet/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {mode === 'dat' && (
                <div className="glass-card p-6 border-dashed border-accent-violet/30">
                  <h3 className="text-sm font-mono text-accent-violet tracking-widest uppercase mb-4 flex items-center gap-2 font-bold">
                    <Upload className="w-4 h-4" /> 档案导入
                  </h3>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/5 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-white/20 group-hover:text-accent-violet/50 transition-colors mb-2" />
                      <p className="text-sm text-white/40">{datFile ? datFile.name : "选择 .dat 文件"}</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".dat" />
                  </label>
                </div>
              )}

              <div className="glass-card p-6 bg-accent-violet/5 border-accent-violet/10">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info className="w-3 h-3" /> 使用指南
                </h4>
                <ul className="space-y-2 text-[11px] text-white/40 leading-relaxed italic">
                  <li>• 文本模式：支持标准的 AES 与 Base64 互转。</li>
                  <li>• 档案模式：导入 .dat 文件后，工具将自动尝试提取内部编码串。</li>
                  <li>• 密钥匹配：解密存档通常需要正确的 AES Key。</li>
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Interaction Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-violet tracking-widest uppercase flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" /> 锻造台
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setInput("") || setOutput("")} className="p-2 text-white/20 hover:text-white/60 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">输入 (明文/编码串)</label>
                  {input && (
                    <button onClick={() => copyToClipboard(input)} className="text-[10px] text-accent-violet hover:underline flex items-center gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 复制
                    </button>
                  )}
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'text' ? "输入需要加解密的文本..." : "导入 .dat 后此处将显示提取到的编码串..."}
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-violet/50 transition-all font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleEncrypt}
                  className="flex-1 bg-accent-violet/10 text-accent-violet border border-accent-violet/20 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-violet/20 transition-all"
                >
                  <Lock className="w-4 h-4" /> 加密 & 编码 →
                </button>
                <button
                  onClick={handleDecrypt}
                  className="flex-1 bg-white/5 text-white/80 border border-white/10 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <Unlock className="w-4 h-4" /> ← 解密 & 解码
                </button>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">输出 (结果/JSON)</label>
                  <div className="flex gap-3">
                    {output && (
                      <button onClick={() => copyToClipboard(output)} className="text-[10px] text-accent-violet hover:underline flex items-center gap-1">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 复制结果
                      </button>
                    )}
                    {mode === 'dat' && datInfo.prefix.length > 0 && (
                      <button onClick={handleExportDat} className="text-[10px] text-green-400 hover:underline flex items-center gap-1">
                        <Download className="w-3 h-3" /> 导出 .dat
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="结果将在此处显示..."
                  className="flex-1 w-full bg-black/40 border border-white/5 rounded-xl p-4 text-accent-violet/90 focus:outline-none focus:border-accent-violet/50 transition-all font-mono text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
