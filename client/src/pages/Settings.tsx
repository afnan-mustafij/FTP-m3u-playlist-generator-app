import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [defaultFileTypes, setDefaultFileTypes] = useState(["mp4", "mkv", "avi"]);
  const [enabledTVMode, setEnabledTVMode] = useState(window.innerWidth >= 1200);
  const [darkMode, setDarkMode] = useState(false);
  
  const saveSettings = async () => {
    try {
      await apiRequest("POST", "/api/settings", {
        defaultFileTypes,
        enabledTVMode,
        darkMode
      });
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };
  
  const clearCache = async () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      try {
        await apiRequest("POST", "/api/settings/clear-cache", {});
        
        toast({
          title: "Cache Cleared",
          description: "All temporary data has been removed"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear cache",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
            <CardDescription>Customize how the application behaves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tv-mode">TV Mode</Label>
                <Switch
                  id="tv-mode"
                  checked={enabledTVMode}
                  onCheckedChange={setEnabledTVMode}
                />
              </div>
              <p className="text-sm text-gray-500">
                Enable special navigation support for TV remote controls
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <p className="text-sm text-gray-500">
                Use dark theme throughout the application
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-file-types">Default File Types</Label>
              <Input
                id="default-file-types"
                value={defaultFileTypes.join(", ")}
                onChange={(e) => {
                  const types = e.target.value
                    .split(",")
                    .map(type => type.trim())
                    .filter(Boolean);
                  setDefaultFileTypes(types);
                }}
              />
              <p className="text-sm text-gray-500">
                Comma-separated list of file extensions to search for by default
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={saveSettings}>Save Preferences</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage application data and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Clear temporary data and cached FTP directories to free up space.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="destructive" onClick={clearCache}>
              Clear Cache
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              <strong>FTP M3U Generator</strong> - Version 1.0.0
            </p>
            <p className="text-sm">
              A web application for browsing FTP servers and generating M3U playlists.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
