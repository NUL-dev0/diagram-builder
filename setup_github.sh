#!/bin/bash

# =============================================================
# DiagramBuilder — GitHub セットアップスクリプト
# Milestone・ラベル・Issue を一括作成します
#
# 使い方:
#   chmod +x setup_github.sh
#   ./setup_github.sh <GitHubユーザ名> <リポジトリ名>
#
# 例:
#   ./setup_github.sh myname diagram-builder
# =============================================================

OWNER=$1
REPO=$2

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "使い方: ./setup_github.sh <GitHubユーザ名> <リポジトリ名>"
  echo "例:     ./setup_github.sh myname diagram-builder"
  exit 1
fi

echo ""
echo "================================================"
echo "  DiagramBuilder GitHub セットアップ開始"
echo "  リポジトリ: $OWNER/$REPO"
echo "================================================"
echo ""

# ------------------------------
# 1. ラベルの作成
# ------------------------------
echo "[1/3] ラベルを作成中..."

gh label create "frontend"  --color "0075CA" --description "フロントエンド（React/UI）"      --repo "$OWNER/$REPO" 2>/dev/null || echo "  frontend: 既に存在します"
gh label create "backend"   --color "7057FF" --description "バックエンド（Node.js/API）"     --repo "$OWNER/$REPO" 2>/dev/null || echo "  backend: 既に存在します"
gh label create "electron"  --color "0E8A16" --description "Electron（デスクトップアプリ）"  --repo "$OWNER/$REPO" 2>/dev/null || echo "  electron: 既に存在します"
gh label create "security"  --color "E4E669" --description "セキュリティ関連"                --repo "$OWNER/$REPO" 2>/dev/null || echo "  security: 既に存在します"
gh label create "infra"     --color "F9D0C4" --description "CI/CD・環境・インフラ"           --repo "$OWNER/$REPO" 2>/dev/null || echo "  infra: 既に存在します"
gh label create "docs"      --color "D93F0B" --description "ドキュメント"                    --repo "$OWNER/$REPO" 2>/dev/null || echo "  docs: 既に存在します"

echo "  ラベル作成完了"
echo ""

# ------------------------------
# 2. Milestone の作成
# ------------------------------
echo "[2/3] Milestone を作成中..."

M1=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 1 — プロジェクト基盤構築" \
  --field description="リポジトリ初期設定・開発環境・セキュリティ基盤の整備" \
  --field due_on="2026-05-14T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 1 Milestone 作成: #$M1"

M2=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 2 — コア UI / Mermaid 統合" \
  --field description="メイン画面・Mermaid リアルタイムプレビュー・ブラウザ互換テスト" \
  --field due_on="2026-05-21T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 2 Milestone 作成: #$M2"

M3=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 3 — LLM 統合" \
  --field description="Claude / OpenAI / Gemini / Ollama API 統合・プロンプト設計" \
  --field due_on="2026-05-21T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 3 Milestone 作成: #$M3"

M4=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 4 — セキュリティ・設定管理" \
  --field description="OS キーチェーン・入力バリデーション・設定 UI 実装" \
  --field due_on="2026-05-28T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 4 Milestone 作成: #$M4"

M5=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 5 — ストレージ・図管理" \
  --field description="ローカルファイル・LocalStorage・図の検索・管理機能" \
  --field due_on="2026-06-04T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 5 Milestone 作成: #$M5"

M6=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 6 — PDF 出力" \
  --field description="単一・複数図の PDF 出力・表紙・A4 対応" \
  --field due_on="2026-06-11T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 6 Milestone 作成: #$M6"

M7=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 7 — Electron 対応" \
  --field description="Electron 構成・Mac/Windows ビルド・GitHub Releases 配布" \
  --field due_on="2026-06-18T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 7 Milestone 作成: #$M7"

M8=$(gh api repos/$OWNER/$REPO/milestones --method POST \
  --field title="Phase 8 — ドキュメント・リリース" \
  --field description="README・CHANGELOG・最終テスト・v1.0.0 リリース" \
  --field due_on="2026-07-02T00:00:00Z" \
  --jq '.number' 2>/dev/null)
echo "  Phase 8 Milestone 作成: #$M8"

echo "  Milestone 作成完了"
echo ""

# ------------------------------
# 3. Issue の作成
# ------------------------------
echo "[3/3] Issue を作成中..."

create_issue() {
  local title="$1"
  local labels="$2"
  local milestone="$3"
  local body="$4"
  gh issue create \
    --title "$title" \
    --label "$labels" \
    --milestone "$milestone" \
    --body "$body" \
    --repo "$OWNER/$REPO" 2>&1 | grep -v "could not add to milestone" || true
  sleep 0.5
}

