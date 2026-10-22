"""
train_classical.py
Trains the baseline Scikit-Learn Classical Logistic Regression Classifier
on the NSL-KDD dataset and saves artifacts.
Includes identical benchmark test set evaluation for fair comparison with Quantum ML.
"""

import os
import sys
import json
import pandas as pd

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.preprocessing import QuantumShieldPreprocessor
from ml.classical_model import ClassicalThreatClassifier

def main():
    data_dir = os.path.join(backend_dir, 'data')
    models_dir = os.path.join(backend_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    train_path = os.path.join(data_dir, 'nsl_kdd_train.csv')
    test_path = os.path.join(data_dir, 'nsl_kdd_test.csv')

    print(f"[Classical] Loading datasets from {data_dir}...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    prep_path = os.path.join(models_dir, 'preprocessor.joblib')
    if os.path.exists(prep_path):
        preprocessor = QuantumShieldPreprocessor.load(prep_path)
    else:
        preprocessor = QuantumShieldPreprocessor()
        preprocessor.fit(train_df)
        preprocessor.save(prep_path)

    X_train = preprocessor.fit_transform(train_df)
    y_train = preprocessor.extract_labels(train_df)

    # Identical 40 benchmark samples as used for Quantum evaluation
    test_sub = test_df.head(40)
    X_test_sub = preprocessor.transform(test_sub)
    y_test_sub = preprocessor.extract_labels(test_sub)

    # Full test set
    X_test_full = preprocessor.transform(test_df)
    y_test_full = preprocessor.extract_labels(test_df)

    print(f"[Classical] Training Logistic Regression model on {len(X_train)} samples...")
    classifier = ClassicalThreatClassifier(random_state=42)
    classifier.fit(X_train, y_train)

    print(f"[Classical] Evaluating on identical 40 benchmark test samples...")
    metrics_bench = classifier.evaluate(X_test_sub, y_test_sub)
    metrics_bench['full_test_metrics'] = classifier.evaluate(X_test_full, y_test_full)

    print(f"[Classical] Benchmark Results (40 samples): Accuracy={metrics_bench['accuracy']:.4f}, F1={metrics_bench['f1_score']:.4f}, Time={metrics_bench['training_time_sec']:.3f}s")
    print(f"[Classical] Full Test Results (120 samples): Accuracy={metrics_bench['full_test_metrics']['accuracy']:.4f}, F1={metrics_bench['full_test_metrics']['f1_score']:.4f}")

    model_path = os.path.join(models_dir, 'classical_model.joblib')
    classifier.save(model_path)
    print(f"[Classical] Saved model to {model_path}")

    metrics_path = os.path.join(models_dir, 'classical_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics_bench, f, indent=2)
    print(f"[Classical] Saved evaluation metrics to {metrics_path}")

if __name__ == '__main__':
    main()
