import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// FTP Servers
export const ftpServers = pgTable("ftp_servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull().default(21),
  username: text("username").default("anonymous"),
  password: text("password").default(""),
  icon: text("icon").default("storage"),
  savePassword: boolean("save_password").default(false)
});

export const insertFtpServerSchema = createInsertSchema(ftpServers).pick({
  name: true,
  host: true,
  port: true,
  username: true,
  password: true,
  icon: true,
  savePassword: true
});

export type InsertFtpServer = z.infer<typeof insertFtpServerSchema>;
export type FtpServer = typeof ftpServers.$inferSelect;

// M3U Playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  groupTitle: text("group_title").default(""),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  serverId: integer("server_id").references(() => ftpServers.id)
});

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  name: true,
  description: true,
  groupTitle: true,
  content: true,
  createdAt: true,
  serverId: true
});

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

// Media File Type (not stored in DB, used for API responses)
export const mediaFileSchema = z.object({
  url: z.string(),
  name: z.string(),
  season: z.number().nullable(),
  episode: z.number().nullable(),
  size: z.string().optional(),
  duration: z.string().optional(),
  quality: z.string().optional(),
  selected: z.boolean().default(true)
});

export type MediaFile = z.infer<typeof mediaFileSchema>;

// Search Parameters Schema
export const searchParamsSchema = z.object({
  host: z.string(),
  port: z.number().default(21),
  username: z.string().default("anonymous"),
  password: z.string().default(""),
  searchTerm: z.string(),
  fileTypes: z.array(z.string()).default(["mp4", "mkv", "avi"])
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Playlist Generation Schema
export const playlistGenerationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupTitle: z.string().default(""),
  organizeBySeasons: z.boolean().default(true),
  sortNumerically: z.boolean().default(true),
  saveToDevice: z.boolean().default(true),
  files: z.array(mediaFileSchema)
});

export type PlaylistGenerationParams = z.infer<typeof playlistGenerationSchema>;
