import { Button } from "@/components/ui/button";
import { Plus, Server, PlaySquare } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useLocation } from "wouter";

export default function SideNavigation() {
  const { servers, playlists, setAddServerDialogOpen, activeServer, setActiveServer } = useAppContext();
  const [location, navigate] = useLocation();
  
  const handleServerClick = (server) => {
    setActiveServer(server);
    navigate("/");
  };
  
  const handlePlaylistClick = (playlist) => {
    // Navigate to the playlist details or load it
    navigate("/playlists");
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-[calc(100vh-64px)]">
      <nav className="py-4">
        <div className="px-4 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Servers</h2>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between text-primary py-2 px-3 rounded-md"
            onClick={() => setAddServerDialogOpen(true)}
            tabIndex={0}
          >
            <span className="font-medium">Add FTP Server</span>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="px-4 mb-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Saved Servers</h2>
        </div>
        
        <ul className="space-y-1">
          {servers.map((server) => (
            <li key={server.id}>
              <Button
                variant={activeServer?.id === server.id ? "secondary" : "ghost"}
                className={`w-full flex items-center justify-start py-2 px-4 ${
                  activeServer?.id === server.id 
                    ? "text-primary font-medium bg-blue-50 border-l-4 border-primary" 
                    : "text-gray-700"
                }`}
                onClick={() => handleServerClick(server)}
                tabIndex={0}
              >
                <Server className="mr-3 h-5 w-5" />
                <span>{server.name}</span>
              </Button>
            </li>
          ))}
          
          {servers.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-500">
              No saved servers
            </li>
          )}
        </ul>
        
        <div className="px-4 mt-8 mb-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Saved Playlists</h2>
        </div>
        
        <ul className="space-y-1">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start py-2 px-4 text-gray-700"
                onClick={() => handlePlaylistClick(playlist)}
                tabIndex={0}
              >
                <PlaySquare className="mr-3 h-5 w-5" />
                <span>{playlist.name}</span>
              </Button>
            </li>
          ))}
          
          {playlists.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-500">
              No saved playlists
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
