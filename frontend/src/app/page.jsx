"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, Users, BarChart3, Activity, AlertTriangle, 
  ArrowRight, Play, CheckCircle, Cpu, Cloud, Shield, 
  ChevronDown, Star, Sparkles, Video, ArrowUpRight, GraduationCap, 
  MessageSquare, Flame
} from "lucide-react";
import { API_BASE_URL } from "@/utils/config";
import HeroAnimation from "@/components/HeroAnimation";

// Redesign circular gauge rings
const CircularGauge = ({ score, label, color }) => {
  const radius = 34;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle
            className="text-slate-100 dark:text-zinc-850"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          {/* Progress ring */}
          <circle
            className="progress-ring-circle transition-all duration-1000"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            stroke={color}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
        </svg>
        {/* Centered Percentage */}
        <span className="absolute text-sm font-black text-slate-800 dark:text-white font-outfit">
          {score}%
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  
  // Dashboard & Auth states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);

  // Flow Toggle: Landing Page vs. Workspace Dashboard
  const [inSandbox, setInSandbox] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Live Demo Simulation State
  const [demoStep, setDemoStep] = useState(0);
  const demoIntervalRef = useRef(null);

  // 1. Check local session and sandbox states on mount
  useEffect(() => {
    const checkAuthAndSandbox = () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const isSandboxActive = localStorage.getItem("guest_sandbox") === "true";
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
          setInSandbox(true);
        } catch (e) {
          console.warn("Failed to parse user session in dashboard", e);
        }
      } else if (isSandboxActive) {
        setInSandbox(true);
        setUser(null);
      } else {
        setInSandbox(false);
        setUser(null);
      }
    };

    checkAuthAndSandbox();

    // Listen to tab storage changes or custom sandbox events
    const handleSandboxChange = () => {
      checkAuthAndSandbox();
      fetchStatsAndInterviews();
    };
    window.addEventListener("sandbox-change", handleSandboxChange);
    window.addEventListener("storage", handleSandboxChange);

    async function fetchStatsAndInterviews() {
      const token = localStorage.getItem("token") || "";
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Check backend health
      try {
        const health = await fetch(`${API_BASE_URL}/health`);
        setBackendOffline(!health.ok);
      } catch (err) {
        console.warn("Backend health check failed", err);
        setBackendOffline(true);
      }

      try {
        // Fetch dashboard stats
        const res = await fetch(`${API_BASE_URL}/api/dashboard-stats`, { headers });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }

        // Fetch user practice interviews history
        if (token) {
          const interviewsRes = await fetch(`${API_BASE_URL}/api/interviews`, { headers });
          if (interviewsRes.ok) {
            const interviewsData = await interviewsRes.json();
            setInterviews(interviewsData);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatsAndInterviews();

    return () => {
      window.removeEventListener("sandbox-change", handleSandboxChange);
      window.removeEventListener("storage", handleSandboxChange);
    };
  }, []);

  // 2. Interactive AI Webcam Demo loop animation
  useEffect(() => {
    // Progress the demo slides every 4 seconds to animate speech checks
    demoIntervalRef.current = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 5);
    }, 4500);

    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  // Define interview practice roles
  const roles = [
    {
      id: "Software Engineer",
      title: "Software Engineer",
      icon: <Terminal size={18} />,
      desc: "Practice system architectural design and coding logic explanation. Standard questions cover scalability, cycle detection, and key/value caching.",
      gradient: "from-[#6366f1] to-blue-500 dark:from-[#D4AF37] dark:to-[#FFE492]",
      topics: ["System Design", "Coding Logic"]
    },
    {
      id: "Product Manager",
      title: "Product Manager",
      icon: <Users size={18} />,
      desc: "Refine product lifecycle strategy, market metrics, and user prioritization. Questions test pricing launches and driver metrics.",
      gradient: "from-cyan-500 to-sky-500 dark:from-slate-400 dark:to-slate-300",
      topics: ["Product Strategy", "Growth Metrics"]
    },
    {
      id: "Full Stack Web Developer",
      title: "Full Stack Web Developer",
      icon: <Terminal size={18} />,
      desc: "Practice building full-stack REST APIs, state management, and database query optimization. Focuses on pagination, security protocols, and API latency.",
      gradient: "from-emerald-500 to-teal-500 dark:from-zinc-400 dark:to-zinc-300",
      topics: ["REST APIs", "Pagination Logic"]
    },
    {
      id: "AI Engineer",
      title: "AI Engineer",
      icon: <Cpu size={18} />,
      desc: "Practice interviews focused on deep learning, neural network architectures, and LLMs. Questions cover transformer mechanisms, fine-tuning, and compute bounds.",
      gradient: "from-purple-500 to-[#6366f1] dark:from-[#D4AF37] dark:to-[#FFE492]",
      topics: ["Deep Learning", "LLM Fine-Tuning"]
    },
    {
      id: "Data Scientist",
      title: "Data Scientist",
      icon: <BarChart3 size={18} />,
      desc: "Practice statistical modeling, experimental design (A/B testing), and data pipelines. Questions test regression bounds, bias-variance, and SQL transforms.",
      gradient: "from-rose-500 to-orange-500 dark:from-zinc-450 dark:to-zinc-300",
      topics: ["A/B Testing", "Feature Engineering"]
    },
    {
      id: "IoT Engineer",
      title: "IoT Engineer",
      icon: <Activity size={18} />,
      desc: "Prepare for hardware-software integration, low-power edge computing, and protocols. Tests cover MQTT routing, sensor polling rates, and firmware design.",
      gradient: "from-cyan-500 to-emerald-500 dark:from-slate-400 dark:to-slate-300",
      topics: ["Firmware Design", "Edge Computing"]
    },
    {
      id: "DevOps Engineer",
      title: "DevOps Engineer",
      icon: <Cloud size={18} />,
      desc: "Master continuous integration, infrastructure as code (IaC), container orchestration, and cloud deployment pipelines. Practice Docker, Kubernetes, and Terraform.",
      gradient: "from-blue-500 to-cyan-500 dark:from-[#D4AF37] dark:to-[#FFE492]",
      topics: ["Kubernetes", "CI/CD Pipelines"]
    },
    {
      id: "Cybersecurity Engineer",
      title: "Cybersecurity Engineer",
      icon: <Shield size={18} />,
      desc: "Evaluate network security protocol design, penetration testing methodology, threat modeling, and encryption standards. Practice cross-site security.",
      gradient: "from-red-500 to-rose-500 dark:from-zinc-450 dark:to-zinc-300",
      topics: ["Threat Modeling", "Penetration Testing"]
    }
  ];

  const handleStartSession = (roleName) => {
    router.push(`/interview?role=${encodeURIComponent(roleName)}`);
  };

  const handleEnterSandbox = () => {
    localStorage.setItem("guest_sandbox", "true");
    setInSandbox(true);
    // Alert navbar to update links immediately
    window.dispatchEvent(new Event("sandbox-change"));
    router.push("/");
  };

  // Render diagnostics line graph (SVG)
  const renderTrendChart = () => {
    if (!stats || stats.filler_words_trend.length === 0 || stats.filler_words_trend[0].date === "No Data") {
      return (
        <div className="flex items-center justify-center h-44 text-xs text-slate-400 dark:text-slate-500 font-sans">
          No historical data available. Complete an interview to see your pacing trend.
        </div>
      );
    }

    const trend = stats.filler_words_trend;
    const padding = 30;
    const width = 500;
    const height = 180;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = trend.map((t) => parseFloat(t.count));
    const maxValue = Math.max(...values, 8);

    const points = trend.map((t, index) => {
      const x = padding + (index / (trend.length - 1 || 1)) * chartWidth;
      const y = height - padding - (parseFloat(t.count) / maxValue) * chartHeight;
      return { x, y, ...t };
    });

    const pathD = points.reduce((acc, p, index) => {
      return acc + `${index === 0 ? "M" : "L"} ${p.x} ${p.y} `;
    }, "");

    const areaD = pathD + `L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="relative w-full overflow-hidden">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
            <filter id="pathShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.2" />
            </filter>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(212,175,55,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding - chartHeight / 2} x2={width - padding} y2={height - padding - chartHeight / 2} stroke="rgba(212,175,55,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(212,175,55,0.12)" />
          
          {points.map((p, idx) => (
            <line key={`grid-${idx}`} x1={p.x} y1={p.y} x2={p.x} y2={height - padding} stroke="rgba(212,175,55,0.06)" strokeDasharray="2" />
          ))}

          <path d={areaD} fill="url(#chartGlow)" className="animate-chart-area" />
          <path d={pathD} fill="none" stroke="#D4AF37" strokeWidth="2" filter="url(#pathShadow)" strokeLinecap="round" strokeLinejoin="round" className="animate-chart-line" />
          {points.map((p, idx) => (
            <g 
              key={idx} 
              className="group/dot cursor-pointer animate-chart-dot"
              style={{
                transformOrigin: `${p.x}px ${p.y}px`,
                animationDelay: `${0.6 + idx * 0.15}s`
              }}
            >
              <circle cx={p.x} cy={p.y} r="4" fill="#030303" stroke="#D4AF37" strokeWidth="2" className="transition-all duration-300 group-hover/dot:stroke-yellow-400" />
              <text x={p.x} y={p.y - 12} fontSize="9" className="fill-slate-900 dark:fill-white font-extrabold" textAnchor="middle">
                {p.count}
              </text>
              <text x={p.x} y={height - padding + 16} fontSize="8.5" className="fill-slate-400 dark:fill-slate-500 font-semibold" textAnchor="middle">
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };



  // Derive pacing status metrics
  const pacingWpm = stats ? parseFloat(stats.average_wpm) : 0;
  const hasPacingData = !loading && stats && pacingWpm > 0;
  const pacingOnTarget = pacingWpm >= 110 && pacingWpm <= 140;
  const pacingNote = !hasPacingData
    ? {
        style: "bg-slate-50/50 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-800/40 text-slate-450 dark:text-slate-400",
        iconClass: "text-slate-400",
        text: "Complete an interview to measure pacing rate."
      }
    : pacingOnTarget
    ? {
        style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450",
        iconClass: "text-emerald-500",
        text: "Speech rate meets professional fluency benchmarks."
      }
    : {
        style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-[#D4AF37]",
        iconClass: "text-[#D4AF37]",
        text: pacingWpm < 110
          ? "Slightly under conversational standard — try speaking faster."
          : "Slightly above conversational standard — try speaking slower."
      };

  // --- RENDER VISITOR LANDING PAGE ---
  if (!inSandbox) {
    return (
      <div className="w-full flex-grow font-sans bg-grid">
        
        {/* Subtle glow background blobs */}
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-6 items-start text-left max-w-xl animate-fade-in-up">
            
            {/* Glowing Accent Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-[#D4AF37] dark:text-[#FFE492] text-[10px] uppercase tracking-wider font-extrabold">
              <Sparkles size={11} className="animate-pulse" />
              <span>SaaS Mock Interview Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white font-display">
              Ace your tech interview with <em className="animate-text-glow font-serif not-italic">real-time AI</em> diagnostics.
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-normal">
              CognitiveCoach processes your webcam practice logs using speech intelligence. Get instant, visual reports on speech rate, filler words, technical grammar, and overall response grading.
            </p>

            <div className="flex flex-wrap gap-4 mt-4 w-full sm:w-auto">
              <button
                onClick={handleEnterSandbox}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black rounded-full shadow-lg shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Launch Sandbox Free <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  router.push("/login");
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-slate-200/50 dark:border-zinc-800/60 text-slate-700 dark:text-slate-300 font-extrabold rounded-full transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Sign In <ArrowUpRight size={15} />
              </button>
            </div>

            {/* Micro stats banner */}
            <div className="flex items-center gap-8 mt-8 border-t border-slate-200/50 dark:border-zinc-800/60 pt-6 w-full text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">99.4%</span>
                <span>AI Transcript Accuracy</span>
              </div>
              <div className="flex flex-col border-l border-slate-200/50 dark:border-zinc-800/60 pl-8">
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">10+ Roles</span>
                <span>Ready to Practice</span>
              </div>
            </div>

          </div>

          {/* Right side: 3D interactive grid sphere animation */}
          <div className="relative w-full flex items-center justify-center select-none pointer-events-none animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <HeroAnimation />
            <div className="absolute inset-0 bg-radial-glow z-[-1] pointer-events-none" />
          </div>

        </section>

        {/* Logo / Trust indicators */}
        <section className="max-w-7xl mx-auto px-6 border-y border-slate-200/40 dark:border-zinc-800/40 py-10 text-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
            Loved by software engineers preparing for top companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 text-slate-400 dark:text-slate-550 font-display text-sm font-black uppercase tracking-wider">
            <span className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Linear</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Vercel</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Stripe</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Supabase</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">OpenAI</span>
          </div>
        </section>

        {/* Interactive Simulated AI Webcam Demo section */}
        <section id="demo" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white font-display">
              See the webcam intelligence in action.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
              Watch this interactive mock simulation illustrating the real-time analyzer pipeline during a live session.
            </p>
          </div>

          <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            
            {/* Backlight Glow Accent */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-yellow-500/10 to-yellow-600/5 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Simulated Webcam Output */}
              <div className="flex flex-col justify-between bg-black rounded-xl p-4 min-h-[280px] relative overflow-hidden border border-zinc-850 shadow-inner">
                {/* Scanner lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(212,175,55,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500/40 animate-scan pointer-events-none" />

                {/* Simulated Webcam header */}
                <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold relative z-10">
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Live Rec 00:34</span>
                  </div>
                  <span className="text-zinc-550 font-bold bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-800/40">1080p WebCam</span>
                </div>

                {/* Simulated User / Portrait Overlay */}
                <div className="flex-grow flex flex-col justify-center items-center relative py-6">
                  <div className="w-20 h-20 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/5 text-yellow-500/80 shadow-lg shadow-yellow-500/5">
                    <Video size={36} className={demoStep === 2 ? "animate-pulse" : ""} />
                  </div>
                  {/* Speech waveform dots */}
                  {demoStep === 2 && (
                    <div className="flex gap-1.5 mt-6 justify-center items-end h-8">
                      <div className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-6" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-4" style={{ animationDelay: '0.3s' }} />
                      <div className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-8" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-5" style={{ animationDelay: '0.4s' }} />
                      <div className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-7" style={{ animationDelay: '0.15s' }} />
                    </div>
                  )}
                </div>

                {/* Simulated live status info footer */}
                <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/50">
                  <span>Vocal Status:</span>
                  <span className="text-[#D4AF37]">
                    {demoStep === 0 ? "Initializing Device..." : 
                     demoStep === 1 ? "Listening for Prompt..." : 
                     demoStep === 2 ? "Speaking (Vocalizing)..." : 
                     demoStep === 3 ? "Analyzing Signals..." : 
                     "Diagnostics Completed"}
                  </span>
                </div>
              </div>

              {/* Right Column: AI Diagnostics Pipeline */}
              <div className="flex flex-col justify-between font-sans">
                
                {/* Title and Step header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-zinc-800/60">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#D4AF37] dark:text-[#FFE492]">AI Pipeline Stages</span>
                  <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-0.5 rounded">
                    Step {demoStep + 1} of 5
                  </span>
                </div>

                {/* Dynamic cards based on step */}
                <div className="my-6 flex-grow flex flex-col justify-center gap-4">
                  {demoStep === 0 && (
                    <div className="animate-fade-in-up flex flex-col gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Connecting Device Calibration</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-505 leading-relaxed">
                        Initializing audio/video pipelines. Performing ambient noise suppression checks and webcam resolution adjustments.
                      </p>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800/50 rounded-full h-1.5 mt-2">
                        <div className="bg-[#D4AF37] h-1.5 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  )}

                  {demoStep === 1 && (
                    <div className="animate-fade-in-up flex flex-col gap-2">
                      <div className="flex gap-2 items-center text-xs font-bold text-[#D4AF37] mb-1">
                        <MessageSquare size={13} />
                        <span>AI Interviewer Prompting</span>
                      </div>
                      <blockquote className="text-xs italic bg-slate-100/50 dark:bg-zinc-850/40 p-3 rounded-lg border-l-2 border-[#D4AF37] text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                        &ldquo;Explain how you would design a cache eviction policy like Least Recently Used (LRU). Discuss the backing data structures.&rdquo;
                      </blockquote>
                    </div>
                  )}

                  {demoStep === 2 && (
                    <div className="animate-fade-in-up flex flex-col gap-2">
                      <div className="flex gap-2 items-center text-xs font-bold text-slate-500 mb-1">
                        <Video size={13} />
                        <span>Real-Time Transcript Capture</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-800 leading-relaxed bg-slate-100/30 dark:bg-zinc-850/20 p-3 rounded-lg border border-slate-200/40 dark:border-zinc-800/40 font-mono">
                        &ldquo;For an LRU, we want ... <span className="bg-red-500/20 text-red-700 dark:text-red-400 px-1 rounded font-bold">uh</span> ... O(1) lookups. We can use a hash map and a ... <span className="bg-red-500/20 text-red-700 dark:text-red-400 px-1 rounded font-bold">um</span> ... doubly linked list.&rdquo;
                      </p>
                    </div>
                  )}

                  {demoStep === 3 && (
                    <div className="animate-fade-in-up flex flex-col gap-2.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Intelligent Signal Diagnostics</h4>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between border-b border-slate-100 dark:border-zinc-850/40 pb-1.5">
                          <span>Speech Pacing:</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">Calculating WPM...</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-zinc-850/40 pb-1.5">
                          <span>Filler Detections:</span>
                          <span className="font-extrabold text-rose-500">2 warnings flagged</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grammar Evaluation:</span>
                          <span className="font-extrabold text-emerald-500">Active syntax checking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {demoStep === 4 && (
                    <div className="animate-fade-in-up flex flex-col gap-2.5">
                      <div className="flex gap-2 items-center text-xs font-bold text-emerald-500 mb-1">
                        <CheckCircle size={13} />
                        <span>Evaluation Report Prepared</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-slate-100/50 dark:bg-zinc-850/40 p-2.5 rounded-lg border border-slate-200/40 dark:border-zinc-800/40">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Avg Pacing</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white font-outfit mt-0.5 block">128 WPM</span>
                        </div>
                        <div className="bg-slate-100/50 dark:bg-zinc-850/40 p-2.5 rounded-lg border border-slate-200/40 dark:border-zinc-800/40">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Relevance</span>
                          <span className="text-sm font-black text-[#D4AF37] font-outfit mt-0.5 block">94%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action button indicator */}
                <button
                  onClick={handleEnterSandbox}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-zinc-900/50 hover:bg-[#D4AF37] hover:text-black dark:hover:bg-[#D4AF37] border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent py-3 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Start Practicing Locally <ArrowRight size={12} />
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Premium Features Grid */}
        <section id="features" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white font-display">
              Feature Suite for SaaS Standards.
            </h2>
            <p className="text-slate-505 dark:text-slate-400 text-xs md:text-sm">
              We leverage advanced LLM analysis and localized signal processing to deliver high-quality, actionable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Webcam Analysis */}
            <div className="group glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/35 hover:-translate-y-1.5 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[#D4AF37] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Video size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">Webcam AI Diagnostics</h3>
                <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed">
                  Record response audio and video directly in your browser. We capture and parse the inputs securely.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] mt-6 flex items-center gap-1.5">
                Learn More <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {/* Card 2: Speech Pacing */}
            <div className="group glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/35 hover:-translate-y-1.5 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[#D4AF37] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Activity size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">Vocal Pacing Metrics</h3>
                <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed">
                  Track speaking velocity (WPM) and automatically map filler word occurrences across your history.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] mt-6 flex items-center gap-1.5">
                Learn More <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {/* Card 3: Code & Logic Grading */}
            <div className="group glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/35 hover:-translate-y-1.5 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[#D4AF37] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Terminal size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">Code & Answer Grading</h3>
                <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed">
                  FastAPI backend processes text answers using LLM algorithms to evaluate grammar, technical accuracy, and key terminology.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] mt-6 flex items-center gap-1.5">
                Learn More <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {/* Card 4: Counselor Chat */}
            <div className="group glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 dark:hover:border-[#D4AF37]/35 hover:-translate-y-1.5 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[#D4AF37] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Users size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">Career Advisor Chat</h3>
                <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed">
                  Interact with an AI career advisor to retrieve study paths, resume recommendations, and mock interview preparations.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] mt-6 flex items-center gap-1.5">
                Learn More <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

          </div>

        </section>

        {/* Testimonials Grid */}
        <section id="testimonials" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white font-display">
              Endorsed by developers globally.
            </h2>
            <p className="text-slate-505 dark:text-slate-400 text-xs md:text-sm">
              Read how developers used CognitiveCoach diagnostics to improve speaking skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:border-[#D4AF37]/20 transition-all duration-300">
              <div className="flex gap-1 text-[#D4AF37] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mb-6 font-sans italic">
                &ldquo;The filler word diagnostics highlighted exactly where I stammered during LRU cache questions. Re-evaluating with pacing benchmarks helped me speak much more confidently.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                  JS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Jane Sharma</h4>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Frontend Lead</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:border-[#D4AF37]/20 transition-all duration-300">
              <div className="flex gap-1 text-[#D4AF37] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mb-6 font-sans italic">
                &ldquo;FastAPI backend responses are extremely fast. The modular role list covers specific coding limits, and the speech pace (WPM) check accurately tracked my conversational fluency.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Alex Miller</h4>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Software Architect</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:border-[#D4AF37]/20 transition-all duration-300">
              <div className="flex gap-1 text-[#D4AF37] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mb-6 font-sans italic">
                &ldquo;The chatbot is incredibly fast, and the dashboard provides high-quality diagnostics that felt customized. This tool replaced mock-interviews with peers entirely.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                  RK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rohan Kapoor</h4>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">PM Lead at OpenAI</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-24 max-w-4xl mx-auto px-6 py-20 md:py-32">
          
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-550 dark:text-slate-400 text-xs md:text-sm">
              Have questions? Find quick guidelines below.
            </p>
          </div>

          <div className="flex flex-col gap-4 font-sans">
            
            {/* FAQ 1 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-5 transition-all duration-300">
              <button 
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>Do I need to sign up to try mock interviews?</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${openFaq === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 0 && (
                <p className="mt-3.5 text-xs text-slate-505 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-zinc-850/50 pt-3 animate-fade-in-up">
                  No! You can click **Launch Sandbox Free** and run mock interviews as a guest immediately. Signing up is optional, but is required to save your metrics across multiple browsers.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-5 transition-all duration-300">
              <button 
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>How does speech pacing check calculate metrics?</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <p className="mt-3.5 text-xs text-slate-505 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-zinc-850/50 pt-3 animate-fade-in-up">
                  When you record audio during mock sessions, your browser converts verbal signals into textual transcripts. We compute the speaking speed (Words Per Minute) and flag standard fillers like &quot;uh&quot;, &quot;um&quot;, &quot;like&quot;, or &quot;basically&quot; to score your delivery.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-5 transition-all duration-300">
              <button 
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full flex justify-between items-center font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>Is my webcam feed saved on the server?</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <p className="mt-3.5 text-xs text-slate-505 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-zinc-850/50 pt-3 animate-fade-in-up">
                  No. Audio and video recordings are processed directly inside your browser container. The backend only analyzes final transcripts for scoring, keeping your video session private.
                </p>
              )}
            </div>

          </div>

        </section>

        {/* Global CTA Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 mb-20 animate-fade-in-up">
          <div className="relative glass-panel bg-slate-900/90 dark:bg-zinc-900/60 border border-slate-800 dark:border-zinc-800/50 rounded-3xl p-8 md:p-14 text-center overflow-hidden shadow-2xl">
            
            {/* Gradient Backlight */}
            <div className="absolute inset-0 bg-radial-glow opacity-30 z-[-1] pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10 font-sans">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 font-display">
                Ready to calibrate your interview skills?
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mb-8 leading-relaxed">
                Launch the sandbox workspace to start selecting practice roles. Zero setup, zero accounts needed.
              </p>
              <button
                onClick={handleEnterSandbox}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black rounded-full shadow-lg shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2 text-sm cursor-pointer"
              >
                Launch Sandbox Workspace <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </section>

      </div>
    );
  }

  // --- RENDER PREMIUM DASHBOARD WORKSPACE ---
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-grow font-sans bg-grid animate-fade-in-up">
      
      {/* Offline Warning Banner */}
      {backendOffline && (
        <div role="alert" className="flex items-start gap-3.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-455 p-4 rounded-xl mb-8 text-sm shadow-sm backdrop-blur-sm animate-fade-in-up">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold font-display">FastAPI Backend Offline:</strong> The client cannot connect to the server at <code>{API_BASE_URL}</code>. 
            Ensure your backend is running or check the <code>NEXT_PUBLIC_API_URL</code> environment variables.
          </div>
        </div>
      )}

      {/* Hero Welcome Header */}
      <section className="flex flex-col gap-4 justify-center items-start mb-12 animate-fade-in-up max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[#D4AF37] dark:text-[#FFE492] text-[9px] uppercase tracking-widest font-black">
          <GraduationCap size={11} />
          <span>Interactive Aura Workspace</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-900 dark:text-white font-display">
          Calibrate your speaking <em className="text-[#D4AF37] font-serif not-italic">fluency</em>.
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
          Review overall average statistics gathered from your webcam mock diagnostics. Select a target role below to initialize a new session.
        </p>
      </section>

      {/* Stats Board Grid */}
      <section id="stats-board" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Core Metrics Progress Gauges */}
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#D4AF37]/20 transition-all duration-300 flex flex-col justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Diagnostics Summary</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500">Global averages</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <CircularGauge score={loading ? 0 : stats ? stats.average_clarity : 0} label="Clarity" color="#D4AF37" />
            <CircularGauge score={loading ? 0 : stats ? stats.average_relevance : 0} label="Relevance" color="#45c2ff" />
            <CircularGauge score={loading ? 0 : stats ? stats.average_grammar : 0} label="Grammar" color="#10B981" />
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/50 pt-3.5">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Completed Sessions:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-250 font-outfit">{loading ? "..." : stats?.total_interviews || 0}</span>
          </div>
        </div>

        {/* WPM Pacing Card */}
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#D4AF37]/20 transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Flame size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Speech Pacing Rate</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Target pacing range: 110 - 140 WPM</p>
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 my-6">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              {loading ? "..." : stats ? stats.average_wpm : "0"}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">WPM</span>
          </div>

          <div className={`border p-3 rounded-xl text-[11px] flex items-center gap-2 ${pacingNote.style}`}>
            <CheckCircle size={14} className={`flex-shrink-0 ${pacingNote.iconClass}`} />
            <span className="font-bold">{pacingNote.text}</span>
          </div>
        </div>

        {/* Dynamic Trend Chart */}
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#D4AF37]/20 transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Filler Words Trend</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Average filler count per session</p>
            </div>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]"></span>
            </span>
          </div>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 font-sans">Loading chart...</div>
          ) : (
            renderTrendChart()
          )}
        </div>
      </section>

      {/* Role Selection Grid */}
      <section id="roles" className="scroll-mt-20">
        <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-slate-200/50 dark:border-zinc-800/60 pb-3 text-slate-550 dark:text-slate-450 font-display">
          Select Practice Interview Focus
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <div 
              key={role.id}
              className="group glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-[#D4AF37]/35 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-yellow-500/2 transition-all duration-300 ease-out animate-fade-in-up"
              style={{ animationDelay: `${0.06 * idx}s` }}
              onClick={() => handleStartSession(role.id)}
            >
              <div>
                {/* Gradient Rounded Icon Container */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-[#D4AF37] mb-5 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {role.icon}
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 font-display">
                  {role.title}
                </h3>
                
                <p className="text-slate-455 dark:text-slate-400 text-[11px] leading-relaxed mb-5">
                  {role.desc}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {role.topics.map((t, i) => (
                    <span key={i} className="text-[9px] font-extrabold bg-slate-100 dark:bg-zinc-855 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
                
                <button
                  aria-label={`Start ${role.title} mock interview`}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-zinc-900/55 hover:bg-[#D4AF37] hover:text-black dark:hover:bg-[#D4AF37] border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSession(role.id);
                  }}
                >
                  <Play size={9} fill="currentColor" /> Start Interview <ArrowRight size={9} className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Interviews Given */}
      {user && interviews && interviews.length > 0 && (
        <section id="history" className="mt-20 scroll-mt-20">
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-slate-200/50 dark:border-zinc-800/60 pb-3 text-slate-505 dark:text-slate-450 font-display">
            Practice Log History
          </h2>
          
          <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-505">
                    <th scope="col" className="py-4 px-6">Role Focus</th>
                    <th scope="col" className="py-4 px-6">Date Completed</th>
                    <th scope="col" className="py-4 px-6">Responses</th>
                    <th scope="col" className="py-4 px-6">Average Metric Score</th>
                    <th scope="col" className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => {
                    const completedResponses = interview.responses.filter(r => r.metrics);
                    let avgScore = 0;
                    if (completedResponses.length > 0) {
                      const totalScore = completedResponses.reduce((sum, r) => {
                        return sum + (r.metrics.clarity_score + r.metrics.relevance_score + r.metrics.grammar_score) / 3;
                      }, 0);
                      avgScore = Math.round(totalScore / completedResponses.length);
                    }
                    
                    return (
                      <tr key={interview.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/30 dark:hover:bg-zinc-850/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{interview.role}</td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-450">
                          {new Date(interview.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold">
                          {interview.responses.length} Question(s)
                        </td>
                        <td className="py-4 px-6">
                          {avgScore > 0 ? (
                            <span className="inline-flex items-center gap-1.5 font-bold text-[#D4AF37]">
                              ✦ {avgScore}%
                            </span>
                          ) : (
                            <span className="text-slate-405 dark:text-slate-550">Pending Feedback</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => router.push(`/results/${interview.id}`)}
                            aria-label={`View report for ${interview.role} interview`}
                            className="px-4 py-1.5 bg-slate-50 hover:bg-[#D4AF37] hover:text-black dark:bg-zinc-900/55 dark:hover:bg-[#D4AF37] text-slate-700 dark:text-slate-450 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent rounded-lg font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
