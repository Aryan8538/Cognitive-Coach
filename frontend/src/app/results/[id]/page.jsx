"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, FileText, CheckCircle2, MessageSquare, Clock, ShieldAlert, Award, Star, Code2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { API_BASE_URL } from "@/utils/config";

// Hoist utility functions to top scope to conform to rendering lint rules
const formatMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code class='bg-[#35211A]/20 border border-[#66473B]/30 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono text-[#DC9F85]'>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-[#DC9F85] hover:underline font-semibold'>$1</a>");
};

const getScoreColorClass = (score) => {
  if (score >= 85) return 'text-emerald-450';
  if (score >= 70) return 'text-amber-550';
  return 'text-rose-500';
};

const getScoreStrokeColor = (score) => {
  if (score >= 85) return 'stroke-emerald-500';
  if (score >= 70) return 'stroke-amber-500';
  return 'stroke-rose-500';
};

const getHiringVerdict = (score) => {
  if (score >= 85) {
    return {
      verdict: "Strong Hire (Highly Recommended)",
      description: "Excellent performance! You demonstrated exceptional communication clarity, strong technical relevance, and clear grammatical flow. Your responses are highly structured and aligned with industry SDE expectations.",
      badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      pillColor: "bg-emerald-500",
      chanceText: "Very High hiring probability"
    };
  } else if (score >= 70) {
    return {
      verdict: "Lean Hire (Recommended)",
      description: "Good job! You communicated fluently and addressed the core question topics. To increase your hiring chances further, focus on reducing filler words, structuring your answers using the STAR method, and keeping pacing stable.",
      badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      pillColor: "bg-amber-500",
      chanceText: "Moderate to high hiring probability"
    };
  } else {
    return {
      verdict: "No Hire (Needs Practice)",
      description: "Your responses need structure and technical details. Try to practice more mock sessions, focus on including key technical terms, and practice pausing naturally instead of using filler words like 'um' or 'like'.",
      badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-500",
      pillColor: "bg-rose-500",
      chanceText: "Low hiring probability"
    };
  }
};

