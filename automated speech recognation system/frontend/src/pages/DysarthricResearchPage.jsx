import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ShieldAlert,
  GitCompare,
  TrendingDown,
  Layers,
  Activity,
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const DysarthricResearchPage = () => {
  const [comparison, setComparison] = useState(null);
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, taxRes] = await Promise.all([
          api.compareDomains(),
          api.getTaxonomy()
        ]);
        setComparison(compRes.data);
        setTaxonomy(taxRes.data);
      } catch (e) {
        console.error("Error loading research data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5" />
          IEEE Access Research Paradigm
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Low-Resource Dysarthric Speech Research
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Investigating speech motor degradation, acoustic deviations, and bridging the reality gap via multi-stage fine-tuning.
        </p>
      </div>

      {/* Prominent Ethics & Clinical Disclaimer */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start gap-4 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-sm font-bold block text-amber-950 dark:text-amber-100">
            Research Scope & Non-Diagnostic Disclaimer
          </strong>
          <p className="leading-relaxed">
            SpeechSense AI is an academic automatic speech recognition and speech processing research platform.
            It does not diagnose medical conditions, classify individual clinical pathology, or provide therapeutic recommendations.
            All acoustic analytics are strictly intended for evaluating machine learning model robustness on atypical speech corpora.
          </p>
        </div>
      </div>

      {/* Reality Gap Comparison Matrix */}
      {comparison && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-brand-500" />
                Empirical Acoustic Reality Gap Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparative analysis between Natural Healthy, Natural Dysarthric, and Synthetic Speech
              </p>
            </div>
          </div>

          {/* Acoustic Metric Delta Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Acoustic Metric</th>
                  <th className="py-3 px-4">Natural Healthy</th>
                  <th className="py-3 px-4">Natural Dysarthric</th>
                  <th className="py-3 px-4">Synthetic Dysarthric</th>
                  <th className="py-3 px-4">Reality Gap (Δ)</th>
                  <th className="py-3 px-5">Clinical Deficit Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparison.metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {row.parameter}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.healthy}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-500 font-bold">
                      {row.natural_dysarthric}
                    </td>
                    <td className="py-3 px-4 font-mono text-brand-600 dark:text-brand-400 font-bold">
                      {row.synthetic_dysarthric}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-500">
                      {row.reality_gap_delta > 0 ? `+${row.reality_gap_delta}` : row.reality_gap_delta}
                    </td>
                    <td className="py-3 px-5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {row.clinical_relevance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ASR WER Reality Gap Table */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              ASR Word Error Rate (WER) Impact Across Training Stages
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparison.asr_benchmark_comparison.map((b, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{b.model}</p>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Healthy WER:</span>
                    <span className="text-emerald-500 font-semibold">{b.healthy_wer}%</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Dysarthric WER:</span>
                    <span className="text-rose-500 font-semibold">{b.real_dysarthric_wer}%</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400">Reality Gap:</span>
                    <span className="text-amber-500 font-bold">{b.reality_gap_wer_gap}% WER</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Taxonomy of Dysarthria Section */}
      {taxonomy && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Clinical Dysarthria Taxonomy (Informational Reference)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxonomy.types.map((t, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/50 space-y-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block font-mono">
                  {t.name}
                </span>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Site: <span className="font-normal">{t.site_of_lesion}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.speech_characteristics}
                </p>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  Etiologies: {t.common_etiologies}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
