import React, { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  host: z.string().min(1, { message: "FTP host is required" }),
  port: z.coerce.number().int().positive().default(21),
  username: z.string().default("anonymous"),
  password: z.string().optional(),
  icon: z.string().default("storage"),
  savePassword: z.boolean().default(false)
});

export default function AddServerDialog() {
  const { 
    addServerDialogOpen, 
    setAddServerDialogOpen, 
    saveServer,
    ftpHost,
    ftpPort,
    ftpUsername,
    ftpPassword
  } = useAppContext();
  
  const [showCredentials, setShowCredentials] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      host: ftpHost,
      port: ftpPort,
      username: ftpUsername,
      password: ftpPassword,
      icon: "storage",
      savePassword: false
    }
  });
  
  // Update form when connection details change
  useEffect(() => {
    form.setValue("host", ftpHost);
    form.setValue("port", ftpPort);
    form.setValue("username", ftpUsername);
    form.setValue("password", ftpPassword);
  }, [ftpHost, ftpPort, ftpUsername, ftpPassword, addServerDialogOpen]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await saveServer(values);
  };
  
  return (
    <Dialog open={addServerDialogOpen} onOpenChange={setAddServerDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save FTP Server</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="absolute right-4 top-4">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Media Server" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FTP Host</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ftp.example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="tv">TV Shows</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Collapsible
              open={showCredentials}
              onOpenChange={setShowCredentials}
              className="w-full"
            >
              <div className="flex items-center my-2">
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
              
              <CollapsibleContent className="mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="anonymous" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Password (optional)" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              
                <FormField
                  control={form.control}
                  name="savePassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Save password
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <p className="text-sm text-slate-500 mt-1">
                  If your FTP server doesn't require authentication or is on your home network, 
                  you can leave these fields empty.
                </p>
              </CollapsibleContent>
            </Collapsible>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddServerDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Server
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
