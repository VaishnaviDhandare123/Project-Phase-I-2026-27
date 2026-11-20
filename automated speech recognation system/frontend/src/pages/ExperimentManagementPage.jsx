import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle2,
  Brain,
  Layers,
  ArrowRight,
  GitCompare,
  FolderArchive,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const ExperimentManagementPage = () => {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckpoints = async () => {
    setLoading(true);
    try {
      const res = await api.listCheckpoints();
      setCheckpoints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Experiment & Checkpoint Registry
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered fine-tuned weights, validation WER benchmarks, and transfer learning manifests.
          </p>
        </div>

        <button
          onClick={fetchCheckpoints}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-500"
          title="Refresh Checkpoints"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Checkpoint / Experiment</th>
                <th className="py-3.5 px-4">Base Architecture</th>
                <th className="py-3.5 px-4">Training Stage</th>
                <th className="py-3.5 px-4">Validation WER</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {checkpoints.map((ckpt, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {ckpt.model_name}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {ckpt.checkpoint_id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {ckpt.base_model}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-semibold border border-brand-200 dark:border-brand-900">
                      {ckpt.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                    {typeof ckpt.val_wer === 'number' ? `${(ckpt.val_wer * 100).toFixed(1)}%` : ckpt.val_wer}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {ckpt.created_at}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <NavLink
                      to={`/evaluation?model=${ckpt.checkpoint_id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-700 dark:text-slate-200 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <GitCompare className="w-3.5 h-3.5" /> Evaluate
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
