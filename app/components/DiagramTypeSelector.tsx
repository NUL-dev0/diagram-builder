'use client';

import { DiagramType, DIAGRAM_TYPES } from '../types/diagram';

interface Props {
  selected: DiagramType;
  onSelect: (type: DiagramType) => void;
}

export default function DiagramTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="p-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        図の種類
      </h2>
      <ul className="space-y-0.5">
        {DIAGRAM_TYPES.map(({ type, label }) => (
          <li key={type}>
            <button
              onClick={() => onSelect(type)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selected === type
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
