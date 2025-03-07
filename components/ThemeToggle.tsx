"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, SunMoon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  closeMenuOnToggle?: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  className = "", 
  closeMenuOnToggle,
  size = "md",
  showLabel = false
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get sizing based on prop
  const getSizing = () => {
    switch(size) {
      case "sm": return { width: "w-12", height: "h-6", circle: "w-4 h-4", icon: 14 };
      case "lg": return { width: "w-20", height: "h-10", circle: "w-8 h-8", icon: 20 };
      default: return { width: "w-16", height: "h-8", circle: "w-6 h-6", icon: 16 };
    }
  };

  const { width, height, circle, icon } = getSizing();

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, [setTheme]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setIsChanging(true);
    
    // First trigger the animation
    setTimeout(() => {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      
      // Handle menu closing if provided
      if (closeMenuOnToggle) {
        closeMenuOnToggle();
      }
      
      // Add a document class for global transition effects
      document.documentElement.classList.add('theme-transitioning');
      
      // Reset changing state after theme transition completes
      setTimeout(() => {
        setIsChanging(false);
        document.documentElement.classList.remove('theme-transitioning');
      }, 500);
    }, 150);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className={`${width} ${height} rounded-full bg-gray-200 dark:bg-gray-700 ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      {/* Optional label */}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
      
      {/* Toggle switch container */}
      <motion.div
        className={`relative ${width} ${height} rounded-full cursor-pointer ${className}`}
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Background track */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          animate={{ 
            backgroundColor: isDark 
              ? "rgba(30, 58, 138, 0.6)" 
              : "rgba(250, 204, 21, 0.5)" 
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Track highlights/shadows */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className={`
            absolute inset-0 
            bg-gradient-to-r 
            ${isDark 
              ? 'from-blue-800/30 to-indigo-900/30' 
              : 'from-yellow-400/30 to-orange-400/30'
            }
            transition-opacity duration-500
          `} />
          
          {/* Small sparkles in the track - different for light/dark */}
          <AnimatePresence>
            {(isHovered || isChanging) && [...Array(6)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className={`absolute rounded-full ${
                  isDark ? "bg-blue-200" : "bg-yellow-200"
                }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  width: isDark ? "1px" : "2px",
                  height: isDark ? "1px" : "2px",
                  x: 4 + Math.random() * (parseInt(width.replace("w-", "")) - 8),
                  y: 2 + Math.random() * (parseInt(height.replace("h-", "")) - 4),
                }}
                transition={{ 
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Slider button */}
        <motion.div
          className={`
            absolute top-1 
            ${circle} 
            rounded-full 
            shadow-md
            flex items-center justify-center
            z-10
            overflow-hidden
          `}
          animate={{ 
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            left: isDark ? `calc(70% - ${parseInt(circle.replace("w-", "")) + 4}px)` : "4px" 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30
          }}
        >
          {/* Icon animation */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? "dark" : "light"}
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {isDark ? (
                <Moon className="text-blue-400" size={icon} />
              ) : (
                <Sun className="text-yellow-400" size={icon} />
              )}
              
              {/* Light theme: Sun rays animation */}
              {!isDark && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`sunray-${i}`}
                      className="absolute bg-yellow-300 origin-center"
                      style={{
                        width: "1px",
                        height: `${icon * 0.4}px`,
                        left: "50%",
                        top: "50%",
                        transformOrigin: "0 0",
                        transform: `rotate(${i * 45}deg) translateY(-${icon * 0.9}px)`
                      }}
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        height: [`${icon * 0.4}px`, `${icon * 0.6}px`, `${icon * 0.4}px`]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Particle effect on toggle */}
          {isChanging && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className={`absolute w-1 h-1 rounded-full ${
                    isDark ? "bg-yellow-300" : "bg-blue-300"
                  }`}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 0 
                  }}
                  animate={{ 
                    x: Math.sin(i * Math.PI / 4) * (parseInt(circle.replace("w-", "")) * 0.8), 
                    y: Math.cos(i * Math.PI / 4) * (parseInt(circle.replace("h-", "")) * 0.8),
                    opacity: 0,
                    scale: 2
                  }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Dark theme: Stars around moon */}
        <AnimatePresence>
          {isDark && (isHovered || !isChanging) && (
            [...Array(5)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                  delay: i * 0.3
                }}
                style={{
                  left: `${15 + Math.random() * 20}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
              >
                <div className="relative w-1 h-1 bg-blue-200 rounded-full" />
                {Math.random() > 0.5 && (
                  <>
                    <div className="absolute w-2 h-px bg-blue-200/50 rounded-full" style={{ left: -0.5, top: 0.5 }} />
                    <div className="absolute w-px h-2 bg-blue-200/50 rounded-full" style={{ left: 0.5, top: -0.5 }} />
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {/* Light theme: Shining effect */}
        <AnimatePresence>
          {!isDark && !isChanging && (
            <motion.div
              className="absolute rounded-full bg-gradient-radial from-yellow-200/80 via-yellow-400/10 to-transparent"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3], 
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              style={{
                width: `${parseInt(circle.replace("w-", "")) * 3}px`,
                height: `${parseInt(circle.replace("h-", "")) * 3}px`,
                left: `4px`,
                top: `1px`,
                transform: 'translate(-33%, -33%)',
                zIndex: 5
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}