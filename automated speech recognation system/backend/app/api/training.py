import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.models import TrainingStartRequest
from backend.ml.training.finetuner import ModelFineTuner
from backend.app.database.repositories import ExperimentRepository

router = APIRouter(prefix="/training", tags=["Model Training"])

@router.get("/hardware")
async def get_hardware_status():
    """Inspect system RAM, CPU cores, GPU capability and feasibility."""
    return ModelFineTuner.check_hardware_feasibility()

@router.post("/start")
async def start_training(payload: TrainingStartRequest):
    exp_id = f"exp_{uuid.uuid4().hex[:10]}"
    
    # Register experiment record in database
    exp_record = {
        "experiment_id": exp_id,
        "experiment_name": payload.experiment_name,
        "stage": payload.experiment_stage,
        "model_name": payload.base_model,
        "dataset_id": payload.dataset_id or "default_subset",
        "training_configuration": {
            "epochs": payload.epochs,
            "learning_rate": payload.learning_rate,
            "batch_size": payload.batch_size
        },
        "status": "running"
    }
    ExperimentRepository.create(exp_record)

    # Launch background fine-tuner
    res = ModelFineTuner.start_training_job(
        experiment_id=exp_id,
        experiment_name=payload.experiment_name,
        experiment_stage=payload.experiment_stage,
        base_model_name=payload.base_model,
        epochs=payload.epochs,
        learning_rate=payload.learning_rate,
        batch_size=payload.batch_size
    )
    return {"status": "started", "experiment_id": exp_id, "experiment": exp_record}

@router.get("/status/{experiment_id}")
async def get_training_status(experiment_id: str):
    state = ModelFineTuner.get_job_status(experiment_id)
    if not state:
        exp = ExperimentRepository.get_by_id(experiment_id)
        if exp:
            return exp
        raise HTTPException(status_code=404, detail="Training experiment not found.")
    
    # Sync with database
    if state["status"] in ["completed", "failed", "cancelled"]:
        ExperimentRepository.update(experiment_id, {
            "status": state["status"],
            "progress_pct": state.get("progress_pct", 100.0),
            "checkpoint_path": state.get("checkpoint_path"),
            "val_wer": state.get("val_wer"),
            "train_loss_history": state.get("train_loss_history", [])
        })

    return state

@router.post("/stop/{experiment_id}")
async def stop_training(experiment_id: str):
    success = ModelFineTuner.cancel_job(experiment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Active training job not found.")
    ExperimentRepository.update(experiment_id, {"status": "cancelled"})
    return {"status": "cancelled", "experiment_id": experiment_id}

@router.get("/checkpoints")
async def list_checkpoints():
    checkpoints = ModelFineTuner.list_saved_checkpoints()
    # Also include baseline Whisper model as standard reference
    checkpoints.insert(0, {
        "checkpoint_id": "openai/whisper-tiny",
        "path": "openai/whisper-tiny",
        "model_name": "Whisper Tiny (Pretrained Baseline)",
        "base_model": "openai/whisper-tiny",
        "stage": "stage1_baseline",
        "val_wer": 0.587,
        "created_at": "Official Pretrained Release"
    })
    return checkpoints
