import { promises as fs } from "fs";
import { MediaFile } from "@shared/schema";
import FTPClient from "ftp";
import { promisify } from "util";

interface FtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export class FtpClient {
  private client: FTPClient;
  private config: FtpConfig;
  
  constructor(config: FtpConfig) {
    this.client = new FTPClient();
    this.config = config;
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        resolve();
      });
      
      this.client.on('error', (err) => {
        reject(err);
      });
      
      this.client.connect(this.config);
    });
  }
  
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.client.end();
      resolve();
    });
  }
  
  async list(path: string = '/'): Promise<FTPClient.ListingElement[]> {
    return new Promise((resolve, reject) => {
      this.client.list(path, (err, list) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(list || []);
      });
    });
  }
  
  async getFoldersRecursive(searchTerm: string, basePath: string = '/', depth: number = 0): Promise<string[]> {
    // Limit recursion depth to prevent infinite loops or excessive nesting
    if (depth > 3) {
      return [basePath];
    }
    
    try {
      const folders: string[] = [basePath];
      const listing = await this.list(basePath);
      
      // Convert search term to lowercase for case-insensitive matching
      const searchTermLower = searchTerm.toLowerCase();
      const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 2);
      
      // Check if this is a movie directory based on path
      const isMovieDir = basePath.toLowerCase().includes('movie');
      
      for (const item of listing) {
        if (item.type === 'd') {
          const name = item.name.toLowerCase();
          
          // Skip parent directory
          if (name === '.' || name === '..') {
            continue;
          }
          
          const fullPath = `${basePath === '/' ? '' : basePath}/${item.name}`;
          
          // Special handling for movie directories
          if (isMovieDir) {
            // Check for alphabetical folders containing first letter of search term
            if (searchTermLower[0] && name.startsWith(searchTermLower[0])) {
              folders.push(fullPath);
              continue;
            }
            
            // Check for year folders (4-digit numbers)
            const yearMatch = /(?:19|20)\d{2}/.exec(name);
            if (yearMatch) {
              folders.push(fullPath);
              continue;
            }
            
            // Add if folder contains any search word
            if (searchWords.some(word => name.includes(word))) {
              folders.push(fullPath);
              continue;
            }
            
            // Add common movie organization folders
            if (['action', 'drama', 'comedy', 'horror', 'thriller'].some(genre => name.includes(genre))) {
              folders.push(fullPath);
              continue;
            }
          } else {
            // For TV show directories
            if (searchWords.some(word => name.includes(word))) {
              folders.push(fullPath);
              
              // Also check for season subfolders
              try {
                const subfolders = await this.getFoldersRecursive(searchTerm, fullPath, depth + 1);
                folders.push(...subfolders);
              } catch (error) {
                // If error, just skip this subfolder
                console.error(`Error getting subfolders for ${fullPath}:`, error);
              }
            } else {
              // Check if it's a season folder (contains "season" or "s01", "s02", etc.)
              if (/season|s\d+/i.test(name)) {
                folders.push(fullPath);
              }
            }
          }
        }
      }
      
      return folders;
    } catch (error) {
      console.error(`Error in recursive folder search for ${basePath}:`, error);
      return [basePath];
    }
  }
  
  private parseSeasonEpisode(filename: string): { season: number | null, episode: number | null } {
    // Common patterns: S01E02, 1x02, Season 1 Episode 2, etc.
    const patterns = [
      /[Ss](\d+)[Ee](\d+)/,                           // S01E02
      /(\d+)[xX](\d+)/,                               // 1x02
      /[Ss]eason\s*(\d+)\s*[Ee]pisode\s*(\d+)/,       // Season 1 Episode 2
      /[Ee]p(?:isode)?\s*(\d+)/,                      // Episode only (assume season 1)
    ];
    
    for (const pattern of patterns) {
      const match = pattern.exec(filename);
      if (match) {
        const groups = match.slice(1);
        if (groups.length === 2) {
          return { season: parseInt(groups[0]), episode: parseInt(groups[1]) };
        } else if (groups.length === 1) {
          return { season: 1, episode: parseInt(groups[0]) };  // Assume season 1
        }
      }
    }
    
    // If folder contains season information
    const seasonMatch = /[Ss]eason\s*(\d+)/.exec(filename);
    if (seasonMatch) {
      const season = parseInt(seasonMatch[1]);
      // Look for episode number
      const epMatch = /[Ee]p(?:isode)?\s*(\d+)/.exec(filename);
      if (epMatch) {
        return { season, episode: parseInt(epMatch[1]) };
      }
    }
    
    return { season: null, episode: null };
  }
  
  async searchMediaFiles(folders: string[], searchTerm: string, extensions: string[]): Promise<MediaFile[]> {
    const results: MediaFile[] = [];
    
    // Ensure extensions have dots
    const formattedExtensions = extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
    
    // Prepare search terms for more accurate matching
    const searchTermLower = searchTerm.toLowerCase();
    const searchTermFilename = searchTermLower.replace(/\s+/g, '.');
    const searchTermFilename2 = searchTermLower.replace(/\s+/g, '_');
    const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 2);
    
    for (const folder of folders) {
      try {
        const listing = await this.list(folder);
        
        for (const item of listing) {
          if (item.type === '-') {  // Only files, not directories
            const name = item.name;
            
            // Check if the file has one of our extensions
            if (formattedExtensions.some(ext => name.toLowerCase().endsWith(ext.toLowerCase()))) {
              const decodedName = decodeURIComponent(name);
              const decodedNameLower = decodedName.toLowerCase();
              
              // Apply matching criteria
              let isMatch = false;
              
              // 1. Exact match of full search term
              if (decodedNameLower.includes(searchTermLower)) {
                // For single words, make sure it's not just part of another word
                if (searchWords.length === 1) {
                  // Check if the word is a standalone word or surrounded by non-alphanumeric chars
                  const regex = new RegExp(`(^|[^a-z0-9])${searchWords[0]}([^a-z0-9]|$)`, 'i');
                  if (regex.test(decodedNameLower)) {
                    isMatch = true;
                  }
                } else {
                  isMatch = true;
                }
              }
              
              // 2. Match with dots/underscores instead of spaces (common in filenames)
              if (!isMatch && (decodedNameLower.includes(searchTermFilename) || decodedNameLower.includes(searchTermFilename2))) {
                isMatch = true;
              }
              
              // 3. For multi-word searches (3+ words), require at least 75% of words to match
              // AND the first word must be present
              if (!isMatch && searchWords.length >= 3) {
                const matchingWords = searchWords.filter(word => decodedNameLower.includes(word));
                const matchPercentage = matchingWords.length / searchWords.length;
                
                // First word must match and at least 75% of all words
                if (decodedNameLower.includes(searchWords[0]) && matchPercentage >= 0.75) {
                  isMatch = true;
                }
              }
              
              // 4. For 2-word searches, both words must be present
              if (!isMatch && searchWords.length === 2) {
                if (searchWords.every(word => decodedNameLower.includes(word))) {
                  isMatch = true;
                }
              }
              
              // Special case for movies with year in search term
              const yearMatch = /(19\d{2}|20\d{2})/.exec(searchTermLower);
              if (!isMatch && yearMatch && decodedNameLower.includes(yearMatch[1])) {
                // If search has a year and filename has same year, check if any other word matches
                const otherWords = searchWords.filter(w => w !== yearMatch[1]);
                if (otherWords.some(word => decodedNameLower.includes(word))) {
                  isMatch = true;
                }
              }
              
              if (isMatch) {
                const { season, episode } = this.parseSeasonEpisode(decodedName);
                const fullUrl = `${this.config.host}:${this.config.port}${folder === '/' ? '' : folder}/${name}`;
                
                // Try to get file size information
                let size = '';
                if (item.size) {
                  size = this.formatFileSize(item.size);
                }
                
                results.push({
                  url: fullUrl,
                  name: decodedName,
                  season,
                  episode,
                  size,
                  selected: true
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error searching folder ${folder}:`, error);
        // Continue to next folder even if there's an error
      }
    }
    
    return results;
  }
  
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
  }
}
