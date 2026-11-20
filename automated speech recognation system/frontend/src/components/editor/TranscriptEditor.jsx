import React, { useState } from 'react';
import {
  Copy,
  Check,
  Search,
  Replace,
  Download,
  Save,
  RotateCcw,
  RotateCw,
  FileText,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';

export const TranscriptEditor = ({
  transcriptionId,
  originalTranscript = '',
  initialTranscript = '',
  segments = [],
  onSaved
}) => {
  const [text, setText] = useState(initialTranscript || originalTranscript);
  const [history, setHistory] = useState([initialTranscript || originalTranscript]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Search & Replace
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // View toggle: Original vs Edited
  const [viewMode, setViewMode] = useState('edited'); // 'edited' | 'original' | 'split'

  const handleChange = (newVal) => {
    setText(newVal);
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(newVal);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setSavedSuccess(false);
  };

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setText(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setText(history[historyIdx + 1]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFindReplace = () => {
    if (!searchQuery) return;
    const regex = new RegExp(searchQuery, 'gi');
    const updated = text.replace(regex, replaceQuery);
    handleChange(updated);
  };

  const handleSave = async () => {
    if (!transcriptionId) return;
    setSaving(true);
    try {
      await api.updateTranscript(transcriptionId, text);
      setSavedSuccess(true);
      if (onSaved) onSaved(text);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert("Error saving transcript: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Export handlers
  const downloadTXT = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${transcriptionId || 'export'}.txt`;
    a.click();
  };

  const downloadJSON = () => {
    const data = {
      transcription_id: transcriptionId,
      original_transcript: originalTranscript,
      edited_transcript: text,
      segments: segments,
      word_count: text.split(/\s+/).filter(Boolean).length,
      char_count: text.length
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${transcriptionId || 'export'}.json`;
    a.click();
  };

  const downloadSRT = () => {
    let srtContent = '';
    const segs = segments && segments.length > 0 ? segments : [{ id: 1, start: 0.0, end: 5.0, text: text }];

    const formatSRTTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };

    segs.forEach((seg, idx) => {
      srtContent += `${idx + 1}\n`;
      srtContent += `${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n`;
      srtContent += `${seg.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${transcriptionId || 'export'}.srt`;
    a.click();
  };

  const handleExportPDF = async () => {
    try {
      const res = await api.generateReport({
        title: "SpeechSense AI Transcript Export",
        transcription_id: transcriptionId,
        export_format: "pdf"
      });
      window.open(api.getReportDownloadUrl(res.data.report_id), '_blank');
    } catch (e) {
      alert("Error generating PDF: " + e.message);
    }
  };

  const handleExportDOCX = async () => {
    try {
      const res = await api.generateReport({
        title: "SpeechSense AI Transcript Export",
        transcription_id: transcriptionId,
        export_format: "docx"
      });
      window.open(api.getReportDownloadUrl(res.data.report_id), '_blank');
    } catch (e) {
      alert("Error generating DOCX: " + e.message);
    }
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('edited')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'edited'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Edited Version
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'original'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Original AI Transcript
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Side-by-Side Split
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={undo}
            disabled={historyIdx === 0}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIdx === history.length - 1}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
              showSearch ? 'text-brand-600 bg-brand-50 dark:bg-brand-950' : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Copy Transcript"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={downloadTXT}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              title="Download TXT"
            >
              TXT
            </button>
            <button
              onClick={downloadJSON}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              title="Export JSON"
            >
              JSON
            </button>
            <button
              onClick={downloadSRT}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              title="Export Subtitles (SRT)"
            >
              SRT
            </button>
            <button
              onClick={handleExportPDF}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              title="Generate PDF Report"
            >
              PDF
            </button>
            <button
              onClick={handleExportDOCX}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              title="Export Word Document (DOCX)"
            >
              DOCX
            </button>
          </div>

          {/* Save Button */}
          {transcriptionId && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`ml-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white shadow-sm transition-all active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-brand-600 hover:bg-brand-500'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Edits'}
            </button>
          )}
        </div>
      </div>

      {/* Find & Replace Bar */}
      {showSearch && (
        <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 border-b border-brand-100 dark:border-brand-900/40 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-white"
          />
          <button
            onClick={handleFindReplace}
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium flex items-center gap-1"
          >
            <Replace className="w-3.5 h-3.5" /> Replace All
          </button>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="flex-1 p-4">
        {viewMode === 'edited' && (
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 font-normal text-sm leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none shadow-inner"
            placeholder="Transcription text..."
          />
        )}

        {viewMode === 'original' && (
          <div className="w-full h-80 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 font-normal text-sm leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">
              Read-Only Original Pretrained AI Model Output
            </div>
            {originalTranscript || text}
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
            <div className="flex flex-col h-full">
              <span className="text-xs font-semibold text-slate-500 mb-1">Original Model Output</span>
              <div className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-xs text-slate-600 dark:text-slate-300 overflow-y-auto">
                {originalTranscript || text}
              </div>
            </div>
            <div className="flex flex-col h-full">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">User Corrected Transcript</span>
              <textarea
                value={text}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-white dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="font-mono text-slate-700 dark:text-slate-200">{wordCount}</strong></span>
          <span>Characters: <strong className="font-mono text-slate-700 dark:text-slate-200">{charCount}</strong></span>
          <span>Segments: <strong className="font-mono text-slate-700 dark:text-slate-200">{segments?.length || 1}</strong></span>
        </div>
        <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Editor Ready
        </div>
      </div>
    </div>
  );
};
