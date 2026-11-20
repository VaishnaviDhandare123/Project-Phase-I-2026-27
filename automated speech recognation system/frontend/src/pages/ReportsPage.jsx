import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  User,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage = () => {
  const [title, setTitle] = useState("SpeechSense AI Laboratory Report: Acoustic Analysis and ASR Benchmark");
  const [author, setAuthor] = useState("B.Tech CSE Project Research Team");
  const [format, setFormat] = useState("pdf");
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedTranscriptionId, setSelectedTranscriptionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);

  useEffect(() => {
    // Fetch recent transcriptions for dropdown
    api.getHistory({ limit: 10 }).then(res => {
      const items = res.data?.items || [];
      setTranscriptions(items);
      if (items.length > 0) {
        setSelectedTranscriptionId(items[0].transcription_id);
      }
    }).catch(console.error);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateReport({
        title,
        author,
        export_format: format,
        transcription_id: selectedTranscriptionId || undefined
      });
      setGeneratedReport(res.data);
      setReportHistory(prev => [res.data, ...prev]);
    } catch (e) {
      console.error(e);
      alert("Error generating report: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Automated Research Report Generator
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compile automated PDF and Word (.docx) laboratory documentation with acoustic metrics, Levenshtein error analysis, and IEEE methodology citations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            Report Parameters
          </h2>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Authors / Academic Affiliation
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Linked Transcription */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contextual Audio Session (Optional)
              </label>
              <select
                value={selectedTranscriptionId}
                onChange={(e) => setSelectedTranscriptionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Include General System Benchmarks Only</option>
                {transcriptions.map((t) => (
                  <option key={t.transcription_id} value={t.transcription_id}>
                    {t.filename} ({t.duration_seconds?.toFixed(1)}s) - {new Date(t.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Target Export Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    format === 'pdf'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">ReportLab PDF</h4>
                    <p className="text-[11px] text-slate-400">Formal publication-ready layout</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("docx")}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    format === 'docx'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                    DOCX
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Word Document</h4>
                    <p className="text-[11px] text-slate-400">Editable manuscript format</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Compiling Document...' : `Generate ${format.toUpperCase()} Report`}
            </button>
          </form>
        </div>

        {/* Sidebar Info & Active Download */}
        <div className="space-y-6">
          {/* Latest Generated Card */}
          {generatedReport && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Report Ready for Download!
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                {generatedReport.filename}
              </p>
              <a
                href={generatedReport.download_url}
                download
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {generatedReport.format.toUpperCase()}
              </a>
            </div>
          )}

          {/* Report Sections Checklist */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Included Standard Sections
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Executive Abstract & IEEE Methodology</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Acoustic Profile Analysis (F0, HNR, Jitter, Shimmer, Formants)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ASR Transcription & Levenshtein WER / CER Alignment</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Cross-Domain Reality Gap Comparison Table</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ethical Non-Diagnostic Disclaimer & Citations</span>
              </li>
            </ul>
          </div>

          {/* Session History */}
          {reportHistory.length > 0 && (
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                Session Downloads ({reportHistory.length})
              </h4>
              <div className="space-y-2">
                {reportHistory.map((rpt, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-xs">
                    <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                      {rpt.filename}
                    </span>
                    <a
                      href={rpt.download_url}
                      download
                      className="text-brand-600 hover:text-brand-500 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> Get
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
