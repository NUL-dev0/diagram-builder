import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMProviderName } from '../types';
import { getApiKey } from '../../keychainService';

export class GeminiProvider implements LLMProvider {
  readonly name: LLMProviderName = 'gemini';
  readonly defaultModel = 'gemini-1.5-pro';

  private async getClient(model?: string) {
    const apiKey = await getApiKey('gemini');
    if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません');
    const client = new GoogleGenerativeAI(apiKey);
    return client.getGenerativeModel({ model: model ?? this.defaultModel });
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const genModel = await this.getClient(model);
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  async testConnection(model?: string): Promise<boolean> {
    const genModel = await this.getClient(model);
    await genModel.generateContent('ping');
    return true;
  }
}
