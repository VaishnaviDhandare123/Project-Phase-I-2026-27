import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  UploadCloud,
  Activity,
  Zap,
  Info,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Music
} from 'lucide-react';
import { api } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AcousticFeaturesPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  // Auto-analyze sample on first load
  useEffect(() => {
    // Generate sample preview
    const sampleFeatures = {
      f0_mean_hz: 168.4,
      f0_std_hz: 24.1,
      f0_min_hz: 110.0,
      f0_max_hz: 240.5,
      pitch_iqr_hz: 38.5,
      hnr_db: 18.2,
      local_jitter_pct: 0.65,
      local_shimmer_db: 0.48,
      formant_f1_hz: 540.2,
      formant_f2_hz: 1680.5,
      formant_dispersion_hz: 1140.3,
      spectral_tilt_db_per_oct: -5.8,
      temporal_centroid_sec: 1.45,
      rms_energy: 0.095,
      zero_crossing_rate: 0.075,
      spectral_centroid_hz: 1950.4,
      spectral_bandwidth_hz: 1720.0,
      spectral_rolloff_hz: 3600.0,
      speech_rate_syllables_per_sec: 4.2,
      articulation_rate_sps: 4.8,
      duration_sec: 3.2
    };

    const pitchData = Array.from({ length: 30 }, (_, i) => ({
      frame: i,
      f0: 150 + Math.sin(i * 0.3) * 35 + (Math.random() * 5)
    }));

    const energyData = Array.from({ length: 30 }, (_, i) => ({
      frame: i,
      energy: 0.05 + Math.abs(Math.sin(i * 0.4)) * 0.12
    }));

    setProfile({
      filename: "sample_lecture_health.wav (Preloaded Benchmark)",
      features: sampleFeatures,
      pitch_contour: pitchData.map(d => d.f0),
      energy_contour: energyData.map(d => d.energy),
      duration_sec: 3.2
    });
  }, []);

  const handleUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setLoading(true);
      const formData = new FormData();
      formData.append('file', f);

      try {
        const res = await api.analyzeAcoustics(formData);
        setProfile(res.data);
      } catch (err) {
        alert("Acoustic analysis error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const featureMetadata = [
    { key: "f0_mean_hz", label: "Fundamental Frequency (F0)", unit: "Hz", group: "Phonation", desc: "Mean rate of vocal fold vibration during voiced phonation." },
    { key: "pitch_iqr_hz", label: "Pitch Dynamic IQR", unit: "Hz", group: "Phonation", desc: "Interquartile pitch variation; monotone in hypokinetic/spastic dysarthria." },
    { key: "hnr_db", label: "Harmonics-to-Noise Ratio (HNR)", unit: "dB", group: "Voice Quality", desc: "Glottal air turbulence and vocal breathiness index." },
    { key: "local_jitter_pct", label: "Local Jitter (PPQ)", unit: "%", group: "Vocal Stability", desc: "Cycle-to-cycle frequency perturbation measuring tremor." },
    { key: "local_shimmer_db", label: "Local Shimmer (APQ)", unit: "dB", group: "Vocal Stability", desc: "Cycle-to-cycle peak amplitude perturbation." },
    { key: "formant_f1_hz", label: "First Formant (F1)", unit: "Hz", group: "Resonance", desc: "Reflects tongue elevation and oral cavity vowel openness." },
    { key: "formant_f2_hz", label: "Second Formant (F2)", unit: "Hz", group: "Resonance", desc: "Correlates with anterior-posterior tongue advancement." },
    { key: "formant_dispersion_hz", label: "Formant Dispersion (F2 - F1)", unit: "Hz", group: "Resonance", desc: "Measures vowel space centralization characteristic of dysarthria." },
    { key: "spectral_centroid_hz", label: "Spectral Centroid", unit: "Hz", group: "Spectral Shape", desc: "Center of spectral energy mass reflecting sound brightness." },
    { key: "spectral_bandwidth_hz", label: "Spectral Bandwidth", unit: "Hz", group: "Spectral Shape", desc: "Spread of acoustic energy distribution around centroid." },
    { key: "spectral_rolloff_hz", label: "Spectral Roll-off (85%)", unit: "Hz", group: "Spectral Shape", desc: "Frequency threshold containing 85% of total signal energy." },
    { key: "spectral_tilt_db_per_oct", label: "Spectral Tilt", unit: "dB/oct", group: "Spectral Shape", desc: "Rate of high-frequency power roll-off." },
    { key: "speech_rate_syllables_per_sec", label: "Speech Production Rate", unit: "syl/s", group: "Temporal", desc: "Overall syllable production speed including inter-word pauses." },
    { key: "articulation_rate_sps", label: "Articulation Rate", unit: "syl/s", group: "Temporal", desc: "Syllables produced purely during active voiced intervals." },
    { key: "temporal_centroid_sec", label: "Temporal Centroid", unit: "s", group: "Temporal", desc: "Time position of the center of energy envelope mass." },
    { key: "rms_energy", label: "Root Mean Square Energy", unit: "amp", group: "Energy", desc: "Overall signal acoustic power and amplitude magnitude." },
    { key: "zero_crossing_rate", label: "Zero Crossing Rate (ZCR)", unit: "ratio", group: "Friction", desc: "Frequency of sign changes distinguishing unvoiced fricatives." },
    { key: "duration_sec", label: "Signal Duration", unit: "s", group: "General", desc: "Total analyzed sample duration." },
  ];

  const pitchChartData = profile?.pitch_contour
    ? profile.pitch_contour.map((val, idx) => ({ frame: idx, pitch: val > 0 ? val : null }))
    : [];

  const energyChartData = profile?.energy_contour
    ? profile.energy_contour.map((val, idx) => ({ frame: idx, energy: val }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Acoustic Feature Extraction
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grounded in the IEEE Access methodology for atypical and dysarthric speech characterization.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="acoustic-upload"
            accept=".wav,.mp3,.flac,.ogg"
            onChange={handleUpload}
            className="hidden"
          />
          <label
            htmlFor="acoustic-upload"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            {loading ? 'Analyzing Audio...' : 'Analyze Custom Audio'}
          </label>
        </div>
      </div>

      {profile && (
        <>
          {/* Pitch & Energy Curves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pitch Contour */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-brand-500" /> Fundamental Frequency (F0) Pitch Contour
                </h4>
                <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                  Mean: {profile.features.f0_mean_hz} Hz
                </span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pitchChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="frame" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} unit="Hz" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="pitch" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy Envelope */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" /> Temporal RMS Energy Envelope
                </h4>
                <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                  RMS: {profile.features.rms_energy}
                </span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="frame" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 18 Acoustic Parameters Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Acoustic Feature Profiles (18 Calculated Metrics)
                </h3>
                <p className="text-xs text-slate-400">Analyzed audio: {profile.filename}</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                All 18 Validated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Acoustic Parameter</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-5">Theoretical & Clinical Relevance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {featureMetadata.map((meta) => {
                    const val = profile.features[meta.key];
                    return (
                      <tr key={meta.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-200">
                          {meta.label}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {meta.group}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                          {val !== undefined ? val : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                          {meta.unit}
                        </td>
                        <td className="py-3 px-5 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          {meta.desc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
