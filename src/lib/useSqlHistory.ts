"use client";

import { useState, useEffect, useCallback } from "react";

export interface SqlHistoryRecord {
  id: string;
  sql: string;
  tableName: string;
  createdAt: number;
  isFavorite: boolean;
  label?: string;
}

const STORAGE_KEY = "aether_sql_history";
const MAX_RECORDS = 30;

function loadRecords(): SqlHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveRecords(records: SqlHistoryRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // storage full, ignore
  }
}

export function useSqlHistory() {
  const [records, setRecords] = useState<SqlHistoryRecord[]>([]);

  // Load on mount
  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  // Persist on change
  const persist = useCallback((newRecords: SqlHistoryRecord[]) => {
    // Trim to max
    const trimmed = newRecords.slice(0, MAX_RECORDS);
    setRecords(trimmed);
    saveRecords(trimmed);
  }, []);

  const addRecord = useCallback(
    (sql: string, tableName: string, label?: string) => {
      if (!sql.trim()) return;
      const newRecord: SqlHistoryRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        sql,
        tableName,
        createdAt: Date.now(),
        isFavorite: false,
        label,
      };
      setRecords((prev) => {
        const updated = [newRecord, ...prev];
        const trimmed = updated.slice(0, MAX_RECORDS);
        saveRecords(trimmed);
        return trimmed;
      });
    },
    []
  );

  const deleteRecord = useCallback(
    (id: string) => {
      setRecords((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        saveRecords(updated);
        return updated;
      });
    },
    []
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setRecords((prev) => {
        const updated = prev.map((r) =>
          r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
        );
        saveRecords(updated);
        return updated;
      });
    },
    []
  );

  const updateLabel = useCallback(
    (id: string, label: string) => {
      setRecords((prev) => {
        const updated = prev.map((r) =>
          r.id === id ? { ...r, label } : r
        );
        saveRecords(updated);
        return updated;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    setRecords([]);
    saveRecords([]);
  }, []);

  const favorites = records.filter((r) => r.isFavorite);

  return {
    records,
    favorites,
    addRecord,
    deleteRecord,
    toggleFavorite,
    updateLabel,
    clearAll,
  };
}
