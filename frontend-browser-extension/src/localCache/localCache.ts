export class LocalCache {
  static async saveUserProfile(profile: any) {
    // Demo stub. In production, implement real storage logic.
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ userProfile: profile }, () => resolve());
    });
  }

  static async getUserProfile() {
    // Demo stub. In production, implement real retrieval logic.
    return new Promise<any>((resolve) => {
      chrome.storage.local.get('userProfile', (data) => resolve(data.userProfile || {}));
    });
  }
} 