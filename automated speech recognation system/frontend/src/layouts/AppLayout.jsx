import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  FileAudio,
  Sliders,
  FileText,
  History,
  Activity,
  Layers,
  Sparkles,
  Database,
  Cpu,
  Brain,
  ScatterChart,
  BarChart3,
  CheckCircle2,
  GitCompare,
  FileSpreadsheet,
  User,
  Settings,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const navGroups = [
  {
    title: 'Standard ASR',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: Activity },
      { name: 'Speech-to-Text', path: '/speech-to-text', icon: FileAudio },
      { name: 'Live Transcription', path: '/live', icon: Mic },
      { name: 'Audio Preprocessing', path: '/preprocessing', icon: Sliders },
      { name: 'Transcript Editor', path: '/editor', icon: FileText },
      { name: 'Transcription History', path: '/history', icon: History },
    ]
  },
  {
    title: 'Research & Speech Analysis',
    items: [
      { name: 'Speech Analysis', path: '/speech-analysis', icon: Layers },
      { name: 'Acoustic Features', path: '/acoustic-features', icon: BarChart3 },
      { name: 'Dysarthric Research', path: '/dysarthric-research', icon: Sparkles },
      { name: 'Dataset Management', path: '/datasets', icon: Database },
      { name: 'Synthetic Augmentation', path: '/augmentation', icon: Cpu },
      { name: 'Model Training', path: '/training', icon: Brain },
      { name: 'Experiments', path: '/experiments', icon: CheckCircle2 },
      { name: 'PCA Visualization', path: '/pca', icon: ScatterChart },
      { name: 't-SNE Visualization', path: '/tsne', icon: ScatterChart },
      { name: 'Model Evaluation', path: '/evaluation', icon: CheckCircle2 },
      { name: 'Model Comparison', path: '/comparison', icon: GitCompare },
      { name: 'Research Reports', path: '/reports', icon: FileSpreadsheet },
    ]
  },
  {
    title: 'System & Account',
    items: [
      { name: 'User Profile', path: '/profile', icon: User },
      { name: 'Settings & Hardware', path: '/settings', icon: Settings },
      { name: 'About Project', path: '/about', icon: Info },
    ]
  }
];

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [telemetry, setTelemetry] = useState({ cpu: 0, ram: 0, device: 'CPU' });
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await api.getSystemResources();
        setTelemetry({
          cpu: Math.round(res.data.cpu_percent ?? res.data.cpu?.percent ?? 0),
          ram: Math.round(res.data.ram_percent ?? res.data.ram?.percent ?? 0),
          device: (res.data.gpu_info?.available || res.data.gpu?.available) ? 'CUDA GPU' : 'CPU'
        });
      } catch (e) {
        // ignore telemetry errors
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                SpeechSense
              </span>
              <span className="text-xs ml-1 font-mono uppercase px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-900">
                AI
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Research ASR Platform</p>
            </div>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/40 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* System Resource Telemetry in sidebar footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/50">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Hardware Telemetry</span>
            <span className="font-mono text-brand-600 dark:text-brand-400">{telemetry.device}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-500">CPU Usage</span>
                <span className="font-mono font-medium">{telemetry.cpu}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, telemetry.cpu)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-500">System RAM</span>
                <span className="font-mono font-medium">{telemetry.ram}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, telemetry.ram)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <NavLink to="/dashboard" className="hover:text-slate-800 dark:hover:text-white">Home</NavLink>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-800 dark:text-white capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User status */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user?.name || 'Guest Researcher'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {user?.is_guest ? 'Guest Demonstration Mode' : user?.email}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {(user?.name || 'G')[0].toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign Out / Switch User"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
