import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Mic,
  Activity,
  Layers,
  Sparkles,
  Database,
  Brain,
  ShieldCheck,
  Cpu,
  BarChart2,
  FileCheck2,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-navy-900/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              SpeechSense AI
            </span>
            <span className="text-[10px] ml-1.5 font-mono uppercase px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-900">
              Research ASR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/dashboard"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            Launch Platform <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 max-w-6xl mx-auto w-full text-center">
        {/* Animated Background Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Final Year BTech Computer Science Research Project
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto text-slate-900 dark:text-white">
          Transforming Human Speech into{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Intelligent, Accessible
          </span>{' '}
          and Analyzable Text
        </h1>

        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          An enterprise-grade, deep-learning Automatic Speech Recognition platform combining local
          Transformer Whisper inference with specialized low-resource dysarthric speech analysis,
          acoustic feature extraction, and empirical reality gap evaluation.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <NavLink
            to="/speech-to-text"
            className="px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95 flex items-center gap-2"
          >
            <Mic className="w-4 h-4" /> Start Speech-to-Text
          </NavLink>
          <NavLink
            to="/dysarthric-research"
            className="px-7 py-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-800 dark:text-white font-semibold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-purple-500" /> Explore Research Modules
          </NavLink>
        </div>

        {/* Waveform Animation Showcase */}
        <div className="max-w-3xl mx-auto p-4 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="h-16 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-brand-500 to-indigo-500 rounded-full animate-wave"
                style={{
                  height: `${20 + Math.abs(Math.sin(i * 0.35) * 80)}%`,
                  animationDelay: `${(i % 12) * 0.1}s`
                }}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Local CPU Inference · 16 kHz Polyphase Resampling · Zero-Shot & Multi-Stage Fine-Tuning
          </p>
        </div>
      </section>

      {/* Two Pillars Section */}
      <section className="py-16 bg-white dark:bg-navy-900 border-y border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Dual Operational Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Connecting standard consumer transcription workflows with publication-grade speech research pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar A */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Standard Automatic Speech Recognition
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Production-grade transcription supporting multi-format audio uploads (WAV, MP3, M4A, FLAC, OGG), live
                microphone recording, interactive editing, timestamp tracking, and export to TXT, PDF, DOCX, JSON, and SRT.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Offline Whisper Transformer execution</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Stereo-to-mono & 16kHz polyphase resampling</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Sliding-chunk streaming simulation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Find & Replace, Undo/Redo Rich Transcript Editor</li>
              </ul>
            </div>

            {/* Pillar B */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Research-Based Speech Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Inspired by IEEE Access research on low-resource dysarthric speech. Evaluates acoustic reality gaps across
                healthy, real dysarthric, and synthetic corpora with PCA, t-SNE, and exact Levenshtein Word Error Rate (WER).
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> 18 Acoustic Parameters (F0, HNR, Jitter, Shimmer, Formants)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> TORGO and UA-Speech research dataset adapters</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Multi-stage Seq2Seq fine-tuning & checkpoint manager</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Dimensionality reduction (PCA and t-SNE clusters)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Badge Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full text-center">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-8">
          Powered By Modern Deep Learning & Web Technologies
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'PyTorch 2.11',
            'Hugging Face Transformers',
            'OpenAI Whisper',
            'Librosa & SciPy',
            'JiWER Evaluation',
            'Scikit-learn (PCA & t-SNE)',
            'FastAPI Backend',
            'React 18 & Vite',
            'Tailwind CSS',
            'Framer Motion',
            'MongoDB Storage'
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm text-slate-700 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 py-8 px-6 text-center text-xs text-slate-500">
        <p className="mb-2">
          <strong>SpeechSense AI</strong> – Intelligent Automatic Speech Recognition and Speech Analysis System
        </p>
        <p>BTech Computer Science & Engineering Final Year Capstone Project · Research Methodology IEEE Access</p>
      </footer>
    </div>
  );
};
