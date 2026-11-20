import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { TranscriptEditor } from '../components/editor/TranscriptEditor';

export const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const transcriptionId = searchParams.get('id');

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transcriptionId) {
      fetchRecord(transcriptionId);
    }
  }, [transcriptionId]);

  const fetchRecord = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTranscription(id);
      setRecord(res.data);
    } catch (err) {
      setError('Could not load transcription record. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Advanced Transcript Editor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manual correction, multi-format export (TXT, PDF, DOCX, JSON, SRT), and side-by-side original AI comparison.
          </p>
        </div>

        {transcriptionId && (
          <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            ID: {transcriptionId}
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading transcript data from MongoDB repository...
        </div>
      ) : (
        <TranscriptEditor
          transcriptionId={transcriptionId}
          originalTranscript={record?.original_transcript || "Speech recognition systems transcribe human speech into digital text with high fidelity."}
          initialTranscript={record?.edited_transcript || record?.original_transcript || "Speech recognition systems transcribe human speech into digital text with high fidelity."}
          segments={record?.segments || []}
          onSaved={(updatedText) => {
            if (record) {
              setRecord({ ...record, edited_transcript: updatedText });
            }
          }}
        />
      )}
    </div>
  );
};
