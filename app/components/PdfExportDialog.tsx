'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SavedDiagram } from '../hooks/useDiagrams';

interface BackendInfo {
  projectRoot: string;
  backendDir: string;
  platform: string;
  isRunning: boolean;
}

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
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [osTab, setOsTab] = useState<'mac' | 'win'>('mac');
  const [isStarting, setIsStarting] = useState(false);
  const [startPhase, setStartPhase] = useState<'idle' | 'launching' | 'polling' | 'timeout'>('idle');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // バックエンド停止エラー時にプラットフォーム情報を取得
  useEffect(() => {
    if (errorMsg !== '__backend_down__') return;
    fetch('/api/start-backend')
      .then((r) => r.json())
      .then((data: BackendInfo) => {
        setBackendInfo(data);
        setOsTab(data.platform === 'win32' ? 'win' : 'mac');
      })
      .catch(() => {});
  }, [errorMsg]);

  // アンマウント時にポーリングを解除
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

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

  const handleStartBackend = useCallback(async () => {
    setIsStarting(true);
    setStartPhase('launching');
    try {
      await fetch('/api/start-backend', { method: 'POST' });
    } catch {
      setIsStarting(false);
      setStartPhase('idle');
      return;
    }

    setStartPhase('polling');
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/backend-health');
        if (res.ok) {
          clearInterval(pollRef.current!);
          setIsStarting(false);
          setStartPhase('idle');
          setErrorMsg(null);
          // 少し待ってから自動リトライ
          setTimeout(() => handleExport(), 500);
          return;
        }
      } catch { /* keep polling */ }
      if (attempts >= 20) { // 40秒タイムアウト
        clearInterval(pollRef.current!);
        setIsStarting(false);
        setStartPhase('timeout');
      }
    }, 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = useCallback(async () => {
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
        const data = await res.json().catch(() => null);
        const backendDown = data === null || !data.error;
        throw new Error(
          backendDown
            ? '__backend_down__'
            : data.error
        );
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
      const isDown = msg === '__backend_down__'
        || msg.includes('Failed to fetch')
        || msg.toLowerCase().includes('network');
      setErrorMsg(isDown ? '__backend_down__' : msg);
    } finally {
      setIsExporting(false);
    }
  }, [currentCode, currentType, diagrams, selectedIds, includeCurrent, orientation, includeCover, coverTitle, onClose]);


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
          {errorMsg === '__backend_down__' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs space-y-3">
              <p className="font-semibold text-red-700">バックエンドが起動していません</p>

              {/* OS タブ */}
              <div className="flex gap-1">
                {(['mac', 'win'] as const).map((os) => (
                  <button
                    key={os}
                    onClick={() => setOsTab(os)}
                    className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                      osTab === os ? 'bg-red-200 border-red-400 text-red-800' : 'border-red-200 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    {os === 'mac' ? 'Mac / Linux' : 'Windows'}
                  </button>
                ))}
              </div>

              {/* コマンド表示 */}
              {backendInfo ? (
                <div className="relative">
                  <code className="block bg-red-100 rounded px-2 py-1.5 font-mono text-red-800 break-all leading-relaxed">
                    {osTab === 'mac'
                      ? `cd "${backendInfo.backendDir}" && npm run dev`
                      : `cd /d "${backendInfo.backendDir}" && npm run dev`}
                  </code>
                  <button
                    onClick={() => {
                      const cmd = osTab === 'mac'
                        ? `cd "${backendInfo.backendDir}" && npm run dev`
                        : `cd /d "${backendInfo.backendDir}" && npm run dev`;
                      navigator.clipboard.writeText(cmd).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }}
                    className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-200 hover:bg-red-300 rounded text-red-700 text-xs"
                  >
                    {copied ? '✓ コピー済' : 'コピー'}
                  </button>
                </div>
              ) : (
                <div className="bg-red-100 rounded px-2 py-1.5 text-red-400 font-mono">取得中...</div>
              )}

              {/* 起動ボタン */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartBackend}
                  disabled={isStarting}
                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                >
                  {isStarting ? '起動中...' : 'バックエンドを起動する'}
                </button>
                {startPhase === 'polling' && (
                  <span className="text-red-500 text-xs">起動確認中（最大40秒）...</span>
                )}
                {startPhase === 'timeout' && (
                  <span className="text-red-600 text-xs">タイムアウト。手動で起動してください。</span>
                )}
              </div>
            </div>
          )}
          {errorMsg && errorMsg !== '__backend_down__' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
              {errorMsg}
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
