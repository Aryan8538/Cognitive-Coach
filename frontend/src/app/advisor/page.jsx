"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Send, BookOpen, GraduationCap, Trophy, ChevronRight, 
  MessageSquare, Terminal, Users, BarChart3, HelpCircle, Code2, 
  FileSpreadsheet, Clock, ArrowRight, CheckCircle2, Menu, Copy, Check, Cpu
} from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

// Hoisted constants to satisfy react-hooks/static-components rendering guidelines
const ROADMAPS = [
  {
    title: "Software Engineer",
    topic: "System Design & Coding Mocks",
    icon: <Terminal size={15} />,
    query: "Generate a 3-month Software Engineering placement roadmap, specifying DSA, CS core systems, and design resources.",
    color: "border-indigo-500/10 hover:border-indigo-500/30 text-indigo-650 dark:text-indigo-400 bg-indigo-500/5"
  },
  {
    title: "Full Stack Web Developer",
    topic: "React, Node.js & Database Scale",
    icon: <Terminal size={15} />,
    query: "Provide a study roadmap for Full Stack Web Developer placement interviews. Include React optimization, Node.js event loop dynamics, microservices, and database query optimization.",
    color: "border-emerald-500/10 hover:border-emerald-500/30 text-emerald-650 dark:text-emerald-400 bg-emerald-500/5"
  },
  {
    title: "Product Manager",
    topic: "Product Strategy & Product Estimation",
    icon: <Users size={15} />,
    query: "Create a prep roadmap for Product Manager mocks. Highlight pricing models, metrics funnels, and estimation case guides.",
    color: "border-cyan-500/10 hover:border-cyan-500/30 text-cyan-650 dark:text-cyan-400 bg-cyan-500/5"
  },
  {
    title: "HR & Behavioral",
    topic: "STAR method & Collaboration Conflict",
    icon: <HelpCircle size={15} />,
    query: "Explain how to structure answers for behavioral HR rounds using the STAR method. Give 3 sample scenarios.",
    color: "border-amber-500/10 hover:border-amber-500/30 text-amber-650 dark:text-amber-400 bg-amber-500/5"
  }
];

const CAPABILITIES = [
  { icon: <BookOpen size={13} />, label: "Personalized study roadmaps", desc: "Week-by-week plans with free resources" },
  { icon: <MessageSquare size={13} />, label: "Mock interview strategy", desc: "STAR structure & answer framing" },
  { icon: <FileSpreadsheet size={13} />, label: "Resume & ATS guidance", desc: "Keyword and impact optimization" },
  { icon: <Code2 size={13} />, label: "DSA patterns & complexity", desc: "Approach, edge cases, Big-O tips" }
];

const PLATFORM_STATS = [
  { icon: <Users size={13} />, value: "10", label: "Interview Roles" },
  { icon: <Code2 size={13} />, value: "4", label: "Coding Languages" },
  { icon: <Sparkles size={13} />, value: "AI", label: "Live Feedback" },
  { icon: <Clock size={13} />, value: "24/7", label: "Availability" }
];

