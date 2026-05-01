# DiagramBuilder

[![Security Check](https://github.com/NUL-dev0/diagram-builder/actions/workflows/security.yml/badge.svg)](https://github.com/NUL-dev0/diagram-builder/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

AI を活用して Mermaid 図を素早く作成・管理・PDF 出力できるデスクトップアプリです。

---

## 特徴

- **11 種類の図に対応** — ユースケース・アーキテクチャ・シーケンス・フローチャート・クラス・ER・ガント・マインドマップ・状態遷移・グラフ・ネットワーク構成図
- **AI 自動生成** — Claude / OpenAI / Gemini / Ollama / Azure OpenAI から好きなプロバイダを選択
- **リアルタイムプレビュー** — Mermaid.js による即時レンダリング、ズーム・パン操作対応
- **フォルダ管理** — ドラッグ＆ドロップでフォルダを並び替え
- **PDF 出力** — 複数図を 1 ファイルにまとめて出力（表紙付き）
- **安全な API キー管理** — OS キーチェーン / 環境変数に対応、Git には残らない
- **自動アップデート** — GitHub Releases から新バージョンを自動検出・適用

---

## インストール（Electron アプリ）

[Releases](https://github.com/NUL-dev0/diagram-builder/releases) から最新版をダウンロードしてください。

| OS | ファイル |
|----|--------|
| macOS (Apple Silicon) | `DiagramBuilder-x.x.x-arm64.dmg` |
| macOS (Intel) | `DiagramBuilder-x.x.x.dmg` |
| Windows | `DiagramBuilder-Setup-x.x.x.exe` |

> **macOS の注意**: 未署名アプリのため、初回起動時に「開発元を確認できない」と表示されます。DMG を右クリック → 「開く」から起動してください。

---

## 開発環境のセットアップ

### 必要な環境

- Node.js 20+
- npm 10+

### セットアップ

```bash
git clone https://github.com/NUL-dev0/diagram-builder.git
cd diagram-builder

# フロントエンド依存関係
npm install

# バックエンド依存関係
cd backend && npm install && cd ..

# 環境変数（任意）
cp .env.example backend/.env
```

### 開発サーバー起動

```bash
# フロントエンド (Next.js) — ポート 3000
npm run dev

# バックエンド (Express) — 別ターミナルでポート 3001
cd backend && npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### Electron 開発モード

```bash
npm run electron:dev
```

---

## ビルド

```bash
# Electron アプリをパッケージング（.dmg / .exe）
npm run electron:build
```

ビルド成果物は `dist-electron/` に出力されます。

---

## API キーの設定

アプリ起動後、右上の **設定** からプロバイダごとに API キーを登録できます。

| プロバイダ | 環境変数名 |
|-----------|-----------|
| Claude (Anthropic) | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| Azure OpenAI | `AZURE_OPENAI_API_KEY` |
| Ollama | 不要（ローカル実行） |

API キーは OS キーチェーンに暗号化保存されます。環境変数でも設定可能です。

---

## セキュリティに関する注意事項

- **機密情報を入力しないでください**: 要件入力欄に入力したテキストは選択した LLM プロバイダに送信されます。機密情報・個人情報を含めないでください。
- **API キーの管理**: API キーをソースコードや Git リポジトリにコミットしないでください。
- **ローカル LLM の推奨**: 機密性の高い業務には Ollama（ローカル実行）の使用を推奨します。

---

## ライセンス

[MIT License](LICENSE) — Copyright © 2026 NUL-dev0
