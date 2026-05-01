import keytar from 'keytar';

const SERVICE = 'DiagramBuilder';

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  await keytar.setPassword(SERVICE, provider, apiKey);
}

export async function getApiKey(provider: string): Promise<string | null> {
  // キーチェーンを優先し、なければ環境変数にフォールバック
  const fromKeychain = await keytar.getPassword(SERVICE, provider);
  if (fromKeychain) return fromKeychain;

  const envMap: Record<string, string | undefined> = {
    anthropic:          process.env.ANTHROPIC_API_KEY,
    openai:             process.env.OPENAI_API_KEY,
    gemini:             process.env.GEMINI_API_KEY,
    azure:              process.env.AZURE_OPENAI_API_KEY,
    'openai-compatible': process.env.CUSTOM_API_KEY,
  };
  // eslint-disable-next-line security/detect-object-injection
  return envMap[provider] ?? null;
}

export async function deleteApiKey(provider: string): Promise<void> {
  await keytar.deletePassword(SERVICE, provider);
}

export async function hasApiKey(provider: string): Promise<boolean> {
  const key = await getApiKey(provider);
  return key !== null && key.length > 0;
}

export type KeySource = 'keychain' | 'env' | 'none';

export async function getKeySource(provider: string): Promise<KeySource> {
  const fromKeychain = await keytar.getPassword(SERVICE, provider);
  if (fromKeychain) return 'keychain';

  const envMap: Record<string, string | undefined> = {
    anthropic:           process.env.ANTHROPIC_API_KEY,
    openai:              process.env.OPENAI_API_KEY,
    gemini:              process.env.GEMINI_API_KEY,
    azure:               process.env.AZURE_OPENAI_API_KEY,
    'openai-compatible': process.env.CUSTOM_API_KEY,
  };
  // eslint-disable-next-line security/detect-object-injection
  return envMap[provider] ? 'env' : 'none';
}
