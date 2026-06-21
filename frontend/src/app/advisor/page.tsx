"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, BookOpen, GraduationCap, Trophy, ChevronRight, MessageSquare, Terminal, Users, BarChart3, HelpCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AdvisorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome to the Placement Career Center!**\n\nI am your AI advisor. Choose a pre-built roadmap below or ask me any question about placements, roadmaps, technical preparation, or coding strategies to get started."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(savedKey);
    if (savedKey) {
      setApiKeyInput(savedKey);
    }
  }, [router]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKeyInput.trim());
    setApiKey(apiKeyInput.trim());
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setApiKeyInput("");
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      const savedKey = localStorage.getItem("gemini_api_key") || "";
      if (savedKey) {
        headers["X-Gemini-Key"] = savedKey;
      }

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messages.filter(m => !m.content.startsWith("👋")), userMessage]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Connection Error:** Failed to communicate with the career server. Please ensure the backend is active at `http://localhost:8000`."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const roadmaps = [
    {
      title: "Software Engineer",
      topic: "System Design & Coding Mocks",
      icon: <Terminal size={15} />,
      query: "Generate a 3-month Software Engineering placement roadmap, specifying DSA, CS core systems, and design resources.",
      color: "border-indigo-500/20 hover:border-indigo-500/40 text-indigo-650 dark:text-indigo-400 bg-indigo-500/5"
    },
    {
      title: "Full Stack Web Developer",
      topic: "React, Node.js & Database Scale",
      icon: <Terminal size={15} />,
      query: "Provide a study roadmap for Full Stack Web Developer placement interviews. Include React optimization, Node.js event loop dynamics, microservices, and database query optimization.",
      color: "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-650 dark:text-emerald-400 bg-emerald-500/5"
    },
    {
      title: "Product Manager",
      topic: "Product Strategy & Product Estimation",
      icon: <Users size={15} />,
      query: "Create a prep roadmap for Product Manager mocks. Highlight pricing models, metrics funnels, and estimation case guides.",
      color: "border-cyan-500/20 hover:border-cyan-500/40 text-cyan-650 dark:text-cyan-400 bg-cyan-500/5"
    },
    {
      title: "HR & Behavioral",
      topic: "STAR method & Collaboration Conflict",
      icon: <HelpCircle size={15} />,
      query: "Explain how to structure answers for behavioral HR rounds using the STAR method. Give 3 sample scenarios.",
      color: "border-amber-500/20 hover:border-amber-500/40 text-amber-650 dark:text-amber-400 bg-amber-500/5"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow flex flex-col md:flex-row gap-8 items-stretch h-[calc(100vh-100px)] font-sans">
      
      {/* Left Sidebar: Quick Actions Panel */}
      <div className="md:w-80 flex flex-col gap-6 flex-shrink-0 animate-fade-in-up">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-violet-50 text-violet-650 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/55 mb-3 shadow-sm">
            <Trophy size={11} className="text-amber-500" /> Placement Ready
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Career Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Generate customized study roadmaps, review technical concepts, and receive structured career guidance.
          </p>
        </div>

        {/* Gemini API Key Configuration Panel */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Gemini API Settings
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-emerald-500 animate-pulse-slow" : "bg-amber-500"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder={apiKey ? "••••••••••••••••••••••••" : "Enter GEMINI_API_KEY"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-2 text-[10.5px] bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-250 border border-slate-200/80 dark:border-zinc-850/80 rounded-xl focus:outline-none focus:border-violet-500/50 transition-colors"
            />
            <div className="flex gap-2.5 justify-end items-center">
              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="text-[9.5px] font-extrabold text-rose-500 dark:text-rose-450 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSaveApiKey}
                className="text-[9.5px] font-extrabold text-violet-605 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Save Key
              </button>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal mt-0.5">
              Get a free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400 underline hover:text-violet-650">Google AI Studio</a> to enable live interactive counseling.
            </p>
          </div>
        </div>

        {/* Pre-built roadmaps list */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Generate Study Roadmaps
          </h3>
          <div className="flex flex-col gap-2.5">
            {roadmaps.map((r, index) => (
              <button
                key={index}
                onClick={() => handleSend(r.query)}
                disabled={loading}
                className={`w-full flex items-center justify-between border p-3 rounded-xl hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none text-left transition-all ${r.color}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-current/10 shadow-sm flex items-center justify-center">
                    {r.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{r.topic}</p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Counselor Profile Details Card */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 text-white font-extrabold font-display shadow-md shadow-violet-500/10">
            AI
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-zinc-900 animate-pulse"></span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Placement Advisor</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Multimodal Gemini Flash</p>
          </div>
        </div>
      </div>

      {/* Right Main Panel: Advisor Chat Workspace */}
      <div className="flex-grow glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-150 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-605 dark:text-violet-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-250 font-display">Interactive Career Counselor</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-500">Live Session</span>
        </div>

        {/* Chat History Panel */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4.5 scrollbar-thin">
          {messages.map((msg, index) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div 
                key={index}
                className={`flex gap-3 max-w-[85%] animate-message-enter ${isAssistant ? 'self-start items-start' : 'self-end items-end flex-row-reverse'}`}
              >
                {/* Profile Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                  isAssistant ? 'bg-violet-600 text-white font-display' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-350 border border-slate-200/40 dark:border-zinc-800/40'
                }`}>
                  {isAssistant ? <GraduationCap size={15} /> : "ME"}
                </div>
                
                {/* Bubble content */}
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isAssistant 
                    ? 'bg-white/80 dark:bg-zinc-900/45 text-slate-800 dark:text-slate-250 border border-slate-200/50 dark:border-zinc-805/50 rounded-tl-sm' 
                    : 'bg-violet-600 text-white rounded-tr-sm'
                }`}>
                  {msg.content.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("###")) {
                      return <h4 key={pIdx} className="font-extrabold font-display text-slate-900 dark:text-white mt-4 mb-2 text-sm border-b border-slate-100 dark:border-zinc-850/50 pb-1">{para.replace("###", "").trim()}</h4>;
                    }
                    if (para.startsWith("####")) {
                      return <h5 key={pIdx} className="font-bold font-display text-slate-800 dark:text-slate-350 mt-3 mb-1.5 text-xs">{para.replace("####", "").trim()}</h5>;
                    }
                    
                    // Render lists
                    if (para.includes("\n-") || para.includes("\n*")) {
                      const items = para.split(/\n[-*]\s+/);
                      const headerText = items[0];
                      return (
                        <div key={pIdx} className="mb-3">
                          {headerText && <p className="mb-1.5 font-bold text-slate-900 dark:text-white">{headerText}</p>}
                          <ul className="list-disc pl-4 flex flex-col gap-1.5">
                            {items.slice(1).map((item, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{
                                __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              }} />
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    
                    return <p key={pIdx} className="mb-3 last:mb-0" dangerouslySetInnerHTML={{ 
                      __html: para
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-[10.5px] font-semibold text-violet-650 dark:text-violet-400'>$1</code>")
                    }} />;
                  })}
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-3 items-start self-start">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <GraduationCap size={15} />
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/45 border border-slate-200/50 dark:border-zinc-805/50 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Footer */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-slate-150 dark:border-zinc-800/80 flex gap-3 bg-slate-50/50 dark:bg-zinc-950/20"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a career query here (e.g. 'Give me core OOP interview questions' or 'SE roadmap')"
            disabled={loading}
            className="flex-grow bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/60 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-98 transition-all flex items-center gap-1.5"
          >
            <Send size={12} fill="currentColor" /> Send
          </button>
        </form>

      </div>
    </div>
  );
}
