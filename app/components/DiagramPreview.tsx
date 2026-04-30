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
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          mermaidInitialized.current = true;
        }

        const renderId = `mermaid-${stableId}`;
        const { svg, bindFunctions } = await mermaid.render(renderId, trimmed);

        // Mermaid がボディに残した要素を削除
        document.getElementById(renderId)?.remove();

        if (cancelled || !containerRef.current) return;

        const sanitized = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
        containerRef.current.innerHTML = sanitized;

        if (bindFunctions) bindFunctions(containerRef.current);
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
        className="p-4 flex items-center justify-center min-h-full"
      />
    </div>
  );
}
