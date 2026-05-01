'use client';

import { useState } from 'react';
import { SavedDiagram } from '../hooks/useDiagrams';

interface Props {
  diagrams: SavedDiagram[];
  onSelect: (diagram: SavedDiagram) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, folder: string) => void;
}

type SortKey = 'updatedAt' | 'name' | 'type';

const TYPE_LABELS: Record<string, string> = {
  usecase: 'ユースケース', architecture: 'アーキテクチャ', sequence: 'シーケンス',
  flowchart: 'フロー', class: 'クラス', er: 'ER', gantt: 'ガント',
  mindmap: 'マインドマップ', state: '状態遷移', graph: 'グラフ', network: 'ネットワーク',
};

const SORT_LABELS: Record<SortKey, string> = {
  updatedAt: '更新日時', name: '名前', type: '種別',
};

export default function DiagramList({ diagrams, onSelect, onDelete, onMove }: Props) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [movePopover, setMovePopover] = useState<string | null>(null);
  const [newFolderInput, setNewFolderInput] = useState('');

  const sorted = [...diagrams].sort((a, b) => {
    if (sortKey === 'updatedAt') return b.updatedAt.localeCompare(a.updatedAt);
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'ja');
    return (TYPE_LABELS[a.type] ?? a.type).localeCompare(TYPE_LABELS[b.type] ?? b.type, 'ja');
  });

  const filtered = sorted.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const allFolders = Array.from(
    new Set(diagrams.map((d) => d.folder ?? '').filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'ja'));

  const folderKeys = Array.from(new Set(filtered.map((d) => d.folder ?? ''))).sort((a, b) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return a.localeCompare(b, 'ja');
  });

  const toggleFolder = (key: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleMove = (id: string, folder: string) => {
    onMove(id, folder);
    setMovePopover(null);
    setNewFolderInput('');
  };

  return (
    <div className="p-3 border-t flex-1 flex flex-col min-h-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 hover:text-gray-700"
      >
        保存済み図
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          {diagrams.length > 0 && (
            <>
              <div className="flex gap-1 mb-2">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      sortKey === key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="名前・タグで検索"
                className="w-full px-2 py-1 text-xs border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              />
            </>
          )}

          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400">
              {diagrams.length === 0 ? 'まだ保存された図はありません' : '該当する図がありません'}
            </p>
          ) : (
            <div className="overflow-y-auto flex-1 pr-1 space-y-1">
              {folderKeys.map((folderKey) => {
                const items = filtered.filter((d) => (d.folder ?? '') === folderKey);
                const isCollapsed = collapsedFolders.has(folderKey);
                return (
                  <div key={folderKey}>
                    <button
                      onClick={() => toggleFolder(folderKey)}
                      className="w-full flex items-center gap-1 text-xs text-gray-500 font-semibold py-1 hover:text-gray-700"
                    >
                      <span className="text-gray-400">{isCollapsed ? '▶' : '▼'}</span>
                      <span>📁 {folderKey || '未分類'}</span>
                      <span className="text-gray-400 font-normal">({items.length})</span>
                    </button>

                    {!isCollapsed && (
                      <ul className="space-y-0.5 ml-3 mb-1">
                        {items.map((d) => (
                          <li key={d.id} className="group relative flex items-center gap-1">
                            <button
                              onClick={() => onSelect(d)}
                              className="flex-1 text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded truncate"
                              title={d.name}
                            >
                              <span className="block truncate">{d.name}</span>
                              <span className="text-gray-400">{TYPE_LABELS[d.type] ?? d.type}</span>
                            </button>
                            <button
                              onClick={() => {
                                setMovePopover(movePopover === d.id ? null : d.id);
                                setNewFolderInput('');
                              }}
                              className="opacity-0 group-hover:opacity-100 px-1.5 py-1 text-gray-400 hover:text-blue-500 transition-opacity rounded text-xs"
                              title="フォルダに移動"
                            >
                              📁
                            </button>
                            <button
                              onClick={() => setDeleteTarget(d.id)}
                              className="opacity-0 group-hover:opacity-100 px-1.5 py-1 text-gray-400 hover:text-red-500 transition-opacity rounded text-xs"
                              title="削除"
                            >
                              ✕
                            </button>

                            {movePopover === d.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setMovePopover(null)}
                                />
                                <div className="absolute right-0 top-full z-20 bg-white border rounded shadow-lg p-2 w-40 text-xs">
                                  <p className="font-semibold text-gray-600 mb-1">移動先フォルダ</p>
                                  {folderKey !== '' && (
                                    <button
                                      onClick={() => handleMove(d.id, '')}
                                      className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-500"
                                    >
                                      未分類
                                    </button>
                                  )}
                                  {allFolders.filter((f) => f !== folderKey).map((f) => (
                                    <button
                                      key={f}
                                      onClick={() => handleMove(d.id, f)}
                                      className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded truncate"
                                    >
                                      {f}
                                    </button>
                                  ))}
                                  <div className="flex gap-1 mt-1 pt-1 border-t">
                                    <input
                                      value={newFolderInput}
                                      onChange={(e) => setNewFolderInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newFolderInput.trim()) {
                                          handleMove(d.id, newFolderInput.trim());
                                        }
                                      }}
                                      placeholder="新規フォルダ名"
                                      className="flex-1 px-1 py-0.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => { if (newFolderInput.trim()) handleMove(d.id, newFolderInput.trim()); }}
                                      disabled={!newFolderInput.trim()}
                                      className="px-1.5 py-0.5 bg-blue-600 text-white rounded disabled:opacity-50"
                                    >
                                      ✓
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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
