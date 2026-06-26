"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Sparkles } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);

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

    // Load active user session on mount
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Failed to parse user session", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

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
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-zinc-955/70 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <a href="/" className="flex items-center gap-2.5 group transition-transform duration-300 active:scale-95">
          {/* Glowing Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] shadow-md group-hover:shadow-[#7c3aed]/20 group-hover:scale-105 transition-all duration-300">
            <Sparkles size={16} className="text-white" />
          </div>
          
          <span className="text-lg font-extrabold tracking-tight font-display bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-600 dark:from-white dark:via-purple-100 dark:to-violet-400 bg-clip-text text-transparent transition-all duration-300">
            CognitiveCoach
          </span>
        </a>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-6 md:gap-8">
          <a 
            href="/" 
            className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
              pathname === "/" 
                ? "text-violet-650 dark:text-violet-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-450"
            }`}
          >
            Dashboard
            {pathname === "/" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full animate-underline-grow" />
            )}
          </a>
          <a 
            href="/advisor" 
            className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
              pathname === "/advisor" 
                ? "text-violet-650 dark:text-violet-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-455"
            }`}
          >
            Career Center
            {pathname === "/advisor" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full animate-underline-grow" />
            )}
          </a>
          <a 
            href="/resume-checker" 
            className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
              pathname === "/resume-checker" 
                ? "text-violet-650 dark:text-violet-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-455"
            }`}
          >
            Resume Checker
            {pathname === "/resume-checker" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full animate-underline-grow" />
            )}
          </a>
          <a 
            href="/#roles" 
            className="text-sm font-semibold text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors duration-200 py-1"
          >
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
