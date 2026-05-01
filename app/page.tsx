'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import DiagramTypeSelector from './components/DiagramTypeSelector';
import RequirementsForm from './components/RequirementsForm';
import DiagramList, { SavedDiagram } from './components/DiagramList';
import { DiagramType, DEFAULT_MERMAID_CODES } from './types/diagram';
import SecurityDialog from './components/SecurityDialog';

const DiagramPreview = dynamic(() => import('./components/DiagramPreview'), { ssr: false });
const MermaidEditor = dynamic(() => import('./components/MermaidEditor'), { ssr: false });

export default function Home() {
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture');
  const [requirements, setRequirements] = useState('');
  const [mermaidCode, setMermaidCode] = useState(DEFAULT_MERMAID_CODES.architecture);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedDiagrams] = useState<SavedDiagram[]>([]);
  const [editorHeight, setEditorHeight] = useState(192);
  const [editorVisible, setEditorVisible] = useState(true);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const provider = 'anthropic'; // Phase 4 で設定画面から変更可能にする
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleTypeChange = (type: DiagramType) => {
    setDiagramType(type);
    // eslint-disable-next-line security/detect-object-injection
    setMermaidCode(DEFAULT_MERMAID_CODES[type]);
  };

  const handleGenerate = () => {
    if (!requirements.trim() || isGenerating) return;
    setShowSecurityDialog(true);
  };

  const handleGenerateConfirmed = async () => {
    setShowSecurityDialog(false);
    setIsGenerating(true);
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
      } else {
        alert(`生成エラー: ${data.error}`);
      }
    } catch {
      alert('バックエンドへの接続に失敗しました。サーバが起動しているか確認してください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // Phase 4 で実装
    alert('保存機能は Phase 4 で実装予定です');
  };

  const handleExportPdf = () => {
    // Phase 5 で実装
    alert('PDF 出力は Phase 5 で実装予定です');
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
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル */}
        <aside className="w-72 flex flex-col border-r bg-white overflow-y-auto shrink-0">
          <DiagramTypeSelector selected={diagramType} onSelect={handleTypeChange} />
          <RequirementsForm
            value={requirements}
            onChange={setRequirements}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          <DiagramList diagrams={savedDiagrams} onSelect={() => {}} />
        </aside>

        {/* 右パネル */}
        <main className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
          {/* プレビュー */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <DiagramPreview code={mermaidCode} />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 px-4 py-2 border-t border-b bg-gray-50 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-3 py-1.5 text-sm border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
            >
              再生成
            </button>
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