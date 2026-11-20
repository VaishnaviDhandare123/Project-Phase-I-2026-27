import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Trash2,
  FileAudio,
  FolderArchive,
  BarChart2,
  Clock,
  Users,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import { api } from '../services/api';

export const DatasetManagementPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [activeSplit, setActiveSplit] = useState('all'); // 'all' | 'train' | 'validation' | 'test'
  const [loading, setLoading] = useState(true);

  // Import Modal State
  const [showModal, setShowModal] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [desc, setDesc] = useState('');
  const [sourceFormat, setSourceFormat] = useState('TORGO');
  const [datasetType, setDatasetType] = useState('dysarthric');
  const [manifestFile, setManifestFile] = useState(null);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await api.listDatasets();
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDataset) {
        setSelectedDataset(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleImport = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('dataset_name', datasetName);
    formData.append('description', desc);
    formData.append('source_format', sourceFormat);
    formData.append('dataset_type', datasetType);
    if (manifestFile) formData.append('manifest_file', manifestFile);

    try {
      const res = await api.importDataset(formData);
      setDatasets(prev => [res.data, ...prev]);
      setSelectedDataset(res.data);
      setShowModal(false);
      setDatasetName('');
      setDesc('');
    } catch (err) {
      alert("Dataset import failed: " + err.message);
    }
  };

  const filteredSamples = selectedDataset?.samples
    ? selectedDataset.samples.filter(s => activeSplit === 'all' || s.split === activeSplit)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Dataset Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Common adapter schema converting TORGO, UA-Speech, and custom speech corpora into unified research splits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Import Research Dataset
        </button>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {datasets.map((d) => (
          <button
            key={d.dataset_id}
            onClick={() => setSelectedDataset(d)}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedDataset?.dataset_id === d.dataset_id
                ? 'bg-brand-50 dark:bg-brand-950/70 border-brand-500 dark:border-brand-500 shadow-md ring-1 ring-brand-500'
                : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {d.source_format}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {d.sample_count} audio
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {d.dataset_name}
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
              {d.description}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Dataset Detail Card */}
      {selectedDataset && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
                {selectedDataset.dataset_type.toUpperCase()} COHORT
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedDataset.dataset_name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
                {selectedDataset.description}
              </p>
            </div>

            {/* Split Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {['all', 'train', 'validation', 'test'].map((split) => (
                <button
                  key={split}
                  onClick={() => setActiveSplit(split)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    activeSplit === split
                      ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {split}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Samples</span>
              <span className="font-bold">{selectedDataset.sample_count}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Corpus Duration</span>
              <span className="font-bold">{selectedDataset.total_duration_sec} s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Speakers</span>
              <span className="font-bold">{selectedDataset.speakers_count}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Language</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{selectedDataset.language.toUpperCase()}</span>
            </div>
          </div>

          {/* Sample Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Sample ID</th>
                  <th className="py-3 px-4">Speaker</th>
                  <th className="py-3 px-4">Severity / Group</th>
                  <th className="py-3 px-4">Split</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reference Transcription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSamples.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {s.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {s.speaker}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {s.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        s.split === 'train' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' :
                        s.split === 'validation' ? 'bg-amber-50 dark:bg-amber-950 text-amber-600' :
                        'bg-purple-50 dark:bg-purple-950 text-purple-600'
                      }`}>
                        {s.split}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {s.duration_sec}s
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-600 dark:text-slate-300 italic">
                      "{s.reference_transcript}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Import Research Dataset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Dataset Name</label>
                <input
                  type="text"
                  required
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. TORGO Sub-Corpus Session 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Adapter Schema / Format</label>
                <select
                  value={sourceFormat}
                  onChange={(e) => setSourceFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950"
                >
                  <option value="TORGO">TORGO Adapter (Articulatory & Acoustic)</option>
                  <option value="UA-Speech">UA-Speech Adapter (Isolated Word)</option>
                  <option value="Custom">Custom Manifest JSON Adapter</option>
                  <option value="Synthetic">Synthetic Speech Corpus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Cohort Category</label>
                <select
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950"
                >
                  <option value="dysarthric">Dysarthric Speech</option>
                  <option value="healthy">Healthy Speech Baseline</option>
                  <option value="synthetic">Synthetic Augmented Speech</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Corpus metadata, speaker clinical descriptions, recording parameters..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 h-20 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold shadow-sm hover:bg-brand-500"
                >
                  Register Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
