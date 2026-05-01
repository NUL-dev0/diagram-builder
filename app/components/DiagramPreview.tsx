'use client';

import { useEffect, useRef, useId, useState, useCallback } from 'react';

interface Props {
  code: string;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
const SCALE_STEP = 0.1;

export default function DiagramPreview({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const stableId = rawId.replace(/:/g, '');
  const mermaidInitialized = useRef(false);
  const renderCounter = useRef(0);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });

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

        document.getElementById(renderId)?.remove();
        const { svg, bindFunctions } = await mermaid.render(renderId, trimmed);
        document.getElementById(renderId)?.remove();

        if (cancelled || !containerRef.current) return;

        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['style', 'foreignObject'],
          ADD_ATTR: ['xmlns', 'requiredExtensions'],
        });
        containerRef.current.innerHTML = sanitized;

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

  // ホイールズーム（non-passive でデフォルトスクロールを防ぐ）
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((prev) => {
        const delta = e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((prev + delta) * 100) / 100));
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, tx: translate.x, ty: translate.y };
  }, [translate]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.mx;
      const dy = e.clientY - panStart.current.my;
      setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy });
    };
    const onUp = () => { isPanning.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const resetView = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  return (
    <div
      ref={outerRef}
      className="flex-1 overflow-hidden bg-white min-h-0 relative select-none"
      onMouseDown={handleMouseDown}
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
    >
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          ref={containerRef}
          className="diagram-preview p-4 flex items-center justify-center min-h-full"
          style={{ color: '#333333' }}
        />
      </div>

      {/* ズームコントロール */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 border rounded shadow-sm px-1.5 py-1">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setScale((s) => Math.min(MAX_SCALE, Math.round((s + SCALE_STEP) * 100) / 100))}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm font-bold"
          title="拡大"
        >＋</button>
        <span
          className="text-xs text-gray-500 w-10 text-center cursor-default select-none"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {Math.round(scale * 100)}%
        </span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setScale((s) => Math.max(MIN_SCALE, Math.round((s - SCALE_STEP) * 100) / 100))}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm font-bold"
          title="縮小"
        >－</button>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={resetView}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded text-sm"
          title="リセット"
        >⊙</button>
      </div>
    </div>
  );
}
