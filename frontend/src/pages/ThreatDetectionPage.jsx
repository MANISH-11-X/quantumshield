import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Play, 
  Cpu, 
  Scale, 
  Filter, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function ThreatDetectionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileValidation, setFileValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [modelType, setModelType] = useState('quantum'); // 'quantum' | 'classical'
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'NORMAL' | 'SUSPICIOUS'
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);

  // Handle file select & automatic validation via backend /api/upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please select a valid CSV file (.csv).');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setPredictionResults(null);
    setIsValidating(true);

    try {
      const res = await api.uploadDataset(file);
      setFileValidation(res);
    } catch (err) {
      setErrorMessage(err.message || 'File validation failed');
      setFileValidation(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Run predictions
  const handleRunPrediction = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or upload a CSV file first.');
      return;
    }

    setIsPredicting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model_type', modelType);

      const res = await api.predictThreats(formData, true);
      setPredictionResults(res);
    } catch (err) {
      setErrorMessage(err.message || 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  // Download prediction results as CSV
  const handleDownloadResults = () => {
    if (!predictionResults || !predictionResults.results) return;

    const headers = ['Record_ID', 'Classification', 'Confidence', 'Suspicious_Probability', 'src_bytes', 'dst_bytes', 'count', 'srv_count'];
    const rows = predictionResults.results.map(r => [
      r.record_id,
      r.prediction,
      r.confidence,
      r.suspicious_probability,
      r.features?.src_bytes ?? '',
      r.features?.dst_bytes ?? '',
      r.features?.count ?? '',
      r.features?.srv_count ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quantumshield_predictions_${modelType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load sample dataset for testing
  const handleLoadSample = async () => {
    try {
      setIsValidating(true);
      setErrorMessage(null);
      setPredictionResults(null);

      const sampleUrl = api.getSampleDownloadUrl();
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sample_traffic.csv', { type: 'text/csv' });

      setSelectedFile(file);
      const res = await api.uploadDataset(file);
      setFileValidation(res);
    } catch (err) {
      setErrorMessage('Failed to load sample dataset: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Filtered results
  const filteredRecords = (predictionResults?.results || []).filter(item => {
    const matchesFilter = filterType === 'ALL' || item.prediction === filterType;
    const matchesSearch = searchTerm === '' || 
      item.record_id.toString().includes(searchTerm) ||
      (item.features?.src_bytes?.toString() || '').includes(searchTerm) ||
      (item.features?.dst_bytes?.toString() || '').includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Threat Detection Module</h2>
          <p className="text-sm text-gray-400 mt-1">
            Batch telemetry classification using Hybrid Quantum VQC or Classical Machine Learning
          </p>
        </div>

        {/* 1-Click Sample Download & Test Drive */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLoadSample}
            disabled={isValidating || isPredicting}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Load Demo Traffic CSV</span>
          </button>
          <a
            href={api.getSampleDownloadUrl()}
            download
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-700 text-xs font-mono transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>Download Sample CSV</span>
          </a>
        </div>
      </div>

      {/* Upload & Model Selection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Step 1: Upload Network Dataset
              </span>
              <span className="text-xs text-gray-400 font-mono">Compatible with NSL-KDD</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-8 text-center bg-slate-950/40 hover:bg-cyan-950/10 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_#00E5FF] transition-all mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop network CSV'}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                File must contain numeric columns: <code className="text-cyan-400">src_bytes</code>, <code className="text-cyan-400">dst_bytes</code>, <code className="text-cyan-400">count</code>, <code className="text-cyan-400">srv_count</code>
              </p>
            </div>
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center space-x-2 text-xs text-cyan-300 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Validating schema and data types...</span>
            </div>
          )}

          {fileValidation && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold">{fileValidation.filename}</span>
                  <p className="text-emerald-400 text-[11px]">
                    Validated: {fileValidation.total_records} records • Schema verified
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Ready for Classification
              </span>
            </div>
          )}
        </div>

        {/* Model Selection & Action Card */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono">
              Step 2: Choose Engine & Run
            </span>

            <div className="mt-4 space-y-3">
              {/* Quantum VQC Option */}
              <div
                onClick={() => setModelType('quantum')}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  modelType === 'quantum'
                    ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Quantum ML (VQC)</h4>
                      <p className="text-[11px] text-purple-300/80">IBM Qiskit 4-Qubit Simulator</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="model_type"
                    checked={modelType === 'quantum'}
                    onChange={() => setModelType('quantum')}
                    className="accent-purple-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Maps telemetry into a 16-dimensional quantum Hilbert space using ZZFeatureMap & RealAmplitudes.
                </p>
              </div>

              {/* Classical Logistic Regression Option */}
              <div
                onClick={() => setModelType('classical')}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  modelType === 'classical'
                    ? 'bg-blue-950/40 border-blue-400 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Scale className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Classical ML (Baseline)</h4>
                      <p className="text-[11px] text-blue-300/80">Scikit-Learn Logistic Regression</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="model_type"
                    checked={modelType === 'classical'}
                    onChange={() => setModelType('classical')}
                    className="accent-blue-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  High-speed classical statistical hyperplane baseline trained on 400 NSL-KDD benchmark flows.
                </p>
              </div>
            </div>
          </div>

          {/* Predict Button */}
          <div className="mt-6">
            <button
              onClick={handleRunPrediction}
              disabled={!selectedFile || isPredicting}
              className={`
                w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-xl
                ${!selectedFile || isPredicting
                  ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
                  : modelType === 'quantum'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 shadow-cyan-500/25'
                }
              `}
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {modelType === 'quantum' ? 'Executing Quantum Statevector Simulation...' : 'Evaluating Classical Model...'}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute {modelType === 'quantum' ? 'Quantum' : 'Classical'} Classification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="font-mono">{errorMessage}</span>
        </div>
      )}

      {/* Prediction Results Dashboard */}
      {predictionResults && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-gray-400">Total Classified</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {predictionResults.total_evaluated}
              </p>
              <span className="text-[10px] text-gray-500 font-mono">Records</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-mono text-emerald-400">Normal Flows</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {predictionResults.normal_count}
              </p>
              <span className="text-[10px] text-emerald-400/70 font-mono">
                {Math.round((predictionResults.normal_count / predictionResults.total_evaluated) * 100)}% legitimate
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <span className="text-[10px] uppercase font-mono text-rose-400">Suspicious Attacks</span>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {predictionResults.suspicious_count}
              </p>
              <span className="text-[10px] text-rose-400/70 font-mono">
                {predictionResults.threat_percentage}% anomaly rate
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20">
              <span className="text-[10px] uppercase font-mono text-cyan-400">Inference Latency</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {predictionResults.inference_time_ms} ms
              </p>
              <span className="text-[10px] text-gray-500 font-mono">{predictionResults.model_display_name}</span>
            </div>
          </div>

          {/* Results Table Section */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Table Controls Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Classification Output</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing {filteredRecords.length} of {predictionResults.total_evaluated} analyzed records
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by ID or bytes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                  {['ALL', 'NORMAL', 'SUSPICIOUS'].map(ft => (
                    <button
                      key={ft}
                      onClick={() => setFilterType(ft)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterType === ft 
                          ? 'bg-slate-800 text-cyan-400 font-bold' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={handleDownloadResults}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Results CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 sticky top-0 text-gray-400 border-b border-slate-800 uppercase tracking-wider text-[10px] z-10">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Classification</th>
                    <th className="py-3 px-6">Confidence</th>
                    <th className="py-3 px-6">Anomaly Prob</th>
                    <th className="py-3 px-6">Src Bytes</th>
                    <th className="py-3 px-6">Dst Bytes</th>
                    <th className="py-3 px-6">Count</th>
                    <th className="py-3 px-6">Srv Count</th>
                    {predictionResults.results[0]?.ground_truth && (
                      <th className="py-3 px-6">True Label</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-gray-300">
                  {filteredRecords.map((r) => (
                    <tr key={r.record_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6 text-cyan-300 font-bold">#{r.record_id}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.is_suspicious 
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.is_suspicious ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          <span>{r.prediction}</span>
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full ${r.is_suspicious ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.round(r.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold">{Math.round(r.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-gray-400">
                        {Math.round(r.suspicious_probability * 100)}%
                      </td>
                      <td className="py-3 px-6">{r.features?.src_bytes ?? '0'} B</td>
                      <td className="py-3 px-6">{r.features?.dst_bytes ?? '0'} B</td>
                      <td className="py-3 px-6">{r.features?.count ?? '0'}</td>
                      <td className="py-3 px-6">{r.features?.srv_count ?? '0'}</td>
                      {r.ground_truth && (
                        <td className="py-3 px-6 text-purple-300 font-bold">{r.ground_truth}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
