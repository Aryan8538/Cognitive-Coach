"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Video, Circle, Square, RefreshCw, Volume2 } from "lucide-react";

export default function VideoRecorder({ onRecordingComplete, isProcessing }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [permission, setPermission] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0); // 0 to 100
  const [wordCount, setWordCount] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync camera stream once video DOM element mounts after permission state updates
  useEffect(() => {
    if (permission && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permission]);

  // Spacebar hotkey to start/stop recording (ignoring input field contexts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && permission && !isProcessing) {
        const activeEl = document.activeElement;
        if (
          activeEl && 
          (activeEl.tagName === "INPUT" || 
           activeEl.tagName === "TEXTAREA" || 
           activeEl.isContentEditable || 
           activeEl.className.includes("input") || 
           activeEl.className.includes("editor"))
        ) {
          return;
        }
        e.preventDefault();
        if (recording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [permission, recording, isProcessing]);

  const getCameraPermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 }
      });
      streamRef.current = streamData;
      setPermission(true);
      setupAudioVisualizer(streamData);
    } catch (err) {
      alert("Please allow camera and microphone access to record your mock interview.");
    }
  };

  const setupAudioVisualizer = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolume(Math.min(100, Math.round(average * 2.5)));
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    } catch (e) {
      console.error("Failed to setup audio visualizer:", e);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    setRecording(true);
    setRecordedChunks([]);
    setDuration(0);
    setWordCount(0);
    setCurrentTranscript("");
    
    const options = { mimeType: "video/webm;codecs=vp9,opus" };
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, options);
    } catch (e) {
      recorder = new MediaRecorder(streamRef.current);
    }
    
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      setRecordedChunks((prev) => [...prev, event.data]);
    };
    
    recorder.start();
    
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (event) => {
          let totalText = "";
          for (let i = 0; i < event.results.length; ++i) {
            totalText += event.results[i][0].transcript + " ";
          }
          const trimmed = totalText.trim();
          setCurrentTranscript(trimmed);
          const totalWords = trimmed.split(/\s+/).filter(Boolean).length;
          setWordCount(totalWords);
        };
        rec.onerror = (e) => {
          console.warn("Speech recognition warning/error:", e);
        };
        rec.onend = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try {
              rec.start();
            } catch (err) {
              console.warn("Failed to restart speech recognition:", err);
            }
          }
        };
        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Speech recognition startup error:", err);
      }
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    setRecording(false);
    mediaRecorderRef.current.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    if (recordedChunks.length > 0 && !recording) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      onRecordingComplete(blob, duration);
    }
  }, [recordedChunks, recording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {}
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const elapsedMinutes = duration / 60.0;
  const currentWpm = duration > 2 ? Math.round(wordCount / elapsedMinutes) : 0;

  const getPacingInfo = (wpm) => {
    if (wpm === 0) {
      return {
        label: "Calibrating...",
        colorStyle: "bg-slate-500/10 border-slate-550/20 text-slate-400"
      };
    }
    if (wpm < 110) {
      return {
        label: "Too Slow",
        colorStyle: "bg-cyan-500/15 border-cyan-500/25 text-cyan-700 dark:text-cyan-405"
      };
    } else if (wpm > 145) {
      return {
        label: "Too Fast",
        colorStyle: "bg-amber-500/15 border-amber-500/25 text-amber-700 dark:text-amber-405"
      };
    } else {
      return {
        label: "Ideal Pacing",
        colorStyle: "bg-emerald-500/15 border-emerald-500/25 text-emerald-700 dark:text-emerald-405"
      };
    }
  };

  return (
    <div className="glass-panel w-full md:max-w-md bg-white/70 dark:bg-zinc-900/55 backdrop-blur-lg border border-slate-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-500/20 dark:hover:border-violet-500/20 transition-all duration-300 animate-fade-in-up">
      
      {/* Visual Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-850/50 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
          <Video size={16} className="text-violet-600 dark:text-violet-400" />
          Camera Sandbox
        </h3>
        
        {permission && (
          <div className="flex items-center gap-3">
            {recording ? (
              <div className="flex items-center gap-1.5 bg-rose-500/10 dark:bg-rose-500/15 px-2.5 py-1 rounded-full text-[10px] font-bold text-rose-650 dark:text-rose-400 border border-rose-500/25 animate-pulse-slow">
                <Circle size={6.5} fill="currentColor" className="text-rose-600 dark:text-rose-400 animate-pulse" />
                REC {formatTime(duration)}
              </div>
            ) : (
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">Standby</span>
            )}
            
            {/* Audio Indicator */}
            <div className="flex items-center gap-[3px] h-5 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-850/40 border border-slate-150 dark:border-zinc-800/50">
              <Volume2 size={12} className="text-slate-400 dark:text-slate-500 mr-0.5" />
              <div className="w-[3px] rounded-full bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(3, volume * 0.12)}px` }}></div>
              <div className="w-[3px] rounded-full bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(3, volume * 0.22)}px` }}></div>
              <div className="w-[3px] rounded-full bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(3, volume * 0.16)}px` }}></div>
              <div className="w-[3px] rounded-full bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(3, volume * 0.28)}px` }}></div>
              <div className="w-[3px] rounded-full bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(3, volume * 0.08)}px` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewport Frame */}
      <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-200/50 dark:border-zinc-800/50 flex items-center justify-center shadow-inner">
        {!permission ? (
          <div className="text-center p-6 max-w-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <CameraOff size={20} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              We require camera and microphone permission to analyze speech pacing and filler words.
            </p>
            <button className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center gap-1.5" onClick={getCameraPermission}>
              <Camera size={14} /> Enable Sandbox Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            
            {/* Viewport Corners */}
            <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-[2px] border-l-[2px] border-violet-500/80 rounded-tl-sm pointer-events-none z-10"></div>
            <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-[2px] border-r-[2px] border-violet-500/80 rounded-tr-sm pointer-events-none z-10"></div>
            <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-[2px] border-l-[2px] border-violet-500/80 rounded-bl-sm pointer-events-none z-10"></div>
            <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-[2px] border-r-[2px] border-violet-500/80 rounded-br-sm pointer-events-none z-10"></div>

            {/* Sweep Laser Scanner Line */}
            {recording && (
              <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent animate-scan pointer-events-none z-10"></div>
            )}

            {/* Real-time Pacing HUD Overlay */}
            {recording && (
              <div className={`absolute top-3.5 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-md transition-all duration-300 z-20 flex items-center gap-1.5 ${
                getPacingInfo(currentWpm).colorStyle
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {currentWpm} WPM &bull; {getPacingInfo(currentWpm).label}
              </div>
            )}

            {/* Live Subtitles HUD Overlay */}
            {recording && currentTranscript && (
              <div className="absolute bottom-3.5 inset-x-3.5 bg-black/60 backdrop-blur-sm border border-white/10 text-white rounded-xl p-2.5 text-center text-[11px] font-medium leading-normal max-h-16 overflow-y-auto pointer-events-none z-20">
                "{currentTranscript}"
              </div>
            )}

            {/* Mic Calibrator Check Overlay */}
            {!recording && (
              <div className="absolute bottom-3.5 inset-x-3.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 z-20 flex flex-col gap-1.5 items-center">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Microphone Calibration check</span>
                <div className="flex items-center gap-2 w-full justify-center">
                  <span className="text-[10px] text-slate-300 font-medium">Volume: {volume}%</span>
                  <div className="flex-grow max-w-[120px] h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-75 ${volume > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${volume}%` }} 
                    />
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase">
                    Ready
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* AI Diagnostics Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 z-25">
            <div className="relative flex items-center justify-center">
              <RefreshCw size={32} className="text-violet-500 animate-spin" />
              <div className="absolute w-12 h-12 rounded-full border border-violet-500/30 border-t-transparent animate-ping"></div>
            </div>
            <h4 className="text-sm font-bold text-white font-display mt-2">AI Diagnostics Analysis...</h4>
            <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">Processing speech velocity indexes, calculating grammar scorecards, and compiling responses.</p>
          </div>
        )}
      </div>

      {/* Interactive Controls */}
      {permission && !isProcessing && (
        <div className="flex justify-center gap-4 mt-5">
          {!recording ? (
            <button 
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/25 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
              onClick={startRecording}
            >
              <Circle size={9} fill="white" stroke="transparent" className="animate-pulse" /> Start Recording
            </button>
          ) : (
            <button 
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-650 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
              onClick={stopRecording}
            >
              <Square size={9} fill="white" stroke="transparent" /> Stop & Submit Response
            </button>
          )}
        </div>
      )}
    </div>
  );
}
