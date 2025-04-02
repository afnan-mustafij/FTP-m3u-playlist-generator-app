import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, { message: "Playlist name is required" }),
  description: z.string().optional(),
  groupTitle: z.string().default(""),
  organizeBySeasons: z.boolean().default(true),
  sortNumerically: z.boolean().default(true),
  saveToDevice: z.boolean().default(true)
});

export default function GeneratePlaylistDialog() {
  const { 
    generatePlaylistDialogOpen, 
    setGeneratePlaylistDialogOpen, 
    generatePlaylist,
    searchTerm
  } = useAppContext();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: searchTerm,
      description: "",
      groupTitle: "TV Shows",
      organizeBySeasons: true,
      sortNumerically: true,
      saveToDevice: true
    }
  });
  
  // Update name field when search term changes
  useEffect(() => {
    if (searchTerm && generatePlaylistDialogOpen) {
      form.setValue("name", searchTerm);
    }
  }, [searchTerm, generatePlaylistDialogOpen, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await generatePlaylist(values);
  };
  
  return (
    <Dialog open={generatePlaylistDialogOpen} onOpenChange={setGeneratePlaylistDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate M3U Playlist</DialogTitle>
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
                  <FormLabel>Playlist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Playlist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Custom description for the playlist" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="groupTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="TV, Movies, etc." 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organizeBySeasons"
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
                      Organize by seasons
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sortNumerically"
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
                      Sort episodes numerically
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="saveToDevice"
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
                      Save playlist to device
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setGeneratePlaylistDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
              >
                Generate Playlist
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
