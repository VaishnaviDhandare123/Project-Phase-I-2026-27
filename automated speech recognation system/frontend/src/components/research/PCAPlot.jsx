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

export const PCAPlot = ({ data, explainedVariance = [0.45, 0.28], cumulativeVariance = 0.73 }) => {
  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
        No PCA projection data available.
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
          <p className="text-slate-500">Category: <span className="font-mono text-brand-600 dark:text-brand-400">{pt.category}</span></p>
          <p className="text-slate-500">Speaker: <span className="font-mono">{pt.speaker}</span></p>
          <p className="text-slate-400 font-mono text-[11px]">PC1: {pt.x} | PC2: {pt.y}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-white">Principal Component Analysis (PCA)</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acoustic variance reduction across 14 multidimensional features
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
            Cumulative Var: {Math.round(cumulativeVariance * 100)}%
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="x"
              name="PC1"
              label={{ value: `PC1 (${Math.round((explainedVariance[0] || 0) * 100)}% var)`, position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="PC2"
              label={{ value: `PC2 (${Math.round((explainedVariance[1] || 0) * 100)}% var)`, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Scatter name="Healthy Controls" data={healthyPoints} fill="#10b981" shape="circle" />
            <Scatter name="Natural Dysarthric Speech" data={realDysarthricPoints} fill="#ef4444" shape="triangle" />
            <Scatter name="Synthetic Dysarthric Speech" data={syntheticPoints} fill="#3b82f6" shape="square" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
