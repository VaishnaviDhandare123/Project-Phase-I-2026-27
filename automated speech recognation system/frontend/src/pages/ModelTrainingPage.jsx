import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sliders,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Layers,
  ArrowRight
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

export const ModelTrainingPage = () => {
  const [expName, setExpName] = useState('whisper_dysarthric_ft_run1');
  const [expStage, setExpStage] = useState('stage2_natural_dysarthric');
  const [baseModel, setBaseModel] = useState('openai/whisper-tiny');
  const [epochs, setEpochs] = useState(3);
  const [learningRate, setLearningRate] = useState(1e-5);
  const [batchSize, setBatchSize] = useState(1);

  const [hardware, setHardware] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [training, setTraining] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

  useEffect(() => {
    api.getHardware().then((res) => setHardware(res.data)).catch(console.error);
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleStartTraining = async (e) => {
    e.preventDefault();
    setTraining(true);
    try {
      const res = await api.startTraining({
        experiment_name: expName,
        experiment_stage: expStage,
        base_model: baseModel,
        epochs: epochs,
        learning_rate: learningRate,
        batch_size: batchSize
      });
      const expId = res.data.experiment_id;

      // Start polling status
      const interval = setInterval(async () => {
        try {
          const statusRes = await api.getTrainingStatus(expId);
          setActiveJob(statusRes.data);
          if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
            clearInterval(interval);
            setTraining(false);
          }
        } catch (err) {
          clearInterval(interval);
          setTraining(false);
        }
      }, 1000);
      setPollInterval(interval);
    } catch (err) {
      alert("Error starting training experiment: " + err.message);
      setTraining(false);
    }
  };

  const handleCancelTraining = async () => {
    if (activeJob?.experiment_id) {
      await api.stopTraining(activeJob.experiment_id);
      if (pollInterval) clearInterval(pollInterval);
      setTraining(false);
    }
  };

  const lossData = activeJob?.train_loss_history
    ? activeJob.train_loss_history.map(item => ({
        epoch: `Epoch ${item.epoch}`,
        loss: item.loss
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-800">
          <Brain className="w-3.5 h-3.5" />
          Seq2Seq Low-Memory Transfer Learning
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Multi-Stage Model Fine-Tuning
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adapt Whisper's Transformer architecture to dysarthric speech patterns with low-memory gradient accumulation.
        </p>
      </div>

      {/* Hardware Feasibility Telemetry Card */}
      {hardware && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-500" /> Training Hardware Feasibility Check
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
              {hardware.cuda_available ? 'CUDA Accelerated' : 'CPU Gradient Mode'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Compute Device</span>
              <span className="font-bold">{hardware.gpu_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">System RAM Available</span>
              <span className="font-bold">{hardware.system_ram_available_gb} GB</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CPU Cores</span>
              <span className="font-bold">{hardware.cpu_cores} Logical</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Recommended Batch</span>
              <span className="font-bold text-emerald-500">{hardware.recommended_batch_size}</span>
            </div>
          </div>

          {hardware.warnings && hardware.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-600 dark:text-amber-400">
              ℹ️ {hardware.warnings.join(' ')}
            </div>
          )}
        </div>
      )}

      {/* Training Configuration Form */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Experiment Hyperparameters & Architecture
        </h3>

        <form onSubmit={handleStartTraining} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Experiment Run Name
              </label>
              <input
                type="text"
                required
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Research Experiment Stage
              </label>
              <select
                value={expStage}
                onChange={(e) => setExpStage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              >
                <option value="stage1_baseline">Experiment 1: Pretrained Whisper Baseline</option>
                <option value="stage2_natural_dysarthric">Experiment 2: Natural Dysarthric Speech (TORGO)</option>
                <option value="stage3_synthetic">Experiment 3: Synthetic Dysarthric Speech</option>
                <option value="stage4_joint">Experiment 4: Combined Joint Real + Synthetic Data</option>
                <option value="stage5_cross_domain">Experiment 5: Cross-Domain Evaluation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Base Model
              </label>
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              >
                <option value="openai/whisper-tiny">Whisper-tiny (39M)</option>
                <option value="openai/whisper-base">Whisper-base (74M)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Epochs
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Learning Rate
              </label>
              <input
                type="number"
                step="0.000005"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Micro-Batch Size
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {!training ? (
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Fine-Tuning Job
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelTraining}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Abort Training Job
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Live Training Status Monitor */}
      {activeJob && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                activeJob.status === 'running' ? 'bg-amber-50 dark:bg-amber-950 text-amber-500 animate-pulse' :
                activeJob.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-500' :
                'bg-rose-50 dark:bg-rose-950 text-rose-500'
              }`}>
                {activeJob.status}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {activeJob.experiment_name}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Epoch {activeJob.current_epoch} / {activeJob.total_epochs}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Step Progress</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{activeJob.progress_pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-purple-600 transition-all duration-300"
                style={{ width: `${activeJob.progress_pct}%` }}
              />
            </div>
          </div>

          {/* Loss Curve */}
          {lossData.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2">Training Loss Trajectory</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="epoch" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeJob.checkpoint_path && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Checkpoint saved to: <code className="font-mono text-[11px]">{activeJob.checkpoint_path}</code>
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Val WER: {activeJob.val_wer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
