import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  CheckCircle2,
  Sliders,
  Sparkles,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { PCAPlot } from '../components/research/PCAPlot';

export const PCAPage = () => {
  const [pcaData, setPcaData] = useState(null);
  const [loading, setLoading] = useState(true);

  const availableFeatures = [
    { key: "f0_mean_hz", label: "Fundamental Frequency (F0)" },
    { key: "pitch_iqr_hz", label: "Pitch Dynamic IQR" },
    { key: "hnr_db", label: "Harmonics-to-Noise Ratio (HNR)" },
    { key: "local_jitter_pct", label: "Local Jitter (%)" },
    { key: "local_shimmer_db", label: "Local Shimmer (dB)" },
    { key: "formant_f1_hz", label: "Formant F1 (Hz)" },
    { key: "formant_f2_hz", label: "Formant F2 (Hz)" },
    { key: "formant_dispersion_hz", label: "Formant Dispersion" },
    { key: "spectral_centroid_hz", label: "Spectral Centroid" },
    { key: "speech_rate_syllables_per_sec", label: "Speech Production Rate" },
    { key: "zero_crossing_rate", label: "Zero Crossing Rate" },
    { key: "rms_energy", label: "RMS Energy" },
  ];

  const [selectedFeatures, setSelectedFeatures] = useState(
    availableFeatures.map(f => f.key)
  );

  const runPCA = async () => {
    setLoading(true);
    try {
      const res = await api.runPCA({ selected_features: selectedFeatures });
      setPcaData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPCA();
  }, []);

  const toggleFeature = (key) => {
    if (selectedFeatures.includes(key)) {
      if (selectedFeatures.length <= 3) {
        alert("At least 3 features are required for 2D PCA.");
        return;
      }
      setSelectedFeatures(selectedFeatures.filter(k => k !== key));
    } else {
      setSelectedFeatures([...selectedFeatures, key]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Principal Component Analysis (PCA)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized linear dimensionality reduction exposing eigenspace variance between speech cohorts.
          </p>
        </div>

        <button
          onClick={runPCA}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recompute Projection
        </button>
      </div>

      {/* Feature Selector Toolbar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" /> Selected Acoustic Features for PCA ({selectedFeatures.length})
          </span>
          <span className="text-[11px] text-slate-400">StandardScaler Normalized</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableFeatures.map((f) => {
            const isSelected = selectedFeatures.includes(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleFeature(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Plot */}
      {pcaData && (
        <PCAPlot
          data={pcaData}
          explainedVariance={pcaData.explained_variance_ratio}
          cumulativeVariance={pcaData.cumulative_variance}
        />
      )}

      {/* Loadings / Eigenvector Contributions Table */}
      {pcaData?.loadings && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Principal Component Feature Loadings (Eigenvector Weights)
              </h3>
              <p className="text-xs text-slate-400">Relative contribution of each acoustic metric to PC1 and PC2</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Acoustic Feature</th>
                  <th className="py-3 px-4">PC1 Loading</th>
                  <th className="py-3 px-4">PC2 Loading</th>
                  <th className="py-3 px-5">Variance Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pcaData.loadings.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {l.feature}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {l.pc1_loading}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {l.pc2_loading}
                    </td>
                    <td className="py-3 px-5 text-slate-400 text-[11px]">
                      {Math.abs(l.pc1_loading) > 0.3 ? 'High driver of horizontal separation' : 'Moderate contribution'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
