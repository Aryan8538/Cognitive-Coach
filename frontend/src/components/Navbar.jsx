"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Sparkles, ChevronDown, User, Award, History, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { API_BASE_URL } from "@/utils/config";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [isGuestSandbox, setIsGuestSandbox] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {

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

  // Auto close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[720px] bg-white/90 dark:bg-[#181818]/90 border border-neutral-300 dark:border-[#66473B] backdrop-blur-md rounded-[4px] transition-all duration-300 shadow-sm dark:shadow-none">
      <div className="px-5 h-14 flex items-center justify-between relative">
        
        {/* Left Logo */}
        <a href="/" className="flex items-center gap-2 group transition-transform duration-300 active:scale-95 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#DC9F85] transition-transform duration-300 group-hover:scale-110" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] font-display text-neutral-900 dark:text-[#EBDCC4]">
            CognitiveCoach
          </span>
        </a>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-4.5 md:gap-6 absolute left-1/2 -translate-x-1/2">
          {user || isGuestSandbox ? (
            <>
              <a 
                href="/" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/" ? "text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85]"
                }`}
              >
                Dashboard
              </a>
              <a 
                href="/advisor" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/advisor" ? "text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85]"
                }`}
              >
                Advisor
              </a>
              <a 
                href="/resume-checker" 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  pathname === "/resume-checker" ? "text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85]"
                }`}
              >
                Resume
              </a>
            </>
          ) : (
            <>
              <a 
                href="/#features" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] transition-colors"
              >
                Features
              </a>
              <a 
                href="/#testimonials" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] transition-colors"
              >
                Testimonials
              </a>
              <a 
                href="/#faq" 
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] transition-colors"
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
                className="flex items-center gap-1.5 focus:outline-none group cursor-pointer bg-[#35211A]/10 hover:bg-[#35211A]/25 dark:bg-[#35211A]/20 dark:hover:bg-[#35211A]/40 border border-neutral-300 dark:border-[#66473B] px-2.5 py-1.5 rounded-[4px] text-neutral-900 dark:text-[#EBDCC4] text-[10px] font-mono tracking-wider transition-all duration-300"
              >
                <div className="w-5 h-5 rounded-[2px] bg-[#DC9F85] text-[#181818] font-bold text-[9px] flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <ChevronDown size={11} className="text-neutral-500 dark:text-[#B6A596] group-hover:text-neutral-900 dark:group-hover:text-[#EBDCC4] transition-transform duration-300" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#66473B] shadow-2xl rounded-[4px] p-4 z-50 animate-fade-in-up font-sans">
                  {/* User info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-[#35211A]">
                    <div className="w-8 h-8 rounded-[2px] bg-[#DC9F85] text-[#181818] font-bold text-xs flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-bold text-neutral-900 dark:text-[#EBDCC4] truncate">{user.name}</span>
                      <span className="text-[10px] text-neutral-500 dark:text-[#B6A596] truncate">{user.email}</span>
                    </div>
                  </div>

                  {/* Overview Stats */}
                  <div className="py-3 border-b border-neutral-200 dark:border-[#35211A]">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-[#66473B] block mb-2 text-left">My Overview</span>
                    <div className="grid grid-cols-2 gap-2 bg-neutral-100 dark:bg-[#35211A]/20 p-2 rounded-[2px] border border-neutral-200 dark:border-[#66473B]/50">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-neutral-500 dark:text-[#B6A596] leading-none">Interviews</span>
                        <span className="text-xs font-black text-neutral-900 dark:text-[#EBDCC4] mt-1">{stats?.total_interviews || 0}</span>
                      </div>
                      <div className="flex flex-col border-l border-neutral-200 dark:border-[#66473B] pl-2 text-left">
                        <span className="text-[9px] text-neutral-500 dark:text-[#B6A596] leading-none">Avg Clarity</span>
                        <span className="text-xs font-black text-[#DC9F85] mt-1">{stats?.average_clarity || 0}%</span>
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
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] hover:bg-neutral-100 dark:hover:bg-[#35211A]/30 rounded-[2px] transition-colors cursor-pointer"
                    >
                      <History size={12} className="text-neutral-400 dark:text-[#66473B]" />
                      <span>Start New Mock</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/resume-checker");
                      }}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] hover:bg-neutral-100 dark:hover:bg-[#35211A]/30 rounded-[2px] transition-colors cursor-pointer"
                    >
                      <User size={12} className="text-neutral-400 dark:text-[#66473B]" />
                      <span>Resume Checker</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-[2px] transition-colors mt-1 border-t border-neutral-200 dark:border-[#35211A] pt-2 cursor-pointer"
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
                  className="text-[9.5px] font-mono uppercase font-bold tracking-wider text-neutral-600 dark:text-[#B6A596] hover:text-[#DC9F85] transition-colors mr-1.5 cursor-pointer"
                >
                  Exit
                </button>
              )}
              <a 
                href="/login"
                className="bg-[#DC9F85] hover:bg-[#EBDCC4] text-[#181818] font-mono text-[9.5px] md:text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-[4px] transition-all duration-250 active:scale-95 flex-shrink-0 font-extrabold"
              >
                Sign In
              </a>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-[4px] bg-[#35211A]/10 hover:bg-[#35211A]/25 dark:bg-[#35211A]/20 dark:hover:bg-[#35211A]/40 border border-neutral-300 dark:border-[#66473B] text-neutral-500 dark:text-[#B6A596] hover:text-[#DC9F85] dark:hover:text-[#DC9F85] transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-[4px] bg-[#35211A]/10 hover:bg-[#35211A]/25 dark:bg-[#35211A]/20 dark:hover:bg-[#35211A]/40 border border-neutral-300 dark:border-[#66473B] text-neutral-500 dark:text-[#B6A596] hover:text-[#DC9F85] md:hidden transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={12} /> : <Menu size={12} />}
          </button>

        </div>
      </div>

      {/* Mobile Slide-Down Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-[#35211A] bg-white dark:bg-[#181818] p-4 flex flex-col gap-2 font-sans rounded-b-[4px] animate-fade-in-up">
          {user || isGuestSandbox ? (
            <>
              <a 
                href="/" 
                className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold px-3 py-2 rounded-[2px] transition-colors ${
                  pathname === "/" ? "bg-[#35211A]/10 text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85]"
                }`}
              >
                Dashboard
              </a>
              <a 
                href="/advisor" 
                className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold px-3 py-2 rounded-[2px] transition-colors ${
                  pathname === "/advisor" ? "bg-[#35211A]/10 text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85]"
                }`}
              >
                Advisor
              </a>
              <a 
                href="/resume-checker" 
                className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold px-3 py-2 rounded-[2px] transition-colors ${
                  pathname === "/resume-checker" ? "bg-[#35211A]/10 text-[#DC9F85]" : "text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85]"
                }`}
              >
                Resume
              </a>
            </>
          ) : (
            <>
              <a 
                href="/#features" 
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85] px-3 py-2 rounded-[2px] transition-colors"
              >
                Features
              </a>
              <a 
                href="/#testimonials" 
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85] px-3 py-2 rounded-[2px] transition-colors"
              >
                Testimonials
              </a>
              <a 
                href="/#faq" 
                className="font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-600 dark:text-[#B6A596] hover:bg-neutral-100 dark:hover:bg-[#35211A]/20 hover:text-[#DC9F85] px-3 py-2 rounded-[2px] transition-colors"
              >
                FAQ
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
