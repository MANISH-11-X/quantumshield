"""
evaluation.py
Standardized evaluation metrics for Classical and Quantum ML models.
Computes Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and runtime.
"""

import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def compute_metrics(y_true, y_pred, training_time_sec=0.0, inference_time_ms=0.0):
    """
    Computes standard classification evaluation metrics.
    y_true: array-like of shape (n_samples,)
    y_pred: array-like of shape (n_samples,)
    """
    y_true = np.asarray(y_true, dtype=int)
    y_pred = np.asarray(y_pred, dtype=int)

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1]).tolist()

    tn, fp = cm[0]
    fn, tp = cm[1]

    return {
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'confusion_matrix': {
            'matrix': cm,
            'true_negative': tn,
            'false_positive': fp,
            'false_negative': fn,
            'true_positive': tp
        },
        'sample_size': len(y_true),
        'training_time_sec': round(training_time_sec, 3),
        'inference_time_ms': round(inference_time_ms, 2)
    }
