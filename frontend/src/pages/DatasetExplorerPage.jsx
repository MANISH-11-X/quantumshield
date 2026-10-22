import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  Download, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../services/api';

export default function DatasetExplorerPage() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function loadInfo() {
      try {
        setLoading(true);
        const data = await api.getDatasetInfo();
        setDatasetInfo(data);
      } catch (err) {
        console.error('Failed to load dataset info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  const features = datasetInfo?.feature_descriptions || [];
  const previewRows = datasetInfo?.preview_rows || [];
  const labelDist = datasetInfo?.label_distribution || {};

  // Color palette for attack types
  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6', '#84CC16'];
  const distChartData = Object.entries(labelDist).map(([name, value], idx) => ({
    name,
    value,
    color: COLORS[idx % COLORS.length]
  }));

  const filteredPreview = previewRows.filter(r => {
    if (!searchTerm) return true;
    return (
      (r.protocol_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pageSize = 5;
  const paginatedRows = filteredPreview.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredPreview.length / pageSize);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>CYBERSECURITY BENCHMARK DATASET</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">NSL-KDD Dataset Explorer</h2>
          <p className="text-sm text-gray-400 mt-1">
            Standard intrusion detection benchmark with 41 network traffic telemetry attributes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://www.unb.ca/cic/datasets/nsl.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-700 text-xs font-mono transition-all"
          >
            <span>Official UNB CIC Archive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={api.getSampleDownloadUrl()}
            download
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Demo CSV</span>
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl">
          <span className="text-xs uppercase font-mono text-cyan-400">Total Training Records</span>
          <p className="text-3xl font-extrabold font-mono text-white mt-2">
            {datasetInfo?.total_train_records || 400}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Balanced network flow sessions</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <span className="text-xs uppercase font-mono text-purple-400">Test Evaluation Partition</span>
          <p className="text-3xl font-extrabold font-mono text-white mt-2">
            {datasetInfo?.total_test_records || 120}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Identical test sets for classical & quantum</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl">
          <span className="text-xs uppercase font-mono text-emerald-400">Selected Qubit Features</span>
          <p className="text-3xl font-extrabold font-mono text-white mt-2">4 Features</p>
          <span className="text-xs text-gray-400 mt-1 block font-mono text-[11px]">
            src_bytes, dst_bytes, count, srv_count
          </span>
        </div>
      </div>

      {/* Dataset Distribution & Preprocessing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution Donut */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Traffic Label Breakdown</h3>
            <p className="text-xs text-gray-400 mt-1">Normal connections vs specific attack vectors</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {distChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#080D1C" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800 text-[11px] font-mono">
            {distChartData.map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-gray-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name}: {d.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Preprocessing Pipeline Walkthrough */}
        <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Preprocessing Pipeline</h3>
            <p className="text-xs text-gray-400 mt-1">Transforming raw network packets for Quantum ML</p>
          </div>

          <div className="my-4 space-y-3 font-mono text-xs">
            {(datasetInfo?.preprocessing_steps || []).map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200">
            Quantum Mapping: Features x_i scaled to [0, π] rotate the qubit state via Rz(2·x_i) on the Bloch sphere equator.
          </div>
        </div>
      </div>

      {/* Feature Columns Explanation Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">Key Feature Attribute Dictionary</h3>
          <p className="text-xs text-gray-400 mt-1">Selected telemetry variables and their cybersecurity significance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-gray-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Feature Name</th>
                <th className="py-3.5 px-6">Data Type</th>
                <th className="py-3.5 px-6">Model Scope</th>
                <th className="py-3.5 px-6">Cybersecurity Relevance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-gray-300">
              {features.map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-6 text-cyan-300 font-bold">{f.name}</td>
                  <td className="py-3.5 px-6 text-gray-400">{f.type}</td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      f.role.includes('Quantum')
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-gray-400'
                    }`}>
                      {f.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-gray-300">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Rows Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Dataset Preview Sample</h3>
            <p className="text-xs text-gray-400 mt-0.5">Explore raw feature columns from the bundled training set</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by protocol or label..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-gray-400 px-2">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-gray-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6">Label</th>
                <th className="py-3 px-6">Protocol</th>
                <th className="py-3 px-6">Service</th>
                <th className="py-3 px-6">Flag</th>
                <th className="py-3 px-6">Src Bytes</th>
                <th className="py-3 px-6">Dst Bytes</th>
                <th className="py-3 px-6">Count</th>
                <th className="py-3 px-6">Srv Count</th>
                <th className="py-3 px-6">SError Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-gray-300">
              {paginatedRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.label === 'normal' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {r.label === 'normal' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      <span>{r.label}</span>
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-400">{r.protocol_type}</td>
                  <td className="py-3 px-6 text-cyan-300">{r.service}</td>
                  <td className="py-3 px-6 text-gray-400">{r.flag}</td>
                  <td className="py-3 px-6">{r.src_bytes} B</td>
                  <td className="py-3 px-6">{r.dst_bytes} B</td>
                  <td className="py-3 px-6">{r.count}</td>
                  <td className="py-3 px-6">{r.srv_count}</td>
                  <td className="py-3 px-6 text-gray-400">{r.serror_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
