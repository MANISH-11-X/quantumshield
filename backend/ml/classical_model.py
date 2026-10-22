"""
classical_model.py
Classical Machine Learning Baseline Classifier for QuantumShield.
Uses Scikit-Learn Logistic Regression with standard hyperparameter tuning.
"""

import os
import time
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from ml.evaluation import compute_metrics

class ClassicalThreatClassifier:
    def __init__(self, random_state=42, max_iter=1000):
        self.random_state = random_state
        self.max_iter = max_iter
        self.model = LogisticRegression(
            random_state=self.random_state,
            max_iter=self.max_iter,
            solver='lbfgs',
            C=1.0
        )
        self.is_trained = False
        self.training_time = 0.0

    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        start_time = time.time()
        self.model.fit(X_train, y_train)
        self.training_time = time.time() - start_time
        self.is_trained = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Classical model is not trained yet.")
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Classical model is not trained yet.")
        return self.model.predict_proba(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        start_inf = time.time()
        y_pred = self.predict(X_test)
        inf_time = (time.time() - start_inf) * 1000.0  # ms
        return compute_metrics(y_test, y_pred, self.training_time, inf_time)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'is_trained': self.is_trained,
            'training_time': self.training_time,
            'random_state': self.random_state
        }, filepath)

    @classmethod
    def load(cls, filepath: str):
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found at {filepath}")
        data = joblib.load(filepath)
        classifier = cls(random_state=data.get('random_state', 42))
        classifier.model = data['model']
        classifier.is_trained = data['is_trained']
        classifier.training_time = data.get('training_time', 0.0)
        return classifier
