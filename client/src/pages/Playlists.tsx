import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaySquare, Trash2, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Playlists() {
  const { playlists } = useAppContext();
  const { toast } = useToast();
  
  const deletePlaylist = async (id: number) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      try {
        const response = await apiRequest("DELETE", `/api/playlists/${id}`, undefined);
        if (response.ok) {
          toast({
            title: "Playlist Deleted",
            description: "The playlist has been removed"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete playlist",
          variant: "destructive"
        });
      }
    }
  };
  
  const downloadPlaylist = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/playlists/${id}/download`);
      if (response.ok) {
        const content = await response.text();
        
        // Check if we're on mobile and can use native file system
        try {
          // Import dynamically to avoid loading on web
          const { NativeFilesystem } = await import('../lib/nativeFilesystem');
          
          await NativeFilesystem.saveFile(
            content,
            `${name}.m3u`,
            'Downloads'
          );
          
          toast({
            title: "Download Complete",
            description: `${name}.m3u has been saved to your device`
          });
        } catch (mobileError) {
          // Fallback to browser download
          const blob = new Blob([content], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${name}.m3u`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Download Started",
            description: `${name}.m3u is being downloaded`
          });
        }
      } else {
        throw new Error("Failed to download");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download playlist",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Playlists</h1>
      </div>
      
      {playlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <PlaySquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Saved Playlists</h3>
              <p className="text-gray-500 mb-4">
                Search for media and generate playlists to see them here
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Go to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id}>
              <CardHeader>
                <CardTitle>{playlist.name}</CardTitle>
                <CardDescription>
                  {playlist.description || `Playlist generated for ${playlist.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">Group:</span> {playlist.groupTitle || "None"}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Created:</span> {formatDate(playlist.createdAt)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deletePlaylist(playlist.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadPlaylist(playlist.id, playlist.name)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
