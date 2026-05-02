'use client';

import { useState } from 'react';

type GenerationPhase = 'idle' | 'generating' | 'done' | 'error';

const PRESET_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-5-sonnet',
  'anthropic/claude-3-haiku',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
];

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
  generationPhase: GenerationPhase;
  generationError?: string | null;
  apiKeyConfigured: boolean;
  provider: string;
  onProviderChange: (provider: string) => void;
  keyStatus: Record<string, boolean>;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  customModels?: string[];
}

export default function RequirementsForm({
  value, onChange, onGenerate, generationPhase, generationError, apiKeyConfigured, provider, onProviderChange, keyStatus,
  selectedModel = '', onModelChange, customModels = [],
}: Props) {
  const [open, setOpen] = useState(true);
  const isGenerating = generationPhase === 'generating';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isGenerating && apiKeyConfigured) onGenerate();
    }
  };

  const buttonContent = () => {
    switch (generationPhase) {
      case 'generating':
        return (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            生成中...
          </span>
        );
      case 'done':
        return <span className="flex items-center justify-center gap-1.5">✓ 生成完了</span>;
      case 'error':
        return <span className="flex items-center justify-center gap-1.5">✗ エラー</span>;
      default:
        return '生成';
    }
  };

  const buttonClass = () => {
    const base = 'mt-2 w-full py-2 text-sm rounded font-medium transition-colors disabled:cursor-not-allowed';
    switch (generationPhase) {
      case 'done':   return `${base} bg-green-600 text-white`;
      case 'error':  return `${base} bg-red-600 text-white`;
      default:       return `${base} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`;
    }
  };

  return (
    <div className="p-3 border-t">
      <div className="flex items-center gap-1.5 mb-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 shrink-0"
        >
          AI 生成
        </button>

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

        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          apiKeyConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {apiKeyConfigured ? '✓' : '⚠'}
        </span>

        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-gray-400 hover:text-gray-600 text-xs"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && provider === 'openai-compatible' && onModelChange && (
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-2 py-1 text-xs border rounded bg-white text-gray-600 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">（デフォルトモデル）</option>
          <optgroup label="プリセット">
            {PRESET_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </optgroup>
          {customModels.length > 0 && (
            <optgroup label="カスタム">
              {customModels.map((m) => <option key={m} value={m}>{m}</option>)}
            </optgroup>
          )}
        </select>
      )}

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
            className={buttonClass()}
          >
            {buttonContent()}
          </button>
          {generationError && generationPhase === 'error' && (
            <div className="mt-1.5 px-2 py-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 leading-relaxed break-all">
              {generationError}
            </div>
          )}
        </>
      )}
    </div>
  );
}
