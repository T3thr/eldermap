'use client';

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import About from './About';

const NewsBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const bannerDismissed = localStorage.getItem('newsBannerDismissed');
    
    if (!bannerDismissed) {
      // If not dismissed before, show the banner
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    
    // If "Don't show again" is checked, store in localStorage
    if (dontShowAgain) {
      localStorage.setItem('newsBannerDismissed', 'true');
    }
  };

  const openAbout = () => {
    setShowAbout(true);
  };

  const closeAbout = () => {
    setShowAbout(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-card dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative glass-effect"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-foreground hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-accent/10"
                aria-label="dismiss"
              >
                <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                  <X size={20} />
                </motion.div>
              </button>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                  <Bell className="mr-2" size={22} />
                  Latest Updates
                </h3>
                <div className="text-foreground dark:text-gray-300 space-y-3 p-3 bg-accent/5 rounded-lg border border-primary/10">
                  <p>Welcome to our new Thai Provinces History platform!</p>
                  <p>We&apos;ve just added 10 new historical timelines for northern provinces.</p>
                </div>
              </div>
              
              <div className="flex items-center mb-5">
                <input
                  type="checkbox" 
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 text-primary rounded border-primary/30 focus:ring-primary"
                />
                <label htmlFor="dontShowAgain" className="ml-2 text-sm text-foreground dark:text-gray-300">
                  Don&apos;t show this again
                </label>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={openAbout}
                  className="flex-1 bg-accent/10 hover:bg-accent/20 text-foreground dark:text-white font-medium py-2 px-4 rounded-lg transition-colors border border-primary/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
                <motion.button
                  onClick={handleDismiss}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white dark:text-black font-medium py-2 px-4 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAbout && <About onClose={closeAbout} />}
      </AnimatePresence>
    </>
  );
};

export default NewsBanner;