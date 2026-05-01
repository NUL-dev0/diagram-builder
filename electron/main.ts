import { app, BrowserWindow, shell, session } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn, execFileSync, ChildProcess } from 'child_process';
import http from 'http';

const isDev = !app.isPackaged;
const NEXT_PORT = 3000;
const BACKEND_PORT = 3001;
const APP_URL = `http://localhost:${NEXT_PORT}`;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

let mainWindow: BrowserWindow | null = null;
let loadingWindow: BrowserWindow | null = null;
const childProcesses: ChildProcess[] = [];

// パッケージ済みアプリは PATH が限定されるため node の実パスを解決する
function resolveNodePath(): string {
  const candidates =
    process.platform === 'win32'
      ? ['node.exe', 'C:\\Program Files\\nodejs\\node.exe']
      : [
        '/opt/homebrew/bin/node',   // Homebrew ARM (Apple Silicon)
        '/usr/local/bin/node',       // Homebrew Intel / nvm default symlink
        '/usr/bin/node',             // システム node
      ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // which コマンドで探す（最終手段）
  try {
    const extra = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin';
    return execFileSync('/usr/bin/env', ['which', 'node'], {
      env: { PATH: extra },
    }).toString().trim();
  } catch {
    return 'node';
  }
}

function waitForPort(port: number, urlPath = '/', timeoutMs = 90000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      const req = http.request({ host: 'localhost', port, path: urlPath, method: 'GET' }, (res) => {
        res.resume();
        if ((res.statusCode ?? 500) < 500) {
          resolve();
        } else if (Date.now() < deadline) {
          setTimeout(attempt, 1000);
        } else {
          reject(new Error(`Port ${port} not ready after ${timeoutMs}ms`));
        }
      });
      req.on('error', () => {
        if (Date.now() < deadline) setTimeout(attempt, 1000);
        else reject(new Error(`Port ${port} not ready after ${timeoutMs}ms`));
      });
      req.end();
    };
    attempt();
  });
}

function spawnChild(cmd: string, args: string[], cwd: string): ChildProcess {
  const extraPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin';
  const currentPath = process.env.PATH ?? '';
  const child = spawn(cmd, args, {
    cwd,
    stdio: 'ignore',
    env: {
      ...process.env,
      PATH: `${extraPath}:${currentPath}`,
    },
    shell: process.platform === 'win32',
  });
  childProcesses.push(child);
  return child;
}

async function startServers(): Promise<void> {
  const root = app.getAppPath();

  if (isDev) {
    const backendDir = path.join(root, 'backend');
    spawnChild(npm, ['run', 'dev'], root);
    spawnChild(npm, ['run', 'dev'], backendDir);
  } else {
    // Production: Next.js standalone + compiled backend
    const node = resolveNodePath();
    const backendDir = path.join(process.resourcesPath, 'backend');
    spawnChild(node, ['.next/standalone/server.js'], root);
    spawnChild(node, ['dist/app.js'], backendDir);
  }

  await Promise.all([
    waitForPort(NEXT_PORT),
    waitForPort(BACKEND_PORT, '/health'),
  ]);
}

function createLoadingWindow(): void {
  loadingWindow = new BrowserWindow({
    width: 360,
    height: 160,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    backgroundColor: '#00000000',
  });

  const html = encodeURIComponent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;
    background:linear-gradient(135deg,#1e40af,#1e293b);font-family:-apple-system,sans-serif;
    color:#e2e8f0;flex-direction:column;gap:12px;border-radius:12px;overflow:hidden}
    p{font-size:14px;margin:0}
    .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#60a5fa;
    animation:bounce .9s infinite;margin:0 2px}
    .dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  </style></head><body>
    <p>DiagramBuilder を起動中...</p>
    <div><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
  </body></html>`);

  loadingWindow.loadURL(`data:text/html;charset=utf-8,${html}`);
}

function setupCSP(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self' http://localhost:3000 http://localhost:3001",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000",
            "style-src 'self' 'unsafe-inline' http://localhost:3000",
            "img-src 'self' data: blob: http://localhost:3000",
            "font-src 'self' data: http://localhost:3000",
            "connect-src 'self' http://localhost:3000 http://localhost:3001",
          ].join('; '),
        ],
      },
    });
  });
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    show: false,
    backgroundColor: '#f9fafb',
  });

  mainWindow.once('ready-to-show', () => {
    loadingWindow?.close();
    loadingWindow = null;
    mainWindow?.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.diagrambuilder.app');
  }

  setupCSP();
  createLoadingWindow();

  try {
    await startServers();
    await createMainWindow();
  } catch (err) {
    console.error('Failed to start servers:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    childProcesses.forEach((p) => p.kill());
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow().catch(console.error);
});

app.on('will-quit', () => {
  childProcesses.forEach((p) => p.kill());
});

// Disable creating new windows from renderer
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (_e, url) => {
    if (!url.startsWith(APP_URL)) {
      _e.preventDefault();
    }
  });
});
