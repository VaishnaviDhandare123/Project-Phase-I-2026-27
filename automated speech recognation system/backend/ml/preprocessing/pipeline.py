import math
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import numpy as np
import soundfile as sf
import scipy.signal

class AudioPreprocessor:
    """Dedicated audio signal preprocessing engine using SoundFile, NumPy and SciPy."""

    @staticmethod
    def load_audio(file_path: Path | str, target_sr: int = 16000) -> Tuple[np.ndarray, int, float]:
        """Load audio file, convert to mono, resample to target sampling rate."""
        file_path = str(file_path)
        audio, sr = sf.read(file_path, dtype="float32")
        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)
        if sr != target_sr:
            # High-quality polyphase resampling via scipy
            gcd = math.gcd(target_sr, sr)
            up = target_sr // gcd
            down = sr // gcd
            audio = scipy.signal.resample_poly(audio, up, down).astype(np.float32)
            sr = target_sr

        duration = float(len(audio) / sr)
        return audio, sr, duration

    @staticmethod
    def peak_normalize(audio: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
        """Scale waveform so the peak amplitude equals target_peak without clipping."""
        max_val = np.max(np.abs(audio))
        if max_val > 1e-6:
            return (audio / max_val) * target_peak
        return audio

    @staticmethod
    def rms_normalize(audio: np.ndarray, target_db: float = -20.0) -> np.ndarray:
        """Normalize audio RMS energy to a targeted decibel level."""
        rms = np.sqrt(np.mean(audio**2))
        if rms < 1e-6:
            return audio
        current_db = 20 * np.log10(rms)
        gain = 10 ** ((target_db - current_db) / 20)
        normalized = audio * gain
        return np.clip(normalized, -1.0, 1.0)

    @staticmethod
    def trim_silence(audio: np.ndarray, top_db: float = 28.0, frame_len: int = 400, hop_len: int = 160) -> Tuple[np.ndarray, Tuple[int, int]]:
        """Trim leading and trailing silence using pure numpy energy threshold."""
        if len(audio) < frame_len:
            return audio, (0, len(audio))

        frames = np.lib.stride_tricks.sliding_window_view(audio, frame_len)[::hop_len]
        rms = np.sqrt(np.mean(frames**2, axis=-1))
        max_rms = np.max(rms) if len(rms) > 0 else 0.0

        if max_rms < 1e-6:
            return audio, (0, len(audio))

        threshold = max_rms * (10 ** (-top_db / 20.0))
        active_indices = np.where(rms >= threshold)[0]

        if len(active_indices) == 0:
            return audio, (0, len(audio))

        start_sample = max(0, active_indices[0] * hop_len)
        end_sample = min(len(audio), (active_indices[-1] * hop_len) + frame_len)
        return audio[start_sample:end_sample], (start_sample, end_sample)

    @staticmethod
    def estimate_noise_level(audio: np.ndarray, sr: int = 16000) -> Dict[str, float]:
        """Estimate SNR (Signal-to-Noise Ratio) and ambient floor from the quietest 15% frames."""
        frame_len = int(0.025 * sr)
        hop_len = int(0.010 * sr)

        if len(audio) < frame_len:
            return {"snr_db": 0.0, "noise_floor_db": -60.0, "signal_rms_db": -60.0}

        frames = np.lib.stride_tricks.sliding_window_view(audio, frame_len)[::hop_len]
        rms_frames = np.sqrt(np.mean(frames**2, axis=-1))

        if len(rms_frames) == 0:
            return {"snr_db": 0.0, "noise_floor_db": -60.0, "signal_rms_db": -60.0}

        sorted_rms = np.sort(rms_frames)
        noise_frames = sorted_rms[: max(1, int(len(sorted_rms) * 0.15))]
        signal_frames = sorted_rms[int(len(sorted_rms) * 0.15) :]

        noise_rms = np.mean(noise_frames) if len(noise_frames) > 0 else 1e-6
        signal_rms = np.mean(signal_frames) if len(signal_frames) > 0 else 1e-6

        noise_db = 20 * np.log10(max(noise_rms, 1e-6))
        signal_db = 20 * np.log10(max(signal_rms, 1e-6))
        snr_db = float(signal_db - noise_db)

        return {
            "snr_db": round(snr_db, 2),
            "noise_floor_db": round(float(noise_db), 2),
            "signal_rms_db": round(float(signal_db), 2)
        }

    @staticmethod
    def reduce_noise_spectral(audio: np.ndarray, sr: int = 16000, reduction_factor: float = 0.5) -> np.ndarray:
        """Conservative spectral gating using scipy.signal.stft / istft."""
        f, t, Zxx = scipy.signal.stft(audio, fs=sr, nperseg=512, noverlap=352)
        magnitude, phase = np.abs(Zxx), np.angle(Zxx)

        noise_thresh = np.quantile(magnitude, 0.10, axis=1, keepdims=True)
        mask = np.maximum(0.15, 1.0 - (noise_thresh * reduction_factor / (magnitude + 1e-8)))
        enhanced_Zxx = (magnitude * mask) * np.exp(1j * phase)

        _, enhanced_audio = scipy.signal.istft(enhanced_Zxx, fs=sr, nperseg=512, noverlap=352)
        return enhanced_audio[:len(audio)].astype(np.float32)

    @classmethod
    def process_pipeline(
        cls,
        input_path: Path | str,
        output_path: Optional[Path | str] = None,
        normalize: bool = True,
        trim_silence_flag: bool = False,
        noise_reduction_flag: bool = False,
        target_sr: int = 16000
    ) -> Dict[str, Any]:
        """Execute full configurable audio preprocessing pipeline."""
        raw_audio, orig_sr, orig_duration = cls.load_audio(input_path, target_sr=target_sr)
        orig_noise = cls.estimate_noise_level(raw_audio, target_sr)

        processed = np.copy(raw_audio)

        if trim_silence_flag:
            processed, _ = cls.trim_silence(processed, top_db=28.0)

        if noise_reduction_flag:
            processed = cls.reduce_noise_spectral(processed, sr=target_sr, reduction_factor=0.6)

        if normalize:
            processed = cls.peak_normalize(processed, target_peak=0.95)

        processed_duration = float(len(processed) / target_sr)
        proc_noise = cls.estimate_noise_level(processed, target_sr)

        if output_path:
            sf.write(str(output_path), processed, target_sr)

        downsample_factor = max(1, len(processed) // 64)
        waveform_sample = [round(float(np.abs(val)), 3) for val in processed[::downsample_factor][:64]]

        return {
            "original_duration_sec": round(orig_duration, 2),
            "processed_duration_sec": round(processed_duration, 2),
            "sample_rate": target_sr,
            "original_snr_db": orig_noise["snr_db"],
            "processed_snr_db": proc_noise["snr_db"],
            "normalization_applied": normalize,
            "silence_trimmed": trim_silence_flag,
            "noise_reduction_applied": noise_reduction_flag,
            "waveform_preview": waveform_sample,
            "samples_count": len(processed)
        }
