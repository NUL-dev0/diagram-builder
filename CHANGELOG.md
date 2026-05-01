# Changelog

## [1.0.0] - 2026-05-02

### Added

**コア機能**
- 11 種類の Mermaid 図に対応（ユースケース・アーキテクチャ・シーケンス・フローチャート・クラス・ER・ガント・マインドマップ・状態遷移・グラフ・ネットワーク構成図）
- リアルタイムプレビュー（Mermaid.js v10）
- CodeMirror ベースのコードエディタ（oneDark テーマ）
- ズーム・パン操作（ホイールズーム、ドラッグパン）

**AI 生成**
- Claude / OpenAI / Gemini / Ollama / Azure OpenAI 対応
- 図種別プロンプトテンプレート（11 種）
- 生成フェーズ表示（生成中スピナー・完了・エラー）
- API 送信前の確認ダイアログ

**図の管理**
- LocalStorage + バックエンドファイルのハイブリッド保存
- フォルダ管理（ドラッグ＆ドロップで並び替え）
- 名前・更新日時・種別でのソート
- 名前・タグでの検索

**PDF 出力**
- 単一図・複数図の PDF 出力
- 表紙（タイトル・日付・説明）付き
- A4 縦横対応

**セキュリティ**
- OS キーチェーン連携（keytar）
- 環境変数フォールバック
- DOMPurify による SVG サニタイズ
- zod による入力バリデーション
- eslint-plugin-security による静的解析

**Electron デスクトップアプリ**
- Mac (.dmg) / Windows (.exe) パッケージング
- contextIsolation / sandbox による安全な IPC
- Content Security Policy 設定
- 自動アップデート（electron-updater / GitHub Releases）
- 未保存変更の警告ダイアログ
