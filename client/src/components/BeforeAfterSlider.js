import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BeforeAfterSlider = ({ originalImage, enhancedImage, imageSize, cssFilters, applyFiltersToOriginal }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFreeMove, setIsFreeMove] = useState(false);
  const containerRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  // Animation variants for enhanced image fade-in
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Animation variants for slider handle pulse
  const handleVariants = {
    rest: { scale: 1, boxShadow: '0 0 10px rgba(147, 197, 253, 0.5)' },
    hover: { scale: 1.1, boxShadow: '0 0 20px rgba(147, 197, 253, 0.8)' },
    drag: { scale: 1.2, boxShadow: '0 0 30px rgba(147, 197, 253, 1)', transition: { duration: 0.3 } },
  };

  // Handle double-click to toggle free move mode
  const handleDoubleClick = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) { // Double-click within 300ms
      setIsFreeMove((prev) => !prev);
    }
    lastClickTimeRef.current = now;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const handleMove = (clientY) => {
      const rect = containerRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const percentage = 100 - (y / rect.height) * 100;
      setSliderPosition(Math.max(0, Math.min(percentage, 100)));
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      if (isFreeMove && !isDragging) {
        handleMove(e.clientY);
      } else if (isDragging) {
        handleMove(e.clientY);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isFreeMove && !isDragging) {
        handleMove(e.touches[0].clientY);
      } else if (isDragging) {
        handleMove(e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    // Prevent default behavior for touch events to avoid scrolling
    const preventDefault = (e) => {
      if (isDragging || isFreeMove) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchstart', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchstart', preventDefault);
    };
  }, [isDragging, isFreeMove]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl select-none"
      style={{ minHeight: '400px', height: imageSize.height || '400px', maxWidth: imageSize.width || '100%', margin: '0 auto' }}
    >
      {/* Original Image (Bottom Layer) */}
      <img
        src={originalImage}
        alt="Original"
        className="absolute top-0 left-0 w-full h-full object-contain"
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          filter: applyFiltersToOriginal ? cssFilters : 'none',
        }}
      />
      {/* Enhanced Image (Top Layer with Fade-In) */}
      {enhancedImage && (
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-0 left-0 w-full h-full"
          style={{
            clipPath: `polygon(0 ${100 - sliderPosition}%, 100% ${100 - sliderPosition}%, 100% 100%, 0 100%)`,
            transition: isDragging || isFreeMove ? 'none' : 'clip-path 0.4s ease-in-out',
          }}
        >
          <img
            src={enhancedImage}
            alt="Enhanced"
            className="absolute top-0 left-0 w-full h-full object-contain"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: applyFiltersToOriginal ? 'none' : cssFilters,
            }}
          />
        </motion.div>
      )}
      {/* Glowing Orb Slider Handle */}
      {enhancedImage && (
        <motion.div
          className="absolute left-0 right-0 z-30"
          style={{ bottom: `${sliderPosition}%`, transform: 'translateY(50%)' }}
          animate={{ bottom: `${sliderPosition}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDoubleClick={handleDoubleClick}
          variants={handleVariants}
          initial="rest"
          whileHover="hover"
          whileDrag="drag"
        >
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              whileHover={{ scale: 1.15 }}
              whileDrag={{ scale: 1.3 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50 transform -translate-y-1/2"></div>
        </motion.div>
      )}
    </div>
  );
};

export default BeforeAfterSlider;