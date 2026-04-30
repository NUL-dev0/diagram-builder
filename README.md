# DiagramBuilder

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## プロジェクト概要

ソフトウェア開発やシステム構築時に必要な各種図を、AI の補佐のもと効率的に作成・管理・出力できるツール。

## 特徴

- ハイブリッド構成: Web UI として開発、Electron でデスクトップアプリ化
- クロスプラットフォーム対応: Mac / Windows / Linux 全対応
- AI 補佐: ユーザ設定の LLM API で図を自動生成
- 全図対応: 10 種類以上の図に対応
- 柔軟な API: Claude, OpenAI, Gemini, Ollama など自由に選択可能
- 両方のストレージ対応: ローカルファイル + ブラウザ LocalStorage
- リアルタイムプレビュー: Mermaid による即座の図表表示
- PDF 出力: 複数図を 1 つのドキュメントにまとめて出力
- セキュアな API キー管理: 暗号化保存・環境変数対応
- オープンソース: MIT ライセンスで公開

## 技術スタック

- **フロントエンド**: React, TypeScript, Tailwind CSS, Mermaid.js
- **バックエンド**: Node.js, Express.js
- **デスクトップアプリ**: Electron

## インストール

```bash
# プロジェクトのクローン
git clone https://github.com/NUL-dev0/diagram-builder.git
cd diagram-builder

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルに API キーなどを設定してください
```

## 開発サーバーの起動

```bash
npm run dev
```

## ビルドと実行（Electron）

```bash
# ビルド
npm run build

# 実行（開発用）
npm run electron:dev

# パッケージング（インストーラ作成）
npm run electron:build
```

## ライセンス

本プロジェクトは [MIT ライセンス](./LICENSE) の下で公開されています。

## セキュリティに関する注意事項

会社・業務での利用に関する詳細な注意事項は、[README.md のセキュリティセクション](./README.md#セキュリティに関する注意事項) を参照してください。

---

**⚠️ 警告**:
- **機密情報を入力しないでください**: LLM API に送信されるデータには、機密情報を含めないでください。
- **API キーの管理**: API キーは `.env` ファイルまたは OS キーチェーンで安全に管理してください。Git にコミットしないでください。
```

### 2. MIT ライセンスファイル（LICENSE）の作成

仕様書の「2.1 ライセンス」に基づき、`LICENSE` ファイルを作成します。

```
MIT License

Copyright (c) 2026 NUL-dev0

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**注意**: `Copyright (c) 2026 NUL-dev0` の `2026` は、仕様書の日付に合わせていますが、実際のリリース年などに合わせて適宜変更してください。`NUL-dev0` は作者名（または組織名）です。

### 3. `.gitignore` の設定

仕様書の「3.3 .gitignore の設定」および、以前のやり取りで確認した内容に基づき、`.gitignore` ファイルを更新します。

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env
.env.local
.env.production
.env.development.local
.env.test.local
.env.local.test

# config files (API keys, etc.)
config.json

# diagrams data (potentially sensitive)
diagrams/

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

**変更点**:
*   `config.json` を追加しました。
*   `diagrams/` を追加しました。
*   `.env*` の部分をより網羅的にしました（`.env.local`, `.env.production` なども含む）。

### 4. リポジトリの説明・トピックの設定

これは GitHub のリポジトリ設定画面で行う作業です。
GitHub の `diagram-builder` リポジトリページにアクセスし、以下の設定を行ってください。

*   **リポジトリの説明**:
    「ソフトウェア開発やシステム構築時に必要な各種図を、AI の補佐のもと効率的に作成・管理・出力できるツール。」
    のような、プロジェクトの目的を簡潔に表す説明文を設定します。

*   **トピック (Topics)**:
    関連性の高いキーワードを設定します。例えば以下のようなものが考えられます。
    *   `nextjs`
    *   `typescript`
    *   `electron`
    *   `ai`
    *   `diagrams`
    *   `documentation-tool`
    *   `open-source`

これらの設定が完了したら、以下の Git コマンドを実行して GitHub に反映させてください。

```bash
# diagram-builder ディレクトリ内にいることを確認
pwd

# README.md と LICENSE ファイルをステージング
git add README.md LICENSE .gitignore

# コミット
git commit -m "chore: Add README skeleton, LICENSE, and .gitignore"

# GitHub へプッシュ
git push origin mainTest commit for husky setup
