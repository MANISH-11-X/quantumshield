import React from 'react';
import { Menu, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, onRefresh, isRefreshing, onOpenMobile }) {
  const titles = {
    dashboard: 'Mission Control Dashboard',
    detection: 'Threat Detection & CSV Analysis',
    quantum: 'Quantum Machine Learning Lab',
    comparison: 'Classical vs Quantum Benchmarks',
    dataset: 'NSL-KDD Dataset Explorer',
    about: 'System Architecture & Hackathon Info',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#080D1C]/80 backdrop-blur-md border-b border-cyan-500/15 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-gray-300 hover:text-white border border-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{titles[activeTab] || 'QuantumShield'}</span>
            </h1>
            <p className="text-xs text-cyan-400/80 font-mono hidden sm:block">
              Network Intrusion Analysis • NSL-KDD Standard • 4-Qubit VQC
            </p>
          </div>
        </div>

        {/* Right: Quick Indicators & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Qiskit VQC Active</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-mono text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hybrid Pipeline Ready</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all duration-200"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
