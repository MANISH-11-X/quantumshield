import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Zap, 
  ArrowUpRight, 
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function DashboardPage({ setActiveTab }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runQuickBenchmark = async () => {
    try {
      setIsSeeding(true);
      // Run quick sample predictions to populate dashboard analytics
      const sampleRecords = [
        { src_bytes: 450, dst_bytes: 3200, count: 2, srv_count: 2 },
        { src_bytes: 0, dst_bytes: 0, count: 250, srv_count: 140 },
        { src_bytes: 180, dst_bytes: 1250, count: 4, srv_count: 3 },
        { src_bytes: 1032, dst_bytes: 0, count: 420, srv_count: 90 },
        { src_bytes: 2800, dst_bytes: 4100, count: 3, srv_count: 2 },
      ];
      await api.predictThreats({ records: sampleRecords, model_type: 'quantum' });
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to run benchmark:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const summary = dashboardData?.summary || {
    total_analyzed: 0,
    normal_count: 0,
    suspicious_count: 0,
    detection_rate: 0
  };

  const benchmarks = dashboardData?.model_benchmarks || {};
  const classicalMetrics = benchmarks.classical;
  const quantumMetrics = benchmarks.quantum;

  // Donut chart data
  const pieData = [
    { name: 'Normal Traffic', value: summary.normal_count || (summary.total_analyzed === 0 ? 60 : 0), color: '#10B981' },
    { name: 'Suspicious Traffic', value: summary.suspicious_count || (summary.total_analyzed === 0 ? 40 : 0), color: '#EF4444' },
  ];

  // Model comparison bar chart data
  const comparisonChartData = [
    {
      metric: 'Accuracy',
      Classical: classicalMetrics ? Math.round(classicalMetrics.accuracy * 100) : 92,
      Quantum: quantumMetrics ? Math.round(quantumMetrics.accuracy * 100) : 75,
    },
    {
      metric: 'F1-Score',
      Classical: classicalMetrics ? Math.round(classicalMetrics.f1_score * 100) : 93,
      Quantum: quantumMetrics ? Math.round(quantumMetrics.f1_score * 100) : 76,
    },
    {
      metric: 'Precision',
      Classical: classicalMetrics ? Math.round(classicalMetrics.precision * 100) : 88,
      Quantum: quantumMetrics ? Math.round(quantumMetrics.precision * 100) : 84,
    },
    {
      metric: 'Recall',
      Classical: classicalMetrics ? Math.round(classicalMetrics.recall * 100) : 100,
      Quantum: quantumMetrics ? Math.round(quantumMetrics.recall * 100) : 70,
    },
  ];

  const recent = dashboardData?.recent_predictions || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-purple-950/60 border border-cyan-500/25 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>IBM Qiskit Fall Fest 2026 • Live Hybrid QML Evaluation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Next-Generation Cyber Defense Powered by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
              Quantum Machine Learning
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
            QuantumShield benchmarks classical statistical classification against parameterized variational quantum circuits (VQC) executing on IBM Qiskit Aer simulators to identify anomalous network intrusion patterns with mathematical rigor.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('detection')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Upload Traffic CSV</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('quantum')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-sm transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Inspect Quantum Circuit</span>
            </button>
            {summary.total_analyzed === 0 && (
              <button
                onClick={runQuickBenchmark}
                disabled={isSeeding}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 text-xs font-mono transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>{isSeeding ? 'Executing Qiskit Simulation...' : 'Simulate Sample Traffic'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-48 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Traffic Analyzed"
          value={summary.total_analyzed.toLocaleString()}
          subtitle="Packets / Flows Processed"
          icon={Activity}
          color="cyan"
          badge="Live Feed"
        />
        <StatCard
          title="Normal Traffic"
          value={summary.normal_count.toLocaleString()}
          subtitle="Legitimate Network Packets"
          icon={ShieldCheck}
          color="green"
          badge={summary.total_analyzed > 0 ? `${Math.round((summary.normal_count / summary.total_analyzed) * 100)}%` : 'Active'}
        />
        <StatCard
          title="Suspicious Traffic"
          value={summary.suspicious_count.toLocaleString()}
          subtitle="Potential Intrusion Vectors"
          icon={ShieldAlert}
          color="red"
          badge={summary.total_analyzed > 0 ? `${Math.round((summary.suspicious_count / summary.total_analyzed) * 100)}%` : 'Alert'}
        />
        <StatCard
          title="Threat Detection Rate"
          value={`${summary.detection_rate}%`}
          subtitle="Identified Attack Ratio"
          icon={Zap}
          color="purple"
          badge="QML Pipeline"
        />
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Traffic Classification Breakdown */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Traffic Classification Ratio</h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                {summary.total_analyzed > 0 ? 'Live Ingestion' : 'Benchmark State'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Normal vs Suspicious telemetry distribution</p>
          </div>

          <div className="h-64 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#080D1C" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-white">
                {summary.total_analyzed > 0 ? summary.total_analyzed : '100'}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Flows</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="truncate">
                <span className="text-gray-400 block">Normal</span>
                <span className="font-mono font-bold text-emerald-400">{summary.normal_count}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="truncate">
                <span className="text-gray-400 block">Suspicious</span>
                <span className="font-mono font-bold text-rose-400">{summary.suspicious_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart: Classical vs Quantum Performance */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Classical vs Quantum Model Performance</h3>
              <p className="text-xs text-gray-400 mt-1">
                Comparative metrics on identical 40-sample NSL-KDD benchmark test set
              </p>
            </div>
            <button
              onClick={() => setActiveTab('comparison')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
            >
              <span>Full Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Classical" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={22} name="Classical Logistic Regression" />
                <Bar dataKey="Quantum" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={22} name="Qiskit 4-Qubit VQC" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs text-gray-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Quantum Simulator: StatevectorSampler V2</span>
            </div>
            <div className="text-cyan-400">
              Ansatz: RealAmplitudes (8 params)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Recent Prediction Results</h3>
            <p className="text-xs text-gray-400 mt-1">Live record classification log from user uploads and evaluations</p>
          </div>
          <button
            onClick={() => setActiveTab('detection')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
          >
            Launch Batch Scan →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-gray-400 mb-3">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Predictions Recorded Yet</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              Upload a network traffic CSV in the Threat Detection module or run a simulation to see live packet telemetry classifications.
            </p>
            <button
              onClick={runQuickBenchmark}
              disabled={isSeeding}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow transition-all"
            >
              {isSeeding ? 'Processing...' : 'Run Quick Sample Scan'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-gray-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Record ID</th>
                  <th className="py-3.5 px-6">Model Used</th>
                  <th className="py-3.5 px-6">Src / Dst Bytes</th>
                  <th className="py-3.5 px-6">Classification</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-gray-300">
                {recent.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-6 text-cyan-300 font-semibold">{rec.record_id}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        rec.model_used.includes('Quantum') 
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' 
                          : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                      }`}>
                        {rec.model_used}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-400">
                      {rec.src_bytes}B / {rec.dst_bytes}B
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'SUSPICIOUS' 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rec.status === 'SUSPICIOUS' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full ${rec.status === 'SUSPICIOUS' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.round((rec.confidence || 0.8) * 100)}%` }} 
                          />
                        </div>
                        <span>{Math.round((rec.confidence || 0.8) * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-500">{rec.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
