import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', badge }) {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      textGlow: 'text-cyan-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'shadow-purple-500/10 hover:shadow-purple-500/20',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      textGlow: 'text-purple-400',
    },
    green: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      textGlow: 'text-emerald-400',
    },
    red: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      glow: 'shadow-rose-500/10 hover:shadow-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      textGlow: 'text-rose-400',
    },
  }[color];

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border
      transition-all duration-300 shadow-xl ${colorStyles.border} ${colorStyles.glow}
    `}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{value}</span>
        {badge && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-gray-300 font-mono border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-400 truncate">{subtitle}</p>
      )}

      {/* Decorative background glow circle */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none ${colorStyles.iconBg}`} />
    </div>
  );
}