echo "  Phase 1 の Issue を作成中..."
create_issue "リポジトリ作成・初期設定（README, LICENSE, .gitignore）" "infra,docs" "$M1" \
"## 概要
リポジトリの初期設定を行う。

## タスク
- [ ] README.md の骨格作成
- [ ] MIT ライセンスファイル（LICENSE）の作成
- [ ] .gitignore の設定（node_modules, .env, config.json, diagrams/ を除外）
- [ ] リポジトリの説明・トピックの設定

## 参考
仕様書 Section 2（ライセンス・オープンソース方針）"

create_issue ".env.example / config.example.json の作成" "security,infra" "$M1" \
"## 概要
API キーを含まないサンプル設定ファイルを作成する。

## タスク
- [ ] .env.example の作成（全環境変数をコメント付きで記載）
- [ ] config.example.json の作成（API キーなしのサンプル）
- [ ] .gitignore に .env / config.json が含まれていることを確認

## 参考
仕様書 Section 3.2（API キーの安全な管理）"

create_issue "フロントエンド: React + TypeScript プロジェクト初期化" "frontend" "$M1" \
"## 概要
React + TypeScript のフロントエンドプロジェクトを初期化する。

## タスク
- [ ] create-react-app または Vite で TypeScript テンプレートを作成
- [ ] 不要なボイラープレートの削除
- [ ] フォルダ構成の整理（components / pages / hooks / api）
- [ ] package.json のプロジェクト情報を更新

## 参考
仕様書 Section 4.3（技術スタック）"

create_issue "バックエンド: Node.js + Express プロジェクト初期化" "backend" "$M1" \
"## 概要
Node.js + Express のバックエンドプロジェクトを初期化する。

## タスク
- [ ] Node.js + TypeScript + Express のセットアップ
- [ ] フォルダ構成の整理（routes / controllers / services / middleware）
- [ ] dotenv の導入
- [ ] 開発用サーバの起動確認（ts-node-dev または nodemon）

## 参考
仕様書 Section 4.3（技術スタック）"

create_issue "ESLint + eslint-plugin-security の設定" "security,infra" "$M1" \
"## 概要
セキュリティルールを含む ESLint を設定する。

## タスク
- [ ] eslint + @typescript-eslint/eslint-plugin のインストール
- [ ] eslint-plugin-security のインストール
- [ ] .eslintrc.json の作成（no-eval, detect-object-injection 等のルール設定）
- [ ] フロントエンド・バックエンド両方に適用
- [ ] npm run lint でエラーがないことを確認

## 参考
仕様書 Section 14.5（静的解析ツール）"

create_issue "TypeScript 厳格モード（strict: true）の設定" "security,frontend,backend" "$M1" \
"## 概要
TypeScript の厳格モードを有効化する。

## タスク
- [ ] tsconfig.json に strict: true を設定
- [ ] noImplicitAny: true の設定
- [ ] strictNullChecks: true の設定
- [ ] noUnusedLocals / noUnusedParameters の設定
- [ ] 既存コードのエラーをすべて解消

## 参考
仕様書 Section 14.5.3（TypeScript 厳格モード）"

create_issue "Husky + lint-staged でコミット前自動チェックを設定" "infra,security" "$M1" \
"## 概要
コミット前に ESLint と npm audit が自動実行されるようにする。

## タスク
- [ ] husky のインストール・設定
- [ ] lint-staged のインストール・設定
- [ ] pre-commit フックで eslint --fix と npm audit を実行
- [ ] テストコミットで動作確認

## 参考
仕様書 Section 14.5.2（Husky + lint-staged）"

create_issue "Tailwind CSS の導入・基本スタイル設定" "frontend" "$M1" \
"## 概要
Tailwind CSS を導入し、基本スタイルを設定する。

## タスク
- [ ] Tailwind CSS のインストール
- [ ] tailwind.config.js の設定
- [ ] globals.css への @tailwind ディレクティブ追加
- [ ] 動作確認（サンプルコンポーネントにクラスを適用）"

create_issue "フロントエンド・バックエンド間の開発用プロキシ設定" "frontend,backend" "$M1" \
"## 概要
開発時に React（port:3000）から Express（port:3001）への API 通信が通るようにプロキシを設定する。

## タスク
- [ ] package.json または vite.config.ts にプロキシ設定を追加
- [ ] GET /api/health エンドポイントを作成して疎通確認
- [ ] CORS 設定の確認"

create_issue "GitHub Actions: npm audit 自動チェック CI を作成" "infra,security" "$M1" \
"## 概要
Push / PR 時に npm audit が自動実行される CI を設定する。

