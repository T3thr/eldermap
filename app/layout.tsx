import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsBanner from "@/components/NewsBanner"; 
import GlobalProvider from "../context/GlobalProvider"; // Import the GlobalProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Global metadata base URL for Open Graph, Twitter, etc.
export const metadataBase = new URL("https://eldermap.vercel.app");

// Static Metadata Configuration
export const metadata: Metadata = {
  title: "Thai Provinces Interactive History Platform",
  description: "Explore the rich history of Thai provinces with dynamic, interactive web technology.",
  keywords: "Thai history, interactive map, Phitsanulok, Next.js, Tailwind CSS, provinces, จังหวัด",
  authors: [{ name: "eldermap_team" }],
  openGraph: {
    title: "Thai Provinces Interactive History Platform",
    description: "Discover the past and present of Thai provinces through an interactive digital experience.",
    siteName: "Thai Provinces History Platform",
    locale: "th_TH",
    type: "website",
    url: "https://eldermap.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thai Provinces Interactive History Platform",
    description: "Explore the rich history of Thai provinces with dynamic, interactive web technology.",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the entire layout with the GlobalProvider */}
        <GlobalProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <NewsBanner /> {/* Include the NewsBanner component here */}
            <main className="flex-grow container mx-auto px-4 py-8 md:px-8 lg:px-12">
              {children}
            </main>
            <Footer />
          </div>
        </GlobalProvider>
      </body>
    </html>
  );
}
