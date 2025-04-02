import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { FtpClient } from "./ftpUtils";
import { generateM3UPlaylist } from "./playlistGenerator";
import { 
  searchParamsSchema, 
  mediaFileSchema, 
  playlistGenerationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // FTP Server routes
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getFtpServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.post("/api/servers", async (req, res) => {
    try {
      const server = await storage.createFtpServer(req.body);
      res.json(server);
    } catch (error) {
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFtpServer(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // FTP Connection and Search
  app.post("/api/connect", async (req, res) => {
    try {
      const { host, port, username, password } = req.body;
      
      const ftpClient = new FtpClient({
        host,
        port: port || 21,
        user: username || "anonymous",
        password: password || ""
      });
      
      await ftpClient.connect();
      await ftpClient.disconnect();
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to connect to FTP server" 
      });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const searchParams = searchParamsSchema.parse(req.body);
      
      const ftpClient = new FtpClient({
        host: searchParams.host,
        port: searchParams.port || 21,
        user: searchParams.username || "anonymous",
        password: searchParams.password || ""
      });
      
      await ftpClient.connect();
      
      // Get folders that might contain our search term
      const folders = await ftpClient.getFoldersRecursive(searchParams.searchTerm);
      
      // Search for media files in those folders
      const mediaFiles = await ftpClient.searchMediaFiles(
        folders, 
        searchParams.searchTerm,
        searchParams.fileTypes
      );
      
      await ftpClient.disconnect();
      
      res.json(mediaFiles);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to search FTP server" 
      });
    }
  });

  // Playlist routes
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const playlistParams = playlistGenerationSchema.parse(req.body);
      
      // Generate the M3U content
      const m3uContent = generateM3UPlaylist(
        playlistParams.files,
        {
          name: playlistParams.name,
          groupTitle: playlistParams.groupTitle,
          organizeBySeasons: playlistParams.organizeBySeasons,
          sortNumerically: playlistParams.sortNumerically
        }
      );
      
      // Save the playlist
      const playlist = await storage.createPlaylist({
        name: playlistParams.name,
        description: playlistParams.description || "",
        groupTitle: playlistParams.groupTitle,
        content: m3uContent,
        createdAt: new Date().toISOString(),
        serverId: null // Optional
      });
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate playlist"
      });
    }
  });

  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playlist = await storage.getPlaylist(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  app.get("/api/playlists/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playlist = await storage.getPlaylist(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      // Set headers for file download
      res.setHeader("Content-Type", "application/x-mpegurl");
      res.setHeader("Content-Disposition", `attachment; filename="${playlist.name}.m3u"`);
      
      // Send the M3U content
      res.send(playlist.content);
    } catch (error) {
      res.status(500).json({ message: "Failed to download playlist" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePlaylist(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  // Settings
  app.post("/api/settings", (req, res) => {
    // In this implementation, settings are not persisted
    res.json({ success: true });
  });

  app.post("/api/settings/clear-cache", (req, res) => {
    // Clear any cached data if needed
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
