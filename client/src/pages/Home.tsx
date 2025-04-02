import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import ServerConnectionPanel from "@/components/ServerConnectionPanel";
import SearchGeneratePanel from "@/components/SearchGeneratePanel";
import ResultsPanel from "@/components/ResultsPanel";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import { useTVNavigation } from "@/hooks/useTVNavigation";

export default function Home() {
  const { isProcessing } = useAppContext();
  
  // Setup TV navigation
  useTVNavigation({
    enabled: true,
    selector: '[tabindex]:not([tabindex="-1"])',
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <ServerConnectionPanel />
      <SearchGeneratePanel />
      {isProcessing ? <ProcessingIndicator /> : <ResultsPanel />}
    </div>
  );
}
