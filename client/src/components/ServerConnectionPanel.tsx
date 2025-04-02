import React, { useState } from 'react';
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

const formSchema = z.object({
  ftpHost: z.string().min(1, { message: "FTP host is required" }),
  ftpUsername: z.string().default("anonymous"),
  ftpPassword: z.string().optional()
});

export default function ServerConnectionPanel() {
  const { 
    ftpHost, 
    setFtpHost, 
    ftpUsername, 
    setFtpUsername, 
    ftpPassword, 
    setFtpPassword, 
    connectToFtp,
    setAddServerDialogOpen,
    activeServer
  } = useAppContext();
  
  const [showCredentials, setShowCredentials] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ftpHost: ftpHost,
      ftpUsername: ftpUsername,
      ftpPassword: ftpPassword
    }
  });
  
  // Update form when activeServer changes
  React.useEffect(() => {
    if (activeServer) {
      // Handle null/undefined password
      const password = activeServer.password ? activeServer.password : "";
      
      form.reset({
        ftpHost: activeServer.host,
        ftpUsername: activeServer.username || "",
        ftpPassword: password
      });
      
      setFtpHost(activeServer.host);
      setFtpUsername(activeServer.username || "");
      setFtpPassword(password);
    }
  }, [activeServer, form, setFtpHost, setFtpUsername, setFtpPassword]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFtpHost(values.ftpHost);
    setFtpUsername(values.ftpUsername);
    setFtpPassword(values.ftpPassword || "");
    
    await connectToFtp();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">FTP Server Connection</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="ftpHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FTP Server</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ftp.example.com" 
                      {...field}
                      tabIndex={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Collapsible
              open={showCredentials}
              onOpenChange={setShowCredentials}
              className="w-full"
            >
              <div className="flex items-center">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 hover:bg-transparent flex items-center text-sm text-slate-500"
                  >
                    {showCredentials ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                    {showCredentials ? "Hide credentials" : "Show credentials (optional)"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ftpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="anonymous" 
                            {...field}
                            tabIndex={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ftpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Password (leave empty for anonymous)" 
                            {...field}
                            value={field.value || ""}
                            tabIndex={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  If your FTP server doesn't require authentication or is on your home network, 
                  you can leave these fields empty.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddServerDialogOpen(true)}
              tabIndex={0}
            >
              Save Server
            </Button>
            <Button type="submit" tabIndex={0}>
              Connect
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
