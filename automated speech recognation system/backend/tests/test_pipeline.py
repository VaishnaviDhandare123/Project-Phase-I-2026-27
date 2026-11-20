from pathlib import Path
import pytest
import numpy as np
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.database.repositories import UserRepository, TranscriptionRepository, DatasetRepository, EvaluationRepository
from backend.ml.preprocessing.pipeline import AudioPreprocessor
from backend.ml.acoustic_analysis.extractor import AcousticFeatureExtractor
from backend.ml.evaluation.metrics import EvaluationMetricsEngine
from backend.ml.visualization.pca_engine import PCAEngine
from backend.ml.visualization.tsne_engine import TSNEEngine
from backend.ml.transcription.whisper_engine import whisper_engine
from backend.app.api.reports import _generate_pdf_report, _generate_docx_report
from backend.app.core.config import settings

def test_auth_security():
    pw = "SecretResearcherPass123"
    h = hash_password(pw)
    assert verify_password(pw, h) is True
    assert verify_password("WrongPassword", h) is False

    token = create_access_token("usr_test_123")
    decoded = decode_access_token(token)
    assert decoded == "usr_test_123"

def test_database_repositories():
    user = UserRepository.create(name="Dr. Alan Turing", email="alan@turing.org", password_hash="hash123")
    assert user["name"] == "Dr. Alan Turing"
    fetched = UserRepository.get_by_id(user["user_id"])
    assert fetched is not None
    assert fetched["email"] == "alan@turing.org"

    trans = TranscriptionRepository.create({
        "user_id": user["user_id"],
        "filename": "lecture.wav",
        "original_transcript": "speech recognition test",
        "duration_sec": 3.5,
        "processing_time_sec": 0.8
    })
    assert trans["transcription_id"] is not None
    count = TranscriptionRepository.count(user["user_id"])
    assert count >= 1

def test_audio_preprocessing():
    # Generate 2 seconds of test audio
    sr = 16000
    t = np.linspace(0, 2.0, sr * 2)
    tone = 0.5 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
    
    norm = AudioPreprocessor.peak_normalize(tone, target_peak=0.95)
    assert np.isclose(np.max(np.abs(norm)), 0.95, atol=1e-2)

    noise_info = AudioPreprocessor.estimate_noise_level(norm, sr)
    assert "snr_db" in noise_info

def test_acoustic_feature_extraction():
    test_audio = settings.AUDIO_DIR / "sample_lecture_health.wav"
    assert test_audio.exists()
    profile = AcousticFeatureExtractor.extract_features(test_audio, sr=16000)
    feats = profile["features"]
    
    assert "f0_mean_hz" in feats
    assert "hnr_db" in feats
    assert "local_jitter_pct" in feats
    assert "local_shimmer_db" in feats
    assert "formant_f1_hz" in feats
    assert "formant_f2_hz" in feats
    assert "speech_rate_syllables_per_sec" in feats
    assert len(profile["pitch_contour"]) > 0

def test_evaluation_metrics_jiwer():
    ref = "the quick brown fox jumps over the lazy dog"
    hyp = "the quick brown fox jumps over a lazy dog"
    res = EvaluationMetricsEngine.compute_evaluation(ref, hyp)
    
    assert res["substitutions"] == 1
    assert res["deletions"] == 0
    assert res["insertions"] == 0
    assert res["reference_words"] == 9
    assert np.isclose(res["wer"], 1.0 / 9.0, atol=1e-3)
    assert res["cer"] >= 0.0

def test_pca_and_tsne():
    dummy_samples = [
        {"id": f"s_{i}", "category": "healthy" if i < 3 else "dysarthric", "features": {"f0_mean_hz": 150 + i*10, "hnr_db": 20 - i, "local_jitter_pct": 0.5 + i*0.2, "speech_rate_syllables_per_sec": 4.0 - i*0.2}}
        for i in range(6)
    ]
    pca_res = PCAEngine.fit_transform(dummy_samples, selected_features=["f0_mean_hz", "hnr_db", "local_jitter_pct", "speech_rate_syllables_per_sec"])
    assert "points" in pca_res
    assert len(pca_res["points"]) == 6
    assert len(pca_res["explained_variance_ratio"]) == 2

    tsne_res = TSNEEngine.fit_transform(dummy_samples, perplexity=2.0)
    assert "points" in tsne_res
    assert len(tsne_res["points"]) == 6

def test_whisper_transcription():
    test_audio = settings.AUDIO_DIR / "sample_lecture_health.wav"
    res = whisper_engine.transcribe_file(test_audio, model_name="openai/whisper-tiny")
    assert "transcript" in res
    assert "processing_time_sec" in res
    assert "duration_sec" in res
    assert res["duration_sec"] > 0

def test_report_generation(tmp_path):
    pdf_path = tmp_path / "test_report.pdf"
    docx_path = tmp_path / "test_report.docx"

    _generate_pdf_report(
        file_path=pdf_path,
        title="Test Research Report",
        author="Tester",
        timestamp="2026-11-02 12:00:00",
        transcription={"filename": "test.wav", "duration_sec": 2.0, "processing_time_sec": 0.5, "real_time_factor": 4.0, "edited_transcript": "test transcript"},
        evaluations=[{"sample_name": "Sample1", "model_name": "Whisper-tiny", "wer_percentage": 12.5, "cer_percentage": 3.2, "substitutions": 1, "deletions": 0, "insertions": 0}],
        experiments=[]
    )
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 500

    _generate_docx_report(
        file_path=docx_path,
        title="Test Research Report",
        author="Tester",
        timestamp="2026-11-02 12:00:00",
        transcription={"filename": "test.wav", "duration_sec": 2.0, "processing_time_sec": 0.5, "real_time_factor": 4.0, "edited_transcript": "test transcript"},
        evaluations=[],
        experiments=[]
    )
    assert docx_path.exists()
    assert docx_path.stat().st_size > 500
