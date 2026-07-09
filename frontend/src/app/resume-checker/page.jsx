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
  "Mobile Engineer"
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
  if (score >= 85) return "text-emerald-500";
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
    return "bg-emerald-500/10 border-emerald-500/25 text-emerald-500";
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
      className="flex items-center gap-4 bg-slate-50/60 dark:bg-zinc-850/30 border border-slate-200/50 dark:border-zinc-800/40 p-4.5 rounded-2xl transition-all hover:border-[#D4AF37]/15"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`${label} compatibility rating: ${score}%`}
    >
      <div className="relative flex items-center justify-center w-14 h-14">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle className="text-slate-100 dark:text-zinc-800/40" strokeWidth={stroke} stroke="currentColor" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
          <circle className={getScoreStrokeColor(score)} strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <span className={`absolute text-xs font-black font-outfit ${getScoreColorClass(score)}`}>{score}%</span>
      </div>
      <div>
        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</h5>
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Compatibility Checked</span>
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-grow font-sans bg-grid relative overflow-hidden">
      
      {/* Glow highlight details */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Title Header */}
      <section className="flex flex-col gap-3 mb-12 animate-fade-in-up relative z-10">
        <div className="flex items-center gap-2 self-start px-3 py-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] uppercase tracking-wider font-extrabold">
          <Sparkles size={11} className="text-[#D4AF37] animate-pulse" />
          ATS Optimization Scanner
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display uppercase">
          Resume ATS Checker
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl leading-relaxed font-medium">
          Scan your resume against technical job roles. Receive scoring, identify missing keywords, evaluate metrics density, and optimize parsing layout formatting.
        </p>
      </section>

      {/* Main Container */}
      {!result && !loading && (
        <section className="max-w-3xl mx-auto glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md hover:border-[#D4AF37]/25 transition-all duration-300 animate-fade-in-up relative z-10">
          <div className="flex flex-col gap-6">
            
            {/* Target Role Selector Redesign */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-2">
                Select Target Job Role
              </label>
              
              <button
                type="button"
                className="w-full flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:border-[#D4AF37]/25 transition-colors cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{role}</span>
                <ChevronDown size={16} className={`text-slate-455 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-20 max-h-60 overflow-y-auto glass-panel bg-white/95 dark:bg-zinc-950/95 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl shadow-xl animate-fade-in-up p-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-left transition-all ${
                        role === r 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-black' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900/50 font-bold'
                      }`}
                      onClick={() => {
                        setRole(r);
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{r}</span>
                      {role === r && <Check size={14} className="text-[#D4AF37]" />}
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
              className="border-2 border-dashed border-slate-250/70 dark:border-zinc-800/65 hover:border-[#D4AF37]/45 dark:hover:border-[#D4AF37]/45 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 bg-slate-50/20 dark:bg-zinc-950/5 flex flex-col items-center gap-3 group relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx"
                className="hidden"
              />
              
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform duration-300">
                <UploadCloud size={24} />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-emerald-500 font-extrabold uppercase mt-1">
                    Ready to scan ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-200">
                    Drag and drop your resume file here
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                    Supports PDF, TXT, or DOCX formats (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-4 bg-rose-50/60 dark:bg-rose-955/20 border border-rose-200/50 dark:border-rose-900/35 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-450">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!file}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black py-3.5 rounded-xl text-xs shadow-md transition-all duration-355 disabled:opacity-40 disabled:shadow-none active:scale-[0.99] cursor-pointer"
            >
              Scan Resume <ArrowRight size={13} />
            </button>

          </div>
        </section>
      )}

      {/* Laser Scanning Screen */}
      {loading && (
        <section className="max-w-xl mx-auto glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center gap-6 animate-fade-in-up relative z-10">
          <div className="relative w-48 h-32 border border-slate-200/50 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 rounded-xl overflow-hidden shadow-inner flex items-center justify-center text-slate-400">
            <FileText size={44} className="animate-pulse text-[#D4AF37]/65" />
            <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-scanner-sweep shadow-[0_0_10px_#FFE492]" />
            <div className="absolute top-2 left-2 text-[8px] font-extrabold uppercase text-slate-400 dark:text-slate-500">Scanning Resume</div>
            <div className="absolute bottom-2 right-2 text-[8px] font-extrabold uppercase text-[#D4AF37]">ATS v1.2</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-slate-805 dark:text-slate-200 font-display">Analyzing Document Layout</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal max-w-[280px]">
              {SCAN_STEPS[scanStep]}
            </p>
          </div>

          <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500 ease-out"
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
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-sm hover:border-[#D4AF37]/15 transition-all duration-300 text-center flex flex-col items-center gap-5">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ATS Scorecard</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider border ${getVerdictStyle(result.verdict)}`}>
                  {result.verdict.toUpperCase()}
                </span>
              </div>

              {/* Big circular progress gauge */}
              <div className="relative flex items-center justify-center w-28 h-28 hover:scale-105 transition-transform duration-300">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                  <circle className="text-slate-100 dark:text-zinc-800/60" strokeWidth="7.5" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
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
                  <span className={`text-2xl font-black font-outfit ${getScoreColorClass(result.score)}`}>
                    {result.score}%
                  </span>
                  <span className="text-[7.5px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
                    MATCH INDEX
                  </span>
                </div>
              </div>

              {/* Hiring Probability */}
              <div>
                <div className="text-2xl font-black text-slate-905 dark:text-white font-outfit animate-pulse-slow">
                  {result.hiring_chance}%
                </div>
                <div className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500">
                  Target Interview Probability
                </div>
              </div>

              <div className="w-full border-t border-slate-100 dark:border-zinc-850/50 pt-4 flex gap-4 text-left justify-around text-xs">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-505 block">Evaluated Role</span>
                  <strong className="text-slate-800 dark:text-slate-200 mt-0.5 truncate block max-w-[150px] font-display">{role}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-505 block">Resume File</span>
                  <strong className="text-slate-800 dark:text-slate-200 mt-0.5 truncate block max-w-[120px] font-display">{file?.name}</strong>
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
              className="w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 text-slate-700 dark:text-slate-800 py-3 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer"
            >
              <RefreshCw size={13} /> Scan Another Resume
            </button>

          </div>

          {/* Right Audit Details */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full animate-fade-in-up">
            
            {/* Formatting Audit */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-sm hover:border-[#D4AF37]/15 transition-all duration-300">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <FileSpreadsheet size={15} className="text-[#D4AF37]" />
                Layout & Formatting Check
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-slate-655 dark:text-slate-400 bg-slate-50/50 dark:bg-zinc-950/30 p-4 rounded-2xl border border-slate-150 dark:border-zinc-850/20 font-medium">
                {result.formatting_check.feedback}
              </p>
            </div>

            {/* Keyword Density Checker */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-sm hover:border-[#D4AF37]/15 transition-all duration-300">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <BadgeCheck size={15} className="text-[#D4AF37]" />
                Role Keyword Matching
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-2">Identified Keywords ({result.keyword_check.found.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_check.found.length > 0 ? (
                      result.keyword_check.found.map((kw) => (
                        <span key={kw} className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg uppercase tracking-wider font-outfit">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic font-medium">No matching target keywords found.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-505 mb-2">Missing Keywords ({result.keyword_check.missing.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_check.missing.length > 0 ? (
                      result.keyword_check.missing.map((kw) => (
                        <span key={kw} className="text-[9px] font-black bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/30 dark:border-zinc-800/30 text-slate-450 dark:text-slate-455 px-2.5 py-1 rounded-lg uppercase tracking-wider font-outfit">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">All keywords matched!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantitative Impact Check */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-sm hover:border-[#D4AF37]/15 transition-all duration-300">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <BarChart2 size={15} className="text-[#D4AF37]" />
                Action Verbs & Impact Check
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-slate-655 dark:text-slate-400 bg-slate-50/50 dark:bg-zinc-950/30 p-4 rounded-2xl border border-slate-150 dark:border-zinc-850/20 font-medium">
                {result.impact_check.feedback}
              </p>
            </div>

            {/* Actionable Suggestions */}
            <div className="glass-panel bg-[#D4AF37]/5 dark:bg-zinc-900/40 border border-dashed border-[#D4AF37]/25 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-sm hover:border-dashed hover:border-[#D4AF37]/45 transition-all duration-350">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
                <ShieldAlert size={15} className="text-[#D4AF37]" />
                ATS Recommendations & Checklist
              </h3>
              <ul className="flex flex-col gap-3">
                {result.suggestions.map((s, idx) => (
                  <li key={idx} className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 flex items-start gap-2.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
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
