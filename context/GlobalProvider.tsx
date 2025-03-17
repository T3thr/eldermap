"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeProvider";
import FloatingSidebar from "@/components/FloatingSidebar";
import { useEffect, useState } from "react";

export default function GlobalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <FloatingSidebar />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}