import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsBanner from "@/components/NewsBanner"; 
import GlobalProvider from "./GlobalProvider"; // Import the GlobalProvider

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

export const metadata: Metadata = {
  title: "Thai Provinces Interactive History Platform",
  description: "Explore the rich history of Thai provinces with dynamic, interactive web technology.",
  keywords: ["Thai history", "interactive map", "Phitsanulok", "Next.js", "Tailwind CSS", "provinces", "จังหวัด"],
  openGraph: {
    title: "Thai Provinces Interactive History Platform",
    description: "Discover the past and present of Thai provinces through an interactive digital experience.",
    url: "https://eldermap.vercel.app",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Thai Provinces History Platform",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
