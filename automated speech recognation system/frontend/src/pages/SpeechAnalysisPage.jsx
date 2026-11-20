import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  BarChart3,
  Sparkles,
  Database,
  Cpu,
  Brain,
  ScatterChart,
  GitCompare,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const researchModules = [
  {
    title: 'Acoustic Feature Extraction',
    desc: 'Extract 18 clinical acoustic parameters including fundamental frequency (F0), Harmonics-to-Noise Ratio (HNR), local jitter, local shimmer, and LPC formants.',
    path: '/acoustic-features',
    icon: BarChart3,
    badge: '18 Parameters'
  },
  {
    title: 'Dysarthric Speech Research',
    desc: 'Investigate atypical speech patterns, neuromotor etiologies, articulatory deficits, and ASR performance across spastic, ataxic, and flaccid speech.',
    path: '/dysarthric-research',
    icon: Sparkles,
    badge: 'IEEE Methodology'
  },
  {
    title: 'Dataset Management & Adapters',
    desc: 'Import and inspect research speech corpora including TORGO, UA-Speech, and synthetic augmented datasets partitioned into train/val/test splits.',
    path: '/datasets',
    icon: Database,
    badge: 'Corpora Adapters'
  },
  {
    title: 'Synthetic Augmentation',
    desc: 'Simulate articulatory imprecision, glottal tremor, and temporal prolongation to augment low-resource training corpora with ethics validation.',
    path: '/augmentation',
    icon: Cpu,
    badge: 'Acoustic Synthesis'
  },
  {
    title: 'Model Fine-Tuning Experiments',
    desc: 'Configure Seq2Seq fine-tuning on natural, synthetic, and joint datasets using low-memory gradient accumulation with checkpoint saving.',
    path: '/training',
    icon: Brain,
    badge: 'Seq2Seq Trainer'
  },
  {
    title: 'PCA Dimensionality Reduction',
    desc: 'Standardized 2D eigenspace projections of acoustic distributions comparing healthy, real dysarthric, and synthetic speech clusters.',
    path: '/pca',
    icon: ScatterChart,
    badge: 'Eigenspace'
  },
  {
    title: 't-SNE Manifold Learning',
    desc: 'Non-linear manifold clustering visualizing domain gap separation between human speech and synthetic generative models.',
    path: '/tsne',
    icon: Activity,
    badge: 'Manifold Clusters'
  },
  {
    title: 'Model Evaluation & JiWER Benchmarks',
    desc: 'Calculate exact Word Error Rate (WER) and Character Error Rate (CER) with full Levenshtein substitution, deletion, and insertion breakdowns.',
    path: '/evaluation',
    icon: GitCompare,
    badge: 'Exact JiWER'
  }
];

export const SpeechAnalysisPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-800">
          <Layers className="w-3.5 h-3.5" />
          Acoustic Intelligence & Pathology Research
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Research-Based Speech Analysis Hub
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore specialized deep learning speech processing modules based on contemporary ASR research and the IEEE Access reality gap methodology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {researchModules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-brand-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {mod.desc}
                </p>
              </div>

              <NavLink
                to={mod.path}
                className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 hover:bg-brand-600 hover:text-white text-brand-600 dark:text-brand-400 font-semibold text-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                Launch Module <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};
