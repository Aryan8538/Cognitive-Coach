"use client";

import { useEffect, useState, Suspense, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, HelpCircle, Check, Award, AlertCircle } from "lucide-react";
import VideoRecorder from "@/components/VideoRecorder";
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

  useEffect(() => {
    async function initializeSession() {
      try {
        const sessionRes = await fetch(`${API_BASE_URL}/api/interviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
  }, [role]);

  const handleRecordingComplete = async (videoBlob: Blob, durationSeconds: number) => {
    if (!interviewId || questions.length === 0) return;
    
    setIsProcessing(true);
    const question = questions[currentIdx];
    
    const formData = new FormData();
    formData.append("duration", durationSeconds.toString());
    formData.append("video", videoBlob, "video.webm");

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
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin mb-5" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Setting up interview sandbox...</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Initializing virtual camera feeds and seeding question databases</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto">
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-rose-200/50 dark:border-rose-950/20 p-8 rounded-2xl text-center shadow-sm w-full">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2.5">Initialization Failed</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {errorMsg}
          </p>
          <button className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all duration-200" onClick={() => router.push("/")}>
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

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 w-full flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      {/* Question panel */}
      <div className="flex flex-col gap-5">
        <button 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400 transition-colors duration-200"
          onClick={() => {
            if (confirm("Are you sure you want to exit? Current progress will be discarded.")) {
              router.push("/");
            }
          }}
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/30 dark:border-zinc-800/40 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-md">
              QUESTION {currentIdx + 1} OF {totalQuestions}
            </span>
            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${
              currentQuestion.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
              currentQuestion.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' :
              'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
            }`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-bold leading-relaxed text-slate-900 dark:text-white">
            {currentQuestion.text}
          </h2>

          <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-zinc-800/50 pt-5 mt-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-cyan-500" /> Key Topics to Touch Upon
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                <span key={i} className="text-[10px] font-bold bg-cyan-50/60 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-100/60 dark:border-cyan-950/30 px-2.5 py-0.5 rounded-full">
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
          
          {isCurrentAnswered && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 animate-fade-in-up">
              <Check size={14} className="flex-shrink-0" />
              <span>Response successfully submitted & graded.</span>
            </div>
          )}
        </div>

        {/* Navigation actions */}
        <div className="flex justify-between items-center mt-2">
          <button 
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200"
            onClick={handlePrev} 
            disabled={currentIdx === 0}
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {currentIdx < totalQuestions - 1 ? (
              <button 
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800/60 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-slate-50 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1"
                onClick={handleNext}
                disabled={!isCurrentAnswered}
              >
                Next Question <ArrowRight size={13} />
              </button>
            ) : (
              <button 
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white disabled:opacity-40 text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 transition-all duration-200 flex items-center gap-1.5"
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
      <VideoRecorder 
        onRecordingComplete={handleRecordingComplete} 
        isProcessing={isProcessing} 
      />
      
    </div>
  );
}

export default function InterviewRoom() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20">
        <h3 className="text-sm font-bold text-slate-400">Loading interview components...</h3>
      </div>
    }>
      <InterviewRoomContent />
    </Suspense>
  );
}