## タスク
- [ ] .github/workflows/security.yml の作成
- [ ] npm audit --audit-level=high をジョブに追加
- [ ] ESLint チェックをジョブに追加
- [ ] 動作確認（PR を作成してパスすることを確認）
- [ ] GitHub リポジトリで Dependabot / Secret Scanning を有効化

## 参考
仕様書 Section 14.8（GitHub での管理）"

echo "  Phase 2 の Issue を作成中..."
create_issue "メイン画面レイアウトの実装（左パネル + 右パネル）" "frontend" "$M2" \
"## 概要
アプリのメイン画面の 2 カラムレイアウトを実装する。

## タスク
- [ ] 左パネル（図種類選択・要件入力・保存済み一覧）の骨格実装
- [ ] 右パネル（プレビュー・コードエディタ）の骨格実装
- [ ] ヘッダー（タイトル・設定ボタン）の実装
- [ ] レスポンシブ対応の確認

## 参考
仕様書 Section 7.1.1（メイン画面）"

create_issue "図の種類選択コンポーネントの実装（10種類）" "frontend" "$M2" \
"## 概要
10 種類の図を選択できる UI コンポーネントを実装する。

## タスク
- [ ] ユースケース図
- [ ] システムアーキテクチャ図
- [ ] シーケンス図
- [ ] フローチャート / ワークフロー図
- [ ] クラス図
- [ ] ER 図
- [ ] ガントチャート
- [ ] マインドマップ
- [ ] 状態遷移図
- [ ] グラフ・ネットワーク図
- [ ] 選択状態のハイライト表示

## 参考
仕様書 Section 5.1（対応する図の種類）"

create_issue "要件入力フォームの実装" "frontend" "$M2" \
"## 概要
図の要件・説明を入力するフォームを実装する。

## タスク
- [ ] テキストエリアの実装
- [ ] 追加コンテキスト入力欄の実装
- [ ] 「生成」ボタンの実装
- [ ] 入力バリデーション（空欄チェック・最大文字数）
- [ ] ローディング状態の表示"

create_issue "Mermaid.js の統合・リアルタイムプレビュー実装" "frontend" "$M2" \
"## 概要
Mermaid.js を統合し、コードの変更をリアルタイムでプレビュー表示する。

## タスク
- [ ] mermaid のインストール
- [ ] MermaidPreview コンポーネントの作成
- [ ] コード変更時のリアルタイム再レンダリング
- [ ] レンダリングエラー時のエラー表示
- [ ] 10 種類の図すべてのレンダリング確認

## 参考
仕様書 Section 5.1（対応する図の種類）"

create_issue "CodeMirror エディタの統合（Mermaid コード編集）" "frontend" "$M2" \
"## 概要
Mermaid コードを編集できるコードエディタを実装する。

## タスク
- [ ] @codemirror/react のインストール
- [ ] シンタックスハイライトの設定
- [ ] コード変更イベントの連携（プレビューへ反映）
- [ ] フォントサイズ・テーマの調整"

create_issue "プレビューのリアルタイム更新ロジックの実装" "frontend" "$M2" \
"## 概要
エディタのコード変更がプレビューにリアルタイムで反映されるロジックを実装する。

## タスク
- [ ] デバウンス処理（入力が止まってから 300ms 後に更新）の実装
- [ ] 無効な Mermaid コード入力時のエラーハンドリング
- [ ] プレビューのスムーズな更新アニメーション"

create_issue "Chrome / Edge / Firefox / Safari でのブラウザ互換テスト" "frontend" "$M2" \
"## 概要
4 ブラウザでの動作確認を行う。

## タスク
- [ ] Chrome（最新版）での動作確認
- [ ] Edge（最新版）での動作確認
- [ ] Firefox（最新版）での動作確認
- [ ] Safari（最新版）での動作確認
- [ ] 各ブラウザでの Mermaid レンダリング確認
- [ ] 発見した不具合の修正

## 参考
仕様書 Section 12（非機能要件）"

create_issue "レスポンシブレイアウトの確認・調整" "frontend" "$M2" \
"## 概要
様々な画面サイズでの表示を確認・調整する。

## タスク
- [ ] 1280px 以上（デスクトップ）での確認
- [ ] 1024px（ノートPC）での確認
- [ ] 768px 以下での表示崩れ修正
- [ ] Electron ウィンドウサイズでの確認"

echo "  Phase 3 の Issue を作成中..."
create_issue "LLM プロバイダ抽象化レイヤーの設計・実装" "backend" "$M3" \
"## 概要
複数の LLM プロバイダを統一インターフェースで扱える抽象化レイヤーを設計・実装する。

## タスク
- [ ] LLMProvider インターフェースの定義
- [ ] 各プロバイダのアダプタクラスの設計
- [ ] プロバイダ切り替えのファクトリー実装
- [ ] エラーハンドリングの統一

