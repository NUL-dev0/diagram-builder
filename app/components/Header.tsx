interface Props {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
      <h1 className="text-lg font-bold text-gray-900">DiagramBuilder</h1>
      <button
        onClick={onSettingsClick}
        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
      >
        設定
      </button>
    </header>
  );
}
