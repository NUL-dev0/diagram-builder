'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import DiagramTypeSelector from './components/DiagramTypeSelector';
import RequirementsForm from './components/RequirementsForm';
import DiagramList, { SavedDiagram } from './components/DiagramList';
import { DiagramType, DEFAULT_MERMAID_CODES } from './types/diagram';

const DiagramPreview = dynamic(() => import('./components/DiagramPreview'), { ssr: false });
const MermaidEditor = dynamic(() => import('./components/MermaidEditor'), { ssr: false });

export default function Home() {
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture');
  const [requirements, setRequirements] = useState('');
  const [mermaidCode, setMermaidCode] = useState(DEFAULT_MERMAID_CODES.architecture);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedDiagrams] = useState<SavedDiagram[]>([]);

  const handleTypeChange = (type: DiagramType) => {
    setDiagramType(type);
    // eslint-disable-next-line security/detect-object-injection
    setMermaidCode(DEFAULT_MERMAID_CODES[type]);
  };

  const handleGenerate = async () => {
    if (!requirements.trim() || isGenerating) return;
    setIsGenerating(true);
    // Phase 2 で LLM API を統合
    await new Promise((resolve) => setTimeout(resolve, 500));
    // eslint-disable-next-line security/detect-object-injection
    setMermaidCode(DEFAULT_MERMAID_CODES[diagramType]);
    setIsGenerating(false);
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
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* プレビュー */}
          <div className="flex-1 flex flex-col min-h-0">
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
          </div>

          {/* Mermaid コードエディタ */}
          <div className="h-48 shrink-0">
            <MermaidEditor value={mermaidCode} onChange={setMermaidCode} />
          </div>
        </main>
      </div>
    </div>
  );
}
