import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Atom, 
  Scale, 
  Database, 
  Info,
  Shield, 
  Activity,
  Zap,
  X
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'detection', label: 'Threat Detection', icon: ShieldAlert },
  { id: 'quantum', label: 'Quantum ML', icon: Atom },
  { id: 'comparison', label: 'Model Comparison', icon: Scale },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab, backendStatus, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#080D1C]/90 backdrop-blur-xl border-r border-cyan-500/20
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-cyan-500/15 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#080D1C] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-wider text-white">QUANTUM</span>
                <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  SHIELD
                </span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Hybrid QML Defense</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Badge */}
        <div className="px-6 py-3">
          <div className="rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/30 border border-purple-500/30 p-2.5">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 animate-pulse" />
              <div className="overflow-hidden">
                <p className="text-[11px] font-semibold text-purple-200">IBM Qiskit Fall Fest 2026</p>
                <p className="text-[10px] text-gray-400 truncate">Quantum + AI & ML Track</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40 border border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-cyan-400 scale-110' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Status Footer */}
        <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Engine Status</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-rose-500 shadow-[0_0_8px_#EF4444]'}`} />
              <span className={`text-[10px] font-mono font-medium ${backendStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {backendStatus === 'online' ? 'ONLINE' : 'CONNECTING'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Qiskit Core:</span>
              <span className="text-cyan-400">2.6.0</span>
            </div>
            <div className="flex justify-between">
              <span>Simulator:</span>
              <span className="text-purple-400">Aer / Statevector</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
