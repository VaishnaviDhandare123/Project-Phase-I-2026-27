import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor
from backend.app.core.config import settings

logger = logging.getLogger("speechsense.whisper")

class WhisperTranscriptionEngine:
    _instance = None
    _model = None
    _processor = None
    _current_model_name = None

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initialized Whisper Engine on compute device: {self.device}")

    @classmethod
    def get_instance(cls) -> "WhisperTranscriptionEngine":
        if cls._instance is None:
            cls._instance = WhisperTranscriptionEngine()
        return cls._instance

    def load_model(self, model_name: str = "openai/whisper-tiny"):
        """Lazy loader for Whisper model and processor with thread-safe caching."""
        if self._model is not None and self._current_model_name == model_name:
            return self._model, self._processor

        logger.info(f"Loading Whisper model '{model_name}' on device '{self.device}'...")
        try:
            # First attempt local files only
            processor = WhisperProcessor.from_pretrained(model_name, local_files_only=True)
            model = WhisperForConditionalGeneration.from_pretrained(model_name, local_files_only=True)
        except Exception as e:
            logger.info(f"Local cache hit failed ({e}). Loading with online download fallback...")
            processor = WhisperProcessor.from_pretrained(model_name)
            model = WhisperForConditionalGeneration.from_pretrained(model_name)

        model.to(self.device)
        model.eval()

        self._processor = processor
        self._model = model
        self._current_model_name = model_name
        logger.info(f"Whisper model '{model_name}' successfully loaded in memory.")
        return self._model, self._processor

    def transcribe_audio_array(
        self,
        audio: np.ndarray,
        sr: int = 16000,
        model_name: str = "openai/whisper-tiny",
        language: Optional[str] = None,
        task: str = "transcribe",
        temperature: float = 0.0,
        beam_size: int = 1
    ) -> Dict[str, Any]:
        """
        Transcribe arbitrary-length audio array using chunked inference.
        Audio must be 16kHz float32.
        """
        start_time = time.time()
        model, processor = self.load_model(model_name)

        duration = float(len(audio) / sr)
        chunk_length_sec = 30.0
        chunk_samples = int(chunk_length_sec * sr)
        overlap_sec = 1.0
        overlap_samples = int(overlap_sec * sr)
        step_samples = chunk_samples - overlap_samples

        segments: List[Dict[str, Any]] = []
        full_transcript_parts: List[str] = []

        total_samples = len(audio)
        start_sample = 0
        chunk_idx = 0

        # Language and generation config
        forced_decoder_ids = None
        if language and language != "auto":
            try:
                forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task=task)
            except Exception as e:
                logger.warning(f"Could not build forced_decoder_ids for {language}: {e}")

        while start_sample < total_samples:
            end_sample = min(start_sample + chunk_samples, total_samples)
            chunk = audio[start_sample:end_sample]

            # Whisper requires 30 seconds (pad or truncate)
            inputs = processor(
                chunk,
                sampling_rate=sr,
                return_tensors="pt"
            )
            input_features = inputs.input_features.to(self.device)

            gen_kwargs = {
                "max_new_tokens": 128,
            }
            if forced_decoder_ids:
                gen_kwargs["forced_decoder_ids"] = forced_decoder_ids
            if temperature > 0.0:
                gen_kwargs["do_sample"] = True
                gen_kwargs["temperature"] = float(temperature)
            if beam_size > 1:
                gen_kwargs["num_beams"] = int(beam_size)

            with torch.no_grad():
                predicted_ids = model.generate(input_features, **gen_kwargs)

            chunk_text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()

            seg_start = round(start_sample / sr, 2)
            seg_end = round(end_sample / sr, 2)

            if chunk_text:
                full_transcript_parts.append(chunk_text)
                segments.append({
                    "id": chunk_idx,
                    "start": seg_start,
                    "end": seg_end,
                    "text": chunk_text
                })

            chunk_idx += 1
            if end_sample >= total_samples:
                break
            start_sample += step_samples

        elapsed = time.time() - start_time
        full_text = " ".join(full_transcript_parts).strip()
        rtf = round(duration / elapsed, 2) if elapsed > 0 else 1.0

        # Calculate word and sentence metrics
        words = full_text.split()
        word_count = len(words)
        char_count = len(full_text)
        sentences = [s.strip() for s in full_text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
        avg_wps = round(word_count / max(1, len(sentences)), 1)
        speaking_rate_wpm = round((word_count / max(0.1, duration)) * 60.0, 1)

        return {
            "transcript": full_text,
            "segments": segments,
            "duration_sec": round(duration, 2),
            "processing_time_sec": round(elapsed, 2),
            "real_time_factor": rtf,
            "model_used": model_name,
            "device": self.device,
            "language": language or "en",
            "task": task,
            "word_count": word_count,
            "char_count": char_count,
            "sentence_count": len(sentences),
            "avg_words_per_sentence": avg_wps,
            "speaking_rate_wpm": speaking_rate_wpm
        }

    def transcribe_file(
        self,
        file_path: Path | str,
        model_name: str = "openai/whisper-tiny",
        language: Optional[str] = None,
        task: str = "transcribe",
        temperature: float = 0.0,
        beam_size: int = 1
    ) -> Dict[str, Any]:
        """Convenience method to load and transcribe a file from disk."""
        from backend.ml.preprocessing.pipeline import AudioPreprocessor
        audio, sr, _ = AudioPreprocessor.load_audio(file_path, target_sr=16000)
        return self.transcribe_audio_array(
            audio=audio,
            sr=sr,
            model_name=model_name,
            language=language,
            task=task,
            temperature=temperature,
            beam_size=beam_size
        )

whisper_engine = WhisperTranscriptionEngine.get_instance()
