'use client';

import { useEffect, useRef, useId } from 'react';

interface Props {
  code: string;
}

export default function DiagramPreview({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const stableId = rawId.replace(/:/g, '');
  const mermaidInitialized = useRef(false);
  const renderCounter = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const trimmed = code.trim();
    if (!trimmed) {
      containerRef.current.innerHTML = '';
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [{ default: mermaid }, { default: DOMPurify }] = await Promise.all([
          import('mermaid'),
          import('dompurify'),
        ]);

        if (!mermaidInitialized.current) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: { padding: 24 },
          });
          mermaidInitialized.current = true;
        }

        renderCounter.current += 1;
        const renderId = `mermaid-${stableId}-${renderCounter.current}`;

        // 同IDの残留要素をレンダリング前後に削除（HMR や再マウント時の衝突を防ぐ）
        document.getElementById(renderId)?.remove();
        const { svg, bindFunctions } = await mermaid.render(renderId, trimmed);
        document.getElementById(renderId)?.remove();

        if (cancelled || !containerRef.current) return;

        // foreignObject: flowchart/class/state 系がラベルを HTML として描画するため必要
        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['style', 'foreignObject'],
          ADD_ATTR: ['xmlns', 'requiredExtensions'],
        });
        containerRef.current.innerHTML = sanitized;

        // SVG内styleを注入してレイアウト・配色を調整
        const svgEl = containerRef.current.querySelector('svg');
        if (svgEl) {
          const labelStyle = document.createElement('style');
          labelStyle.textContent = `
            g.edgeLabel g.label foreignObject {
              background-color: rgba(255, 255, 255, 0.88);
              border-radius: 4px;
              overflow: visible;
            }
          `;
          svgEl.appendChild(labelStyle);
        }

        if (bindFunctions) bindFunctions(containerRef.current);

        // DOMPurify(svg profile)が foreignObject 内の div を strip するため
        // XHTML 名前空間で div を再生成し white-space: nowrap を適用する
        svgEl?.querySelectorAll('.node .label foreignObject').forEach((fo) => {
          (fo as SVGForeignObjectElement).style.overflow = 'visible';
          let div = fo.querySelector('div') as HTMLElement | null;
          if (!div) {
            div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div') as HTMLElement;
            while (fo.firstChild) div.appendChild(fo.firstChild);
            fo.appendChild(div);
          }
          div.style.whiteSpace = 'nowrap';
          div.style.width = 'max-content';
        });

        // マインドマップ: ルートノード（section-root）の円背景を薄い青に上書き
        const rootCircle = containerRef.current?.querySelector('.section-root .node-bkg') as SVGElement | null;
        if (rootCircle) {
          rootCircle.style.setProperty('fill', '#bfdbfe', 'important');
          rootCircle.style.setProperty('stroke', '#3b82f6', 'important');
        }
      } catch {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML =
          '<p style="color:#ef4444;font-size:0.875rem;padding:0.5rem">Mermaid コードにエラーがあります</p>';
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, stableId]);

  return (
    <div className="flex-1 overflow-auto bg-white min-h-0">
      <div
        ref={containerRef}
        className="diagram-preview p-4 flex items-center justify-center min-h-full"
        style={{ color: '#333333' }}
      />
    </div>
  );
}
