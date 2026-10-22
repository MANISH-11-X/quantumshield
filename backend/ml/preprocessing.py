"""
preprocessing.py
Preprocesses NSL-KDD cybersecurity network traffic for Classical and Quantum ML pipelines.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

DEFAULT_FEATURES = ['src_bytes', 'dst_bytes', 'count', 'srv_count']
LABEL_COL = 'label'

class QuantumShieldPreprocessor:
    def __init__(self, feature_cols=None):
        self.feature_cols = feature_cols or DEFAULT_FEATURES
        self.scaler = MinMaxScaler(feature_range=(0, np.pi))  # Scale to [0, π] for Quantum ZZFeatureMap
        self.is_fitted = False

    def extract_labels(self, df: pd.DataFrame) -> np.ndarray:
        if LABEL_COL not in df.columns:
            return None
        # Normal traffic -> 0, Any attack/anomaly -> 1
        labels = df[LABEL_COL].astype(str).str.strip().str.lower()
        return np.where(labels == 'normal', 0, 1)

    def fit(self, df: pd.DataFrame):
        X = self._prepare_features(df)
        self.scaler.fit(X)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before transforming data.")
        X = self._prepare_features(df)
        return self.scaler.transform(X)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        self.fit(df)
        return self.transform(df)

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        missing_cols = [col for col in self.feature_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns in dataset: {missing_cols}")

        sub_df = df[self.feature_cols].copy()
        
        # Handle non-numeric or missing data
        for col in self.feature_cols:
            sub_df[col] = pd.to_numeric(sub_df[col], errors='coerce').fillna(0.0)
            # Log transform heavy-tailed bytes features for stability
            if 'bytes' in col:
                sub_df[col] = np.log1p(np.maximum(0, sub_df[col].values))

        return sub_df.values.astype(np.float64)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'scaler': self.scaler,
            'feature_cols': self.feature_cols,
            'is_fitted': self.is_fitted
        }, filepath)

    @classmethod
    def load(cls, filepath: str):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Preprocessor file not found at {filepath}")
        data = joblib.load(filepath)
        preprocessor = cls(feature_cols=data['feature_cols'])
        preprocessor.scaler = data['scaler']
        preprocessor.is_fitted = data['is_fitted']
        return preprocessor
