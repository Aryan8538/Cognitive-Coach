"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, MessageSquare, Send, BookOpen, FileSpreadsheet, ListChecks } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CareerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Hi! I am your AI Career Advisor.**\n\nI can help you build study roadmaps, review tech stacks, and prepare for placement interviews. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => !m.content.startsWith("👋")), userMessage]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error("Chatbot API request failed");
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Error:** Failed to connect to Career Counselor. Make sure your FastAPI backend is running on `http://localhost:8000`."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Placement Roadmap", icon: <BookOpen size={11} />, text: "Generate a 3-month Software Engineering placement roadmap" },
    { label: "Resume Tips", icon: <FileSpreadsheet size={11} />, text: "Give me critical resume writing tips for coding roles" },
    { label: "CS Topics", icon: <ListChecks size={11} />, text: "What core CS fundamentals should I study for interviews?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col items-end font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-750 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Sparkles size={16} className="text-violet-200 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display">Career Advisor Bot</h4>
                <p className="text-[9px] text-violet-250 font-semibold tracking-wide uppercase">Placement Sandbox Mode</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${isAssistant ? 'self-start items-start' : 'self-end items-end'}`}
                >
                  <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isAssistant 
                      ? 'bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-slate-250 border border-slate-100 dark:border-zinc-800/40 rounded-tl-sm' 
                      : 'bg-violet-600 text-white rounded-tr-sm'
                  }`}>
                    {/* Render basic markdown-like structures */}
                    {msg.content.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return <h4 key={pIdx} className="font-bold font-display text-slate-900 dark:text-white mt-2 mb-1 text-xs">{para.replace("###", "").trim()}</h4>;
                      }
                      if (para.startsWith("####")) {
                        return <h5 key={pIdx} className="font-bold font-display text-slate-800 dark:text-slate-350 mt-2 mb-1 text-[11px]">{para.replace("####", "").trim()}</h5>;
                      }
                      
                      // Render list items
                      if (para.includes("\n-") || para.includes("\n*")) {
                        const items = para.split(/\n[-*]\s+/);
                        const headerText = items[0];
                        return (
                          <div key={pIdx} className="mb-2">
                            {headerText && <p className="mb-1 font-bold">{headerText}</p>}
                            <ul className="list-disc pl-4 flex flex-col gap-1">
                              {items.slice(1).map((item, iIdx) => (
                                <li key={iIdx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      
                      return <p key={pIdx} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ 
                        __html: para
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/`(.*?)`/g, "<code class='bg-slate-200/50 dark:bg-zinc-800/80 px-1 py-0.5 rounded text-[10px]'>$1</code>")
                      }} />;
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-850 p-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-zinc-800/40 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800/60 flex flex-col gap-1.5 bg-slate-50/30">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Suggested Queries</span>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((qp, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(qp.text)}
                    className="flex items-center gap-2 text-[10px] text-left font-bold text-slate-600 hover:text-violet-600 dark:text-slate-450 dark:hover:text-violet-400 bg-slate-50 dark:bg-zinc-850/60 border border-slate-250/30 dark:border-zinc-800/45 p-2 rounded-xl hover:bg-violet-500/5 dark:hover:bg-violet-500/5 hover:border-violet-500/25 transition-all"
                  >
                    <span className="text-violet-550 dark:text-violet-450">{qp.icon}</span>
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Send Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-slate-150 dark:border-zinc-800/80 flex gap-2 bg-slate-50/50 dark:bg-zinc-950/20"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about roadmaps, prep, DSA..."
              disabled={loading}
              className="flex-grow bg-white dark:bg-zinc-800 border border-slate-200/50 dark:border-zinc-800/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500/60 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-md hover:shadow-violet-500/10 active:scale-95 transition-all"
            >
              <Send size={13} fill="currentColor" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-650 via-indigo-600 to-indigo-750 flex items-center justify-center text-white shadow-xl shadow-violet-500/10 hover:shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all"
        aria-label="Ask Career Bot"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