## 参考
仕様書 Section 4.1（全体構成図）"

create_issue "Claude API（Anthropic）の統合" "backend" "$M3" \
"## 概要
Anthropic の Claude API を統合する。

## タスク
- [ ] @anthropic-ai/sdk のインストール
- [ ] ClaudeProvider クラスの実装
- [ ] API キーの環境変数からの読み込み
- [ ] 図生成リクエストの送受信テスト
- [ ] レート制限・エラー処理の実装"

create_issue "OpenAI API の統合" "backend" "$M3" \
"## 概要
OpenAI API を統合する。

## タスク
- [ ] openai パッケージのインストール
- [ ] OpenAIProvider クラスの実装
- [ ] gpt-4o / gpt-4-turbo 等のモデル対応
- [ ] 動作確認テスト"

create_issue "Google Gemini API の統合" "backend" "$M3" \
"## 概要
Google Gemini API を統合する。

## タスク
- [ ] @google/generative-ai のインストール
- [ ] GeminiProvider クラスの実装
- [ ] 無料枠の制限確認
- [ ] 動作確認テスト"

create_issue "Ollama（ローカル LLM）の統合" "backend" "$M3" \
"## 概要
ローカルで動作する Ollama を統合する。オフライン・機密情報案件向け。

## タスク
- [ ] Ollama の HTTP API との通信実装
- [ ] OllamaProvider クラスの実装
- [ ] Ollama 未起動時のエラーメッセージの実装
- [ ] mistral / llama 等のモデルでの動作確認
- [ ] UI でローカル動作（送信なし）であることを明示

## 参考
仕様書 Section 3.4（外部送信データの透明性）"

create_issue "Azure OpenAI の統合" "backend" "$M3" \
"## 概要
Azure OpenAI Service を統合する。

## タスク
- [ ] AzureOpenAIProvider クラスの実装
- [ ] エンドポイント・デプロイ名の設定対応
- [ ] 動作確認テスト"

create_issue "各図種別のプロンプトテンプレート作成（10種類）" "backend" "$M3" \
"## 概要
10 種類の図に対応した LLM プロンプトテンプレートを作成する。

## タスク
- [ ] ユースケース図のプロンプト
- [ ] システムアーキテクチャ図のプロンプト
- [ ] シーケンス図のプロンプト
- [ ] フローチャートのプロンプト
- [ ] クラス図のプロンプト
- [ ] ER 図のプロンプト
- [ ] ガントチャートのプロンプト
- [ ] マインドマップのプロンプト
- [ ] 状態遷移図のプロンプト
- [ ] グラフ・ネットワーク図のプロンプト
- [ ] 各プロンプトの出力品質確認・調整"

create_issue "API 呼び出し前の送信データ確認ダイアログ実装" "frontend,security" "$M3" \
"## 概要
LLM API 呼び出し前に、送信されるデータをユーザに確認させるダイアログを実装する。

## タスク
- [ ] SecurityDialog コンポーネントの実装
- [ ] 送信されるデータ（プロバイダ・送信内容）の表示
- [ ] 「今後表示しない」チェックボックスの実装
- [ ] Ollama 使用時は「送信なし」と表示

## 参考
仕様書 Section 3.4（外部送信データの透明性）"

create_issue "「再生成」ボタンの実装" "frontend,backend" "$M3" \
"## 概要
生成済みの図を AI に再生成・修正依頼できる機能を実装する。

## タスク
- [ ] 「再生成」ボタンの UI 実装
- [ ] 現在の Mermaid コードを含めた再生成リクエストの実装
- [ ] 修正指示を追加入力できるオプションの実装"

create_issue "各プロバイダの動作確認テスト" "backend" "$M3" \
"## 概要
全プロバイダで実際に図が生成できることを確認する。

## タスク
- [ ] Claude でシステムアーキテクチャ図の生成テスト
- [ ] OpenAI でシーケンス図の生成テスト
- [ ] Gemini でフローチャートの生成テスト
- [ ] Ollama でユースケース図の生成テスト
- [ ] 生成品質の確認・プロンプト調整"

echo "  Phase 4 の Issue を作成中..."
create_issue "OS キーチェーン連携（keytar）の実装" "security,backend" "$M4" \
"## 概要
API キーを OS のキーチェーン（macOS Keychain / Windows Credential Manager）に保存する。

## タスク
- [ ] keytar のインストール
- [ ] KeychainService クラスの実装（get / set / delete）
- [ ] Electron 環境での動作確認（Mac）
- [ ] Electron 環境での動作確認（Windows）
- [ ] フォールバック（.env）への切り替えロジック

## 参考
仕様書 Section 3.2.2（新しい管理方法）"

