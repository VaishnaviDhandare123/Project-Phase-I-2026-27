import shutil
import time
from typing import Any, Dict
from fastapi import APIRouter
import psutil
import torch
from backend.app.core.config import settings
from backend.app.database.connection import db_manager
from backend.ml.transcription.whisper_engine import whisper_engine

router = APIRouter(prefix="/system", tags=["System Telemetry"])

_start_time = time.time()

@router.get("/status")
async def get_system_status() -> Dict[str, Any]:
    uptime_sec = int(time.time() - _start_time)
    hours, remainder = divmod(uptime_sec, 3600)
    minutes, seconds = divmod(remainder, 60)

    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime": f"{hours:02d}:{minutes:02d}:{seconds:02d}",
        "database": {
            "mode": "MongoDB" if db_manager.is_mongo_active else "Embedded Local Document Store",
            "is_mongo_active": db_manager.is_mongo_active
        },
        "whisper": {
            "default_model": settings.DEFAULT_WHISPER_MODEL,
            "device": whisper_engine.device,
            "is_model_loaded": whisper_engine._model is not None,
            "cached_model_name": whisper_engine._current_model_name or "None"
        }
    }

@router.get("/resources")
async def get_system_resources() -> Dict[str, Any]:
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_cores = psutil.cpu_count(logical=True)

    vm = psutil.virtual_memory()
    total_ram_gb = round(vm.total / (1024**3), 2)
    used_ram_gb = round(vm.used / (1024**3), 2)
    avail_ram_gb = round(vm.available / (1024**3), 2)
    ram_percent = vm.percent

    disk = shutil.disk_usage(str(settings.BASE_DIR))
    total_disk_gb = round(disk.total / (1024**3), 1)
    free_disk_gb = round(disk.free / (1024**3), 1)
    disk_percent = round((disk.used / disk.total) * 100.0, 1)

    cuda_available = torch.cuda.is_available()
    gpu_info = {
        "available": cuda_available,
        "device_name": torch.cuda.get_device_name(0) if cuda_available else "AMD/Intel CPU",
        "vram_total_gb": round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2) if cuda_available else 0.0,
        "vram_allocated_gb": round(torch.cuda.memory_allocated(0) / (1024**3), 2) if cuda_available else 0.0
    }

    return {
        "cpu": {
            "percent": cpu_percent,
            "logical_cores": cpu_cores
        },
        "ram": {
            "total_gb": total_ram_gb,
            "used_gb": used_ram_gb,
            "available_gb": avail_ram_gb,
            "percent": ram_percent
        },
        "disk": {
            "total_gb": total_disk_gb,
            "free_gb": free_disk_gb,
            "percent": disk_percent
        },
        "gpu": gpu_info,
        "inference_device": whisper_engine.device,
        "timestamp": time.time()
    }
