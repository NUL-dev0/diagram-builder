@AGENTS.md

# 実装状況

## 進捗サマリ
- **Phase 1（基盤 UI）: 完了** — GitHub Issues #1〜#18 すべてクローズ済み
- **Phase 2 以降**: 未着手（#19〜#68）

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 14.2.35（App Router）+ TypeScript |
| スタイル | Tailwind CSS v4（`@import "tailwindcss"` 構文） |
| 図レンダリング | Mermaid.js v10.9.0 |
| SVG サニタイズ | DOMPurify v3.4.2 |
| コードエディタ | @uiw/react-codemirror（oneDark テーマ） |
| バックエンド | Node.js + Express（未統合、Phase 2 以降） |

---

## ファイル構成（フロントエンド）

```
app/
├── page.tsx                      # メインレイアウト（左パネル + 右パネル）
├── globals.css                   # グローバルスタイル
├── types/
│   └── diagram.ts                # DiagramType / DEFAULT_MERMAID_CODES
└── components/
    ├── Header.tsx                # ヘッダー
    ├── DiagramTypeSelector.tsx   # 図の種類選択（10種類）
    ├── RequirementsForm.tsx      # 要件入力フォーム（Cmd+Enter で生成）
    ├── DiagramList.tsx           # 保存済み図一覧（Phase 4 で実装予定）
    ├── DiagramPreview.tsx        # Mermaid レンダリング（メイン）
    └── MermaidEditor.tsx         # CodeMirror エディタ
```

### レイアウト構造
```
Header
└── 左パネル（w-72）          右パネル（flex-1）
    ├── DiagramTypeSelector   ├── DiagramPreview（flex-1）
    ├── RequirementsForm      ├── アクションボタン（再生成・保存・PDF出力）
    └── DiagramList           └── MermaidEditor（h-48）
```

---

## DiagramPreview の実装詳細

`app/components/DiagramPreview.tsx` は最も複雑なコンポーネント。

### 重要な設計判断

**1. dynamic import + SSR 無効化**
```ts
const DiagramPreview = dynamic(() => import('./components/DiagramPreview'), { ssr: false });
```
Mermaid と DOMPurify はブラウザ専用 API を使うため必須。

**2. renderCounter による一意 ID 管理**
```ts
const renderCounter = useRef(0);
renderCounter.current += 1;
const renderId = `mermaid-${stableId}-${renderCounter.current}`;
document.getElementById(renderId)?.remove(); // レンダリング前
const { svg, bindFunctions } = await mermaid.render(renderId, trimmed);
document.getElementById(renderId)?.remove(); // レンダリング後
```
HMR・再マウント時に同 ID 要素が残留して衝突するのを防ぐ。

**3. DOMPurify の設定**
```ts
DOMPurify.sanitize(svg, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['style', 'foreignObject'],
  ADD_ATTR: ['xmlns', 'requiredExtensions'],
});
```
- `ADD_TAGS: ['style']` — Mermaid が SVG 内に埋め込む `<style>` を保持するために必須。これがないとすべての図でテキストが消える。
- `ADD_TAGS: ['foreignObject']` — flowchart / class / state 図のエッジラベルが HTML として描画されるため必須。

**4. SVG への `<style>` 注入（`bindFunctions` 前）**
```ts
const labelStyle = document.createElement('style');
labelStyle.textContent = `
  g.edgeLabel g.label foreignObject {
    background-color: rgba(255, 255, 255, 0.88);
    border-radius: 4px;
    overflow: visible;
  }
`;
svgEl.appendChild(labelStyle); // 先頭ではなく末尾に追加（Mermaid 内部 style より後に来るため）
```
フローチャートの yes/no エッジラベルに半透明白背景を付ける。`appendChild`（末尾）にしないと Mermaid の内部スタイルに上書きされる。

**5. マインドマップ ルートノード色（`bindFunctions` 後）**
```ts
const rootCircle = containerRef.current?.querySelector('.section-root .node-bkg') as SVGElement | null;
if (rootCircle) {
  rootCircle.style.setProperty('fill', '#bfdbfe', 'important');
  rootCircle.style.setProperty('stroke', '#3b82f6', 'important');
}
```
- ルートノードのクラスは `.root` ではなく **`.section-root`**
- 円要素は `circle.node-bkg.node-circle`
- CSS では Mermaid の内部スタイルに勝てないため、`bindFunctions` 実行後に JS でインラインスタイルを直接セット

### globals.css の注意点
```css
.diagram-preview svg text,
.diagram-preview svg tspan {
  fill: currentColor;
}
```
Mermaid はデフォルトで一部テキストに `fill` を設定しないことがあり、親要素の色を継承させるために追加。コンテナの `color: #333333` が currentColor として使われる。

---

## 未実装機能（スタブのみ）

| 機能 | 場所 | Phase |
|------|------|-------|
| LLM API 連携（図生成） | `page.tsx: handleGenerate` | Phase 2 |
| 図の保存 | `page.tsx: handleSave` | Phase 4 |
| PDF 出力 | `page.tsx: handleExportPdf` | Phase 5 |
| 図一覧・検索 | `DiagramList.tsx` | Phase 4 |
