import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import soundfile as sf
import librosa
from backend.app.core.config import settings
from backend.ml.preprocessing.pipeline import AudioPreprocessor

class SyntheticSpeechAdapter:
    """
    Research module for managing synthetic speech, TTS/VC adapters,
    and dysarthric speech data augmentation workflows (IEEE Access).
    """

    @staticmethod
    def verify_consent(consent_granted: bool) -> bool:
        """Enforces explicit ethical and research consent for voice synthesis."""
        return consent_granted is True

    @classmethod
    def import_synthetic_audio(
        cls,
        source_file: Path | str,
        target_name: str,
        speaker_id: str,
        generator_model: str = "XTTSv2 / Neural-TTS",
        consent_confirmed: bool = True
    ) -> Dict[str, Any]:
        """
        Import externally synthesized speech with rigorous provenance metadata.
        """
        if not consent_confirmed:
            raise ValueError("Speaker consent and ethics validation must be affirmed for synthetic voice processing.")

        dest_path = settings.DATASETS_DIR / "synthetic" / f"{target_name}.wav"
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        audio, sr, duration = AudioPreprocessor.load_audio(source_file, target_sr=16000)
        sf.write(str(dest_path), audio, sr)

        metadata = {
            "sample_id": f"syn_{target_name}",
            "filename": f"{target_name}.wav",
            "file_path": str(dest_path),
            "duration_sec": round(duration, 2),
            "speaker_id": speaker_id,
            "generator_model": generator_model,
            "category": "synthetic_dysarthric",
            "is_synthetic": True,
            "consent_validated": True
        }
        return metadata

    @classmethod
    def apply_research_augmentation(
        cls,
        input_audio_path: Path | str,
        output_name: str,
        simulation_type: str = "articulatory_imprecision",
        severity_factor: float = 0.5
    ) -> Dict[str, Any]:
        """
        Acoustic data augmentation simulating dysarthric speech characteristics
        (e.g., articulatory vowel centralization, breathy glottal noise, temporal prolongation).
        Clearly documented as synthetic acoustic simulation.
        """
        audio, sr, duration = AudioPreprocessor.load_audio(input_audio_path, target_sr=16000)

        dest_path = settings.DATASETS_DIR / "synthetic" / f"{output_name}.wav"
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        augmented = np.copy(audio)

        if simulation_type == "articulatory_imprecision":
            # Low-pass filter simulating reduced vocal tract articulatory reach & high-frequency attenuation
            stft = librosa.stft(augmented, n_fft=512, hop_length=160)
            freqs = librosa.fft_frequencies(sr=sr, n_fft=512)
            # Attenuate formant frequencies above 2500Hz proportionally to severity
            mask = np.ones_like(freqs)
            cutoff_idx = np.where(freqs > 2200)[0]
            if len(cutoff_idx) > 0:
                mask[cutoff_idx] = np.maximum(0.2, 1.0 - (severity_factor * 0.7))
            stft_filtered = stft * mask[:, np.newaxis]
            augmented = librosa.istft(stft_filtered, hop_length=160, length=len(audio))

        elif simulation_type == "phonatory_instability":
            # Add glottal turbulence and micro-tremor to simulate vocal fold paresis
            noise = np.random.normal(0, 0.01 * severity_factor, size=len(augmented))
            # Amplitude modulation tremor (5Hz tremor common in cerebellar ataxia)
            t = np.linspace(0, duration, len(augmented))
            tremor = 1.0 + (0.15 * severity_factor * np.sin(2 * np.pi * 5.0 * t))
            augmented = (augmented * tremor) + noise

        elif simulation_type == "temporal_prolongation":
            # Time stretch slowing speech by factor proportional to severity
            stretch_rate = max(0.65, 1.0 - (severity_factor * 0.35))
            augmented = librosa.effects.time_stretch(augmented, rate=stretch_rate)

        # Normalize
        augmented = AudioPreprocessor.peak_normalize(augmented, target_peak=0.92)
        sf.write(str(dest_path), augmented, sr)
        new_duration = float(len(augmented) / sr)

        return {
            "augmented_file": str(dest_path),
            "filename": f"{output_name}.wav",
            "simulation_type": simulation_type,
            "severity_factor": severity_factor,
            "original_duration_sec": round(duration, 2),
            "augmented_duration_sec": round(new_duration, 2),
            "is_synthetic": True,
            "scientific_note": "Acoustic perturbation for ASR robustness research. Not a clinical diagnostic model."
        }
