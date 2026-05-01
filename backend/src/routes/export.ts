import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generatePdf } from '../services/pdfService';

const router = Router();

const ExportSchema = z.object({
  diagrams: z.array(z.object({
    name: z.string().max(200),
    type: z.string().max(50),
    svg: z.string().max(2_000_000),
    updatedAt: z.string(),
  })).min(1).max(50),
  options: z.object({
    orientation: z.enum(['portrait', 'landscape']).default('portrait'),
    includeCover: z.boolean().default(false),
    coverTitle: z.string().max(200).optional(),
  }),
});

router.post('/pdf', async (req: Request, res: Response) => {
  const parsed = ExportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  try {
    const pdf = await generatePdf(parsed.data.diagrams, parsed.data.options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="diagrams.pdf"');
    return res.send(pdf);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF生成に失敗しました';
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
