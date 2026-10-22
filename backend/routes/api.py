"""
api.py
Flask REST API routes for QuantumShield.
Handles model loading, dataset inspection, CSV uploads, batch predictions,
quantum circuit rendering, and asynchronous model training.
"""

import os
import json
import time
import threading
import io
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify, send_file, current_app

from ml.preprocessing import QuantumShieldPreprocessor, DEFAULT_FEATURES
from ml.classical_model import ClassicalThreatClassifier
from ml.quantum_model import QuantumThreatClassifier

api_bp = Blueprint('api', __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Global references & state
preprocessor = None
classical_model = None
quantum_model = None

# Training state tracker
training_state = {
    'status': 'idle',  # 'idle' | 'training' | 'completed' | 'failed'
    'model_type': None,
    'current_step': 0,
    'total_steps': 0,
    'current_loss': None,
    'loss_history': [],
    'message': 'No training job currently running',
    'started_at': None,
    'completed_at': None,
    'error': None
}

# Runtime analytics store (populated by test runs and user uploads)
analytics_store = {
    'total_analyzed': 0,
    'normal_count': 0,
    'suspicious_count': 0,
    'recent_predictions': []
}

def sanitize_val(val):
    if pd.isna(val):
        return 0
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        return round(float(val), 4)
    return str(val)

def load_system_artifacts():
    global preprocessor, classical_model, quantum_model
    prep_path = os.path.join(MODELS_DIR, 'preprocessor.joblib')
    if os.path.exists(prep_path):
        try:
            preprocessor = QuantumShieldPreprocessor.load(prep_path)
        except Exception as e:
            print(f"[Warning] Could not load preprocessor: {e}")

    class_path = os.path.join(MODELS_DIR, 'classical_model.joblib')
    if os.path.exists(class_path):
        try:
            classical_model = ClassicalThreatClassifier.load(class_path)
        except Exception as e:
            print(f"[Warning] Could not load classical model: {e}")

    quant_path = os.path.join(MODELS_DIR, 'quantum_model.joblib')
    if os.path.exists(quant_path):
        try:
            quantum_model = QuantumThreatClassifier.load(quant_path)
        except Exception as e:
            print(f"[Warning] Could not load quantum model: {e}")

def get_saved_metrics():
    class_metrics_path = os.path.join(MODELS_DIR, 'classical_metrics.json')
    quant_metrics_path = os.path.join(MODELS_DIR, 'quantum_metrics.json')

    classical_data = None
    if os.path.exists(class_metrics_path):
        with open(class_metrics_path, 'r') as f:
            classical_data = json.load(f)

    quantum_data = None
    if os.path.exists(quant_metrics_path):
        with open(quant_metrics_path, 'r') as f:
            quantum_data = json.load(f)

    return classical_data, quantum_data

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'QuantumShield Backend API',
        'version': '1.0.0',
        'framework': 'IBM Qiskit 2.6 / Scikit-Learn',
        'simulator': 'Qiskit Aer / Statevector Primitive V2',
        'models_loaded': {
            'preprocessor': preprocessor is not None,
            'classical_model': classical_model is not None,
            'quantum_model': quantum_model is not None
        }
    })

@api_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    classical_metrics, quantum_metrics = get_saved_metrics()

    detection_rate = 0.0
    if analytics_store['total_analyzed'] > 0:
        detection_rate = round((analytics_store['suspicious_count'] / analytics_store['total_analyzed']) * 100, 2)

    return jsonify({
        'summary': {
            'total_analyzed': int(analytics_store['total_analyzed']),
            'normal_count': int(analytics_store['normal_count']),
            'suspicious_count': int(analytics_store['suspicious_count']),
            'detection_rate': float(detection_rate)
        },
        'recent_predictions': analytics_store['recent_predictions'][:15],
        'model_benchmarks': {
            'classical': classical_metrics,
            'quantum': quantum_metrics
        }
    })

