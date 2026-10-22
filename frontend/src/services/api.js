/**
 * api.js
 * Centralized API client for QuantumShield Flask backend.
 */

const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errData = await response.json();
      errorMessage = errData.error || errData.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Health & System
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Dashboard Summary & Recent Analytics
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse(res);
  },

  // Dataset Info & Preview
  getDatasetInfo: async () => {
    const res = await fetch(`${API_BASE}/dataset/info`);
    return handleResponse(res);
  },

  // Download Sample Dataset CSV URL
  getSampleDownloadUrl: () => `${API_BASE}/dataset/sample`,

  // Validate Uploaded CSV
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Predict Threats (file or json records)
  predictThreats: async (payload, isFile = false) => {
    let options = { method: 'POST' };
    if (isFile) {
      options.body = payload; // FormData
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payload);
    }
    const res = await fetch(`${API_BASE}/predict`, options);
    return handleResponse(res);
  },

  // Model Comparative Metrics
  getModelMetrics: async () => {
    const res = await fetch(`${API_BASE}/models/metrics`);
    return handleResponse(res);
  },

  // Quantum Circuit Diagram & Metadata
  getQuantumCircuit: async () => {
    const res = await fetch(`${API_BASE}/quantum/circuit`);
    return handleResponse(res);
  },

  // Quantum Training Status
  getQuantumStatus: async () => {
    const res = await fetch(`${API_BASE}/quantum/status`);
    return handleResponse(res);
  },

  // Trigger Asynchronous Retraining
  trainModel: async (modelType = 'quantum', samples = 60, iterations = 20) => {
    const res = await fetch(`${API_BASE}/models/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_type: modelType, samples, iterations }),
    });
    return handleResponse(res);
  },
};
