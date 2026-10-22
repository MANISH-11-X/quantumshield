import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ThreatDetectionPage from './pages/ThreatDetectionPage';
import QuantumMLPage from './pages/QuantumMLPage';
import ComparisonPage from './pages/ComparisonPage';
import DatasetExplorerPage from './pages/DatasetExplorerPage';
import AboutPage from './pages/AboutPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Ping backend health
  const checkHealth = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.getHealth();
      if (res && res.status === 'healthy') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080D1C] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area (offset by 64 = 16rem for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onRefresh={checkHealth}
          isRefreshing={isRefreshing}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'detection' && <ThreatDetectionPage />}
          {activeTab === 'quantum' && <QuantumMLPage />}
          {activeTab === 'comparison' && <ComparisonPage />}
          {activeTab === 'dataset' && <DatasetExplorerPage />}
          {activeTab === 'about' && <AboutPage />}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 px-6 py-4 bg-[#080D1C]/90 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-semibold">QuantumShield v1.0.0</span>
            <span>•</span>
            <span>IBM Qiskit Fall Fest 2026</span>
          </div>
          <div>
            Built with IBM Qiskit, Qiskit ML, Aer Simulator, and Scikit-Learn
          </div>
        </footer>
      </div>
    </div>
  );
}