@api_bp.route('/dataset/info', methods=['GET'])
def get_dataset_info():
    train_path = os.path.join(DATA_DIR, 'nsl_kdd_train.csv')
    test_path = os.path.join(DATA_DIR, 'nsl_kdd_test.csv')

    train_count = 0
    test_count = 0
    label_dist = {}
    preview_rows = []

    if os.path.exists(train_path):
        train_df = pd.read_csv(train_path)
        train_count = int(len(train_df))
        raw_dist = train_df['label'].value_counts().to_dict()
        label_dist = {str(k): int(v) for k, v in raw_dist.items()}
        # Clean preview rows
        preview_clean = train_df.head(10).to_dict(orient='records')
        preview_rows = [{k: sanitize_val(v) for k, v in row.items()} for row in preview_clean]

    if os.path.exists(test_path):
        test_df = pd.read_csv(test_path)
        test_count = int(len(test_df))

    feature_descriptions = [
        {'name': 'src_bytes', 'type': 'Continuous', 'role': 'Quantum + Classical', 'desc': 'Number of data bytes sent from source to destination'},
        {'name': 'dst_bytes', 'type': 'Continuous', 'role': 'Quantum + Classical', 'desc': 'Number of data bytes sent from destination to source'},
        {'name': 'count', 'type': 'Continuous', 'role': 'Quantum + Classical', 'desc': 'Connections to the same destination host in past 2 seconds'},
        {'name': 'srv_count', 'type': 'Continuous', 'role': 'Quantum + Classical', 'desc': 'Connections to the same service port in past 2 seconds'},
        {'name': 'protocol_type', 'type': 'Categorical', 'role': 'Transport protocol (TCP, UDP, ICMP)', 'desc': 'Transport layer network protocol'},
        {'name': 'service', 'type': 'Categorical', 'role': 'Application service', 'desc': 'Target service (HTTP, SMTP, FTP, private, etc.)'},
        {'name': 'flag', 'type': 'Categorical', 'role': 'Status flag', 'desc': 'Connection state (SF=Normal, S0=SYN error, REJ=Rejected)'},
        {'name': 'serror_rate', 'type': 'Continuous', 'role': 'SYN error percentage', 'desc': 'Fraction of connections with SYN errors'},
        {'name': 'same_srv_rate', 'type': 'Continuous', 'role': 'Same service percentage', 'desc': 'Fraction of connections to the same service'}
    ]

    return jsonify({
        'dataset_name': 'NSL-KDD Benchmark Dataset',
        'source': 'Canadian Institute for Cybersecurity (UNB)',
        'official_url': 'https://www.unb.ca/cic/datasets/nsl.html',
        'total_train_records': train_count,
        'total_test_records': test_count,
        'selected_quantum_features': DEFAULT_FEATURES,
        'label_distribution': label_dist,
        'feature_descriptions': feature_descriptions,
        'preview_rows': preview_rows,
        'preprocessing_steps': [
            '1. Ingestion of 41 raw network traffic telemetry parameters.',
            '2. Label binarization: "normal" -> 0 (Legitimate), all attack vectors -> 1 (Suspicious).',
            '3. Logarithmic compression (log1p) on high-variance byte distributions (src_bytes, dst_bytes).',
            '4. Feature projection into [0, π] interval using MinMaxScaler for quantum angle rotation encoding.'
        ]
    })

@api_bp.route('/dataset/sample', methods=['GET'])
def get_sample_dataset():
    sample_path = os.path.join(DATA_DIR, 'sample_traffic.csv')
    if not os.path.exists(sample_path):
        return jsonify({'error': 'Sample dataset file not found'}), 404
    return send_file(
        sample_path,
        mimetype='text/csv',
        as_attachment=True,
        download_name='quantumshield_sample_traffic.csv'
    )

@api_bp.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Invalid file format. Please upload a valid CSV file (.csv)'}), 400

    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({'error': f'Failed to parse CSV file: {str(e)}'}), 400

    # Validate required features
    missing_cols = [col for col in DEFAULT_FEATURES if col not in df.columns]
    if missing_cols:
        return jsonify({
            'error': f'CSV is missing required feature columns: {", ".join(missing_cols)}',
            'required_columns': DEFAULT_FEATURES,
            'found_columns': list(df.columns)
        }), 400

    preview = [{k: sanitize_val(v) for k, v in row.items()} for row in df.head(5).to_dict(orient='records')]
    return jsonify({
        'message': 'File uploaded and validated successfully',
        'filename': file.filename,
        'total_records': int(len(df)),
        'columns': list(df.columns),
        'preview': preview
    })

