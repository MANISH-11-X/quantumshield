"""
train_quantum.py
Trains the genuine IBM Qiskit Variational Quantum Classifier (VQC)
on the NSL-KDD dataset using quantum statevector simulation.
"""

import os
import sys
import json
import pandas as pd

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ml.preprocessing import QuantumShieldPreprocessor
from ml.quantum_model import QuantumThreatClassifier

def main():
    data_dir = os.path.join(backend_dir, 'data')
    models_dir = os.path.join(backend_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    train_path = os.path.join(data_dir, 'nsl_kdd_train.csv')
    test_path = os.path.join(data_dir, 'nsl_kdd_test.csv')

    print(f"[Quantum] Loading datasets from {data_dir}...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    prep_path = os.path.join(models_dir, 'preprocessor.joblib')
    if os.path.exists(prep_path):
        preprocessor = QuantumShieldPreprocessor.load(prep_path)
    else:
        preprocessor = QuantumShieldPreprocessor()
        preprocessor.fit(train_df)
        preprocessor.save(prep_path)

    # Use a balanced subset for quantum circuit simulation
    train_sub = train_df.head(60)
    test_sub = test_df.head(40)

    X_train_q = preprocessor.transform(train_sub)
    y_train_q = preprocessor.extract_labels(train_sub)

    X_test_q = preprocessor.transform(test_sub)
    y_test_q = preprocessor.extract_labels(test_sub)

    print(f"[Quantum] Initializing 4-Qubit Variational Quantum Classifier (VQC)...")
    q_classifier = QuantumThreatClassifier(num_qubits=4, reps=1, maxiter=20)

    def print_progress(step, total, loss):
        print(f"  > [Qiskit Optimization Step {step}/{total}] Objective Loss: {loss:.5f}")

    print(f"[Quantum] Training VQC on {len(X_train_q)} samples using Qiskit Aer/Statevector Sampler...")
    q_classifier.fit(X_train_q, y_train_q, progress_callback=print_progress)

    print(f"[Quantum] Training completed in {q_classifier.training_time:.2f}s.")
    print(f"[Quantum] Evaluating on {len(X_test_q)} identical test samples...")
    metrics = q_classifier.evaluate(X_test_q, y_test_q)
    print(f"[Quantum] Results: Accuracy={metrics['accuracy']:.4f}, F1={metrics['f1_score']:.4f}, Precision={metrics['precision']:.4f}, Recall={metrics['recall']:.4f}")

    # Add loss history & circuit details to metrics
    metrics['loss_history'] = q_classifier.loss_history
    metrics['circuit_metadata'] = q_classifier.get_circuit_metadata()

    model_path = os.path.join(models_dir, 'quantum_model.joblib')
    q_classifier.save(model_path)
    print(f"[Quantum] Saved quantum model to {model_path}")

    metrics_path = os.path.join(models_dir, 'quantum_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"[Quantum] Saved quantum evaluation metrics to {metrics_path}")

if __name__ == '__main__':
    main()