create_issue ".env 経由での API キー管理ロジックの実装" "security,backend" "$M4" \
"## 概要
.env ファイル経由での API キー管理を実装する。

## タスク
- [ ] dotenv の設定確認
- [ ] 各プロバイダの環境変数名の定義（ANTHROPIC_API_KEY 等）
- [ ] .env が存在しない場合のエラーメッセージの実装
- [ ] API キーがログに出力されないことの確認

## 参考
仕様書 Section 3.2.2（新しい管理方法）、Section 14.2.4（API 通信）"

create_issue "設定画面 UI の実装（プロバイダ選択・API キー入力）" "frontend" "$M4" \
"## 概要
API プロバイダと API キーを設定できる画面を実装する。

## タスク
- [ ] SettingsPage コンポーネントの実装
- [ ] プロバイダ選択（Claude / OpenAI / Gemini / Ollama / Azure）
- [ ] API キー入力欄（パスワードマスク表示）
- [ ] モデル選択ドロップダウン
- [ ] 設定の保存・読み込み

## 参考
仕様書 Section 7.1.2（設定画面）"

create_issue "テスト接続機能の実装" "frontend,backend" "$M4" \
"## 概要
入力した API キーで実際に接続できるか確認できるテスト接続機能を実装する。

## タスク
- [ ] POST /api/config/test-connection エンドポイントの実装
- [ ] 「テスト接続」ボタンの UI 実装
- [ ] 成功・失敗メッセージの表示
- [ ] 全プロバイダでの動作確認

## 参考
仕様書 Section 8.1（API 仕様）"

create_issue "セキュリティ設定 UI の実装" "frontend,security" "$M4" \
"## 概要
API 呼び出し確認ダイアログの頻度などセキュリティ設定を管理できる UI を実装する。

## タスク
- [ ] 確認ダイアログの頻度設定（毎回 / セッション中は非表示 / 表示しない）
- [ ] ローカル LLM 優先モードの設定
- [ ] 設定の永続化（LocalStorage）

## 参考
仕様書 Section 3.6（セキュリティ設定の UI）"

create_issue "API キーがログに出力されないことを確認" "security,backend" "$M4" \
"## 概要
API キーやトークンがアプリのログに出力されないことを確認・修正する。

## タスク
- [ ] バックエンドのすべての console.log を確認
- [ ] リクエスト/レスポンスのログに API キーが含まれないことを確認
- [ ] エラーログに API キーが含まれないことを確認
- [ ] API キーのマスク表示ユーティリティ関数の実装

## 参考
仕様書 Section 14.2.4（API 通信）"

create_issue "パストラバーサル対策の実装・テスト" "security,backend" "$M4" \
"## 概要
ファイル操作 API でパストラバーサル攻撃が発生しないよう対策する。

## タスク
- [ ] ファイルパス検証ユーティリティの実装
- [ ] diagrams/ ディレクトリ外へのアクセスをすべて拒否
- [ ] ファイル ID（UUID）のバリデーション
- [ ] 攻撃パターンのテスト（../../../etc/passwd 等）

## 参考
仕様書 Section 14.2.2（Node.js / バックエンド）"

create_issue "入力バリデーション（zod）の全エンドポイントへの適用" "security,backend" "$M4" \
"## 概要
全 API エンドポイントに zod によるスキーマバリデーションを適用する。

## タスク
- [ ] zod のインストール
- [ ] DiagramSchema の定義
- [ ] POST /api/diagrams/generate にバリデーション適用
- [ ] POST /api/diagrams/save にバリデーション適用
- [ ] POST /api/diagrams/export-pdf にバリデーション適用
- [ ] POST /api/config/save にバリデーション適用
- [ ] 無効な入力時の 400 エラーレスポンスの確認

## 参考
仕様書 Section 14.3（入力バリデーション）"

create_issue "GitHub Secret Scanning / Dependabot の有効化" "infra,security" "$M4" \
"## 概要
GitHub のセキュリティ機能を有効化する。

## タスク
- [ ] Dependency graph の有効化
- [ ] Dependabot alerts の有効化
- [ ] Dependabot security updates の有効化
- [ ] Secret scanning の有効化
- [ ] テスト: ダミーの API キーをコミットして検出されることを確認

## 参考
仕様書 Section 14.8（GitHub での管理）"

echo "  Phase 5 の Issue を作成中..."
create_issue "ローカルファイル保存機能の実装（JSON 形式）" "backend" "$M5" \
"## 概要
図を diagrams/ フォルダに JSON 形式で保存する機能を実装する。

