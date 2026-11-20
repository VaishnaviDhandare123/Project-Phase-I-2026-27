import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Zap,
  Mic,
  ArrowLeft,
  Share2,
  Download,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

export const DetailsPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.getTranscription(id)
        .then(res => setRecord(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-20 text-center text-xs text-slate-400">Loading transcription details...</div>;
  }

  if (!record) {
    return (
      <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Transcription Record Not Found</p>
        <NavLink to="/history" className="text-xs text-brand-600 hover:underline">Return to History</NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <NavLink
          to={`/editor?id=${record.transcription_id}`}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm"
        >
          Open in Editor
        </NavLink>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-900">
            {record.model_used}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {record.filename}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Created at: {record.created_at}</p>
        </div>

        <WaveformVisualizer
          audioUrl={`/static/audio/${record.filename.split('.')[0]}_proc.wav`}
          waveformData={record.waveform_preview}
          duration={record.duration_sec}
        />

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Transcript Text
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 font-normal text-sm leading-relaxed border border-slate-200 dark:border-slate-800">
            "{record.edited_transcript || record.original_transcript}"
          </div>
        </div>

        {/* Timestamp Segments */}
        {record.segments && record.segments.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Timestamp Segments ({record.segments.length})
            </h3>
            <div className="space-y-2">
              {record.segments.map((seg, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-100 dark:border-slate-800 flex items-start gap-4 text-xs">
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold flex-shrink-0">
                    [{seg.start}s - {seg.end}s]
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">{seg.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
