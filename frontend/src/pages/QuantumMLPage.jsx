import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Cpu, 
  Layers, 
  Activity, 
  Sliders, 
  Play, 
  TrendingDown, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import CircuitViewer from '../components/CircuitViewer';
import { api } from '../services/api';

export default function QuantumMLPage() {
  const [circuitData, setCircuitData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Quantum Interactive Simulator state
  const [liveParams, setLiveParams] = useState({
    src_bytes: 350,
    dst_bytes: 2400,
    count: 3,
    srv_count: 2,
  });
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Background Retraining state
  const [isRetraining, setIsRetraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState(null);

  const fetchQuantumData = async () => {
    try {
      setLoading(true);
      const [circuit, status] = await Promise.all([
        api.getQuantumCircuit(),
        api.getQuantumStatus(),
      ]);
      setCircuitData(circuit);
      setStatusData(status);
    } catch (err) {
      console.error('Failed to load quantum data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuantumData();
  }, []);

  // Run live quantum simulation for single packet
  const handleExecuteLiveSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.predictThreats({
        records: [liveParams],
        model_type: 'quantum'
      });
      if (res && res.results && res.results.length > 0) {
        setSimResult(res.results[0]);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Trigger Retraining
  const handleRetrainQuantum = async () => {
    setIsRetraining(true);
    setTrainMessage('Submitting quantum VQC training job to Qiskit simulator...');
    try {
      const res = await api.trainModel('quantum', 60, 20);
      setTrainMessage(res.message);

      // Poll status for a few seconds
      const interval = setInterval(async () => {
        const s = await api.getQuantumStatus();
        setStatusData(s);
        if (s.training_state?.status === 'completed' || s.training_state?.status === 'failed') {
          clearInterval(interval);
          setIsRetraining(false);
          setTrainMessage(s.training_state.message);
          fetchQuantumData();
        }
      }, 1500);
    } catch (err) {
      setIsRetraining(false);
      setTrainMessage('Training request failed: ' + err.message);
    }
  };

  const lossHistory = statusData?.loss_history || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 mb-1">
            <Atom className="w-4 h-4 animate-spin text-purple-400" />
            <span>IBM QISKIT QUANTUM MACHINE LEARNING LAB</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Quantum Architecture & Circuit Analysis</h2>
          <p className="text-sm text-gray-400 mt-1">
            4-Qubit Variational Quantum Classifier (VQC) with Pauli-Z Feature Encoding & RealAmplitudes Ansatz
          </p>
        </div>

        {/* Retrain Action Button */}
        <button
          onClick={handleRetrainQuantum}
          disabled={isRetraining}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs font-mono shadow-lg shadow-purple-600/25 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Training Qiskit VQC...' : 'Re-train VQC Model'}</span>
        </button>
      </div>

      {/* Retraining Notification banner */}
      {trainMessage && (
        <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>{trainMessage}</span>
          </div>
          <button 
            onClick={() => setTrainMessage(null)} 
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quantum Circuit Interactive Viewer */}
      <CircuitViewer circuitData={circuitData} />

      {/* Grid: Live Quantum Simulator & Loss Convergence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Live Quantum Packet Simulator */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Live Quantum Packet Simulator</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                Interactive State Measurement
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Adjust network telemetry parameters and execute the 4-qubit circuit in real-time.
            </p>

            {/* Parameter Sliders */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Source Bytes (src_bytes):</span>
                  <span className="text-cyan-400 font-bold">{liveParams.src_bytes} B</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={liveParams.src_bytes}
                  onChange={(e) => setLiveParams({ ...liveParams, src_bytes: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Destination Bytes (dst_bytes):</span>
                  <span className="text-cyan-400 font-bold">{liveParams.dst_bytes} B</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="50"
                  value={liveParams.dst_bytes}
                  onChange={(e) => setLiveParams({ ...liveParams, dst_bytes: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Connection Count (count):</span>
                  <span className="text-purple-400 font-bold">{liveParams.count} connections</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="400"
                  value={liveParams.count}
                  onChange={(e) => setLiveParams({ ...liveParams, count: parseInt(e.target.value) })}
                  className="w-full accent-purple-400 bg-slate-800 rounded h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Service Port Count (srv_count):</span>
                  <span className="text-purple-400 font-bold">{liveParams.srv_count} connections</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={liveParams.srv_count}
                  onChange={(e) => setLiveParams({ ...liveParams, srv_count: parseInt(e.target.value) })}
                  className="w-full accent-purple-400 bg-slate-800 rounded h-1.5"
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="mt-6">
              <button
                onClick={handleExecuteLiveSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Quantum Circuit on Statevector Simulator...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Execute Circuit with Input Telemetry</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Simulation Result */}
          {simResult && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 uppercase text-[10px]">Quantum Classification Result:</span>
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  simResult.is_suspicious 
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {simResult.is_suspicious ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{simResult.prediction}</span>
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span>Confidence Score:</span>
                    <span className="font-bold text-white">{Math.round(simResult.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full ${simResult.is_suspicious ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.round(simResult.confidence * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-gray-400">
                  <span>Calculated Anomaly Probability:</span>
                  <span className="text-cyan-400 font-bold">{Math.round(simResult.suspicious_probability * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real Training Loss Convergence Chart */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">COBYLA Optimization Convergence</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                Cross-Entropy Loss
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Real loss values tracked at each variational parameter update step.
            </p>

            <div className="h-64 my-2">
              {lossHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="step" stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Step', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val) => [val, 'Loss']}
                      labelFormatter={(lbl) => `Iteration ${lbl}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#A855F7" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#A855F7' }} 
                      activeDot={{ r: 6, fill: '#00E5FF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Activity className="w-8 h-8 text-purple-400/50 mb-2" />
                  <p className="text-xs text-gray-400">Click "Re-train VQC Model" above to record and visualize live parameter convergence.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950/50">
              <span className="text-gray-500 block text-[10px]">Optimizer:</span>
              <span className="text-purple-300 font-bold">COBYLA (Derivative-free)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50">
              <span className="text-gray-500 block text-[10px]">Loss Function:</span>
              <span className="text-cyan-300 font-bold">Cross-Entropy Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* "How QuantumShield Works" Section (Judges Explanation) */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 to-blue-950/40 border border-cyan-500/20 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">How QuantumShield Works</h3>
            <p className="text-xs text-cyan-400 font-mono">Technical walkthrough for Hackathon Judges & Security Architects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center font-mono">1</div>
            <h4 className="font-bold text-white text-sm">Feature Mapping to Quantum Space</h4>
            <p className="leading-relaxed text-gray-400">
              Network telemetry (such as packet byte volumes and connection frequencies) is compressed with log1p and normalized to the $[0, \pi]$ interval. Using Qiskit's <strong className="text-cyan-300">ZZFeatureMap</strong>, these values are mapped into the rotation angles of 4 qubits, creating quantum superposition and non-linear feature entanglement that classical hyperplanes cannot easily mimic.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center font-mono">2</div>
            <h4 className="font-bold text-white text-sm">Parameterized Variational Ansatz</h4>
            <p className="leading-relaxed text-gray-400">
              A trainable quantum circuit called <strong className="text-purple-300">RealAmplitudes</strong> applies parameterized $R_y(\theta)$ rotation gates interleaved with CNOT entanglement gates across all 4 qubits. There are 8 variational parameters ($\theta_0 \dots \theta_7$) which are fine-tuned by the classical <strong className="text-purple-300">COBYLA</strong> optimizer to minimize classification loss.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono">3</div>
            <h4 className="font-bold text-white text-sm">Measurement & Threat Decision</h4>
            <p className="leading-relaxed text-gray-400">
              The quantum state is sampled using Qiskit's <strong className="text-emerald-300">StatevectorSampler</strong>. The measurement probabilities across the computational basis states are mapped into a binary parity verdict: <span className="text-emerald-400 font-bold">NORMAL (0)</span> for legitimate network flows or <span className="text-rose-400 font-bold">SUSPICIOUS (1)</span> for cyber intrusions (such as Neptune DoS or Portsweeps).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
