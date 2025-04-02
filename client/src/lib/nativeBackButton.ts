import { Capacitor } from '@capacitor/core';

interface BackButtonPlugin {
  exitApp(): Promise<{ success: boolean }>;
}

/**
 * This is a JavaScript wrapper for our native BackButton plugin
 * It provides a fallback for when running in the browser
 */
export class NativeBackButton {
  private static isSupported(): boolean {
    return Capacitor.isPluginAvailable('BackButton');
  }

  private static getPlugin(): BackButtonPlugin {
    return (Capacitor.getPlatform() === 'web') 
      ? NativeBackButton.createWebFallback() 
      : (window as any).Capacitor.Plugins.BackButton;
  }

  private static createWebFallback(): BackButtonPlugin {
    return {
      exitApp: async () => {
        console.log('Would exit app in native environment');
        return { success: true };
      }
    };
  }

  /**
   * Exit the application
   * This is only effective on native platforms
   */
  public static async exitApp(): Promise<boolean> {
    try {
      const plugin = NativeBackButton.getPlugin();
      const result = await plugin.exitApp();
      return result.success;
    } catch (error) {
      console.error('Error exiting app:', error);
      return false;
    }
  }
}