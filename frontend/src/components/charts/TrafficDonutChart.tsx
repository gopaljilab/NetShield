import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Play, Shield } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface TrafficDonutChartProps {
  normalCount: number;
  attackCount: number;
  onRunSample?: () => void;
  isSampleRunning?: boolean;
}

export const TrafficDonutChart: React.FC<TrafficDonutChartProps> = ({
  normalCount,
  attackCount,
  onRunSample,
  isSampleRunning,
}) => {
  const total = normalCount + attackCount;

  if (total === 0) {
    return (
      <div className="min-h-[290px] h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-navy-800 rounded-xl bg-navy-950/40">
        <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/30 bg-navy-900/80 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative">
          <Shield className="w-7 h-7 text-cyan-400/80" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400/60 animate-ping" />
        </div>
        <p className="text-sm font-semibold text-slate-200">Awaiting Traffic Telemetry</p>
        <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
          Ingest network packets to visualize normal vs. anomalous threat breakdown.
        </p>

        {onRunSample && (
          <button
            onClick={onRunSample}
            disabled={isSampleRunning}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${isSampleRunning ? 'animate-spin' : ''}`} />
            <span>{isSampleRunning ? 'Evaluating...' : 'Inject Test Flow'}</span>
          </button>
        )}
      </div>
    );
  }

  const data = [
    { name: 'Normal Traffic', value: normalCount, color: '#10B981' },
    { name: 'Attack Traffic', value: attackCount, color: '#EF4444' },
  ];

  const normalPct = ((normalCount / total) * 100).toFixed(1);
  const attackPct = ((attackCount / total) * 100).toFixed(1);

  return (
    <div className="flex flex-col justify-between h-full pt-1 pb-2">
      <div className="h-48 sm:h-52 relative my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const percent = ((Number(item.value) / total) * 100).toFixed(1);
                  return (
                    <div className="bg-navy-950 border border-navy-750 px-3 py-2 rounded-lg shadow-xl text-xs font-mono">
                      <p className="text-slate-300 font-semibold">{item.name}</p>
                      <p style={{ color: item.payload.color }}>
                        {formatNumber(Number(item.value))} flows ({percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-slate-100">{formatNumber(total)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Flows</span>
        </div>
      </div>

      {/* Legend with structured card pill and bottom breathing room */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3 pt-2.5 pb-2.5 px-3 border border-navy-800/80 bg-navy-950/50 rounded-lg shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="text-xs">
            <p className="text-slate-400 text-[11px]">Normal</p>
            <p className="font-mono font-semibold text-slate-100">
              {formatNumber(normalCount)} <span className="text-slate-400 font-normal text-[11px]">({normalPct}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <div className="text-xs">
            <p className="text-slate-400 text-[11px]">Attack</p>
            <p className="font-mono font-semibold text-rose-300">
              {formatNumber(attackCount)} <span className="text-rose-400/80 font-normal text-[11px]">({attackPct}%)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
