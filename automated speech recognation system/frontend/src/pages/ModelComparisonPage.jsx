import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  GitCompare,
  TrendingDown,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const ModelComparisonPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await api.compareDomains();
      setData(res.data);
    } catch (e) {
      console.error("Failed to load domain comparisons:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cross-Domain Model Benchmark & Reality Gap Analysis
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical comparative evaluation of Zero-Shot vs Fine-Tuned Whisper models across natural and synthetic speech domains.
          </p>
        </div>

        <button
          onClick={fetchComparison}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Benchmarks
        </button>
      </div>

      {/* Main ASR Benchmark Chart */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-brand-500" />
              Word Error Rate (WER %) by Training Regime & Domain
            </h3>
            <p className="text-xs text-slate-400">
              Comparing model degradation when evaluated out-of-domain on dysarthric speech
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
            Lower WER = Superior Intelligibility
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          {data && data.asr_benchmark_comparison ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asr_benchmark_comparison}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="model"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  label={{ value: 'Word Error Rate (WER %)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Healthy Speech WER" dataKey="healthy_wer" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Synthetic Dysarthric WER" dataKey="synthetic_wer" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar name="Natural Dysarthric WER" dataKey="real_dysarthric_wer" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading benchmark data...
            </div>
          )}
        </div>
      </div>

      {/* Acoustic Reality Gap Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Acoustic Feature Divergence: Natural vs. Synthetic Reality Gap
            </h3>
            <p className="text-xs text-slate-400">
              Statistical quantification of feature differences between generated synthetic speech and clinical patient recordings
            </p>
          </div>
          <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
            IEEE Access Methodology
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Acoustic Metric</th>
                <th className="py-2.5 px-3">Healthy Mean</th>
                <th className="py-2.5 px-3">Synthetic Mean</th>
                <th className="py-2.5 px-3">Natural Dysarthric Mean</th>
                <th className="py-2.5 px-3">Reality Gap Delta (Δ)</th>
                <th className="py-2.5 px-3">Acoustic & Clinical Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {data && data.acoustic_feature_comparison && data.acoustic_feature_comparison.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold font-sans text-slate-800 dark:text-slate-200">
                    {item.parameter}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                    {item.healthy}
                  </td>
                  <td className="py-2.5 px-3 text-purple-600 dark:text-purple-400">
                    {item.synthetic_dysarthric}
                  </td>
                  <td className="py-2.5 px-3 text-rose-500 font-bold">
                    {item.natural_dysarthric}
                  </td>
                  <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">
                    {item.reality_gap_delta > 0 ? `+${item.reality_gap_delta}` : item.reality_gap_delta}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                    {item.clinical_relevance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Research Takeaways Cards */}
      <div className="bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-transparent border border-brand-200 dark:border-brand-900/50 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-2">
          <Award className="w-4 h-4" /> IEEE Research Conclusions & Engineering Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data && data.research_takeaways && data.research_takeaways.map((note, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-navy-900/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Insight #{idx + 1}</span>
              </div>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                {note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
