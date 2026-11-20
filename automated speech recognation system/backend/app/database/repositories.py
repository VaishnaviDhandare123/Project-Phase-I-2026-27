import datetime
import uuid
from typing import Any, Dict, List, Optional
from backend.app.database.connection import db_manager

class UserRepository:
    @staticmethod
    def get_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("users")
        return col.find_one({"user_id": user_id})

    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("users")
        return col.find_one({"email": email.lower().strip()})

    @staticmethod
    def create(name: str, email: str, password_hash: str) -> Dict[str, Any]:
        col = db_manager.get_collection("users")
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "name": name.strip(),
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "role": "researcher",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        col.insert_one(user_doc)
        return user_doc


class TranscriptionRepository:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        col = db_manager.get_collection("transcriptions")
        if "transcription_id" not in data:
            data["transcription_id"] = f"trn_{uuid.uuid4().hex[:12]}"
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        col.insert_one(data)
        return data

    @staticmethod
    def get_by_id(transcription_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("transcriptions")
        return col.find_one({"transcription_id": transcription_id})

    @staticmethod
    def list_by_user(user_id: str, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        col = db_manager.get_collection("transcriptions")
        query = {"user_id": user_id} if user_id != "guest_demo" else {}
        return col.find(query=query, sort=[("created_at", -1)], limit=limit, skip=skip)

    @staticmethod
    def update(transcription_id: str, updates: Dict[str, Any]) -> bool:
        col = db_manager.get_collection("transcriptions")
        return col.update_one({"transcription_id": transcription_id}, {"$set": updates})

    @staticmethod
    def delete(transcription_id: str, user_id: str) -> bool:
        col = db_manager.get_collection("transcriptions")
        query = {"transcription_id": transcription_id}
        if user_id != "guest_demo":
            query["user_id"] = user_id
        return col.delete_one(query)

    @staticmethod
    def count(user_id: Optional[str] = None) -> int:
        col = db_manager.get_collection("transcriptions")
        query = {"user_id": user_id} if user_id and user_id != "guest_demo" else {}
        return col.count_documents(query)


class DatasetRepository:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        col = db_manager.get_collection("datasets")
        if "dataset_id" not in data:
            data["dataset_id"] = f"dts_{uuid.uuid4().hex[:12]}"
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        col.insert_one(data)
        return data

    @staticmethod
    def get_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("datasets")
        return col.find_one({"dataset_id": dataset_id})

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        col = db_manager.get_collection("datasets")
        return col.find(sort=[("created_at", -1)])

    @staticmethod
    def delete(dataset_id: str) -> bool:
        col = db_manager.get_collection("datasets")
        return col.delete_one({"dataset_id": dataset_id})


class ExperimentRepository:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        col = db_manager.get_collection("experiments")
        if "experiment_id" not in data:
            data["experiment_id"] = f"exp_{uuid.uuid4().hex[:12]}"
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        col.insert_one(data)
        return data

    @staticmethod
    def get_by_id(experiment_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("experiments")
        return col.find_one({"experiment_id": experiment_id})

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        col = db_manager.get_collection("experiments")
        return col.find(sort=[("created_at", -1)])

    @staticmethod
    def update(experiment_id: str, updates: Dict[str, Any]) -> bool:
        col = db_manager.get_collection("experiments")
        return col.update_one({"experiment_id": experiment_id}, {"$set": updates})

    @staticmethod
    def delete(experiment_id: str) -> bool:
        col = db_manager.get_collection("experiments")
        return col.delete_one({"experiment_id": experiment_id})


class EvaluationRepository:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        col = db_manager.get_collection("evaluations")
        if "evaluation_id" not in data:
            data["evaluation_id"] = f"evl_{uuid.uuid4().hex[:12]}"
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        col.insert_one(data)
        return data

    @staticmethod
    def get_by_id(evaluation_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("evaluations")
        return col.find_one({"evaluation_id": evaluation_id})

    @staticmethod
    def list_all(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        col = db_manager.get_collection("evaluations")
        query = {"user_id": user_id} if user_id and user_id != "guest_demo" else {}
        return col.find(query=query, sort=[("created_at", -1)])

    @staticmethod
    def delete(evaluation_id: str) -> bool:
        col = db_manager.get_collection("evaluations")
        return col.delete_one({"evaluation_id": evaluation_id})


class AcousticRepository:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        col = db_manager.get_collection("acoustic_profiles")
        if "profile_id" not in data:
            data["profile_id"] = f"aco_{uuid.uuid4().hex[:12]}"
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        col.insert_one(data)
        return data

    @staticmethod
    def get_by_audio_id(audio_id: str) -> Optional[Dict[str, Any]]:
        col = db_manager.get_collection("acoustic_profiles")
        return col.find_one({"audio_id": audio_id})

    @staticmethod
    def list_all(limit: int = 100) -> List[Dict[str, Any]]:
        col = db_manager.get_collection("acoustic_profiles")
        return col.find(limit=limit)
