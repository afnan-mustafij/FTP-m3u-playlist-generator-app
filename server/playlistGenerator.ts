import { MediaFile } from "@shared/schema";

interface PlaylistOptions {
  name: string;
  groupTitle?: string;
  organizeBySeasons?: boolean;
  sortNumerically?: boolean;
}

export function generateM3UPlaylist(
  files: MediaFile[],
  options: PlaylistOptions
): string {
  const { 
    name, 
    groupTitle = "",
    organizeBySeasons = true,
    sortNumerically = true
  } = options;
  
  // Start with the M3U header
  let content = "#EXTM3U\n";
  
  // Clone the files array so we can sort it without modifying the original
  let filesToProcess = [...files];
  
  // Sort the files if requested
  if (sortNumerically) {
    filesToProcess.sort((a, b) => {
      // First sort by season
      if (a.season !== b.season) {
        // Handle null seasons (put them at the end)
        if (a.season === null) return 1;
        if (b.season === null) return -1;
        return a.season - b.season;
      }
      
      // Then sort by episode
      if (a.episode !== b.episode) {
        // Handle null episodes (put them at the end)
        if (a.episode === null) return 1;
        if (b.episode === null) return -1;
        return a.episode - b.episode;
      }
      
      // Finally sort by name
      return a.name.localeCompare(b.name);
    });
  }
  
  // Group files by season if requested
  if (organizeBySeasons) {
    // Create a map of season -> files
    const seasonMap = new Map<number | null, MediaFile[]>();
    
    for (const file of filesToProcess) {
      const season = file.season;
      if (!seasonMap.has(season)) {
        seasonMap.set(season, []);
      }
      seasonMap.get(season)!.push(file);
    }
    
    // Get seasons in order (null season goes last)
    const seasons = Array.from(seasonMap.keys()).sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    });
    
    // Add each file to the playlist with appropriate group-title
    for (const season of seasons) {
      const filesInSeason = seasonMap.get(season)!;
      
      for (const file of filesInSeason) {
        // Create the group title attribute
        let groupAttribute = "";
        
        if (groupTitle) {
          let fullGroupTitle = groupTitle;
          
          // Add season info to group title if available
          if (season !== null) {
            fullGroupTitle += ` S${season.toString().padStart(2, "0")}`;
          }
          
          groupAttribute = ` group-title="${fullGroupTitle}"`;
        }
        
        // Add the entry to the playlist
        content += `#EXTINF:-1${groupAttribute},${formatTitle(file)}\n`;
        content += `${file.url}\n`;
      }
    }
  } else {
    // No season organization, just add all files with the base group title
    for (const file of filesToProcess) {
      const groupAttribute = groupTitle ? ` group-title="${groupTitle}"` : "";
      
      content += `#EXTINF:-1${groupAttribute},${formatTitle(file)}\n`;
      content += `${file.url}\n`;
    }
  }
  
  return content;
}

function formatTitle(file: MediaFile): string {
  let title = file.name;
  
  // Clean up title - remove extension
  const lastDotIndex = title.lastIndexOf(".");
  if (lastDotIndex > 0) {
    title = title.substring(0, lastDotIndex);
  }
  
  // Remove common prefixes/suffixes often found in filenames
  title = title
    .replace(/\b(?:720p|1080p|2160p|BluRay|WEB-DL|HDTV|x264|x265|AAC|HEVC)\b/gi, "")
    .replace(/\[.*?\]|\(.*?\)/g, "")  // Remove stuff in brackets/parentheses
    .replace(/\._/g, " ")             // Replace ._ with space
    .replace(/\./g, " ")              // Replace dots with spaces
    .replace(/_/g, " ")               // Replace underscores with spaces
    .replace(/\s+/g, " ")             // Collapse multiple spaces
    .trim();                          // Trim leading/trailing spaces
  
  // If we know the season and episode, we could further clean or format the title
  if (file.season !== null && file.episode !== null) {
    // Format as TV show
    const seasonEpStr = `S${file.season.toString().padStart(2, "0")}E${file.episode.toString().padStart(2, "0")}`;
    
    // Check if the title already includes the season/episode info
    if (!title.includes(seasonEpStr)) {
      title = `${title} - ${seasonEpStr}`;
    }
  }
  
  return title;
}
