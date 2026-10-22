import React, { useState } from 'react';
import { Copy, Check, Info, Cpu, Layers } from 'lucide-react';

export default function CircuitViewer({ circuitData }) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'ascii'
  const [copied, setCopied] = useState(false);
  const [selectedGate, setSelectedGate] = useState(null);

  const ascii = circuitData?.ascii_diagram || 'Loading circuit diagram...';
  const metadata = circuitData?.metadata || {};
  const layers = circuitData?.circuit_layers || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">4-Qubit Variational Quantum Circuit</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ZZFeatureMap (Data Encoding) + RealAmplitudes Ansatz (Parameterized Variational Classification)
          </p>
        </div>

        {/* View Switcher & Copy */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'visual'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Interactive Pipeline
            </button>
            <button
              onClick={() => setActiveTab('ascii')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'ascii'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Qiskit ASCII Diagram
            </button>
          </div>

          {activeTab === 'ascii' && (
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-700 text-xs font-mono transition-all"
              title="Copy Qiskit Circuit Diagram"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata Pill Bar */}
      <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap gap-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-gray-300">
          <span className="text-gray-500">Qubits:</span>
          <span className="text-cyan-400 font-bold">{metadata.num_qubits || 4}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-gray-300">
          <span className="text-gray-500">Circuit Depth:</span>
          <span className="text-purple-400 font-bold">{metadata.depth || 15}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-gray-300">
          <span className="text-gray-500">Total Gates:</span>
          <span className="text-emerald-400 font-bold">{metadata.total_gates || 28}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-gray-300">
          <span className="text-gray-500">Trainable Params:</span>
          <span className="text-yellow-400 font-bold">{metadata.num_parameters || 8} (θ₀..θ₇)</span>
        </div>
        <div className="flex items-center space-x-1.5 text-gray-300">
          <span className="text-gray-500">Simulator:</span>
          <span className="text-cyan-300 font-bold">Aer / Statevector Primitive V2</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === 'visual' ? (
          <div className="space-y-6">
            {/* Visual Quantum Pipeline Schematic */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[700px] p-6 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs">
                {/* 4 Qubit Wires */}
                {[0, 1, 2, 3].map((qubitIdx) => {
                  const featureNames = ['src_bytes (x₀)', 'dst_bytes (x₁)', 'count (x₂)', 'srv_count (x₃)'];
                  return (
                    <div key={qubitIdx} className="flex items-center h-16 border-b border-slate-800/60 last:border-b-0 relative">
                      {/* Qubit Label */}
                      <div className="w-36 flex-shrink-0 flex flex-col justify-center">
                        <span className="text-cyan-400 font-bold">|q{qubitIdx}⟩ = |0⟩</span>
                        <span className="text-[10px] text-gray-500 truncate">{featureNames[qubitIdx]}</span>
                      </div>

                      {/* Continuous Quantum Wire */}
                      <div className="flex-1 h-[2px] bg-slate-700 relative flex items-center justify-around px-4">
                        {/* Layer 1: Hadamard */}
                        <div 
                          onClick={() => setSelectedGate({ title: `Hadamard Gate (q${qubitIdx})`, formula: 'H = (|0⟩⟨0| + |0⟩⟨1| + |1⟩⟨0| - |1⟩⟨1|)/√2', desc: 'Creates equal superposition between basis states |0⟩ and |1⟩.' })}
                          className="cursor-pointer z-10 w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-110 transition-transform"
                          title="Hadamard Superposition Gate"
                        >
                          H
                        </div>

                        {/* Layer 2: Rz Rotation */}
                        <div 
                          onClick={() => setSelectedGate({ title: `Pauli-Z Rotation Rz(2·x_${qubitIdx})`, formula: `Rz(θ) = exp(-i·θ/2·Z)`, desc: `Encodes normalized feature x_${qubitIdx} directly into the quantum phase on the equator of the Bloch sphere.` })}
                          className="cursor-pointer z-10 w-11 h-9 rounded-lg bg-indigo-950 border border-indigo-400 text-indigo-300 font-bold flex items-center justify-center text-[10px] shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform"
                          title="Single-Qubit Feature Rotation Gate"
                        >
                          Rz(x{qubitIdx})
                        </div>

                        {/* Layer 3: Entanglement Bridge */}
                        <div 
                          onClick={() => setSelectedGate({ title: 'ZZ Entanglement Unitary', formula: 'U_ZZ = exp(i·(π - x_i)(π - x_j)·Z_i·Z_j)', desc: 'Implements non-linear cross-feature correlation between adjacent network features using CNOT + Rz + CNOT.' })}
                          className="cursor-pointer z-10 w-11 h-9 rounded-lg bg-purple-950 border border-purple-400 text-purple-300 font-bold flex items-center justify-center text-[10px] shadow-lg shadow-purple-500/20 hover:scale-110 transition-transform"
                          title="ZZ Feature Map Entanglement"
                        >
                          ZZ(x{qubitIdx})
                        </div>

                        {/* Layer 4: Variational Ry */}
                        <div 
                          onClick={() => setSelectedGate({ title: `Parameterized Ry(θ_${qubitIdx})`, formula: 'Ry(θ) = exp(-i·θ/2·Y)', desc: `Trainable variational gate optimized via classical COBYLA optimizer to classify network traffic.` })}
                          className="cursor-pointer z-10 w-11 h-9 rounded-lg bg-fuchsia-950 border border-fuchsia-400 text-fuchsia-300 font-bold flex items-center justify-center text-[10px] shadow-lg shadow-fuchsia-500/20 hover:scale-110 transition-transform"
                          title="Variational Parameterized Rotation"
                        >
                          Ry(θ{qubitIdx})
                        </div>

                        {/* Layer 5: Ansatz CX Entanglement */}
                        <div 
                          onClick={() => setSelectedGate({ title: `CNOT Entangler (q${qubitIdx})`, formula: 'CX|a, b⟩ = |a, a ⊕ b⟩', desc: 'Creates quantum entanglement between qubits in the variational ansatz to capture non-linear cyber attack patterns.' })}
                          className="cursor-pointer z-10 w-9 h-9 rounded-lg bg-rose-950 border border-rose-400 text-rose-300 font-bold flex items-center justify-center shadow-lg shadow-rose-500/20 hover:scale-110 transition-transform"
                          title="Controlled-NOT Gate"
                        >
                          CX
                        </div>

                        {/* Layer 6: Measurement */}
                        <div 
                          onClick={() => setSelectedGate({ title: `Measurement in Z-Basis (q${qubitIdx})`, formula: 'M_z = |0⟩⟨0| - |1⟩⟨1|', desc: 'Collapses the quantum state into classical bit string to extract intrusion probabilities.' })}
                          className="cursor-pointer z-10 w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform"
                          title="Measurement Gate"
                        >
                          [M]
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Gate Inspector Card */}
            {selectedGate ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-semibold text-sm text-cyan-300">{selectedGate.title}</h4>
                  </div>
                  <button 
                    onClick={() => setSelectedGate(null)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-2 text-xs font-mono text-purple-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                  Formula: {selectedGate.formula}
                </div>
                <p className="mt-2 text-xs text-gray-300">{selectedGate.desc}</p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-gray-400">
                💡 Tip: Click any gate (H, Rz, ZZ, Ry, CX, [M]) in the pipeline schematic to inspect its quantum mathematical operation.
              </div>
            )}

            {/* Circuit Architecture Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                  <Layers className="w-4 h-4" />
                  <h4 className="font-semibold text-sm text-white">Quantum Feature Map (ZZFeatureMap)</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Transforms classical continuous telemetry (bytes transferred, connection counts) into a high-dimensional Hilbert space ($2^4 = 16$ dimensions). Single-qubit Pauli-Z rotations encode feature magnitudes, while linear CNOT pairs encode non-linear pairwise interactions between features.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center space-x-2 text-purple-400 mb-2">
                  <Cpu className="w-4 h-4" />
                  <h4 className="font-semibold text-sm text-white">Variational Ansatz (RealAmplitudes)</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A parameterized quantum circuit containing 8 trainable rotation angles $\theta_0 \dots \theta_7$. The classical COBYLA optimizer iteratively updates these angles by evaluating the cross-entropy loss against ground truth labels, driving the circuit to separate normal from suspicious network flows.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Qiskit ASCII Raw Render */
          <div className="relative">
            <div className="p-4 rounded-xl bg-[#030712] border border-cyan-500/20 overflow-x-auto">
              <pre className="text-[11px] font-mono leading-tight text-cyan-300/90 whitespace-pre">
                {ascii}
              </pre>
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center font-mono">
              Generated directly from Qiskit 2.6 <code className="text-cyan-400">QuantumCircuit.draw(output='text')</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
