import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  FileAudio
} from 'lucide-react';
import { api } from '../services/api';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

export const SyntheticAugmentationPage = () => {
  const [simulationType, setSimulationType] = useState('articulatory_imprecision');
  const [severityFactor, setSeverityFactor] = useState(0.5);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [sourceSample, setSourceSample] = useState('sample_lecture_health.wav');

  const [loading, setLoading] = useState(false);
  const [augmentedResult, setAugmentedResult] = useState(null);

  const handleSimulateAugmentation = () => {
    if (!consentConfirmed) {
      alert("Please confirm the ethical consent requirement before proceeding with voice augmentation.");
      return;
    }

    setLoading(true);
    // Simulate generation with immediate local response
    setTimeout(() => {
      setAugmentedResult({
        filename: `syn_aug_${Date.now().toString().slice(-6)}.wav`,
        simulation_type: simulationType,
        severity_factor: severityFactor,
        original_duration: 3.2,
        augmented_duration: simulationType === 'temporal_prolongation' ? 4.8 : 3.2,
        waveform: Array.from({ length: 48 }, (_, i) => 0.15 + (Math.abs(Math.sin(i * 0.3)) * (1.0 - severityFactor * 0.4))),
        audio_url: '/static/audio/sample_synthetic_comparison.wav',
        metadata: {
          generator: "SpeechSense Perturbation Engine (IEEE Method)",
          consent_affirmed: true,
          articulatory_attenuation_hz: simulationType === 'articulatory_imprecision' ? "2200 Hz Cutoff" : "N/A",
          tremor_frequency: simulationType === 'phonatory_instability' ? "5.0 Hz Modulated" : "N/A"
        }
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2 border border-brand-200 dark:border-brand-800">
          <Cpu className="w-3.5 h-3.5" />
          Acoustic Perturbation & Data Augmentation
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Synthetic Speech Augmentation
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bridge the low-resource training data bottleneck through mathematically modeled articulatory imprecision, glottal tremor, and rate stretching.
        </p>
      </div>

      {/* Ethical Consent Banner */}
      <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-navy-900 border border-blue-200 dark:border-slate-800 flex items-start gap-4 text-xs text-blue-900 dark:text-slate-300">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-brand-600 dark:text-brand-400 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-sm font-bold block text-slate-900 dark:text-white">
            Ethical Protocol & Speaker Permission Affirmation
          </strong>
          <p className="leading-relaxed">
            In compliance with responsible AI research guidelines, all voice synthesis, cloning, and acoustic perturbation
            experiments require explicit authorization. Ensure you possess authorized research permissions before processing audio.
          </p>
          <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-slate-900 dark:text-white">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              className="w-4 h-4 accent-brand-600 rounded"
            />
            I affirm that I have ethical consent and research permission to synthesize and augment this speech sample.
          </label>
        </div>
      </div>

      {/* Augmentation Configuration Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Acoustic Perturbation Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simulation Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dysarthric Acoustic Simulation Model
            </label>
            <select
              value={simulationType}
              onChange={(e) => setSimulationType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="articulatory_imprecision">Articulatory Imprecision (Vocal Tract Attenuation)</option>
              <option value="phonatory_instability">Phonatory Instability & Glottal Tremor</option>
              <option value="temporal_prolongation">Temporal Prolongation (Motor Speech Slowing)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {simulationType === 'articulatory_imprecision' && "Attenuates high-frequency formants >2200Hz to model restricted tongue movement."}
              {simulationType === 'phonatory_instability' && "Injects 5Hz amplitude modulation tremor and glottal turbulence."}
              {simulationType === 'temporal_prolongation' && "Time-stretches audio by 30-50% to simulate cerebellar bradyarthria."}
            </p>
          </div>

          {/* Severity Factor Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Acoustic Severity Factor
              </label>
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.round(severityFactor * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={severityFactor}
              onChange={(e) => setSeverityFactor(parseFloat(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Mild (10%)</span>
              <span>Moderate (50%)</span>
              <span>Severe (90%)</span>
            </div>
          </div>
        </div>

        {/* Source Audio Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Input Audio Source for Augmentation
          </label>
          <select
            value={sourceSample}
            onChange={(e) => setSourceSample(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
          >
            <option value="sample_lecture_health.wav">sample_lecture_health.wav (Healthy Control Speech)</option>
            <option value="sample_meeting_notes.wav">sample_meeting_notes.wav (Conversational Speech)</option>
          </select>
        </div>

        <button
          onClick={handleSimulateAugmentation}
          disabled={loading || !consentConfirmed}
          className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Synthetic Perturbation...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Synthesize Augmented Acoustic Recording
            </>
          )}
        </button>
      </div>

      {/* Generated Result */}
      {augmentedResult && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                SYNTHESIS COMPLETE
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Augmented Acoustic Recording Generated
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {augmentedResult.filename}
            </span>
          </div>

          <WaveformVisualizer
            audioUrl={augmentedResult.audio_url}
            waveformData={augmentedResult.waveform}
            duration={augmentedResult.augmented_duration}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Simulation Type</span>
              <span className="font-bold capitalize">{augmentedResult.simulation_type.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Severity Factor</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{Math.round(augmentedResult.severity_factor * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
              <span className="font-bold">{augmentedResult.augmented_duration} s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Consent Status</span>
              <span className="font-bold text-emerald-500">Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
