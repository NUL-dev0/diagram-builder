# DiagramBuilder 仕様書

**文書版: 1.3**
**最終更新: 2026-04-30**
**ステータス: Draft**

---

## 変更履歴

| バージョン | 更新内容 | 日付 |
|-----------|---------|------|
| 1.0 | 初版作成 | 2026-04-30 |
| 1.1 | Electron 対応追加、セキュリティ見直し、オープンソース方針追加 | 2026-04-30 |
| 1.2 | セキュアコーディング規約・静的解析・依存関係管理ガイドライン追加 | 2026-04-30 |
| 1.3 | 対応ブラウザに Edge を追加 | 2026-04-30 |

---

## 1. プロジェクト概要

### 1.1 プロジェクト名
**DiagramBuilder** - ソフトウェア・システム図書・書類自動生成ツール

### 1.2 目的
ソフトウェア開発やシステム構築時に必要な各種図を、AI の補佐のもと効率的に作成・管理・出力できるツール。開発者やアーキテクト、チーム全体がユースケース図からシステムアーキテクチャ図まで様々な図表を自動または半自動で生成でき、チーム全体で共有・再利用が可能。

### 1.3 主な特徴
- **ハイブリッド構成**: Web UI として開発、Electron でデスクトップアプリ化
- **クロスプラットフォーム対応**: Mac / Windows / Linux 全対応
- **AI 補佐**: ユーザ設定の LLM API で図を自動生成
- **全図対応**: 10 種類以上の図に対応
- **柔軟な API**: Claude, OpenAI, Gemini, Ollama など自由に選択可能
- **両方のストレージ対応**: ローカルファイル + ブラウザ LocalStorage
- **リアルタイムプレビュー**: Mermaid による即座の図表表示
- **PDF 出力**: 複数図を 1 つのドキュメントにまとめて出力
- **セキュアな API キー管理**: 暗号化保存・環境変数対応
- **オープンソース**: MIT ライセンスで公開

### 1.4 利用シーン

| シーン | 説明 |
|-------|------|
| **個人利用** | 趣味・個人開発での図作成 |
| **会社利用** | 社内システム開発、チームでの設計ドキュメント作成 |
| **チーム共有** | GitHub 経由でのテンプレート・成果物の共有 |

---

## 2. ライセンス・オープンソース方針

### 2.1 ライセンス

**MIT ライセンス** を採用する。

```
MIT License

Copyright (c) 2026 [Author Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software...
```

#### MIT ライセンスを選択する理由

| 項目 | 内容 |
|------|------|
| **個人利用** | ✅ 自由に使用可能 |
| **会社利用** | ✅ 商用利用可能・コード公開義務なし |
| **改変・再配布** | ✅ 自由（ライセンス表記は必要） |
| **特許** | ⚠️ Apache 2.0 より保護は弱い（後から変更可能） |
| **会社の機密** | ✅ 会社固有の設定・データは公開不要 |

#### 会社利用時の運用例

```
個人の GitHub リポジトリ（オープンソース）
    ↓ fork または clone
会社の プライベートリポジトリ（非公開）
    ↓ 会社固有の設定・カスタマイズを追加
社内展開
```

> **注意**: MIT ライセンスのコードを利用する場合、ライセンス表記（著作権表示）は保持すること。

### 2.2 公開・非公開の分離方針

```
【公開】GitHub パブリックリポジトリ
├── ソースコード全般
├── README.md（インストール手順）
├── SPECIFICATION.md（本仕様書）
├── config.example.json（API キー等を含まないサンプル）
└── .env.example（環境変数サンプル）

【非公開】.gitignore で除外
├── config.json（実際の API キー設定）
├── .env（実際の環境変数）
├── diagrams/（作成した図のデータ）
└── node_modules/
```

---

## 3. セキュリティ設計

### 3.1 セキュリティ基本方針

1. **API キーは平文で Git に保存しない**
2. **外部に送信するデータを最小限にする**
3. **ユーザが何のデータを外部に送るか把握できるようにする**
4. **会社の機密情報を誤って LLM に送らないよう注意喚起する**

### 3.2 API キーの安全な管理

#### 3.2.1 問題点（旧仕様）

