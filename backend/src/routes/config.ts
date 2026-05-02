import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createProvider } from '../services/llm/factory';
import { LLMProviderName } from '../services/llm/types';
import { saveApiKey, hasApiKey, deleteApiKey, getKeySource } from '../services/keychainService';

const router = Router();

const ProviderEnum = z.enum(['anthropic', 'openai', 'gemini', 'ollama', 'azure', 'openai-compatible']);

const TestConnectionSchema = z.object({
  provider: ProviderEnum,
  model: z.string().max(100).optional(),
});

const SaveKeySchema = z.object({
  provider: ProviderEnum,
  apiKey: z.string().min(1).max(500),
});

const DeleteKeySchema = z.object({
  provider: ProviderEnum,
});

// テスト接続
router.post('/test-connection', async (req: Request, res: Response) => {
  const parsed = TestConnectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const { provider, model } = parsed.data;
  try {
    const llm = createProvider(provider as LLMProviderName);
    await llm.testConnection(model);
    return res.json({ success: true, message: `${provider} への接続に成功しました` });
  } catch (err) {
    const message = err instanceof Error ? err.message : '接続に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

// API キーを OS キーチェーンに保存
router.post('/save-key', async (req: Request, res: Response) => {
  const parsed = SaveKeySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const { provider, apiKey } = parsed.data;
  try {
    await saveApiKey(provider, apiKey);
    return res.json({ success: true, message: 'API キーを保存しました' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

// カスタムモデル（デフォルト）の保存・取得
router.post('/save-model', async (req: Request, res: Response) => {
  const parsed = z.object({ model: z.string().min(1).max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  try {
    await saveApiKey('openai-compatible-model', parsed.data.model);
    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

// カスタムベースURL の保存・取得
router.post('/save-url', async (req: Request, res: Response) => {
  const parsed = z.object({ url: z.string().min(1).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  try {
    await saveApiKey('openai-compatible-url', parsed.data.url);
    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

router.get('/custom-url', async (_req: Request, res: Response) => {
  const { getApiKey } = await import('../services/keychainService');
  const url = await getApiKey('openai-compatible-url') ?? process.env.CUSTOM_BASE_URL ?? '';
  return res.json({ success: true, url });
});

// API キーの保存状態を確認（キー本体は返さない）
router.get('/key-status', async (_req: Request, res: Response) => {
  const providers = ['anthropic', 'openai', 'gemini', 'ollama', 'azure', 'openai-compatible'];
  const status: Record<string, boolean> = {};
  const source: Record<string, string> = {};
  for (const p of providers) {
    status[p] = await hasApiKey(p);
    source[p] = await getKeySource(p);
  }
  const { getApiKey } = await import('../services/keychainService');
  const customUrl = await getApiKey('openai-compatible-url') ?? process.env.CUSTOM_BASE_URL ?? '';
  const customModel = await getApiKey('openai-compatible-model') ?? process.env.CUSTOM_DEFAULT_MODEL ?? '';
  return res.json({ success: true, status, source, customUrl, customModel });
});

// API キーを削除
router.delete('/delete-key', async (req: Request, res: Response) => {
  const parsed = DeleteKeySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  try {
    await deleteApiKey(parsed.data.provider);
    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '削除に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