export default function AdvisorPage() {
  const router = useRouter();
  
  // State definitions
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Aura-V1 (Gemini Flash)");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat area on content update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const copyToClipboard = (text, blockId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
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

  // Robust parsing of markdown sections, code-blocks and typography tags
  const renderMessageContent = (content) => {
    const parts = content.split("```");
    return parts.map((part, index) => {
      // Code blocks (odd index)
      if (index % 2 === 1) {
        const lines = part.split("\n");
        const language = lines[0].trim() || "code";
        const codeText = lines.slice(1).join("\n").trim();
        const blockId = `code-block-${index}`;
        const isCopied = copiedId === blockId;

        return (
          <div key={index} className="my-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-[#0d0d11] overflow-hidden shadow-lg max-w-full font-sans">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/10 dark:border-zinc-800/80 bg-zinc-950/40 text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 font-mono">
              <span>{language}</span>
              <button
                onClick={() => copyToClipboard(codeText, blockId)}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{isCopied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed max-w-full">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Plain paragraphs split
      const paragraphs = part.split("\n\n");
      return paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;

        if (para.startsWith("###")) {
          return (
            <h4 key={`${index}-${pIdx}`} className="font-extrabold font-display text-slate-900 dark:text-white mt-4 mb-2 text-sm border-b border-slate-100 dark:border-zinc-850/50 pb-1 font-sans">
              {para.replace("###", "").trim()}
            </h4>
          );
        }
        if (para.startsWith("####")) {
          return (
            <h5 key={`${index}-${pIdx}`} className="font-bold font-display text-slate-800 dark:text-white mt-3 mb-1.5 text-xs font-sans">
              {para.replace("####", "").trim()}
            </h5>
          );
        }

        const formatInlineStyles = (text) => {
          return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-violet-650 dark:text-violet-400'>$1</code>")
            .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-violet-605 dark:text-violet-300 hover:underline font-semibold'>$1</a>");
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
                dangerouslySetInnerHTML={{ __html: formatInlineStyles(itemContent) }}
              />
            );
          } else {
            if (currentList.length > 0) {
              elements.push(
                <ul key={`ul-${lIdx}`} className="list-disc pl-5 flex flex-col gap-1 my-1.5 font-sans">
                  {currentList}
                </ul>
              );
              currentList = [];
            }
            if (line) {
              elements.push(
                <p
                  key={`p-${lIdx}`}
                  className="mb-1.5 last:mb-0 font-sans"
                  dangerouslySetInnerHTML={{ __html: formatInlineStyles(line) }}
                />
              );
            }
          }
        });

        if (currentList.length > 0) {
          elements.push(
            <ul key="ul-end" className="list-disc pl-5 flex flex-col gap-1 my-1.5 font-sans">
              {currentList}
            </ul>
          );
        }

        return (
          <div key={`${index}-${pIdx}`} className="mb-3 last:mb-0">
            {elements}
          </div>
        );
      });
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-grid font-sans relative">
      
      {/* 1. Left Collapsible Sidebar */}
      <aside 
        className={`h-full border-r border-slate-200/50 dark:border-zinc-800/50 flex flex-col justify-between transition-all duration-300 ease-in-out bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md z-40 ${
          sidebarOpen ? "w-80" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="p-6 flex flex-col gap-6 flex-grow overflow-y-auto scrollbar-thin">
          {/* Header Title info */}
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 w-max px-3 py-1 text-[10px] font-bold rounded-full bg-violet-50 text-violet-650 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-105 dark:border-violet-900/55 shadow-sm">
              <Trophy size={11} className="text-amber-500" /> Placement Ready
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              Career Center
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Your intelligent placement advisor. Generate study roadmaps, review technical concepts, and prepare for behavioral queries.
            </p>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles size={13} />
            <span>New Chat Session</span>
          </button>

          {/* Platform Stats Panel */}
          <div className="grid grid-cols-2 gap-2.5">
            {PLATFORM_STATS.map((s, i) => (
              <div key={i} className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl p-3 flex flex-col gap-1 shadow-sm hover:border-[#D4AF37]/10 transition-colors">
                <span className="text-[#D4AF37]">{s.icon}</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-outfit leading-none">{s.value}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-505">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Advisor Capabilities */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#D4AF37]" />
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Services</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-6 h-6 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/15 border border-yellow-500/15 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
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

          {/* Platform Actions */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Quick Actions
            </h3>
            <button
              onClick={() => router.push("/#roles")}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-zinc-900/55 hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent p-3 rounded-xl text-xs font-bold text-slate-705 dark:text-slate-300 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5"><MessageSquare size={13} /> Start Mock Mock</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => router.push("/resume-checker")}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-zinc-900/55 hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent p-3 rounded-xl text-xs font-bold text-slate-705 dark:text-slate-300 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-2.5"><FileSpreadsheet size={13} /> ATS Resume Scan</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

        {/* Small Info profile card footer */}
        <div className="p-6 border-t border-slate-200/40 dark:border-zinc-800/40 bg-slate-50/20 dark:bg-zinc-950/10">
          <div className="glass-panel bg-white dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 p-3.5 rounded-2xl shadow-inner flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] font-extrabold text-xs">
              AI
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-900 animate-pulse"></span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Aura Advisor</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                Active now · Flash engine
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Conversation Viewport */}
      <main className="flex-grow flex flex-col justify-between h-full bg-slate-50/20 dark:bg-zinc-950/20 overflow-hidden relative">
        
        {/* Workspace Top Header bar */}
        <header className="px-6 py-3 border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-850 rounded-lg text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#D4AF37]" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-white font-display">Advisor Workspace</span>
            </div>
          </div>

          {/* Model Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
            >
              <Cpu size={12} className="text-[#D4AF37]" />
              <span>{selectedModel}</span>
              <ChevronRight size={10} className="rotate-90 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1.5 z-50 text-left font-sans">
                <button
                  onClick={() => {
                    setSelectedModel("Aura-V1 (Gemini Flash)");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Aura-V1 (Gemini Flash)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel("Aura-Max (Deep Grading)");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Aura-Max (Deep Grading)
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 3. Messages log area / Greeting view */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin flex flex-col gap-6">
          {messages.length === 0 ? (
            /* Interactive Welcome screen if log is empty */
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] text-zinc-950 flex items-center justify-center shadow-lg shadow-yellow-500/10 mb-6 animate-pulse">
                <Sparkles size={24} />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display bg-gradient-to-r from-slate-900 via-slate-800 to-[#D4AF37] dark:from-white dark:via-[#F4D472] dark:to-[#D4AF37] bg-clip-text text-transparent mb-4 leading-none">
                How can I help you prepare today?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-md leading-relaxed mb-10 font-normal">
                Generate study plans with resources, review technical constraints, outline resume summaries, or frame STAR strategy responses.
              </p>

              {/* Dynamic suggestion grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                {ROADMAPS.map((r, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(r.query)}
                    className="group flex gap-4 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-4 bg-white/50 dark:bg-zinc-900/30 hover:border-[#D4AF37]/35 dark:hover:border-[#D4AF37]/35 hover:-translate-y-0.5 active:translate-y-0 text-left transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-850 border border-slate-200/20 dark:border-zinc-850/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-850 dark:text-white group-hover:text-[#D4AF37] transition-colors leading-tight mb-1">{r.title}</h3>
                      <p className="text-[10px] text-slate-405 dark:text-slate-500 leading-snug">{r.topic}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active message stream logs */
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 py-4">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={index}
                    className={`flex gap-4 max-w-[90%] animate-message-enter ${
                      isAssistant ? "self-start items-start" : "self-end items-start flex-row-reverse"
                    }`}
                  >
                    {/* User / Advisor Avatar icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                      isAssistant 
                        ? "bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] text-zinc-950 font-display" 
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-zinc-800/60"
                    }`}>
                      {isAssistant ? <GraduationCap size={15} /> : "ME"}
                    </div>

                    {/* Chat Bubble container */}
                    <div className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed shadow-sm ${
                      isAssistant
                        ? "bg-white/80 dark:bg-zinc-900/75 text-slate-800 dark:text-slate-800 border border-slate-200/40 dark:border-zinc-800/60 rounded-tl-sm"
                        : "bg-slate-900 dark:bg-zinc-800 text-white dark:text-white rounded-tr-sm"
                    }`}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                );
              })}

              {/* Pulsing loading state */}
              {loading && (
                <div className="flex gap-4 items-start self-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#C5A030] to-[#F4D472] dark:from-[#D4AF37] dark:to-[#FFE492] text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
                    <GraduationCap size={15} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/45 border border-slate-200/40 dark:border-zinc-800/40 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* 4. Chat Input footer form */}
        <footer className="p-4 border-t border-slate-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="max-w-3xl mx-auto w-full flex flex-col gap-2 font-sans"
          >
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800/80 rounded-2xl shadow-sm px-4 py-3 focus-within:border-[#D4AF37]/50 focus-within:ring-2 focus-within:ring-[#D4AF37]/10 transition-all duration-300">
              <MessageSquare size={15} className="text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a career or study query (e.g. 'Generate technical OOP interview prompts')"
                disabled={loading}
                className="flex-grow bg-transparent border-none text-xs focus:outline-none dark:text-white mr-3"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={11} />
                <span>Send</span>
              </button>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-450 dark:text-slate-500 font-medium px-2">
              <span>Aura may output inaccurate resource details. Verify references.</span>
              <span>{input.length} characters</span>
            </div>
          </form>
        </footer>

      </main>

    </div>
  );
}