```json
// ❌ 旧仕様：平文で config.json に保存（危険）
{
  "llm": {
    "apiKey": "sk-ant-xxxxxxxxxxxx"
  }
}
```

#### 3.2.2 新しい管理方法（新仕様）

**方法 1: 環境変数（推奨）**

```bash
# .env ファイル（.gitignore で除外）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxx
```

```javascript
// アプリ側で読み込み
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.ANTHROPIC_API_KEY;
```

**方法 2: OS キーチェーン（より安全）**

Electron の場合、OS のキーチェーンを使用：

```javascript
// macOS Keychain / Windows Credential Manager に保存
import keytar from 'keytar';

// 保存
await keytar.setPassword('DiagramBuilder', 'anthropic_api_key', apiKey);

// 読み込み
const apiKey = await keytar.getPassword('DiagramBuilder', 'anthropic_api_key');
```

**方法 3: 設定ファイル（暗号化）**

ローカルのみで動作する場合の代替手段：

```javascript
// AES 暗号化で保存
import crypto from 'crypto';

const encrypt = (text, masterKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', masterKey, iv);
  // ...
};
```

#### 3.2.3 推奨優先順位

```
1位: OS キーチェーン（Electron 環境）
2位: .env ファイル（開発環境）
3位: 暗号化した設定ファイル（フォールバック）

❌ 使用禁止: 平文での config.json 保存
❌ 使用禁止: ソースコードへの直書き
```

### 3.3 .gitignore の設定

```gitignore
# API キー・認証情報
.env
.env.local
.env.production
config.json

# 図データ（個人・機密情報が含まれる可能性）
diagrams/

# 依存パッケージ
node_modules/

# ビルド成果物
dist/
build/
out/

# OS 生成ファイル
.DS_Store
Thumbs.db

# ログ
*.log
```

### 3.4 外部送信データの透明性

#### 送信されるデータ

LLM API を呼び出す際に外部に送信されるデータ：

```
送信されるデータ：
✅ ユーザが入力した図の要件テキスト
✅ 図の種類（例：architecture, sequence 等）
✅ 生成済み Mermaid コード（再生成時）

送信されないデータ：
❌ API キー以外の設定情報
❌ 保存済みの図（呼び出さない限り）
❌ PC のシステム情報
```

#### UI での表示

API 呼び出し前に以下を表示する：

```
┌─────────────────────────────────────┐
│ ⚠️  外部 API に送信されるデータ      │
│                                     │
│ プロバイダ: Claude (Anthropic)      │
│ 送信内容:                           │
│ - 入力したテキスト（要件）          │
│ - 図の種類                          │
│                                     │
│ ※ 機密情報は入力しないでください   │
│                                     │
│ [送信する] [キャンセル]             │
└─────────────────────────────────────┘
```

> **補足**: 初回のみ表示し、「今後表示しない」チェックボックスを設ける。

### 3.5 会社利用時のセキュリティ注意事項

ドキュメント（README.md）に以下を必ず記載する：

```markdown
## ⚠️ セキュリティに関する注意事項

### 会社・業務での利用について

1. **機密情報を入力しない**
   - 社内の機密データや個人情報を図の要件として入力しないでください
   - LLM API（Claude, OpenAI 等）の外部サーバに送信されます

2. **API キーの管理**
   - API キーを Git にコミットしないでください
   - チームで共有する場合は、各メンバーが個人の API キーを使用してください

3. **Ollama（ローカル LLM）の活用**
   - 機密性の高い案件では、Ollama 等のローカル LLM を使用することを強く推奨します
   - ローカル LLM はデータが外部に送信されません

4. **保存データの取り扱い**
   - diagrams/ フォルダのデータは社内の情報管理ポリシーに従って管理してください
```

### 3.6 セキュリティ設定の UI

設定画面に「セキュリティ設定」セクションを追加：

```
セキュリティ設定
┌─────────────────────────────────────┐
│ API 呼び出し前に確認を表示         │
│ ○ 毎回表示                         │
│ ○ 今セッションは表示しない        │
│ ○ 表示しない                       │
│                                     │
│ データ送信ログ                      │
│ □ ローカルに送信ログを保存         │
│                                     │
│ ローカル LLM 優先モード            │
│ □ Ollama が利用可能な場合は優先    │
└─────────────────────────────────────┘
```

