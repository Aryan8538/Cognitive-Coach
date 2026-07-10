"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, UploadCloud, AlertTriangle, ArrowRight, RefreshCw, BarChart2, ShieldAlert, BadgeCheck, FileSpreadsheet, ChevronDown, Check } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

// Hoist constants and helper utilities to top scope to adhere to lint guidelines
const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Full Stack Web Developer",
  "AI Engineer",
  "Data Scientist",
  "IoT Engineer",
  "DevOps Engineer",
  "Cybersecurity Engineer",
  "Mobile Engineer",
  "HR & Behavioral"
];

const SCAN_STEPS = [
  "Uploading document to parser...",
  "Extracting plain text layout and paragraphs...",
  "Auditing section headings and page boundaries...",
  "Matching skills keywords against target SDE profiles...",
  "Evaluating quantitative impact and action descriptors...",
  "Compiling final ATS compatibility reports..."
];

const getScoreColorClass = (score) => {
  if (score >= 85) return "text-emerald-450";
  if (score >= 70) return "text-amber-500";
  return "text-rose-500";
};

const getScoreStrokeColor = (score) => {
  if (score >= 85) return "stroke-emerald-500";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-rose-500";
};

const getVerdictStyle = (verdict) => {
  const v = verdict.toLowerCase();
  if (v.includes("strong") || v.includes("expert")) {
    return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
  }
  if (v.includes("good") || v.includes("lean")) {
    return "bg-amber-500/10 border-amber-500/25 text-amber-500";
  }
  return "bg-rose-500/10 border-rose-500/25 text-rose-500";
};

function CircularProgress({ score, label }) {
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="flex items-center gap-4 bg-[#181818] border border-[#66473B] p-4.5 rounded-[4px] transition-all hover:border-[#DC9F85]"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`${label} compatibility rating: ${score}%`}
    >
      <div className="relative flex items-center justify-center w-14 h-14">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle className="text-slate-100 dark:text-zinc-800/40" strokeWidth={stroke} stroke="transparent" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
          <circle className={getScoreStrokeColor(score)} strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <span className={`absolute text-xs font-bold font-mono ${getScoreColorClass(score)}`}>{score}%</span>
      </div>
      <div>
        <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#B6A596]">{label}</h5>
        <span className="text-[11px] font-medium text-[#EBDCC4]">Compatibility Checked</span>
      </div>
    </div>
  );
}

