export type LLMProviderName = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'azure' | 'openai-compatible';

export interface GenerateRequest {
  diagramType: string;
  description: string;
  currentCode?: string;
  provider: LLMProviderName;
  model?: string;
}

export interface GenerateResult {
  mermaidCode: string;
  provider: LLMProviderName;
  model: string;
}

export interface LLMProvider {
  readonly name: LLMProviderName;
  readonly defaultModel: string;
  generate(prompt: string, model?: string): Promise<string>;
  testConnection(model?: string): Promise<boolean>;
}
