"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Sparkles, ChevronDown, User, Award, History, LogOut } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { API_BASE_URL } from "@/utils/config";

export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [pathname, setPathname] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setPathname(window.location.pathname);

    // Check theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || !savedTheme) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    // Load active session on mount
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("auth_provider", "supabase");
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0]
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.warn("Failed to parse user session", e);
          }
        }
      }
    };
    
    loadSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem("auth_provider") === "local") {
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("auth_provider");
          setUser(null);
          setStats(null);
        }
        return;
      }

      if (session) {
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("auth_provider", "supabase");
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0]
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_provider");
        setUser(null);
        setStats(null);
      }
    });

    // Click outside listener for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/api/dashboard-stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn("Failed to fetch navbar stats", e);
    }
  };

  // Fetch dashboard stats when user is active
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_provider");
    setUser(null);
    setStats(null);
    setDropdownOpen(false);
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-zinc-955/70 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <a href="/" className="flex items-center gap-2.5 group transition-transform duration-300 active:scale-95">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] shadow-md shadow-[#D4AF37]/15 group-hover:shadow-[#D4AF37]/35 group-hover:scale-105 transition-all duration-300">
            <Sparkles size={16} className="text-zinc-950" />
          </div>
          
          <span className="text-lg font-extrabold tracking-tight font-display bg-gradient-to-r from-slate-900 via-slate-800 to-[#D4AF37] dark:from-white dark:via-[#F4D472] dark:to-[#D4AF37] bg-clip-text text-transparent transition-all duration-300">
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

          {/* User profile block */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none group cursor-pointer"
              >
                {/* Circular Initial Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] text-zinc-950 font-black text-xs flex items-center justify-center shadow-md shadow-[#D4AF37]/15 group-hover:scale-105 transition-all duration-300">
                  {getInitials(user.name)}
                </div>
                <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl rounded-2xl p-4 z-50 animate-fade-in-up font-sans">
                  {/* Dropdown User Info Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] text-zinc-950 font-black text-sm flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Dropdown Dashboard stats review */}
                  <div className="py-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">My Overview</span>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 leading-none">Interviews</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">{stats?.total_interviews || 0}</span>
                      </div>
                      <div className="flex flex-col border-l border-slate-200/50 dark:border-zinc-800/60 pl-2">
                        <span className="text-[10px] text-slate-400 leading-none">Avg Clarity</span>
                        <span className="text-sm font-black text-slate-850 dark:text-[#D4AF37] mt-1">{stats?.average_clarity || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/#roles");
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                    >
                      <History size={13} className="text-slate-400" />
                      <span>Start New Mock</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/resume-checker");
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                    >
                      <User size={13} className="text-slate-400" />
                      <span>Resume Checker</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded-lg transition-colors mt-1 border-t border-slate-100 dark:border-zinc-800 pt-3 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 leading-tight">Guest Student</span>
                <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-wider leading-none">Sandbox</span>
              </div>
              <a 
                href="/login"
                className="text-xs font-bold text-violet-650 dark:text-violet-400 hover:underline"
              >
                Sign In
              </a>
            </div>
          )}

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
