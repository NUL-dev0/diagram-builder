const SYSTEM_BASE = `あなたは Mermaid.js の図を生成する専門家です。
ユーザの要件を読み取り、Mermaid コードのみを返してください。
コードブロック（\`\`\`mermaid ... \`\`\`）や説明文は一切含めず、Mermaid 記法の生コードだけを返してください。`;

const TEMPLATES: Record<string, string> = {
  usecase: `${SYSTEM_BASE}
図の種類: ユースケース図
記法: graph LR（アクターは ((名前)) で表現）
要件:`,

  architecture: `${SYSTEM_BASE}
図の種類: システムアーキテクチャ図
記法: graph TB または graph LR
要件:`,

  sequence: `${SYSTEM_BASE}
図の種類: シーケンス図
記法: sequenceDiagram
要件:`,

  flowchart: `${SYSTEM_BASE}
図の種類: フローチャート
記法: flowchart TD
条件分岐は {条件} で表現し、エッジに Yes/No ラベルを付与すること。
要件:`,

  class: `${SYSTEM_BASE}
図の種類: クラス図
記法: classDiagram
要件:`,

  er: `${SYSTEM_BASE}
図の種類: ER 図
記法: erDiagram
要件:`,

  gantt: `${SYSTEM_BASE}
図の種類: ガントチャート
記法: gantt（dateFormat YYYY-MM-DD を必ず含める）
要件:`,

  mindmap: `${SYSTEM_BASE}
図の種類: マインドマップ
記法: mindmap（ルートノードは root((名前)) で表現）
要件:`,

  state: `${SYSTEM_BASE}
図の種類: 状態遷移図
記法: stateDiagram-v2
要件:`,

  graph: `${SYSTEM_BASE}
図の種類: グラフ・ネットワーク図
記法: graph LR（ノード間の接続関係を表現）
要件:`,

  network: `${SYSTEM_BASE}
図の種類: ネットワーク構成図
記法: graph LR または graph TB
以下のノード形状を用いること:
  - インターネット/クラウド: ((名前))
  - ファイアウォール/ルータ: [名前]
  - スイッチ: [名前]
  - サーバ: [名前] または [(名前)]（DB の場合）
  - PC/端末: [名前]
エッジにはプロトコルやポート番号をラベルとして付与すること（例: -->|HTTPS:443|）。
必要に応じて subgraph でネットワークセグメント（DMZ・内部NW等）を表現すること。
要件:`,
};

export function buildPrompt(diagramType: string, description: string, currentCode?: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const template = TEMPLATES[diagramType] ?? TEMPLATES['architecture'];
  let prompt = `${template}\n${description}`;
  if (currentCode) {
    prompt += `\n\n現在のコード（修正の参考にしてください）:\n${currentCode}`;
  }
  return prompt;
}
