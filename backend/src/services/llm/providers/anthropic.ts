import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMProviderName } from '../types';

export class AnthropicProvider implements LLMProvider {
  readonly name: LLMProviderName = 'anthropic';
  readonly defaultModel = 'claude-3-5-sonnet-20241022';
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY が設定されていません');
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: model ?? this.defaultModel,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('予期しないレスポンス形式');
    return block.text;
  }

  async testConnection(model?: string): Promise<boolean> {
    await this.client.messages.create({
      model: model ?? this.defaultModel,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return true;
  }
}
