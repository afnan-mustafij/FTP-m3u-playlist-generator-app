import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayCircle, ListPlus, SortAsc } from "lucide-react";
import { useMemo } from "react";

export default function ResultsPanel() {
  const { 
    currentSearchResults, 
    toggleFileSelection, 
    seasons, 
    selectedSeason,
    changeSelectedSeason,
    setGeneratePlaylistDialogOpen
  } = useAppContext();
  
  // Get files for the currently selected season
  const filteredResults = useMemo(() => {
    if (!selectedSeason) return currentSearchResults;
    
    return currentSearchResults.filter(file => file.season === selectedSeason);
  }, [currentSearchResults, selectedSeason]);
  
  if (currentSearchResults.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Search Results</h2>
        <div className="flex space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setGeneratePlaylistDialogOpen(true)}
            tabIndex={0}
          >
            <ListPlus className="h-4 w-4 mr-1" />
            Generate M3U
          </Button>
          <Button
            variant="outline"
            size="sm"
            tabIndex={0}
          >
            <SortAsc className="h-4 w-4 mr-1" />
            Sort
          </Button>
        </div>
      </div>
      
      {/* Season Navigation Tabs (only show if we have seasons) */}
      {seasons.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto whitespace-nowrap p-2 bg-gray-50">
            {seasons.map((season) => (
              <Button
                key={season}
                variant={selectedSeason === season ? "default" : "ghost"}
                onClick={() => changeSelectedSeason(season)}
                className={`px-4 py-2 ${
                  selectedSeason === season 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
                tabIndex={0}
              >
                Season {season}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Results List */}
      <div className="divide-y divide-gray-200">
        {filteredResults.length > 0 ? (
          filteredResults.map((file) => (
            <div 
              key={file.url}
              className="p-3 hover:bg-gray-50 flex items-center select-none"
              tabIndex={0}
            >
              <Checkbox
                checked={file.selected}
                onCheckedChange={() => toggleFileSelection(file.url)}
                className="h-5 w-5 text-primary mr-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {file.duration && `${file.duration} | `}
                  {file.quality && `${file.quality} | `}
                  {file.size && `${file.size}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-400 hover:text-primary ml-2"
                aria-label="Play"
              >
                <PlayCircle className="h-5 w-5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No files found for the selected season
          </div>
        )}
      </div>
      
      {/* Load More Button (only show if we have a significant number of results) */}
      {filteredResults.length > 10 && (
        <div className="p-3 text-center border-t border-gray-200">
          <Button
            variant="link"
            className="text-primary"
            tabIndex={0}
          >
            Load More Episodes
          </Button>
        </div>
      )}
    </div>
  );
}
