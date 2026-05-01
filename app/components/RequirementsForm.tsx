'use client';

import { useState } from 'react';

const PROVIDERS = [
  { value: 'anthropic', label: 'Claude' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'ollama', label: 'Ollama', noKey: true },
  { value: 'azure', label: 'Azure' },
  { value: 'openai-compatible', label: 'カスタム' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  apiKeyConfigured: boolean;
  provider: string;
  onProviderChange: (provider: string) => void;
  keyStatus: Record<string, boolean>;
}

export default function RequirementsForm({
  value, onChange, onGenerate, isGenerating, apiKeyConfigured, provider, onProviderChange, keyStatus,
}: Props) {
  const [open, setOpen] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isGenerating && apiKeyConfigured) onGenerate();
    }
  };

  return (
    <div className="p-3 border-t">
      <div className="flex items-center gap-1.5 mb-2">
        {/* タイトル */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 shrink-0"
        >
          AI 生成
        </button>

        {/* プロバイダ選択 */}
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="flex-1 min-w-0 px-1.5 py-0.5 text-xs border rounded bg-white text-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {PROVIDERS.map(({ value: v, label, noKey }) => {
            const configured = noKey || !!keyStatus[v];
            return (
              <option key={v} value={v}>
                {configured ? `✓ ${label}` : `✗ ${label}`}
              </option>
            );
          })}
        </select>

        {/* 設定状態バッジ */}
        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          apiKeyConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {apiKeyConfigured ? '✓' : '⚠'}
        </span>

        {/* 開閉トグル */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-gray-400 hover:text-gray-600 text-xs"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <>
          {!apiKeyConfigured && (
            <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed">
              AIによる図の自動生成には API キーの設定が必要です。
              右上の <strong>設定</strong> から登録してください。
            </div>
          )}
          <textarea
            className={`w-full h-28 p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-opacity ${
              !apiKeyConfigured ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''
            }`}
            placeholder={'図の要件を入力してください...\n(Cmd+Enter で生成)'}
            value={value}
            onChange={(e) => { if (apiKeyConfigured) onChange(e.target.value); }}
            onKeyDown={handleKeyDown}
            disabled={!apiKeyConfigured}
          />
          <button
            onClick={onGenerate}
            disabled={isGenerating || !value.trim() || !apiKeyConfigured}
            className="mt-2 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isGenerating ? '生成中...' : '生成'}
          </button>
        </>
      )}
    </div>
  );
}
