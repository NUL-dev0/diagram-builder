'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SavedDiagram {
  id: string;
  name: string;
  type: string;
  description: string;
  mermaidCode: string;
  tags: string[];
  folder: string;
  llmProvider: string;
  createdAt: string;
  updatedAt: string;
}

const LS_KEY = 'diagrambuilder:diagrams';

function readLocalStorage(): SavedDiagram[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedDiagram[]) : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(diagrams: SavedDiagram[]): void {
  // 最大 50 件
  const trimmed = diagrams.slice(0, 50);
  localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
}

export function useDiagrams() {
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 起動時: バックエンドから取得 → LocalStorage とマージ
  useEffect(() => {
    const load = async () => {
      const local = readLocalStorage();
      const localMap = new Map(local.map((d) => [d.id, d]));

      try {
        const res = await fetch('/api/diagrams');
        const data = await res.json();
        if (data.success) {
          const remote: SavedDiagram[] = data.diagrams;
          // remote を優先、local 専用のものを追加
          const remoteIds = new Set(remote.map((d) => d.id));
          const localOnly = local.filter((d) => !remoteIds.has(d.id));
          const merged = [...remote, ...localOnly].sort((a, b) =>
            b.updatedAt.localeCompare(a.updatedAt)
          );
          setDiagrams(merged);
          writeLocalStorage(merged);
          setIsLoading(false);
          return;
        }
      } catch {
        // バックエンド未起動時は LocalStorage のみ使用
      }

      setDiagrams(local);
      setIsLoading(false);
      void localMap; // suppress unused warning
    };
    load();
  }, []);

  const saveDiagram = useCallback(
    async (data: { name: string; type: string; mermaidCode: string; description?: string; tags?: string[]; folder?: string; llmProvider?: string }): Promise<SavedDiagram | null> => {
      try {
        const res = await fetch('/api/diagrams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            type: data.type,
            mermaidCode: data.mermaidCode,
            description: data.description ?? '',
            tags: data.tags ?? [],
            folder: data.folder ?? '',
            llmProvider: data.llmProvider ?? 'manual',
          }),
        });
        const result = await res.json();
        if (result.success) {
          const newDiagram: SavedDiagram = result.diagram;
          setDiagrams((prev) => {
            const updated = [newDiagram, ...prev].slice(0, 50);
            writeLocalStorage(updated);
            return updated;
          });
          return newDiagram;
        }
      } catch {
        // バックエンド未起動時は LocalStorage のみ
      }

      // フォールバック: LocalStorage のみ保存
      const fallback: SavedDiagram = {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type,
        mermaidCode: data.mermaidCode,
        description: data.description ?? '',
        tags: data.tags ?? [],
        folder: data.folder ?? '',
        llmProvider: data.llmProvider ?? 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDiagrams((prev) => {
        const updated = [fallback, ...prev].slice(0, 50);
        writeLocalStorage(updated);
        return updated;
      });
      return fallback;
    },
    []
  );

  const moveDiagram = useCallback(async (id: string, folder: string): Promise<void> => {
    try {
      await fetch(`/api/diagrams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
    } catch {
      // バックエンド未起動時はスキップ
    }
    setDiagrams((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, folder, updatedAt: new Date().toISOString() } : d
      );
      writeLocalStorage(updated);
      return updated;
    });
  }, []);

  const deleteDiagram = useCallback(async (id: string): Promise<void> => {
    try {
      await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
    } catch {
      // バックエンド未起動時はスキップ
    }
    setDiagrams((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      writeLocalStorage(updated);
      return updated;
    });
  }, []);

  return { diagrams, isLoading, saveDiagram, deleteDiagram, moveDiagram };
}
