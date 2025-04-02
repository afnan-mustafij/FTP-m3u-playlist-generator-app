import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  if (!addServerDialogOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Save FTP Server</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setAddServerDialogOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-6">
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
                          readOnly
                          className="bg-gray-50"
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
                            readOnly
                            className="bg-gray-50"
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
          </div>
        </div>
      </div>
    </div>
  );
}