@api_bp.route('/predict', methods=['POST'])
def predict_threats():
    global preprocessor, classical_model, quantum_model

    if preprocessor is None:
        load_system_artifacts()

    data = None
    if 'file' in request.files:
        file = request.files['file']
        try:
            data = pd.read_csv(file)
        except Exception as e:
            return jsonify({'error': f'Failed to read CSV: {str(e)}'}), 400
    elif request.is_json:
        payload = request.get_json()
        records = payload.get('records')
        if not records:
            return jsonify({'error': 'No records provided in JSON request'}), 400
        data = pd.DataFrame(records)
    else:
        if 'csv_text' in request.form:
            try:
                data = pd.read_csv(io.StringIO(request.form['csv_text']))
            except Exception as e:
                return jsonify({'error': f'Failed to parse CSV text: {str(e)}'}), 400
        else:
            return jsonify({'error': 'No valid data provided for prediction'}), 400

    model_type = request.values.get('model_type', 'quantum').lower()
    if model_type not in ['classical', 'quantum']:
        model_type = 'quantum'

    # Check model availability
    if model_type == 'classical' and classical_model is None:
        load_system_artifacts()
        if classical_model is None:
            return jsonify({'error': 'Classical model is not trained or loaded yet. Run training first.'}), 400

    if model_type == 'quantum' and quantum_model is None:
        load_system_artifacts()
        if quantum_model is None:
            return jsonify({'error': 'Quantum model is not trained or loaded yet. Run training first.'}), 400

    try:
        X_scaled = preprocessor.transform(data)
    except Exception as e:
        return jsonify({'error': f'Preprocessing error: {str(e)}'}), 400

    start_time = time.time()
    if model_type == 'classical':
        preds = classical_model.predict(X_scaled)
        probs = classical_model.predict_proba(X_scaled)
    else:
        preds = quantum_model.predict(X_scaled)
        probs = quantum_model.predict_proba(X_scaled)

    inference_time_ms = round((time.time() - start_time) * 1000.0, 2)

    results = []
    normal_count = 0
    suspicious_count = 0

    for idx in range(len(data)):
        pred_label = int(preds[idx])
        conf_suspicious = float(probs[idx][1]) if probs.shape[1] > 1 else float(probs[idx][0])
        status = 'SUSPICIOUS' if pred_label == 1 else 'NORMAL'

        if pred_label == 1:
            suspicious_count += 1
        else:
            normal_count += 1

        rec_info = {
            'record_id': idx + 1,
            'prediction': status,
            'is_suspicious': bool(pred_label == 1),
            'confidence': round(conf_suspicious if pred_label == 1 else (1.0 - conf_suspicious), 4),
            'suspicious_probability': round(conf_suspicious, 4),
            'features': {
                col: sanitize_val(data[col].iloc[idx]) if col in data.columns else None
                for col in DEFAULT_FEATURES
            }
        }
        if 'label' in data.columns:
            rec_info['ground_truth'] = str(data['label'].iloc[idx])
        results.append(rec_info)

    # Update analytics store
    analytics_store['total_analyzed'] += len(results)
    analytics_store['normal_count'] += normal_count
    analytics_store['suspicious_count'] += suspicious_count

    for r in results[:10]:
        analytics_store['recent_predictions'].insert(0, {
            'record_id': f"REC-{int(time.time()*1000) % 100000}-{r['record_id']}",
            'model_used': 'Quantum ML (Qiskit VQC)' if model_type == 'quantum' else 'Classical ML (Scikit-Learn)',
            'status': r['prediction'],
            'confidence': r['confidence'],
            'timestamp': time.strftime('%H:%M:%S'),
            'src_bytes': r['features'].get('src_bytes', 0),
            'dst_bytes': r['features'].get('dst_bytes', 0)
        })

    analytics_store['recent_predictions'] = analytics_store['recent_predictions'][:30]

    return jsonify({
        'model_type': model_type,
        'model_display_name': 'Quantum ML (IBM Qiskit VQC)' if model_type == 'quantum' else 'Classical ML (Logistic Regression)',
        'total_evaluated': int(len(results)),
        'normal_count': int(normal_count),
        'suspicious_count': int(suspicious_count),
        'threat_percentage': round((suspicious_count / len(results)) * 100, 2) if len(results) > 0 else 0.0,
        'inference_time_ms': inference_time_ms,
        'results': results
    })

@api_bp.route('/models/metrics', methods=['GET'])
def get_model_metrics():
    classical_metrics, quantum_metrics = get_saved_metrics()

    if classical_metrics is None or quantum_metrics is None:
        return jsonify({
            'error': 'Metrics not fully available. Please run training scripts or wait for training to complete.',
            'classical_available': classical_metrics is not None,
            'quantum_available': quantum_metrics is not None
        }), 404

    return jsonify({
        'fair_evaluation_disclosure': {
            'evaluation_dataset': 'NSL-KDD Test Subset',
            'sample_size': quantum_metrics.get('sample_size', 40),
            'features_used': DEFAULT_FEATURES,
            'evaluation_protocol': 'Identical feature scaling and identical test rows evaluated on both models'
        },
        'classical': classical_metrics,
        'quantum': quantum_metrics,
        'comparison_summary': {
            'accuracy_difference': round(classical_metrics['accuracy'] - quantum_metrics['accuracy'], 4),
            'f1_difference': round(classical_metrics['f1_score'] - quantum_metrics['f1_score'], 4),
            'training_time_ratio': round(quantum_metrics['training_time_sec'] / max(classical_metrics['training_time_sec'], 0.001), 1)
        }
    })

