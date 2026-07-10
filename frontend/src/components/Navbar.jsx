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
  const [isGuestSandbox, setIsGuestSandbox] = useState(false);

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

    // Check if guest sandbox is active
    const checkSandbox = () => {
      setIsGuestSandbox(localStorage.getItem("guest_sandbox") === "true" && !localStorage.getItem("token"));
    };
    checkSandbox();

    window.addEventListener("storage", checkSandbox);
    window.addEventListener("sandbox-change", checkSandbox);

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
      window.removeEventListener("storage", checkSandbox);
      window.removeEventListener("sandbox-change", checkSandbox);
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
    localStorage.removeItem("guest_sandbox");
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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[720px] bg-[#0a0a0a]/75 border border-white/10 backdrop-blur-xl rounded-full transition-all duration-300 shadow-lg shadow-black/40">
      <div className="px-5 h-14 flex items-center justify-between relative">
        
        {/* Left Logo */}
        <a href="/" className="flex items-center gap-2 group transition-transform duration-300 active:scale-95 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] shadow-md shadow-[#8B5CF6]/50 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.12em] font-sans text-white">
            CognitiveCoach
          </span>
        </a>

        {/* Center Links */}
        <nav className="flex items-center gap-4.5 md:gap-6 absolute left-1/2 -translate-x-1/2">
          {user || isGuestSandbox ? (
            <>
              <a 
                href="/" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Dashboard
              </a>
              <a 
                href="/advisor" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/advisor" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Advisor
              </a>
              <a 
                href="/resume-checker" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/resume-checker" ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Resume
              </a>
            </>
          ) : (
            <>
              <a 
                href="/#features" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a 
                href="/#testimonials" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 hover:text-white transition-colors"
              >
                Testimonials
              </a>
              <a 
                href="/#faq" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 hover:text-white transition-colors"
              >
                FAQ
              </a>
            </>
          )}
        </nav>

        {/* Right CTA / Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-none group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-white text-[10px] font-bold transition-all duration-300"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white font-black text-[9px] flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <ChevronDown size={11} className={`text-slate-400 group-hover:text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0a0a0a]/95 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-4 z-50 animate-fade-in-up font-sans">
                  {/* User info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white font-black text-xs flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-bold text-white truncate">{user.name}</span>
                      <span className="text-[10px] text-neutral-450 truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Overview Stats */}
                  <div className="py-3 border-b border-white/10">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-2 text-left">My Overview</span>
                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-neutral-450 leading-none">Interviews</span>
                        <span className="text-xs font-black text-white mt-1">{stats?.total_interviews || 0}</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-2 text-left">
                        <span className="text-[9px] text-neutral-450 leading-none">Avg Clarity</span>
                        <span className="text-xs font-black text-[#06B6D4] mt-1">{stats?.average_clarity || 0}%</span>
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
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <History size={12} className="text-neutral-500" />
                      <span>Start New Mock</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/resume-checker");
                      }}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <User size={12} className="text-neutral-500" />
                      <span>Resume Checker</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-955/10 rounded-lg transition-colors mt-1 border-t border-white/10 pt-2 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isGuestSandbox && (
                <button
                  onClick={() => {
                    localStorage.removeItem("guest_sandbox");
                    setIsGuestSandbox(false);
                    window.dispatchEvent(new Event("sandbox-change"));
                    router.push("/");
                    router.refresh();
                  }}
                  className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 hover:text-white transition-colors mr-1.5 cursor-pointer"
                >
                  Exit
                </button>
              )}
              <a 
                href="/login"
                className="bg-white hover:bg-neutral-100 text-black font-mono text-[9.5px] md:text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-snappy active:scale-95 flex-shrink-0 font-extrabold"
              >
                Sign In
              </a>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-450 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
          </button>

        </div>
      </div>
    </header>
  );
}
