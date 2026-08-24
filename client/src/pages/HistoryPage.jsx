import { useQuery } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";
import { motion } from "framer-motion";

const HistoryPage = () => {
  const { toast } = useToast();
  
  // Query to get enhancement history
  const historyQuery = useQuery({
    queryKey: ['/api/history'],
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const handleDownload = (item) => {
    window.open(`/api/images/${item.id}/enhanced`, "_blank");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-dark text-text-primary">
      <Sidebar recentEnhancements={historyQuery.data?.slice(0, 2) || []} />
      
      <MainContent 
        title="Enhancement History" 
        description="View and manage your enhanced images"
      >
        {historyQuery.isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loader"></div>
          </div>
        ) : historyQuery.error ? (
          <div className="bg-background-card rounded-xl p-6 text-center text-red-500">
            <p>Error loading history: {historyQuery.error.message}</p>
          </div>
        ) : historyQuery.data?.length === 0 ? (
          <div className="bg-background-card rounded-xl p-8 text-center">
            <span className="material-icons text-5xl text-text-muted mb-4">history</span>
            <h3 className="text-xl font-medium mb-2">No enhancement history yet</h3>
            <p className="text-text-secondary mb-4">Enhance some images to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyQuery.data?.map((item, index) => (
              <motion.div 
                key={item.id}
                className="history-card bg-background-card rounded-xl overflow-hidden border border-gray-800 relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-primary opacity-0 transition-opacity group-hover:opacity-10"></div>
                <div className="h-48 bg-gray-800 overflow-hidden">
                  <img 
                    src={`/api/images/${item.id}/thumbnail`}
                    alt={item.filename} 
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">{item.filename}</h3>
                    <span className="text-xs text-text-muted">{item.timeAgo}</span>
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-text-secondary mb-3 gap-2">
                    {item.techniques.map((technique, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full bg-background-elevated">
                        {technique}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-text-muted mb-3">
                    <div className="flex justify-between mb-1">
                      <span>Original Size:</span>
                      <span>{item.originalSize}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Enhanced Size:</span>
                      <span>{item.enhancedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{item.dimensions}</span>
                    </div>
                  </div>
                  <button 
                    className="w-full py-2 bg-secondary hover:bg-secondary-dark rounded text-sm transition-colors flex justify-center items-center"
                    onClick={() => handleDownload(item)}
                  >
                    <span className="material-icons text-sm mr-1">file_download</span> Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </MainContent>
    </div>
  );
};

export default HistoryPage;
