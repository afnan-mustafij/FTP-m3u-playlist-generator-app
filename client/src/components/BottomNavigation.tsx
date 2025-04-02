import { Home, Server, PlaySquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  
  return (
    <nav className="bg-white border-t border-gray-200 shadow-md">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center py-2 w-full ${
            location === "/" ? "text-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center py-2 w-full ${
            location === "/servers" ? "text-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/servers")}
        >
          <Server className="h-5 w-5" />
          <span className="text-xs mt-1">Servers</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center py-2 w-full ${
            location === "/playlists" ? "text-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/playlists")}
        >
          <PlaySquare className="h-5 w-5" />
          <span className="text-xs mt-1">Playlists</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center py-2 w-full ${
            location === "/settings" ? "text-primary" : "text-gray-500"
          }`}
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Button>
      </div>
    </nav>
  );
}