---

## 4. システムアーキテクチャ

### 4.1 ハイブリッド構成（Web UI + Electron）

```
【開発モード】
ブラウザ → http://localhost:3000 → React Dev Server
                                         ↓
                                   Node.js バックエンド（port:3001）
                                         ↓
                                   LLM API / ローカルファイル

【本番モード（Electron）】
Electron アプリ起動
    ↓
内蔵 Chromium で React UI をレンダリング
    ↓
Electron Main Process が Node.js バックエンドを内包して起動
    ↓
LLM API / ローカルファイル
```

### 4.2 全体構成図

```
┌─────────────────────────────────────┐
│   Electron Shell（本番時）          │
│  ┌──────────────────────────────┐   │
│  │   フロントエンド（React）     │   │
│  │   - UI/UX                    │   │
│  │   - リアルタイムプレビュー   │   │
│  │   - LocalStorage 管理        │   │
│  └──────────────┬───────────────┘   │
│                 │ IPC / HTTP        │
│  ┌──────────────▼───────────────┐   │
│  │   バックエンド（Node.js）     │   │
│  │   - API エンドポイント       │   │
│  │   - LLM との通信             │   │
│  │   - Mermaid レンダリング     │   │
│  │   - PDF 生成                 │   │
│  │   - ファイル管理             │   │
│  │   - セキュリティ処理         │   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼──────┐  ┌───────▼────────┐
│ .env /        │  │ diagrams/      │
│ OS Keychain   │  │（保存図データ）│
│（API キー）   │  └───────────────-┘
└───────────────┘
         │
┌────────▼──────────────────────────┐
│   外部 LLM プロバイダ             │
│   - Claude API (Anthropic)       │
│   - OpenAI API                   │
│   - Google Gemini API            │
│   - Ollama（ローカル: 送信なし）  │
│   - Azure OpenAI                 │
└───────────────────────────────────┘
```

### 4.3 技術スタック

**フロントエンド:**
- React 18+
- TypeScript
- Mermaid.js（図表レンダリング）
- CodeMirror（コードエディタ）
- React Query（データ管理）
- Tailwind CSS（スタイリング）

**バックエンド:**
- Node.js 18+
- Express.js
- Axios（HTTP クライアント）
- Puppeteer または Chromium（PDF 生成）
- dotenv（環境変数管理）
- keytar（OS キーチェーン連携）

**Electron:**
- Electron 28+（最新 LTS）
- electron-builder（ビルド・パッケージング）
- electron-updater（自動アップデート）

---

## 5. 機能要件

### 5.1 対応する図の種類

| # | 図の種類 | Mermaid 記法 | 説明 |
|---|---------|------------|------|
| 1 | **ユースケース図** | graph / C4Context | システムと外部アクタとの相互作用 |
| 2 | **システムアーキテクチャ図** | graph TB/LR | システム全体の構成・層構造 |
| 3 | **シーケンス図** | sequenceDiagram | 時間軸に沿ったプロセス間の相互作用 |
| 4 | **フローチャート / ワークフロー図** | flowchart | 処理フロー・意思決定フロー |
| 5 | **クラス図** | classDiagram | OOP 設計・クラス関係 |
| 6 | **ER 図（データベース構成図）** | erDiagram | DB スキーマ・テーブル関係 |
| 7 | **ガントチャート** | gantt | プロジェクトスケジュール |
| 8 | **マインドマップ** | mindmap | トピックの階層構造 |
| 9 | **状態遷移図** | stateDiagram-v2 | システム状態と遷移ロジック |
| 10 | **グラフ・ネットワーク図** | graph | ノード間の接続関係 |

### 5.2 主要機能

#### 5.2.1 図の生成（AI 補佐）

- ユーザが図の種類と要件を入力
- AI が Mermaid コードを自動生成
- リアルタイムプレビュー表示
- 送信前にデータ確認ダイアログを表示（セキュリティ）

#### 5.2.2 図の編集・調整

- 生成されたコードを手動編集可能
- コード変更時、プレビューをリアルタイム更新
- 「再生成」ボタンで AI に修正を依頼可能

#### 5.2.3 図の保存・管理

