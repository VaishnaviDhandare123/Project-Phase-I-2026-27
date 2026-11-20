import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileAudio,
  Mic,
  Clock,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Database,
  Brain,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalTranscriptions: 0,
    totalDurationSec: 0,
    totalWords: 0,
    recentTranscriptions: [],
    recentEvaluations: [],
    datasetsCount: 0,
    experimentsCount: 0,
  });
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [histRes, evalRes, dtsRes, expRes, sysRes] = await Promise.all([
        api.getHistory({ limit: 5 }),
        api.listEvaluations(),
        api.listDatasets(),
        api.listCheckpoints(),
        api.getSystemResources()
      ]);

      const historyItems = histRes.data.items || [];
      const totalWords = historyItems.reduce((acc, curr) => acc + (curr.word_count || 0), 0);
      const totalSec = historyItems.reduce((acc, curr) => acc + (curr.duration_sec || 0), 0);

      setStats({
        totalTranscriptions: histRes.data.total || historyItems.length,
        totalDurationSec: Math.round(totalSec),
        totalWords: totalWords,
        recentTranscriptions: historyItems.slice(0, 5),
        recentEvaluations: (evalRes.data || []).slice(0, 4),
        datasetsCount: (dtsRes.data || []).length,
        experimentsCount: (expRes.data || []).length
      });
      setTelemetry(sysRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDuration = (sec) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-brand-800/40">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            SpeechSense AI Operational Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Speech Recognition & Research Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Welcome to the centralized laboratory interface. Perform zero-shot ASR inference, evaluate acoustic
            characteristics, run fine-tuning trials, and inspect speech reality gaps.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <NavLink
              to="/speech-to-text"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
            >
              <FileAudio className="w-4 h-4" /> Transcribe Audio
            </NavLink>
            <NavLink
              to="/live"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Live Microphone
            </NavLink>
            <NavLink
              to="/dysarthric-research"
              className="px-5 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Brain className="w-4 h-4" /> Dysarthric Research
            </NavLink>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Activity className="w-96 h-96" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Transcriptions</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileAudio className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.totalTranscriptions}
          </p>
          <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Persistent Records
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Audio Processed</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {formatDuration(stats.totalDurationSec)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            16 kHz Sample Rate
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Words Recognized</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.totalWords.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            OpenAI Whisper Engine
          </span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Research Benchmarks</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.datasetsCount} <span className="text-xs font-normal text-slate-400">Datasets</span>
          </p>
          <span className="text-[11px] text-purple-500 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> {stats.experimentsCount} Checkpoints Loaded
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transcriptions */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transcription Results</h3>
              <p className="text-xs text-slate-400">Actual deep-learning recognition outputs</p>
            </div>
            <NavLink
              to="/history"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {stats.recentTranscriptions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No transcription history found. Upload an audio recording to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentTranscriptions.map((t) => (
                <div
                  key={t.transcription_id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-navy-950/50 hover:border-brand-300 dark:hover:border-brand-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {t.filename}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                        {t.model_used.replace('openai/', '')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      "{t.edited_transcript || t.original_transcript}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>{t.duration_sec}s</span>
                    <span>{t.real_time_factor}x RTF</span>
                    <NavLink
                      to={`/editor?id=${t.transcription_id}`}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand-600 text-xs font-sans font-medium"
                    >
                      Inspect
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: System Resource & Model Telemetry */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-brand-500" /> System Telemetry
              </h3>
              <button
                onClick={fetchDashboardData}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Live hardware performance metrics under current PyTorch execution.
            </p>

            {telemetry && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">CPU Usage ({telemetry.cpu.logical_cores} Cores)</span>
                    <span className="font-mono font-bold">{telemetry.cpu.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${telemetry.cpu.percent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">System RAM ({telemetry.ram.used_gb} / {telemetry.ram.total_gb} GB)</span>
                    <span className="font-mono font-bold">{telemetry.ram.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${telemetry.ram.percent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Storage Workspace ({telemetry.disk.free_gb} GB Free)</span>
                    <span className="font-mono font-bold">{telemetry.disk.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${telemetry.disk.percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compute Device:</span>
                    <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {telemetry.gpu.available ? telemetry.gpu.device_name : 'AMD/Intel CPU'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Model:</span>
                    <span className="font-mono font-semibold">Whisper-tiny (39M)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <NavLink
              to="/settings"
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-center text-xs font-semibold block transition-colors"
            >
              Hardware & Settings Details
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
