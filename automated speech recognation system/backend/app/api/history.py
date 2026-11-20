from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from backend.app.core.security import get_current_user_optional
from backend.app.database.repositories import TranscriptionRepository

router = APIRouter(prefix="/history", tags=["History"])

@router.get("")
async def get_transcription_history(
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user_optional)
):
    user_id = current_user.get("user_id", "guest_demo")
    records = TranscriptionRepository.list_by_user(user_id=user_id, limit=limit, skip=skip)
    
    if search:
        s_term = search.lower().strip()
        records = [
            r for r in records
            if s_term in r.get("filename", "").lower()
            or s_term in r.get("original_transcript", "").lower()
            or s_term in r.get("edited_transcript", "").lower()
        ]
    
    total = TranscriptionRepository.count(user_id)
    return {
        "items": records,
        "total": total,
        "limit": limit,
        "skip": skip
    }

@router.get("/{transcription_id}")
async def get_history_item(transcription_id: str, current_user: dict = Depends(get_current_user_optional)):
    record = TranscriptionRepository.get_by_id(transcription_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transcription history record not found.")
    return record

@router.delete("/{transcription_id}")
async def delete_history_item(transcription_id: str, current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user.get("user_id", "guest_demo")
    success = TranscriptionRepository.delete(transcription_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transcription record not found or unauthorized.")
    return {"status": "success", "message": "Record removed from history."}
