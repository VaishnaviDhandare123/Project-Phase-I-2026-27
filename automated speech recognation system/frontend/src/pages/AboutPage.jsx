import React from 'react';
import {
  BookOpen,
  Award,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code,
  Users,
  Sparkles,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Final Year B.Tech Computer Science & Engineering Capstone
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          SpeechSense AI
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          "Transforming Human Speech into Intelligent, Accessible and Analyzable Text."
        </p>
      </div>

      {/* Abstract Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-500" /> Executive Project Abstract
        </h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
          Automatic Speech Recognition (ASR) has achieved commercial human-parity across standard acoustic domains. However, standard models suffer acute performance degradation when deployed on atypical, disordered, or low-resource speech cohorts—such as dysarthric speech characterized by involuntary neuromuscular vocal tract constriction, erratic glottal flutter, and vowel space centralization.
        </p>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
          <strong>SpeechSense AI</strong> addresses this challenge through a dual-paradigm architecture: a production-grade offline Transformer transcription system (OpenAI Whisper) paired with an empirical research laboratory implementing the methodology of IEEE Access. The system provides end-to-end signal preprocessing, multi-stage fine-tuning, synthetic acoustic perturbation, exact JiWER Levenshtein error decomposition, and high-dimensional manifold analysis (PCA and t-SNE) to bridge the reality gap between synthetic and natural clinical speech.
        </p>
      </div>

      {/* IEEE Access Paper Foundation */}
      <div className="bg-gradient-to-br from-brand-600/5 via-purple-600/5 to-transparent border border-brand-200 dark:border-brand-900/60 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Foundational Research Citation
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-1">
              "Bridging the Reality Gap in ASR for Low-Resource Dysarthric Speech: Evaluating Performance on Synthetic and Real Data"
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Published in IEEE Access</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Transformer-Based Whisper Modeling</h4>
            <p className="leading-relaxed">
              Encoder-decoder attention representations trained on 680k hours of multilingual speech, evaluated in zero-shot and fine-tuned configurations.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Synthetic Acoustic Perturbation</h4>
            <p className="leading-relaxed">
              Glottal tremor synthesis, vocal tract formant centralization, and dynamic tempo warping simulating articulatory imprecision.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">3. Acoustic Feature Profiling (18 Metrics)</h4>
            <p className="leading-relaxed">
              Vectorized pitch tracking (YIN F0), Harmonics-to-Noise Ratio (HNR), local jitter, local shimmer, LPC formants (F1/F2), and formant dispersion.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">4. Manifold Learning & Reality Gap</h4>
            <p className="leading-relaxed">
              Standardized PCA eigenspace decomposition and non-linear t-SNE clustering revealing the structural divergence between synthetic and natural clinical speech.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Technology Stack */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-500" /> Production-Grade Technology Stack
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ML & Backend */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Machine Learning & Backend
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Python 3.11+ / PyTorch</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Hugging Face Transformers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>OpenAI Whisper (Offline Tiny/Base)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Librosa, SoundFile & SciPy DSP</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>JiWER (Exact Levenshtein Metrics)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                <span>FastAPI REST Server (Uvicorn)</span>
              </li>
            </ul>
          </div>

          {/* Frontend */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Frontend & Visual Analytics
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>React 18 & Vite</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Tailwind CSS (Dark/Light Modes)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Recharts (PCA & t-SNE Scatters)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Web Audio API & MediaRecorder</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Lucide React Icons & Framer Motion</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Axios API Client</span>
              </li>
            </ul>
          </div>

          {/* Persistence & Reporting */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Persistence & Reporting
            </span>
            <ul className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>MongoDB & Motor Client</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Atomic Embedded JSON Store</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>ReportLab PDF Generator</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>python-docx Generator</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scikit-Learn PCA & t-SNE</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ethical & Non-Diagnostic Disclaimer */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Ethical Governance & Non-Diagnostic Clinical Notice
        </h4>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed text-justify">
          SpeechSense AI is developed solely as an academic and engineering research platform to investigate Automatic Speech Recognition robustness, acoustic domain gaps, and fine-tuning behavior under low-resource acoustic conditions. It does not provide medical diagnoses, clinical assessments, or therapeutic treatment plans. All synthetic acoustic manipulations adhere to data safety guidelines.
        </p>
      </div>

      {/* Project Team */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-500" /> Project Demonstration & Engineering Credits
        </h3>
        <p className="text-xs text-slate-500">
          Developed as a Final Year Capstone Project for Bachelor of Technology in Computer Science and Engineering.
        </p>
        <div className="pt-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          SpeechSense AI v1.0.0 &copy; 2026. Designed for offline CPU/CUDA execution.
        </div>
      </div>
    </div>
  );
};