@api_bp.route('/quantum/circuit', methods=['GET'])
def get_quantum_circuit():
    global quantum_model
    if quantum_model is None:
        load_system_artifacts()

    if quantum_model is None:
        temp_model = QuantumThreatClassifier(num_qubits=4, reps=1)
        ascii_diagram = temp_model.get_circuit_ascii()
        metadata = temp_model.get_circuit_metadata()
    else:
        ascii_diagram = quantum_model.get_circuit_ascii()
        metadata = quantum_model.get_circuit_metadata()

    circuit_layers = [
        {
            'layer': 1,
            'name': 'Hadamard Superposition',
            'type': 'superposition',
            'description': 'Puts all 4 qubits into equal superposition: |+⟩ = (|0⟩ + |1⟩)/√2',
            'gates': ['H(q0)', 'H(q1)', 'H(q2)', 'H(q3)']
        },
        {
            'layer': 2,
            'name': 'Pauli-Z Single-Qubit Rotations',
            'type': 'rotation',
            'description': 'Encodes normalized network features as phase angles: Rz(2·x_i)',
            'gates': ['Rz(x0, q0)', 'Rz(x1, q1)', 'Rz(x2, q2)', 'Rz(x3, q3)']
        },
        {
            'layer': 3,
            'name': 'ZZ Entanglement & Cross-Correlation',
            'type': 'entanglement',
            'description': 'Encodes non-linear pairwise interactions: exp(i·(π-x_i)(π-x_j)·Z_i·Z_j)',
            'gates': ['CX(q0, q1)', 'Rz(2·x01, q1)', 'CX(q0, q1)', 'CX(q1, q2)', 'Rz(2·x12, q2)', 'CX(q1, q2)', 'CX(q2, q3)', 'Rz(2·x23, q3)', 'CX(q2, q3)']
        },
        {
            'layer': 4,
            'name': 'Parameterized Variational Layer (RealAmplitudes)',
            'type': 'variational',
            'description': 'Trainable rotation angles θ_i optimized by COBYLA classical optimizer',
            'gates': ['Ry(θ0, q0)', 'Ry(θ1, q1)', 'Ry(θ2, q2)', 'Ry(θ3, q3)']
        },
        {
            'layer': 5,
            'name': 'Ansatz Entangler & Final Rotation',
            'type': 'entanglement',
            'description': 'Linear CX entangling ladder followed by secondary variational layer',
            'gates': ['CX(q0, q1)', 'CX(q1, q2)', 'CX(q2, q3)', 'Ry(θ4, q0)', 'Ry(θ5, q1)', 'Ry(θ6, q2)', 'Ry(θ7, q3)']
        },
        {
            'layer': 6,
            'name': 'Computational Basis Measurement',
            'type': 'measurement',
            'description': 'Projects quantum state into 2^4 = 16 basis states; parity mapping yields binary classification',
            'gates': ['Measure(q0)', 'Measure(q1)', 'Measure(q2)', 'Measure(q3)']
        }
    ]

    return jsonify({
        'ascii_diagram': ascii_diagram,
        'metadata': metadata,
        'circuit_layers': circuit_layers
    })

@api_bp.route('/quantum/status', methods=['GET'])
def get_quantum_status():
    global quantum_model, training_state
    if quantum_model is None:
        load_system_artifacts()

    loss_hist = []
    if quantum_model and quantum_model.loss_history:
        loss_hist = quantum_model.loss_history
    elif training_state['loss_history']:
        loss_hist = training_state['loss_history']

    return jsonify({
        'training_state': training_state,
        'loss_history': loss_hist,
        'is_model_trained': quantum_model.is_trained if quantum_model else False,
        'simulator_backend': 'Qiskit Aer / StatevectorSampler Primitive V2',
        'qubit_count': 4,
        'hardware_architecture': 'Simulated IBM Quantum Eagle / Heron topology'
    })

