import OpenAI from 'openai';
import { LLMProvider, LLMProviderName } from '../types';
import { getApiKey } from '../../keychainService';

export class OpenAIProvider implements LLMProvider {
  readonly name: LLMProviderName = 'openai';
  readonly defaultModel = 'gpt-4o';

  private async client(): Promise<OpenAI> {
    const apiKey = await getApiKey('openai');
    if (!apiKey) throw new Error('OPENAI_API_KEY が設定されていません');
    return new OpenAI({ apiKey });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const c = await this.client();
    const response = await c.chat.completions.create({
      model: model ?? this.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async testConnection(model?: string): Promise<boolean> {
    const c = await this.client();
    await c.chat.completions.create({
      model: model ?? this.defaultModel,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 10,
    });
    return true;
  }
}
