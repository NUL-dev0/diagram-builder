'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import DiagramTypeSelector from './components/DiagramTypeSelector';
import RequirementsForm from './components/RequirementsForm';
import DiagramList from './components/DiagramList';
import { DiagramType, DEFAULT_MERMAID_CODES } from './types/diagram';
import SecurityDialog from './components/SecurityDialog';
import PdfExportDialog from './components/PdfExportDialog';
import { useDiagrams } from './hooks/useDiagrams';

const DiagramPreview = dynamic(() => import('./components/DiagramPreview'), { ssr: false });
const MermaidEditor = dynamic(() => import('./components/MermaidEditor'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture');
  const [requirements, setRequirements] = useState('');
  const [mermaidCode, setMermaidCode] = useState(DEFAULT_MERMAID_CODES.architecture);
  const [cleanCode, setCleanCode] = useState(DEFAULT_MERMAID_CODES.architecture);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  type GenerationPhase = 'idle' | 'generating' | 'done' | 'error';
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>('idle');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [saveFolderInput, setSaveFolderInput] = useState('');
  const { diagrams, saveDiagram, overwriteDiagram, deleteDiagram, moveDiagram, updateDiagramMeta, folderOrder, reorderFolders } = useDiagrams();
  const [selectedDiagram, setSelectedDiagram] = useState<import('./hooks/useDiagrams').SavedDiagram | null>(null);
  const [saveChoiceDialogOpen, setSaveChoiceDialogOpen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(192);
  const [editorVisible, setEditorVisible] = useState(true);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [provider, setProvider] = useState<string>('openai-compatible');
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveEnterRef = useRef<number>(0);

  const apiKeyConfigured = provider === 'ollama' || !!keyStatus[provider];
  const isDirty = mermaidCode !== cleanCode;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    fetch('/api/config/key-status')
      .then((r) => r.json())
      .then((data) => { if (data.success) setKeyStatus(data.status); })
      .catch(() => {});
  }, [provider]);

  // ドラッグ中のマウスムーブ処理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dividerRef.current || !dividerRef.current.dataset.isDragging || dividerRef.current.dataset.isDragging === 'false') {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newEditorHeight = containerRect.bottom - e.clientY;

      // 最小高さ 100px、最大高さ (コンテナ高さ - 100px)
      const minHeight = 100;
      const maxHeight = containerRect.height - 100;

      if (newEditorHeight >= minHeight && newEditorHeight <= maxHeight) {
        setEditorHeight(newEditorHeight);
      }
    };

    const handleMouseUp = () => {
      if (dividerRef.current) {
        dividerRef.current.dataset.isDragging = 'false';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDividerMouseDown = () => {
    if (dividerRef.current) {
      dividerRef.current.dataset.isDragging = 'true';
    }
  };

  const triggerIfDirty = (action: () => void) => {
    if (isDirty) {
      pendingActionRef.current = action;
      setShowUnsavedDialog(true);
    } else {
      action();
    }
  };

  const handleTypeChange = (type: DiagramType) => {
    // eslint-disable-next-line security/detect-object-injection
    const code = DEFAULT_MERMAID_CODES[type];
    triggerIfDirty(() => {
      setDiagramType(type);
      setMermaidCode(code);
      setCleanCode(code);
      setSelectedDiagram(null);
    });
  };

  const handleGenerate = () => {
    if (!requirements.trim() || generationPhase === 'generating') return;
    setShowSecurityDialog(true);
  };

  const handleGenerateConfirmed = async () => {
    setShowSecurityDialog(false);
    setGenerationPhase('generating');
    setGenerationError(null);
    try {
      const res = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagramType,
          description: requirements,
          currentCode: mermaidCode,
          provider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMermaidCode(data.mermaidCode);
        setGenerationPhase('done');
        setTimeout(() => setGenerationPhase('idle'), 2500);
      } else {
        setGenerationError(data.error ?? '生成に失敗しました');
        setGenerationPhase('error');
        setTimeout(() => { setGenerationPhase('idle'); setGenerationError(null); }, 8000);
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : '生成に失敗しました');
      setGenerationPhase('error');
      setTimeout(() => { setGenerationPhase('idle'); setGenerationError(null); }, 8000);
    }
  };

  const handleSave = () => {
    if (selectedDiagram) {
      setSaveChoiceDialogOpen(true);
    } else {
      setSaveDialogOpen(true);
    }
  };

  const handleOverwrite = async () => {
    if (!selectedDiagram) return;
    await overwriteDiagram(selectedDiagram.id, mermaidCode);
    setSelectedDiagram((prev) => prev ? { ...prev, mermaidCode } : null);
    setCleanCode(mermaidCode);
    setSaveChoiceDialogOpen(false);
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  };

  const handleSaveConfirm = async () => {
    if (!saveNameInput.trim()) return;
    const saved = await saveDiagram({ name: saveNameInput.trim(), type: diagramType, mermaidCode, folder: saveFolderInput.trim(), llmProvider: provider });
    if (saved) setSelectedDiagram(saved);
    setCleanCode(mermaidCode);
    setSaveNameInput('');
    setSaveFolderInput('');
    setSaveDialogOpen(false);
    setSaveChoiceDialogOpen(false);
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  };

  const handleSelectDiagram = (diagram: import('./hooks/useDiagrams').SavedDiagram) => {
    triggerIfDirty(() => {
      setDiagramType(diagram.type as DiagramType);
      setMermaidCode(diagram.mermaidCode);
      setCleanCode(diagram.mermaidCode);
      setSelectedDiagram(diagram);
    });
  };

  const handleExportPdf = () => setShowPdfDialog(true);

  const handleSettingsClick = () => {
    triggerIfDirty(() => router.push('/settings'));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {showSecurityDialog && (
        <SecurityDialog
          provider={provider}
          diagramType={diagramType}
          onConfirm={handleGenerateConfirmed}
          onCancel={() => setShowSecurityDialog(false)}
        />
      )}
      {showPdfDialog && (
        <PdfExportDialog
          currentCode={mermaidCode}
          currentType={diagramType}
          diagrams={diagrams}
          onClose={() => setShowPdfDialog(false)}
        />
      )}
      {saveChoiceDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">保存方法を選択</h2>
            <p className="text-xs text-gray-500 mb-4">「{selectedDiagram?.name}」を編集中</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleOverwrite}
                className="w-full py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                上書き保存
              </button>
              <button
                onClick={() => { setSaveChoiceDialogOpen(false); setSaveDialogOpen(true); }}
                className="w-full py-2 text-sm border rounded hover:bg-gray-50 text-gray-700"
              >
                新規保存（別名で保存）
              </button>
              <button
                onClick={() => setSaveChoiceDialogOpen(false)}
                className="w-full py-2 text-sm border rounded hover:bg-gray-50 text-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">図を保存</h2>
            <input
              type="text"
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const now = Date.now();
                if (now - saveEnterRef.current < 500) {
                  saveEnterRef.current = 0;
                  handleSaveConfirm();
                } else {
                  saveEnterRef.current = now;
                }
              }}
              placeholder="図の名前を入力"
              autoFocus
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-2"
            />
            <input
              type="text"
              list="save-folder-list"
              value={saveFolderInput}
              onChange={(e) => setSaveFolderInput(e.target.value)}
              placeholder="フォルダ名（省略可）"
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-4"
            />
            <datalist id="save-folder-list">
              {Array.from(new Set(diagrams.map((d) => d.folder).filter(Boolean))).map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSaveDialogOpen(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700">キャンセル</button>
              <button onClick={handleSaveConfirm} disabled={!saveNameInput.trim()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">保存</button>
            </div>
          </div>
        </div>
      )}
      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 mx-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">変更が保存されていません</h2>
            <p className="text-sm text-gray-600 mb-4">
              現在の図への変更が失われます。<br />続ける前に保存しますか？
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowUnsavedDialog(false); setSaveDialogOpen(true); }}
                className="w-full py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存する
              </button>
              <button
                onClick={() => {
                  setShowUnsavedDialog(false);
                  const action = pendingActionRef.current;
                  pendingActionRef.current = null;
                  action?.();
                }}
                className="w-full py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                破棄して続ける
              </button>
              <button
                onClick={() => setShowUnsavedDialog(false)}
                className="w-full py-2 text-sm border rounded hover:bg-gray-50 text-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      <Header onSettingsClick={handleSettingsClick} />

      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル */}
        <aside className="w-72 flex flex-col border-r bg-white overflow-y-auto shrink-0">
          <DiagramTypeSelector selected={diagramType} onSelect={handleTypeChange} />
          <RequirementsForm
            value={requirements}
            onChange={setRequirements}
            onGenerate={handleGenerate}
            generationPhase={generationPhase}
            generationError={generationError}
            apiKeyConfigured={apiKeyConfigured}
            provider={provider}
            onProviderChange={setProvider}
            keyStatus={keyStatus}
          />
          <DiagramList diagrams={diagrams} onSelect={handleSelectDiagram} onDelete={deleteDiagram} onMove={moveDiagram} onUpdate={updateDiagramMeta} folderOrder={folderOrder} onReorderFolders={reorderFolders} />
        </aside>

        {/* 右パネル */}
        <main className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
          {/* プレビュー */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <DiagramPreview code={mermaidCode} />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 px-4 py-2 border-t border-b bg-gray-50 shrink-0 items-center">
            {selectedDiagram && (
              <span className="text-xs text-gray-500 truncate max-w-[200px]" title={selectedDiagram.name}>
                📄 {selectedDiagram.name}
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm border rounded hover:bg-white transition-colors text-gray-700"
            >
              保存
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 text-sm border rounded hover:bg-white transition-colors text-gray-700"
            >
              PDF 出力
            </button>
            <button
              onClick={() => setEditorVisible((v) => !v)}
              className="ml-auto px-3 py-1.5 text-sm border rounded hover:bg-white transition-colors text-gray-700"
            >
              {editorVisible ? 'コードを隠す' : 'コードを表示'}
            </button>
          </div>

          {/* リサイズディバイダー */}
          {editorVisible && (
            <div
              ref={dividerRef}
              onMouseDown={handleDividerMouseDown}
              className="h-1 bg-gray-300 hover:bg-blue-500 cursor-row-resize transition-colors shrink-0"
              data-is-dragging="false"
            />
          )}

          {/* Mermaid コードエディタ */}
          {editorVisible && (
            <div style={{ height: `${editorHeight}px` }} className="shrink-0 overflow-hidden flex flex-col">
              <MermaidEditor value={mermaidCode} onChange={setMermaidCode} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}