## タスク
- [ ] StorageService クラスの実装
- [ ] POST /api/diagrams/save エンドポイントの実装
- [ ] UUID を使ったファイル名生成
- [ ] JSON スキーマの実装（id, name, type, mermaidCode, tags, timestamps）
- [ ] diagrams/ ディレクトリの自動作成

## 参考
仕様書 Section 5.2.3（図の保存・管理）"

create_issue "ブラウザ LocalStorage 保存機能の実装" "frontend" "$M5" \
"## 概要
ブラウザの LocalStorage に図を保存する機能を実装する。

## タスク
- [ ] useDiagramStore フックの実装
- [ ] LocalStorage への保存・読み込みロジック
- [ ] 最大 50 件の上限管理
- [ ] 古いデータの自動削除（50 件超過時）

## 参考
仕様書 Section 5.2.3（図の保存・管理）"

create_issue "両ストレージ間の同期ロジックの実装" "frontend,backend" "$M5" \
"## 概要
ローカルファイルと LocalStorage を同期するロジックを実装する。

## タスク
- [ ] 保存時に両方に書き込む処理
- [ ] ローカルファイルが利用できない場合の LocalStorage へのフォールバック
- [ ] 起動時に LocalStorage をローカルファイルで更新する処理
- [ ] 競合が発生した場合の解決ロジック（タイムスタンプで判定）"

create_issue "図一覧表示コンポーネントの実装" "frontend" "$M5" \
"## 概要
保存済みの図を一覧表示するコンポーネントを実装する。

## タスク
- [ ] DiagramList コンポーネントの実装
- [ ] 図名・タイプ・更新日時の表示
- [ ] タグの表示
- [ ] 編集・削除ボタンの実装
- [ ] 空状態（図が 0 件）の表示

## 参考
仕様書 Section 5.2.4（図の読み込み・検索）"

create_issue "図の検索・タグフィルタ機能の実装" "frontend,backend" "$M5" \
"## 概要
図名・タグ・日付で検索・絞り込みができる機能を実装する。

## タスク
- [ ] テキスト検索の実装（図名・説明）
- [ ] タグフィルタの実装
- [ ] 日付範囲フィルタの実装
- [ ] 検索結果のリアルタイム更新
- [ ] 「クリア」ボタンの実装

## 参考
仕様書 Section 5.2.4（図の読み込み・検索）"

create_issue "図の読み込み・再編集機能の実装" "frontend,backend" "$M5" \
"## 概要
保存済みの図を読み込み、再編集できる機能を実装する。

## タスク
- [ ] GET /api/diagrams/:id エンドポイントの実装
- [ ] 図クリック時の読み込みロジック
- [ ] エディタ・プレビューへの反映
- [ ] 編集後の上書き保存"

create_issue "図の削除機能の実装" "frontend,backend" "$M5" \
"## 概要
保存済みの図を削除できる機能を実装する。

## タスク
- [ ] DELETE /api/diagrams/:id エンドポイントの実装
- [ ] 削除確認ダイアログの実装
- [ ] ローカルファイルと LocalStorage の両方から削除
- [ ] 削除後の一覧更新"

create_issue "1000 件保存時のパフォーマンステスト" "backend" "$M5" \
"## 概要
1000 件の図データが保存されている状態でのパフォーマンスを確認する。

## タスク
- [ ] 1000 件のサンプルデータ生成スクリプトの作成
- [ ] 一覧取得の応答時間測定（目標: 5 秒以内）
- [ ] 検索の応答時間測定
- [ ] 必要に応じてインデックス・ページネーションの実装

## 参考
仕様書 Section 12（非機能要件）"

echo "  Phase 6 の Issue を作成中..."
create_issue "Puppeteer / Chromium の導入・設定" "backend" "$M6" \
"## 概要
PDF 生成に使用する Puppeteer を導入・設定する。

## タスク
- [ ] puppeteer または puppeteer-core のインストール
- [ ] Chromium のパス設定
- [ ] 基本的な HTML → PDF 変換のテスト
- [ ] Electron 環境での動作確認"

create_issue "単一図の PDF 出力機能の実装" "backend" "$M6" \
"## 概要
1 つの図を PDF に出力する機能を実装する。

## タスク
- [ ] PdfService クラスの実装
- [ ] Mermaid → SVG → PDF の変換パイプライン
- [ ] A4 縦向き対応
- [ ] 図タイトル・説明・生成日時の埋め込み
- [ ] POST /api/diagrams/export-pdf エンドポイントの実装（単一図）"

create_issue "複数図をまとめた PDF 出力機能の実装" "backend" "$M6" \
"## 概要
複数の図を 1 つの PDF ファイルにまとめて出力する機能を実装する。

