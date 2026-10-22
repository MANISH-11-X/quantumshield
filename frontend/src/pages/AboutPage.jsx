import React from 'react';
import { 
  Shield, 
  Atom, 
  Cpu, 
  Terminal, 
  Award, 
  Layers, 
  ExternalLink, 
  AlertTriangle,
  FileCode2,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Award className="w-4 h-4 text-purple-400" />
          <span>IBM Qiskit Fall Fest 2026 • Track: Quantum + AI & ML</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
            QuantumShield
          </span>
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          AI-Powered Cyber Threat Detection Using Hybrid Quantum-Classical Machine Learning.
          Demonstrating practical, genuine IBM Qiskit quantum circuit execution for network security.
        </p>
      </div>

      {/* Project Objective & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2.5 text-cyan-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">The Cybersecurity Challenge</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Modern cyber attacks—from distributed denial-of-service (DDoS) syn floods to covert port scans—generate high-volume, non-linear telemetry flows. Conventional rule-based detection systems struggle to generalize across zero-day variations, while deep neural networks require vast parameters and prone to adversarial spoofing.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2.5 text-purple-400">
            <Atom className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">The Hybrid Quantum Solution</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            QuantumShield harnesses quantum state superposition and entanglement. By mapping normalized network flows onto a 4-qubit parameterized quantum circuit using IBM Qiskit's ZZFeatureMap and RealAmplitudes ansatz, the model projects low-dimensional data into an exponentially expressive 16-dimensional complex Hilbert space.
          </p>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>End-to-End System Architecture</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Dual-pipeline quantum-classical classification engine</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <span>01. Ingestion</span>
            </div>
            <p className="text-[11px] text-gray-400">
              NSL-KDD CSV telemetry ingestion with 41 raw features (byte volumes, connection frequencies).
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-purple-400 font-bold flex items-center space-x-1.5">
              <span>02. Preprocessing</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Log1p byte compression, missing value handling, and MinMaxScaler projection into [0, π].
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-2">
            <div className="text-purple-300 font-bold flex items-center space-x-1.5">
              <span>03. Dual Engines</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Classical Logistic Regression vs Qiskit 4-Qubit VQC with ZZFeatureMap & RealAmplitudes.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
            <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
              <span>04. Output & Metrics</span>
            </div>
            <p className="text-[11px] text-gray-400">
              NORMAL / SUSPICIOUS verdict, confidence scores, runtime latency, and comparative metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>Technology Stack Specifications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h4 className="font-bold text-cyan-400 text-sm">Quantum Computing</h4>
            <ul className="space-y-2 font-mono text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>IBM Qiskit 2.6.0</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qiskit Machine Learning 0.9.1</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qiskit Aer Simulator 0.18.0</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>StatevectorSampler Primitive V2</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h4 className="font-bold text-purple-400 text-sm">Backend & ML Pipeline</h4>
            <ul className="space-y-2 font-mono text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Python 3.14 (ABI3)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Flask 3.1 & Flask-CORS</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Scikit-Learn 1.9 & SciPy</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Pandas, NumPy, Joblib</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h4 className="font-bold text-blue-400 text-sm">Frontend Dashboard</h4>
            <ul className="space-y-2 font-mono text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>React 19 & Vite 8</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Tailwind CSS v4</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Recharts Data Visualizations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Lucide React Cyber Icons</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="rounded-2xl p-6 bg-yellow-950/20 border border-yellow-500/30 backdrop-blur-xl flex items-start space-x-4">
        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs text-yellow-200">
          <h4 className="font-bold text-white text-sm">Research Prototype Disclaimer</h4>
          <p className="text-gray-300 leading-relaxed">
            QuantumShield is a research prototype and academic proof-of-concept developed specifically for the <strong>IBM Qiskit Fall Fest 2026 Hackathon</strong>. It is designed to evaluate hybrid quantum-classical machine learning architectures on benchmark cybersecurity datasets. This software is not intended to serve as a production intrusion prevention system (IPS) or commercial firewall without formal fault-tolerant quantum hardware verification.
          </p>
        </div>
      </div>
    </div>
  );
}
