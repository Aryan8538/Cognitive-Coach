"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, FileText, CheckCircle2, MessageSquare, Clock, ShieldAlert, Award, Star } from "lucide-react";

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

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`http://localhost:8000/api/interviews/${interviewId}`);
        if (!res.ok) throw new Error("Failed to load interview report.");
        const data = await res.json();
        setInterview(data);

        const qRes = await fetch("http://localhost:8000/api/questions");
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
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin mb-5" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Compiling AI Diagnostics...</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Analyzing speech velocity indexes and calculating metric scorecards</p>
      </div>
    );
  }

  if (!interview || interview.responses.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto">
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 p-8 rounded-2xl text-center shadow-sm w-full">
          <ShieldAlert size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2.5">Report Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            We could not retrieve any metrics or responses for this interview identifier.
          </p>
          <button className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all duration-200" onClick={() => router.push("/")}>
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
    if (!transcript) return <em className="text-slate-400">No transcript available.</em>;
    const words = transcript.split(/\s+/);
    const fillers = ["like", "um", "uh", "basically", "you know", "actually", "so"];
    
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const isFiller = fillers.includes(cleanWord);
      
      if (isFiller) {
        return (
          <span key={idx} className="inline-block px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold mx-0.5 leading-none">
            {word}
          </span>
        );
      }
      return <span key={idx}> {word} </span>;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow">
      
      {/* Back to Dashboard & Header */}
      <div className="flex flex-col gap-2 mb-10">
        <button 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 transition-colors duration-200 mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Interview Diagnostic Report</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Domain: <strong className="text-slate-700 dark:text-slate-300">{interview.role}</strong> &bull; Practice date {new Date(interview.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 size={14} className="flex-shrink-0" /> Completed Session
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Questions List & Video Player (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200/40 dark:border-zinc-800/50 pb-2 mb-1">
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
                      ? 'border-violet-500/40 bg-violet-50/10 dark:border-violet-500/40 dark:bg-violet-950/10 shadow-sm' 
                      : 'border-slate-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/55 hover:bg-white dark:hover:bg-zinc-900'
                  }`}
                  onClick={() => setActiveIdx(index)}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    <span>Q{index + 1} &bull; {q.topic}</span>
                    <span className="text-violet-600 dark:text-violet-400">
                      Score: {resp.metrics ? Math.round((resp.metrics.clarity_score + resp.metrics.relevance_score + resp.metrics.grammar_score) / 3) : 0}%
                    </span>
                  </div>
                  <p className={`text-xs font-bold leading-normal ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'} line-clamp-2`}>
                    {q.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Video Player Box */}
          {activeResponse && (
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm flex flex-col gap-3 w-full">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Play size={13} className="text-violet-600 dark:text-violet-400" /> Play Back Video Response
              </h4>
              <video
                src={`http://localhost:8000${activeResponse.video_url}`}
                controls
                className="w-full aspect-[4/3] rounded-lg bg-black border border-slate-200/30 dark:border-zinc-800/40 shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Right Column: Metrics Analysis reports (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Main Scorecard */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">AI Evaluation Diagnostics</h3>
            
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-zinc-850/50 pb-6 mb-6 text-center">
              <div>
                <div className={`text-2xl md:text-3xl font-extrabold ${getScoreColor(metrics?.relevance_score || 0)}`}>
                  {metrics?.relevance_score}%
                </div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Relevance</div>
              </div>
              <div>
                <div className={`text-2xl md:text-3xl font-extrabold ${getScoreColor(metrics?.clarity_score || 0)}`}>
                  {metrics?.clarity_score}%
                </div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Clarity</div>
              </div>
              <div>
                <div className={`text-2xl md:text-3xl font-extrabold ${getScoreColor(metrics?.grammar_score || 0)}`}>
                  {metrics?.grammar_score}%
                </div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Grammar</div>
              </div>
            </div>

            {/* Pacing Speed & Filler indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/40 border border-slate-100/60 dark:border-zinc-800/60 p-4 rounded-xl">
                <Clock size={18} className="text-cyan-500 flex-shrink-0" />
                <div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">{metrics?.words_per_minute}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Words Per Minute</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/40 border border-slate-100/60 dark:border-zinc-800/60 p-4 rounded-xl">
                <ShieldAlert size={18} className="text-rose-500 flex-shrink-0" />
                <div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">{metrics?.filler_words_count}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Filler Word Counts</div>
                </div>
              </div>
            </div>
            
            {/* Filler details list */}
            {metrics && metrics.filler_words_count > 0 && (
              <div className="mt-4 pt-2 flex items-center gap-2 flex-wrap border-t border-slate-50 dark:border-zinc-850/50">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Breakdown:</span>
                {Object.entries(metrics.filler_words_details).map(([word, count]) => (
                  <span key={word} className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                    "{word}": {count}x
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Box */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <FileText size={15} className="text-cyan-500" /> 
              Speech Transcript
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-zinc-950/40 p-5 rounded-xl border border-slate-100/50 dark:border-zinc-850/30">
              {renderHighlightedTranscript(activeResponse.transcript)}
            </p>
          </div>

          {/* Qualitative AI Feedback */}
          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare size={15} className="text-violet-600 dark:text-violet-400" />
              AI Evaluator Diagnostics
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex flex-col gap-4">
              {metrics?.feedback_text.split('\n\n').map((para, i) => {
                if (para.startsWith('**')) {
                  const match = para.match(/^\*\*(.*?)\*\*(.*)/);
                  if (match) {
                    return (
                      <div key={i}>
                        <strong className="text-slate-900 dark:text-white block text-xs md:text-sm font-bold mb-1">{match[1]}</strong>
                        <p>{match[2].trim()}</p>
                      </div>
                    );
                  }
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </div>

          {/* Model suggested answer */}
          <div className="glass-panel bg-violet-50/10 dark:bg-violet-950/5 border border-dashed border-violet-200 dark:border-violet-900/60 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Star size={15} className="text-amber-500" />
              Suggested Model Answer
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-zinc-900/30 p-5 rounded-xl border border-violet-100/50 dark:border-violet-900/30">
              {metrics?.suggested_answer.split('\n\n').map((para, i) => {
                if (para.startsWith('**') || para.match(/^\d+\./)) {
                  return <p key={i} className="mb-4 font-bold text-slate-800 dark:text-slate-200">{para}</p>;
                }
                return <p key={i} className="mb-3">{para}</p>;
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
