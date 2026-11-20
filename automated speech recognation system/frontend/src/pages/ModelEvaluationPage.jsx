import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2,
  Trash2,
  Check,
  Percent,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  {
    name: "Healthy Control (TORGO FC01)",
    reference: "she had your dark suit in greasy wash water all year",
    hypothesis: "she had your dark suit in greasy wash water all year",
    dataset: "Healthy Reference"
  },
  {
    name: "Mild Dysarthria (TORGO M01)",
    reference: "the quick brown fox jumps over the lazy dog",
    hypothesis: "the kick brown fox jump over the lady dog",
    dataset: "TORGO Natural"
  },
  {
    name: "Moderate Dysarthria (UA-Speech M05)",
    reference: "yesterday afternoon we observed significant improvements in speech clarity",
    hypothesis: "yester afternoon we observe sigment provement in speech clarity",
    dataset: "UA-Speech Natural"
  },
  {
    name: "Synthetic Perturbation Benchmark",
    reference: "automatic speech recognition pipelines require robust acoustic modeling",
    hypothesis: "automatic peach recognize pipeline require robust acoustic model",
    dataset: "Synthetic Augmented"
  }
];

export const ModelEvaluationPage = () => {
  const [reference, setReference] = useState(PRESETS[1].reference);
  const [hypothesis, setHypothesis] = useState(PRESETS[1].hypothesis);
  const [modelName, setModelName] = useState("Whisper-tiny (Base)");
  const [normalize, setNormalize] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.listEvaluations();
      setHistory(res.data || []);
    } catch (e) {
      console.error("Failed to load evaluations:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCompute = async () => {
    if (!reference.trim() || !hypothesis.trim()) {
      alert("Please provide both reference ground-truth and model hypothesis text.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.runEvaluation({
        reference_text: reference,
        hypothesis_text: hypothesis,
        apply_normalization: normalize,
        model_name: modelName,
        sample_name: "Interactive Evaluation",
        dataset_type: "Manual Test"
      });
      setResult(res.data);
      fetchHistory();
    } catch (e) {
      console.error(e);
      alert("Error evaluating text: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setReference(preset.reference);
    setHypothesis(preset.hypothesis);
    setResult(null);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEvaluation(id);
      fetchHistory();
      if (result && result.evaluation_id === id) {
        setResult(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ASR Model Evaluation & Error Rates
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exact JiWER Levenshtein alignment computing uncapped Word Error Rate (WER) and Character Error Rate (CER).
          </p>
        </div>

        <button
          onClick={handleCompute}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          <Play className={`w-4 h-4 fill-white ${loading ? 'animate-spin' : ''}`} />
          Compute Error Rates
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-slate-400 shrink-0">Sample Presets:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => loadPreset(p)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all shrink-0"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Ground-Truth Reference Text
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">True Transcript</span>
          </div>
          <textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            rows={5}
            placeholder="Enter gold standard ground-truth reference transcription..."
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono resize-none"
          />
        </div>

        {/* Hypothesis */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" /> ASR Model Hypothesis
            </span>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">Model Output</span>
          </div>
          <textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            rows={5}
            placeholder="Enter predicted hypothesis from automatic speech recognition..."
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono resize-none"
          />
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={normalize}
              onChange={(e) => setNormalize(e.target.checked)}
              className="rounded accent-brand-600"
            />
            Apply Standard Text Normalization (Lowercase, Strip Punctuation)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Model Tag:</span>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Whisper-tiny (Base)">Whisper-tiny (Base Pretrained)</option>
            <option value="Whisper-tiny (Fine-Tuned Stage 1)">Whisper-tiny (Fine-Tuned Stage 1)</option>
            <option value="Whisper-tiny (Multi-Stage Synthetic+Real)">Whisper-tiny (Multi-Stage S+R)</option>
          </select>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Levenshtein Distance Metrics Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Formula: WER = (Substitutions + Deletions + Insertions) / Total Reference Words
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-900">
              Evaluated with JiWER v3.1
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* WER */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Word Error Rate</span>
              <p className="text-2xl md:text-3xl font-black text-rose-500 font-mono">
                {result.wer_percentage !== undefined ? `${result.wer_percentage}%` : `${(result.wer * 100).toFixed(1)}%`}
              </p>
              <span className="text-[10px] text-slate-400">Lower is better</span>
            </div>

            {/* CER */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Character Error Rate</span>
              <p className="text-2xl md:text-3xl font-black text-amber-500 font-mono">
                {result.cer_percentage !== undefined ? `${result.cer_percentage}%` : `${(result.cer * 100).toFixed(1)}%`}
              </p>
              <span className="text-[10px] text-slate-400">Character edit distance</span>
            </div>

            {/* Hits */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Correct Words (Hits)</span>
              <p className="text-2xl md:text-3xl font-black text-emerald-500 font-mono">
                {result.hits ?? '-'}
              </p>
              <span className="text-[10px] text-slate-400">Accurately matched</span>
            </div>

            {/* Total Errors */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Edit Errors</span>
              <p className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-200 font-mono">
                {(result.substitutions || 0) + (result.deletions || 0) + (result.insertions || 0)}
              </p>
              <span className="text-[10px] text-slate-400">S + D + I operations</span>
            </div>
          </div>

          {/* S / D / I Detailed Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">Substitutions (S)</span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">{result.substitutions ?? 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold block">Deletions (D)</span>
              <span className="text-lg font-black text-rose-700 dark:text-rose-300 font-mono">{result.deletions ?? 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block">Insertions (I)</span>
              <span className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono">{result.insertions ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Records History Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-500" /> Recent Benchmark Log ({history.length})
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No previous evaluation records saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Dataset</th>
                  <th className="py-2.5 px-3">WER</th>
                  <th className="py-2.5 px-3">CER</th>
                  <th className="py-2.5 px-3">S / D / I</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {history.map((item) => (
                  <tr key={item.evaluation_id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold font-sans text-slate-800 dark:text-slate-200">
                      {item.model_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">
                      {item.dataset_type}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-rose-500">
                      {item.wer_percentage !== undefined ? `${item.wer_percentage}%` : `${(item.wer * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-500">
                      {item.cer_percentage !== undefined ? `${item.cer_percentage}%` : `${(item.cer * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {item.substitutions || 0} / {item.deletions || 0} / {item.insertions || 0}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        onClick={() => handleDelete(item.evaluation_id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