**ローカルファイル保存:**

```json
// diagrams/{uuid}.json
{
  "id": "uuid",
  "name": "システムアーキテクチャ図",
  "type": "architecture",
  "description": "マイクロサービス 3 層構成",
  "mermaidCode": "graph TB\n...",
  "createdAt": "2026-04-30T10:30:00Z",
  "updatedAt": "2026-04-30T11:45:00Z",
  "tags": ["architecture", "microservices"],
  "llmProvider": "claude",
  "generatedPrompt": "...",
  "version": "1.0"
}
```

**ブラウザ LocalStorage:**
- ローカルファイルと並行して保存
- 最大 50 件まで保存
- ローカルファイルが使えない環境でのフォールバック

#### 5.2.4 図の読み込み・検索

- 図名・タグ・種類で検索
- 日付範囲でフィルタリング
- クリックで読み込み・再編集

#### 5.2.5 PDF 出力

- 単一図・複数図の PDF 出力
- A4 縦横対応
- タイトル・日付・説明を含む表紙付き

#### 5.2.6 API キー設定

- 複数プロバイダ登録・切り替え可能
- API キーは OS キーチェーンまたは .env で管理
- テスト接続機能付き

---

## 6. セキュリティ要件

### 6.1 必須要件

| # | 要件 | 優先度 |
|---|------|--------|
| S-1 | API キーを平文で Git 管理しない | **必須** |
| S-2 | .env / OS キーチェーンで API キーを管理 | **必須** |
| S-3 | diagrams/ を .gitignore に含める | **必須** |
| S-4 | API 呼び出し前に送信データを表示 | **必須** |
| S-5 | README にセキュリティ注意事項を記載 | **必須** |

### 6.2 推奨要件

| # | 要件 | 優先度 |
|---|------|--------|
| S-6 | 送信ログをローカルに保存（オプション） | 推奨 |
| S-7 | Ollama 利用時は送信なしを明示 | 推奨 |
| S-8 | 会社利用向けポリシー設定 | 推奨 |

---

## 7. UI/UX 設計

### 7.1 画面構成

#### 7.1.1 メイン画面

```
┌─────────────────────────────────────────────┐
│ DiagramBuilder                      [設定]   │
├────────────────────┬────────────────────────┤
│  左パネル          │  右パネル              │
│                    │                        │
│  図の種類選択      │  プレビュー画面        │
│  ┌──────────────┐  │  ┌──────────────────┐  │
│  │ユースケース図 │  │  │                  │  │
│  │アーキテクチャ│  │  │    [図表]        │  │
│  │シーケンス図  │  │  │                  │  │
│  │...           │  │  └──────────────────┘  │
│  └──────────────┘  │                        │
│                    │  [再生成][保存][PDF出力]│
│  要件入力          │                        │
│  ┌──────────────┐  │  Mermaid コードエディタ│
│  │ここにテキスト│  │  ┌──────────────────┐  │
│  │を入力...     │  │  │graph TB          │  │
│  │              │  │  │...               │  │
│  │[生成]        │  │  └──────────────────┘  │
│  └──────────────┘  │                        │
│                    │                        │
│  保存済み図一覧    │                        │
│  ┌──────────────┐  │                        │
│  │・システムアーキ│ │                        │
│  │・ユースケース │  │                        │
│  └──────────────┘  │                        │
└────────────────────┴────────────────────────┘
```

#### 7.1.2 設定画面

```
┌──────────────────────────────┐
│ 設定                  [< 戻る]│
├──────────────────────────────┤
│ LLM プロバイダ設定           │
│ ○ Claude (Anthropic)        │
│ ○ OpenAI                    │
│ ○ Gemini (Google)           │
│ ○ Ollama (ローカル/送信なし) │
│ ○ Azure OpenAI              │
│                              │
│ API キー:                    │
│ [OS キーチェーンに保存]      │
│ モデル: [ドロップダウン]     │
│                              │
│ [テスト接続] [保存]          │
│ ──────────────────────────── │
│ ストレージ設定               │
│ □ ローカルファイルに保存     │
│ □ ブラウザに保存            │
│ パス: ./diagrams             │
│ ──────────────────────────── │
│ セキュリティ設定             │
│ API 呼び出し前の確認:        │
│ ○ 毎回表示                  │
│ ○ セッション中は非表示      │
│ ○ 表示しない                │
└──────────────────────────────┘
```

