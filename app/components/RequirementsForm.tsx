'use client';

import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function RequirementsForm({ value, onChange, onGenerate, isGenerating }: Props) {
  const [open, setOpen] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isGenerating) onGenerate();
    }
  };

  return (
    <div className="p-3 border-t">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 hover:text-gray-700"
      >
        要件入力
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <>
          <textarea
            className="w-full h-28 p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder={'図の要件を入力してください...\n(Cmd+Enter で生成)'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={onGenerate}
            disabled={isGenerating || !value.trim()}
            className="mt-2 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isGenerating ? '生成中...' : '生成'}
          </button>
        </>
      )}
    </div>
  );
}
