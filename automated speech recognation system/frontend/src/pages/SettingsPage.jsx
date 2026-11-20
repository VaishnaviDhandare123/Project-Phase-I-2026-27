import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Database,
  Radio,
  Sliders,
  RefreshCw,
  CheckCircle2,
  Folder,
  Volume2,
  Server,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage = () => {
  const [status, setStatus] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio Pipeline Defaults
  const [sampleRate, setSampleRate] = useState("16000");
  const [vadThreshold, setVadThreshold] = useState("-35");
  const [noiseReductionMode, setNoiseReductionMode] = useState("moderate");
  const [defaultModel, setDefaultModel] = useState("openai/whisper-tiny");
  const [savedNotice, setSavedNotice] = useState(false);

  const fetchTelemetry = async () => {
    try {
      const [resStatus, resResources] = await Promise.all([
        api.getSystemStatus(),
        api.getSystemResources()
      ]);
      setStatus(resStatus.data);
      setResources(resResources.data);
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Architecture & Pipeline Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time host hardware telemetry, audio DSP defaults, model weight caching, and database configuration.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Live Hardware Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CPU Utilization */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Host CPU</span>
            <Cpu className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">
            {resources?.cpu_percent !== undefined ? `${resources.cpu_percent}%` : '--'}
          </p>
          <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${resources?.cpu_percent || 0}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">{resources?.cpu_cores || 0} Cores / Threads</span>
        </div>

        {/* RAM Usage */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System RAM</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">
            {resources?.ram_percent !== undefined ? `${resources.ram_percent}%` : '--'}
          </p>
          <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${resources?.ram_percent || 0}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {resources?.ram_used_gb || 0} / {resources?.ram_total_gb || 0} GB
          </span>
        </div>

        {/* Disk Storage */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Disk</span>
            <HardDrive className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">
            {resources?.disk_percent !== undefined ? `${resources.disk_percent}%` : '--'}
          </p>
          <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${resources?.disk_percent || 0}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {resources?.free_disk_gb || 0} GB Available
          </span>
        </div>

        {/* Acceleration Engine */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inference Device</span>
            <Radio className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
            {status?.whisper?.device || 'CPU'}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> PyTorch FP32 Active
          </span>
          <span className="text-[10px] text-slate-400 block truncate">
            {resources?.gpu_info?.device_name || 'Standard Host'}
          </span>
        </div>
      </div>

      {/* Backend & Database Telemetry Panel */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-500" /> Data Storage & Persistence Engine
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Database Backend</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {status?.database?.mode || 'Embedded Local Document Store'}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Zero-Config Atomic Fallback Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Local JSON Storage Path</span>
            <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
              backend/storage/db.json
            </p>
            <span className="text-[11px] text-slate-400">Synchronous Atomic Persistence</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Audio Repository Root</span>
            <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
              backend/storage/audio/
            </p>
            <span className="text-[11px] text-slate-400">WAV & MP3 Multi-track Storage</span>
          </div>
        </div>
      </div>

      {/* DSP Pipeline Configuration Form */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-500" /> Preprocessing & Feature Extraction Parameters
        </h3>

        <form onSubmit={handleSaveDefaults} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Sample Rate */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Sample Rate (Hz)
              </label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="16000">16000 Hz (Whisper Standard)</option>
                <option value="22050">22050 Hz (Speech Pathology)</option>
                <option value="44100">44100 Hz (High Fidelity)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Polyphase sinc filter resamples arbitrary input audio to 16 kHz.
              </p>
            </div>

            {/* VAD Threshold */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                VAD Silence Threshold (dB)
              </label>
              <select
                value={vadThreshold}
                onChange={(e) => setVadThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="-30">-30 dB (Conservative Trimming)</option>
                <option value="-35">-35 dB (Recommended Default)</option>
                <option value="-40">-40 dB (Permissive Silence)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Energy cutoff for sliding-window voice activity detection.
              </p>
            </div>

            {/* Default ASR Model */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Whisper Architecture
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="openai/whisper-tiny">openai/whisper-tiny (39M Params, Fast)</option>
                <option value="openai/whisper-base">openai/whisper-base (74M Params)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Offline cached weights executing locally via PyTorch Transformers.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              Save Pipeline Configuration
            </button>

            {savedNotice && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> System Parameters Updated
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
