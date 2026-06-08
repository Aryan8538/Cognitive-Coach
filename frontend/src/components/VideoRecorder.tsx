"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Video, Circle, Square, RefreshCw, Volume2 } from "lucide-react";

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  isProcessing: boolean;
}

export default function VideoRecorder({ onRecordingComplete, isProcessing }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [permission, setPermission] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0); // 0 to 100
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getCameraPermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 }
      });
      setPermission(true);
      streamRef.current = streamData;
      if (videoRef.current) {
        videoRef.current.srcObject = streamData;
      }
      setupAudioVisualizer(streamData);
    } catch (err) {
      alert("Please allow camera and microphone access to record your mock interview.");
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    setRecording(false);
    mediaRecorderRef.current.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
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
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-panel w-full md:max-w-md bg-white/70 dark:bg-zinc-900/55 border border-slate-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm animate-fade-in-up">
      
      {/* Visual Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800/50 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <Video size={16} className="text-violet-600 dark:text-violet-400" />
          Camera Sandbox
        </h3>
        
        {permission && (
          <div className="flex items-center gap-3">
            {recording ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20">
                <Circle size={8} fill="currentColor" className="animate-pulse" />
                LIVE {formatTime(duration)}
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Ready</span>
            )}
            
            {/* Audio Indicator */}
            <div className="flex items-center gap-0.5 h-6">
              <Volume2 size={13} className="text-slate-400 dark:text-slate-500 mr-1" />
              <div className="w-0.5 rounded-sm bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(4, volume * 0.2)}px` }}></div>
              <div className="w-0.5 rounded-sm bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(4, volume * 0.15)}px` }}></div>
              <div className="w-0.5 rounded-sm bg-cyan-500 dark:bg-cyan-400 audio-bar" style={{ height: `${Math.max(4, volume * 0.25)}px` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Viewport Frame */}
      <div className="relative aspect-[4/3] bg-slate-900/5 dark:bg-black/30 rounded-xl overflow-hidden border border-slate-200/50 dark:border-zinc-800/50 flex items-center justify-center shadow-inner">
        {!permission ? (
          <div className="text-center p-6 max-w-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-200/50 dark:border-zinc-800/50">
              <CameraOff size={20} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              We require camera and microphone permission to analyze speech and pace.
            </p>
            <button className="btn btn-primary text-xs" onClick={getCameraPermission}>
              <Camera size={14} /> Enable Camera
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* AI Diagnostics Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/80 dark:bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center p-6 z-10">
            <RefreshCw size={28} className="text-violet-500 animate-spin" />
            <h4 className="text-sm font-bold text-white">AI Grading & Speech Diagnostics...</h4>
            <p className="text-[11px] text-slate-400">Evaluating pacing index and running transcript analysis</p>
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
              <Circle size={10} fill="white" stroke="transparent" /> Start Recording
            </button>
          ) : (
            <button 
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-300 active:scale-95 flex items-center gap-1.5 border border-transparent"
              onClick={stopRecording}
            >
              <Square size={10} fill="white" stroke="transparent" /> Finish Response
            </button>
          )}
        </div>
      )}
    </div>
  );
}
