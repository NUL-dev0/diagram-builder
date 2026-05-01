import puppeteer from 'puppeteer';

export interface DiagramPage {
  name: string;
  type: string;
  svg: string;
  updatedAt: string;
}

export interface PdfOptions {
  orientation: 'portrait' | 'landscape';
  includeCover: boolean;
  coverTitle?: string;
}

export async function generatePdf(diagrams: DiagramPage[], options: PdfOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(diagrams, options), { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({
      format: 'A4',
      landscape: options.orientation === 'landscape',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function buildHtml(diagrams: DiagramPage[], options: PdfOptions): string {
  const typeLabels: Record<string, string> = {
    usecase: 'ユースケース図', architecture: 'アーキテクチャ図', sequence: 'シーケンス図',
    flowchart: 'フローチャート', class: 'クラス図', er: 'ER図', gantt: 'ガントチャート',
    mindmap: 'マインドマップ', state: '状態遷移図', graph: 'グラフ・ネットワーク図', network: 'ネットワーク構成図',
  };

  const pages: string[] = [];

  if (options.includeCover && options.coverTitle) {
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    pages.push(`
      <div class="page cover">
        <div class="cover-inner">
          <div class="cover-logo">DiagramBuilder</div>
          <h1 class="cover-title">${esc(options.coverTitle)}</h1>
          <p class="cover-date">${today}</p>
          <p class="cover-count">${diagrams.length} 図</p>
        </div>
      </div>`);
  }

  for (const d of diagrams) {
    const label = typeLabels[d.type] ?? d.type;
    const date = new Date(d.updatedAt).toLocaleDateString('ja-JP');
    pages.push(`
      <div class="page diagram-page">
        <div class="diagram-header">
          <h2 class="diagram-name">${esc(d.name)}</h2>
          <span class="diagram-meta">${esc(label)} · 更新: ${date}</span>
        </div>
        <div class="diagram-body">${d.svg}</div>
      </div>`);
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', sans-serif; }
  .page { width: 100%; page-break-after: always; }
  .page:last-child { page-break-after: avoid; }

  /* 表紙 */
  .cover { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f7ff; }
  .cover-inner { text-align: center; }
  .cover-logo { font-size: 13px; color: #3b82f6; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 24px; }
  .cover-title { font-size: 28px; color: #1e293b; font-weight: 700; margin-bottom: 16px; line-height: 1.4; }
  .cover-date { font-size: 14px; color: #64748b; margin-bottom: 8px; }
  .cover-count { font-size: 13px; color: #94a3b8; }

  /* 図ページ */
  .diagram-page { padding: 0; }
  .diagram-header { border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8mm; }
  .diagram-name { font-size: 18px; color: #1e293b; font-weight: 600; }
  .diagram-meta { font-size: 11px; color: #94a3b8; display: block; margin-top: 3px; }
  .diagram-body { display: flex; align-items: center; justify-content: center; }
  .diagram-body svg { max-width: 100%; height: auto; }
</style>
</head>
<body>${pages.join('\n')}</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
