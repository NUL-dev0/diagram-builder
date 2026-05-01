import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMProviderName } from '../types';

export class GeminiProvider implements LLMProvider {
  readonly name: LLMProviderName = 'gemini';
  readonly defaultModel = 'gemini-1.5-pro';
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません');
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, model?: string): Promise<string> {
    const genModel = this.client.getGenerativeModel({ model: model ?? this.defaultModel });
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  async testConnection(model?: string): Promise<boolean> {
    const genModel = this.client.getGenerativeModel({ model: model ?? this.defaultModel });
    await genModel.generateContent('ping');
    return true;
  }
}
