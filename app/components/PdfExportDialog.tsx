'use client';

import { useState } from 'react';
import { SavedDiagram } from '../hooks/useDiagrams';

interface Props {
  currentCode: string;
  currentType: string;
  diagrams: SavedDiagram[];
  onClose: () => void;
}

type Orientation = 'portrait' | 'landscape';

const TYPE_LABELS: Record<string, string> = {
  usecase: 'ユースケース図', architecture: 'アーキテクチャ図', sequence: 'シーケンス図',
  flowchart: 'フローチャート', class: 'クラス図', er: 'ER図', gantt: 'ガントチャート',
  mindmap: 'マインドマップ', state: '状態遷移図', graph: 'グラフ・ネットワーク図', network: 'ネットワーク構成図',
};

async function renderMermaidToSvg(code: string, id: string): Promise<string> {
  const [{ default: mermaid }, { default: DOMPurify }] = await Promise.all([
    import('mermaid'),
    import('dompurify'),
  ]);
  const renderId = `pdf-render-${id}-${Date.now()}`;
  document.getElementById(renderId)?.remove();
  try {
    const { svg } = await mermaid.render(renderId, code.trim());
    document.getElementById(renderId)?.remove();
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['style', 'foreignObject'],
      ADD_ATTR: ['xmlns', 'requiredExtensions'],
    });
  } catch {
    document.getElementById(renderId)?.remove();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60">
      <text x="10" y="35" fill="#ef4444" font-size="13">レンダリングエラー</text>
    </svg>`;
  }
}

export default function PdfExportDialog({ currentCode, currentType, diagrams, onClose }: Props) {
  const [includeCurrent, setIncludeCurrent] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [includeCover, setIncludeCover] = useState(false);
  const [coverTitle, setCoverTitle] = useState('DiagramBuilder 図面集');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const folderKeys = Array.from(new Set(diagrams.map((d) => d.folder ?? ''))).sort((a, b) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return a.localeCompare(b, 'ja');
  });

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleFolder = (folderKey: string, items: SavedDiagram[]) => {
    const allSelected = items.every((d) => selectedIds.has(d.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      items.forEach((d) => allSelected ? next.delete(d.id) : next.add(d.id));
      return next;
    });
  };

  const totalCount = (includeCurrent ? 1 : 0) + selectedIds.size;

  const handleExport = async () => {
    if (totalCount === 0) return;
    setIsExporting(true);
    setErrorMsg(null);

    try {
      const pages: { name: string; type: string; svg: string; updatedAt: string }[] = [];
      let counter = 0;

      if (includeCurrent) {
        const svg = await renderMermaidToSvg(currentCode, String(counter++));
        pages.push({ name: '現在の図', type: currentType, svg, updatedAt: new Date().toISOString() });
      }

      for (const d of diagrams.filter((d) => selectedIds.has(d.id))) {
        const svg = await renderMermaidToSvg(d.mermaidCode, String(counter++));
        pages.push({ name: d.name, type: d.type, svg, updatedAt: d.updatedAt });
      }

      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagrams: pages,
          options: { orientation, includeCover, coverTitle: includeCover ? coverTitle : undefined },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `サーバーエラー (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagrams_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました';
      const isNetwork = msg.includes('fetch') || msg.toLowerCase().includes('network') || msg.includes('Failed to fetch');
      setErrorMsg(
        isNetwork
          ? 'バックエンドに接続できません。バックエンドサーバー（npm run dev）を起動してください。'
          : msg
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintFallback = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-800">PDF 出力</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* 出力対象 */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">出力対象</p>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
              <input type="checkbox" checked={includeCurrent} onChange={(e) => setIncludeCurrent(e.target.checked)} />
              現在の図（{TYPE_LABELS[currentType] ?? currentType}）
            </label>

            {diagrams.length > 0 && (
              <div className="border rounded p-2 max-h-48 overflow-y-auto space-y-1">
                {folderKeys.map((folderKey) => {
                  const items = diagrams.filter((d) => (d.folder ?? '') === folderKey);
                  const allSelected = items.every((d) => selectedIds.has(d.id));
                  return (
                    <div key={folderKey}>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleFolder(folderKey, items)}
                        />
                        📁 {folderKey || '未分類'} ({items.length})
                      </label>
                      {items.map((d) => (
                        <label key={d.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer py-0.5 ml-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(d.id)}
                            onChange={() => toggleId(d.id)}
                          />
                          {d.name}
                          <span className="text-gray-400">{TYPE_LABELS[d.type] ?? d.type}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 用紙方向 */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">用紙方向</p>
            <div className="flex gap-2">
              {(['portrait', 'landscape'] as Orientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-colors ${
                    orientation === o ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{o === 'portrait' ? '▭' : '▬'}</span>
                  {o === 'portrait' ? 'A4 縦' : 'A4 横'}
                </button>
              ))}
            </div>
          </section>

          {/* 表紙 */}
          <section>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
              <input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} />
              表紙を追加する
            </label>
            {includeCover && (
              <input
                type="text"
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                placeholder="表紙タイトル"
                className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            )}
          </section>

          {/* エラー */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 space-y-2">
              <p>{errorMsg}</p>
              {errorMsg.includes('バックエンド') && (
                <button
                  onClick={handlePrintFallback}
                  className="underline text-red-600 hover:text-red-800"
                >
                  ブラウザ印刷で代替する
                </button>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-5 py-4 border-t">
          <span className="text-xs text-gray-400">{totalCount} 図 選択中</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700">
              キャンセル
            </button>
            <button
              onClick={handleExport}
              disabled={totalCount === 0 || isExporting}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '生成中...' : 'PDF 出力'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
