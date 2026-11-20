import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Trash2, Send, Radio } from 'lucide-react';

export const MicRecorder = ({ onRecordingComplete, onChunkAvailable }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Audio Context for real-time visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          if (onChunkAvailable) {
            onChunkAvailable(event.data);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(fullBlob);
        setAudioBlob(fullBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start(1000); // chunk every 1.0s
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied or device unavailable: " + err.message);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopRecordingCleanup();
    }
  };

  const stopRecordingCleanup = () => {
    setIsRecording(false);
    setIsPaused(false);
    clearInterval(timerRef.current);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const discardRecording = () => {
    stopRecordingCleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  };

  const handleSubmit = () => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob, duration);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Pulsing Mic Core */}
        <div className="relative mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? isPaused
                  ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500'
                  : 'bg-rose-500/20 text-rose-500 border-2 border-rose-500 animate-pulse'
                : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
            }`}
          >
            {isRecording ? (
              <Radio className="w-10 h-10 animate-spin" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </div>
        </div>

        {/* Real-time Frequency Canvas */}
        <div className="w-full h-12 bg-slate-50 dark:bg-navy-950 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800">
          {isRecording ? (
            <canvas ref={canvasRef} width={280} height={40} className="w-full h-full" />
          ) : (
            <span className="text-xs text-slate-400">Microphone idle</span>
          )}
        </div>

        {/* Timer */}
        <div className="font-mono text-2xl font-bold tracking-tight mb-6 text-slate-800 dark:text-white">
          {formatTimer(duration)}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </button>
          )}

          {isRecording && (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="p-3 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors"
                  title="Resume"
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="p-3 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-colors"
                  title="Pause"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={stopRecording}
                className="p-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                title="Stop Recording"
              >
                <Square className="w-5 h-5" />
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <div className="flex items-center gap-3">
              <audio src={audioUrl} controls className="h-10 rounded-lg max-w-[200px]" />
              <button
                onClick={discardRecording}
                className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Send className="w-4 h-4" /> Transcribe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
