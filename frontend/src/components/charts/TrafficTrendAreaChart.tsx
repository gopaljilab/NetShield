import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Play, Zap, Activity } from 'lucide-react';
import { PredictionHistoryItem } from '../../types/flow';
import { formatTimestamp } from '../../utils/formatters';

interface TrafficTrendAreaChartProps {
  history: PredictionHistoryItem[];
  onRunSample?: () => void;
  onLoadTestData?: () => void;
  isSampleRunning?: boolean;
}

export const TrafficTrendAreaChart: React.FC<TrafficTrendAreaChartProps> = ({
  history,
  onRunSample,
  onLoadTestData,
  isSampleRunning,
}) => {
  if (history.length === 0) {
    return (
      <div className="min-h-[290px] h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-navy-800 rounded-xl bg-navy-950/40">
        <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-750 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-200">No Stream Activity Recorded</p>
        <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
          End-to-end response times and latency jitter will automatically plot here as flows are classified.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          {onRunSample && (
            <button
              onClick={onRunSample}
              disabled={isSampleRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50"
            >
              <Play className={`w-3 h-3 ${isSampleRunning ? 'animate-spin' : ''}`} />
              <span>{isSampleRunning ? 'Running...' : 'Run Single Flow'}</span>
            </button>
          )}

          {onLoadTestData && (
            <button
              onClick={onLoadTestData}
              disabled={isSampleRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Load 5 Test Flows</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Take up to 20 most recent items in chronological order
  const data = [...history]
    .reverse()
    .slice(-20)
    .map((item, idx) => ({
      index: idx + 1,
      time: formatTimestamp(item.timestamp),
      label: item.label,
      latency: item.durations.total_ms,
      sbytes: item.flowSummary.sbytes,
      probability: item.probability !== null ? Math.round(item.probability * 100) : null,
      isAttack: item.prediction === 1,
    }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit="ms" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-navy-950 border border-navy-750 px-3 py-2 rounded-lg shadow-xl text-xs font-mono">
                    <p className="text-slate-300">{item.time}</p>
                    <p className={`font-semibold mt-1 ${item.isAttack ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Class: {item.label} {item.probability !== null ? `(${item.probability}%)` : ''}
                    </p>
                    <p className="text-cyan-400">Total Latency: {item.latency.toFixed(2)} ms</p>
                    <p className="text-slate-400">Volume: {item.sbytes} bytes</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#latencyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
