import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Depends
from backend.app.core.config import settings
from backend.app.core.security import get_current_user_optional
from backend.app.database.repositories import TranscriptionRepository
from backend.app.schemas.models import TranscriptUpdateRequest
from backend.ml.preprocessing.pipeline import AudioPreprocessor
from backend.ml.transcription.whisper_engine import whisper_engine
from backend.ml.transcription.live_stream import LiveStreamTranscriber

router = APIRouter(prefix="/transcribe", tags=["Transcription"])

@router.post("/upload")
async def transcribe_upload(
    file: UploadFile = File(...),
    model_name: str = Form("openai/whisper-tiny"),
    language: Optional[str] = Form(None),
    task: str = Form("transcribe"),
    normalize: bool = Form(True),
    trim_silence: bool = Form(False),
    noise_reduction: bool = Form(False),
    current_user: dict = Depends(get_current_user_optional)
):
    # Validate file extension
    ext = Path(file.filename or "audio.wav").suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{ext}'. Allowed formats: {settings.ALLOWED_EXTENSIONS}"
        )

    # Save uploaded file
    file_id = f"audio_{uuid.uuid4().hex[:12]}"
    raw_path = settings.AUDIO_DIR / f"{file_id}{ext}"
    processed_path = settings.AUDIO_DIR / f"{file_id}_proc.wav"

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded audio file is empty.")

    with open(raw_path, "wb") as f:
        f.write(contents)

    try:
        # Preprocess audio
        prep_result = AudioPreprocessor.process_pipeline(
            input_path=raw_path,
            output_path=processed_path,
            normalize=normalize,
            trim_silence_flag=trim_silence,
            noise_reduction_flag=noise_reduction,
            target_sr=16000
        )

        # Transcribe with Whisper
        transcription_res = whisper_engine.transcribe_file(
            file_path=processed_path,
            model_name=model_name,
            language=language if language and language != "auto" else None,
            task=task
        )

        # Persist record
        transcription_id = f"trn_{uuid.uuid4().hex[:12]}"
        record = {
            "transcription_id": transcription_id,
            "user_id": current_user.get("user_id", "guest_demo"),
            "filename": file.filename or f"{file_id}.wav",
            "audio_path": str(processed_path),
            "raw_audio_path": str(raw_path),
            "original_transcript": transcription_res["transcript"],
            "edited_transcript": transcription_res["transcript"],
            "duration_sec": transcription_res["duration_sec"],
            "processing_time_sec": transcription_res["processing_time_sec"],
            "real_time_factor": transcription_res["real_time_factor"],
            "model_used": transcription_res["model_used"],
            "language": transcription_res["language"],
            "task": transcription_res["task"],
            "segments": transcription_res["segments"],
            "word_count": transcription_res["word_count"],
            "char_count": transcription_res["char_count"],
            "sentence_count": transcription_res["sentence_count"],
            "avg_words_per_sentence": transcription_res["avg_words_per_sentence"],
            "speaking_rate_wpm": transcription_res["speaking_rate_wpm"],
            "preprocessing": prep_result,
            "waveform_preview": prep_result["waveform_preview"]
        }
        saved = TranscriptionRepository.create(record)
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error during transcription: {str(e)}"
        )

@router.post("/recording")
async def transcribe_recording(
    file: UploadFile = File(...),
    model_name: str = Form("openai/whisper-tiny"),
    language: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user_optional)
):
    return await transcribe_upload(
        file=file,
        model_name=model_name,
        language=language,
        task="transcribe",
        normalize=True,
        trim_silence=False,
        noise_reduction=False,
        current_user=current_user
    )

@router.post("/live/chunk")
async def transcribe_live_chunk(
    file: UploadFile = File(...),
    model_name: str = Form("openai/whisper-tiny"),
    session_id: str = Form("live_session"),
    language: Optional[str] = Form(None)
):
    contents = await file.read()
    if not contents:
        return {"chunk_transcript": "", "is_empty": True}
    res = LiveStreamTranscriber.process_chunk_bytes(
        audio_bytes=contents,
        session_id=session_id,
        model_name=model_name,
        language=language
    )
    return res

@router.get("/{transcription_id}")
async def get_transcription(transcription_id: str, current_user: dict = Depends(get_current_user_optional)):
    record = TranscriptionRepository.get_by_id(transcription_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcription not found.")
    return record

@router.put("/{transcription_id}")
async def update_transcript(
    transcription_id: str,
    payload: TranscriptUpdateRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    record = TranscriptionRepository.get_by_id(transcription_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcription not found.")
    
    words = payload.edited_transcript.split()
    updates = {
        "edited_transcript": payload.edited_transcript,
        "word_count": len(words),
        "char_count": len(payload.edited_transcript)
    }
    TranscriptionRepository.update(transcription_id, updates)
    record.update(updates)
    return record

@router.delete("/{transcription_id}")
async def delete_transcription(transcription_id: str, current_user: dict = Depends(get_current_user_optional)):
    success = TranscriptionRepository.delete(transcription_id, current_user.get("user_id", "guest_demo"))
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcription not found.")
    return {"status": "success", "message": "Transcription deleted successfully."}
