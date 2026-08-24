import { motion } from "framer-motion";

const Sidebar = () => {
  const techniques = [
    "Histogram Equalization",
    "Gaussian Filter",
    "Unsharp Masking",
    "Color Balance",
    "Advanced Unsharp Masking",
    "CLAHE Enhancement",
    "Gamma Correction",
    "Contrast Stretching",
  ];

  return (
    <aside className="w-full md:w-64 bg-background-darker flex-shrink-0 border-r border-gray-800">
      <div className="p-4">
        <motion.div 
          className="flex items-center space-x-2 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons">auto_fix_high</span>
          </div>
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PixelPerfect
          </h1>
        </motion.div>
        
        <nav className="space-y-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer bg-primary bg-opacity-20 text-primary-light"
          >
            <span className="material-icons">dashboard</span>
            <span>Dashboard</span>
          </motion.div>
        </nav>
      </div>
      
      <div className="p-4 mt-8">
        <h3 className="text-xs uppercase text-text-muted tracking-wider mb-3">
          Image Enhancement Toolkit
        </h3>
        <div className="space-y-3">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-sm p-2 text-text-muted"
          >
            <p>A CSE281 project for image processing with the following enhancement techniques:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {techniques.map((technique, index) => (
                <motion.li
                  key={technique}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05, color: "#93C5FD" }} // Matches text-primary-light (blue-300)
                  className="transition-colors duration-200"
                >
                  {technique}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;