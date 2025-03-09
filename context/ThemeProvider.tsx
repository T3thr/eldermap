"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps, useTheme } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} attribute="class" enableSystem={true} defaultTheme="system">
      <ThemeSynchronizer>{children}</ThemeSynchronizer>
    </NextThemesProvider>
  );
}

function ThemeSynchronizer({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && resolvedTheme) {
      // Add transitioning class briefly when theme changes
      document.documentElement.classList.add('theme-transitioning');
      
      // Remove the class after transition completes
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300); // Match with CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="invisible" aria-hidden="true">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}