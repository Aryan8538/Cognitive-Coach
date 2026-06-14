import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CareerChatbot from "@/components/CareerChatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: "CognitiveCoach | AI Mock Interview & Communication Diagnostics",
  description: "Evaluate your technical, communication, and behavioral interview skills. Receive instant transcript reviews, filler word counts, pacing analysis, and grading suggestions using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-50 transition-colors duration-300">
        
        {/* Subtle grid background & blur blobs */}
        <div className="fixed inset-0 bg-grid pointer-events-none z-[-1]"></div>
        <div className="background-blobs">
          <div className="blob blob-1 animate-float-1"></div>
          <div className="blob blob-2 animate-float-2"></div>
        </div>

        {/* Global sticky navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </main>

        {/* Global floating career advisor bot */}
        <CareerChatbot />

      </body>
    </html>
  );
}
