import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../hooks/use-toast";

const ImageUpload = ({ onImageUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    console.log('Selected file:', file.name, file.size, file.type);
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    onImageUpload(file);
  };

  return (
    <motion.section 
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      <div
        className={`relative rounded-xl p-8 flex flex-col items-center justify-center h-64 transition-all cursor-pointer
          ${isDragging 
            ? "border-2 border-dashed border-primary bg-primary/5" 
            : "border-2 border-dashed border-gray-700 hover:border-gray-600 bg-background-card"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 mb-4">
                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-lg font-medium text-text-primary mb-2">Processing your image...</p>
              <p className="text-sm text-text-secondary">This may take a few moments</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-3xl text-primary">cloud_upload</span>
              </div>
              <p className="text-lg font-medium text-text-primary mb-2">
                {isDragging ? "Drop your image here" : "Drag and drop your image here"}
              </p>
              <p className="text-sm text-text-secondary mb-4">or</p>
              <button className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors">
                Browse Files
              </button>
              <p className="text-xs text-text-secondary mt-4">
                Supports JPG, PNG, WEBP (Max: 10MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ImageUpload;