import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createProvider } from '../services/llm/factory';
import { LLMProviderName } from '../services/llm/types';

const router = Router();

const TestConnectionSchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'gemini', 'ollama', 'azure']),
  model: z.string().max(100).optional(),
});

router.post('/test-connection', async (req: Request, res: Response) => {
  const parsed = TestConnectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten() });
  }

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

export default router;
