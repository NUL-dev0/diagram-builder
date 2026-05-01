import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4, validate as isUUID } from 'uuid';

export interface DiagramRecord {
  id: string;
  name: string;
  type: string;
  description: string;
  mermaidCode: string;
  tags: string[];
  llmProvider: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

const DIAGRAMS_DIR = path.resolve(process.cwd(), 'diagrams');

async function ensureDir(): Promise<void> {
  await fs.mkdir(DIAGRAMS_DIR, { recursive: true });
}

function safePath(id: string): string {
  if (!isUUID(id)) throw new Error('Invalid diagram ID');
  return path.join(DIAGRAMS_DIR, `${id}.json`);
}

export async function listDiagrams(): Promise<DiagramRecord[]> {
  await ensureDir();
  const files = await fs.readdir(DIAGRAMS_DIR);
  const records: DiagramRecord[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(DIAGRAMS_DIR, file), 'utf-8');
      records.push(JSON.parse(raw) as DiagramRecord);
    } catch {
      // 壊れたファイルはスキップ
    }
  }
  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDiagram(id: string): Promise<DiagramRecord | null> {
  try {
    const raw = await fs.readFile(safePath(id), 'utf-8');
    return JSON.parse(raw) as DiagramRecord;
  } catch {
    return null;
  }
}

export async function saveDiagram(data: Omit<DiagramRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<DiagramRecord> {
  await ensureDir();
  const now = new Date().toISOString();
  const record: DiagramRecord = { ...data, id: uuidv4(), createdAt: now, updatedAt: now, version: '1.0' };
  await fs.writeFile(safePath(record.id), JSON.stringify(record, null, 2), 'utf-8');
  return record;
}

export async function updateDiagram(id: string, data: Partial<Omit<DiagramRecord, 'id' | 'createdAt' | 'version'>>): Promise<DiagramRecord | null> {
  const existing = await getDiagram(id);
  if (!existing) return null;
  const updated: DiagramRecord = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  await fs.writeFile(safePath(id), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function deleteDiagram(id: string): Promise<boolean> {
  try {
    await fs.unlink(safePath(id));
    return true;
  } catch {
    return false;
  }
}
