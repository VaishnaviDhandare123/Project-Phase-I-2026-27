from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# User & Auth
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    created_at: str

# Transcription
class TranscriptUpdateRequest(BaseModel):
    edited_transcript: str

class TranscriptionResponse(BaseModel):
    transcription_id: str
    filename: str
    duration_sec: float
    processing_time_sec: float
    real_time_factor: float
    model_used: str
    language: str
    original_transcript: str
    edited_transcript: Optional[str] = None
    segments: List[Dict[str, Any]] = []
    word_count: int
    char_count: int
    sentence_count: int
    avg_words_per_sentence: float
    speaking_rate_wpm: float
    created_at: str

# Audio Preprocessing
class AudioPreprocessOptions(BaseModel):
    normalize: bool = True
    trim_silence: bool = False
    noise_reduction: bool = False
    target_sample_rate: int = 16000

# Evaluation
class EvaluationRequest(BaseModel):
    reference_text: str
    hypothesis_text: str
    apply_normalization: bool = True
    model_name: Optional[str] = "Whisper-tiny"
    sample_name: Optional[str] = "Evaluation Sample"
    dataset_type: Optional[str] = "Manual Comparison"

class BatchEvaluationRequest(BaseModel):
    samples: List[Dict[str, str]]
    model_name: Optional[str] = "Whisper-tiny"

# Dimensionality Reduction
class PCARequest(BaseModel):
    selected_features: Optional[List[str]] = None
    dataset_filter: Optional[str] = None

class TSNERequest(BaseModel):
    selected_features: Optional[List[str]] = None
    perplexity: float = 5.0
    random_state: int = 42

# Training
class TrainingStartRequest(BaseModel):
    experiment_name: str
    experiment_stage: str = "stage2_natural_dysarthric"
    base_model: str = "openai/whisper-tiny"
    dataset_id: Optional[str] = None
    epochs: int = 3
    learning_rate: float = 1e-5
    batch_size: int = 1

# Report Generation
class ReportGenerateRequest(BaseModel):
    title: str = "SpeechSense AI Research Laboratory Report"
    author: str = "SpeechSense AI Research Team"
    experiment_id: Optional[str] = None
    transcription_id: Optional[str] = None
    include_acoustic_analysis: bool = True
    include_visualizations: bool = True
    include_evaluations: bool = True
    export_format: str = "pdf"  # "pdf" or "docx"
