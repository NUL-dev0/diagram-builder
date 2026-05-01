'use client';

import { useState, useRef, useEffect } from 'react';
import { DiagramType, DIAGRAM_TYPES } from '../types/diagram';

interface Props {
  selected: DiagramType;
  onSelect: (type: DiagramType) => void;
}

export default function DiagramTypeSelector({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = DIAGRAM_TYPES.find((d) => d.type === selected)?.label ?? selected;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="px-3 py-2 border-b" ref={containerRef}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">図の種類</p>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-sm border rounded bg-white hover:bg-gray-50 text-gray-700 transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="ml-1 text-gray-400 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-52 bg-white border rounded shadow-lg max-h-72 overflow-y-auto">
          {DIAGRAM_TYPES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => { onSelect(type); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selected === type
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
