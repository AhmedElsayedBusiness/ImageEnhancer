import { motion } from 'framer-motion';
import { useState } from 'react';
import '../styles/particles.css';

const EnhancementTechniques = ({ onApplyTechnique, disabled }) => {
  const techniques = [
    { id: 'histogram_lab', name: 'Histogram Equalization (LAB)', icon: 'equalizer', description: 'Enhances contrast by equalizing the lightness channel in LAB color space.' },
    { id: 'gaussian', name: 'Gaussian Filter', icon: 'blur_on', description: 'Smooths the image using a Gaussian blur to reduce noise.' },
    { id: 'unsharp', name: 'Unsharp Masking', icon: 'adjust', description: 'Sharpens the image by amplifying high-frequency details.' },
    { id: 'color', name: 'Color Balance', icon: 'palette', description: 'Adjusts the red, green, and blue channels to balance colors.' },
    { id: 'advanced_unsharp', name: 'Advanced Unsharp Masking', icon: 'filter_hdr', description: 'Applies a more precise unsharp mask using skimage for enhanced sharpness.' },
    { id: 'clahe', name: 'CLAHE Enhancement', icon: 'contrast', description: 'Applies Contrast Limited Adaptive Histogram Equalization for local contrast enhancement.' },
    { id: 'gamma', name: 'Gamma Correction', icon: 'brightness_4', description: 'Adjusts brightness and contrast using a power-law transformation.' },
    { id: 'contrast_stretch', name: 'Contrast Stretching', icon: 'tonality', description: 'Stretches the contrast of the image based on percentile thresholds.' },
  ];

  const techniqueConfig = {
    histogram_lab: [{ name: 'intensity', label: 'Intensity', min: 0, max: 100, step: 1 }],
    gaussian: [{ name: 'sigma', label: 'Sigma', min: 0.1, max: 5, step: 0.1 }],
    unsharp: [
      { name: 'amount', label: 'Amount', min: 0, max: 5, step: 0.1 },
      { name: 'radius', label: 'Radius', min: 0, max: 5, step: 0.1 },
      { name: 'threshold', label: 'Threshold', min: 0, max: 255, step: 1 },
    ],
    color: [
      { name: 'red', label: 'Red', min: -100, max: 100, step: 1 },
      { name: 'green', label: 'Green', min: -100, max: 100, step: 1 },
      { name: 'blue', label: 'Blue', min: -100, max: 100, step: 1 },
    ],
    advanced_unsharp: [
      { name: 'radius', label: 'Radius', min: 1, max: 10, step: 1 },
      { name: 'amount', label: 'Amount', min: 0.5, max: 2, step: 0.1 },
    ],
    clahe: [
      { name: 'clip_limit', label: 'Clip Limit', min: 1, max: 5, step: 0.1 },
      { name: 'tile_grid_size', label: 'Tile Grid Size', min: 4, max: 16, step: 1 },
    ],
    gamma: [
      { name: 'gamma', label: 'Gamma', min: 0.1, max: 3, step: 0.1 },
    ],
    contrast_stretch: [
      { name: 'low_percent', label: 'Low Percentile', min: 0, max: 10, step: 0.1 },
      { name: 'high_percent', label: 'High Percentile', min: 90, max: 100, step: 0.1 },
    ],
  };

  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [techniqueParams, setTechniqueParams] = useState({
    histogram_lab: { intensity: 0 },
    gaussian: { sigma: 1 },
    unsharp: { amount: 1, radius: 1, threshold: 0 },
    color: { red: 0, green: 0, blue: 0 },
    advanced_unsharp: { radius: 5, amount: 1.0 },
    clahe: { clip_limit: 3.0, tile_grid_size: 8 },
    gamma: { gamma: 0.5 },
    contrast_stretch: { low_percent: 2, high_percent: 98 },
  });

  const handleTechniqueSelect = (techniqueId) => {
    setSelectedTechnique(techniqueId);
  };

  const handleParamChange = (techniqueId, paramName, value) => {
    setTechniqueParams((prev) => ({
      ...prev,
      [techniqueId]: { ...prev[techniqueId], [paramName]: value },
    }));
  };

  const handleApply = () => {
    if (selectedTechnique) {
      onApplyTechnique(selectedTechnique, techniqueParams[selectedTechnique]);
    }
  };

  return (
    <motion.section
      className="mb-10 particles"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.h2
        className="text-3xl font-display font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      >
        Advanced Enhancement Techniques
        <motion.span
          className="inline-block ml-2"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          ✨
        </motion.span>
      </motion.h2>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-lg relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techniques.map((technique) => (
            <div key={technique.id} className="relative group">
              <button
                className={`w-full h-full px-5 py-4 text-white rounded-lg transition-all duration-300 flex items-center space-x-3 shadow-md
                  ${selectedTechnique === technique.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 scale-105 ring-2 ring-purple-400'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-blue-600 hover:to-purple-600 hover:scale-105'
                  } group-hover:shadow-xl group-hover:shadow-blue-500/50`}
                onClick={() => handleTechniqueSelect(technique.id)}
                disabled={disabled}
              >
                <span className="material-icons text-xl">{technique.icon}</span>
                <span className="font-medium">{technique.name}</span>
              </button>
              <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-3 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-700">
                <p>{technique.description}</p>
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>
        {selectedTechnique && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-lg font-medium text-blue-300 mb-4">Adjust Parameters for {techniques.find(t => t.id === selectedTechnique).name}</h4>
            <div className="space-y-6">
              {techniqueConfig[selectedTechnique].map((param) => (
                <div key={param.name} className="group">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-300">{param.label}</label>
                    <span className="text-sm text-blue-400 font-medium">
                      {techniqueParams[selectedTechnique][param.name]}
                    </span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={techniqueParams[selectedTechnique][param.name]}
                    onChange={(e) =>
                      handleParamChange(selectedTechnique, param.name, parseFloat(e.target.value))
                    }
                  />
                </div>
              ))}
            </div>
            <button
              className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApply}
              disabled={disabled || !selectedTechnique}
            >
              Apply Technique
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default EnhancementTechniques;