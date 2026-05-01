interface ElectronAPI {
  platform: string;
  isElectron: true;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
