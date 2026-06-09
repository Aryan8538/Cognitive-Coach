"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Users, BarChart3, HelpCircle, Activity, Trophy, AlertTriangle, ArrowRight, Play, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

interface StatsData {
  total_interviews: number;
  average_clarity: number;
  average_relevance: number;
  average_grammar: number;
  filler_words_trend: { date: string; count: string }[];
  average_wpm: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setBackendOffline(false);
        } else {
          setBackendOffline(true);
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard stats", err);
        setBackendOffline(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const roles = [
    {
      id: "Software Engineer",
      title: "Software Engineer",
      icon: <Terminal size={20} />,
      desc: "Practice system architectural design and coding logic explanation. Standard questions cover scalability, cycle detection, and key/value caching.",
      gradient: "from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400",
      topics: ["System Design", "Coding Logic"]
    },
    {
      id: "Product Manager",
      title: "Product Manager",
      icon: <Users size={20} />,
      desc: "Refine product lifecycle strategy, market metrics, and user prioritization. Questions test pricing launches and driver metrics.",
      gradient: "from-cyan-500 to-sky-500 dark:from-cyan-400 dark:to-sky-400",
      topics: ["Product Strategy", "Growth Metrics"]
    },
    {
      id: "Data Analyst",
      title: "Data Analyst",
      icon: <BarChart3 size={20} />,
      desc: "Practice structuring analytical reports, A/B experiments, and join queries. Focuses on significance, sample sizes, and SQL.",
      gradient: "from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400",
      topics: ["A/B Testing", "SQL Optimization"]
    },
    {
      id: "Behavioral",
      title: "Behavioral / HR",
      icon: <HelpCircle size={20} />,
      desc: "Perfect the STAR format structure (Situation, Task, Action, Result) for leadership, conflict resolution, and behavioral reviews.",
      gradient: "from-amber-500 to-rose-500 dark:from-amber-400 dark:to-rose-400",
      topics: ["Conflict Resolution", "Core Values"]
    }
  ];

  const handleStartSession = (roleName: string) => {
    router.push(`/interview?role=${encodeURIComponent(roleName)}`);
  };

  const renderTrendChart = () => {
    if (!stats || stats.filler_words_trend.length === 0 || stats.filler_words_trend[0].date === "No Data") {
      return (
        <div className="flex items-center justify-center h-44 text-xs text-slate-400 dark:text-slate-500">
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
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(139,92,246,0.08)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding - chartHeight / 2} x2={width - padding} y2={height - padding - chartHeight / 2} stroke="rgba(139,92,246,0.08)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(139,92,246,0.15)" />
          <path d={areaD} fill="url(#chartGlow)" />
          <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} fontSize="8.5" className="fill-slate-900 dark:fill-white font-bold" textAnchor="middle">
                {p.count}
              </text>
              <text x={p.x} y={height - padding + 15} fontSize="8.5" className="fill-slate-400 dark:fill-slate-500" textAnchor="middle">
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-grow">
      
      {/* Offline Warning Banner */}
      {backendOffline && (
        <div className="flex items-start gap-3.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 p-4 rounded-xl mb-8 text-sm shadow-sm backdrop-blur-sm animate-fade-in-up">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">FastAPI Backend Server Offline:</strong> The web client cannot communicate with the backend at <code>http://localhost:8000</code>. 
            Ensure you boot the Python server using <code>uvicorn main:app --reload --port 8000</code> in your <code>/backend</code> workspace directory.
          </div>
        </div>
      )}

      {/* Hero Welcome Header */}
      <section className="flex flex-col gap-3 mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-100 dark:border-violet-900/50 w-fit shadow-sm">
          <Trophy size={13} /> B.Tech Capstone Project
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-2 text-slate-900 dark:text-white">
          Master Your Placement Interviews with <span className="bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-3xl leading-relaxed">
          CognitiveCoach analyzes your webcam mock interviews and provides intelligent insights on speaking confidence, pacing, filler words, technical relevance, and communication skills.
        </p>
      </section>

      {/* Stats Board Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Core Metrics Summary */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Diagnostics Summary</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Global averages</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <div className="bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/55 p-3 rounded-xl">
              <div className="text-lg font-extrabold text-violet-600 dark:text-violet-400">
                {loading ? "..." : stats ? `${stats.average_clarity}%` : "0%"}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Clarity</div>
            </div>
            <div className="bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/55 p-3 rounded-xl">
              <div className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                {loading ? "..." : stats ? `${stats.average_relevance}%` : "0%"}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Relevance</div>
            </div>
            <div className="bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/55 p-3 rounded-xl">
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : stats ? `${stats.average_grammar}%` : "0%"}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-1">Grammar</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/50 pt-3">
            <span className="text-slate-400 dark:text-slate-500">Completed Sessions:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{loading ? "..." : stats?.total_interviews || 0}</span>
          </div>
        </div>

        {/* WPM Pacing Card */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Speech Pacing Rate</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Target rate is between 110 - 140 WPM</p>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {loading ? "..." : stats ? stats.average_wpm : "0"}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">words/minute</span>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-xl text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <CheckCircle size={14} className="flex-shrink-0" />
            <span>Pacing average matches conversational standards.</span>
          </div>
        </div>

        {/* Dynamic Trend Chart */}
        <div className="glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Filler Words Trend</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Counts across recent sessions</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400"></div>
          </div>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">Loading chart...</div>
          ) : (
            renderTrendChart()
          )}
        </div>
      </section>

      {/* Role Selection Grid */}
      <section id="roles">
        <h2 className="text-xl font-bold tracking-tight mb-8 border-b border-slate-200/50 dark:border-zinc-800/60 pb-3 text-slate-800 dark:text-slate-200">
          Start a Mock Interview Session
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <div 
              key={role.id}
              className="group glass-panel bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-violet-500/40 dark:hover:border-violet-500/40 hover:-translate-y-1.5 hover:shadow-md hover:shadow-violet-500/5 dark:hover:shadow-violet-500/2 transition-all duration-300 ease-out animate-fade-in-up"
              style={{ animationDelay: `${0.1 * idx}s` }}
              onClick={() => handleStartSession(role.id)}
            >
              <div>
                {/* Gradient Rounded Icon Container */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${role.gradient} flex items-center justify-center text-white mb-6 shadow-sm shadow-violet-500/10 group-hover:scale-105 transition-transform duration-300`}>
                  {role.icon}
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  {role.desc}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {role.topics.map((t, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
                
                <button 
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-zinc-900/50 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 border border-slate-200/60 dark:border-zinc-800/80 hover:border-transparent py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-98"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSession(role.id);
                  }}
                >
                  <Play size={10} fill="currentColor" /> Start Interview <ArrowRight size={10} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
