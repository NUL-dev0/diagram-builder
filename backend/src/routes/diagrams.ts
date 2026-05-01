import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createProvider } from '../services/llm/factory';
import { buildPrompt } from '../services/prompts/diagramPrompts';
import { LLMProviderName } from '../services/llm/types';
import { listDiagrams, getDiagram, saveDiagram, updateDiagram, deleteDiagram } from '../services/storageService';

const router = Router();

const ProviderEnum = z.enum(['anthropic', 'openai', 'gemini', 'ollama', 'azure', 'openai-compatible']);

const GenerateSchema = z.object({
  diagramType: z.string().min(1).max(50),
  description: z.string().min(1).max(5000),
  currentCode: z.string().max(10000).optional(),
  provider: ProviderEnum,
  model: z.string().max(100).optional(),
});

const SaveSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  description: z.string().max(2000).default(''),
  mermaidCode: z.string().min(1).max(10000),
  tags: z.array(z.string().max(50)).max(10).default([]),
  folder: z.string().max(100).default(''),
  llmProvider: z.string().max(50).default('manual'),
});

// 図の生成
router.post('/generate', async (req: Request, res: Response) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

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

// 図一覧取得
router.get('/', async (_req: Request, res: Response) => {
  try {
    const diagrams = await listDiagrams();
    return res.json({ success: true, diagrams });
  } catch (err) {
    const message = err instanceof Error ? err.message : '取得に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

// 図の取得
router.get('/:id', async (req: Request, res: Response) => {
  const diagram = await getDiagram(req.params.id);
  if (!diagram) return res.status(404).json({ success: false, error: '図が見つかりません' });
  return res.json({ success: true, diagram });
});

// 図の保存
router.post('/', async (req: Request, res: Response) => {
  const parsed = SaveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  try {
    const diagram = await saveDiagram(parsed.data);
    return res.status(201).json({ success: true, diagram });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

// 図の更新
router.patch('/:id', async (req: Request, res: Response) => {
  const diagram = await updateDiagram(req.params.id, req.body);
  if (!diagram) return res.status(404).json({ success: false, error: '図が見つかりません' });
  return res.json({ success: true, diagram });
});

// 図の削除
router.delete('/:id', async (req: Request, res: Response) => {
  const ok = await deleteDiagram(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: '図が見つかりません' });
  return res.json({ success: true });
});

function extractMermaidCode(raw: string): string {
  const match = raw.match(/```(?:mermaid)?\n?([\s\S]*?)```/);
  return (match ? match[1] : raw).trim();
}

export default router;