function CircularGauge({ score, label }) {
  const radius = 36;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`${label} compatibility rating: ${score}%`}
    >
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
          <circle
            className="text-slate-100 dark:text-zinc-800/60"
            strokeWidth={stroke}
            stroke="transparent"
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
        <span className={`absolute text-sm font-bold font-mono ${getScoreColorClass(score)}`}>
          {score}%
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#B6A596]">
        {label}
      </span>
    </div>
  );
}

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const interviewId = resolvedParams.id;
  const videoRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  useEffect(() => {
    setEditorTheme("vs-dark");
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token") || "";
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}`, { headers });

        if (!res.ok) throw new Error("Failed to load interview report.");
        const data = await res.json();
        setInterview(data);

        const qRes = await fetch(`${API_BASE_URL}/api/questions`);
        if (qRes.ok) {
          const qData = await qRes.json();
          const qMap = {};
          qData.forEach((q) => {
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
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-6 font-sans select-none z-10">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-[#35211A] border-t-[#DC9F85] animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border border-[#DC9F85]/10 animate-pulse-slow" />
        </div>
        <h3 className="text-base font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Compiling AI Diagnostics...</h3>
        <p className="text-xs text-[#B6A596] mt-2 text-center max-w-[280px] font-light">Analyzing speech velocity indexes and calculating metric scorecards</p>
      </div>
    );
  }

  if (!interview || interview.responses.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto animate-fade-in-up font-sans select-none z-10">
        <div className="bg-[#181818] border border-rose-955/20 p-8 rounded-[4px] text-center shadow-sm w-full">
          <ShieldAlert size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-[#EBDCC4] font-display mb-2.5 uppercase tracking-wide">Report Not Found</h3>
          <p className="text-xs text-[#B6A596] mb-6 font-light">
            We could not retrieve any metrics or responses for this interview identifier.
          </p>
          <button 
            className="w-full flex items-center justify-center gap-1.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] py-2.5 rounded-[4px] text-xs font-bold transition-all duration-200 cursor-pointer font-mono uppercase tracking-widest" 
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={13} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeResponse = interview.responses[activeIdx];
  const activeQuestion = questions[activeResponse?.question_id] || { text: "Loading question text...", topic: "Technical" };
  const metrics = activeResponse?.metrics;

  // Calculate overall performance scorecard metrics
  const totalResponses = interview.responses.length;
  let overallScore = 0;
  let totalWpm = 0;
  let totalFillers = 0;
  let combinedScoreSum = 0;

  interview.responses.forEach((resp) => {
    if (resp.metrics) {
      const questionScore = (resp.metrics.clarity_score + resp.metrics.relevance_score + resp.metrics.grammar_score) / 3;
      combinedScoreSum += questionScore;
      totalWpm += resp.metrics.words_per_minute;
      totalFillers += resp.metrics.filler_words_count;
    }
  });
  overallScore = Math.round(combinedScoreSum / (totalResponses || 1));

  const avgWpm = Math.round(totalWpm / (totalResponses || 1));
  const avgFillers = Math.round(totalFillers / (totalResponses || 1));
  const hiringProbability = overallScore > 0 ? Math.min(Math.max(Math.round(overallScore * 1.15 - 10), 5), 99) : 0;
  const verdictInfo = getHiringVerdict(overallScore);

  const handleWordClick = (wordIdx, totalWords) => {
    if (videoRef.current && videoRef.current.duration) {
      const percentage = wordIdx / totalWords;
      const seekTime = percentage * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      videoRef.current.play().catch(() => {});
    }
  };

  const renderHighlightedTranscript = (transcript) => {
    if (!transcript) return <em className="text-[#66473B]">No transcript available.</em>;
    const words = transcript.split(/\s+/);
    const totalWords = words.length;
    const fillers = ["like", "um", "uh", "basically", "you know", "actually", "so"];
    
    return words.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const isFiller = fillers.includes(cleanWord);
      
      if (isFiller) {
        return (
          <span 
            key={idx} 
            onClick={() => handleWordClick(idx, totalWords)}
            className="inline-block px-2 py-0.5 rounded-[2px] bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[9px] font-bold mx-1 leading-none uppercase tracking-wider cursor-pointer hover:scale-105 transition-transform font-mono"
            title="Click to skip video to this section"
          >
            {word}
          </span>
        );
      }
      return (
        <span 
          key={idx} 
          onClick={() => handleWordClick(idx, totalWords)}
          className="cursor-pointer hover:bg-[#DC9F85]/15 hover:text-[#DC9F85] transition-all rounded px-0.5 font-light text-[#EBDCC4]"
          title="Click to skip video here"
        >
          {word}{" "}
        </span>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-10 w-full flex-grow font-sans relative overflow-hidden select-none">
      
      {/* Soft backglow */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#DC9F85]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Back to Dashboard & Header */}
      <div className="flex flex-col gap-2 mb-10 relative z-10 text-left">
        <button 
          className="flex items-center gap-1.5 text-xs font-bold text-[#B6A596] hover:text-[#DC9F85] transition-colors duration-205 mb-4 w-fit cursor-pointer font-mono uppercase tracking-widest"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Interview Diagnostics</h1>
            <p className="text-xs text-[#B6A596] mt-1 font-light">Domain: <strong className="text-[#EBDCC4] font-bold">{interview.role}</strong> &bull; Practice Session on {new Date(interview.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-[4px] text-xs font-bold text-emerald-450 shadow-sm animate-pulse-slow font-mono">
            <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-450" /> Complete Report
          </div>
        </div>
      </div>

      {/* Overall Performance Summary Scorecard */}
      <section className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300 mb-8 flex flex-col md:flex-row gap-8 justify-between items-stretch relative z-10 text-left">
        {/* Left: Overall Score Circle Gauge */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-6 border-[#35211A] pr-0 md:pr-8 md:border-r border-b md:border-b-0 pb-6 md:pb-0">
          <div className="relative flex items-center justify-center w-24 h-24 hover:scale-105 transition-transform duration-300">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                className="text-slate-100 dark:text-zinc-800/60"
                strokeWidth="7"
                stroke="transparent"
                fill="transparent"
                r="38"
                cx="48"
                cy="48"
              />
              <circle
                className={`${getScoreStrokeColor(overallScore)} progress-ring-circle`}
                strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                style={{ strokeDashoffset: (2 * Math.PI * 38) - (overallScore / 100) * (2 * Math.PI * 38) }}
                strokeLinecap="round"
                fill="transparent"
                r="38"
                cx="48"
                cy="48"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-xl font-bold font-mono ${getScoreColorClass(overallScore)}`}>
                {overallScore}%
              </span>
              <span className="text-[7.5px] uppercase tracking-widest font-mono font-bold text-[#B6A596]">
                OVERALL
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-center text-left md:text-center">
            <div className={`text-xl font-bold font-mono ${getScoreColorClass(overallScore)} animate-pulse`}>
              {hiringProbability}%
            </div>
            <div className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#B6A596]">
              Hiring Chance
            </div>
          </div>
        </div>

        {/* Right: Recommendation Details */}
        <div className="flex-grow flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-[2px] text-xs font-bold tracking-wider font-mono border uppercase ${verdictInfo.badgeColor}`}>
                {verdictInfo.verdict}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#B6A596] uppercase tracking-wider bg-[#35211A]/20 px-2.5 py-1 rounded-[2px] border border-[#66473B]/50">
                {interview.responses.length} {interview.responses.length === 1 ? 'Question' : 'Questions'} Answered
              </span>
            </div>
            
            <p className="text-sm font-bold text-[#EBDCC4] font-display uppercase tracking-wide">
              Hiring Probability Evaluation:
            </p>
            <p className="text-xs text-[#B6A596] leading-relaxed font-light mt-1">
              {verdictInfo.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 border-t border-[#35211A] pt-4 font-mono">
            <div>
              <div className="text-[10px] text-[#66473B] font-bold uppercase tracking-wider">Avg Pacing</div>
              <div className="text-sm font-bold text-[#EBDCC4] mt-0.5">{avgWpm} WPM</div>
            </div>
            <div>
              <div className="text-[10px] text-[#66473B] font-bold uppercase tracking-wider">Avg Fillers</div>
              <div className="text-sm font-bold text-[#EBDCC4] mt-0.5">{avgFillers} words</div>
            </div>
            <div>
              <div className="text-[10px] text-[#66473B] font-bold uppercase tracking-wider">Interview Status</div>
              <div className="text-sm font-bold text-[#EBDCC4] mt-0.5 uppercase tracking-wide">{interview.status}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#66473B] font-bold uppercase tracking-wider">Evaluated Role</div>
              <div className="text-sm font-bold text-[#EBDCC4] mt-0.5 truncate max-w-[120px]">{interview.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 text-left">
        
        {/* Left Column: Questions List & Video Player */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <h3 className="text-[10px] font-mono font-bold text-[#66473B] border-b border-[#35211A] pb-2 mb-1 uppercase tracking-widest font-display">
            Questions Answered
          </h3>
          
          <div className="flex flex-col gap-3">
            {interview.responses.map((resp, index) => {
              const q = questions[resp.question_id] || { text: "Question", topic: "General" };
              const isActive = index === activeIdx;
              
              return (
                <div
                  key={resp.id}
                  className={`border p-4.5 rounded-[4px] cursor-pointer transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
                    isActive 
                      ? 'border-[#DC9F85] bg-[#35211A]/25' 
                      : 'border-[#66473B] bg-[#181818] hover:bg-[#35211A]/20 hover:border-[#DC9F85]'
                  }`}
                  onClick={() => setActiveIdx(index)}
                >
                  {/* Left indicator stroke for active item */}
                  {isActive && (
                    <div className="absolute left-0 inset-y-0 w-1 bg-[#DC9F85]" />
                  )}

                  <div className="flex justify-between items-center text-[9px] text-[#66473B] font-mono font-bold uppercase tracking-wider">
                    <span>Q{index + 1} &bull; {q.topic}</span>
                    <span className="text-[#DC9F85] font-bold">
                      Score: {resp.metrics ? Math.round((resp.metrics.clarity_score + resp.metrics.relevance_score + resp.metrics.grammar_score) / 3) : 0}%
                    </span>
                  </div>
                  <p className={`text-xs font-bold leading-relaxed ${isActive ? 'text-[#EBDCC4]' : 'text-[#B6A596]'} line-clamp-2`}>
                    {q.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Video Player Box */}
          {activeResponse && (
            <div className="bg-[#181818] border border-[#66473B] p-5 rounded-[4px] hover:border-[#DC9F85] transition-all flex flex-col gap-3 w-full relative overflow-hidden">
              <h4 className="text-[10px] font-bold text-[#EBDCC4] flex items-center gap-1.5 uppercase tracking-wider font-display">
                <Play size={13} className="text-[#DC9F85]" /> Play Back Video Response
              </h4>
              <div className="relative rounded-[4px] overflow-hidden border border-[#66473B] bg-black aspect-[4/3] flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={`${API_BASE_URL}${activeResponse.video_url}`}
                  controls
                  className="w-full h-full object-cover"
                />
                {/* Visual corners overlay */}
                <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-[#DC9F85]/60 rounded-tl-sm pointer-events-none"></div>
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-[#DC9F85]/60 rounded-tr-sm pointer-events-none"></div>
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-[#DC9F85]/60 rounded-bl-sm pointer-events-none"></div>
                <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-[#DC9F85]/60 rounded-br-sm pointer-events-none"></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metrics Analysis reports */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full animate-fade-in-up">
          
          {/* Main Scorecard */}
          <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
            <h3 className="text-[10px] font-bold text-[#DC9F85] uppercase tracking-widest font-mono mb-6">AI Evaluation Diagnostics</h3>
            
            <div className="flex justify-around items-center border-b border-[#35211A] pb-6 mb-6">
              <CircularGauge score={metrics?.relevance_score || 0} label="Relevance" />
              <CircularGauge score={metrics?.clarity_score || 0} label="Clarity" />
              <CircularGauge score={metrics?.grammar_score || 0} label="Grammar" />
            </div>

            {/* Pacing Speed & Filler indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#35211A]/20 border border-[#66473B] p-4 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
                <div className="w-9 h-9 rounded-[2px] bg-[#35211A]/30 border border-[#66473B]/50 flex items-center justify-center text-[#DC9F85]">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-base font-bold text-[#EBDCC4] font-mono">{metrics?.words_per_minute}</div>
                  <div className="text-[9px] text-[#B6A596] font-mono font-bold uppercase tracking-wider">Words Per Minute</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-[#35211A]/20 border border-[#66473B] p-4 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
                <div className="w-9 h-9 rounded-[2px] bg-[#35211A]/30 border border-[#66473B]/50 flex items-center justify-center text-[#DC9F85]">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <div className="text-base font-bold text-[#EBDCC4] font-mono">{metrics?.filler_words_count}</div>
                  <div className="text-[9px] text-[#B6A596] font-mono font-bold uppercase tracking-wider">Filler Word Counts</div>
                </div>
              </div>
            </div>
            
            {/* Filler details list */}
            {metrics && metrics.filler_words_count > 0 && (
              <div className="mt-4 pt-4 flex items-center gap-2 flex-wrap border-t border-[#35211A]">
                <span className="text-[9px] font-mono font-bold text-[#66473B] uppercase tracking-wider">Breakdown:</span>
                {Object.entries(metrics.filler_words_details).map(([word, count]) => (
                  <span key={word} className="text-[9px] font-mono font-bold bg-[#35211A]/20 border border-[#66473B]/30 text-[#B6A596] px-2 py-0.5 rounded-[2px] uppercase">
                    &ldquo;{word}&rdquo;: {count}x
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Code Block */}
          {activeResponse && activeResponse.code && (
            <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-[#EBDCC4] flex items-center gap-2 uppercase tracking-wider font-display">
                  <Code2 size={15} className="text-[#DC9F85]" />
                  Submitted Coding Solution
                </h3>
                <span className="text-[9px] font-mono font-bold bg-[#35211A]/20 border border-[#66473B]/50 text-[#B6A596] px-3 py-1 rounded-[2px] uppercase tracking-wider">
                  {(activeResponse.code_language || "python").toUpperCase()}
                </span>
              </div>
              
              <div className="rounded-[4px] overflow-hidden border border-[#66473B] h-[300px] relative">
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
          <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
            <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <FileText size={15} className="text-[#DC9F85]" /> 
              Speech Transcript
            </h3>
            <p className="text-sm leading-relaxed text-[#B6A596] bg-[#35211A]/20 p-5 rounded-[4px] border border-[#66473B]/50 font-light leading-loose">
              {renderHighlightedTranscript(activeResponse.transcript)}
            </p>
          </div>

          {/* Qualitative AI Feedback */}
          <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-[#DC9F85] transition-all duration-300">
            <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <MessageSquare size={15} className="text-[#DC9F85]" />
              AI Evaluator diagnostics
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-[#B6A596] flex flex-col gap-4">
              {metrics?.feedback_text.split('\n\n').map((para, i) => {
                if (para.startsWith('**')) {
                  const match = para.match(/^\*\*(.*?)\*\*(.*)/);
                  if (match) {
                    return (
                      <div key={i} className="pl-3 border-l-2 border-[#DC9F85]/70">
                        <strong className="text-[#EBDCC4] block text-xs md:text-sm font-bold mb-1 font-display uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: formatMarkdown(match[1]) }} />
                        <p className="font-light text-xs" dangerouslySetInnerHTML={{ __html: formatMarkdown(match[2].trim()) }} />
                      </div>
                    );
                  }
                }
                return <p key={i} className="font-light text-xs pl-3 border-l-2 border-transparent" dangerouslySetInnerHTML={{ __html: formatMarkdown(para) }} />;
              })}
            </div>
          </div>

          {/* Model suggested answer */}
          <div className="bg-[#35211A]/10 border border-dashed border-[#66473B] p-6 md:p-8 rounded-[4px] hover:border-dashed hover:border-[#DC9F85] transition-all duration-355">
            <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
              <Star size={15} className="text-[#DC9F85] fill-[#DC9F85]/15" />
              Suggested Model Answer
            </h3>
            <div className="text-xs md:text-sm leading-relaxed text-[#B6A596] bg-[#181818]/60 p-5 rounded-[4px] border border-[#66473B]/40">
              {metrics?.suggested_answer.split('\n\n').map((para, i) => {
                if (para.startsWith('**') || para.match(/^\d+\./)) {
                  return <p key={i} className="mb-4 font-bold text-[#EBDCC4] font-display uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: formatMarkdown(para) }} />;
                }
                return <p key={i} className="mb-3 font-light text-xs" dangerouslySetInnerHTML={{ __html: formatMarkdown(para) }} />;
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
