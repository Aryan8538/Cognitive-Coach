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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#181818] text-[#EBDCC4] min-h-screen overflow-x-hidden relative font-sans select-none">
        
        {/* Global 3% fractal noise texture overlay */}
        <div className="noise-overlay" />

        {/* Global sticky navbar (hidden on home path) */}
        <Navbar />

        {/* Main Content Area */}
        <main className="min-h-screen flex flex-col">
          {children}
        </main>

        {/* Global floating career advisor bot (hidden on home path) */}
        <CareerChatbot />

      </body>
    </html>
  );
}
