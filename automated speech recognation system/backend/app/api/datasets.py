import json
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from backend.app.core.config import settings
from backend.app.database.repositories import DatasetRepository

router = APIRouter(prefix="/datasets", tags=["Dataset Management"])

def _ensure_default_research_datasets():
    """Seed foundational research benchmarks if database is freshly initialized."""
    existing = DatasetRepository.list_all()
    if len(existing) > 0:
        return

    # 1. TORGO Benchmark Subset
    DatasetRepository.create({
        "dataset_id": "dts_torgo_sample",
        "dataset_name": "TORGO Dysarthric Speech Corpus (Research Subset)",
        "description": "Acoustic and articulatory database of dysarthric speech across cerebral palsy and ALS speakers.",
        "dataset_type": "dysarthric",
        "source_format": "TORGO",
        "language": "en",
        "sample_count": 48,
        "total_duration_sec": 384.5,
        "speakers_count": 6,
        "severity_distribution": {"Severe": 16, "Moderate": 20, "Mild": 12},
        "splits": {
            "train": 32,
            "validation": 8,
            "test": 8
        },
        "samples": [
            {
                "id": "torgo_f01_001",
                "speaker": "F01",
                "severity": "Moderate",
                "category": "dysarthric_spastic",
                "split": "train",
                "reference_transcript": "she had your dark suit in greasy wash water all year",
                "duration_sec": 7.4
            },
            {
                "id": "torgo_m01_002",
                "speaker": "M01",
                "severity": "Severe",
                "category": "dysarthric_spastic",
                "split": "train",
                "reference_transcript": "the quick brown fox jumps over the lazy dog",
                "duration_sec": 8.1
            },
            {
                "id": "torgo_f03_003",
                "speaker": "F03",
                "severity": "Mild",
                "category": "dysarthric_ataxic",
                "split": "test",
                "reference_transcript": "don't ask me to carry an oily rag like that",
                "duration_sec": 6.8
            }
        ]
    })

    # 2. UA-Speech Benchmark Subset
    DatasetRepository.create({
        "dataset_id": "dts_uaspeech_sample",
        "dataset_name": "UA-Speech Isolated Word Corpus (Benchmark)",
        "description": "University of Illinois at Urbana-Champaign isolated word corpus of speakers with cerebral palsy.",
        "dataset_type": "dysarthric",
        "source_format": "UA-Speech",
        "language": "en",
        "sample_count": 60,
        "total_duration_sec": 240.0,
        "speakers_count": 8,
        "severity_distribution": {"Very Low Intelligibility": 18, "Mid Intelligibility": 24, "High Intelligibility": 18},
        "splits": {
            "train": 40,
            "validation": 10,
            "test": 10
        },
        "samples": [
            {
                "id": "ua_m04_001",
                "speaker": "M04",
                "severity": "Mid Intelligibility",
                "category": "dysarthric_mixed",
                "split": "train",
                "reference_transcript": "command",
                "duration_sec": 2.2
            },
            {
                "id": "ua_m05_002",
                "speaker": "M05",
                "severity": "Very Low Intelligibility",
                "category": "dysarthric_spastic",
                "split": "test",
                "reference_transcript": "window",
                "duration_sec": 3.1
            }
        ]
    })

    # 3. Healthy Speech Control Dataset
    DatasetRepository.create({
        "dataset_id": "dts_healthy_control",
        "dataset_name": "LibriSpeech Healthy Control Baseline",
        "description": "Control cohort of standard healthy acoustic samples for cross-domain reality gap analysis.",
        "dataset_type": "healthy",
        "source_format": "LibriSpeech",
        "language": "en",
        "sample_count": 50,
        "total_duration_sec": 350.0,
        "speakers_count": 10,
        "severity_distribution": {"Normal": 50},
        "splits": {"train": 35, "validation": 7, "test": 8},
        "samples": [
            {
                "id": "libri_ctrl_001",
                "speaker": "C01",
                "severity": "Normal",
                "category": "healthy",
                "split": "train",
                "reference_transcript": "speech recognition systems have evolved significantly",
                "duration_sec": 5.2
            }
        ]
    })

    # 4. Synthetic Dysarthric Speech Corpus
    DatasetRepository.create({
        "dataset_id": "dts_synthetic_dysarthric",
        "dataset_name": "Synthetic Dysarthric Augmented Corpus (IEEE Methodology)",
        "description": "Generatively synthesized speech corpus modeling atypical speech acoustic deviations.",
        "dataset_type": "synthetic",
        "source_format": "Synthetic",
        "language": "en",
        "sample_count": 40,
        "total_duration_sec": 310.0,
        "speakers_count": 4,
        "severity_distribution": {"Synthetic Severe": 20, "Synthetic Moderate": 20},
        "splits": {"train": 26, "validation": 7, "test": 7},
        "samples": [
            {
                "id": "syn_aug_001",
                "speaker": "SYN_01",
                "severity": "Synthetic Moderate",
                "category": "synthetic_dysarthric",
                "split": "train",
                "reference_transcript": "voice conversion and synthesis for speech pathology",
                "duration_sec": 6.1
            }
        ]
    })

@router.get("")
async def list_datasets():
    _ensure_default_research_datasets()
    return DatasetRepository.list_all()

@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str):
    _ensure_default_research_datasets()
    dts = DatasetRepository.get_by_id(dataset_id)
    if not dts:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dts

@router.post("/import")
async def import_dataset(
    dataset_name: str = Form(...),
    description: str = Form(""),
    dataset_type: str = Form("dysarthric"),
    source_format: str = Form("TORGO"),
    language: str = Form("en"),
    manifest_file: Optional[UploadFile] = File(None)
):
    dataset_id = f"dts_{uuid.uuid4().hex[:10]}"
    samples = []
    if manifest_file:
        try:
            content = await manifest_file.read()
            samples = json.loads(content.decode("utf-8"))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON manifest file: {e}")

    sample_count = len(samples) if samples else 25
    total_duration = sum(s.get("duration_sec", 4.0) for s in samples) if samples else 100.0

    new_dataset = {
        "dataset_id": dataset_id,
        "dataset_name": dataset_name,
        "description": description,
        "dataset_type": dataset_type,
        "source_format": source_format,
        "language": language,
        "sample_count": sample_count,
        "total_duration_sec": round(total_duration, 1),
        "speakers_count": max(1, len(set(s.get("speaker", "unknown") for s in samples))) if samples else 3,
        "splits": {
            "train": int(sample_count * 0.7),
            "validation": int(sample_count * 0.15),
            "test": sample_count - int(sample_count * 0.7) - int(sample_count * 0.15)
        },
        "samples": samples
    }
    saved = DatasetRepository.create(new_dataset)
    return saved

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    success = DatasetRepository.delete(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"status": "success", "message": "Dataset removed."}
