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
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const [permission, setPermission] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0); // 0 to 100
  const [wordCount, setWordCount] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPacingInfo = (wpm) => {
    if (wpm === 0) {
      return {
        label: "Calibrating...",
        colorStyle: "bg-[#181818]/90 border-[#66473B] text-[#B6A596]"
      };
    }
    if (wpm < 110) {
      return {
        label: "Too Slow",
        colorStyle: "bg-[#181818]/90 border-amber-900/35 text-amber-500"
      };
    } else if (wpm > 145) {
      return {
        label: "Too Fast",
        colorStyle: "bg-[#181818]/90 border-rose-900/35 text-rose-500"
      };
    } else {
      return {
        label: "Ideal Pacing",
        colorStyle: "bg-[#181818]/90 border-emerald-900/35 text-emerald-400"
      };
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

  const getCameraPermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 }
      });
      streamRef.current = streamData;
      setPermission(true);
      setupAudioVisualizer(streamData);
    } catch {
      alert("Please allow camera and microphone access to record your mock interview.");
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
    } catch {
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
      } catch {}
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    if (permission && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permission]);

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

  useEffect(() => {
    if (recordedChunks.length > 0 && !recording) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      onRecordingComplete(blob, duration);
    }
  }, [recordedChunks, recording, duration, onRecordingComplete]);

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
        } catch {}
      }
    };
  }, []);

  const elapsedMinutes = duration / 60.0;
  const currentWpm = duration > 2 ? Math.round(wordCount / elapsedMinutes) : 0;

  return (
    <div className="editorial-card w-full md:max-w-md p-6 transition-all duration-300 relative z-20">
      
      {/* Visual Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#35211A] mb-4">
        <h3 className="flex items-center gap-2 text-xs font-bold text-[#EBDCC4] font-display uppercase tracking-wider">
          <Video size={16} className="text-[#DC9F85]" />
          Camera Sandbox
        </h3>
        
        {permission && (
          <div className="flex items-center gap-3">
            {recording ? (
              <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-[4px] text-[10px] font-mono font-bold text-rose-400 border border-rose-500/25 animate-pulse-slow">
                <Circle size={6.5} fill="currentColor" className="text-rose-500 animate-pulse" />
                REC {formatTime(duration)}
              </div>
            ) : (
              <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#66473B]">Standby</span>
            )}
            
            {/* Audio Indicator */}
            <div className="flex items-center gap-[3px] h-5 px-1.5 py-0.5 rounded-[2px] bg-[#181818] border border-[#66473B]">
              <Volume2 size={12} className="text-[#66473B] mr-0.5" />
              <div className="w-[3px] rounded-full bg-[#DC9F85] audio-bar" style={{ height: `${Math.max(3, volume * 0.12)}px` }}></div>
              <div className="w-[3px] rounded-full bg-[#DC9F85] audio-bar" style={{ height: `${Math.max(3, volume * 0.22)}px` }}></div>
              <div className="w-[3px] rounded-full bg-[#DC9F85] audio-bar" style={{ height: `${Math.max(3, volume * 0.16)}px` }}></div>
              <div className="w-[3px] rounded-full bg-[#DC9F85] audio-bar" style={{ height: `${Math.max(3, volume * 0.28)}px` }}></div>
              <div className="w-[3px] rounded-full bg-[#DC9F85] audio-bar" style={{ height: `${Math.max(3, volume * 0.08)}px` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewport Frame */}
      <div className="relative aspect-[4/3] bg-[#181818] rounded-[4px] overflow-hidden border border-[#66473B] flex items-center justify-center">
        {!permission ? (
          <div className="text-center p-6 max-w-sm flex flex-col items-center select-none">
            <div className="w-12 h-12 rounded-[2px] bg-[#35211A]/20 border border-[#66473B] flex items-center justify-center text-[#B6A596] mb-4">
              <CameraOff size={20} />
            </div>
            <p className="text-xs text-[#B6A596] mb-5 leading-relaxed font-light">
              We require camera and microphone permission to analyze speech pacing and filler words.
            </p>
            <button 
              className="editorial-btn-primary px-5 py-2.5 rounded-[4px] text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              onClick={getCameraPermission}
            >
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
            <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-[2px] border-l-[2px] border-[#DC9F85]/70 rounded-tl-sm pointer-events-none z-10 animate-pulse"></div>
            <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-[2px] border-r-[2px] border-[#DC9F85]/70 rounded-tr-sm pointer-events-none z-10 animate-pulse"></div>
            <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-[2px] border-l-[2px] border-[#DC9F85]/70 rounded-bl-sm pointer-events-none z-10 animate-pulse"></div>
            <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-[2px] border-r-[2px] border-[#DC9F85]/70 rounded-br-sm pointer-events-none z-10 animate-pulse"></div>
 
            {/* Sweep Laser Scanner Line */}
            {recording && (
              <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#DC9F85]/80 to-transparent animate-scan pointer-events-none z-10"></div>
            )}
 
            {/* Real-time Pacing HUD Overlay */}
            {recording && (
              <div className={`absolute top-3.5 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md transition-all duration-300 z-20 flex items-center gap-1.5 ${
                getPacingInfo(currentWpm).colorStyle
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {currentWpm} WPM &bull; {getPacingInfo(currentWpm).label}
              </div>
            )}
 
            {/* Live Subtitles HUD Overlay */}
            {recording && currentTranscript && (
              <div className="absolute bottom-3.5 inset-x-3.5 bg-[#181818]/90 border border-[#66473B] text-[#EBDCC4] rounded-[4px] p-2.5 text-center text-[10.5px] font-mono leading-normal max-h-16 overflow-y-auto pointer-events-none z-20">
                &ldquo;{currentTranscript}&rdquo;
              </div>
            )}
 
            {/* Mic Calibrator Check Overlay */}
            {!recording && (
              <div className="absolute bottom-3.5 inset-x-3.5 bg-[#181818]/95 border border-[#66473B] rounded-[4px] p-3 z-20 flex flex-col gap-1.5 items-center">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B6A596]">Microphone Calibration check</span>
                <div className="flex items-center gap-2 w-full justify-center">
                  <span className="text-[10px] text-[#EBDCC4] font-mono">Volume: {volume}%</span>
                  <div className="flex-grow max-w-[120px] h-1.5 bg-[#35211A] rounded-[2px] overflow-hidden border border-[#66473B]/50">
                    <div 
                      className={`h-full transition-all duration-75 ${volume > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${volume}%` }} 
                    />
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-mono font-bold uppercase">
                    Ready
                  </span>
                </div>
              </div>
            )}
          </>
        )}
 
        {/* AI Diagnostics Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[#181818]/95 backdrop-blur-md border border-[#66473B] flex flex-col items-center justify-center gap-4 text-center p-6 z-25 font-sans">
            <div className="relative flex items-center justify-center">
              <RefreshCw size={32} className="text-[#DC9F85] animate-spin" />
              <div className="absolute w-12 h-12 rounded-full border border-[#DC9F85]/35 border-t-transparent animate-ping"></div>
            </div>
            <h4 className="text-sm font-bold text-[#EBDCC4] font-display mt-2 uppercase tracking-wide">AI Diagnostics Analysis...</h4>
            <p className="text-[10px] text-[#B6A596] max-w-[200px] leading-relaxed font-light">Processing speech velocity indexes, calculating grammar scorecards, and compiling responses.</p>
          </div>
        )}
      </div>
 
      {/* Interactive Controls */}
      {permission && !isProcessing && (
        <div className="flex justify-center gap-4 mt-5">
          {!recording ? (
            <button 
              className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-[4px] transition-all duration-300 active:scale-95 flex items-center gap-1.5 cursor-pointer font-display uppercase tracking-widest"
              onClick={startRecording}
            >
              <Circle size={9} fill="white" stroke="transparent" className="animate-pulse" /> Start Recording
            </button>
          ) : (
            <button 
              className="px-6 py-2.5 bg-[#DC9F85] hover:bg-[#EBDCC4] text-[#181818] font-bold text-xs rounded-[4px] transition-all duration-300 active:scale-95 flex items-center gap-1.5 cursor-pointer font-display uppercase tracking-widest"
              onClick={stopRecording}
            >
              <Square size={9} fill="black" stroke="transparent" /> Stop & Submit Response
            </button>
          )}
        </div>
      )}
    </div>
  );
}
