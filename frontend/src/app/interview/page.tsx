"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, HelpCircle, Check, Award, AlertCircle } from "lucide-react";
import VideoRecorder from "@/components/VideoRecorder";
import CodeEditor from "@/components/CodeEditor";
import { API_BASE_URL } from "@/utils/config";

interface Question {
  id: number;
  role: string;
  topic: string;
  difficulty: string;
  text: string;
  suggested_keywords: string;
}

function InterviewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Software Engineer";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Code editor states
  const [code, setCode] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState<string>("python");

  useEffect(() => {
    async function initializeSession() {
      try {
        const token = localStorage.getItem("token") || "";
        const headers: Record<string, string> = { 
          "Content-Type": "application/json"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const sessionRes = await fetch(`${API_BASE_URL}/api/interviews`, {
          method: "POST",
          headers,
          body: JSON.stringify({ role: role })
        });
        
        if (!sessionRes.ok) throw new Error("Failed to create interview session on backend.");
        const sessionData = await sessionRes.json();
        setInterviewId(sessionData.id);

        const qRes = await fetch(`${API_BASE_URL}/api/questions?role=${encodeURIComponent(role)}`);
        if (!qRes.ok) throw new Error("Failed to load role questions.");
        const qData = await qRes.json();
        
        if (qData.length === 0) {
          throw new Error("No questions available for this role inside the database.");
        }
        setQuestions(qData);
      } catch (err: any) {
        console.warn(err);
        setErrorMsg(err.message || "An error occurred during interview startup.");
      } finally {
        setLoading(false);
      }
    }
    initializeSession();
  }, [role, router]);

  // Reset editor text when question changes
  useEffect(() => {
    setCode("");
  }, [currentIdx]);

  const handleRecordingComplete = async (videoBlob: Blob, durationSeconds: number) => {
    if (!interviewId || questions.length === 0) return;
    
    setIsProcessing(true);
    const question = questions[currentIdx];
    const isCodingQuestion = question.topic === "Coding Logic";
    
    const formData = new FormData();
    formData.append("duration", durationSeconds.toString());
    formData.append("video", videoBlob, "video.webm");
    
    if (isCodingQuestion && code) {
      formData.append("code", code);
      formData.append("code_language", codeLanguage);
    }

    try {
      const uploadUrl = `${API_BASE_URL}/api/interviews/${interviewId}/questions/${question.id}/respond`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Response upload/evaluation failed on the server.");
      }
      
      setAnsweredMap((prev) => ({ ...prev, [question.id]: true }));
    } catch (err: any) {
      alert(err.message || "Failed to process response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!interviewId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/complete`, {
        method: "POST"
      });
      if (res.ok) {
        router.push(`/results/${interviewId}`);
      } else {
        throw new Error("Failed to complete interview.");
      }
    } catch (err) {
      console.warn(err);
      router.push(`/results/${interviewId}`);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200/25 border-t-violet-600 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border border-violet-500/10 animate-pulse-slow" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">Setting up interview sandbox...</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center max-w-[280px]">Initializing virtual camera feeds and seeding question databases</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto">
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-rose-200/40 dark:border-rose-950/20 p-8 rounded-2xl text-center shadow-sm w-full animate-fade-in-up">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display mb-2">Initialization Failed</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {errorMsg}
          </p>
          <button className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all duration-200" onClick={() => router.push("/")}>
            <ArrowLeft size={13} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const isCurrentAnswered = answeredMap[currentQuestion?.id];
  const allAnswered = questions.every((q) => answeredMap[q.id]);
  
  const isCodingQuestion = currentQuestion?.topic === "Coding Logic";

  // Split-Screen Layout for Coding Logic Questions
  if (isCodingQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 w-full flex-grow flex flex-col lg:flex-row gap-8 items-start font-sans">
        
        {/* Left Column: Question Statement + Webcam capturing panel */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6 flex-shrink-0">
          <button 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-violet-650 dark:text-slate-500 dark:hover:text-violet-400 transition-colors duration-205 w-fit"
            onClick={() => {
              if (confirm("Are you sure you want to exit? Current progress will be discarded.")) {
                router.push("/");
              }
            }}
          >
            <ArrowLeft size={13} /> Exit Session
          </button>

          <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:border-violet-500/10 dark:hover:border-violet-500/10 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/30 dark:border-zinc-800/40 text-slate-505 dark:text-slate-400 px-3 py-1 rounded-md uppercase tracking-wider font-outfit">
                QUESTION {currentIdx + 1} OF {totalQuestions}
              </span>
              <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-md font-outfit ${
                currentQuestion.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/20' :
                currentQuestion.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-150 dark:border-amber-900/20' :
                'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-150 dark:border-rose-900/20'
              }`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
            </div>

            <h2 className="text-base font-bold leading-relaxed text-slate-900 dark:text-white font-display">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2 border-t border-slate-150 dark:border-zinc-800/40 pt-4 mt-1">
              <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                <HelpCircle size={13} className="text-cyan-500" /> Key Topics to Touch Upon
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                  <span key={i} className="text-[9px] font-bold bg-cyan-50/60 text-cyan-705 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-900/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-500" />
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {isCurrentAnswered && (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-100/60 dark:border-emerald-900/30 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-450 animate-fade-in-up">
                <Check size={14} className="flex-shrink-0 text-emerald-500" />
                <span>Coding answer submitted successfully.</span>
              </div>
            )}
          </div>

          {/* Navigation actions */}
          <div className="flex justify-between items-center">
            <button 
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-650 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200"
              onClick={handlePrev} 
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {currentIdx < totalQuestions - 1 ? (
                <button 
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-650 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1"
                  onClick={handleNext}
                  disabled={!isCurrentAnswered}
                >
                  Next Question <ArrowRight size={13} />
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white disabled:opacity-40 text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center gap-1.5"
                  onClick={handleFinishInterview}
                  disabled={!allAnswered}
                >
                  <Award size={13} /> Complete Interview
                </button>
              )}
            </div>
          </div>

          {/* Webcam Panel stacked below */}
          <div className="w-full flex justify-center">
            <VideoRecorder 
              onRecordingComplete={handleRecordingComplete} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>

        {/* Right Column: Code Editor workspace panel */}
        <div className="flex-grow w-full lg:w-[55%] flex flex-col justify-start">
          <CodeEditor 
            value={code} 
            onChange={setCode} 
            language={codeLanguage} 
            onLanguageChange={setCodeLanguage} 
          />
        </div>
        
      </div>
    );
  }

  // Standard Layout for General/Behavioral questions
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-start font-sans">
      
      {/* Question panel */}
      <div className="flex flex-col gap-5 w-full">
        <button 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-violet-650 dark:text-slate-500 dark:hover:text-violet-400 transition-colors duration-205 w-fit"
          onClick={() => {
            if (confirm("Are you sure you want to exit? Current progress will be discarded.")) {
              router.push("/");
            }
          }}
        >
          <ArrowLeft size={13} /> Exit Session
        </button>

        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-5 hover:border-violet-500/10 dark:hover:border-violet-500/10 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/30 dark:border-zinc-800/40 text-slate-505 dark:text-slate-400 px-3 py-1 rounded-md uppercase tracking-wider font-outfit">
              QUESTION {currentIdx + 1} OF {totalQuestions}
            </span>
            <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-md font-outfit ${
              currentQuestion.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/20' :
              currentQuestion.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-150 dark:border-amber-900/20' :
              'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-150 dark:border-rose-900/20'
            }`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-bold leading-relaxed text-slate-900 dark:text-white font-display">
            {currentQuestion.text}
          </h2>

          <div className="flex flex-col gap-2 border-t border-slate-150 dark:border-zinc-800/40 pt-5 mt-2">
            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
              <HelpCircle size={13} className="text-cyan-500" /> Key Topics to Touch Upon
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                <span key={i} className="text-[10px] font-bold bg-cyan-50/60 text-cyan-705 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-900/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-500" />
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
          
          {isCurrentAnswered && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-100/60 dark:border-emerald-900/30 p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-450 animate-fade-in-up">
              <Check size={14} className="flex-shrink-0 text-emerald-500" />
              <span>Response successfully submitted & graded.</span>
            </div>
          )}
        </div>

        {/* Navigation actions */}
        <div className="flex justify-between items-center mt-2">
          <button 
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-650 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200"
            onClick={handlePrev} 
            disabled={currentIdx === 0}
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {currentIdx < totalQuestions - 1 ? (
              <button 
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-650 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1"
                onClick={handleNext}
                disabled={!isCurrentAnswered}
              >
                Next Question <ArrowRight size={13} />
              </button>
            ) : (
              <button 
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-750 text-white disabled:opacity-40 text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center gap-1.5"
                onClick={handleFinishInterview}
                disabled={!allAnswered}
              >
                <Award size={13} /> Complete Interview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video recorder panel */}
      <div className="w-full flex justify-center">
        <VideoRecorder 
          onRecordingComplete={handleRecordingComplete} 
          isProcessing={isProcessing} 
        />
      </div>
      
    </div>
  );
}

export default function InterviewRoom() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-bold text-slate-450">Loading interview components...</h3>
      </div>
    }>
      <InterviewRoomContent />
    </Suspense>
  );
}
