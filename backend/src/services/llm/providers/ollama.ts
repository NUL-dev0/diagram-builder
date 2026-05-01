import axios from 'axios';
import { LLMProvider, LLMProviderName } from '../types';

export class OllamaProvider implements LLMProvider {
  readonly name: LLMProviderName = 'ollama';
  readonly defaultModel = 'llama3';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  }

  private async resolveModel(requested?: string): Promise<string> {
    if (requested) return requested;
    try {
      const res = await axios.get(`${this.baseUrl}/api/tags`);
      const models: { name: string }[] = res.data?.models ?? [];
      if (models.length > 0) return models[0].name;
    } catch {
      // fallback
    }
    return this.defaultModel;
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const resolvedModel = await this.resolveModel(model);
    const response = await axios.post(
      `${this.baseUrl}/api/generate`,
      { model: resolvedModel, prompt, stream: false },
      { timeout: 300_000 }
    );
    return response.data.response as string;
  }

  async testConnection(model?: string): Promise<boolean> {
    const resolvedModel = await this.resolveModel(model);
    await axios.post(
      `${this.baseUrl}/api/generate`,
      { model: resolvedModel, prompt: 'ping', stream: false },
      { timeout: 30_000 }
    );
    return true;
  }
}
