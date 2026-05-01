@AGENTS.md

# 実装状況

## 進捗サマリ
- **Phase 1: 完了** ✅
- **Phase 2: 完了** ✅
- **Phase 3: 完了** ✅
- **Phase 4〜8: 未着手**

---

## Issue タスク一覧

> 最新状態は https://github.com/NUL-dev0/diagram-builder/issues で確認すること。

### Phase 1 — プロジェクト基盤構築 ✅ 完了
- [x] #1 リポジトリ作成・初期設定（README, LICENSE, .gitignore）
- [x] #2 .env.example / config.example.json の作成
- [x] #3 フロントエンド: React + TypeScript プロジェクト初期化
- [x] #4 バックエンド: Node.js + Express プロジェクト初期化
- [x] #5 ESLint + eslint-plugin-security の設定
- [x] #6 TypeScript 厳格モード（strict: true）の設定
- [x] #7 Husky + lint-staged でコミット前自動チェックを設定
- [x] #8 Tailwind CSS の導入・基本スタイル設定
- [x] #9 フロントエンド・バックエンド間の開発用プロキシ設定
- [x] #10 GitHub Actions: npm audit 自動チェック CI を作成

### Phase 2 — コア UI / Mermaid 統合 🔄 進行中
- [x] #11 メイン画面レイアウトの実装（左パネル + 右パネル）
- [x] #12 図の種類選択コンポーネントの実装（10種類）
- [x] #13 要件入力フォームの実装
- [x] #14 Mermaid.js の統合・リアルタイムプレビュー実装
- [x] #15 CodeMirror エディタの統合（Mermaid コード編集）
- [x] #16 プレビューのリアルタイム更新ロジックの実装
- [x] #17 Chrome / Edge / Firefox / Safari でのブラウザ互換テスト
- [x] #18 レスポンシブレイアウトの確認・調整
- [x] #69 「ネットワーク構成図」図タイプの追加（型定義・デフォルトコード・UI）

### Phase 3 — LLM 統合
- [x] #19 LLM プロバイダ抽象化レイヤーの設計・実装
- [x] #20 Claude API（Anthropic）の統合
- [x] #21 OpenAI API の統合
- [x] #22 Google Gemini API の統合
- [x] #23 Ollama（ローカル LLM）の統合
- [x] #24 Azure OpenAI の統合
- [x] #25 各図種別のプロンプトテンプレート作成（11種類）
- [x] #26 API 呼び出し前の送信データ確認ダイアログ実装
- [x] #27 「再生成」ボタンの実装
- [x] #28 各プロバイダの動作確認テスト
- [x] #70 「ネットワーク構成図」向け LLM プロンプト設計

### Phase 4 — セキュリティ・設定管理
- [ ] #29 OS キーチェーン連携（keytar）の実装
- [ ] #30 .env 経由での API キー管理ロジックの実装
- [ ] #31 設定画面 UI の実装（プロバイダ選択・API キー入力）
- [ ] #32 テスト接続機能の実装
- [ ] #33 セキュリティ設定 UI の実装
- [ ] #34 API キーがログに出力されないことを確認
- [ ] #35 パストラバーサル対策の実装・テスト
- [ ] #36 入力バリデーション（zod）の全エンドポイントへの適用
- [ ] #37 GitHub Secret Scanning / Dependabot の有効化

### Phase 5 — ストレージ・図管理
- [ ] #38 ローカルファイル保存機能の実装（JSON 形式）
- [ ] #39 ブラウザ LocalStorage 保存機能の実装
- [ ] #40 両ストレージ間の同期ロジックの実装
- [ ] #41 図一覧表示コンポーネントの実装
- [ ] #42 図の検索・タグフィルタ機能の実装
- [ ] #43 図の読み込み・再編集機能の実装
- [ ] #44 図の削除機能の実装
- [ ] #45 1000 件保存時のパフォーマンステスト

### Phase 6 — PDF 出力
- [ ] #46 Puppeteer / Chromium の導入・設定
- [ ] #47 単一図の PDF 出力機能の実装
- [ ] #48 複数図をまとめた PDF 出力機能の実装
- [ ] #49 PDF 表紙（タイトル・日付・説明）の実装
- [ ] #50 A4 縦横対応の確認・調整
- [ ] #51 PDF 出力ボタンの UI 実装

### Phase 7 — Electron 対応
- [ ] #52 Electron プロジェクトのセットアップ
- [ ] #53 Main Process / Renderer Process の構成設定
- [ ] #54 preload.ts による安全な IPC 通信の実装
- [ ] #55 nodeIntegration: false / contextIsolation: true の確認
- [ ] #56 Content Security Policy（CSP）の設定
- [ ] #57 electron-builder の設定（Mac .dmg / Windows .exe）
- [ ] #58 Mac 向けビルド・動作確認
- [ ] #59 Windows 向けビルド・動作確認
- [ ] #60 自動アップデート機能の実装（electron-updater）
- [ ] #61 GitHub Releases へのビルド成果物アップロード

### Phase 8 — ドキュメント・リリース
- [ ] #62 README.md の作成（インストール手順・セキュリティ注意事項含む）
- [ ] #63 CONTRIBUTING.md の作成（コントリビュートガイド）
- [ ] #64 CHANGELOG.md の作成
- [ ] #65 全ブラウザ（Chrome/Edge/Firefox/Safari）最終テスト
- [ ] #66 Mac / Windows 両環境での最終動作確認
- [ ] #67 npm audit 最終チェック・脆弱性ゼロの確認
- [ ] #68 v1.0.0 タグの作成・GitHub Release の公開

### 今後の拡張案（未 Issue 化）
- ラック実装図（カスタム SVG レンダラーが必要）
- クラウドデプロイ対応、チーム協調機能、多言語対応 等

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
