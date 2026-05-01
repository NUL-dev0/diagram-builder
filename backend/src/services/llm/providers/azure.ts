import OpenAI from 'openai';
import { LLMProvider, LLMProviderName } from '../types';

export class AzureOpenAIProvider implements LLMProvider {
  readonly name: LLMProviderName = 'azure';
  readonly defaultModel = 'gpt-4o';
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? '2024-02-01';
    if (!apiKey) throw new Error('AZURE_OPENAI_API_KEY が設定されていません');
    if (!endpoint) throw new Error('AZURE_OPENAI_ENDPOINT が設定されていません');
    this.client = new OpenAI({ apiKey, baseURL: `${endpoint}/openai/deployments`, defaultQuery: { 'api-version': apiVersion }, defaultHeaders: { 'api-key': apiKey } });
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
