"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, HelpCircle, Check, Award, AlertCircle } from "lucide-react";
import VideoRecorder from "@/components/VideoRecorder";
import CodeEditor, { TEMPLATES } from "@/components/CodeEditor";
import { API_BASE_URL } from "@/utils/config";

function InterviewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Software Engineer";

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [useAdaptive, setUseAdaptive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answeredMap, setAnsweredMap] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  // Code editor states
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");

  const handleLaunch = async () => {
    setIsConfiguring(false);
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { 
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

      let questionsUrl = `${API_BASE_URL}/api/questions?role=${encodeURIComponent(role)}`;
      if (useAdaptive) {
        const keywords = localStorage.getItem("coach_resume_keywords") || "";
        if (keywords) {
          questionsUrl += `&keywords=${encodeURIComponent(keywords)}`;
        }
      }

      const qRes = await fetch(questionsUrl);
      if (!qRes.ok) throw new Error("Failed to load role questions.");
      const qData = await qRes.json();
      
      if (qData.length === 0) {
        throw new Error("No questions available for this role inside the database.");
      }
      setQuestions(qData);
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.message || "An error occurred during interview startup.");
    } finally {
      setLoading(false);
    }
  };

  // Reset editor text when question changes or on initialization
  useEffect(() => {
    if (questions.length > 0) {
      setCode(TEMPLATES[codeLanguage] || "");
    }
  }, [currentIdx, codeLanguage, questions.length]);

  const handleRecordingComplete = async (videoBlob, durationSeconds) => {
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
    } catch (err) {
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

  if (isConfiguring) {
    const hasCachedKeywords = typeof window !== "undefined" && localStorage.getItem("coach_resume_keywords");
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-xl mx-auto font-sans w-full">
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 p-8 rounded-2xl shadow-sm hover:border-violet-500/20 transition-all duration-300 w-full animate-fade-in-up">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display mb-2 uppercase tracking-wide">
            Setup Interview Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Configure your workspace parameters before launching the virtual mock session.
          </p>

          <div className="flex flex-col gap-5">
            {/* Display Selected Role */}
            <div className="bg-slate-50/50 dark:bg-zinc-850/40 border border-slate-150 dark:border-zinc-800/50 p-4 rounded-xl">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Target Domain</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{role}</span>
            </div>

            {/* Resume Adaptation Toggle */}
            {hasCachedKeywords ? (
              <div className="flex items-center justify-between bg-slate-50/50 dark:bg-zinc-850/40 border border-slate-150 dark:border-zinc-800/50 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-250 block">Adapt to Scanned Resume</span>
                  <span className="text-[9px] text-slate-455 dark:text-slate-500 block mt-0.5">Prioritizes questions matching your resume keywords.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={useAdaptive} 
                  onChange={(e) => setUseAdaptive(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-650 bg-slate-100 border-slate-350 focus:ring-violet-500 cursor-pointer"
                />
              </div>
            ) : (
              <div className="bg-slate-50/20 dark:bg-zinc-850/10 border border-dashed border-slate-200 dark:border-zinc-800/40 p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">No Scanned Resume Found</span>
                <span className="text-[9px] text-slate-400/80 dark:text-slate-550 block mt-0.5 font-medium">Upload your resume in the ATS Checker first to enable adaptive questioning.</span>
              </div>
            )}

            {/* Language Selector */}
            {(role.includes("Software") || role.includes("Web") || role.includes("AI")) && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-550 uppercase tracking-wide">Default Coding Language</label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500/50 cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java 17</option>
                </select>
              </div>
            )}

            <button 
              className="mt-4 w-full bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
              onClick={handleLaunch}
            >
              Launch Interview Room <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200/25 border-t-violet-650 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border border-violet-500/10 animate-pulse-slow" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">Setting up interview sandbox...</h3>
        <p className="text-xs text-slate-405 dark:text-slate-500 mt-2 text-center max-w-[280px]">Initializing virtual camera feeds and seeding question databases</p>
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

            <h2 className="text-base font-bold leading-relaxed text-slate-909 dark:text-white font-display">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2 border-t border-slate-150 dark:border-zinc-800/40 pt-4 mt-1">
              <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                <HelpCircle size={13} className="text-cyan-505" /> Key Topics to Touch Upon
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                  <span key={i} className="text-[9px] font-bold bg-cyan-50/60 text-cyan-705 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-900/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-505" />
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
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-605 hover:to-indigo-700 text-white disabled:opacity-40 text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
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

          <h2 className="text-lg md:text-xl font-bold leading-relaxed text-slate-909 dark:text-white font-display">
            {currentQuestion.text}
          </h2>

          <div className="flex flex-col gap-2 border-t border-slate-150 dark:border-zinc-800/40 pt-5 mt-2">
            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
              <HelpCircle size={13} className="text-cyan-505" /> Key Topics to Touch Upon
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                <span key={i} className="text-[10px] font-bold bg-cyan-50/60 text-cyan-705 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-900/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-505" />
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
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-750 text-white disabled:opacity-40 text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-650 rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-bold text-slate-450">Loading interview components...</h3>
      </div>
    }>
      <InterviewRoomContent />
    </Suspense>
  );
}
