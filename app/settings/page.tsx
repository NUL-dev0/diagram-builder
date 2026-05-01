'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Provider = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'azure' | 'openai-compatible';

const PROVIDERS: { value: Provider; label: string; needsKey: boolean }[] = [
  { value: 'anthropic',         label: 'Claude (Anthropic)',          needsKey: true },
  { value: 'openai',            label: 'OpenAI',                      needsKey: true },
  { value: 'gemini',            label: 'Gemini (Google)',              needsKey: true },
  { value: 'ollama',            label: 'Ollama（ローカル・送信なし）', needsKey: false },
  { value: 'azure',             label: 'Azure OpenAI',                needsKey: true },
  { value: 'openai-compatible', label: 'カスタム（OpenAI 互換）',     needsKey: true },
];

export default function SettingsPage() {
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  const [keySource, setKeySource] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<Provider>('anthropic');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const fetchKeyStatus = () => {
    fetch('/api/config/key-status')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setKeyStatus(d.status);
          setKeySource(d.source ?? {});
        }
      })
      .catch(() => {});
  };

  useEffect(() => { fetchKeyStatus(); }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/config/save-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, apiKey: apiKeyInput }),
      });
      const data = await res.json();
      if (data.success) {
        fetchKeyStatus();
        setApiKeyInput('');
        showMessage('success', 'API キーを OS キーチェーンに保存しました');
      } else {
        showMessage('error', data.error ?? '保存に失敗しました');
      }
    } catch {
      showMessage('error', 'バックエンドへの接続に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/config/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider }),
      });
      const data = await res.json();
      showMessage(data.success ? 'success' : 'error', data.success ? data.message : data.error);
    } catch {
      showMessage('error', 'バックエンドへの接続に失敗しました');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    setConfirmDialog(false);
    try {
      await fetch('/api/config/delete-key', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider }),
      });
      fetchKeyStatus();
      showMessage('success', 'キーチェーンから API キーを削除しました');
    } catch {
      showMessage('error', '削除に失敗しました');
    }
  };

  const currentProvider = PROVIDERS.find((p) => p.value === selectedProvider)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h1 className="text-lg font-bold text-gray-900">設定</h1>
        <Link href="/" className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700">
          ← 戻る
        </Link>
      </header>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        {/* メッセージ */}
        {message && (
          <div className={`px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* LLM プロバイダ設定 */}
        <section className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">LLM プロバイダ設定</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">プロバイダ</label>
            <select
              value={selectedProvider}
              onChange={(e) => { setSelectedProvider(e.target.value as Provider); setApiKeyInput(''); }}
              className="w-full px-3 py-2 text-sm border rounded bg-white text-gray-700"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} {keyStatus[p.value] ? '✅' : ''}
                </option>
              ))}
            </select>
          </div>

          {currentProvider.needsKey ? (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                API キー{' '}
                {keySource[selectedProvider] === 'keychain' && <span className="text-green-600">（キーチェーンに保存済み）</span>}
                {keySource[selectedProvider] === 'env' && <span className="text-blue-600">（.env ファイルから読み込み中）</span>}
              </label>
              {keySource[selectedProvider] === 'env' && (
                <p className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  .env ファイルの環境変数からAPIキーを読み込んでいます。UIから削除はできません。削除する場合は .env ファイルを直接編集してください。
                </p>
              )}
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={keyStatus[selectedProvider] ? '新しいキーを入力して上書き' : 'API キーを入力'}
                className="w-full px-3 py-2 text-sm border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">OS キーチェーン（macOS Keychain / Windows Credential Manager）に保存されます</p>
            </div>
          ) : (
            <p className="text-sm text-green-600 bg-green-50 rounded px-3 py-2">
              ✅ Ollama はローカルで動作します。API キーは不要です。
            </p>
          )}

          <div className="flex gap-2">
            {currentProvider.needsKey && (
              <button
                onClick={handleSaveKey}
                disabled={isSaving || !apiKeyInput.trim()}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? '保存中...' : 'キーチェーンに保存'}
              </button>
            )}
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
            >
              {isTesting ? '接続中...' : 'テスト接続'}
            </button>
            {keySource[selectedProvider] === 'keychain' && (
              <button
                onClick={() => setConfirmDialog(true)}
                className="px-4 py-1.5 text-sm border border-red-200 rounded hover:bg-red-50 text-red-600 transition-colors ml-auto"
              >
                削除
              </button>
            )}
          </div>
        </section>

        {/* セキュリティ設定 */}
        <section className="bg-white rounded-lg border p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">セキュリティ</h2>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• API キーは OS キーチェーンに暗号化して保存されます</p>
            <p>• キーがログに出力されることはありません</p>
            <p>• 図の生成時に送信するデータを確認ダイアログで表示します</p>
            <p>• Ollama 使用時はデータが外部に送信されません</p>
          </div>
        </section>
      </div>

      {/* 削除確認ダイアログ */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <p className="text-sm text-gray-700 mb-4">
              {currentProvider.label} の API キーを削除しますか？
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDialog(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50 text-gray-700">キャンセル</button>
              <button onClick={handleDeleteKey} className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
