"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#EBDCC4] font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      
      {/* Header spacer to prevent overlay clashes with the floating menu box */}
      <div className="w-full h-16 md:h-20 flex-shrink-0" />

      {/* 2. Central Hero Headline Section */}
      <main className="flex-grow flex flex-col justify-center items-start my-20 md:my-0 z-10 relative">
        
        {/* Early Access Tag */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-6 h-[1px] bg-[#DC9F85]" />
          <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#B6A596]">
            Early Access Protocol
          </span>
        </div>

        {/* Double-layered Depth Headline */}
        <div className="relative w-full select-none select-none">
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

      {/* 3. Bottom Content Section (Divider + 12-Column Grid) */}
      <footer className="w-full flex flex-col gap-8 md:gap-12 z-20">
        
        {/* Horizontal divider line */}
        <div className="w-full h-[1px] bg-[#35211A]" />

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Columns 1-5: Exclusivity Statement & Indicator */}
          <div className="md:col-span-5 flex flex-col gap-6 text-left">
            <p className="text-base md:text-lg font-light leading-relaxed text-[#B6A596] tracking-wide">
              We design custom, low-latency evaluation pipelines for speech fluency calibration. Strictly waitlisted access for technical teams and system architects.
            </p>
            
            {/* Status indicator */}
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#DC9F85] animate-pulse" />
              <span className="text-[10px] md:text-xs font-mono font-extrabold uppercase tracking-widest text-[#B6A596]">
                Batch 003 Filling
              </span>
            </div>
          </div>

          {/* Spacer Column 6 */}
          <div className="hidden md:block md:col-span-1" />

          {/* Columns 7-12: Email Waitlist Input Block */}
          <div className="md:col-span-6 flex flex-col gap-3">
            {status === "success" ? (
              <div className="border border-[#DC9F85] p-5 rounded-[4px] bg-[#35211A]/10 text-left">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#DC9F85] font-display mb-1">
                  Access Granted
                </h4>
                <p className="text-xs text-[#B6A596] leading-relaxed">
                  Your profile has been queued under Batch 003 protocols. We will reach out as capacity slots unlock.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full items-stretch">
                <input
                  type="email"
                  required
                  disabled={status === "loading"}
                  placeholder="ENTER ACCESS ACCESS KEY / EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-transparent border border-[#66473B] text-xs font-mono font-bold tracking-widest text-[#EBDCC4] placeholder-[#66473B] p-4 rounded-l-[4px] focus:outline-none focus:border-[#DC9F85] disabled:opacity-50 transition-colors uppercase"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="editorial-btn-primary px-8 text-xs font-bold tracking-widest uppercase rounded-r-[4px] flex items-center justify-center min-w-[120px] disabled:opacity-50"
                >
                  {status === "loading" ? "QUEUING..." : "REQUEST"}
                </button>
              </form>
            )}

            {/* Sub-caption */}
            <span className="text-[9.5px] font-mono text-[#35211A] text-left uppercase tracking-widest">
              Zero spam. Pure utility.
            </span>
          </div>

        </div>

      </footer>

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
