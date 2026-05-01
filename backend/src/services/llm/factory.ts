import { LLMProvider, LLMProviderName } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { AzureOpenAIProvider } from './providers/azure';
import { OpenAICompatibleProvider } from './providers/openaiCompatible';

export function createProvider(name: LLMProviderName): LLMProvider {
  switch (name) {
    case 'anthropic':        return new AnthropicProvider();
    case 'openai':           return new OpenAIProvider();
    case 'gemini':           return new GeminiProvider();
    case 'ollama':           return new OllamaProvider();
    case 'azure':            return new AzureOpenAIProvider();
    case 'openai-compatible': return new OpenAICompatibleProvider();
  }
}
