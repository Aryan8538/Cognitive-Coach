"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, FileText, CheckCircle2, MessageSquare, Clock, ShieldAlert, Award, Star, Code2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { API_BASE_URL } from "@/utils/config";

interface Metric {
  words_per_minute: number;
  filler_words_count: number;
  filler_words_details: Record<string, number>;
  grammar_score: number;
  relevance_score: number;
  clarity_score: number;
  feedback_text: string;
  suggested_answer: string;
}

interface Response {
  id: string;
  question_id: number;
  video_url: string;
  transcript: string;
  created_at: string;
  metrics: Metric;
  code?: string;
  code_language?: string;
}

interface Question {
  id: number;
  text: string;
  topic: string;
}

interface InterviewData {
  id: string;
  role: string;
  status: string;
  created_at: string;
  responses: Response[];
}

export default function Results({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const interviewId = resolvedParams.id;

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [questions, setQuestions] = useState<Record<number, Question>>({});
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [editorTheme, setEditorTheme] = useState("vs-dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setEditorTheme(isDark ? "vs-dark" : "light");

    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains("dark");
      setEditorTheme(darkActive ? "vs-dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to load interview report.");
        const data = await res.json();
        setInterview(data);

        const qRes = await fetch(`${API_BASE_URL}/api/questions`);
        if (qRes.ok) {
          const qData = await qRes.json();
          const qMap: Record<number, Question> = {};
          qData.forEach((q: any) => {
            qMap[q.id] = q;
          });
          setQuestions(qMap);
        }
      } catch (err) {
        console.warn("Failed to load report data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [interviewId, router]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200/25 border-t-violet-600 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border border-violet-500/10 animate-pulse-slow" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">Compiling AI Diagnostics...</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center max-w-[280px]">Analyzing speech velocity indexes and calculating metric scorecards</p>
      </div>
    );
  }

  if (!interview || interview.responses.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto">
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 p-8 rounded-2xl text-center shadow-sm w-full animate-fade-in-up">
          <ShieldAlert size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display mb-2.5">Report Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            We could not retrieve any metrics or responses for this interview identifier.
          </p>
          <button className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all duration-200" onClick={() => router.push("/")}>
            <ArrowLeft size={13} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeResponse = interview.responses[activeIdx];
  const activeQuestion = questions[activeResponse?.question_id] || { text: "Loading question text...", topic: "Technical" };
  const metrics = activeResponse?.metrics;

  const renderHighlightedTranscript = (transcript: string) => {
    if (!transcript) return <em className="text-slate-455">No transcript available.</em>;
    const words = transcript.split(/\s+/);
    const fillers = ["like", "um", "uh", "basically", "you know", "actually", "so"];
    
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const isFiller = fillers.includes(cleanWord);
      
      if (isFiller) {
        return (
          <span key={idx} className="inline-block px-1.5 py-0.5 rounded bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-[10px] font-extrabold mx-0.5 leading-none uppercase tracking-wide">
            {word}
          </span>
        );
      }
      return <span key={idx}> {word} </span>;
    });
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-450';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 85) return 'stroke-emerald-500';
    if (score >= 70) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  // Reusable circle gauge component
  const CircularGauge = ({ score, label }: { score: number; label: string }) => {
    const radius = 36;
    const stroke = 5.5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
            <circle
              className="text-slate-100 dark:text-zinc-800/60"
              strokeWidth={stroke}
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              className={`${getScoreStrokeColor(score)} progress-ring-circle`}
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <span className={`absolute text-sm font-extrabold font-outfit ${getScoreColorClass(score)}`}>
            {score}%
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow font-sans">
      
      {/* Back to Dashboard & Header */}
      <div className="flex flex-col gap-2 mb-10">
        <button 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-violet-650 dark:text-slate-500 dark:hover:text-violet-400 transition-colors duration-200 mb-4 w-fit"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-display">Interview Diagnostics</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Domain: <strong className="text-slate-700 dark:text-slate-350">{interview.role}</strong> &bull; Practice Session on {new Date(interview.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm animate-pulse-slow">
            <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-500" /> Complete Report
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Questions List & Video Player (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200/40 dark:border-zinc-800/50 pb-2 mb-1 uppercase tracking-wider font-display">
            Questions Answered
          </h3>
          
          <div className="flex flex-col gap-3">
            {interview.responses.map((resp, index) => {
              const q = questions[resp.question_id] || { text: "Question", topic: "General" };
              const isActive = index === activeIdx;
              
              return (
                <div
                  key={resp.id}
                  className={`glass-panel border p-4 rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-2 ${
                    isActive 
                      ? 'border-violet-500/40 bg-violet-500/5 dark:border-violet-500/40 dark:bg-violet-950/10 shadow-sm shadow-violet-500/5' 
                      : 'border-slate-200/50 dark:border-zinc-850/50 bg-white/70 dark:bg-zinc-900/55 hover:bg-white dark:hover:bg-zinc-900 hover:border-violet-500/20'
                  }`}
                  onClick={() => setActiveIdx(index)}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500 font-extrabold font-outfit uppercase">
                    <span>Q{index + 1} &bull; {q.topic}</span>
                    <span className="text-violet-600 dark:text-violet-400">
                      Score: {resp.metrics ? Math.round((resp.metrics.clarity_score + resp.metrics.relevance_score + resp.metrics.grammar_score) / 3) : 0}%
                    </span>
                  </div>
                  <p className={`text-xs font-bold leading-relaxed ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-450'} line-clamp-2`}>
                    {q.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Video Player Box */}
          {activeResponse && (
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-500/25 dark:hover:border-violet-500/20 transition-all duration-300 flex flex-col gap-3 w-full">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider font-display">
                <Play size={13} className="text-violet-650 dark:text-violet-400" /> Play Back Video Response
              </h4>
              <div className="relative rounded-lg overflow-hidden border border-slate-200/40 dark:border-zinc-800/50 bg-black aspect-[4/3] flex items-center justify-center shadow-inner">
                <video
                  src={`${API_BASE_URL}${activeResponse.video_url}`}
                  controls
                  className="w-full h-full object-cover"
                />
                {/* Visual corners overlay */}
                <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/40 rounded-tl-sm pointer-events-none"></div>
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-white/40 rounded-tr-sm pointer-events-none"></div>
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/40 rounded-bl-sm pointer-events-none"></div>
                <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/40 rounded-br-sm pointer-events-none"></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metrics Analysis reports (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full animate-fade-in-up">
          
          {/* Main Scorecard */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm hover:border-violet-500/20 transition-all duration-300">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display mb-6">AI Evaluation Diagnostics</h3>
            
            <div className="flex justify-around items-center border-b border-slate-100 dark:border-zinc-850/50 pb-6 mb-6">
              <CircularGauge score={metrics?.relevance_score || 0} label="Relevance" />
              <CircularGauge score={metrics?.clarity_score || 0} label="Clarity" />
              <CircularGauge score={metrics?.grammar_score || 0} label="Grammar" />
            </div>

            {/* Pacing Speed & Filler indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-850/30 border border-slate-150 dark:border-zinc-800/50 p-4 rounded-xl hover:border-cyan-500/20 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">{metrics?.words_per_minute}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Words Per Minute</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-850/30 border border-slate-150 dark:border-zinc-800/50 p-4 rounded-xl hover:border-rose-500/20 transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-455">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-outfit">{metrics?.filler_words_count}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Filler Word Counts</div>
                </div>
              </div>
            </div>
            
            {/* Filler details list */}
            {metrics && metrics.filler_words_count > 0 && (
              <div className="mt-4 pt-4 flex items-center gap-2 flex-wrap border-t border-slate-100 dark:border-zinc-850/40">
                <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Breakdown:</span>
                {Object.entries(metrics.filler_words_details).map(([word, count]) => (
                  <span key={word} className="text-[10px] font-extrabold bg-rose-500/5 border border-rose-550/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md uppercase">
                    "{word}": {count}x
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Code Block */}
          {activeResponse && activeResponse.code && (
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm hover:border-violet-500/15 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider font-display">
                  <Code2 size={15} className="text-violet-650 dark:text-violet-400" />
                  Submitted Coding Solution
                </h3>
                <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/30 dark:border-zinc-800/40 text-slate-505 dark:text-slate-400 px-3 py-1 rounded-md uppercase tracking-wider font-outfit font-bold">
                  {(activeResponse.code_language || "python").toUpperCase()}
                </span>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-slate-200/40 dark:border-zinc-800/50 h-[300px] relative">
                <Editor
                  height="100%"
                  language={activeResponse.code_language === "cpp" ? "cpp" : activeResponse.code_language || "python"}
                  value={activeResponse.code}
                  theme={editorTheme}
                  options={{
                    readOnly: true,
                    fontSize: 12,
                    fontFamily: "Fira Code, Source Code Pro, Consolas, Courier New, monospace",
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollbar: {
                      vertical: "visible",
                      horizontal: "visible",
                      useShadows: false,
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6
                    },
                    padding: { top: 10, bottom: 10 },
                    automaticLayout: true,
                    domReadOnly: true
                  }}
                />
              </div>
            </div>
          )}

          {/* Transcript Box */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm hover:border-cyan-500/10 transition-all duration-300">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <FileText size={15} className="text-cyan-500" /> 
              Speech Transcript
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-zinc-950/40 p-5 rounded-xl border border-slate-100/60 dark:border-zinc-850/20 font-medium">
              {renderHighlightedTranscript(activeResponse.transcript)}
            </p>
          </div>

          {/* Qualitative AI Feedback */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm hover:border-violet-500/10 transition-all duration-300">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <MessageSquare size={15} className="text-violet-605 dark:text-violet-400" />
              AI Evaluator diagnostics
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex flex-col gap-4">
              {metrics?.feedback_text.split('\n\n').map((para, i) => {
                if (para.startsWith('**')) {
                  const match = para.match(/^\*\*(.*?)\*\*(.*)/);
                  if (match) {
                    return (
                      <div key={i} className="pl-3 border-l-2 border-violet-500/70">
                        <strong className="text-slate-900 dark:text-white block text-xs md:text-sm font-bold mb-1 font-display">{match[1]}</strong>
                        <p className="font-medium">{match[2].trim()}</p>
                      </div>
                    );
                  }
                }
                return <p key={i} className="font-medium pl-3 border-l-2 border-transparent">{para}</p>;
              })}
            </div>
          </div>

          {/* Model suggested answer */}
          <div className="glass-panel bg-violet-500/5 dark:bg-violet-950/5 border border-dashed border-violet-500/25 dark:border-violet-900/40 p-6 md:p-8 rounded-2xl shadow-sm hover:border-dashed hover:border-violet-500/45 transition-all duration-350">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <Star size={15} className="text-amber-500 fill-amber-500/20" />
              Suggested Model Answer
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-zinc-900/20 p-5 rounded-xl border border-violet-500/10 dark:border-violet-900/15">
              {metrics?.suggested_answer.split('\n\n').map((para, i) => {
                if (para.startsWith('**') || para.match(/^\d+\./)) {
                  return <p key={i} className="mb-4 font-bold text-slate-800 dark:text-slate-200 font-display">{para}</p>;
                }
                return <p key={i} className="mb-3 font-medium">{para}</p>;
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
