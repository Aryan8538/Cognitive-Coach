"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase, supabaseUrl } from "@/utils/supabase";
import { API_BASE_URL } from "@/utils/config";

export default function LoginPage() {
  const router = useRouter();
  const isPlaceholder = supabaseUrl.includes("placeholder-project");

  // Tabs: "login" or "signup"
  const [activeTab, setActiveTab] = useState("login");
  
  // Input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // If the user already has a token in localStorage, redirect to dashboard.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (activeTab === "signup") {
      if (!name) {
        setErrorMsg("Please provide your name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        let sessionData = null;
        let useLocalFallback = isPlaceholder;

        if (!useLocalFallback) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            if (error) {
              const msg = error.message || "";
              if (error.status === 429 || msg.includes("rate limit") || msg.includes("exceeded")) {
                useLocalFallback = true;
              } else {
                throw error;
              }
            } else {
              sessionData = data;
            }
          } catch (err) {
            const msg = err.message || "";
            if (msg.includes("rate limit") || msg.includes("exceeded") || msg.includes("fetch")) {
              useLocalFallback = true;
            } else {
              throw err;
            }
          }
        }

        if (useLocalFallback) {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Authentication failed.");
          }

          const data = await res.json();
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("auth_provider", "local");

          const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              "Authorization": `Bearer ${data.access_token}`
            }
          });
          const meData = meRes.ok ? await meRes.json() : {};

          const userData = {
            id: meData.id || "local-user",
            email: meData.email || email,
            name: meData.name || "Sandbox Candidate"
          };
          localStorage.setItem("user", JSON.stringify(userData));

          setSuccessMsg("Logged in successfully (via Local Database)!");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        } else {
          if (sessionData && sessionData.session) {
            localStorage.setItem("token", sessionData.session.access_token);
            localStorage.setItem("auth_provider", "supabase");

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", sessionData.user.id)
              .single();

            const userData = {
              id: sessionData.user.id,
              email: sessionData.user.email,
              name: profile?.name || "Candidate"
            };
            localStorage.setItem("user", JSON.stringify(userData));

            setSuccessMsg("Logged in successfully (via Supabase)!");
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1500);
          } else {
            throw new Error("Invalid session created.");
          }
        }
      } else {
        // Sign Up Flow
        let sessionData = null;
        let useLocalFallback = isPlaceholder;

        if (!useLocalFallback) {
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name: name
                }
              }
            });
            if (error) {
              const msg = error.message || "";
              if (error.status === 429 || msg.includes("rate limit") || msg.includes("exceeded")) {
                useLocalFallback = true;
              } else {
                throw error;
              }
            } else {
              sessionData = data;
            }
          } catch (err) {
            const msg = err.message || "";
            if (msg.includes("rate limit") || msg.includes("exceeded") || msg.includes("fetch")) {
              useLocalFallback = true;
            } else {
              throw err;
            }
          }
        }

        if (useLocalFallback) {
          const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, name })
          });

          if (!regRes.ok) {
            const errData = await regRes.json();
            throw new Error(errData.detail || "Registration failed.");
          }

          const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });

          if (!loginRes.ok) {
            setSuccessMsg("Account created successfully (via Local Database)! Please sign in.");
            setTimeout(() => {
              setActiveTab("login");
              setPassword("");
              setConfirmPassword("");
              setSuccessMsg(null);
            }, 2500);
            return;
          }

          const loginData = await loginRes.json();
          localStorage.setItem("token", loginData.access_token);
          localStorage.setItem("auth_provider", "local");

          const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              "Authorization": `Bearer ${loginData.access_token}`
            }
          });
          const meData = meRes.ok ? await meRes.json() : {};

          const userData = {
            id: meData.id || "local-user",
            email: meData.email || email,
            name: meData.name || name
          };
          localStorage.setItem("user", JSON.stringify(userData));

          setSuccessMsg("Account created and logged in successfully (via Local Database)!");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        } else {
          if (sessionData && sessionData.session) {
            localStorage.setItem("token", sessionData.session.access_token);
            localStorage.setItem("auth_provider", "supabase");
            const userData = {
              id: sessionData.user.id,
              email: sessionData.user.email,
              name: name
            };
            localStorage.setItem("user", JSON.stringify(userData));
            setSuccessMsg("Account created and logged in successfully (via Supabase)!");
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1500);
          } else {
            setSuccessMsg("Registration successful! Please check your email to verify your account.");
            setTimeout(() => {
              setActiveTab("login");
              setPassword("");
              setConfirmPassword("");
              setSuccessMsg(null);
            }, 3000);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-20 flex-grow flex flex-col justify-center animate-fade-in-up select-none">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 mb-10 text-center">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] text-[#DC9F85]">
          <Sparkles size={22} className="text-[#DC9F85]" />
        </div>
        <h2 className="text-2xl font-bold font-display tracking-wide text-[#EBDCC4] uppercase">
          NeuroSync Workspace
        </h2>
        <p className="text-xs text-[#B6A596] font-light max-w-[280px]">
          Authenticate to start webcam mock sessions and retrieve key communication analytics.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-[#181818] p-1.5 rounded-[4px] mb-6 border border-[#66473B]">
        <button
          onClick={() => {
            setActiveTab("login");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-[2px] transition-all duration-300 ${
            activeTab === "login"
              ? "bg-[#35211A] text-[#DC9F85]"
              : "text-[#B6A596] hover:text-[#EBDCC4]"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab("signup");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-[2px] transition-all duration-300 ${
            activeTab === "signup"
              ? "bg-[#35211A] text-[#DC9F85]"
              : "text-[#B6A596] hover:text-[#EBDCC4]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[#181818] border border-[#66473B] rounded-[4px] p-6 shadow-sm text-left">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Notification Alerts */}
          {isPlaceholder && (
            <div className="flex items-start gap-2 bg-[#35211A]/10 border border-dashed border-[#66473B] text-[#B6A596] p-3.5 rounded-[4px] text-xs font-light">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-[#DC9F85]" />
              <div>
                <span className="font-bold text-[#EBDCC4]">Configuration Warning:</span>
                <p className="mt-1">
                  Supabase environment variables are missing or not loaded. The client is using fallback credentials.
                </p>
                <p className="mt-1 font-bold text-[9px] uppercase tracking-wider font-mono text-[#DC9F85]">
                  Please check frontend/.env.local and restart Next.js!
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-955/20 border border-rose-900/40 text-rose-400 p-3.5 rounded-[4px] text-xs font-mono">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 bg-emerald-955/20 border border-emerald-900/40 text-emerald-400 p-3.5 rounded-[4px] text-xs font-mono">
              <Shield size={14} className="flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Input fields */}
          {activeTab === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#66473B]">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#66473B] pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#181818] border border-[#66473B] text-[#EBDCC4] rounded-[4px] focus:outline-none focus:border-[#DC9F85] transition-colors placeholder-[#66473B]/50 font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#66473B]">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#66473B] pointer-events-none">
                <Mail size={14} />
              </span>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#181818] border border-[#66473B] text-[#EBDCC4] rounded-[4px] focus:outline-none focus:border-[#DC9F85] transition-colors placeholder-[#66473B]/50 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#66473B]">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#66473B] pointer-events-none">
                <Lock size={14} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#181818] border border-[#66473B] text-[#EBDCC4] rounded-[4px] focus:outline-none focus:border-[#DC9F85] transition-colors placeholder-[#66473B]/50 font-mono"
                required
              />
            </div>
          </div>

          {activeTab === "signup" && (
            <div className="flex flex-col gap-1.5 animate-form-field">
              <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#66473B]">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#66473B] pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#181818] border border-[#66473B] text-[#EBDCC4] rounded-[4px] focus:outline-none focus:border-[#DC9F85] transition-colors placeholder-[#66473B]/50 font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="editorial-btn-primary w-full mt-4 py-3.5 rounded-[4px] text-xs flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Processing...
              </>
            ) : activeTab === "login" ? (
              <>
                Sign In <ArrowRight size={13} />
              </>
            ) : (
              <>
                Create Account <ArrowRight size={13} />
              </>
            )}
          </button>

          {/* Guest Access Button */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
              router.refresh();
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] py-3.5 rounded-[4px] text-xs transition-all active:scale-98 cursor-pointer font-mono uppercase tracking-widest"
          >
            Continue as Guest <ArrowRight size={13} />
          </button>

        </form>
      </div>

    </div>
  );
}
