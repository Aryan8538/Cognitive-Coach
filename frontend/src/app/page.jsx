"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, Users, Cpu, BarChart3, Activity, Cloud, Shield, Play, HelpCircle, Flame, TrendingUp 
} from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

const CircularGauge = ({ score, label, color }) => {
  const radius = 34;
  const stroke = 5.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            className="text-slate-100 dark:text-zinc-800/60"
            strokeWidth={stroke}
            stroke="transparent"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
          <circle
            className="progress-ring-circle transition-all duration-1000"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            stroke={color}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="40"
            cy="40"
          />
        </svg>
        <span className="absolute text-xs md:text-sm font-bold font-mono text-[#EBDCC4]">
          {score}%
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#B6A596]">
        {label}
      </span>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define practice mock interview focus roles
  const roles = [
    {
      id: "Software Engineer",
      title: "Software Engineer",
      icon: <Terminal size={18} />,
      desc: "Practice system architectural design and coding logic explanation. Standard questions cover scalability, cycle detection, and key/value caching.",
      topics: ["System Design", "Coding Logic"]
    },
    {
      id: "Product Manager",
      title: "Product Manager",
      icon: <Users size={18} />,
      desc: "Refine product lifecycle strategy, market metrics, and user prioritization. Questions test pricing launches and driver metrics.",
      topics: ["Product Strategy", "Growth Metrics"]
    },
    {
      id: "Full Stack Web Developer",
      title: "Full Stack Web Developer",
      icon: <Terminal size={18} />,
      desc: "Practice building full-stack REST APIs, state management, and database query optimization. Focuses on pagination, security protocols, and API latency.",
      topics: ["REST APIs", "Pagination Logic"]
    },
    {
      id: "AI Engineer",
      title: "AI Engineer",
      icon: <Cpu size={18} />,
      desc: "Practice interviews focused on deep learning, neural network architectures, and LLMs. Questions cover transformer mechanisms, fine-tuning, and compute bounds.",
      topics: ["Deep Learning", "LLM Fine-Tuning"]
    },
    {
      id: "Data Scientist",
      title: "Data Scientist",
      icon: <BarChart3 size={18} />,
      desc: "Practice statistical modeling, experimental design (A/B testing), and data pipelines. Questions test regression bounds, bias-variance, and SQL transforms.",
      topics: ["A/B Testing", "Feature Engineering"]
    },
    {
      id: "IoT Engineer",
      title: "IoT Engineer",
      icon: <Activity size={18} />,
      desc: "Prepare for hardware-software integration, low-power edge computing, and protocols. Tests cover MQTT routing, sensor polling rates, and firmware design.",
      topics: ["Firmware Design", "Edge Computing"]
    },
    {
      id: "DevOps Engineer",
      title: "DevOps Engineer",
      icon: <Cloud size={18} />,
      desc: "Master continuous integration, infrastructure as code (IaC), container orchestration, and cloud deployment pipelines. Practice Docker, Kubernetes, and Terraform.",
      topics: ["Kubernetes", "CI/CD Pipelines"]
    },
    {
      id: "Cybersecurity Engineer",
      title: "Cybersecurity Engineer",
      icon: <Shield size={18} />,
      desc: "Evaluate network security protocol design, penetration testing methodology, threat modeling, and encryption standards. Practice cross-site security.",
      topics: ["Threat Modeling", "Penetration Testing"]
    },
    {
      id: "HR & Behavioral",
      title: "HR & Behavioral",
      icon: <HelpCircle size={18} />,
      desc: "Prepare for behavioral and cultural fit interviews. Practice structured STAR method answering models for collaboration, conflict, and pressure.",
      topics: ["STAR Method", "Cultural Fit"]
    }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Failed to parse user session", e);
      }
    }

    async function fetchStatsAndInterviews() {
      const token = localStorage.getItem("token") || "";
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/dashboard-stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
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
  }, []);

  const handleStartSession = (roleName) => {
    router.push(`/interview?role=${encodeURIComponent(roleName)}`);
  };

  // Derive pacing status metrics
  const pacingWpm = stats ? parseFloat(stats.average_wpm) : 0;
  const hasPacingData = !loading && stats && pacingWpm > 0;
  const pacingOnTarget = pacingWpm >= 110 && pacingWpm <= 140;
  const pacingNote = !hasPacingData
    ? {
        style: "bg-[#35211A]/10 border border-dashed border-[#66473B]/50 text-[#B6A596]",
        iconClass: "text-[#66473B]",
        text: "Complete an interview to calibrate your pacing rate."
      }
    : pacingOnTarget
    ? {
        style: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-450",
        iconClass: "text-emerald-450",
        text: "Speech velocity meets professional fluency standards."
      }
    : {
        style: "bg-amber-500/10 border border-amber-500/20 text-amber-500",
        iconClass: "text-amber-500",
        text: pacingWpm < 110
          ? "Slightly under conversational standard — try speaking faster."
          : "Slightly above conversational standard — try speaking slower."
      };

  // Render diagnostics line graph (SVG)
  const renderTrendChart = () => {
    if (!stats || stats.filler_words_trend.length === 0 || stats.filler_words_trend[0].date === "No Data") {
      return (
        <div className="flex items-center justify-center h-28 text-[10px] text-[#66473B] font-mono uppercase tracking-wider">
          No data available.
        </div>
      );
    }

    const trend = [...stats.filler_words_trend].reverse(); // Show oldest to newest
    const padding = 20;
    const width = 500;
    const height = 120;
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
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC9F85" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#DC9F85" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(220,159,133,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding - chartHeight / 2} x2={width - padding} y2={height - padding - chartHeight / 2} stroke="rgba(220,159,133,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(220,159,133,0.12)" />
          
          {points.map((p, idx) => (
            <line key={`grid-${idx}`} x1={p.x} y1={p.y} x2={p.x} y2={height - padding} stroke="rgba(220,159,133,0.06)" strokeDasharray="2" />
          ))}

          <path d={areaD} fill="url(#chartGlow)" />
          <path d={pathD} fill="none" stroke="#DC9F85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="3" fill="#181818" stroke="#DC9F85" strokeWidth="1.5" />
              <text x={p.x} y={p.y - 8} fontSize="8" className="fill-[#EBDCC4] font-mono font-bold" textAnchor="middle">
                {p.count}
              </text>
              <text x={p.x} y={height - padding + 10} fontSize="7" className="fill-[#66473B] font-mono font-bold" textAnchor="middle">
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 dark:text-[#EBDCC4] font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto overflow-x-hidden select-none">
      
      {/* Header spacer to prevent overlay clashes with the floating menu box */}
      <div className="w-full h-16 md:h-20 flex-shrink-0" />

      {/* SECTION 1: Editorial Landing Fold */}
      <div className="flex-grow flex flex-col justify-between min-h-[calc(100vh-160px)]">
        
        {/* Central Hero Headline */}
        <main className="flex-grow flex flex-col justify-center items-start my-20 md:my-0 z-10 relative">
          
          {/* Early Access Tag */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-6 h-[1px] bg-[#DC9F85]" />
            <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#B6A596]">
              Evaluation Sandbox
            </span>
          </div>

          {/* Double-layered Depth Headline */}
          <div className="relative w-full select-none">
            {/* Layer 1 (Back Outline) */}
            <h1 className="absolute top-1 left-1 md:top-2 md:left-2 text-[6.8vw] sm:text-[7vw] md:text-[7.2vw] lg:text-[7.8vw] font-display font-bold uppercase tracking-tighter leading-[0.82] text-outlined select-none pointer-events-none opacity-60">
              COGNITIVECOACH
            </h1>
            {/* Layer 2 (Front Solid) */}
            <h1 className="relative text-[6.8vw] sm:text-[7vw] md:text-[7.2vw] lg:text-[7.8vw] font-display font-bold uppercase tracking-tighter leading-[0.82] text-neutral-900 dark:text-[#EBDCC4] select-none">
              COGNITIVECOACH
            </h1>
          </div>

        </main>

        {/* Bottom Content Section (Divider + 12-Column Grid) */}
        <footer className="w-full flex flex-col gap-8 md:gap-12 z-20">
          
          {/* Horizontal divider line */}
          <div className="w-full h-[1px] bg-[#35211A]" />

          {/* 12-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Columns 1-5: Value Proposition & Core Offerings */}
            <div className="md:col-span-5 flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#DC9F85] rounded-[1px] mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base font-light text-[#B6A596] tracking-wide leading-relaxed">
                    <strong className="text-[#EBDCC4] font-semibold">AI Interview Practice</strong> — Face real-time conversational technical and behavioral mocks with immediate coding reviews.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#DC9F85] rounded-[1px] mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base font-light text-[#B6A596] tracking-wide leading-relaxed">
                    <strong className="text-[#EBDCC4] font-semibold">Live Speech Analytics</strong> — Diagnose pacing (WPM), speech clarity, and track filler-word occurrences during responses.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#DC9F85] rounded-[1px] mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base font-light text-[#B6A596] tracking-wide leading-relaxed">
                    <strong className="text-[#EBDCC4] font-semibold">ATS Resume Check</strong> — Scan and score your resume structure against target job rules to highlight critical skill gaps.
                  </p>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#DC9F85] animate-pulse" />
                <span className="text-[10px] md:text-xs font-mono font-extrabold uppercase tracking-widest text-[#B6A596]">
                  Active Sandbox Mode
                </span>
              </div>
            </div>

            {/* Spacer Column 6 */}
            <div className="hidden md:block md:col-span-1" />

            {/* Columns 7-12: Action Launcher Call-to-Action */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  const targetId = (user && stats && stats.total_interviews > 0) ? "stats" : "roles";
                  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="editorial-btn-primary w-full py-4.5 px-8 text-xs font-bold tracking-[0.25em] uppercase rounded-[4px] flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                LAUNCH EVALUATION SANDBOX
              </button>

              {/* Sub-caption */}
              <span className="text-[9.5px] font-mono text-[#35211A] text-left uppercase tracking-widest">
                Zero configurations. Pure utility.
              </span>
            </div>

          </div>

        </footer>

      </div>

      {/* SECTION 1.5: Performance Diagnostics Board Grid */}
      {user && stats && stats.total_interviews > 0 && (
        <section id="stats" className="w-full flex flex-col gap-6 py-20 mt-20 border-t border-[#35211A] scroll-mt-28 text-left z-20 relative animate-fade-in-up">
          <div className="w-full flex flex-col gap-2.5">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
              Performance Analytics
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-[#EBDCC4] pb-4 border-b border-[#35211A]">
              Webcam Mock Diagnostics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {/* Card 1: Core Metrics Progress Gauges */}
            <div className="bg-[#181818] border border-[#66473B] rounded-[4px] p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] flex items-center justify-center text-[#DC9F85]">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Diagnostics Summary</h3>
                  <p className="text-[10px] text-[#B6A596] font-mono uppercase tracking-wider">Global Averages</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 my-6 text-center">
                <CircularGauge score={loading ? 0 : stats ? Math.round(stats.average_clarity) : 0} label="Clarity" color="#DC9F85" />
                <CircularGauge score={loading ? 0 : stats ? Math.round(stats.average_relevance) : 0} label="Relevance" color="#DC9F85" />
                <CircularGauge score={loading ? 0 : stats ? Math.round(stats.average_grammar) : 0} label="Grammar" color="#DC9F85" />
              </div>

              <div className="flex items-center justify-between text-xs border-t border-[#35211A] pt-3.5 font-mono uppercase tracking-wider text-[9px] text-[#66473B]">
                <span>Completed Sessions:</span>
                <span className="font-bold text-[#EBDCC4]">{loading ? "..." : stats?.total_interviews || 0}</span>
              </div>
            </div>

            {/* Card 2: WPM Pacing Card */}
            <div className="bg-[#181818] border border-[#66473B] rounded-[4px] p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] flex items-center justify-center text-[#DC9F85]">
                  <Flame size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Speech Pacing Rate</h3>
                  <p className="text-[10px] text-[#B6A596] font-mono uppercase tracking-wider">Target: 110 - 140 WPM</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1.5 my-6 font-mono">
                <span className="text-4xl font-bold tracking-tight text-[#EBDCC4]">
                  {loading ? "..." : stats ? Math.round(stats.average_wpm) : "0"}
                </span>
                <span className="text-[10px] text-[#B6A596] font-bold uppercase tracking-wider">WPM</span>
              </div>

              <div className={`border p-3 rounded-[4px] text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider ${pacingNote.style}`}>
                <span className="font-bold">{pacingNote.text}</span>
              </div>
            </div>

            {/* Card 3: Dynamic Trend Chart */}
            <div className="bg-[#181818] border border-[#66473B] rounded-[4px] p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold text-[#EBDCC4] font-display uppercase tracking-wider">Filler Words Trend</h3>
                  <p className="text-[10px] text-[#B6A596] font-mono uppercase tracking-wider">Average Count Per Session</p>
                </div>
                <div className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC9F85] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DC9F85]"></span>
                </div>
              </div>
              <div className="my-2">
                {renderTrendChart()}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* SECTION 1.6: Scroll-Down Role Practice Selection Grid */}
      <section id="roles" className="w-full flex flex-col gap-10 py-20 mt-20 border-t border-[#35211A] scroll-mt-28 text-left z-20 relative">
        
        {/* Section Title */}
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
            Interactive Assessment Suite
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-[#EBDCC4] pb-4 border-b border-[#35211A]">
            Select Practice Interview Focus
          </h2>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {roles.map((role) => (
            <div 
              key={role.id}
              className="editorial-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-300"
              onClick={() => handleStartSession(role.id)}
            >
              <div>
                {/* Minimal Editorial Icon Badge */}
                <div className="w-10 h-10 border border-[#66473B] rounded-[2px] text-[#DC9F85] flex items-center justify-center bg-[#35211A]/20 mb-5">
                  {role.icon}
                </div>
                
                {/* Role Title */}
                <h3 className="text-sm font-bold text-[#EBDCC4] font-display mb-2 uppercase tracking-wider">
                  {role.title}
                </h3>
                
                {/* Role Description */}
                <p className="text-[#B6A596] text-[11px] leading-relaxed mb-6 font-light">
                  {role.desc}
                </p>
              </div>

              <div>
                {/* Topic Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {role.topics.map((t, i) => (
                    <span key={i} className="text-[9px] font-mono font-bold bg-[#35211A]/25 border border-[#66473B]/30 text-[#B6A596] px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
                
                {/* Action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSession(role.id);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer font-mono"
                >
                  <Play size={8} className="fill-current" /> Start Mock
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* SECTION 2: Historical Practice Performance Analysis */}
      {user && interviews && interviews.length > 0 && (
        <section id="history" className="w-full flex flex-col gap-6 py-20 mt-20 border-t border-[#35211A] scroll-mt-28 text-left z-20 relative animate-fade-in-up">
          <div className="w-full flex flex-col gap-2.5">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
              Analytics Archive
            </span>
            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-[#EBDCC4] pb-4 border-b border-[#35211A]">
              Calibrated Performance History
            </h2>
          </div>

          <div className="bg-[#181818] border border-[#66473B] rounded-[4px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#35211A] bg-[#35211A]/10 text-[9px] uppercase tracking-wider font-mono font-bold text-[#66473B]">
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
                      <tr key={interview.id} className="border-b border-[#35211A]/60 hover:bg-[#35211A]/15 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#EBDCC4] font-mono uppercase text-xs">{interview.role}</td>
                        <td className="py-4 px-6 text-[#B6A596] font-light">
                          {new Date(interview.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-4 px-6 text-[#B6A596] font-mono">
                          {interview.responses.length} Question(s)
                        </td>
                        <td className="py-4 px-6">
                          {avgScore > 0 ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-[#DC9F85]">
                              ★ {avgScore}%
                            </span>
                          ) : (
                            <span className="text-[#66473B] font-mono uppercase tracking-wider text-[10px]">Pending Diagnostics</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => router.push(`/results/${interview.id}`)}
                            className="px-4 py-1.5 border border-[#66473B] hover:border-[#DC9F85] hover:text-[#DC9F85] bg-transparent text-[#EBDCC4] rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
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

      {/* SECTION 3: Features Overview */}
      <section id="features" className="w-full flex flex-col gap-10 py-20 mt-20 border-t border-neutral-300 dark:border-[#35211A] scroll-mt-28 text-left z-20 relative">
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
            01 / Platform Capabilities
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-neutral-900 dark:text-[#EBDCC4] pb-4 border-b border-neutral-300 dark:border-[#35211A]">
            Engineered for Fluent Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <div>
              <span className="text-xs font-mono font-extrabold text-[#DC9F85] block mb-4">[01. REAL-TIME DIAGNOSTICS]</span>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">Webcam & Audio Scans</h3>
              <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] leading-relaxed font-light">
                Face realistic mock questions. Our frontend client extracts speech patterns, pacing rate (WPM), and spoken syntax to calibrate your conversational scorecards.
              </p>
            </div>
          </div>
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <div>
              <span className="text-xs font-mono font-extrabold text-[#DC9F85] block mb-4">[02. CV SCORE SCAN]</span>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">ATS Resume Checker</h3>
              <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] leading-relaxed font-light">
                Scan your PDF structures directly in the browser sandbox. Highlights missing technical keyword metrics, formatting issues, and compliance scores.
              </p>
            </div>
          </div>
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <div>
              <span className="text-xs font-mono font-extrabold text-[#DC9F85] block mb-4">[03. AI CAREER COACH]</span>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">Interactive Advisor</h3>
              <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] leading-relaxed font-light">
                Leverage a dedicated chatbot terminal to dissect previous transcript responses, obtain optimized sample answers, or plan application strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Testimonials */}
      <section id="testimonials" className="w-full flex flex-col gap-10 py-20 mt-20 border-t border-neutral-300 dark:border-[#35211A] scroll-mt-28 text-left z-20 relative">
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
            02 / Calibrated Trust
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-neutral-900 dark:text-[#EBDCC4] pb-4 border-b border-neutral-300 dark:border-[#35211A]">
            Validated by Modern Engineers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] italic leading-relaxed font-light mb-6">
              "The speech analytics highlighted that I was using over 15 filler words per minute. Calibrating my pacing rate down to 125 WPM made my system design reviews sound significantly more authoritative."
            </p>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#DC9F85]">— Staff Engineer, FinTech Sandbox</span>
          </div>
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] italic leading-relaxed font-light mb-6">
              "CognitiveCoach gave me a realistic sandbox to prepare for my DevOps mock interview. The dynamic Kubernetes scenarios matched exactly what the interviewers tested."
            </p>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#DC9F85]">— Site Reliability Engineer</span>
          </div>
          <div className="editorial-card p-6 flex flex-col justify-between hover:border-[#DC9F85] transition-all duration-300">
            <p className="text-neutral-600 dark:text-[#B6A596] text-[11px] italic leading-relaxed font-light mb-6">
              "The resume parser scans are brutally honest. It caught three critical missing tech stack keywords that were causing my applications to fail ATS screens."
            </p>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#DC9F85]">— Full Stack Web Developer</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section id="faq" className="w-full flex flex-col gap-10 py-20 mt-20 border-t border-neutral-300 dark:border-[#35211A] scroll-mt-28 text-left z-20 relative">
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#DC9F85] uppercase">
            03 / Frequently Asked
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-neutral-900 dark:text-[#EBDCC4] pb-4 border-b border-neutral-300 dark:border-[#35211A]">
            Platform Clarifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-xs">
          <div className="border border-neutral-300 dark:border-[#35211A] p-6 rounded-[4px] bg-white dark:bg-transparent">
            <h4 className="font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">How do webcam diagnostics work?</h4>
            <p className="text-neutral-600 dark:text-[#B6A596] leading-relaxed font-light text-[11px]">
              We utilize real-time browser streams to analyze audio frequencies and transcription structures. All video frames remain local and private, only extracting pacing counts and spoken text to compute analytics.
            </p>
          </div>
          <div className="border border-neutral-300 dark:border-[#35211A] p-6 rounded-[4px] bg-white dark:bg-transparent">
            <h4 className="font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">Is there any waitlist fee?</h4>
            <p className="text-neutral-600 dark:text-[#B6A596] leading-relaxed font-light text-[11px]">
              No. The Evaluation Sandbox is fully accessible. Entering our waiting list grants early access to premium offline training simulations and deep resume updates.
            </p>
          </div>
          <div className="border border-neutral-300 dark:border-[#35211A] p-6 rounded-[4px] bg-white dark:bg-transparent">
            <h4 className="font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">What roles are supported?</h4>
            <p className="text-neutral-600 dark:text-[#B6A596] leading-relaxed font-light text-[11px]">
              We seed specialized default questions for Software Engineering, Product Management, Full Stack Web Developer, AI Engineer, Data Scientist, IoT Engineer, DevOps, Cybersecurity, and behavioral HR interviews.
            </p>
          </div>
          <div className="border border-neutral-300 dark:border-[#35211A] p-6 rounded-[4px] bg-white dark:bg-transparent">
            <h4 className="font-bold text-neutral-900 dark:text-[#EBDCC4] font-display uppercase tracking-wider mb-2">Can I view past results?</h4>
            <p className="text-neutral-600 dark:text-[#B6A596] leading-relaxed font-light text-[11px]">
              Yes. When authenticated, your dashboard automatically preserves your full performance history with custom quantitative metrics scorecards.
            </p>
          </div>
        </div>
      </section>


      {/* 4. Rotating Waitlist Badge in Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 w-16 h-16 md:w-20 md:h-20 pointer-events-none z-50">
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Inner circle line */}
          <div className="absolute w-[80%] h-[80%] rounded-full border border-[#35211A]/40" />
          {/* SVG Rotating text path */}
          <svg className="absolute w-full h-full animate-rotate-slow" viewBox="0 0 100 100">
            <path
              id="badgePath"
              d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              fill="none"
            />
            <text className="font-mono text-[9px] font-extrabold fill-[#35211A] tracking-[0.18em]">
              <textPath href="#badgePath">
                WAITING LIST • WAITING LIST • WAITING LIST • 
              </textPath>
            </text>
          </svg>
        </div>
      </div>

    </div>
  );
}
