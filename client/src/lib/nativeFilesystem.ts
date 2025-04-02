import { Capacitor } from '@capacitor/core';

interface FileSystemPlugin {
  saveFile(options: { content: string; fileName: string; directory?: string }): Promise<{ success: boolean; path: string }>;
}

/**
 * This is a JavaScript wrapper for our native FileSystem plugin
 * It provides a fallback for when running in the browser
 */
export class NativeFilesystem {
  private static isSupported(): boolean {
    return Capacitor.isPluginAvailable('FileSystem');
  }

  private static getPlugin(): FileSystemPlugin {
    return (Capacitor.getPlatform() === 'web') 
      ? NativeFilesystem.createWebFallback() 
      : (window as any).Capacitor.Plugins.FileSystem;
  }

  private static createWebFallback(): FileSystemPlugin {
    return {
      saveFile: async ({ content, fileName }) => {
        console.log('Using web fallback to save file');
        
        try {
          // Create a blob from the content
          const blob = new Blob([content], { type: 'text/plain' });
          
          // Create a URL for the blob
          const url = URL.createObjectURL(blob);
          
          // Create a download link
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          
          // Append to document, click, and remove
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          
          return { success: true, path: 'Downloaded via browser' };
        } catch (error) {
          console.error('Error in web fallback', error);
          throw error;
        }
      }
    };
  }

  /**
   * Save a text file to the device's file system
   * 
   * @param content The text content to save
   * @param fileName The name of the file with extension
   * @param directory Optional. The directory to save to (defaults to Downloads)
   * @returns Promise with the result of the operation
   */
  public static async saveFile(content: string, fileName: string, directory?: string): Promise<{ success: boolean; path: string }> {
    try {
      const plugin = NativeFilesystem.getPlugin();
      return await plugin.saveFile({ content, fileName, directory });
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, path: '' };
    }
  }
}