import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
  RefreshCw,
  Info,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { TSNEPlot } from '../components/research/TSNEPlot';

export const TSNEPage = () => {
  const [tsneData, setTsneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perplexity, setPerplexity] = useState(5);
  const [iterations, setIterations] = useState(1000);
  const [metric, setMetric] = useState('euclidean');

  const runTSNE = async () => {
    setLoading(true);
    try {
      const res = await api.runTSNE({
        perplexity: Number(perplexity),
        n_iter: Number(iterations),
        metric: metric
      });
      setTsneData(res.data);
    } catch (e) {
      console.error("t-SNE computation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTSNE();
  }, []);

  const exportJSON = () => {
    if (!tsneData) return;
    const blob = new Blob([JSON.stringify(tsneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsne_embedding_perp${perplexity}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            t-Distributed Stochastic Neighbor Embedding (t-SNE)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Non-linear manifold visualization revealing acoustic separation and the synthetic-to-natural speech reality gap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            disabled={!tsneData}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Coordinates
          </button>
          <button
            onClick={runTSNE}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Run Manifold Optimization
          </button>
        </div>
      </div>

      {/* Hyperparameter Controls */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" /> Manifold Learning Hyperparameters
          </span>
          <span className="text-[11px] text-slate-400 font-mono">sklearn.manifold.TSNE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Perplexity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Perplexity:</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{perplexity}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={perplexity}
              onChange={(e) => setPerplexity(e.target.value)}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Balances attention between local and global acoustic clustering structure. Small cohorts require lower perplexity (&lt; 15).
            </p>
          </div>

          {/* Iterations */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Max Iterations:</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{iterations}</span>
            </div>
            <select
              value={iterations}
              onChange={(e) => setIterations(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="500">500 Iterations (Fast)</option>
              <option value="1000">1000 Iterations (Recommended)</option>
              <option value="1500">1500 Iterations (High Convergence)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Gradient descent convergence cycles for KL divergence minimization.
            </p>
          </div>

          {/* Metric */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Distance Metric:</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{metric}</span>
            </div>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="euclidean">Euclidean (Standard)</option>
              <option value="cosine">Cosine (Angle-based)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Pairwise distance metric calculated over normalized acoustic vectors.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2D Manifold Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-navy-900/60 backdrop-blur-xs flex items-center justify-center rounded-3xl z-10">
            <div className="flex items-center gap-3 bg-white dark:bg-navy-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Minimizing Kullback-Leibler Divergence...
              </span>
            </div>
          </div>
        )}
        <TSNEPlot data={tsneData} />
      </div>

      {/* Cluster Centroid & Distance Breakdown */}
      {tsneData && tsneData.cluster_centers && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(tsneData.cluster_centers).map(([cohort, center]) => (
            <div
              key={cohort}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-slate-800 dark:text-white">
                  {cohort.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                  Centroid
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 space-y-0.5">
                <p>Dim 1 (X̄): <span className="text-slate-800 dark:text-slate-200 font-bold">{center.x?.toFixed(3)}</span></p>
                <p>Dim 2 (Ȳ): <span className="text-slate-800 dark:text-slate-200 font-bold">{center.y?.toFixed(3)}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Research Interpretation Callout */}
      <div className="bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-transparent border border-purple-200 dark:border-purple-900/50 rounded-3xl p-6 space-y-3">
        <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Info className="w-4 h-4" /> IEEE Reality Gap Observations from t-SNE
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          In acoustic space, <strong>Synthetic Dysarthric Speech</strong> forms an intermediate manifold between Healthy Controls and Natural Dysarthric Speech. While perturbation algorithms faithfully reproduce localized jitter and vocal tract constriction, they exhibit higher regularity than organic dysarthric speech, explaining the performance delta when evaluating baseline models across synthetic vs. real clinical test sets.
        </p>
      </div>
    </div>
  );
};
