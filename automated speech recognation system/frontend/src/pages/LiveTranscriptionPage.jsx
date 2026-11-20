import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Activity,
  FileText,
  ArrowRight,
  Info,
  Radio,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { MicRecorder } from '../components/audio/MicRecorder';

export const LiveTranscriptionPage = () => {
  const [chunksTranscript, setChunksTranscript] = useState([]);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [completedRecord, setCompletedRecord] = useState(null);

  const navigate = useNavigate();

  const handleChunk = async (chunkBlob) => {
    const formData = new FormData();
    formData.append('file', chunkBlob, 'chunk.wav');
    formData.append('model_name', 'openai/whisper-tiny');
    formData.append('session_id', sessionId);

    try {
      const res = await api.transcribeLiveChunk(formData);
      if (res.data.chunk_transcript && res.data.chunk_transcript.trim()) {
        setChunksTranscript((prev) => [...prev, res.data.chunk_transcript]);
      }
    } catch (e) {
      // ignore empty chunks
    }
  };

  const handleRecordingComplete = async (audioBlob, duration) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'live_recording.wav');
    formData.append('model_name', 'openai/whisper-tiny');

    try {
      const res = await api.transcribeRecording(formData);
      setCompletedRecord(res.data);
      setFinalTranscript(res.data.edited_transcript || res.data.original_transcript);
    } catch (err) {
      alert("Error finalizing live recording: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2 border border-brand-200 dark:border-brand-800">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Near-Real-Time Sliding Chunk Processing
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Live Speech Transcription
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Record speech directly from your microphone with real-time sliding-window inference and incremental transcript generation.
        </p>
      </div>

      {/* Scientific Note Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="font-semibold block mb-0.5">Academic Streaming Note</strong>
          Transformer-based Whisper is inherently an encoder-decoder architecture requiring windowed audio frames.
          This module processes live audio using overlapping 1.0s sliding buffers rather than zero-latency CTC streaming,
          ensuring maximum phonetic accuracy at chunk boundaries.
        </div>
      </div>

      {/* Microphone Capture Center */}
      <MicRecorder
        onChunkAvailable={handleChunk}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Live Stream Incremental Output */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500 animate-pulse" />
            Live Recognition Stream
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {chunksTranscript.length} Chunks Processed
          </span>
        </div>

        <div className="min-h-32 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 font-normal text-sm leading-relaxed text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800/80">
          {finalTranscript ? (
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-500 block mb-2">
                ✓ Finalized Transcript
              </span>
              "{finalTranscript}"
            </div>
          ) : chunksTranscript.length > 0 ? (
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-brand-500 block mb-2 animate-pulse">
                • Streaming Chunks...
              </span>
              "{chunksTranscript.join(' ')}"
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">
              Spoken words will appear here incrementally as audio chunks are collected and transcribed...
            </span>
          )}
        </div>

        {/* Action Button if Finalized */}
        {completedRecord && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => navigate(`/editor?id=${completedRecord.transcription_id}`)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" /> Open in Transcript Editor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
