import os
from pathlib import Path
import numpy as np
import soundfile as sf

BASE_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = BASE_DIR / "backend" / "storage" / "audio"
DATASETS_DIR = BASE_DIR / "datasets" / "raw"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
DATASETS_DIR.mkdir(parents=True, exist_ok=True)

SR = 16000

def generate_formant_vowel(duration: float, f0: float, f1: float, f2: float, sr: int = 16000, noise_level: float = 0.01) -> np.ndarray:
    """Generate synthesized harmonic voice with realistic formants."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Harmonics
    signal = np.zeros_like(t)
    for harmonic in range(1, 15):
        freq = f0 * harmonic
        if freq < sr / 2:
            # Resonant filtering around F1 and F2
            gain1 = np.exp(-((freq - f1)**2) / (2 * (100**2)))
            gain2 = np.exp(-((freq - f2)**2) / (2 * (150**2)))
            gain = 0.6 * gain1 + 0.4 * gain2 + (0.1 / harmonic)
            signal += gain * np.sin(2 * np.pi * freq * t)

    # Envelope
    envelope = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 0.5
    signal = signal * envelope
    # Glottal noise
    signal += np.random.normal(0, noise_level, len(t))
    # Normalize
    max_val = np.max(np.abs(signal))
    if max_val > 0:
        signal = (signal / max_val) * 0.9
    return signal.astype(np.float32)

def generate_speech_phrase(syllables: list, sr: int = 16000, jitter: float = 0.0, rate_factor: float = 1.0) -> np.ndarray:
    phrase_audio = []
    for syl in syllables:
        dur = syl.get("duration", 0.3) * rate_factor
        f0 = syl.get("f0", 160.0) + (np.random.normal(0, jitter) if jitter > 0 else 0)
        f1 = syl.get("f1", 600.0)
        f2 = syl.get("f2", 1700.0)
        wave = generate_formant_vowel(dur, f0, f1, f2, sr=sr, noise_level=syl.get("noise", 0.01))
        phrase_audio.append(wave)
        # Inter-syllable brief pause
        pause = np.zeros(int(sr * 0.06 * rate_factor), dtype=np.float32)
        phrase_audio.append(pause)
    return np.concatenate(phrase_audio)

def main():
    print("Generating standard research speech fixtures...")

    # Phrase 1: Standard speech
    sylls_normal = [
        {"duration": 0.28, "f0": 170.0, "f1": 650.0, "f2": 1800.0},
        {"duration": 0.32, "f0": 175.0, "f1": 550.0, "f2": 1900.0},
        {"duration": 0.25, "f0": 165.0, "f1": 480.0, "f2": 1650.0},
        {"duration": 0.35, "f0": 160.0, "f1": 620.0, "f2": 1750.0},
        {"duration": 0.30, "f0": 150.0, "f1": 500.0, "f2": 1600.0},
    ]

    normal_audio = generate_speech_phrase(sylls_normal, sr=SR, jitter=0.0, rate_factor=1.0)
    sf.write(str(AUDIO_DIR / "sample_lecture_health.wav"), normal_audio, SR)
    print("Saved sample_lecture_health.wav")

    # Phrase 2: Meeting notes speech
    sylls_meeting = [
        {"duration": 0.26, "f0": 180.0, "f1": 580.0, "f2": 1820.0},
        {"duration": 0.30, "f0": 178.0, "f1": 520.0, "f2": 1760.0},
        {"duration": 0.28, "f0": 172.0, "f1": 610.0, "f2": 1850.0},
        {"duration": 0.34, "f0": 165.0, "f1": 490.0, "f2": 1680.0},
    ]
    meeting_audio = generate_speech_phrase(sylls_meeting, sr=SR, jitter=0.0, rate_factor=1.0)
    sf.write(str(AUDIO_DIR / "sample_meeting_notes.wav"), meeting_audio, SR)
    print("Saved sample_meeting_notes.wav")

    # Phrase 3: Dysarthric atypical speech (slower rate, monotone F0, centralized formants, glottal jitter)
    sylls_dysarthric = [
        {"duration": 0.45, "f0": 140.0, "f1": 500.0, "f2": 1450.0, "noise": 0.04},
        {"duration": 0.50, "f0": 142.0, "f1": 490.0, "f2": 1420.0, "noise": 0.05},
        {"duration": 0.48, "f0": 139.0, "f1": 510.0, "f2": 1430.0, "noise": 0.04},
        {"duration": 0.55, "f0": 138.0, "f1": 480.0, "f2": 1400.0, "noise": 0.06},
    ]
    dysarthric_audio = generate_speech_phrase(sylls_dysarthric, sr=SR, jitter=4.5, rate_factor=1.5)
    sf.write(str(AUDIO_DIR / "sample_dysarthric_spastic.wav"), dysarthric_audio, SR)
    print("Saved sample_dysarthric_spastic.wav")

    # Phrase 4: Synthetic speech comparison
    sylls_synthetic = [
        {"duration": 0.32, "f0": 160.0, "f1": 530.0, "f2": 1560.0, "noise": 0.02},
        {"duration": 0.35, "f0": 162.0, "f1": 520.0, "f2": 1540.0, "noise": 0.02},
        {"duration": 0.34, "f0": 159.0, "f1": 540.0, "f2": 1580.0, "noise": 0.02},
        {"duration": 0.38, "f0": 158.0, "f1": 510.0, "f2": 1520.0, "noise": 0.02},
    ]
    syn_audio = generate_speech_phrase(sylls_synthetic, sr=SR, jitter=1.8, rate_factor=1.2)
    sf.write(str(AUDIO_DIR / "sample_synthetic_comparison.wav"), syn_audio, SR)
    print("Saved sample_synthetic_comparison.wav")

    print("All research fixtures generated successfully!")

if __name__ == "__main__":
    main()
