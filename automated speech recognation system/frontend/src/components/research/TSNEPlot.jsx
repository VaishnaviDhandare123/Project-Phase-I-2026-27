import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const TSNEPlot = ({ data }) => {
  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
        No t-SNE projection data available.
      </div>
    );
  }

  const healthyPoints = data.points.filter(p => p.category === 'healthy');
  const realDysarthricPoints = data.points.filter(p => p.category && p.category.includes('dysarthric') && !p.category.includes('synthetic'));
  const syntheticPoints = data.points.filter(p => p.category === 'synthetic_dysarthric');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-800 dark:text-white">{pt.label}</p>
          <p className="text-slate-500">Cohort: <span className="font-mono text-purple-600 dark:text-purple-400">{pt.category}</span></p>
          <p className="text-slate-500">Speaker: <span className="font-mono">{pt.speaker}</span></p>
          <p className="text-slate-400 font-mono text-[11px]">Dim 1: {pt.x} | Dim 2: {pt.y}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-white">t-SNE Manifold Learning</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Non-linear acoustic manifold clustering exposing domain separation
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
          Perplexity: {data.perplexity_used || 5}
        </span>
      </div>

      {data.warning && (
        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[11px] text-amber-700 dark:text-amber-300">
          ⚠️ {data.warning}
        </div>
      )}

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="x"
              name="t-SNE Dim 1"
              label={{ value: 't-SNE Dimension 1', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="t-SNE Dim 2"
              label={{ value: 't-SNE Dimension 2', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <ZAxis range={[70, 70]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Scatter name="Healthy Controls" data={healthyPoints} fill="#10b981" shape="circle" />
            <Scatter name="Natural Dysarthric Speech" data={realDysarthricPoints} fill="#f43f5e" shape="diamond" />
            <Scatter name="Synthetic Dysarthric Speech" data={syntheticPoints} fill="#8b5cf6" shape="cross" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
