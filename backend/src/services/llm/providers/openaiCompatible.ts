import OpenAI from 'openai';
import { LLMProvider, LLMProviderName } from '../types';
import { getApiKey } from '../../keychainService';

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name: LLMProviderName = 'openai-compatible';
  readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.CUSTOM_DEFAULT_MODEL ?? 'openai/gpt-4o';
  }

  async resolveDefaultModel(): Promise<string> {
    const stored = await getApiKey('openai-compatible-model');
    return stored ?? this.defaultModel;
  }

  private async client(): Promise<OpenAI> {
    const apiKey = await getApiKey('openai-compatible');
    const baseURL = await getApiKey('openai-compatible-url') ?? process.env.CUSTOM_BASE_URL;
    if (!apiKey) throw new Error('CUSTOM_API_KEY が設定されていません');
    if (!baseURL) throw new Error('CUSTOM_BASE_URL が設定されていません');
    return new OpenAI({ apiKey, baseURL });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const c = await this.client();
    const response = await c.chat.completions.create({
      model: model ?? await this.resolveDefaultModel(),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async testConnection(model?: string): Promise<boolean> {
    const c = await this.client();
    await c.chat.completions.create({
      model: model ?? await this.resolveDefaultModel(),
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 10,
    });
    return true;
  }
}
