import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

export const WaveformVisualizer = ({ audioUrl, waveformData = [], duration = 0 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (idx) => {
    if (!audioRef.current || !duration) return;
    const targetTime = (idx / (waveformData.length || 1)) * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const bars = waveformData && waveformData.length > 0
    ? waveformData
    : Array.from({ length: 48 }, (_, i) => 0.2 + (0.6 * Math.abs(Math.sin(i * 0.4))));

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Waveform Bars */}
      <div className="h-20 flex items-center gap-1.5 px-2 bg-slate-50 dark:bg-navy-950/60 rounded-xl mb-4 overflow-hidden border border-slate-100 dark:border-slate-800/80">
        {bars.map((val, idx) => {
          const progressRatio = duration > 0 ? currentTime / duration : 0;
          const barRatio = idx / bars.length;
          const isPassed = barRatio <= progressRatio;

          return (
            <button
              key={idx}
              onClick={() => handleSeek(idx)}
              className={`flex-1 rounded-full transition-all duration-150 hover:opacity-100 ${
                isPassed
                  ? 'bg-brand-500 dark:bg-brand-400'
                  : 'bg-slate-300 dark:bg-slate-700 opacity-60'
              }`}
              style={{
                height: `${Math.max(15, Math.min(100, Math.round(val * 100)))}%`
              }}
              title={`Seek to ${formatTime((idx / bars.length) * duration)}`}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-brand-500/20 disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            title="Restart playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {formatTime(currentTime)} / {formatTime(duration || (audioRef.current ? audioRef.current.duration || 0 : 0))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-20 accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
