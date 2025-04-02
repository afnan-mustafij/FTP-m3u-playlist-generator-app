import { useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { X, Plus, Server, PlaySquare } from "lucide-react";
import { useLocation } from "wouter";

export default function MobileDrawer() {
  const { 
    servers, 
    playlists, 
    setMobileDrawerOpen, 
    setAddServerDialogOpen,
    activeServer,
    setActiveServer
  } = useAppContext();
  const [location, navigate] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        closeMobileDrawer();
      }
    };
    
    document.addEventListener("click", handleOutsideClick);
    
    // Animate in
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.classList.remove("-translate-x-full");
      }
    }, 10);
    
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  
  const closeMobileDrawer = () => {
    if (contentRef.current) {
      contentRef.current.classList.add("-translate-x-full");
      
      // Wait for animation before closing
      setTimeout(() => {
        setMobileDrawerOpen(false);
      }, 300);
    } else {
      setMobileDrawerOpen(false);
    }
  };
  
  const handleServerClick = (server) => {
    setActiveServer(server);
    closeMobileDrawer();
    navigate("/");
  };
  
  const handlePlaylistClick = (playlist) => {
    closeMobileDrawer();
    navigate("/playlists");
  };
  
  const handleAddServerClick = () => {
    closeMobileDrawer();
    setTimeout(() => {
      setAddServerDialogOpen(true);
    }, 300);
  };
  
  return (
    <div className="fixed inset-0 z-20" aria-modal="true" role="dialog">
      <div 
        ref={overlayRef} 
        className="absolute inset-0 bg-black bg-opacity-50"
      ></div>
      
      <div 
        ref={contentRef}
        className="absolute left-0 top-0 h-full w-64 bg-white transform -translate-x-full transition-transform duration-300"
      >
        <div className="pt-6 pb-4 px-4 flex justify-between border-b border-gray-200">
          <h2 className="text-lg font-medium">FTP M3U Generator</h2>
          <Button variant="ghost" size="sm" onClick={closeMobileDrawer}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="py-4">
          <div className="px-4 mb-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Servers</h2>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between text-primary py-2 px-3 rounded-md"
              onClick={handleAddServerClick}
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
      </div>
    </div>
  );
}
