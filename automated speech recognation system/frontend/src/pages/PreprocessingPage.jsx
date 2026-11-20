import React, { useState } from 'react';
import {
  Sliders,
  UploadCloud,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

export const PreprocessingPage = () => {
  const [file, setFile] = useState(null);
  const [normalize, setNormalize] = useState(true);
  const [trimSilence, setTrimSilence] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [targetSr, setTargetSr] = useState(16000);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('normalize', normalize);
    formData.append('trim_silence', trimSilence);
    formData.append('noise_reduction', noiseReduction);
    formData.append('target_sample_rate', targetSr);

    try {
      const res = await api.preprocessAudio(formData);
      setResult(res.data);
    } catch (e) {
      alert("Error preprocessing audio: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Audio Signal Preprocessing Pipeline
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Apply polyphase resampling, peak/RMS normalization, voice activity silence trimming, and spectral noise gating.
        </p>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-6 text-center transition-colors mb-6 bg-slate-50/50 dark:bg-navy-950/40">
          <input
            type="file"
            id="prep-upload"
            accept=".wav,.mp3,.m4a,.flac,.ogg,.webm"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="prep-upload" className="cursor-pointer flex flex-col items-center">
            <Sliders className="w-8 h-8 text-brand-500 mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {file ? file.name : 'Select audio recording for pipeline inspection'}
            </p>
          </label>
        </div>

        {/* Pipeline Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Amplitude Normalization</span>
            </label>
            <p className="text-[11px] text-slate-400">Peak scale to 0.95 without distortion</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={trimSilence}
                onChange={(e) => setTrimSilence(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Silence Trimming (VAD)</span>
            </label>
            <p className="text-[11px] text-slate-400">Energy thresholding at 28 dB</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={noiseReduction}
                onChange={(e) => setNoiseReduction(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Spectral Noise Reduction</span>
            </label>
            <p className="text-[11px] text-slate-400">Preserves subtle articulatory cues</p>
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={!file || loading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Executing Preprocessing Pipeline...' : 'Run Audio Preprocessing Pipeline'}
        </button>
      </div>

      {/* Preprocessing Comparison Result */}
      {result && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Before-and-After Preprocessing Analytics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Original Duration</span>
              <span className="font-bold">{result.original_duration_sec} s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Processed Duration</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{result.processed_duration_sec} s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Initial SNR</span>
              <span className="font-bold">{result.original_snr_db} dB</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Enhanced SNR</span>
              <span className="font-bold text-emerald-500">{result.processed_snr_db} dB</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-2">Processed Waveform Preview (16 kHz Resampled)</h4>
            <WaveformVisualizer
              audioUrl={result.processed_file_url}
              waveformData={result.waveform_preview}
              duration={result.processed_duration_sec}
            />
          </div>
        </div>
      )}
    </div>
  );
};
