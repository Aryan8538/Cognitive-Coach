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
      <div className="relative w-full overflow-hidden font-sans">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <filter id="pathShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.2" />
            </filter>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(6,182,212,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding - chartHeight / 2} x2={width - padding} y2={height - padding - chartHeight / 2} stroke="rgba(6,182,212,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(6,182,212,0.12)" />
          
          {points.map((p, idx) => (
            <line key={`grid-${idx}`} x1={p.x} y1={p.y} x2={p.x} y2={height - padding} stroke="rgba(6,182,212,0.06)" strokeDasharray="2" />
          ))}

          <path d={areaD} fill="url(#chartGlow)" className="animate-chart-area" />
          <path d={pathD} fill="none" stroke="#06B6D4" strokeWidth="2" filter="url(#pathShadow)" strokeLinecap="round" strokeLinejoin="round" className="animate-chart-line" />
          {points.map((p, idx) => (
            <g 
              key={idx} 
              className="group/dot cursor-pointer animate-chart-dot"
              style={{
                transformOrigin: `${p.x}px ${p.y}px`,
                animationDelay: `${0.6 + idx * 0.15}s`
              }}
            >
              <circle cx={p.x} cy={p.y} r="4" fill="#030303" stroke="#06B6D4" strokeWidth="2" className="transition-all duration-300 group-hover/dot:stroke-[#8B5CF6]" />
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
        style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-455",
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
      <div className="w-full flex-grow font-sans bg-[#030303] text-white select-none">
        
        {/* Subtle glow background blobs */}
        <div className="background-blobs">
          <div className="blob blob-1 bg-gradient-to-tr from-[#8B5CF6]/20 to-transparent animate-orb-slow"></div>
          <div className="blob blob-2 bg-gradient-to-tr from-[#06B6D4]/10 to-transparent animate-orb-delayed"></div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 md:pt-40 md:pb-24 flex flex-col items-center text-center relative z-10">
          
          <div className="flex flex-col gap-6 items-center text-center max-w-4xl animate-fade-in-up">
            
            {/* Glowing Accent Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-[9px] uppercase tracking-wider font-extrabold font-mono shadow-sm animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              <span>COGNITIVECOACH // SPEECH ENGINE ACTIVE</span>
            </div>

            <h1 className="text-5xl md:text-[5.5rem] tracking-tight leading-[0.92] text-white font-black font-sans max-w-5xl">
              Architecting Speech <br />
              Intelligence for Tomorr<span className="text-[#06B6D4]">ow</span>
            </h1>
            
            <p className="text-neutral-450 text-sm md:text-base leading-relaxed max-w-2xl font-normal mt-4 font-sans">
              Designing modular environments with precision-crafted AI mock intelligence. <br className="hidden md:block" />
              Standardise and calibrate speech pacing, grammar, and diagnostics in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mt-10 w-full sm:w-auto justify-center font-mono">
              {/* Conic Spinning border CTA Button */}
              <button
                onClick={handleEnterSandbox}
                className="relative group p-[1px] rounded-full overflow-hidden transition-snappy active:scale-[0.98] cursor-pointer shadow-lg shadow-[#06B6D4]/15"
              >
                <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_0%,#8b5cf6_40%,#06b6d4_50%,transparent_60%)] animate-spin-border z-0" />
                <div className="relative px-8 py-3.5 bg-black text-white text-[10px] uppercase font-bold tracking-widest rounded-full z-10 flex items-center justify-center gap-2 group-hover:bg-neutral-900 transition-colors">
                  Access Free Sandbox
                </div>
              </button>
              
              <button
                onClick={() => {
                  router.push("/login");
                }}
                className="text-[10px] uppercase font-bold tracking-widest text-neutral-450 hover:text-white transition-colors duration-250 flex items-center gap-1 cursor-pointer"
              >
                Review Evaluation Schemas //
              </button>
            </div>

          </div>

        </section>

        {/* Metrics Ticker */}
        <section className="w-full bg-black/40 border-y border-white/5 py-4 overflow-hidden relative select-none">
          <div className="animate-marquee flex whitespace-nowrap gap-16 md:gap-24">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-16 md:gap-24 items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold tracking-widest font-mono text-neutral-500 uppercase">accuracy</span>
                  <span className="text-xs font-mono text-[#06B6D4] font-bold">99.4% AI</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold tracking-widest font-mono text-neutral-500 uppercase">practice_roles</span>
                  <span className="text-xs font-mono text-white font-bold">10+ SE/PM</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold tracking-widest font-mono text-neutral-500 uppercase">latency</span>
                  <span className="text-xs font-mono text-[#8B5CF6] font-bold">&lt; 1.2s</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold tracking-widest font-mono text-neutral-500 uppercase">checks</span>
                  <span className="text-xs font-mono text-[#10B981] font-bold">100K+ RUN</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold tracking-widest font-mono text-neutral-500 uppercase">framework</span>
                  <span className="text-xs font-mono text-white font-bold">STAR Model</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Card Grid */}
        <section id="features" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] font-mono">Redefined Suite</span>
            <h2 className="text-3xl md:text-5xl font-serif-heading tracking-tight text-white mt-2 mb-4">
              Designed for SaaS standards.
            </h2>
            <p className="text-neutral-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-sans">
              We leverage advanced LLM analysis and localized signal processing to deliver high-quality, actionable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-3 hover:border-violet-500/40 hover:bg-white/[0.05] hover:shadow-glow transition-snappy text-left">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-[#8b5cf6] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Video size={20} />
              </div>
              <h3 className="text-xl font-serif-heading text-white mb-3">Speech Fluency Analyzer</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-sans">
                Record response audio and video directly in your browser. We capture and parse the inputs securely to calculate pacing speed and filler words.
              </p>
            </div>

            <div className="group bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-3 hover:border-[#06b6d4]/40 hover:bg-white/[0.05] hover:shadow-glow transition-snappy text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-serif-heading text-white mb-3">AI Mock Advisor</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-sans">
                Interact with a dedicated placement mentor for roadmap construction, technical Q&A reviews, and resume analysis checks.
              </p>
            </div>

            <div className="group bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-3 hover:border-emerald-500/40 hover:bg-white/[0.05] hover:shadow-glow transition-snappy text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-serif-heading text-white mb-3">Behavioral STAR Coaching</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-sans">
                Refine behavioral responses with structured Situation-Task-Action-Result scoring checks and detailed diagnostic insights.
              </p>
            </div>
          </div>
        </section>

        {/* IDE & Calibration Block */}
        <section id="demo" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#06b6d4] font-mono">Webcam Calibration</span>
            <h2 className="text-3xl md:text-5xl font-serif-heading tracking-tight text-white mt-2 mb-4">
              Webcam diagnostics pipeline.
            </h2>
            <p className="text-neutral-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
              Watch this interactive mock simulation illustrating the real-time analyzer pipeline during a live session.
            </p>
          </div>

          <div className="bg-[#080808]/80 border border-white/10 rounded-[24px] p-6 shadow-2xl max-w-4xl mx-auto relative overflow-hidden backdrop-blur-xl">
            {/* Backlight Glow Accent */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-[#8b5cf6]/10 to-[#06b6d4]/5 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Simulated Webcam Output */}
              <div className="flex flex-col justify-between bg-[#030303] rounded-2xl p-4 min-h-[280px] relative overflow-hidden border border-white/5 shadow-inner">
                {/* Scanner lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500/40 animate-scan pointer-events-none" />

                {/* Simulated Webcam header */}
                <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-bold relative z-10 font-mono">
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Live Rec 00:34</span>
                  </div>
                  <span className="text-neutral-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">1080p WebCam</span>
                </div>

                {/* Simulated User / Portrait Overlay */}
                <div className="flex-grow flex flex-col justify-center items-center relative py-6">
                  <div className="w-20 h-20 rounded-full border border-violet-500/30 flex items-center justify-center bg-violet-500/5 text-violet-400/80 shadow-lg shadow-violet-500/5">
                    <Video size={36} className={demoStep === 2 ? "animate-pulse" : ""} />
                  </div>
                  {/* Speech waveform dots */}
                  {demoStep === 2 && (
                    <div className="flex gap-1.5 mt-6 justify-center items-end h-8">
                      <div className="w-1 bg-[#8b5cf6] rounded-full animate-bounce h-6" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 bg-[#06b6d4] rounded-full animate-bounce h-4" style={{ animationDelay: '0.3s' }} />
                      <div className="w-1 bg-[#8b5cf6] rounded-full animate-bounce h-8" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 bg-[#06b6d4] rounded-full animate-bounce h-5" style={{ animationDelay: '0.4s' }} />
                      <div className="w-1 bg-[#8b5cf6] rounded-full animate-bounce h-7" style={{ animationDelay: '0.15s' }} />
                    </div>
                  )}
                </div>

                {/* Simulated live status info footer */}
                <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase bg-white/5 p-2.5 rounded-xl border border-white/5 font-mono">
                  <span>Vocal Status:</span>
                  <span className="text-[#06B6D4]">
                    {demoStep === 0 ? "Initializing Device..." : 
                     demoStep === 1 ? "Listening for Prompt..." : 
                     demoStep === 2 ? "Speaking (Vocalizing)..." : 
                     demoStep === 3 ? "Analyzing Signals..." : 
                     "Diagnostics Completed"}
                  </span>
                </div>
              </div>

              {/* Right Column: Code Integration Block */}
              <div className="flex flex-col justify-between font-sans bg-[#0c0c0e] rounded-2xl border border-white/5 overflow-hidden text-left">
                {/* Header toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/25">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">diagnostics.py</span>
                  <div className="w-3.5 h-3.5 rounded text-neutral-500 hover:text-white transition-colors cursor-pointer">
                    <Terminal size={12} />
                  </div>
                </div>

                {/* Code viewport */}
                <pre className="p-5 flex-grow overflow-x-auto text-[11px] font-mono leading-relaxed text-left text-neutral-300">
                  <code>
                    <span className="text-[#8B5CF6]">from</span>{" aura "}
                    <span className="text-[#8B5CF6]">import</span>{" FluencyEngine, STARModel\n\n"}
                    <span className="text-neutral-500">{"# Calibrate audio signals and parameters\n"}</span>
                    {"advisor = FluencyEngine(model="}
                    <span className="text-[#10B981]">{"\"aura-max\""}</span>
                    {"\n\n"}
                    <span className="text-neutral-500">{"# Process verbal stream diagnostics\n"}</span>
                    {"advisor.analyze_speech(wpm="}
                    {demoStep === 4 ? "128" : "..."}
                    {")\n\n"}
                    <span className="text-neutral-500">{"# Output grade verdict metrics\n"}</span>
                    {"chance = advisor.generate_verdict()\n"}
                    <span className="text-[#8B5CF6]">{"print"}</span>
                    {"(f"}
                    <span className="text-[#10B981]">{"\"Hiring Chance: {chance.score}%\""}</span>
                    {")"}
                  </code>
                </pre>

                {/* Simulated live progress bar or status */}
                <div className="p-4 border-t border-white/5 bg-black/20 text-[10px] text-neutral-450 flex items-center justify-between font-mono">
                  <span>Engine Pipeline: Active</span>
                  <span className="text-[#8b5cf6]">Status: OK</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section id="testimonials" className="scroll-mt-24 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] font-mono">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-serif-heading tracking-tight text-white mt-2 mb-4">
              Endorsed by developers globally.
            </h2>
            <p className="text-neutral-450 text-xs md:text-sm">
              Read how developers used CognitiveCoach diagnostics to improve speaking skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 hover:border-violet-500/30 transition-snappy text-left">
              <div className="flex gap-1 text-[#8b5cf6] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans italic">
                &ldquo;The filler word diagnostics highlighted exactly where I stammered during LRU cache questions. Re-evaluating with pacing benchmarks helped me speak much more confidently.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center font-bold text-xs text-[#8b5cf6]">
                  JS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Jane Sharma</h4>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Frontend Lead</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 hover:border-[#06b6d4]/30 transition-snappy text-left">
              <div className="flex gap-1 text-[#06b6d4] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans italic">
                &ldquo;FastAPI backend responses are extremely fast. The modular role list covers specific coding limits, and the speech pace (WPM) check accurately tracked my conversational fluency.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#06b6d4]/10 flex items-center justify-center font-bold text-xs text-[#06b6d4]">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Alex Miller</h4>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Software Architect</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:-translate-y-2 hover:border-emerald-500/30 transition-snappy text-left">
              <div className="flex gap-1 text-[#10B981] mb-4">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans italic">
                &ldquo;The chatbot is incredibly fast, and the dashboard provides high-quality diagnostics that felt customized. This tool replaced mock-interviews with peers entirely.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-[#10B981]">
                  RK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Rohan Kapoor</h4>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">PM Lead at OpenAI</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-24 max-w-4xl mx-auto px-6 py-20 md:py-32">
          
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5cf6] font-mono">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-serif-heading tracking-tight text-white mt-2 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-450 text-xs md:text-sm">
              Have questions? Find quick guidelines below.
            </p>
          </div>

          <div className="flex flex-col gap-4 font-sans text-left">
            
            {/* FAQ 1 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 transition-snappy">
              <button 
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full flex justify-between items-center font-bold text-white text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>Do I need to sign up to try mock interviews?</span>
                <ChevronDown size={16} className={`text-neutral-500 transition-transform duration-300 ${openFaq === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 0 && (
                <p className="mt-3.5 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in-up">
                  No! You can click **Launch Sandbox Free** and run mock interviews as a guest immediately. Signing up is optional, but is required to save your metrics across multiple browsers.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 transition-snappy">
              <button 
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full flex justify-between items-center font-bold text-white text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>How does speech pacing check calculate metrics?</span>
                <ChevronDown size={16} className={`text-neutral-500 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <p className="mt-3.5 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in-up">
                  When you record audio during mock sessions, your browser converts verbal signals into textual transcripts. We compute the speaking speed (Words Per Minute) and flag standard fillers like &quot;uh&quot;, &quot;um&quot;, &quot;like&quot;, or &quot;basically&quot; to score your delivery.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 transition-snappy">
              <button 
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full flex justify-between items-center font-bold text-white text-xs md:text-sm text-left focus:outline-none cursor-pointer"
              >
                <span>Is my webcam feed saved on the server?</span>
                <ChevronDown size={16} className={`text-neutral-500 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <p className="mt-3.5 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in-up">
                  No. Audio and video recordings are processed directly inside your browser container. The backend only analyzes final transcripts for scoring, keeping your video session private.
                </p>
              )}
            </div>

          </div>

        </section>

        {/* Global CTA Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 mb-20 animate-fade-in-up relative z-10">
          <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-8 md:p-14 text-center overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto relative z-10 font-sans">
              <h2 className="text-3xl md:text-5xl font-serif-heading text-white mb-6">
                Ready to calibrate your interview skills?
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm mb-8 leading-relaxed">
                Launch the sandbox workspace to start selecting practice roles. Zero setup, zero accounts needed.
              </p>
              <button
                onClick={handleEnterSandbox}
                className="px-8 py-4 bg-white hover:bg-neutral-200 text-black text-xs uppercase font-bold tracking-widest rounded-full transition-snappy active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-white/5"
              >
                Launch Sandbox Workspace <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#050505] border-t border-white/5 py-16 px-6 md:px-12 text-left font-sans">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-semibold font-serif-heading text-white tracking-wide">
                CognitiveCoach
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                Futuristic speech diagnostics calibrating your placement performance instantly.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-sans">Focus Areas</h4>
              <a href="/#roles" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">Software Engineer</a>
              <a href="/#roles" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">Product Manager</a>
              <a href="/#roles" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">DevOps & Cloud</a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-sans">Capabilities</h4>
              <a href="/advisor" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">AI Career Advisor</a>
              <a href="/resume-checker" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">Resume ATS Check</a>
              <a href="/interview" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">Video Interview Hub</a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-sans">Platform</h4>
              <a href="/login" className="text-xs text-neutral-400 hover:text-white transition-colors font-sans">Sign In Portal</a>
              <span className="text-xs text-neutral-450 font-sans">V1.5 (Aura Flash)</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-neutral-500 font-mono">
              &copy; {new Date().getFullYear()} CognitiveCoach. All rights reserved.
            </span>
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-500 font-mono">
                All Systems Operational
              </span>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  // --- RENDER PREMIUM DASHBOARD WORKSPACE ---
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-12 w-full flex-grow font-sans bg-grid animate-fade-in-up">
      
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-[9px] uppercase tracking-widest font-black">
          <GraduationCap size={11} />
          <span>Interactive Aura Workspace</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-900 dark:text-white font-display">
          Calibrate your speaking <em className="text-[#8B5CF6] font-serif not-italic">fluency</em>.
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
          Review overall average statistics gathered from your webcam mock diagnostics. Select a target role below to initialize a new session.
        </p>
      </section>

      {/* Stats Board Grid */}
      <section id="stats-board" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Core Metrics Progress Gauges */}
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shadow-inner">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Diagnostics Summary</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500">Global averages</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <CircularGauge score={loading ? 0 : stats ? stats.average_clarity : 0} label="Clarity" color="#8B5CF6" />
            <CircularGauge score={loading ? 0 : stats ? stats.average_relevance : 0} label="Relevance" color="#06B6D4" />
            <CircularGauge score={loading ? 0 : stats ? stats.average_grammar : 0} label="Grammar" color="#10B981" />
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/50 pt-3.5">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">Completed Sessions:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-250 font-outfit">{loading ? "..." : stats?.total_interviews || 0}</span>
          </div>
        </div>

        {/* WPM Pacing Card */}
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] shadow-inner">
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
        <div className="glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#8B5CF6]/30 transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Filler Words Trend</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Average filler count per session</p>
            </div>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06B6D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#06B6D4]"></span>
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
              className="group glass-panel dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-[#8B5CF6]/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#8B5CF6]/5 transition-all duration-300 ease-out animate-fade-in-up"
              style={{ animationDelay: `${0.06 * idx}s` }}
              onClick={() => handleStartSession(role.id)}
            >
              <div>
                {/* Gradient Rounded Icon Container */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-[#06B6D4] mb-5 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
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
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-zinc-900/55 hover:bg-[#8B5CF6] hover:text-white dark:hover:bg-[#8B5CF6] border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer"
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
