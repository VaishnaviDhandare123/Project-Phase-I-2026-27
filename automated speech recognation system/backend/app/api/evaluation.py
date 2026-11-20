import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas.models import EvaluationRequest, BatchEvaluationRequest
from backend.ml.evaluation.metrics import EvaluationMetricsEngine
from backend.app.database.repositories import EvaluationRepository
from backend.app.core.security import get_current_user_optional

router = APIRouter(prefix="/evaluation", tags=["Evaluation & Benchmarks"])

@router.post("/run")
async def evaluate_single_sample(
    payload: EvaluationRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    metrics = EvaluationMetricsEngine.compute_evaluation(
        reference=payload.reference_text,
        hypothesis=payload.hypothesis_text,
        apply_normalization=payload.apply_normalization
    )

    eval_id = f"evl_{uuid.uuid4().hex[:10]}"
    record = {
        "evaluation_id": eval_id,
        "user_id": current_user.get("user_id", "guest_demo"),
        "model_name": payload.model_name or "Whisper-tiny",
        "sample_name": payload.sample_name or "Custom Evaluation",
        "dataset_type": payload.dataset_type or "Interactive Comparison",
        "reference_text": payload.reference_text,
        "hypothesis_text": payload.hypothesis_text,
        **metrics
    }
    saved = EvaluationRepository.create(record)
    return saved

@router.post("/batch")
async def evaluate_batch_samples(
    payload: BatchEvaluationRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    results = EvaluationMetricsEngine.evaluate_batch(payload.samples)
    results["model_name"] = payload.model_name
    return results

@router.get("/results")
async def list_evaluation_results(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user.get("user_id", "guest_demo")
    return EvaluationRepository.list_all(user_id=user_id)

@router.get("/{evaluation_id}")
async def get_evaluation(evaluation_id: str):
    res = EvaluationRepository.get_by_id(evaluation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Evaluation record not found.")
    return res

@router.delete("/{evaluation_id}")
async def delete_evaluation(evaluation_id: str):
    success = EvaluationRepository.delete(evaluation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evaluation record not found.")
    return {"status": "success", "message": "Evaluation result removed."}
