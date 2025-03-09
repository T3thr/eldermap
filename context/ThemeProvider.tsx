"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps, useTheme } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} attribute="class">
      <ThemeSynchronizer>{children}</ThemeSynchronizer>
    </NextThemesProvider>
  );
}

function ThemeSynchronizer({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Immediately apply the theme to prevent flash
    document.documentElement.classList.add(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  if (!mounted) {
    return null; // Return null instead of invisible div to prevent layout shift
  }

  return <>{children}</>;
}