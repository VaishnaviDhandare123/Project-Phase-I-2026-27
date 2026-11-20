import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  History,
  Search,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';

export const HistoryPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({ search: search || undefined });
      setItems(res.data.items || []);
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this transcription record?")) return;
    try {
      await api.deleteHistoryItem(id);
      setItems(prev => prev.filter(item => item.transcription_id !== id));
    } catch (e) {
      alert("Error deleting record: " + e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transcription History
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Private user repository of completed speech-to-text recognitions, metadata, and edited transcripts.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transcripts or filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Querying transcription database...
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">No Transcription Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Upload an audio file or record speech to populate your private transcription history.
          </p>
          <NavLink
            to="/speech-to-text"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
          >
            Start Speech-to-Text
          </NavLink>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Audio Sample</th>
                  <th className="py-3.5 px-4">Model Engine</th>
                  <th className="py-3.5 px-4">Transcript Preview</th>
                  <th className="py-3.5 px-4">Duration & RTF</th>
                  <th className="py-3.5 px-4">Words</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.transcription_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {item.filename}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                        {item.model_used.replace('openai/', '')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300 italic">
                      "{item.edited_transcript || item.original_transcript}"
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.duration_sec}s · {item.real_time_factor}x
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {item.word_count || 0}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <NavLink
                        to={`/editor?id=${item.transcription_id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 inline-flex transition-colors"
                        title="Edit in Rich Editor"
                      >
                        <FileText className="w-4 h-4" />
                      </NavLink>
                      <button
                        onClick={() => handleDelete(item.transcription_id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