---

## 8. API 仕様

### 8.1 バックエンドエンドポイント

#### 図生成
```
POST /api/diagrams/generate
{
  "diagramType": "architecture",
  "description": "マイクロサービスアーキテクチャ",
  "additionalContext": "3 層構成"
}
→ { "success": true, "mermaidCode": "graph TB\n..." }
```

#### 図保存
```
POST /api/diagrams/save
{
  "name": "システムアーキテクチャ図",
  "type": "architecture",
  "mermaidCode": "graph TB\n...",
  "tags": ["architecture"]
}
→ { "success": true, "id": "uuid" }
```

#### 図一覧取得
```
GET /api/diagrams
→ { "diagrams": [...] }
```

#### 図取得
```
GET /api/diagrams/{id}
→ { "id": "...", "mermaidCode": "..." }
```

#### 図削除
```
DELETE /api/diagrams/{id}
→ { "success": true }
```

#### PDF 出力
```
POST /api/diagrams/export-pdf
{
  "diagramIds": ["uuid-1", "uuid-2"],
  "title": "プロジェクト名"
}
→ PDF ファイルをダウンロード
```

#### 設定保存
```
POST /api/config/save
{
  "llm": { "provider": "anthropic", "model": "claude-3-5-sonnet-20241022" },
  "storage": { "useLocalFile": true, "useLocalStorage": true }
}
→ { "success": true }
```

> **注意**: API キー自体はリクエストボディに含めず、OS キーチェーン / .env 経由で管理する。

#### テスト接続
```
POST /api/config/test-connection
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022"
}
→ { "success": true, "message": "接続成功" }
```

---

## 9. Electron（デスクトップアプリ）対応

### 9.1 構成方針

```
【開発時】
npm run dev
→ React Dev Server（port:3000）+ Express（port:3001）
→ ブラウザで http://localhost:3000 を開く

【ビルド時】
npm run build
→ React をビルド（静的ファイル）
→ Express + Electron でパッケージング
→ .dmg（Mac）/ .exe インストーラ（Windows）を生成
```

### 9.2 配布方法（GitHub Releases）

```
GitHub リポジトリ
└── Releases
    ├── DiagramBuilder-1.0.0-mac.dmg     （Mac 用）
    ├── DiagramBuilder-1.0.0-win.exe     （Windows 用インストーラ）
    ├── DiagramBuilder-1.0.0-linux.AppImage（Linux 用）
    └── CHANGELOG.md
```

各ユーザの利用手順：

```
1. GitHub の Releases ページにアクセス
2. 自分の OS に合ったファイルをダウンロード
3. インストール・起動
4. 設定画面で API キーを入力
5. 使用開始
```

### 9.3 自動アップデート（オプション）

`electron-updater` を使用し、GitHub Releases から自動更新を検知：

```
アプリ起動時
    ↓
GitHub Releases で最新版を確認
    ↓
新しいバージョンがある場合：
「バージョン X.X.X が利用可能です。更新しますか？」
    ↓
ユーザが承認 → ダウンロード → 再起動後に更新完了
```

---

## 10. 実装ロードマップ

### Phase 1: コア機能実装（Week 1-2）
- [ ] プロジェクト初期化（React + Node.js セットアップ）
- [ ] .gitignore / .env.example / セキュリティ基盤の整備
- [ ] UI デザイン・レイアウト実装
- [ ] Mermaid.js 統合とリアルタイムプレビュー
- [ ] 基本的な図生成ロジック

### Phase 2: LLM 統合（Week 2-3）
- [ ] Claude API 統合
- [ ] OpenAI API 対応
- [ ] Gemini API 対応
- [ ] Ollama（ローカル）対応
- [ ] API 呼び出し前の確認ダイアログ実装

### Phase 3: セキュリティ・設定（Week 3）
- [ ] OS キーチェーン連携（keytar）
- [ ] .env 管理の実装
- [ ] 設定画面の実装
- [ ] セキュリティ設定 UI の実装

