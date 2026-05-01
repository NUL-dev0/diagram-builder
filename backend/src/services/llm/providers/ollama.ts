import axios from 'axios';
import { LLMProvider, LLMProviderName } from '../types';

export class OllamaProvider implements LLMProvider {
  readonly name: LLMProviderName = 'ollama';
  readonly defaultModel = 'llama3';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/generate`, {
      model: model ?? this.defaultModel,
      prompt,
      stream: false,
    });
    return response.data.response as string;
  }

  async testConnection(model?: string): Promise<boolean> {
    await axios.post(`${this.baseUrl}/api/generate`, {
      model: model ?? this.defaultModel,
      prompt: 'ping',
      stream: false,
    });
    return true;
  }
}
