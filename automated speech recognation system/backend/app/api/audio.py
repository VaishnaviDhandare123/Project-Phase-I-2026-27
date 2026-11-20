import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from fastapi.responses import FileResponse
from backend.app.core.config import settings
from backend.ml.preprocessing.pipeline import AudioPreprocessor
from backend.ml.acoustic_analysis.extractor import AcousticFeatureExtractor
from backend.app.database.repositories import TranscriptionRepository, AcousticRepository

router = APIRouter(prefix="/audio", tags=["Audio Processing"])

@router.post("/preprocess")
async def preprocess_audio(
    file: UploadFile = File(...),
    normalize: bool = Form(True),
    trim_silence: bool = Form(False),
    noise_reduction: bool = Form(False),
    target_sample_rate: int = Form(16000)
):
    ext = Path(file.filename or "audio.wav").suffix.lower()
    file_id = f"prep_{uuid.uuid4().hex[:12]}"
    raw_path = settings.AUDIO_DIR / f"{file_id}_raw{ext}"
    proc_path = settings.AUDIO_DIR / f"{file_id}_proc.wav"

    contents = await file.read()
    with open(raw_path, "wb") as f:
        f.write(contents)

    res = AudioPreprocessor.process_pipeline(
        input_path=raw_path,
        output_path=proc_path,
        normalize=normalize,
        trim_silence_flag=trim_silence,
        noise_reduction_flag=noise_reduction,
        target_sr=target_sample_rate
    )
    res["audio_id"] = file_id
    res["processed_file_url"] = f"/api/audio/{file_id}/file"
    return res

@router.get("/{audio_id}/file")
async def get_audio_file(audio_id: str):
    # Search for audio file in storage
    candidates = list(settings.AUDIO_DIR.glob(f"{audio_id}*"))
    if not candidates:
        raise HTTPException(status_code=404, detail="Audio file not found")
    # Prefer .wav if present
    wav_file = next((f for f in candidates if f.suffix == ".wav"), candidates[0])
    return FileResponse(wav_file, media_type="audio/wav")

@router.get("/{audio_id}/features")
async def get_audio_features(audio_id: str):
    # Check cache in acoustic repository first
    cached = AcousticRepository.get_by_audio_id(audio_id)
    if cached:
        return cached

    candidates = list(settings.AUDIO_DIR.glob(f"{audio_id}*"))
    if not candidates:
        raise HTTPException(status_code=404, detail="Audio file not found")
    target_file = candidates[0]

    profile = AcousticFeatureExtractor.extract_features(target_file, sr=16000)
    profile["audio_id"] = audio_id
    profile["filename"] = target_file.name
    AcousticRepository.create(profile)
    return profile
