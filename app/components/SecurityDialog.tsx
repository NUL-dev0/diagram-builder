'use client';

interface Props {
  provider: string;
  diagramType: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Claude (Anthropic)',
  openai: 'OpenAI',
  gemini: 'Gemini (Google)',
  ollama: 'Ollama（ローカル・送信なし）',
  azure: 'Azure OpenAI',
  'openai-compatible': 'カスタムプロバイダ',
};

export default function SecurityDialog({ provider, diagramType, onConfirm, onCancel }: Props) {
  const isLocal = provider === 'ollama';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">⚠️ 外部 API に送信されるデータ</h2>
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p><span className="font-medium">プロバイダ:</span> {PROVIDER_LABELS[provider] ?? provider}</p>
          <p><span className="font-medium">送信内容:</span></p>
          <ul className="ml-3 list-disc text-xs space-y-0.5 text-gray-500">
            <li>入力した要件テキスト</li>
            <li>図の種類（{diagramType}）</li>
            {!isLocal && <li>現在の Mermaid コード（再生成時）</li>}
          </ul>
          {isLocal
            ? <p className="text-green-600 text-xs mt-2">✅ Ollama はローカル実行のため外部送信なし</p>
            : <p className="text-amber-600 text-xs mt-2">※ 機密情報は入力しないでください</p>
          }
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            送信する
          </button>
        </div>
      </div>
    </div>
  );
}
