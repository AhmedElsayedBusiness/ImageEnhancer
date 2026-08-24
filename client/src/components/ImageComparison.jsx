import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeforeAfterSlider from './BeforeAfterSlider';

const generateCSSFilters = (params) => {
  const { contrast = 0, brightness = 0, saturation = 0, hue = 0 } = params;
  return `
    contrast(${100 + contrast}%)
    brightness(${100 + brightness}%)
    saturate(${100 + saturation}%)
    hue-rotate(${hue}deg)
  `;
};

const ImageComparison = ({
  originalImage,
  enhancedImage,
  isProcessing,
  imageInfo,
  onDownload,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLoadError, setImageLoadError] = useState(null);
  const [localParameters, setLocalParameters] = useState({
    contrast: 0,
    brightness: 0,
    saturation: 0,
    hue: 0,
  });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !imageInfo?.dimensions) return;

    const [width, height] = imageInfo.dimensions.split('×').map((dim) => parseInt(dim));
    if (!width || !height) return;

    const maxWidth = Math.min(containerRef.current.clientWidth, 1200);
    const maxHeight = 600;
    const aspectRatio = width / height;

    let finalWidth = maxWidth;
    let finalHeight = maxWidth / aspectRatio;

    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }

    setImageSize({ width: Math.round(finalWidth), height: Math.round(finalHeight) });
  }, [imageInfo]);

  const handleLocalParameterChange = (name, value) => {
    setLocalParameters((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleDownloadWithFilters = () => {
    onDownload(localParameters); // Pass the current parameters to the download handler
  };

  if (!originalImage && !enhancedImage) {
    return (
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-display font-semibold mb-6">Image Preview</h2>
        <div className="bg-background-card rounded-xl p-6 border border-gray-800">
          <div className="py-16 text-center">
            <span className="material-icons text-5xl text-text-muted mb-4">image</span>
            <p className="text-text-secondary">Upload an image and apply enhancement to see the comparison</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-2xl font-display font-semibold mb-6">
        {enhancedImage ? 'Before & After Comparison' : 'Image Preview'}
      </h2>
      <div className="bg-background-card rounded-xl p-6 border border-gray-800">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-secondary">Processing your image...</p>
            </motion.div>
          ) : imageLoadError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center justify-center text-red-500"
            >
              <span className="material-icons text-5xl mb-4">error</span>
              <p className="text-text-secondary">{imageLoadError}</p>
            </motion.div>
          ) : (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="comparison-container"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">
                    {enhancedImage ? 'Image Comparison' : 'Image Preview'}
                  </h3>
                  <div className="text-sm text-text-secondary">{imageInfo?.dimensions}</div>
                </div>
                <button
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDownloadWithFilters}
                  disabled={!enhancedImage}
                >
                  <span className="material-icons text-sm">file_download</span>
                  <span>Download Enhanced</span>
                </button>
              </div>
              <div ref={containerRef}>
                <BeforeAfterSlider
                  originalImage={originalImage}
                  enhancedImage={enhancedImage}
                  imageSize={imageSize}
                  cssFilters={generateCSSFilters(localParameters)}
                  applyFiltersToOriginal={!enhancedImage}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-4">
                    Real-time Adjustments
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(localParameters).map(([name, value]) => (
                      <div key={name} className="group">
                        <div className="flex justify-between mb-1">
                          <label className="text-sm capitalize">{name.replace('_', ' ')}</label>
                          <span className="text-sm text-primary font-medium">{value > 0 ? `+${value}` : value}</span>
                        </div>
                        <input
                          type="range"
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                          min={name === 'hue' ? -180 : -100}
                          max={name === 'hue' ? 180 : 100}
                          value={value}
                          onChange={(e) => handleLocalParameterChange(name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-4">Image Information</h4>
                  {imageInfo && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 space-y-3">
                      {[
                        ['Original Size', imageInfo.originalSize],
                        ['Format', imageInfo.format],
                        ['Dimensions', imageInfo.dimensions],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">{label}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ImageComparison;