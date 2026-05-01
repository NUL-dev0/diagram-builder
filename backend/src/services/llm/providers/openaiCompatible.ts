import OpenAI from 'openai';
import { LLMProvider, LLMProviderName } from '../types';

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name: LLMProviderName = 'openai-compatible';
  readonly defaultModel: string;
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.CUSTOM_API_KEY;
    const baseURL = process.env.CUSTOM_BASE_URL;
    if (!apiKey) throw new Error('CUSTOM_API_KEY が設定されていません');
    if (!baseURL) throw new Error('CUSTOM_BASE_URL が設定されていません');
    this.defaultModel = process.env.CUSTOM_DEFAULT_MODEL ?? 'gpt-4o';
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: model ?? this.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async testConnection(model?: string): Promise<boolean> {
    await this.client.chat.completions.create({
      model: model ?? this.defaultModel,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 10,
    });
    return true;
  }
}
