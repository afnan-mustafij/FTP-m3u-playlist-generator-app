import { 
  FtpServer, 
  InsertFtpServer, 
  Playlist, 
  InsertPlaylist, 
  User, 
  InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // FTP Server methods
  getFtpServers(): Promise<FtpServer[]>;
  getFtpServer(id: number): Promise<FtpServer | undefined>;
  createFtpServer(server: InsertFtpServer): Promise<FtpServer>;
  updateFtpServer(id: number, server: Partial<FtpServer>): Promise<FtpServer>;
  deleteFtpServer(id: number): Promise<void>;
  
  // Playlist methods
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<Playlist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ftpServers: Map<number, FtpServer>;
  private playlists: Map<number, Playlist>;
  
  private userId: number;
  private serverId: number;
  private playlistId: number;

  constructor() {
    this.users = new Map();
    this.ftpServers = new Map();
    this.playlists = new Map();
    
    this.userId = 1;
    this.serverId = 1;
    this.playlistId = 1;
    
    // Add some initial data for testing
    this.createFtpServer({
      name: "Demo Media Server",
      host: "ftp.example.com",
      port: 21,
      username: "anonymous",
      password: "",
      icon: "storage",
      savePassword: false
    });
    
    this.createPlaylist({
      name: "Sample TV Shows",
      description: "Some sample TV shows",
      groupTitle: "TV",
      content: "#EXTM3U\n#EXTINF:-1,Sample Show S01E01\nftp://example.com/path/to/file.mp4",
      createdAt: new Date().toISOString(),
      serverId: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // FTP Server methods
  async getFtpServers(): Promise<FtpServer[]> {
    return Array.from(this.ftpServers.values());
  }
  
  async getFtpServer(id: number): Promise<FtpServer | undefined> {
    return this.ftpServers.get(id);
  }
  
  async createFtpServer(insertServer: InsertFtpServer): Promise<FtpServer> {
    const id = this.serverId++;
    const server: FtpServer = { ...insertServer, id };
    this.ftpServers.set(id, server);
    return server;
  }
  
  async updateFtpServer(id: number, serverUpdate: Partial<FtpServer>): Promise<FtpServer> {
    const server = this.ftpServers.get(id);
    if (!server) {
      throw new Error("Server not found");
    }
    
    const updatedServer = { ...server, ...serverUpdate };
    this.ftpServers.set(id, updatedServer);
    return updatedServer;
  }
  
  async deleteFtpServer(id: number): Promise<void> {
    this.ftpServers.delete(id);
  }
  
  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }
  
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }
  
  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistId++;
    const playlist: Playlist = { ...insertPlaylist, id };
    this.playlists.set(id, playlist);
    return playlist;
  }
  
  async updatePlaylist(id: number, playlistUpdate: Partial<Playlist>): Promise<Playlist> {
    const playlist = this.playlists.get(id);
    if (!playlist) {
      throw new Error("Playlist not found");
    }
    
    const updatedPlaylist = { ...playlist, ...playlistUpdate };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }
  
  async deletePlaylist(id: number): Promise<void> {
    this.playlists.delete(id);
  }
}

export const storage = new MemStorage();
