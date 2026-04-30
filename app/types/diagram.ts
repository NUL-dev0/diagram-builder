export type DiagramType =
  | 'usecase'
  | 'architecture'
  | 'sequence'
  | 'flowchart'
  | 'class'
  | 'er'
  | 'gantt'
  | 'mindmap'
  | 'state'
  | 'graph';

export interface DiagramTypeConfig {
  type: DiagramType;
  label: string;
}

export const DIAGRAM_TYPES: DiagramTypeConfig[] = [
  { type: 'usecase', label: 'ユースケース図' },
  { type: 'architecture', label: 'システムアーキテクチャ図' },
  { type: 'sequence', label: 'シーケンス図' },
  { type: 'flowchart', label: 'フローチャート' },
  { type: 'class', label: 'クラス図' },
  { type: 'er', label: 'ER 図' },
  { type: 'gantt', label: 'ガントチャート' },
  { type: 'mindmap', label: 'マインドマップ' },
  { type: 'state', label: '状態遷移図' },
  { type: 'graph', label: 'グラフ・ネットワーク図' },
];

export const DEFAULT_MERMAID_CODES: Record<DiagramType, string> = {
  usecase: `graph LR
  User((ユーザ)) --> UC1[ログイン]
  User --> UC2[図の作成]
  User --> UC3[図の保存]`,

  architecture: `graph TB
  Client[クライアント] --> FE[フロントエンド]
  FE --> BE[バックエンド]
  BE --> DB[(データベース)]`,

  sequence: `sequenceDiagram
  ユーザ->>フロント: リクエスト
  フロント->>バックエンド: API 呼び出し
  バックエンド-->>フロント: レスポンス
  フロント-->>ユーザ: 表示`,

  flowchart: `flowchart TD
  A[開始] --> B{条件}
  B -- Yes --> C[処理 A]
  B -- No --> D[処理 B]
  C --> E[終了]
  D --> E`,

  class: `classDiagram
  class User {
    +String name
    +String email
    +login()
  }
  class Diagram {
    +String title
    +String code
    +save()
  }
  User --> Diagram`,

  er: `erDiagram
  USER {
    int id
    string name
    string email
  }
  DIAGRAM {
    int id
    string title
    string code
  }
  USER ||--o{ DIAGRAM : creates`,

  gantt: `gantt
  title プロジェクトスケジュール
  dateFormat YYYY-MM-DD
  section Phase 1
  タスク1 :a1, 2024-01-01, 7d
  タスク2 :after a1, 5d
  section Phase 2
  タスク3 :2024-01-14, 7d`,

  mindmap: `mindmap
  root((DiagramBuilder))
    フロントエンド
      React
      TypeScript
    バックエンド
      Node.js
      Express
    機能
      AI 生成
      PDF 出力`,

  state: `stateDiagram-v2
  [*] --> 待機
  待機 --> 生成中 : 生成
  生成中 --> プレビュー : 完了
  生成中 --> エラー : 失敗
  エラー --> 待機 : リトライ
  プレビュー --> 保存済み : 保存`,

  graph: `graph LR
  A[ノード A] --- B[ノード B]
  B --- C[ノード C]
  C --- D[ノード D]
  A --- D`,
};