### Phase 4: ストレージ・管理（Week 3-4）
- [ ] ローカルファイル保存機能
- [ ] ブラウザ LocalStorage 機能
- [ ] 図の検索・フィルタ機能
- [ ] 図削除機能

### Phase 5: PDF 出力（Week 4）
- [ ] PDF 出力機能（単一・複数対応）
- [ ] PDF デザイン調整

### Phase 6: Electron 対応（Week 4-5）
- [ ] Electron セットアップ
- [ ] ビルド設定（Mac / Windows）
- [ ] GitHub Releases への配布設定
- [ ] 自動アップデート機能（オプション）

### Phase 7: ドキュメント・リリース（Week 5+）
- [ ] README.md 作成（セキュリティ注意事項含む）
- [ ] インストール手順書
- [ ] v1.0.0 リリース

---

## 11. ファイル構成（予定）

```
diagram-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DiagramEditor.tsx
│   │   │   ├── DiagramPreview.tsx
│   │   │   ├── DiagramList.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── SecurityDialog.tsx    ← 新規追加
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── MainPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── llmService.ts
│   │   │   ├── pdfService.ts
│   │   │   ├── storageService.ts
│   │   │   └── keychainService.ts    ← 新規追加
│   │   └── app.ts
│   ├── diagrams/                     ← .gitignore で除外
│   ├── config.example.json           ← API キーなしのサンプル
│   ├── .env.example                  ← 環境変数サンプル
│   └── package.json
├── electron/
│   ├── main.ts                       ← Electron メインプロセス
│   ├── preload.ts                    ← セキュアな IPC 通信
│   └── package.json
├── .gitignore
├── README.md                         ← セキュリティ注意事項含む
├── LICENSE                           ← MIT ライセンス
├── SPECIFICATION.md（本ファイル）
└── package.json
```

---

## 12. 非機能要件

| 要件 | 詳細 |
|------|------|
| **パフォーマンス** | UI レスポンス < 100ms、API レスポンス < 5 秒（LLM 除く） |
| **スケーラビリティ** | 最大 1,000 件の図を管理可能 |
| **セキュリティ** | API キーの暗号化管理、送信データの透明性確保 |
| **互換性** | Chrome, Edge, Safari, Firefox 最新版、Mac / Windows / Linux |
| **ローカライゼーション** | 日本語対応（将来: 英語も対応） |
| **オフライン対応** | Ollama 使用時はインターネット不要 |

---

## 13. 今後の拡張案

1. **クラウドデプロイ対応**（AWS/GCP/Azure）
2. **チーム協調機能**（リアルタイム共同編集）
3. **図のテンプレートライブラリ**
4. **バージョン管理**（Git 連携、差分表示）
5. **Slack/Teams 連携**（図を直接共有）
6. **多言語対応**（英語等）
7. **AI による図の推奨・最適化**

---

## 14. セキュアコーディング規約

本プロジェクトでは、個人・会社利用を問わず安全なコードを維持するため、以下の規約を必須とする。

### 14.1 基本方針

```
1. 既知の脆弱なコードパターンを使用しない
2. 依存パッケージの脆弱性を定期的に確認する
3. 静的解析ツールで問題を自動検出する
4. コードレビュー時にセキュリティ観点を含める
5. 外部入力は必ずバリデーション・サニタイズする
```

---

### 14.2 使用禁止・注意が必要なコードパターン

#### 14.2.1 JavaScript / TypeScript

**❌ 絶対に使用禁止**

```typescript
// eval() - 任意コード実行の危険性
eval(userInput);                          // ❌
new Function(userInput)();               // ❌

// innerHTML への直接代入 - XSS の危険性
element.innerHTML = userInput;           // ❌
document.write(userInput);              // ❌

// プロトタイプ汚染
obj[userInput] = value;                  // ❌（キーが未検証の場合）
```

**✅ 代替手段**

```typescript
// eval の代わり
// → ロジックを関数として明示的に定義する

// innerHTML の代わり
element.textContent = userInput;         // ✅ テキストのみ
element.setAttribute('data-x', value);  // ✅ 属性に使う場合

// DOMPurify でサニタイズ（HTML が必要な場合のみ）
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput); // ✅
```

---

#### 14.2.2 Node.js / バックエンド

