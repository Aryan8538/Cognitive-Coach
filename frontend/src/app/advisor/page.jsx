"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, BookOpen, GraduationCap, Trophy, ChevronRight, MessageSquare, Terminal, Users, BarChart3, HelpCircle, Code2, FileSpreadsheet, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

export default function AdvisorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 **Welcome to the Placement Career Center!**\n\nI am your AI advisor. Choose a pre-built roadmap below or ask me any question about placements, roadmaps, technical preparation, or coding strategies to get started."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // The Gemini API key lives only on the backend (env var). The client never
      // sends a key — the server authenticates the upstream Gemini call itself.
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
          content: "⚠️ **Connection Error:** Failed to communicate with the career server. Please make sure the backend service is running and try again."
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

  // What the advisor can help with — surfaced so users know the scope up front.
  const capabilities = [
    { icon: <BookOpen size={13} />, label: "Personalized study roadmaps", desc: "Week-by-week plans with free resources" },
    { icon: <MessageSquare size={13} />, label: "Mock interview strategy", desc: "STAR structure & answer framing" },
    { icon: <FileSpreadsheet size={13} />, label: "Resume & ATS guidance", desc: "Keyword and impact optimization" },
    { icon: <Code2 size={13} />, label: "DSA patterns & complexity", desc: "Approach, edge cases, Big-O tips" }
  ];

  // Honest, capability-derived platform stats (not per-user analytics).
  const platformStats = [
    { icon: <Users size={13} />, value: "10", label: "Interview Roles" },
    { icon: <Code2 size={13} />, value: "4", label: "Coding Languages" },
    { icon: <Sparkles size={13} />, value: "AI", label: "Live Feedback" },
    { icon: <Clock size={13} />, value: "24/7", label: "Availability" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow flex flex-col md:flex-row gap-8 items-stretch h-[calc(100vh-100px)] font-sans">

      {/* Left Sidebar: Career Center overview & quick actions */}
      <div className="md:w-80 flex flex-col gap-6 flex-shrink-0 overflow-y-auto scrollbar-thin pr-1 animate-fade-in-up">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-violet-50 text-violet-650 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/55 mb-3 shadow-sm">
            <Trophy size={11} className="text-amber-500" /> Placement Ready
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Career Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Your AI placement advisor — generate customized study roadmaps, review technical concepts, and get structured, interview-ready guidance. No setup required; just start chatting.
          </p>
        </div>

        {/* Platform at a glance */}
        <div className="grid grid-cols-2 gap-2.5">
          {platformStats.map((s, i) => (
            <div key={i} className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-violet-650 dark:text-violet-400">{s.icon}</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-outfit leading-none">{s.value}</span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-505">{s.label}</span>
            </div>
          ))}
        </div>

        {/* AI capabilities */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-violet-650 dark:text-violet-400" />
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">What I can help with</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {capabilities.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-6 h-6 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/15 flex items-center justify-center text-violet-650 dark:text-violet-400 flex-shrink-0">
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">{c.label}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 leading-snug">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested prompts / roadmaps */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Suggested Prompts
          </h3>
          <div className="flex flex-col gap-2.5">
            {roadmaps.map((r, index) => (
              <button
                key={index}
                onClick={() => handleSend(r.query)}
                disabled={loading}
                className={`w-full flex items-center justify-between border p-3 rounded-xl hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${r.color}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-current/10 shadow-sm flex items-center justify-center">
                    {r.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-505 line-clamp-1">{r.topic}</p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push("/#roles")}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-zinc-900/55 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <span className="flex items-center gap-2.5"><MessageSquare size={14} /> Start a Mock Interview</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => router.push("/resume-checker")}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-zinc-900/55 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <span className="flex items-center gap-2.5"><FileSpreadsheet size={14} /> Scan Your Resume</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Counselor Profile Details Card */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-violet-650 text-white dark:text-zinc-950 font-extrabold font-display shadow-md shadow-violet-500/10">
            AI
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-zinc-900 animate-pulse"></span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white font-display">Placement Advisor</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-505 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" /> Always online · no API key needed
            </p>
          </div>
        </div>
      </div>

      {/* Right Main Panel: Advisor Chat Workspace */}
      <div className="flex-grow glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-150 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-650 dark:text-violet-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-white font-display">Interactive Career Counselor</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-505">Live Session</span>
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
                  isAssistant ? 'bg-violet-605 text-white dark:text-zinc-950 font-display' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-400 border border-slate-200/40 dark:border-zinc-800/40'
                }`}>
                  {isAssistant ? <GraduationCap size={15} /> : "ME"}
                </div>

                {/* Bubble content */}
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isAssistant
                    ? 'bg-white/80 dark:bg-zinc-900/45 text-slate-800 dark:text-slate-700 border border-slate-200/50 dark:border-zinc-800/50 rounded-tl-sm'
                    : 'bg-violet-605 dark:bg-[#D4AF37] text-white dark:text-zinc-950 rounded-tr-sm'
                }`}>
                  {msg.content.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("###")) {
                      return (
                        <h4 key={pIdx} className="font-extrabold font-display text-slate-900 dark:text-white mt-4 mb-2 text-sm border-b border-slate-100 dark:border-zinc-850/50 pb-1">
                          {para.replace("###", "").trim()}
                        </h4>
                      );
                    }
                    if (para.startsWith("####")) {
                      return (
                        <h5 key={pIdx} className="font-bold font-display text-slate-800 dark:text-white mt-3 mb-1.5 text-xs">
                          {para.replace("####", "").trim()}
                        </h5>
                      );
                    }

                    const formatText = (text) => {
                      return text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/`(.*?)`/g, "<code class='bg-slate-105 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-[10.5px] font-semibold text-violet-650 dark:text-violet-400'>$1</code>")
                        .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-violet-405 dark:text-violet-300 hover:underline font-semibold'>$1</a>");
                    };

                    const lines = para.split("\n");
                    const elements = [];
                    let currentList = [];

                    lines.forEach((line, lIdx) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                        const itemContent = trimmed.substring(1).trim();
                        currentList.push(
                          <li
                            key={`li-${lIdx}`}
                            dangerouslySetInnerHTML={{ __html: formatText(itemContent) }}
                          />
                        );
                      } else {
                        if (currentList.length > 0) {
                          elements.push(
                            <ul key={`ul-${lIdx}`} className="list-disc pl-4 flex flex-col gap-1.5 my-2">
                              {currentList}
                            </ul>
                          );
                          currentList = [];
                        }
                        if (line) {
                          elements.push(
                            <p
                              key={`p-${lIdx}`}
                              className="mb-1.5 last:mb-0"
                              dangerouslySetInnerHTML={{ __html: formatText(line) }}
                            />
                          );
                        }
                      }
                    });

                    if (currentList.length > 0) {
                      elements.push(
                        <ul key="ul-end" className="list-disc pl-4 flex flex-col gap-1.5 my-2">
                          {currentList}
                        </ul>
                      );
                    }

                    return (
                      <div key={pIdx} className="mb-3 last:mb-0">
                        {elements}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-start self-start">
              <div className="w-8 h-8 rounded-lg bg-violet-605 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
                <GraduationCap size={15} />
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/45 border border-slate-200/50 dark:border-zinc-800/50 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-505 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
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
            placeholder="Type a career query here (e.g. 'Give me OOP interview questions')"
            disabled={loading}
            className="flex-grow bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/60 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={12} fill="currentColor" /> Send
          </button>
        </form>

      </div>
    </div>
  );
}
