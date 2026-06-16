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
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-50 transition-colors duration-300">
        
        {/* Sleek Preloader Screen */}
        <div className="page-loader">
          <div className="loader-content flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-xl shadow-violet-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
            </div>
            <span className="text-sm font-extrabold tracking-widest uppercase font-display bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-600 dark:from-white dark:via-purple-100 dark:to-violet-400 bg-clip-text text-transparent">
              NeuroSync
            </span>
          </div>
        </div>

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
