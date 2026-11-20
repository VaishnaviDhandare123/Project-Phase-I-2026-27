import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileAudio,
  CheckCircle2,
  Sparkles,
  Sliders,
  Play,
  ArrowRight,
  Clock,
  Zap,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

export const SpeechToTextPage = () => {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('openai/whisper-tiny');
  const [language, setLanguage] = useState('en');
  const [task, setTask] = useState('transcribe');

  // Preprocessing options
  const [normalize, setNormalize] = useState(true);
  const [trimSilence, setTrimSilence] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select or upload an audio file first.');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', model);
    formData.append('language', language);
    formData.append('task', task);
    formData.append('normalize', normalize);
    formData.append('trim_silence', trimSilence);
    formData.append('noise_reduction', noiseReduction);

    try {
      const res = await api.transcribeUpload(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Transcription failed. Please verify the audio file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Speech-to-Text Transcription
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Convert uploaded audio into accurate text using OpenAI Whisper with configurable signal preprocessing.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-8 text-center transition-colors mb-6 bg-slate-50/50 dark:bg-navy-950/40">
          <input
            type="file"
            id="audio-upload"
            accept=".wav,.mp3,.m4a,.flac,.ogg,.webm"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
              {file ? file.name : 'Click to browse or drag and drop audio file'}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Supported: WAV, MP3, M4A, FLAC, OGG, WebM (Up to 50 MB)
            </p>
            {file && (
              <span className="mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Preprocessing ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </label>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Whisper Model Engine
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="openai/whisper-tiny">Whisper Tiny (Default - Fast CPU)</option>
              <option value="openai/whisper-base">Whisper Base (Higher Accuracy)</option>
              <option value="openai/whisper-small">Whisper Small (Extended Capacity)</option>
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Spoken Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="en">English (en)</option>
              <option value="auto">Automatic Language Detection</option>
              <option value="es">Spanish (es)</option>
              <option value="fr">French (fr)</option>
              <option value="de">German (de)</option>
              <option value="hi">Hindi (hi)</option>
            </select>
          </div>

          {/* Task Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Decoding Task
            </label>
            <select
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="transcribe">Transcribe (Speech to same language text)</option>
              <option value="translate">Translate (Direct Translation to English)</option>
            </select>
          </div>
        </div>

        {/* Preprocessing Options */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Audio Preprocessing Engine (16 kHz Resampling Automatic)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Peak & RMS Normalization</span>
                <p className="text-[10px] text-slate-400">Balances inter-speaker volume gain</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={trimSilence}
                onChange={(e) => setTrimSilence(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Silence Trimming (VAD)</span>
                <p className="text-[10px] text-slate-400">Trims non-speech margins (28 dB)</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noiseReduction}
                onChange={(e) => setNoiseReduction(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Spectral Noise Gating</span>
                <p className="text-[10px] text-slate-400">Suppresses background acoustic floor</p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleTranscribe}
          disabled={loading || !file}
          className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Transformer Inference...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Start Automatic Speech Recognition
            </>
          )}
        </button>
      </div>

      {/* Transcription Results Display */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  Inference Complete
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Recognized Speech Transcription
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/editor?id=${result.transcription_id}`)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" /> Open in Editor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="mb-6">
              <WaveformVisualizer
                audioUrl={`/static/audio/${result.filename.split('.')[0]}_proc.wav`}
                waveformData={result.waveform_preview}
                duration={result.duration_sec}
              />
            </div>

            {/* Transcript Text Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 font-normal text-sm text-slate-800 dark:text-slate-100 leading-relaxed mb-6">
              "{result.edited_transcript || result.original_transcript}"
            </div>

            {/* Execution Metrics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Audio Duration</span>
                <span className="font-bold text-slate-800 dark:text-white">{result.duration_sec} s</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Processing Latency</span>
                <span className="font-bold text-slate-800 dark:text-white">{result.processing_time_sec} s</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Speed Factor (RTF)</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{result.real_time_factor}x</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Speaking Rate</span>
                <span className="font-bold text-slate-800 dark:text-white">{result.speaking_rate_wpm} WPM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