## タスク
- [ ] 複数図の連結処理の実装
- [ ] 図ごとにページを分ける処理
- [ ] POST /api/diagrams/export-pdf エンドポイントの拡張（複数 ID 対応）
- [ ] 図の選択 UI の実装（チェックボックス）"

create_issue "PDF 表紙（タイトル・日付・説明）の実装" "backend,frontend" "$M6" \
"## 概要
PDF の先頭に表紙ページを追加する。

## タスク
- [ ] 表紙デザインの実装（タイトル・生成日・プロジェクト名）
- [ ] 表紙の任意テキスト入力 UI の実装
- [ ] 目次（図の一覧）ページの実装"

create_issue "A4 縦横対応の確認・調整" "backend" "$M6" \
"## 概要
A4 縦向き・横向きの PDF 出力に対応する。

## タスク
- [ ] A4 縦向きの確認
- [ ] A4 横向きの確認・実装
- [ ] 図のサイズが A4 に収まるよう自動スケーリング
- [ ] 余白の調整"

create_issue "PDF 出力ボタンの UI 実装" "frontend" "$M6" \
"## 概要
PDF 出力をトリガーする UI を実装する。

## タスク
- [ ] 単一図の「PDF 出力」ボタンの実装
- [ ] 複数図をまとめる「PDF エクスポート」画面の実装
- [ ] ダウンロード中のローディング表示
- [ ] エラー時のメッセージ表示"

echo "  Phase 7 の Issue を作成中..."
create_issue "Electron プロジェクトのセットアップ" "electron" "$M7" \
"## 概要
Electron のプロジェクト構成をセットアップする。

## タスク
- [ ] electron パッケージのインストール
- [ ] electron/ ディレクトリの作成（main.ts, preload.ts）
- [ ] package.json の main エントリポイント設定
- [ ] 開発モードでの起動確認（npm run electron:dev）

## 参考
仕様書 Section 9.1（構成方針）"

create_issue "Main Process / Renderer Process の構成設定" "electron" "$M7" \
"## 概要
Electron の Main Process と Renderer Process の構成を設定する。

## タスク
- [ ] BrowserWindow の作成・設定
- [ ] 開発時は localhost:3000 をロード
- [ ] 本番時はビルド済み React をロード
- [ ] ウィンドウサイズ・タイトルの設定"

create_issue "preload.ts による安全な IPC 通信の実装" "electron,security" "$M7" \
"## 概要
preload スクリプトを使い、Renderer から Main へ安全に通信できる仕組みを実装する。

## タスク
- [ ] contextBridge.exposeInMainWorld の実装
- [ ] ファイル操作・設定読み書きの IPC ハンドラ実装
- [ ] API キーの IPC 経由での安全な受け渡し

## 参考
仕様書 Section 14.2.3（Electron 固有）"

create_issue "nodeIntegration: false / contextIsolation: true の確認" "electron,security" "$M7" \
"## 概要
Electron のセキュリティ設定が正しく設定されていることを確認する。

## タスク
- [ ] nodeIntegration: false の確認
- [ ] contextIsolation: true の確認
- [ ] sandbox: true の設定確認
- [ ] webSecurity: true の確認
- [ ] 仕様書のセキュリティチェックリストの全項目を確認

## 参考
仕様書 Section 14.6（Electron セキュリティチェックリスト）"

create_issue "Content Security Policy（CSP）の設定" "electron,security" "$M7" \
"## 概要
Electron アプリの Content Security Policy を設定する。

## タスク
- [ ] session.defaultSession.webRequest での CSP ヘッダー設定
- [ ] script-src / style-src の適切な設定
- [ ] CSP 違反がないことの確認

## 参考
仕様書 Section 14.6（Electron セキュリティチェックリスト）"

create_issue "electron-builder の設定（Mac .dmg / Windows .exe）" "electron,infra" "$M7" \
"## 概要
electron-builder を使って Mac / Windows 向けのビルドを設定する。

## タスク
- [ ] electron-builder のインストール
- [ ] electron-builder.yml の設定（appId, productName 等）
- [ ] Mac 向け .dmg ビルド設定
- [ ] Windows 向け .exe インストーラ設定
- [ ] npm run build コマンドの設定

## 参考
仕様書 Section 9.2（配布方法）"

create_issue "Mac 向けビルド・動作確認" "electron" "$M7" \
"## 概要
Mac 向けの .dmg ビルドを作成し、動作を確認する。

## タスク
- [ ] npm run build で .dmg を生成
- [ ] インストール・起動の確認
- [ ] 全機能の動作確認
- [ ] Apple Silicon（M 系）と Intel Mac での確認"

create_issue "Windows 向けビルド・動作確認" "electron" "$M7" \
"## 概要
Windows 向けの .exe ビルドを作成し、動作を確認する。

