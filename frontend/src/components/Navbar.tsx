"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage or system preferences on mount
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <a href="/" className="flex items-center gap-2.5 group transition-transform duration-300 active:scale-95">
          {/* Glowing Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md group-hover:shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
            <Sparkles size={16} className="text-white" />
          </div>
          
          <span className="text-lg font-extrabold tracking-tight font-display bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-600 dark:from-white dark:via-purple-100 dark:to-violet-400 bg-clip-text text-transparent transition-all duration-300">
            CognitiveCoach
          </span>
        </a>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-6 md:gap-8">
          <a href="/" className="text-sm font-semibold text-slate-800 hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400 transition-colors duration-200">
            Dashboard
          </a>
          <a href="/#roles" className="text-sm font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors duration-200">
            Start Interview
          </a>
          
          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={15} className="animate-spin-slow" />
            ) : (
              <Moon size={15} />
            )}
          </button>
        </nav>
        
      </div>
    </header>
  );
}
