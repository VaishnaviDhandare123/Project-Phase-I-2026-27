import io
import time
from typing import Any, Dict, Optional
import numpy as np
import soundfile as sf
import librosa
from backend.ml.transcription.whisper_engine import whisper_engine

class LiveStreamTranscriber:
    """Manages near-real-time sliding-window chunk transcription for microphone streams."""

    @staticmethod
    def process_chunk_bytes(
        audio_bytes: bytes,
        session_id: str,
        model_name: str = "openai/whisper-tiny",
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a single live audio chunk (e.g. WebM/WAV from browser MediaRecorder).
        """
        start_time = time.time()
        try:
            # Read from memory buffer
            audio_io = io.BytesIO(audio_bytes)
            audio, sr = sf.read(audio_io, dtype="float32")
            if audio.ndim > 1:
                audio = np.mean(audio, axis=1)
            if sr != 16000:
                audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
                sr = 16000
        except Exception:
            # Fallback if container format requires librosa
            audio_io.seek(0)
            audio, sr = librosa.load(audio_io, sr=16000, mono=True)

        duration = float(len(audio) / sr)
        if duration < 0.2:
            return {
                "chunk_transcript": "",
                "duration_sec": round(duration, 2),
                "is_empty": True,
                "latency_sec": round(time.time() - start_time, 3)
            }

        # Transcribe chunk
        res = whisper_engine.transcribe_audio_array(
            audio=audio,
            sr=sr,
            model_name=model_name,
            language=language or "en",
            task="transcribe",
            temperature=0.0
        )

        latency = time.time() - start_time
        return {
            "chunk_transcript": res["transcript"],
            "duration_sec": round(duration, 2),
            "latency_sec": round(latency, 3),
            "is_empty": len(res["transcript"].strip()) == 0
        }