def run_background_training(model_type: str, n_samples: int, max_iter: int):
    global training_state, preprocessor, classical_model, quantum_model
    try:
        training_state['status'] = 'training'
        training_state['model_type'] = model_type
        training_state['current_step'] = 0
        training_state['total_steps'] = max_iter
        training_state['loss_history'] = []
        training_state['started_at'] = time.time()
        training_state['error'] = None

        train_path = os.path.join(DATA_DIR, 'nsl_kdd_train.csv')
        test_path = os.path.join(DATA_DIR, 'nsl_kdd_test.csv')

        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)

        if preprocessor is None:
            preprocessor = QuantumShieldPreprocessor()
            preprocessor.fit(train_df)
            preprocessor.save(os.path.join(MODELS_DIR, 'preprocessor.joblib'))

        if model_type == 'classical':
            X_train = preprocessor.transform(train_df.head(n_samples))
            y_train = preprocessor.extract_labels(train_df.head(n_samples))
            X_test = preprocessor.transform(test_df.head(40))
            y_test = preprocessor.extract_labels(test_df.head(40))

            training_state['message'] = f'Training Classical Logistic Regression on {n_samples} samples...'
            cls_model = ClassicalThreatClassifier(max_iter=max_iter)
            cls_model.fit(X_train, y_train)

            metrics = cls_model.evaluate(X_test, y_test)
            metrics_path = os.path.join(MODELS_DIR, 'classical_metrics.json')
            with open(metrics_path, 'w') as f:
                json.dump(metrics, f, indent=2)

            cls_model.save(os.path.join(MODELS_DIR, 'classical_model.joblib'))
            classical_model = cls_model

            training_state['current_step'] = max_iter
            training_state['status'] = 'completed'
            training_state['message'] = f'Classical training completed with accuracy: {metrics["accuracy"]}'
            training_state['completed_at'] = time.time()

        elif model_type == 'quantum':
            train_sub = train_df.head(n_samples)
            test_sub = test_df.head(40)

            X_train_q = preprocessor.transform(train_sub)
            y_train_q = preprocessor.extract_labels(train_sub)
            X_test_q = preprocessor.transform(test_sub)
            y_test_q = preprocessor.extract_labels(test_sub)

            training_state['message'] = f'Training 4-Qubit VQC with Qiskit on {n_samples} samples...'

            def progress_hook(step, total, loss_val):
                training_state['current_step'] = step
                training_state['current_loss'] = loss_val
                training_state['loss_history'].append({'step': step, 'loss': round(loss_val, 5)})
                training_state['message'] = f'Optimization iteration {step}/{total} - Loss: {loss_val:.5f}'

            q_model = QuantumThreatClassifier(num_qubits=4, reps=1, maxiter=max_iter)
            q_model.fit(X_train_q, y_train_q, progress_callback=progress_hook)

            metrics = q_model.evaluate(X_test_q, y_test_q)
            metrics['loss_history'] = q_model.loss_history
            metrics['circuit_metadata'] = q_model.get_circuit_metadata()

            metrics_path = os.path.join(MODELS_DIR, 'quantum_metrics.json')
            with open(metrics_path, 'w') as f:
                json.dump(metrics, f, indent=2)

            q_model.save(os.path.join(MODELS_DIR, 'quantum_model.joblib'))
            quantum_model = q_model

            training_state['status'] = 'completed'
            training_state['message'] = f'Quantum VQC training completed with accuracy: {metrics["accuracy"]}'
            training_state['completed_at'] = time.time()

    except Exception as e:
        training_state['status'] = 'failed'
        training_state['error'] = str(e)
        training_state['message'] = f'Training failed: {str(e)}'
        print(f"[Training Error] {e}")

@api_bp.route('/models/train', methods=['POST'])
def train_model_endpoint():
    global training_state
    if training_state['status'] == 'training':
        return jsonify({
            'error': 'A training job is already in progress.',
            'training_state': training_state
        }), 409

    payload = request.get_json() or {}
    model_type = payload.get('model_type', 'quantum').lower()
    if model_type not in ['classical', 'quantum']:
        model_type = 'quantum'

    n_samples = int(payload.get('samples', 60 if model_type == 'quantum' else 300))
    n_samples = max(20, min(n_samples, 400))

    max_iter = int(payload.get('iterations', 20 if model_type == 'quantum' else 500))
    max_iter = max(5, min(max_iter, 50 if model_type == 'quantum' else 1000))

    thread = threading.Thread(
        target=run_background_training,
        args=(model_type, n_samples, max_iter),
        daemon=True
    )
    thread.start()

    return jsonify({
        'message': f'Background training started for {model_type} model.',
        'model_type': model_type,
        'samples': n_samples,
        'iterations': max_iter,
        'status_endpoint': '/api/quantum/status'
    })
