import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createProvider } from '../services/llm/factory';
import { buildPrompt } from '../services/prompts/diagramPrompts';
import { LLMProviderName } from '../services/llm/types';

const router = Router();

const GenerateSchema = z.object({
  diagramType: z.string().min(1).max(50),
  description: z.string().min(1).max(5000),
  currentCode: z.string().max(10000).optional(),
  provider: z.enum(['anthropic', 'openai', 'gemini', 'ollama', 'azure']),
  model: z.string().max(100).optional(),
});

router.post('/generate', async (req: Request, res: Response) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten() });
  }

  const { diagramType, description, currentCode, provider, model } = parsed.data;

  try {
    const llm = createProvider(provider as LLMProviderName);
    const prompt = buildPrompt(diagramType, description, currentCode);
    const raw = await llm.generate(prompt, model);
    const mermaidCode = extractMermaidCode(raw);
    return res.json({ success: true, mermaidCode, provider, model: model ?? llm.defaultModel });
  } catch (err) {
    const message = err instanceof Error ? err.message : '生成に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

function extractMermaidCode(raw: string): string {
  // コードブロックが含まれていれば中身だけ取り出す
  const match = raw.match(/```(?:mermaid)?\n?([\s\S]*?)```/);
  return (match ? match[1] : raw).trim();
}

export default router;
