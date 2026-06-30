"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

export default function LoginPage() {
  const router = useRouter();
  
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
        // Log in JSON endpoint
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || "Authentication failed. Please verify your credentials.");
        }

        // Save token to local storage
        localStorage.setItem("token", data.access_token);
        
        // Fetch current user details to save user name
        const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${data.access_token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          localStorage.setItem("user", JSON.stringify(userData));
        }

        router.push("/");
        router.refresh();
      } else {
        // Sign up
        const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Registration failed. Please try again.");
        }

        setSuccessMsg("Account created successfully! Redirecting to sign in...");
        
        // Clear sign up specific inputs and switch to login tab
        setTimeout(() => {
          setActiveTab("login");
          setPassword("");
          setConfirmPassword("");
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-20 flex-grow flex flex-col justify-center animate-fade-in-up">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 mb-10 text-center">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#6366f1] shadow-md">
          <Sparkles size={22} className="text-white" />
        </div>
        <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white uppercase">
          NeuroSync Workspace
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px]">
          Authenticate to start webcam mock sessions and retrieve key communication analytics.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-xl mb-6 border border-slate-200/40 dark:border-zinc-800/40">
        <button
          onClick={() => {
            setActiveTab("login");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
            activeTab === "login"
              ? "bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab("signup");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
            activeTab === "signup"
              ? "bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Glass Panel Form Card */}
      <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Notification Alerts */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-450 p-3.5 rounded-xl text-xs backdrop-blur-sm">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-450 p-3.5 rounded-xl text-xs backdrop-blur-sm">
              <Shield size={14} className="flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Form Input fields */}
          {activeTab === "signup" && (
            <div className="flex flex-col gap-1.5 animate-form-field">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/60 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Mail size={14} />
              </span>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/60 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-violet-500/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Lock size={14} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/60 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-violet-500/50 transition-colors"
                required
              />
            </div>
          </div>

          {activeTab === "signup" && (
            <div className="flex flex-col gap-1.5 animate-form-field">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/60 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-violet-500/50 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
            className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-zinc-750 font-bold py-3 px-4 rounded-xl text-xs transition-all active:scale-98 cursor-pointer"
          >
            Continue as Guest <ArrowRight size={13} className="text-slate-400" />
          </button>

        </form>
      </div>

    </div>
  );
}
