import math
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import scipy.signal
from scipy.signal import find_peaks
from backend.ml.preprocessing.pipeline import AudioPreprocessor

class AcousticFeatureExtractor:
    """
    Comprehensive, zero-hang acoustic analysis engine extracting 18 speech parameters
    grounded in dysarthric speech research (IEEE Access) using pure NumPy and SciPy.
    """

    @classmethod
    def extract_features(cls, file_or_array: Path | str | np.ndarray, sr: int = 16000) -> Dict[str, Any]:
        """Extract complete acoustic profile from audio file path or numpy array."""
        if isinstance(file_or_array, (str, Path)):
            audio, sr, duration = AudioPreprocessor.load_audio(file_or_array, target_sr=sr)
        else:
            audio = np.asarray(file_or_array, dtype=np.float32)
            duration = float(len(audio) / sr)

        if len(audio) < 400:
            return cls._empty_profile(duration)

        frame_len = int(0.025 * sr)  # 25 ms = 400 samples
        hop_len = int(0.010 * sr)    # 10 ms = 160 samples

        # 1. Pitch & F0 tracking via YIN algorithm (NumPy vectorized)
        f0_series = cls._yin_pitch_tracker(audio, sr, frame_len=frame_len, hop_len=hop_len)
        valid_f0 = f0_series[f0_series > 0]

        if len(valid_f0) > 2:
            f0_mean = float(np.mean(valid_f0))
            f0_std = float(np.std(valid_f0))
            f0_min = float(np.min(valid_f0))
            f0_max = float(np.max(valid_f0))
            pitch_iqr = float(np.percentile(valid_f0, 75) - np.percentile(valid_f0, 25))
        else:
            f0_mean = f0_std = f0_min = f0_max = pitch_iqr = 0.0

        step = max(1, len(f0_series) // 40)
        pitch_curve = [round(float(v), 1) for v in f0_series[::step][:40]]

        # 2. Local Jitter (Period Perturbation Quotient)
        jitter_pct = 0.0
        if len(valid_f0) > 4:
            periods = 1.0 / np.maximum(valid_f0, 1e-4)
            period_diffs = np.abs(np.diff(periods))
            mean_period = np.mean(periods)
            if mean_period > 1e-6:
                jitter_pct = float((np.mean(period_diffs) / mean_period) * 100.0)

        # 3. RMS Energy & Temporal Envelope
        frames = np.lib.stride_tricks.sliding_window_view(audio, frame_len)[::hop_len]
        rms_frames = np.sqrt(np.mean(frames**2, axis=-1))
        rms_mean = float(np.mean(rms_frames)) if len(rms_frames) > 0 else 0.0

        step_rms = max(1, len(rms_frames) // 40)
        energy_curve = [round(float(v), 4) for v in rms_frames[::step_rms][:40]]

        # 4. Local Shimmer (Amplitude Perturbation)
        shimmer_db = 0.0
        peaks, _ = find_peaks(np.abs(audio), distance=max(1, int(sr / 350)))
        if len(peaks) > 8:
            peak_amps = np.abs(audio[peaks])
            amp_diffs = np.abs(np.diff(peak_amps))
            mean_amp = np.mean(peak_amps)
            if mean_amp > 1e-5:
                shimmer_ratio = np.mean(amp_diffs) / mean_amp
                shimmer_db = float(20.0 * np.log10(max(1.0 + shimmer_ratio, 1.0001)))

        # 5. Harmonics-to-Noise Ratio (HNR)
        hnr_db = cls._calculate_hnr(audio, sr)

        # 6. Formants (F1, F2) via LPC analysis
        f1, f2, formant_disp = cls._calculate_lpc_formants(audio, sr)

        # 7. Spectral Moments via FFT
        fft_mags = np.abs(np.fft.rfft(frames, axis=-1))
        fft_freqs = np.fft.rfftfreq(frame_len, d=1.0 / sr)

        # Spectral Centroid
        centroid_frames = np.sum(fft_freqs * fft_mags, axis=-1) / np.maximum(np.sum(fft_mags, axis=-1), 1e-8)
        spectral_centroid = float(np.mean(centroid_frames))

        # Spectral Bandwidth
        bandwidth_frames = np.sqrt(
            np.sum(((fft_freqs - centroid_frames[:, None]) ** 2) * fft_mags, axis=-1)
            / np.maximum(np.sum(fft_mags, axis=-1), 1e-8)
        )
        spectral_bandwidth = float(np.mean(bandwidth_frames))

        # Spectral Roll-off (85%)
        cum_energy = np.cumsum(fft_mags, axis=-1)
        total_energy = cum_energy[:, -1:]
        threshold = 0.85 * total_energy
        rolloff_indices = np.argmax(cum_energy >= threshold, axis=-1)
        spectral_rolloff = float(np.mean(fft_freqs[rolloff_indices]))

        # 8. Zero Crossing Rate
        signs = np.sign(frames)
        signs[signs == 0] = 1
        zcr_frames = np.mean(np.abs(np.diff(signs, axis=-1)) > 0, axis=-1)
        zcr_mean = float(np.mean(zcr_frames))

        # 9. Spectral Tilt
        spectral_tilt = cls._calculate_spectral_tilt(audio, sr)

        # 10. Temporal Centroid
        times = np.linspace(0, duration, len(rms_frames))
        total_energy_sum = np.sum(rms_frames)
        temporal_centroid = float(np.sum(times * rms_frames) / max(total_energy_sum, 1e-6))

        # 11. Speech Rate & Articulation Rate
        syllable_peaks, _ = find_peaks(rms_frames, height=np.median(rms_frames) * 1.2, distance=int(sr * 0.15 / hop_len))
        syllable_count = max(1, len(syllable_peaks))
        speech_rate_sps = float(syllable_count / max(0.2, duration))
        voiced_count = len(valid_f0)
        voiced_duration = float(voiced_count * hop_len / sr)
        articulation_rate_sps = float(syllable_count / max(0.1, voiced_duration))

        features_dict = {
            "speech_rate_syllables_per_sec": round(speech_rate_sps, 2),
            "articulation_rate_sps": round(articulation_rate_sps, 2),
            "f0_mean_hz": round(f0_mean, 1),
            "f0_std_hz": round(f0_std, 1),
            "f0_min_hz": round(f0_min, 1),
            "f0_max_hz": round(f0_max, 1),
            "pitch_iqr_hz": round(pitch_iqr, 1),
            "hnr_db": round(hnr_db, 2),
            "local_jitter_pct": round(min(jitter_pct, 20.0), 3),
            "local_shimmer_db": round(min(shimmer_db, 15.0), 3),
            "formant_f1_hz": round(f1, 1),
            "formant_f2_hz": round(f2, 1),
            "formant_dispersion_hz": round(formant_disp, 1),
            "spectral_tilt_db_per_oct": round(spectral_tilt, 2),
            "temporal_centroid_sec": round(temporal_centroid, 3),
            "rms_energy": round(rms_mean, 4),
            "zero_crossing_rate": round(zcr_mean, 4),
            "spectral_centroid_hz": round(spectral_centroid, 1),
            "spectral_bandwidth_hz": round(spectral_bandwidth, 1),
            "spectral_rolloff_hz": round(spectral_rolloff, 1),
            "duration_sec": round(duration, 2)
        }

        metadata = {
            "f0_mean_hz": {"unit": "Hz", "desc": "Average vocal fold vibration frequency."},
            "pitch_iqr_hz": {"unit": "Hz", "desc": "Pitch variation range; dysarthric speech displays reduced dynamic pitch."},
            "hnr_db": {"unit": "dB", "desc": "Harmonics-to-Noise Ratio measuring vocal breathiness and glottal turbulence."},
            "local_jitter_pct": {"unit": "%", "desc": "Cycle-to-cycle frequency variation measuring vocal instability."},
            "local_shimmer_db": {"unit": "dB", "desc": "Cycle-to-cycle amplitude perturbation."},
            "formant_f1_hz": {"unit": "Hz", "desc": "First resonant formant correlated with tongue height and vowel openness."},
            "formant_f2_hz": {"unit": "Hz", "desc": "Second formant correlated with tongue advancement and vowel space."},
            "formant_dispersion_hz": {"unit": "Hz", "desc": "Distance between F1 and F2 reflecting vowel centralization in dysarthria."},
            "spectral_centroid_hz": {"unit": "Hz", "desc": "Brightness of sound and frequency balance center."},
            "speech_rate_syllables_per_sec": {"unit": "syl/s", "desc": "Overall syllable production speed."},
            "zero_crossing_rate": {"unit": "ratio", "desc": "Rate of sign changes in audio signal; distinguishes unvoiced friction."}
        }

        return {
            "features": features_dict,
            "feature_metadata": metadata,
            "pitch_contour": pitch_curve,
            "energy_contour": energy_curve,
            "duration_sec": round(duration, 2)
        }

    @classmethod
    def _yin_pitch_tracker(cls, audio: np.ndarray, sr: int, frame_len: int, hop_len: int) -> np.ndarray:
        """YIN algorithm for fundamental frequency tracking in pure vectorized NumPy."""
        min_tau = int(sr / 450)  # 450 Hz max pitch
        max_tau = int(sr / 70)   # 70 Hz min pitch

        frames = np.lib.stride_tricks.sliding_window_view(audio, frame_len)[::hop_len]
        f0_list = []

        for frame in frames:
            energy = np.sum(frame**2)
            if energy < 1e-4:
                f0_list.append(0.0)
                continue

            # Difference function
            diff = np.zeros(max_tau)
            for tau in range(1, max_tau):
                diff[tau] = np.sum((frame[:-tau] - frame[tau:]) ** 2)

            # Cumulative mean normalized difference
            cmndf = np.zeros(max_tau)
            cmndf[0] = 1.0
            cumsum = 0.0
            for tau in range(1, max_tau):
                cumsum += diff[tau]
                cmndf[tau] = diff[tau] / (cumsum / tau + 1e-8)

            # Absolute threshold search
            tau_candidates = np.where(cmndf[min_tau:] < 0.20)[0]
            if len(tau_candidates) > 0:
                best_tau = min_tau + tau_candidates[0]
                # Local parabolic interpolation
                if 1 < best_tau < max_tau - 1:
                    alpha = cmndf[best_tau - 1]
                    beta = cmndf[best_tau]
                    gamma = cmndf[best_tau + 1]
                    denom = 2 * (alpha - 2 * beta + gamma) + 1e-8
                    delta = (alpha - gamma) / denom
                    best_tau = best_tau + delta
                f0_val = sr / best_tau
                f0_list.append(float(f0_val) if 70 <= f0_val <= 450 else 0.0)
            else:
                f0_list.append(0.0)

        return np.array(f0_list, dtype=np.float32)

    @staticmethod
    def _calculate_hnr(audio: np.ndarray, sr: int) -> float:
        """Autocorrelation-based Harmonics-to-Noise Ratio (dB)."""
        try:
            chunk = audio[: min(len(audio), sr * 2)]
            corr = np.correlate(chunk, chunk, mode="full")
            corr = corr[len(corr) // 2 :]
            min_lag = int(sr / 450)
            max_lag = int(sr / 70)
            if max_lag >= len(corr):
                return 16.0
            peak_lag = min_lag + np.argmax(corr[min_lag:max_lag])
            r0 = max(corr[0], 1e-6)
            rx = max(corr[peak_lag], 1e-6)
            if rx < r0:
                hnr = 10 * np.log10(rx / (r0 - rx))
                return float(np.clip(hnr, -5.0, 35.0))
            return 18.0
        except Exception:
            return 16.0

    @staticmethod
    def _calculate_lpc_formants(audio: np.ndarray, sr: int) -> tuple[float, float, float]:
        """Estimate Formants F1 and F2 using Linear Predictive Coding (LPC) roots."""
        try:
            # Downsample to 10kHz for standard 12-pole vocal tract modeling
            if sr != 10000:
                audio_10k = scipy.signal.resample_poly(audio, 5, 8).astype(np.float32)
            else:
                audio_10k = audio

            segment = audio_10k[int(len(audio_10k) * 0.2) : int(len(audio_10k) * 0.8)]
            if len(segment) < 500:
                segment = audio_10k

            # Pre-emphasis filter
            pre_emph = np.append(segment[0], segment[1:] - 0.97 * segment[:-1])
            windowed = pre_emph * np.hamming(len(pre_emph))

            # Autocorrelation of windowed frame
            r = np.correlate(windowed, windowed, mode="full")
            r = r[len(r) // 2 : len(r) // 2 + 13]

            # Solve Yule-Walker / Levinson-Durbin
            a = scipy.linalg.solve_toeplitz(r[:-1], r[1:])
            lpc_coeffs = np.concatenate([[1.0], -a])

            roots = np.roots(lpc_coeffs)
            roots = [r for r in roots if np.imag(r) >= 0]
            angles = np.arctan2(np.imag(roots), np.real(roots))
            freqs = sorted(angles * (10000.0 / (2.0 * np.pi)))
            formants = [f for f in freqs if 250 < f < 4000]

            f1 = float(formants[0]) if len(formants) > 0 else 550.0
            f2 = float(formants[1]) if len(formants) > 1 else 1650.0
            return f1, f2, float(f2 - f1)
        except Exception:
            return 550.0, 1650.0, 1100.0

    @staticmethod
    def _calculate_spectral_tilt(audio: np.ndarray, sr: int) -> float:
        """Spectral tilt regression in dB/octave."""
        try:
            fft_mag = np.abs(np.fft.rfft(audio[: min(len(audio), sr * 2)])) + 1e-6
            fft_freq = np.fft.rfftfreq(min(len(audio), sr * 2), d=1.0 / sr)
            idx = np.where((fft_freq >= 120) & (fft_freq <= 4000))[0]
            if len(idx) > 5:
                log_freqs = np.log2(fft_freq[idx])
                log_power = 20 * np.log10(fft_mag[idx])
                slope, _ = np.polyfit(log_freqs, log_power, 1)
                return float(slope)
            return -6.0
        except Exception:
            return -6.0

    @staticmethod
    def _empty_profile(duration: float) -> Dict[str, Any]:
        return {
            "features": {"duration_sec": round(duration, 2)},
            "feature_metadata": {},
            "pitch_contour": [],
            "energy_contour": [],
            "duration_sec": round(duration, 2)
        }
