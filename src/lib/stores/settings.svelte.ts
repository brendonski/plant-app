import { browser } from '$app/environment';

export type PhotoResolution = 'high' | 'medium' | 'low';

export interface Settings {
  photoResolution: PhotoResolution;
}

const DEFAULT_SETTINGS: Settings = {
  photoResolution: 'medium'
};

class SettingsStore {
  private _photoResolution = $state<PhotoResolution>('medium');
  private readonly STORAGE_KEY = 'garden-app-settings';

  constructor() {
    if (browser) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Settings;
        this._photoResolution = parsed.photoResolution || 'medium';
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }

  private saveToStorage() {
    if (browser) {
      try {
        const settings: Settings = {
          photoResolution: this._photoResolution
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      } catch (err) {
        console.error('Error saving settings:', err);
      }
    }
  }

  get photoResolution(): PhotoResolution {
    return this._photoResolution;
  }

  setPhotoResolution(resolution: PhotoResolution) {
    this._photoResolution = resolution;
    this.saveToStorage();
  }

  getMaxDimension(): number {
    switch (this._photoResolution) {
      case 'high':
        return 2048;
      case 'medium':
        return 1024;
      case 'low':
        return 512;
      default:
        return 1024;
    }
  }

  getJpegQuality(): number {
    switch (this._photoResolution) {
      case 'high':
        return 0.92;
      case 'medium':
        return 0.85;
      case 'low':
        return 0.75;
      default:
        return 0.85;
    }
  }
}

export const settingsStore = new SettingsStore();
