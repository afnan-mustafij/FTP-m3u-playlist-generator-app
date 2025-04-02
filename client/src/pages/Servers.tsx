import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Server, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { FtpServer } from "@shared/schema";

export default function Servers() {
  const { servers, setAddServerDialogOpen, deleteServer, setActiveServer } = useAppContext();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const handleDeleteServer = async (id: number) => {
    if (confirm("Are you sure you want to delete this server?")) {
      await deleteServer(id);
    }
  };
  
  const handleConnectToServer = (server: FtpServer) => {
    setActiveServer(server);
    toast({
      title: "Server Selected",
      description: `Connected to ${server.name}`
    });
    navigate("/");
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FTP Servers</h1>
        <Button onClick={() => setAddServerDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </div>
      
      {servers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Saved Servers</h3>
              <p className="text-gray-500 mb-4">
                Add an FTP server to get started browsing media files
              </p>
              <Button onClick={() => setAddServerDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Server
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader>
                <CardTitle>{server.name}</CardTitle>
                <CardDescription>{server.host}:{server.port}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">Username:</span> {server.username}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Password:</span>{" "}
                  {server.savePassword ? "••••••••" : "Not saved"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteServer(server.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConnectToServer(server)}
                >
                  <Server className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
