import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, Cpu, Info, Zap } from 'lucide-react';
import { PredictionResponse } from '../../types/api';
import { formatDurationMs, formatPercent } from '../../utils/formatters';

interface PredictionResultCardProps {
  result: PredictionResponse;
  flowDetails?: Record<string, unknown>;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  flowDetails,
}) => {
  const isAttack = result.prediction === 1;

  return (
    <div
      className={`rounded-xl border p-6 backdrop-blur-md shadow-2xl transition-all ${
        isAttack
          ? 'bg-rose-950/20 border-rose-500/40 shadow-glow-red'
          : 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-green'
      }`}
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              isAttack
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {isAttack ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Classification Decision
            </span>
            <h3
              className={`text-2xl font-bold font-mono tracking-tight ${
                isAttack ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {result.label.toUpperCase()} TRAFFIC DETECTED
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-750 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Model: <strong className="text-cyan-300">{result.model_used}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-750 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Middle: Attack Probability Gauge & Timing Instrumentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Probability Score */}
        <div className="bg-navy-900/80 border border-navy-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Attack Probability Estimate</span>
            <span className="font-mono font-bold text-slate-200">
              {result.probability !== null ? formatPercent(result.probability * 100) : 'Not Applicable (Linear Margin)'}
            </span>
          </div>
          {result.probability !== null ? (
            <div>
              <div className="h-3 w-full bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, result.probability * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>0.0 (Definite Normal)</span>
                <span>Threshold: 0.5</span>
                <span>1.0 (Definite Attack)</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Linear SVC uses a maximum-margin hyperplane without calibrated posterior class probabilities.
            </p>
          )}
        </div>

        {/* Latency Instrumentation */}
        <div className="bg-navy-900/80 border border-navy-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pipeline Latency Instrumentation</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800/80">
              <span className="text-[10px] text-slate-400 block">Preprocessing</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {formatDurationMs(result.preprocessing_duration_ms)}
              </span>
            </div>
            <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800/80">
              <span className="text-[10px] text-slate-400 block">Inference</span>
              <span className="text-xs font-mono font-bold text-purple-300">
                {formatDurationMs(result.inference_duration_ms)}
              </span>
            </div>
            <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800/80">
              <span className="text-[10px] text-slate-400 block">Total Latency</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {formatDurationMs(result.total_duration_ms)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Details Preview if passed */}
      {flowDetails && (
        <div className="bg-navy-950/60 border border-navy-800/80 p-3 rounded-lg text-xs font-mono mb-4">
          <span className="text-slate-400 block mb-1 font-sans text-[11px] uppercase tracking-wider">
            Key Evaluated Telemetry:
          </span>
          <div className="flex flex-wrap gap-2 text-slate-300">
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              Proto: <strong className="text-cyan-300">{String(flowDetails.proto || '-')}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              Service: <strong className="text-cyan-300">{String(flowDetails.service || '-')}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              State: <strong className="text-cyan-300">{String(flowDetails.state || '-')}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              Duration: <strong className="text-slate-200">{Number(flowDetails.dur || 0).toFixed(4)}s</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              Src Bytes: <strong className="text-slate-200">{Number(flowDetails.sbytes || 0)}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-750">
              Rate: <strong className="text-slate-200">{Number(flowDetails.rate || 0).toFixed(1)} pkts/s</strong>
            </span>
          </div>
        </div>
      )}

      {/* Defensive Disclaimer */}
      <div className="flex items-start gap-2 pt-3 border-t border-navy-800/80 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Defensive Research Notice:</strong> Machine learning inference outputs represent statistical anomaly classifications derived from the UNSW-NB15 benchmark. An attack prediction does not constitute confirmed adversarial activity on a production network.
        </p>
      </div>
    </div>
  );
};
