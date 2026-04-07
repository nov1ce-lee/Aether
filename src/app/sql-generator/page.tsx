"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, Copy, Check, RefreshCw, Type, 
  Settings, Info, Terminal, Search, 
  Table, ListChecks, ArrowDownAZ, Hash, MousePointer2,
  Plus, X, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Field {
  name: string;
  type: string;
  comment: string;
  selected: boolean;
}

interface WhereFilter {
  id: string;
  field: string;
  value: string;
  operator: string;
}

export default function SqlGenerator() {
  const [inputSql, setInputSql] = useState("");
  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [generatedSql, setGeneratedSql] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Selection state for drag selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  // Generation Options
  const [options, setOptions] = useState({
    select: true,
    where: false,
    orderBy: false,
    limit: true,
    limitValue: "10"
  });

  const [whereFilters, setWhereFilters] = useState<WhereFilter[]>([]);

  // Parse MySQL CREATE TABLE
  const parseSql = (sql: string) => {
    if (!sql.trim()) return;

    try {
      // Extract table name
      const tableMatch = sql.match(/CREATE\s+TABLE\s+[`]?(\w+)[`]?/i);
      const extractedTableName = tableMatch ? tableMatch[1] : "my_table";
      setTableName(extractedTableName);

      // Extract fields
      // This is a more robust regex parser for MySQL CREATE TABLE
      const extractedFields: Field[] = [];
      
      // Look for the part inside CREATE TABLE (...)
      const bodyMatch = sql.match(/CREATE\s+TABLE\s+[`]?\w+[`]?\s*\(([\s\S]*)\)/i);
      if (bodyMatch) {
        const body = bodyMatch[1];
        // Split by comma but ignore commas inside parentheses (like DECIMAL(10,2))
        const lines = body.split(/,(?![^(]*\))/);
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          // Skip constraints, keys, etc.
          if (
            /^(PRIMARY\s+KEY|KEY|UNIQUE|CONSTRAINT|INDEX|FULLTEXT|SPATIAL|CHECK|FOREIGN\s+KEY)/i.test(trimmedLine) ||
            !trimmedLine
          ) {
            return;
          }

          // Match field name, type, and optional comment
          const fieldMatch = trimmedLine.match(/^[`]?(\w+)[`]?\s+([a-zA-Z]+(?:\([^)]+\))?)(?:\s+.*?COMMENT\s+'(.*?)')?/i);
          if (fieldMatch) {
            extractedFields.push({
              name: fieldMatch[1],
              type: fieldMatch[2],
              comment: fieldMatch[3] || "",
              selected: true
            });
          }
        });
      }

      if (extractedFields.length > 0) {
        setFields(extractedFields);
        // Initialize one where filter if none exists
        if (whereFilters.length === 0 && extractedFields.length > 0) {
          setWhereFilters([{
            id: Math.random().toString(36).substr(2, 9),
            field: extractedFields[0].name,
            value: "",
            operator: "="
          }]);
        }
      }
    } catch (e) {
      console.error("Parse Error:", e);
    }
  };

  useEffect(() => {
    parseSql(inputSql);
  }, [inputSql]);

  // Generate SQL based on selections and options
  useEffect(() => {
    if (fields.length === 0) {
      setGeneratedSql("");
      return;
    }

    const selectedFields = fields.filter(f => f.selected).map(f => `\`${f.name}\``);
    
    let sql = "";
    
    if (options.select) {
      sql += `SELECT ${selectedFields.length > 0 ? selectedFields.join(', ') : '*'} \nFROM \`${tableName}\``;
    }

    if (options.where && whereFilters.length > 0) {
      const activeFilters = whereFilters.filter(f => f.field);
      if (activeFilters.length > 0) {
        const whereClause = activeFilters
          .map(f => `\`${f.field}\` ${f.operator} '${f.value}'`)
          .join(' AND ');
        sql += `\nWHERE ${whereClause}`;
      }
    }

    if (options.orderBy) {
      const orderField = fields.find(f => f.selected) || fields[0];
      sql += `\nORDER BY \`${orderField.name}\` DESC`;
    }

    if (options.limit) {
      sql += `\nLIMIT ${options.limitValue}`;
    }

    sql += ";";
    setGeneratedSql(sql);
  }, [fields, tableName, options, whereFilters]);

  const addWhereFilter = () => {
    setWhereFilters([...whereFilters, {
      id: Math.random().toString(36).substr(2, 9),
      field: fields[0]?.name || "",
      value: "",
      operator: "="
    }]);
  };

  const removeWhereFilter = (id: string) => {
    setWhereFilters(whereFilters.filter(f => f.id !== id));
  };

  const updateWhereFilter = (id: string, updates: Partial<WhereFilter>) => {
    setWhereFilters(whereFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const toggleField = (index: number) => {
    const newFields = [...fields];
    newFields[index].selected = !newFields[index].selected;
    setFields(newFields);
  };

  const handleMouseDown = (index: number) => {
    setIsSelecting(true);
    setSelectionStart(index);
    toggleField(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isSelecting && selectionStart !== null) {
      const start = Math.min(selectionStart, index);
      const end = Math.max(selectionStart, index);
      const targetState = fields[selectionStart].selected;
      
      const newFields = fields.map((f, i) => {
        if (i >= start && i <= end) {
          return { ...f, selected: targetState };
        }
        return f;
      });
      setFields(newFields);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const selectAll = (val: boolean) => {
    setFields(fields.map(f => ({ ...f, selected: val })));
  };

  const copyToClipboard = () => {
    if (!generatedSql) return;
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center lg:justify-start gap-4">
          <div className="p-3 bg-accent-emerald/10 rounded-2xl">
            <Database className="text-accent-emerald w-10 h-10" />
          </div>
          SQL 生成器
        </h2>
        <p className="text-white/40 text-lg max-w-2xl">
          解析 CREATE TABLE 语句，快速生成常用的 SQL 查询指令
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input & Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono text-accent-emerald tracking-widest uppercase flex items-center gap-2 font-bold">
                <Table className="w-4 h-4" /> 建表语句输入
              </h3>
              <button onClick={() => setInputSql("")} className="text-white/20 hover:text-white/60 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              value={inputSql}
              onChange={(e) => setInputSql(e.target.value)}
              placeholder="粘贴 MySQL CREATE TABLE 语句..."
              className="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-emerald/50 transition-all resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-mono text-accent-emerald tracking-widest uppercase flex items-center gap-2 font-bold">
              <Settings className="w-4 h-4" /> 生成选项
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.select} 
                  onChange={e => setOptions({...options, select: e.target.checked})}
                  className="hidden"
                />
                <div className={cn("w-4 h-4 rounded border transition-all flex items-center justify-center", options.select ? "bg-accent-emerald border-accent-emerald" : "border-white/20 group-hover:border-white/40")}>
                  {options.select && <Check className="w-3 h-3 text-black font-bold" />}
                </div>
                <span className="text-sm text-white/70">SELECT</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.where} 
                  onChange={e => setOptions({...options, where: e.target.checked})}
                  className="hidden"
                />
                <div className={cn("w-4 h-4 rounded border transition-all flex items-center justify-center", options.where ? "bg-accent-emerald border-accent-emerald" : "border-white/20 group-hover:border-white/40")}>
                  {options.where && <Check className="w-3 h-3 text-black font-bold" />}
                </div>
                <span className="text-sm text-white/70">WHERE</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.orderBy} 
                  onChange={e => setOptions({...options, orderBy: e.target.checked})}
                  className="hidden"
                />
                <div className={cn("w-4 h-4 rounded border transition-all flex items-center justify-center", options.orderBy ? "bg-accent-emerald border-accent-emerald" : "border-white/20 group-hover:border-white/40")}>
                  {options.orderBy && <Check className="w-3 h-3 text-black font-bold" />}
                </div>
                <span className="text-sm text-white/70">ORDER BY</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={options.limit} 
                  onChange={e => setOptions({...options, limit: e.target.checked})}
                  className="hidden"
                />
                <div className={cn("w-4 h-4 rounded border transition-all flex items-center justify-center", options.limit ? "bg-accent-emerald border-accent-emerald" : "border-white/20 group-hover:border-white/40")}>
                  {options.limit && <Check className="w-3 h-3 text-black font-bold" />}
                </div>
                <span className="text-sm text-white/70">LIMIT</span>
              </label>
            </div>

            {options.where && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1 flex items-center gap-2">
                    <Filter className="w-3 h-3" /> WHERE 过滤配置
                  </label>
                  <button 
                    onClick={addWhereFilter}
                    className="p-1 hover:bg-white/5 rounded text-accent-emerald transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {whereFilters.map((filter) => (
                    <div key={filter.id} className="flex gap-2 items-center">
                      <select
                        value={filter.field}
                        onChange={(e) => updateWhereFilter(filter.id, { field: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-accent-emerald/50 text-xs appearance-none"
                      >
                        {fields.map(f => (
                          <option key={f.name} value={f.name} className="bg-[#050505]">{f.name}</option>
                        ))}
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={(e) => updateWhereFilter(filter.id, { operator: e.target.value })}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-1 py-1.5 text-white focus:outline-none focus:border-accent-emerald/50 text-xs appearance-none text-center"
                      >
                        {['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'].map(op => (
                          <option key={op} value={op} className="bg-[#050505]">{op}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateWhereFilter(filter.id, { value: e.target.value })}
                        placeholder="值"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-accent-emerald/50 text-xs"
                      />
                      
                      <button 
                        onClick={() => removeWhereFilter(filter.id)}
                        className="p-1 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {whereFilters.length === 0 && (
                    <p className="text-[10px] text-white/20 italic text-center py-2">点击 + 添加过滤条件</p>
                  )}
                </div>
              </div>
            )}

            {options.limit && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">Limit 数量</label>
                <input 
                  type="number" 
                  value={options.limitValue}
                  onChange={e => setOptions({...options, limitValue: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-accent-emerald/50 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Fields Selection & Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-emerald tracking-widest uppercase flex items-center gap-2 font-bold">
                <ListChecks className="w-4 h-4" /> 字段选择 {fields.length > 0 && `(${fields.filter(f => f.selected).length}/${fields.length})`}
              </h3>
              <div className="flex gap-3">
                <button onClick={() => selectAll(true)} className="text-[10px] text-accent-emerald hover:underline uppercase font-bold">全选</button>
                <button onClick={() => selectAll(false)} className="text-[10px] text-white/20 hover:text-white/40 hover:underline uppercase font-bold">清空</button>
              </div>
            </div>

            {fields.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-white/40">
                  <MousePointer2 className="w-3 h-3" />
                  <span>支持鼠标拖拽快速圈选字段</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar select-none">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onMouseDown={() => handleMouseDown(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 group",
                        field.selected 
                          ? "bg-accent-emerald/10 border-accent-emerald/30" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        field.selected ? "bg-accent-emerald border-accent-emerald" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {field.selected && <Check className="w-3 h-3 text-black font-bold" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-base font-mono truncate font-bold", field.selected ? "text-white" : "text-white/40")}>
                            {field.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald font-bold font-mono">
                            {field.type}
                          </span>
                        </div>
                        {field.comment && (
                          <p className={cn("text-xs truncate mt-1", field.selected ? "text-white/60" : "text-white/20")}>
                            {field.comment}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/10 py-10">
                <Table className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-mono italic">等待输入建表语句...</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 flex flex-col border-accent-emerald/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-accent-emerald tracking-widest uppercase flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" /> SQL 预览
              </h3>
              <button 
                onClick={copyToClipboard}
                disabled={!generatedSql}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald/20"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "点击复制"}
              </button>
            </div>
            
            <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm leading-relaxed border border-white/5 min-h-[120px] relative group overflow-hidden">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <div className="mt-8 text-accent-emerald/90 whitespace-pre-wrap break-words">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={generatedSql}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {generatedSql || <span className="text-white/10 italic">等待生成...</span>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-emerald/5 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
