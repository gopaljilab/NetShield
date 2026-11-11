import React from 'react';
import { ShieldAlert, Terminal, ArrowLeft, Search } from 'lucide-react';

export const Cyber404: React.FC<{
  onReturnToDashboard: () => void;
  onOpenCommandPalette: () => void;
}> = ({ onReturnToDashboard, onOpenCommandPalette }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-lg mx-auto animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-950/80">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
          404
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 uppercase">
          Packet Dropped • Route Not Found
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          The requested telemetry endpoint or UI view is not mapped in the NetShield routing table. The connection was terminated at the gateway.
        </p>
      </div>

      {/* Terminal Trace simulation */}
      <div className="w-full bg-navy-950/90 border border-navy-800 rounded-xl p-3.5 text-left font-mono text-[11px] text-slate-400 space-y-1 shadow-inner">
        <div className="flex items-center gap-2 text-cyan-400 border-b border-navy-800 pb-1.5 text-[10px]">
          <Terminal className="w-3.5 h-3.5" />
          <span>NETSHIELD TRACE ROUTE</span>
        </div>
        <div className="text-slate-500">1  127.0.0.1  0.12ms  [GATEWAY_OK]</div>
        <div className="text-slate-500">2  192.168.0.1  0.45ms  [CORE_ROUTER]</div>
        <div className="text-rose-400 font-bold">3  * * *  DESTINATION_UNREACHABLE (404)</div>
      </div>

      {/* Quick Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReturnToDashboard}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-glow-cyan transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to SOC Dashboard</span>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="px-3.5 py-2 bg-navy-900 hover:bg-navy-850 text-slate-200 border border-navy-750 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Command Palette (⌘K)</span>
        </button>
      </div>
    </div>
  );
};