**❌ 使用禁止**

```typescript
// コマンドインジェクションの危険性
import { exec } from 'child_process';
exec(`convert ${userInput}`);            // ❌ ユーザ入力を直接渡さない

// パストラバーサルの危険性
const filePath = `./diagrams/${req.params.id}`;
fs.readFile(filePath);                   // ❌ パス検証なし

// 安全でない正規表現（ReDoS）
const re = new RegExp(userInput);        // ❌ ユーザ入力から正規表現生成
```

**✅ 代替手段**

```typescript
// child_process は引数を配列で渡す
import { execFile } from 'child_process';
execFile('convert', [sanitizedInput]);   // ✅ 配列で渡す

// パス検証（パストラバーサル対策）
import path from 'path';
const baseDir = path.resolve('./diagrams');
const filePath = path.resolve(baseDir, req.params.id);
if (!filePath.startsWith(baseDir)) {
  throw new Error('Invalid path');       // ✅ ディレクトリ外へのアクセスを拒否
}
fs.readFile(filePath);

// ID はバリデーションしてから使う
import { v4 as uuidv4, validate } from 'uuid';
if (!validate(req.params.id)) {
  return res.status(400).json({ error: 'Invalid ID' }); // ✅
}
```

---

#### 14.2.3 Electron 固有

**❌ 使用禁止**

```typescript
// nodeIntegration を有効にしない（XSS → RCE の危険性）
new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,               // ❌ 絶対禁止
    contextIsolation: false,             // ❌ 絶対禁止
  }
});

// リモートコンテンツで remote モジュールを使わない
require('@electron/remote').app;         // ❌
```

**✅ 代替手段**

```typescript
// contextIsolation + preload.ts 経由で安全に通信
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,              // ✅
    contextIsolation: true,             // ✅
    preload: path.join(__dirname, 'preload.js'),
    sandbox: true,                      // ✅ 推奨
  }
});

// preload.ts で必要な機能だけ公開（IPC 通信）
import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('api', {
  saveDiagram: (data) => ipcRenderer.invoke('save-diagram', data), // ✅
});
```

---

#### 14.2.4 API 通信

**❌ 使用禁止**

```typescript
// SSL 検証を無効化しない
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ❌ 絶対禁止

// API キーをログに出力しない
console.log('API Key:', apiKey);         // ❌
console.log(config);                    // ❌（config に apiKey が含まれる場合）
```

**✅ 代替手段**

```typescript
// SSL は常に有効
// → デフォルトのまま変更しない

// ログにはマスクして出力
console.log('API Key:', apiKey.slice(0, 8) + '****'); // ✅
```

---

### 14.3 入力バリデーション

すべての外部入力（ユーザ入力・API レスポンス・ファイル読み込み）に対してバリデーションを行う。

```typescript
// zod を使ったバリデーション（推奨）
import { z } from 'zod';

const DiagramSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([
    'usecase', 'architecture', 'sequence',
    'flowchart', 'class', 'er', 'gantt',
    'mindmap', 'state', 'graph'
  ]),
  description: z.string().max(2000),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// API エンドポイントで必ず検証
app.post('/api/diagrams/save', (req, res) => {
  const result = DiagramSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error }); // ✅
  }
  // 以降は result.data を使用
});
```

---

### 14.4 依存パッケージ管理

#### 14.4.1 脆弱性チェック（必須）

```bash
# 開発中：定期的に実行（週 1 回以上推奨）
npm audit

# 自動修正（minor / patch のみ）
npm audit fix

# CI/CD に組み込む（GitHub Actions 等）
npm audit --audit-level=high
```

#### 14.4.2 使用禁止パッケージ

以下は既知の問題があるため使用しない：

| パッケージ | 理由 | 代替 |
|-----------|------|------|
| `request` | 非推奨・メンテナンス終了 | `axios` / `node-fetch` |
| `node-uuid` | 非推奨 | `uuid` |
| `md5` | 暗号用途に使用不可 | `crypto`（Node.js 標準） |
| `moment` | レガシー・大容量 | `date-fns` / `dayjs` |
| `serialize-javascript` の古いバージョン | XSS 脆弱性 | 最新版を使用 |

#### 14.4.3 パッケージ追加のルール

