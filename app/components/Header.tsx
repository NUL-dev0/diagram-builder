interface Props {
  onSettingsClick: () => void;
  selectedDiagramName?: string | null;
  onSave: () => void;
  onExportPdf: () => void;
  editorVisible: boolean;
  onToggleEditor: () => void;
}

export default function Header({ onSettingsClick, selectedDiagramName, onSave, onExportPdf, editorVisible, onToggleEditor }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white shrink-0">
      {/* 左: アプリ名 + 図名 */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-bold text-gray-900 shrink-0">DiagramBuilder</h1>
        {selectedDiagramName && (
          <>
            <span className="text-gray-300 shrink-0">/</span>
            <span className="text-sm text-gray-500 truncate max-w-[240px]" title={selectedDiagramName}>
              {selectedDiagramName}
            </span>
          </>
        )}
      </div>

      {/* 右: アクションボタン + 設定 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
        >
          保存
        </button>
        <button
          onClick={onExportPdf}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
        >
          PDF 出力
        </button>
        <button
          onClick={onToggleEditor}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
        >
          {editorVisible ? 'コードを隠す' : 'コードを表示'}
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <button
          onClick={onSettingsClick}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
        >
          設定
        </button>
      </div>
    </header>
  );
}
