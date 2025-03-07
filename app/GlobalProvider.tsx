"use client"; // This ensures that this file is treated as a client-side component

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeProvider"; // Import your theme provider
import FloatingSidebar from "@/components/FloatingSidebar";

export default function GlobalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FloatingSidebar />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