```
新しいパッケージを追加する前に確認すること：

1. npm audit で脆弱性がないか確認
2. 最終更新日が 1 年以上前でないか確認
3. GitHub Stars・メンテナンス状況を確認
4. ダウンロード数が十分か確認（週 10 万以上が目安）
5. LICENSE が MIT / Apache 2.0 / ISC 等であることを確認
```

---

### 14.5 静的解析ツール（必須導入）

以下のツールを開発環境に必ず導入し、コミット前に自動実行する。

#### 14.5.1 ESLint（コード品質・セキュリティ）

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:security/recommended"       // セキュリティルール
  ],
  "plugins": [
    "@typescript-eslint",
    "security"
  ],
  "rules": {
    "no-eval": "error",                 // eval 禁止
    "no-implied-eval": "error",         // 暗黙的 eval 禁止
    "@typescript-eslint/no-explicit-any": "warn", // any 型の抑制
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-child-process": "warn"
  }
}
```

#### 14.5.2 Husky + lint-staged（コミット前自動実行）

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm audit --audit-level=high"
    ]
  }
}
```

#### 14.5.3 TypeScript 厳格モード

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                     // 厳格モード（必須）
    "noImplicitAny": true,             // any 型の暗黙的使用禁止
    "strictNullChecks": true,          // null チェック強制
    "noUnusedLocals": true,            // 未使用変数を警告
    "noUnusedParameters": true         // 未使用引数を警告
  }
}
```

---

### 14.6 Electron セキュリティチェックリスト

Electron 固有のセキュリティ設定を必ず確認する：

```
✅ nodeIntegration: false
✅ contextIsolation: true
✅ sandbox: true
✅ preload スクリプトのみで Node.js API を公開
✅ webSecurity: true（デフォルト、変更禁止）
✅ allowRunningInsecureContent: false（デフォルト、変更禁止）
✅ ロードするのはローカルファイルのみ（外部 URL を直接レンダリングしない）
✅ Content Security Policy（CSP）を設定
```

**CSP の設定例:**

```typescript
// Electron の BrowserWindow で CSP を設定
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
      ]
    }
  });
});
```

---

### 14.7 コードレビューのセキュリティチェックリスト

PR / コードレビュー時に以下を確認する：

```
入力・出力
□ 外部入力はすべてバリデーションされているか
□ innerHTML / eval / exec 等の危険な API を使っていないか
□ ユーザ入力がそのままファイルパスやコマンドに渡されていないか

認証・設定
□ API キーがコードにハードコードされていないか
□ API キーがログに出力されていないか
□ .env / OS キーチェーン経由で管理されているか

依存関係
□ 新規パッケージの追加は必要最低限か
□ npm audit でエラーが出ていないか
□ パッケージのライセンスは問題ないか

Electron
□ nodeIntegration が false になっているか
□ contextIsolation が true になっているか
□ preload スクリプト経由でのみ Node.js API を公開しているか
```

---

### 14.8 GitHub での管理

#### Secret Scanning

GitHub のリポジトリ設定で以下を有効化する：

```
Settings → Security → Code security and analysis
✅ Dependency graph          （依存関係の可視化）
✅ Dependabot alerts         （脆弱性の自動通知）
✅ Dependabot security updates（自動修正 PR）
✅ Secret scanning           （API キー等の誤コミット検出）
```

#### GitHub Actions での自動チェック（推奨）

```yaml
# .github/workflows/security.yml
name: Security Check
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: npx eslint . --ext .ts,.tsx
```

---

## 15. 参考資料

- **Mermaid 公式**: https://mermaid.js.org
- **Electron 公式**: https://www.electronjs.org
- **keytar（OS キーチェーン）**: https://github.com/atom/node-keytar
- **electron-builder**: https://www.electron.build
- **MIT ライセンス**: https://opensource.org/licenses/MIT
- **Claude API**: https://docs.anthropic.com
- **OpenAI API**: https://platform.openai.com/docs
- **Ollama**: https://ollama.ai

---

## 15. 承認・署名

| 項目 | 担当者 | 日付 |
|------|--------|------|
| 作成 | AI Assistant | 2026-04-30 |
| 確認 | - | - |
| 承認 | - | - |
