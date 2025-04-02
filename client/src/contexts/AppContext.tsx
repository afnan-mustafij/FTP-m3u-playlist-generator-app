import React, { createContext, useContext, useState, useEffect } from "react";
import { FtpServer, Playlist, MediaFile, SearchParams } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AppContextType {
  // UI State
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  addServerDialogOpen: boolean;
  setAddServerDialogOpen: (open: boolean) => void;
  generatePlaylistDialogOpen: boolean;
  setGeneratePlaylistDialogOpen: (open: boolean) => void;
  isProcessing: boolean;
  processingProgress: number;
  processingMessage: string;
  
  // Data State
  servers: FtpServer[];
  playlists: Playlist[];
  activeServer: FtpServer | null;
  setActiveServer: (server: FtpServer | null) => void;
  currentSearchResults: MediaFile[];
  selectedSeason: number | null;
  seasons: number[];
  
  // Connection State
  ftpHost: string;
  setFtpHost: (host: string) => void;
  ftpPort: number;
  setFtpPort: (port: number) => void;
  ftpUsername: string;
  setFtpUsername: (username: string) => void;
  ftpPassword: string;
  setFtpPassword: (password: string) => void;
  
  // Search State
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fileTypes: string[];
  setFileTypes: (types: string[]) => void;
  
  // Methods
  connectToFtp: () => Promise<void>;
  saveServer: (server: Partial<FtpServer>) => Promise<void>;
  deleteServer: (id: number) => Promise<void>;
  searchFiles: () => Promise<void>;
  generatePlaylist: (params: {
    name: string;
    description?: string;
    groupTitle: string;
    organizeBySeasons: boolean;
    sortNumerically: boolean;
    saveToDevice: boolean;
  }) => Promise<void>;
  changeSelectedSeason: (season: number) => void;
  toggleFileSelection: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  
  // UI State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [addServerDialogOpen, setAddServerDialogOpen] = useState(false);
  const [generatePlaylistDialogOpen, setGeneratePlaylistDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState("");
  
  // Data State
  const [servers, setServers] = useState<FtpServer[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeServer, setActiveServer] = useState<FtpServer | null>(null);
  const [currentSearchResults, setCurrentSearchResults] = useState<MediaFile[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<number[]>([]);
  
  // Connection State
  const [ftpHost, setFtpHost] = useState("");
  const [ftpPort, setFtpPort] = useState(21);
  const [ftpUsername, setFtpUsername] = useState("anonymous");
  const [ftpPassword, setFtpPassword] = useState("");
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [fileTypes, setFileTypes] = useState(["mp4", "mkv", "avi"]);
  
  // Load initial data
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("/api/servers");
        if (response.ok) {
          const data = await response.json();
          setServers(data);
        }
      } catch (error) {
        console.error("Failed to fetch servers:", error);
      }
    };
    
    const fetchPlaylists = async () => {
      try {
        const response = await fetch("/api/playlists");
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data);
        }
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };
    
    fetchServers();
    fetchPlaylists();
  }, []);
  
  // Methods
  const connectToFtp = async () => {
    if (!ftpHost) {
      toast({
        title: "Error",
        description: "FTP host is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await apiRequest("POST", "/api/connect", {
        host: ftpHost,
        port: ftpPort,
        username: ftpUsername,
        password: ftpPassword
      });
      
      if (response.ok) {
        toast({
          title: "Connected",
          description: `Successfully connected to ${ftpHost}`,
        });
        
        // If we're using server credentials from a saved server, set it as active
        const matchingServer = servers.find(s => 
          s.host === ftpHost && 
          s.port === ftpPort && 
          s.username === ftpUsername
        );
        
        if (matchingServer) {
          setActiveServer(matchingServer);
        } else {
          setActiveServer(null);
        }
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to FTP server",
        variant: "destructive"
      });
    }
  };
  
  const saveServer = async (server: Partial<FtpServer>) => {
    if (!server.name || !server.host) {
      toast({
        title: "Error",
        description: "Server name and host are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const fullServer = {
        name: server.name,
        host: server.host,
        port: server.port || ftpPort,
        username: server.username || ftpUsername,
        password: server.savePassword ? (server.password || ftpPassword) : "",
        icon: server.icon || "storage",
        savePassword: server.savePassword || false
      };
      
      const response = await apiRequest("POST", "/api/servers", fullServer);
      
      if (response.ok) {
        const newServer = await response.json();
        setServers([...servers, newServer]);
        setAddServerDialogOpen(false);
        
        toast({
          title: "Server Saved",
          description: `${newServer.name} has been saved`
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Save Server",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  const deleteServer = async (id: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/servers/${id}`, undefined);
      
      if (response.ok) {
        setServers(servers.filter(server => server.id !== id));
        
        // If the active server was deleted, clear it
        if (activeServer && activeServer.id === id) {
          setActiveServer(null);
        }
        
        toast({
          title: "Server Deleted",
          description: "The FTP server has been removed"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Delete Server",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  const searchFiles = async () => {
    if (!ftpHost || !searchTerm) {
      toast({
        title: "Error",
        description: "FTP host and search term are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setProcessingMessage(`Scanning FTP directories for "${searchTerm}"...`);
      setProcessingProgress(0);
      
      const searchParams: SearchParams = {
        host: ftpHost,
        port: ftpPort,
        username: ftpUsername,
        password: ftpPassword,
        searchTerm,
        fileTypes
      };
      
      const response = await apiRequest("POST", "/api/search", searchParams);
      
      if (response.ok) {
        const results = await response.json();
        setCurrentSearchResults(results);
        
        // Extract seasons from results
        const uniqueSeasons = Array.from(
          new Set(
            results
              .map((file: MediaFile) => file.season)
              .filter((season: number | null) => season !== null)
          )
        ).sort((a, b) => (a as number) - (b as number));
        
        setSeasons(uniqueSeasons as number[]);
        
        // Set the selected season to the first one if available
        if (uniqueSeasons.length > 0) {
          setSelectedSeason(uniqueSeasons[0] as number);
        } else {
          setSelectedSeason(null);
        }
        
        toast({
          title: "Search Complete",
          description: `Found ${results.length} files for "${searchTerm}"`
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An error occurred during search",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const generatePlaylist = async (params: {
    name: string;
    description?: string;
    groupTitle: string;
    organizeBySeasons: boolean;
    sortNumerically: boolean;
    saveToDevice: boolean;
  }) => {
    if (currentSearchResults.length === 0) {
      toast({
        title: "Error",
        description: "No files available to create playlist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const selectedFiles = currentSearchResults.filter(file => file.selected);
      
      if (selectedFiles.length === 0) {
        toast({
          title: "Error",
          description: "No files selected for the playlist",
          variant: "destructive"
        });
        return;
      }
      
      const playlistData = {
        ...params,
        files: selectedFiles,
      };
      
      const response = await apiRequest("POST", "/api/playlists", playlistData);
      
      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists([...playlists, newPlaylist]);
        setGeneratePlaylistDialogOpen(false);
        
        toast({
          title: "Playlist Created",
          description: `"${newPlaylist.name}" has been generated and saved`
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Generate Playlist",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  const changeSelectedSeason = (season: number) => {
    setSelectedSeason(season);
  };
  
  const toggleFileSelection = (url: string) => {
    setCurrentSearchResults(
      currentSearchResults.map(file => 
        file.url === url ? { ...file, selected: !file.selected } : file
      )
    );
  };
  
  return (
    <AppContext.Provider
      value={{
        // UI State
        mobileDrawerOpen,
        setMobileDrawerOpen,
        addServerDialogOpen,
        setAddServerDialogOpen,
        generatePlaylistDialogOpen,
        setGeneratePlaylistDialogOpen,
        isProcessing,
        processingProgress,
        processingMessage,
        
        // Data State
        servers,
        playlists,
        activeServer,
        setActiveServer,
        currentSearchResults,
        selectedSeason,
        seasons,
        
        // Connection State
        ftpHost,
        setFtpHost,
        ftpPort,
        setFtpPort,
        ftpUsername,
        setFtpUsername,
        ftpPassword,
        setFtpPassword,
        
        // Search State
        searchTerm,
        setSearchTerm,
        fileTypes,
        setFileTypes,
        
        // Methods
        connectToFtp,
        saveServer,
        deleteServer,
        searchFiles,
        generatePlaylist,
        changeSelectedSeason,
        toggleFileSelection
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
