export interface UserSettings {
  forwardUrlsEnabled: boolean;
  userId?: string;
  preferences?: {
    dataCollection: {
      enabled: boolean;
      types: string[];
    };
  };
}

export class StorageService {
  static async getUserSettings(): Promise<UserSettings> {
    const result = await chrome.storage.local.get(['userSettings']);
    return result.userSettings || {
      forwardUrlsEnabled: false,
      preferences: {
        dataCollection: {
          enabled: false,
          types: []
        }
      }
    };
  }

  static async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await chrome.storage.local.set({ userSettings: updatedSettings });
  }

  static async clearUserSettings(): Promise<void> {
    await chrome.storage.local.remove(['userSettings']);
  }
} 