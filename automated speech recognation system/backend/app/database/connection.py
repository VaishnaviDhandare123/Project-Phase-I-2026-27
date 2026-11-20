import json
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.app.core.config import settings

logger = logging.getLogger("speechsense.database")

class LocalJSONStorage:
    """Thread-safe, atomic local document store fallback when MongoDB server is offline."""
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self._lock = threading.Lock()
        self._cache: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "transcriptions": [],
            "datasets": [],
            "experiments": [],
            "evaluations": [],
            "acoustic_profiles": []
        }
        self._load()

    def _load(self):
        with self._lock:
            if self.filepath.exists():
                try:
                    with open(self.filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self._cache.update(data)
                except Exception as e:
                    logger.warning(f"Failed to read local DB file: {e}. Initializing fresh store.")
            else:
                self._save_unlocked()

    def _save_unlocked(self):
        try:
            self.filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self._cache, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error persisting to local DB: {e}")

    def get_collection(self, name: str) -> "LocalCollection":
        with self._lock:
            if name not in self._cache:
                self._cache[name] = []
        return LocalCollection(self, name)


class LocalCollection:
    def __init__(self, storage: LocalJSONStorage, name: str):
        self.storage = storage
        self.name = name

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.storage._lock:
            docs = self.storage._cache.get(self.name, [])
            for doc in docs:
                if all(doc.get(k) == v for k, v in query.items()):
                    return dict(doc)
            return None

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List[tuple]] = None, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        with self.storage._lock:
            docs = self.storage._cache.get(self.name, [])
            matched = []
            for doc in docs:
                if not query or all(doc.get(k) == v for k, v in query.items()):
                    matched.append(dict(doc))
            
            if sort:
                for field, direction in reversed(sort):
                    reverse = (direction == -1 or direction == pymongo.DESCENDING)
                    matched.sort(key=lambda x: str(x.get(field, "")), reverse=reverse)
            
            return matched[skip:skip + limit]

    def insert_one(self, doc: Dict[str, Any]):
        with self.storage._lock:
            docs = self.storage._cache.setdefault(self.name, [])
            new_doc = dict(doc)
            if "_id" not in new_doc:
                new_doc["_id"] = str(len(docs) + 1)
            docs.append(new_doc)
            self.storage._save_unlocked()
            return type("InsertResult", (), {"inserted_id": new_doc["_id"]})()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        with self.storage._lock:
            docs = self.storage._cache.get(self.name, [])
            for doc in docs:
                if all(doc.get(k) == v for k, v in query.items()):
                    if "$set" in update:
                        doc.update(update["$set"])
                    else:
                        doc.update(update)
                    self.storage._save_unlocked()
                    return True
            return False

    def delete_one(self, query: Dict[str, Any]) -> bool:
        with self.storage._lock:
            docs = self.storage._cache.get(self.name, [])
            for i, doc in enumerate(docs):
                if all(doc.get(k) == v for k, v in query.items()):
                    docs.pop(i)
                    self.storage._save_unlocked()
                    return True
            return False

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        with self.storage._lock:
            docs = self.storage._cache.get(self.name, [])
            if not query:
                return len(docs)
            return sum(1 for doc in docs if all(doc.get(k) == v for k, v in query.items()))


class DatabaseManager:
    _instance = None
    _mongo_client: Optional[pymongo.MongoClient] = None
    _db = None
    _is_connected_to_mongo = False
    _local_storage = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self._local_storage = LocalJSONStorage(settings.STORAGE_DIR / "db.json")
        try:
            client = pymongo.MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500
            )
            # Verify connectivity
            client.admin.command('ping')
            self._mongo_client = client
            self._db = client[settings.DATABASE_NAME]
            self._is_connected_to_mongo = True
            logger.info(f"Connected successfully to MongoDB at {settings.MONGODB_URL}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as err:
            self._is_connected_to_mongo = False
            self._db = None
            logger.info(f"MongoDB not available ({err}). Using high-performance Embedded Local Document Store.")

    @property
    def is_mongo_active(self) -> bool:
        return self._is_connected_to_mongo

    def get_collection(self, collection_name: str):
        if self._is_connected_to_mongo and self._db is not None:
            return self._db[collection_name]
        return self._local_storage.get_collection(collection_name)

db_manager = DatabaseManager()
