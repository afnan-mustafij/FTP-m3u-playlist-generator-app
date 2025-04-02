import { useAppContext } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";

export default function ProcessingIndicator() {
  const { isProcessing, processingProgress, processingMessage } = useAppContext();
  
  if (!isProcessing) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Files</h3>
        <p className="text-gray-600 mb-4">{processingMessage}</p>
        <Progress value={processingProgress} className="w-full mb-1" />
        <p className="text-sm text-gray-500">{processingProgress}% complete</p>
      </div>
    </div>
  );
}
