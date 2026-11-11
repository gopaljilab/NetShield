import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ThreatRateIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { statistics, predictionHistory } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate TR from cumulative server stats + session history
  const totalServer = statistics?.total_predictions ?? 0;
  const attackServer = statistics?.attack_predictions ?? 0;
  const normalServer = statistics?.normal_predictions ?? 0;

  // Add session history items if server stats are 0
  const sessionTotal = predictionHistory.length;
  const sessionAttacks = predictionHistory.filter((p) => p.prediction === 1).length;

  const total = totalServer > 0 ? totalServer : sessionTotal;
  const attacks = totalServer > 0 ? attackServer : sessionAttacks;
  const normals = totalServer > 0 ? normalServer : total - attacks;

  const threatRate = total > 0 ? (attacks / total) * 100 : 0;

  // Determine threat severity
  let level: 'LOW' | 'GUARDED' | 'ELEVATED' | 'CRITICAL' = 'LOW';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;

  if (threatRate > 50) {
    level = 'CRITICAL';
    badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/50';
    dotColor = 'bg-rose-500 animate-ping';
    icon = <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
  } else if (threatRate > 30) {
    level = 'ELEVATED';
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  } else if (threatRate > 15) {
    level = 'GUARDED';
    badgeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    dotColor = 'bg-blue-400';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono text-xs cursor-pointer transition-all ${badgeColor}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor.replace('animate-ping', '')}`} />
        </span>

        {icon}

        <span className="font-semibold tracking-wide">
          TR: <span className="text-slate-100">{threatRate.toFixed(1)}%</span>
        </span>

        {!compact && (
          <span className="text-[10px] uppercase font-bold opacity-80 px-1 py-0.5 rounded bg-navy-950/60 border border-current/20">
            {level}
          </span>
        )}
      </div>

      {/* Hover Breakdown Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-navy-900 border border-navy-750 p-3 rounded-xl shadow-2xl z-40 text-xs font-mono space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-navy-800 pb-1.5 text-slate-300 font-sans">
            <span className="font-bold">Threat Ratio (TR)</span>
            <span className="text-[11px] font-bold text-cyan-400">{level}</span>
          </div>

          <div className="space-y-1 text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Total Flows Analyzed:</span>
              <strong className="text-slate-200">{total.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>Attack Flows:</span>
              <strong>{attacks.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Normal Flows:</span>
              <strong>{normals.toLocaleString()}</strong>
            </div>
          </div>

          <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, threatRate)}%` }}
            />
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - threatRate)}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500 leading-tight pt-1 font-sans">
            Calculated as (Attack Flows / Total Flows) × 100% across UNSW-NB15 telemetry.
          </p>
        </div>
      )}
    </div>
  );
};
