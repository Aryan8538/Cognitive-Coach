import Navbar from "@/components/Navbar";
import CareerChatbot from "@/components/CareerChatbot";
import "./globals.css";

export const metadata = {
  title: "CognitiveCoach | AI Mock Interview & Communication Diagnostics",
  description: "Evaluate your technical, communication, and behavioral interview skills. Receive instant transcript reviews, filler word counts, pacing analysis, and grading suggestions using AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-50 transition-colors duration-300">
        
        {/* Subtle grid background */}
        <div className="fixed inset-0 bg-grid pointer-events-none z-[-1]"></div>

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
