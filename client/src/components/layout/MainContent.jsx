import { motion } from "framer-motion";

const MainContent = ({ title, description, children }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-2">{description}</p>
        </motion.header>

        {children}
      </div>
    </main>
  );
};

export default MainContent;