## タスク
- [ ] npm run build で .exe を生成（Mac 上でのクロスビルドまたは Windows 環境）
- [ ] インストール・起動の確認
- [ ] 全機能の動作確認
- [ ] Windows 10 / 11 での確認"

create_issue "自動アップデート機能の実装（electron-updater）" "electron" "$M7" \
"## 概要
GitHub Releases からの自動アップデート機能を実装する。

## タスク
- [ ] electron-updater のインストール
- [ ] 起動時のアップデートチェック実装
- [ ] アップデート通知ダイアログの実装
- [ ] ダウンロード・再起動後の更新確認

## 参考
仕様書 Section 9.3（自動アップデート）"

create_issue "GitHub Releases へのビルド成果物アップロード" "infra,electron" "$M7" \
"## 概要
GitHub Releases に Mac / Windows 向けビルドをアップロードする仕組みを整える。

## タスク
- [ ] GitHub Actions でのビルド自動化（オプション）
- [ ] v1.0.0-beta の Release 作成
- [ ] .dmg / .exe のアップロード確認
- [ ] Release ノートの記載"

echo "  Phase 8 の Issue を作成中..."
create_issue "README.md の作成（インストール手順・セキュリティ注意事項含む）" "docs" "$M8" \
"## 概要
プロジェクトの README.md を作成する。

## タスク
- [ ] プロジェクト概要・スクリーンショットの追加
- [ ] 必要な環境（Node.js バージョン等）の記載
- [ ] インストール・起動手順の記載
- [ ] 設定方法（API キーの設定）の記載
- [ ] セキュリティ注意事項の記載（仕様書 Section 3.5 を参考）
- [ ] ライセンスの記載

## 参考
仕様書 Section 3.5（会社利用時のセキュリティ注意事項）"

create_issue "CONTRIBUTING.md の作成（コントリビュートガイド）" "docs" "$M8" \
"## 概要
オープンソースプロジェクトへのコントリビュートガイドを作成する。

## タスク
- [ ] Issue / PR の作成方法
- [ ] ブランチ命名規則
- [ ] コミットメッセージ規則
- [ ] セキュアコーディング規約への準拠を必須と明記
- [ ] レビュープロセスの説明

## 参考
仕様書 Section 14（セキュアコーディング規約）"

create_issue "CHANGELOG.md の作成" "docs" "$M8" \
"## 概要
バージョンごとの変更履歴ファイルを作成する。

## タスク
- [ ] Keep a Changelog フォーマットの採用
- [ ] v1.0.0 の変更内容を記載"

create_issue "全ブラウザ（Chrome/Edge/Firefox/Safari）最終テスト" "frontend" "$M8" \
"## 概要
リリース前の全ブラウザ最終テストを実施する。

## タスク
- [ ] Chrome 最新版での全機能テスト
- [ ] Edge 最新版での全機能テスト
- [ ] Firefox 最新版での全機能テスト
- [ ] Safari 最新版での全機能テスト
- [ ] 発見した不具合の修正

## 参考
仕様書 Section 12（非機能要件）"

create_issue "Mac / Windows 両環境での最終動作確認" "electron" "$M8" \
"## 概要
Electron アプリとして Mac / Windows 両環境での最終動作確認を行う。

## タスク
- [ ] Mac での全機能テスト
- [ ] Windows での全機能テスト
- [ ] API キー設定〜図生成〜PDF 出力の一連フローの確認
- [ ] 自動アップデートの動作確認"

create_issue "npm audit 最終チェック・脆弱性ゼロの確認" "security,infra" "$M8" \
"## 概要
リリース前に脆弱性が残っていないことを最終確認する。

## タスク
- [ ] npm audit の実行（high 以上が 0 件であること）
- [ ] 残っている脆弱性の対処（バージョンアップまたは代替パッケージへの切り替え）
- [ ] ESLint の最終チェック（エラー 0 件）
- [ ] セキュリティチェックリストの全項目の確認

## 参考
仕様書 Section 14（セキュアコーディング規約）"

create_issue "v1.0.0 タグの作成・GitHub Release の公開" "infra,docs" "$M8" \
"## 概要
v1.0.0 を正式にリリースする。

## タスク
- [ ] git tag v1.0.0 の作成
- [ ] GitHub Release の作成
- [ ] .dmg / .exe のアップロード
- [ ] リリースノートの記載（CHANGELOG.md から転記）
- [ ] リポジトリを Public に設定（オープンソース公開）"

echo ""
echo "================================================"
echo "  セットアップ完了！"
echo ""
echo "  以下の URL で確認できます："
echo "  https://github.com/$OWNER/$REPO/milestones"
echo "  https://github.com/$OWNER/$REPO/issues"
echo "================================================"
echo ""
