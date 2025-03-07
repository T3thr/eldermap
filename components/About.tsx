'use client';

import { motion } from "framer-motion";
import { X, Clock, MapPin, Book, Users, Heart } from "lucide-react";

interface AboutProps {
  onClose: () => void;
}

const About = ({ onClose }: AboutProps) => {
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-card dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 relative glass-effect"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/70 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-accent/10"
          aria-label="close"
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
            <X size={20} />
          </motion.div>
        </button>
        
        <motion.div 
          className="mb-6 border-b border-primary/20 pb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl font-bold text-primary mb-2 flex items-center">
            <Book className="mr-2" size={24} />
            About Thai Provinces
          </h3>
          <p className="text-foreground/80 dark:text-gray-300">
            Explore the rich cultural heritage and history of Thailand's diverse provinces through our interactive platform.
          </p>
        </motion.div>
        
        <div className="space-y-4">
          <motion.div 
            className="p-3 rounded-lg bg-accent/5 border border-primary/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="font-medium text-primary flex items-center mb-2">
              <Clock className="mr-2" size={18} />
              Our Mission
            </h4>
            <p className="text-sm text-foreground/80 dark:text-gray-300">
              To make Thailand's historical journey accessible, interactive, and engaging for everyone through cutting-edge web technology.
            </p>
          </motion.div>
          
          <motion.div 
            className="p-3 rounded-lg bg-accent/5 border border-primary/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="font-medium text-primary flex items-center mb-2">
              <MapPin className="mr-2" size={18} />
              Interactive Features
            </h4>
            <p className="text-sm text-foreground/80 dark:text-gray-300">
              Each district is represented by a unique component that offers historical data, images, and key events from the past to present.
            </p>
          </motion.div>
          
          <motion.div 
            className="p-3 rounded-lg bg-accent/5 border border-primary/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="font-medium text-primary flex items-center mb-2">
              <Users className="mr-2" size={18} />
              Who We Are
            </h4>
            <p className="text-sm text-foreground/80 dark:text-gray-300">
              A team of passionate historians, developers, and designers committed to preserving and sharing Thailand's cultural heritage through modern technology.
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-6 pt-4 border-t border-primary/20 flex justify-between items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs text-foreground/60 dark:text-gray-400 flex items-center">
            <Heart size={14} className="mr-1 text-primary" />
            Made with love in Thailand
          </div>
          
          <motion.button
            onClick={onClose}
            className="bg-primary text-white dark:text-black font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Now
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;