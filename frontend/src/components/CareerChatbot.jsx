"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, MessageSquare, Send, BookOpen, FileSpreadsheet, ListChecks } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

export default function CareerChatbot() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 **Hi! I am your AI Career Advisor.**\n\nI can help you build study roadmaps, review tech stacks, and prepare for placement interviews. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
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
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-[#181818] border border-[#66473B] rounded-[4px] shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-[#181818] border-b border-[#35211A] p-4 flex justify-between items-center text-[#EBDCC4]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] flex items-center justify-center">
                <Sparkles size={16} className="text-[#DC9F85] animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold font-display uppercase tracking-wider">Career Advisor Bot</h4>
                <p className="text-[9px] text-[#B6A596] font-mono tracking-widest uppercase">Placement Sandbox</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-[2px] text-[#B6A596] hover:text-[#DC9F85] transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3.5 bg-[#181818] scrollbar-thin">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${isAssistant ? 'self-start items-start text-left' : 'self-end items-end text-right'}`}
                >
                  <div className={`rounded-[4px] px-4 py-2.5 text-xs leading-relaxed ${
                    isAssistant 
                      ? 'bg-[#181818] text-[#EBDCC4] border border-[#66473B] rounded-tl-none' 
                      : 'bg-[#35211A]/25 text-[#EBDCC4] border border-[#DC9F85]/40 rounded-tr-none'
                  }`}>
                    {/* Render basic markdown-like structures */}
                    {msg.content.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return <h4 key={pIdx} className="font-bold font-display text-[#EBDCC4] mt-2 mb-1 text-xs uppercase tracking-wider">{para.replace("###", "").trim()}</h4>;
                      }
                      if (para.startsWith("####")) {
                        return <h5 key={pIdx} className="font-bold font-display text-[#EBDCC4] mt-2 mb-1 text-[11px] uppercase tracking-wider">{para.replace("####", "").trim()}</h5>;
                      }
                      
                      const formatText = (text) => {
                        return text
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/`(.*?)`/g, "<code class='bg-[#35211A]/20 border border-[#66473B]/30 px-1.5 py-0.5 rounded-[2px] text-[#DC9F85] font-mono text-[10px]'>$1</code>")
                          .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-[#DC9F85] hover:underline font-bold'>$1</a>");
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
                              className="text-[#B6A596] font-light list-disc pl-1 ml-3"
                              dangerouslySetInnerHTML={{ __html: formatText(itemContent) }} 
                            />
                          );
                        } else {
                          if (currentList.length > 0) {
                            elements.push(
                              <ul key={`ul-${lIdx}`} className="list-disc pl-4 flex flex-col gap-1 my-2">
                                {currentList}
                              </ul>
                            );
                            currentList = [];
                          }
                          if (line) {
                            elements.push(
                              <p 
                                key={`p-${lIdx}`} 
                                className="mb-1 last:mb-0 text-[#EBDCC4] font-light" 
                                dangerouslySetInnerHTML={{ __html: formatText(line) }} 
                              />
                            );
                          }
                        }
                      });

                      if (currentList.length > 0) {
                        elements.push(
                          <ul key="ul-end" className="list-disc pl-4 flex flex-col gap-1 my-2">
                            {currentList}
                          </ul>
                        );
                      }

                      return (
                        <div key={pIdx} className="mb-2 last:mb-0">
                          {elements}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 bg-[#181818] border border-[#66473B] p-3 rounded-[4px] rounded-tl-none self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC9F85] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC9F85] animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC9F85] animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-[#35211A] flex flex-col gap-1.5 bg-[#35211A]/10 text-left">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#66473B]">Suggested Queries</span>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((qp, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(qp.text)}
                    className="flex items-center gap-2 text-[10px] text-left font-mono font-bold text-[#B6A596] hover:text-[#DC9F85] bg-[#181818] border border-[#66473B] p-2 rounded-[4px] hover:border-[#DC9F85] transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <span className="text-[#DC9F85]">{qp.icon}</span>
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
            className="p-3 border-t border-[#35211A] flex gap-2 bg-[#181818]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about roadmaps, prep, DSA..."
              disabled={loading}
              className="flex-grow bg-[#181818] border border-[#66473B] rounded-[4px] px-3.5 py-2 text-xs focus:outline-none focus:border-[#DC9F85] text-[#EBDCC4] placeholder-[#66473B] font-mono uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-[4px] border border-[#66473B] hover:border-[#DC9F85] bg-[#181818] flex items-center justify-center text-[#DC9F85] hover:text-[#DC9F85] hover:shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Send size={13} fill="currentColor" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-[4px] bg-[#181818] border border-[#66473B] hover:border-[#DC9F85] flex items-center justify-center text-[#DC9F85] hover:text-[#DC9F85] shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Ask Career Bot"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
