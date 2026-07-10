"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, Users, Cpu, BarChart3, Activity, Cloud, Shield, Play, HelpCircle 
} from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);

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

    async function fetchInterviews() {
      const token = localStorage.getItem("token") || "";
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/interviews`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setInterviews(data);
          }
        } catch (e) {
          console.warn("Failed to fetch interviews history", e);
        }
      }
    }
    fetchInterviews();
  }, []);

  const handleStartSession = (roleName) => {
    router.push(`/interview?role=${encodeURIComponent(roleName)}`);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#EBDCC4] font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto overflow-x-hidden select-none">
      
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
            <h1 className="absolute top-1 left-1 md:top-2 md:left-2 text-[15vw] md:text-[11.5vw] font-display font-bold uppercase tracking-tighter leading-[0.82] text-outlined select-none pointer-events-none opacity-60">
              COGNITIVECOACH
            </h1>
            {/* Layer 2 (Front Solid) */}
            <h1 className="relative text-[15vw] md:text-[11.5vw] font-display font-bold uppercase tracking-tighter leading-[0.82] text-[#EBDCC4] select-none">
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
                  const targetId = (user && interviews && interviews.length > 0) ? "history" : "roles";
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

      {/* SECTION 1.5: Historical Practice Performance Analysis */}
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

      {/* SECTION 2: Scroll-Down Role Practice Selection Grid */}
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
