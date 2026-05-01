import OpenAI from 'openai';
import { LLMProvider, LLMProviderName } from '../types';

export class OpenAIProvider implements LLMProvider {
  readonly name: LLMProviderName = 'openai';
  readonly defaultModel = 'gpt-4o';
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY が設定されていません');
    this.client = new OpenAI({ apiKey });
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
