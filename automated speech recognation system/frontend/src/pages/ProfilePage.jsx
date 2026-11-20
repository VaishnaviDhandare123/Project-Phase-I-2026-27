import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Database,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [retentionDays, setRetentionDays] = useState("30");
  const [anonymizeAcoustics, setAnonymizeAcoustics] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSavePrivacy = (e) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Researcher Profile & Privacy Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your session credentials, biometric audio confidentiality policies, and local data isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-2xl mx-auto border-2 border-brand-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {user?.name || "Guest Researcher"}
            </h3>
            <p className="text-xs text-slate-400">{user?.email || "guest@speechsense.ai"}</p>
          </div>

          <div className="pt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.is_guest
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              {user?.is_guest ? 'Guest Demonstration Mode' : 'Authenticated JWT User'}
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            {user?.is_guest ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">
                  You are currently operating in guest mode. Transcriptions and experiments are stored in the local workspace.
                </p>
                <Link
                  to="/login"
                  className="block w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Log In / Create Account
                </Link>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all hover:bg-rose-100 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Account Details & Security */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-500" /> Session Security & Identifier
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">User Identifier:</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{user?.user_id || 'guest_demo'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">JWT Token Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {user?.is_guest ? 'Local Guest Token' : 'Active (HS256 Signed)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-medium">Model Access Permissions:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Full Pipeline (Whisper-tiny, Seq2Seq Fine-Tuning, Acoustics)
                </span>
              </div>
            </div>
          </div>

          {/* Biometric Audio Data Policy */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-purple-500" />
              Audio Privacy & Ethical Research Governance
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with IRB ethics standards for speech pathology research, all dysarthric recordings and synthetic speech vectors must be treated with heightened data confidentiality.
            </p>

            <form onSubmit={handleSavePrivacy} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Audio Fixture Retention Period
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="7">Purge audio files after 7 days</option>
                  <option value="30">Purge audio files after 30 days (Recommended)</option>
                  <option value="90">Retain for research benchmark duration (90 days)</option>
                  <option value="0">Never auto-purge (Permanent research repository)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymizeAcoustics}
                    onChange={(e) => setAnonymizeAcoustics(e.target.checked)}
                    className="rounded accent-brand-600"
                  />
                  <span>Anonymize Speaker Identifiers in PCA/t-SNE Export Files</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Update Privacy Preferences
                </button>

                {savedSettings && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
