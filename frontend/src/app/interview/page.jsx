"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, HelpCircle, Check, Award, AlertCircle, Clock, Sparkles } from "lucide-react";
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

  // Session elapsed timer tracker
  const [elapsedTime, setElapsedTime] = useState(0);

  // Tick stopwatch timer when session launches
  useEffect(() => {
    let interval = null;
    if (!isConfiguring && !loading && !isProcessing) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConfiguring, loading, isProcessing]);

  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      const token = localStorage.getItem("token") || "";
      const uploadHeaders = {};
      if (token) {
        uploadHeaders["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: uploadHeaders,
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
      const token = localStorage.getItem("token") || "";
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/complete`, {
        method: "POST",
        headers
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

  // Render initialization room configurator
  if (isConfiguring) {
    const hasCachedKeywords = typeof window !== "undefined" && localStorage.getItem("coach_resume_keywords");
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-xl mx-auto font-sans w-full animate-fade-in-up relative select-none z-10">
        
        {/* Glowing aura accent details */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-[#DC9F85]/5 rounded-full filter blur-[90px] pointer-events-none" />

        <div className="w-full p-8 bg-[#181818] border border-[#66473B] rounded-[4px] shadow-xl hover:border-[#DC9F85] transition-all duration-300 relative overflow-hidden text-left">
          
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#DC9F85] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#B6A596]">Configure Sandbox</span>
          </div>

          <h2 className="text-xl font-bold text-[#EBDCC4] font-display mb-1.5 uppercase tracking-wide">
            Setup Interview Room
          </h2>
          <p className="text-xs text-[#B6A596] font-light mb-6">
            Configure your workspace parameters before launching the virtual mock session.
          </p>

          <div className="flex flex-col gap-5">
            {/* Display Selected Role */}
            <div className="bg-[#35211A]/20 border border-[#66473B] p-4.5 rounded-[4px] flex flex-col">
              <span className="text-[9px] font-mono font-bold text-[#66473B] uppercase tracking-widest block mb-1">Target Domain</span>
              <span className="text-sm font-bold text-[#EBDCC4] font-display">{role}</span>
            </div>

            {/* Resume Adaptation Toggle */}
            {hasCachedKeywords ? (
              <div className="flex items-center justify-between bg-[#35211A]/20 border border-[#66473B] p-4.5 rounded-[4px]">
                <div className="text-left">
                  <span className="text-[10.5px] font-bold text-[#EBDCC4] block">Adapt to Scanned Resume</span>
                  <span className="text-[9px] text-[#B6A596] font-light block mt-0.5 leading-snug">Prioritizes questions matching your resume keywords.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={useAdaptive} 
                  onChange={(e) => setUseAdaptive(e.target.checked)}
                  className="w-4 h-4 rounded-[2px] bg-[#181818] border-[#66473B] focus:ring-[#DC9F85]/50 cursor-pointer accent-[#DC9F85]"
                />
              </div>
            ) : (
              <div className="bg-[#181818] border border-dashed border-[#66473B] p-4.5 rounded-[4px] text-center">
                <span className="text-[10px] font-mono font-bold text-[#66473B] block uppercase tracking-wider">No Scanned Resume Found</span>
                <span className="text-[9px] text-[#B6A596] font-light block mt-1 leading-snug">Upload your resume in the ATS Checker first to enable adaptive questioning.</span>
              </div>
            )}

            {/* Language Selector */}
            {(role.includes("Software") || role.includes("Web") || role.includes("AI")) && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-[#66473B] uppercase tracking-widest">Default Coding Language</label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="text-xs bg-[#181818] border border-[#66473B] text-[#EBDCC4] rounded-[4px] px-3 py-2.5 focus:outline-none focus:border-[#DC9F85] cursor-pointer font-bold font-mono uppercase"
                >
                  <option value="python" className="bg-[#181818]">Python 3</option>
                  <option value="javascript" className="bg-[#181818]">JavaScript</option>
                  <option value="cpp" className="bg-[#181818]">C++ (GCC)</option>
                  <option value="java" className="bg-[#181818]">Java 17</option>
                </select>
              </div>
            )}

            <button 
              className="editorial-btn-primary mt-4 w-full py-3.5 rounded-[4px] text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              onClick={handleLaunch}
            >
              Launch Interview Room <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render processing/loading state
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 px-6 animate-fade-in-up font-sans select-none z-10">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-[#35211A] border-t-[#DC9F85] animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border border-[#DC9F85]/10 animate-pulse-slow" />
        </div>
        <h3 className="text-base font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Setting up interview room...</h3>
        <p className="text-xs text-[#B6A596] mt-2 text-center max-w-[280px] font-light">Initializing virtual camera feeds and seeding question databases</p>
      </div>
    );
  }

  // Render warning message screen
  if (errorMsg) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto animate-fade-in-up font-sans select-none z-10">
        <div className="bg-[#181818] border border-rose-950/40 p-8 rounded-[4px] text-center shadow-sm w-full">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-[#EBDCC4] font-display mb-2 uppercase tracking-wide">Initialization Failed</h3>
          <p className="text-xs text-[#B6A596] mb-6 leading-relaxed font-light">
            {errorMsg}
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

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const isCurrentAnswered = answeredMap[currentQuestion?.id];
  const allAnswered = questions.every((q) => answeredMap[q.id]);
  
  const isCodingQuestion = currentQuestion?.topic === "Coding Logic";

  // Shared status header container
  const renderHeader = () => (
    <div className="flex justify-between items-center w-full pb-4 border-b border-[#35211A] mb-6 font-sans">
      <button 
        className="flex items-center gap-1.5 text-xs font-bold text-[#B6A596] hover:text-[#DC9F85] transition-colors duration-205 cursor-pointer font-mono uppercase tracking-widest"
        onClick={() => {
          if (confirm("Are you sure you want to exit? Current progress will be discarded.")) {
            router.push("/");
          }
        }}
      >
        <ArrowLeft size={13} /> Exit Session
      </button>

      {/* Live stopwatch cap */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#35211A]/20 border border-[#66473B] text-[9.5px] font-bold font-mono uppercase tracking-widest text-[#B6A596]">
        <Clock size={11} className="text-[#DC9F85]" />
        <span>Session Time &bull; {formatSessionTime(elapsedTime)}</span>
      </div>
    </div>
  );

  // Split-Screen Layout for Coding Logic Questions
  if (isCodingQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-8 w-full flex-grow flex flex-col lg:flex-row gap-8 items-start font-sans animate-fade-in-up relative z-10 select-none">
        
        {/* Left Column: Question Statement + Webcam capturing panel */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6 flex-shrink-0 text-left">
          {renderHeader()}

          <div className="bg-[#181818] border border-[#66473B] p-6 rounded-[4px] flex flex-col gap-4 hover:border-[#DC9F85] transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold bg-[#35211A]/20 border border-[#66473B]/50 text-[#B6A596] px-3 py-1 rounded-[2px] uppercase tracking-widest font-mono">
                QUESTION {currentIdx + 1} OF {totalQuestions}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[2px] font-mono border ${
                currentQuestion.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                currentQuestion.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-455 border-rose-500/20'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            <h2 className="text-base md:text-lg font-bold leading-relaxed text-[#EBDCC4] font-display uppercase tracking-wide">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2 border-t border-[#35211A] pt-4 mt-1">
              <h4 className="text-[10px] font-mono font-bold text-[#66473B] flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle size={13} className="text-[#DC9F85]" /> Key Topics to Touch Upon
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                  <span key={i} className="text-[9px] font-mono font-bold bg-[#35211A]/20 text-[#B6A596] border border-[#66473B]/30 px-2.5 py-0.5 rounded-[2px] flex items-center gap-1.5 transition-colors hover:border-[#DC9F85]">
                    <span className="w-1 h-1 rounded-full bg-[#DC9F85]" />
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {isCurrentAnswered && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-[4px] flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 animate-fade-in-up">
                <Check size={14} className="flex-shrink-0 text-emerald-400" />
                <span>Coding answer submitted successfully.</span>
              </div>
            )}
          </div>

          {/* Navigation actions */}
          <div className="flex justify-between items-center font-sans">
            <button 
              className="px-5 py-2.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] disabled:opacity-40 text-xs font-bold rounded-[4px] transition-all duration-200 cursor-pointer font-mono uppercase tracking-widest"
              onClick={handlePrev} 
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {currentIdx < totalQuestions - 1 ? (
                <button 
                  className="px-5 py-2.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] disabled:opacity-40 text-xs font-bold rounded-[4px] transition-all duration-200 flex items-center gap-1 cursor-pointer font-mono uppercase tracking-widest"
                  onClick={handleNext}
                  disabled={!isCurrentAnswered}
                >
                  Next Question <ArrowRight size={13} />
                </button>
              ) : (
                <button 
                  className="editorial-btn-primary px-5 py-2.5 disabled:opacity-45 text-xs font-bold rounded-[4px] transition-all duration-305 flex items-center gap-1.5 cursor-pointer"
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
        <div className="flex-grow w-full lg:w-[55%] flex flex-col justify-start h-full self-stretch">
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-8 w-full flex-grow flex flex-col gap-4 font-sans animate-fade-in-up relative z-10 select-none">
      {renderHeader()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full text-left">
        {/* Left Column: Question Details */}
        <div className="flex flex-col gap-5 w-full">
          <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] flex flex-col gap-5 hover:border-[#DC9F85] transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold bg-[#35211A]/20 border border-[#66473B]/50 text-[#B6A596] px-3 py-1 rounded-[2px] uppercase tracking-widest font-mono">
                QUESTION {currentIdx + 1} OF {totalQuestions}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[2px] font-mono border ${
                currentQuestion.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                currentQuestion.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-455 border-rose-500/20'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-bold leading-relaxed text-[#EBDCC4] font-display uppercase tracking-wide">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2 border-t border-[#35211A] pt-5 mt-2">
              <h4 className="text-[10px] font-mono font-bold text-[#66473B] flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle size={13} className="text-[#DC9F85]" /> Key Topics to Touch Upon
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentQuestion.suggested_keywords.split(",").map((kw, i) => (
                  <span key={i} className="text-[9px] font-mono font-bold bg-[#35211A]/20 text-[#B6A596] border border-[#66473B]/30 px-2.5 py-0.5 rounded-[2px] flex items-center gap-1.5 transition-colors hover:border-[#DC9F85]">
                    <span className="w-1 h-1 rounded-full bg-[#DC9F85]" />
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {isCurrentAnswered && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-[4px] flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 animate-fade-in-up">
                <Check size={14} className="flex-shrink-0 text-emerald-400" />
                <span>Response successfully submitted & graded.</span>
              </div>
            )}
          </div>

          {/* Navigation actions */}
          <div className="flex justify-between items-center font-sans">
            <button 
              className="px-5 py-2.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] disabled:opacity-40 text-xs font-bold rounded-[4px] transition-all duration-200 cursor-pointer font-mono uppercase tracking-widest"
              onClick={handlePrev} 
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              {currentIdx < totalQuestions - 1 ? (
                <button 
                  className="px-5 py-2.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] disabled:opacity-40 text-xs font-bold rounded-[4px] transition-all duration-200 flex items-center gap-1 cursor-pointer font-mono uppercase tracking-widest"
                  onClick={handleNext}
                  disabled={!isCurrentAnswered}
                >
                  Next Question <ArrowRight size={13} />
                </button>
              ) : (
                <button 
                  className="editorial-btn-primary px-5 py-2.5 disabled:opacity-45 text-xs font-bold rounded-[4px] transition-all duration-305 flex items-center gap-1.5 cursor-pointer"
                  onClick={handleFinishInterview}
                  disabled={!allAnswered}
                >
                  <Award size={13} /> Complete Interview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Video recorder camera viewport */}
        <div className="w-full flex justify-center self-stretch">
          <VideoRecorder 
            onRecordingComplete={handleRecordingComplete} 
            isProcessing={isProcessing} 
          />
        </div>
      </div>
      
    </div>
  );
}

export default function InterviewRoom() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col items-center justify-center py-24 font-sans select-none z-10">
        <div className="w-10 h-10 border-4 border-[#35211A] border-t-[#DC9F85] rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-bold text-[#B6A596] font-display uppercase tracking-wider">Loading interview components...</h3>
      </div>
    }>
      <InterviewRoomContent />
    </Suspense>
  );
}
