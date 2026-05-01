'use client';

import { useState } from 'react';
import { SavedDiagram } from '../hooks/useDiagrams';

interface Props {
  diagrams: SavedDiagram[];
  onSelect: (diagram: SavedDiagram) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  usecase: 'ユースケース', architecture: 'アーキテクチャ', sequence: 'シーケンス',
  flowchart: 'フロー', class: 'クラス', er: 'ER', gantt: 'ガント',
  mindmap: 'マインドマップ', state: '状態遷移', graph: 'グラフ', network: 'ネットワーク',
};

export default function DiagramList({ diagrams, onSelect, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = diagrams.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3 border-t flex-1 flex flex-col min-h-0">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        保存済み図
      </h2>

      {diagrams.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・タグで検索"
          className="w-full px-2 py-1 text-xs border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400">
          {diagrams.length === 0 ? 'まだ保存された図はありません' : '該当する図がありません'}
        </p>
      ) : (
        <ul className="space-y-0.5 overflow-y-auto flex-1">
          {filtered.map((d) => (
            <li key={d.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelect(d)}
                className="flex-1 text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded truncate"
                title={d.name}
              >
                <span className="block truncate">{d.name}</span>
                <span className="text-gray-400">{TYPE_LABELS[d.type] ?? d.type}</span>
              </button>
              <button
                onClick={() => setDeleteTarget(d.id)}
                className="opacity-0 group-hover:opacity-100 px-1.5 py-1 text-gray-400 hover:text-red-500 transition-opacity rounded text-xs"
                title="削除"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 max-w-xs w-full mx-4">
            <p className="text-sm text-gray-700 mb-4">この図を削除しますか？</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700">キャンセル</button>
              <button
                onClick={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
