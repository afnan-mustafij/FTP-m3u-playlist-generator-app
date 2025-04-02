import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const FILE_TYPES = [
  { value: "mp4", label: "MP4" },
  { value: "mkv", label: "MKV" },
  { value: "avi", label: "AVI" },
  { value: "mov", label: "MOV" },
  { value: "wmv", label: "WMV" }
];

const formSchema = z.object({
  searchTerm: z.string().min(1, { message: "Search term is required" }),
  fileTypes: z.array(z.string()).min(1, { message: "Select at least one file type" })
});

export default function SearchGeneratePanel() {
  const { searchTerm, setSearchTerm, fileTypes, setFileTypes, searchFiles } = useAppContext();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: searchTerm,
      fileTypes: fileTypes
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSearchTerm(values.searchTerm);
    setFileTypes(values.fileTypes);
    
    await searchFiles();
  };
  
  const toggleFileType = (type: string, checked: boolean) => {
    const currentTypes = form.getValues("fileTypes");
    
    if (checked) {
      if (!currentTypes.includes(type)) {
        form.setValue("fileTypes", [...currentTypes, type]);
      }
    } else {
      form.setValue(
        "fileTypes", 
        currentTypes.filter(t => t !== type)
      );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Search & Generate Playlist</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Term</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter show or movie name" 
                        {...field}
                        tabIndex={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="fileTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>File Types</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {FILE_TYPES.map((type) => (
                        <div 
                          key={type.value} 
                          className="flex items-center space-x-2 border rounded p-2"
                        >
                          <Checkbox
                            id={`filetype-${type.value}`}
                            checked={form.getValues("fileTypes").includes(type.value)}
                            onCheckedChange={(checked) => 
                              toggleFileType(type.value, checked as boolean)
                            }
                            tabIndex={0}
                          />
                          <label
                            htmlFor={`filetype-${type.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-700"
              tabIndex={0}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Files
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
