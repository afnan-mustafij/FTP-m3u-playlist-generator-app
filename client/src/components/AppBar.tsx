import { useAppContext } from "@/contexts/AppContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, Menu } from "lucide-react";

export default function AppBar() {
  const { setMobileDrawerOpen } = useAppContext();
  const [location, setLocation] = useLocation();
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white hover:bg-primary-light focus:bg-primary-light"
            onClick={() => setMobileDrawerOpen(true)}
            tabIndex={0}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
          <h1 className="text-xl font-medium">FTP M3U Generator</h1>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary-light focus:bg-primary-light"
            onClick={() => setLocation("/settings")}
            tabIndex={0}
          >
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