export default function ResumeCheckerPage() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Custom dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Increment scanning steps simulation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg(null);
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "txt" && ext !== "docx") {
      setErrorMsg("Unsupported file type. Please upload a PDF, TXT, or DOCX document.");
      return;
    }
    setFile(selectedFile);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setScanStep(0);
    setResult(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/check`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "ATS Resume Scan failed.");
      }

      const data = await res.json();
      if (data.keyword_check && Array.isArray(data.keyword_check.found)) {
        localStorage.setItem("coach_resume_keywords", data.keyword_check.found.join(","));
      }
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Connection failure with the ATS server.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-12 w-full flex-grow font-sans relative overflow-hidden select-none">
      
      {/* Warm Rust glow highlight detail */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#DC9F85]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Title Header */}
      <section className="flex flex-col gap-3 mb-12 animate-fade-in-up relative z-10 text-left">
        <div className="flex items-center gap-2 self-start px-3 py-1 rounded-[4px] border border-[#66473B] bg-[#35211A]/20 text-[#DC9F85] text-[10px] uppercase tracking-[0.15em] font-mono font-bold">
          <Sparkles size={11} className="text-[#DC9F85] animate-pulse" />
          ATS Optimization Scanner
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#EBDCC4] font-display uppercase">
          Resume ATS Checker
        </h1>
        <p className="text-[#B6A596] text-sm max-w-3xl leading-relaxed font-light">
          Scan your resume against technical job roles. Receive scoring, identify missing keywords, evaluate metrics density, and optimize parsing layout formatting.
        </p>
      </section>

      {/* Main Form Container */}
      {!result && !loading && (
        <section className="max-w-3xl mx-auto p-6 md:p-8 bg-[#181818] border border-[#66473B] rounded-[4px] shadow-sm hover:border-[#DC9F85] transition-all duration-300 animate-fade-in-up relative z-10">
          <div className="flex flex-col gap-6">
            
            {/* Target Role Selector Redesign */}
            <div className="relative text-left" ref={dropdownRef}>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#66473B] mb-2 font-mono">
                Select Target Job Role
              </label>
              
              <button
                type="button"
                className="w-full flex justify-between items-center px-4 py-3 bg-[#181818] border border-[#66473B] rounded-[4px] text-sm font-mono text-[#EBDCC4] hover:border-[#DC9F85] transition-colors cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{role}</span>
                <ChevronDown size={16} className={`text-[#B6A596] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-20 max-h-60 overflow-y-auto bg-[#181818] border border-[#66473B] rounded-[4px] shadow-2xl animate-fade-in-up p-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[2px] text-xs text-left transition-all ${
                        role === r 
                          ? 'bg-[#35211A] text-[#DC9F85] font-bold' 
                          : 'text-[#B6A596] hover:bg-[#35211A]/30 hover:text-[#EBDCC4] font-medium'
                      }`}
                      onClick={() => {
                        setRole(r);
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{r}</span>
                      {role === r && <Check size={14} className="text-[#DC9F85]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Block */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#66473B] hover:border-[#DC9F85] rounded-[4px] p-10 text-center cursor-pointer transition-all duration-300 bg-transparent flex flex-col items-center gap-3 group relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx"
                className="hidden"
              />
              
              <div className="w-12 h-12 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] flex items-center justify-center text-[#DC9F85] group-hover:scale-105 transition-transform duration-300">
                <UploadCloud size={24} />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-[#EBDCC4]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-[#DC9F85] font-mono tracking-wider font-extrabold uppercase mt-1">
                    Ready to scan ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-[#EBDCC4]">
                    Drag and drop your resume file here
                  </p>
                  <p className="text-xs text-[#B6A596] font-light mt-1 leading-normal">
                    Supports PDF, TXT, or DOCX formats (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-4 bg-rose-955/20 border border-rose-900/40 rounded-[4px] text-xs font-mono text-rose-400">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!file}
              className="w-full flex items-center justify-center gap-2 bg-[#DC9F85] hover:bg-[#EBDCC4] text-[#181818] font-bold py-3.5 rounded-[4px] text-xs transition-all duration-300 disabled:opacity-40 active:scale-[0.99] cursor-pointer font-display uppercase tracking-widest"
            >
              Scan Resume <ArrowRight size={13} />
            </button>

          </div>
        </section>
      )}

      {/* Laser Scanning Screen */}
      {loading && (
        <section className="max-w-xl mx-auto p-8 bg-[#181818] border border-[#66473B] rounded-[4px] text-center flex flex-col items-center gap-6 animate-fade-in-up relative z-10">
          <div className="relative w-48 h-32 border border-[#66473B] bg-[#35211A]/20 rounded-[4px] overflow-hidden flex items-center justify-center text-[#B6A596]">
            <FileText size={44} className="animate-pulse text-[#DC9F85]/65" />
            <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#DC9F85] to-transparent animate-scanner-sweep shadow-[0_0_10px_rgba(220,159,133,0.4)]" />
            <div className="absolute top-2 left-2 text-[8px] font-mono font-bold uppercase text-[#B6A596]">Scanning Resume</div>
            <div className="absolute bottom-2 right-2 text-[8px] font-mono font-bold uppercase text-[#DC9F85]">ATS v1.2</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Analyzing Document Layout</h3>
            <p className="text-xs text-[#B6A596] leading-normal max-w-[280px] font-light">
              {SCAN_STEPS[scanStep]}
            </p>
          </div>

          <div className="w-full h-1 bg-[#35211A] rounded-[2px] overflow-hidden">
            <div 
              className="h-full bg-[#DC9F85] transition-all duration-500 ease-out"
              style={{ width: `${((scanStep + 1) / SCAN_STEPS.length) * 100}%` }}
            />
          </div>
        </section>
      )}

      {/* Results Display */}
      {result && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up relative z-10">
          
          {/* Left Summary Dashboard */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Overall Scorecard */}
            <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] transition-all duration-300 text-center flex flex-col items-center gap-5 hover:border-[#DC9F85]">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-mono text-[#B6A596] uppercase tracking-widest">ATS Scorecard</span>
                <span className={`px-2.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold tracking-wider border ${getVerdictStyle(result.verdict)}`}>
                  {result.verdict.toUpperCase()}
                </span>
              </div>

              {/* Big circular progress gauge */}
              <div className="relative flex items-center justify-center w-28 h-28 hover:scale-105 transition-transform duration-300">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                   <circle className="text-slate-100 dark:text-zinc-800/60" strokeWidth="7.5" stroke="transparent" fill="transparent" r="38" cx="48" cy="48" />
                  <circle
                    className={`${getScoreStrokeColor(result.score)} progress-ring-circle`}
                    strokeWidth="7.5"
                    strokeDasharray={`${2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                    style={{ strokeDashoffset: (2 * Math.PI * 38) - (result.score / 100) * (2 * Math.PI * 38) }}
                    strokeLinecap="round"
                    fill="transparent"
                    r="38"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-2xl font-bold font-mono ${getScoreColorClass(result.score)}`}>
                    {result.score}%
                  </span>
                  <span className="text-[7.5px] uppercase tracking-widest font-mono text-[#B6A596]">
                    MATCH INDEX
                  </span>
                </div>
              </div>

              {/* Hiring Probability */}
              <div>
                <div className={`text-2xl font-bold font-mono ${getScoreColorClass(result.score)} animate-pulse`}>
                  {result.hiring_chance}%
                </div>
                <div className="text-[9px] uppercase tracking-widest font-mono text-[#B6A596]">
                  Target Interview Probability
                </div>
              </div>

              <div className="w-full border-t border-[#35211A] pt-4 flex gap-4 text-left justify-around text-xs font-mono">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#66473B] block">Evaluated Role</span>
                  <strong className="text-[#EBDCC4] mt-0.5 truncate block max-w-[150px] font-display">{role}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#66473B] block">Resume File</span>
                  <strong className="text-[#EBDCC4] mt-0.5 truncate block max-w-[120px] font-display">{file?.name}</strong>
                </div>
              </div>
            </div>

            {/* Circular Progress list */}
            <div className="flex flex-col gap-3">
              <CircularProgress score={result.formatting_check.score} label="Formatting & Headers" />
              <CircularProgress score={result.keyword_check.score} label="Keyword Relevance" />
              <CircularProgress score={result.impact_check.score} label="Quantitative Impact" />
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] py-3 rounded-[4px] text-xs font-bold transition-all active:scale-98 cursor-pointer font-mono uppercase tracking-widest"
            >
              <RefreshCw size={13} /> Scan Another Resume
            </button>

          </div>

          {/* Right Audit Details */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full animate-fade-in-up text-left">
            
            {/* Formatting Audit */}
            <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] transition-all duration-300 hover:border-[#DC9F85]">
              <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <FileSpreadsheet size={15} className="text-[#DC9F85]" />
                Layout & Formatting Check
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-[#B6A596] bg-[#35211A]/20 p-4 rounded-[4px] border border-[#66473B]/50 font-light">
                {result.formatting_check.feedback}
              </p>
            </div>

            {/* Keyword Density Checker */}
            <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] transition-all duration-300 hover:border-[#DC9F85]">
              <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <BadgeCheck size={15} className="text-[#DC9F85]" />
                Role Keyword Matching
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#66473B] mb-2 font-mono">Identified Keywords ({result.keyword_check.found.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_check.found.length > 0 ? (
                       result.keyword_check.found.map((kw) => (
                        <span key={kw} className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-mono">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#B6A596] italic font-light">No matching target keywords found.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#66473B] mb-2 font-mono">Missing Keywords ({result.keyword_check.missing.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_check.missing.length > 0 ? (
                       result.keyword_check.missing.map((kw) => (
                        <span key={kw} className="text-[9px] font-bold bg-[#35211A]/20 border border-[#66473B]/30 text-[#B6A596] px-2.5 py-1 rounded-[2px] uppercase tracking-wider font-mono">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">All keywords matched!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantitative Impact Check */}
            <div className="bg-[#181818] border border-[#66473B] p-6 md:p-8 rounded-[4px] transition-all duration-300 hover:border-[#DC9F85]">
              <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <BarChart2 size={15} className="text-[#DC9F85]" />
                Action Verbs & Impact Check
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-[#B6A596] bg-[#35211A]/20 p-4 rounded-[4px] border border-[#66473B]/50 font-light">
                {result.impact_check.feedback}
              </p>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-[#35211A]/10 border border-dashed border-[#66473B] p-6 md:p-8 rounded-[4px] transition-all duration-350 hover:border-[#DC9F85]">
              <h3 className="text-xs font-bold text-[#EBDCC4] mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <ShieldAlert size={15} className="text-[#DC9F85]" />
                ATS Recommendations & Checklist
              </h3>
              <ul className="flex flex-col gap-3">
                {result.suggestions.map((s, idx) => (
                  <li key={idx} className="text-xs leading-relaxed text-[#B6A596] flex items-start gap-2.5 font-light">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#DC9F85] mt-1.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </section>
      )}

    </div>
  );
}
