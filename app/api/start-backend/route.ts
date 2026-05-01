import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const BACKEND_DIR = path.join(process.cwd(), 'backend');
const BACKEND_URL = 'http://localhost:3001';

async function checkRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const isRunning = await checkRunning();
  return NextResponse.json({
    projectRoot: process.cwd(),
    backendDir: BACKEND_DIR,
    platform: process.platform,
    isRunning,
  });
}

export async function POST() {
  if (await checkRunning()) {
    return NextResponse.json({ status: 'already_running' });
  }

  try {
    const isWin = process.platform === 'win32';
    // ログインシェルを使うことで nvm 等のパスを引き継ぐ
    const shell = isWin ? 'cmd' : (process.env.SHELL ?? '/bin/zsh');
    const args = isWin
      ? ['/c', `cd /d "${BACKEND_DIR}" && npm run dev`]
      : ['-l', '-c', `cd "${BACKEND_DIR}" && npm run dev`];

    const child = spawn(shell, args, { detached: true, stdio: 'ignore' });
    child.unref();

    return NextResponse.json({ status: 'starting' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
