'use client';

export interface SavedDiagram {
  id: string;
  name: string;
  type: string;
}

interface Props {
  diagrams: SavedDiagram[];
  onSelect: (id: string) => void;
}

export default function DiagramList({ diagrams, onSelect }: Props) {
  return (
    <div className="p-3 border-t flex-1">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        保存済み図
      </h2>
      {diagrams.length === 0 ? (
        <p className="text-xs text-gray-400">まだ保存された図はありません</p>
      ) : (
        <ul className="space-y-0.5">
          {diagrams.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => onSelect(d.id)}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded truncate"
              >
                {d.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
