import pandas as pd
import os
import threading
from app.config import settings
from app.logger import logger

from collections import OrderedDict

class DataManager:
    """
    Thread-safe Singleton for in-memory DataFrame caching using LRU strategy.
    Reduces redundant disk I/O across pipeline steps.
    """
    _instance = None
    _lock = threading.Lock()
    _cache = OrderedDict() # LRU Cache: {cache_key: pd.DataFrame}
    _max_size = 3 # Tightened from 6 to 3 to prevent RAM exhaustion on host machines

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DataManager, cls).__new__(cls)
            return cls._instance

    def get_dataframe(self, dataset_id: str, df_type: str = "train") -> pd.DataFrame:
        """
        Retrieves a DataFrame from cache or disk.
        types: 'train', 'test', 'clean', 'raw'
        """
        cache_key = f"{dataset_id}_{df_type}"
        
        with self._lock:
            if cache_key in self._cache:
                logger.info(f"DataManager: Cache HIT for {cache_key}")
                # Move to end (most recently used)
                self._cache.move_to_end(cache_key)
                return self._cache[cache_key]

        # Cache Miss: Load from Disk
        logger.info(f"DataManager: Cache MISS for {cache_key}, loading from disk...")
        
        # Priority: .parquet (Fast) -> .csv (Standard) -> .xlsx (Office)
        paths_to_check = [
            os.path.join(settings.DATASET_DIR, f"{dataset_id}_{df_type}.parquet"),
            os.path.join(settings.DATASET_DIR, f"{dataset_id}_{df_type}.csv"),
            os.path.join(settings.DATASET_DIR, f"{dataset_id}_{df_type}.xlsx")
        ]
        
        # Special case: raw uploaded file might not have the type suffix
        if df_type == "raw":
             paths_to_check.append(os.path.join(settings.DATASET_DIR, f"{dataset_id}.csv"))
             paths_to_check.append(os.path.join(settings.DATASET_DIR, f"{dataset_id}.xlsx"))

        path = None
        for p in paths_to_check:
            if os.path.exists(p):
                path = p
                break
        
        if not path:
             # Fallback for 'clean' if 'train' exists? 
             if df_type == "clean":
                 train_p = os.path.join(settings.DATASET_DIR, f"{dataset_id}_train.parquet")
                 if not os.path.exists(train_p):
                     train_p = os.path.join(settings.DATASET_DIR, f"{dataset_id}_train.csv")
                 path = train_p if os.path.exists(train_p) else None
            
             if not path:
                  logger.warning(f"DataManager: No data found for {dataset_id} ({df_type})")
                  return None

        try:
            if path.endswith('.parquet'):
                df = pd.read_parquet(path)
            elif path.endswith('.csv'):
                df = pd.read_csv(path, encoding_errors='replace')
            elif path.endswith('.xlsx'):
                df = pd.read_excel(path)
            else:
                # Default fallback
                df = pd.read_csv(path, encoding_errors='replace')
            
            with self._lock:
                # LRU Eviction: remove oldest (first item in OrderedDict)
                if len(self._cache) >= self._max_size:
                    oldest_key, _ = self._cache.popitem(last=False)
                    logger.info(f"DataManager: Evicting {oldest_key} (LRU)")
                
                self._cache[cache_key] = df
            return df
        except Exception as e:
            logger.error(f"DataManager: Failed to load {path}: {e}")
            return None

    def update_cache(self, dataset_id: str, df: pd.DataFrame, df_type: str = "train"):
        """Updates the cache with a new DataFrame (e.g., after cleaning)."""
        cache_key = f"{dataset_id}_{df_type}"
        with self._lock:
            if len(self._cache) >= self._max_size and cache_key not in self._cache:
                self._cache.popitem(last=False)
            self._cache[cache_key] = df
            self._cache.move_to_end(cache_key)
        logger.info(f"DataManager: Cache UPDATED for {cache_key}")

    def clear_cache(self, dataset_id: str = None):
        """Clears specific or all cache entries."""
        with self._lock:
            if dataset_id:
                keys_to_remove = [k for k in self._cache.keys() if k.startswith(dataset_id)]
                for k in keys_to_remove:
                    del self._cache[k]
            else:
                self._cache.clear()
        logger.info(f"DataManager: Cache CLEARED {'for ' + dataset_id if dataset_id else 'completely'}")

# Global instance
data_manager = DataManager()
