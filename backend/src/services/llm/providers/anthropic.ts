import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMProviderName } from '../types';
import { getApiKey } from '../../keychainService';

export class AnthropicProvider implements LLMProvider {
  readonly name: LLMProviderName = 'anthropic';
  readonly defaultModel = 'claude-3-5-sonnet-20241022';

  private async client(): Promise<Anthropic> {
    const apiKey = await getApiKey('anthropic');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY が設定されていません');
    return new Anthropic({ apiKey });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const c = await this.client();
    const response = await c.messages.create({
      model: model ?? this.defaultModel,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('予期しないレスポンス形式');
    return block.text;
  }

  async testConnection(model?: string): Promise<boolean> {
    const c = await this.client();
    await c.messages.create({
      model: model ?? this.defaultModel,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return true;
  }
}
