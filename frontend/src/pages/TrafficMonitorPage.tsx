import React, { useState } from 'react';
import {
  Activity,
  Play,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_FLOWS, SampleFlowPreset } from '../utils/sampleFlows';
import { apiClient } from '../api/client';
import { formatDurationMs, formatTimestamp, formatBytes } from '../utils/formatters';
import { SkeletonTable } from '../components/common/Skeleton';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { exportToCsv } from '../utils/exportHelpers';

interface TrafficMonitorPageProps {
  onNavigateToPlayground: () => void;
}

export const TrafficMonitorPage: React.FC<TrafficMonitorPageProps> = ({ onNavigateToPlayground }) => {
  const { predictionHistory, addPredictionToHistory, clearHistory, selectedModel, refreshData, isRefreshing } = useApp();
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'attack'>('all');
  const [submittingPreset, setSubmittingPreset] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleRunPreset = async (preset: SampleFlowPreset) => {
    setSubmittingPreset(preset.id);
    try {
      toast.info(`Evaluating sample flow (${preset.name}) with ${selectedModel.toUpperCase()}...`, 'Telemetry Ingestion');
      const response = await apiClient.predict(preset.flow, selectedModel);
      addPredictionToHistory({
        id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: response.timestamp,
        prediction: response.prediction,
        label: response.label,
        probability: response.probability,
        model_used: response.model_used,
        flowSummary: {
          proto: preset.flow.proto,
          service: preset.flow.service,
          state: preset.flow.state,
          sbytes: preset.flow.sbytes,
          dbytes: preset.flow.dbytes,
          dur: preset.flow.dur,
        },
        durations: {
          preprocessing_ms: response.preprocessing_duration_ms,
          inference_ms: response.inference_duration_ms,
          total_ms: response.total_duration_ms,
        },
        source: 'sample',
      });

      if (response.label === 'Attack') {
        toast.warning(`Flagged Attack: ${preset.name} (${(response.probability ? response.probability * 100 : 90).toFixed(1)}% conf)`, 'Threat Detected');
      } else {
        toast.success(`Normal Flow Ingested: ${preset.name}`, 'Telemetry Verified');
      }

      refreshData();
    } catch (err) {
      toast.error('Failed to submit sample flow to backend', 'Inference Error');
      console.error('Failed to submit sample flow:', err);
    } finally {
      setSubmittingPreset(null);
    }
  };

  const filteredHistory = predictionHistory.filter((item) => {
    if (activeFilter === 'normal') return item.prediction === 0;
    if (activeFilter === 'attack') return item.prediction === 1;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-100">Live Flow Evaluation Stream</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Telemetry ingestion stream observing feature vectors from the <strong>UNSW-NB15</strong> feature set.
            Submit verified benchmark flows or enter custom telemetry in the Prediction Playground to evaluate classification latency and confidence.
          </p>
        </div>

        {/* Quick Test Presets Panel */}
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Inject Verified Benchmark Flows
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                4 Presets Available
              </span>
            </div>

            <button
              onClick={onNavigateToPlayground}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Playground</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_FLOWS.map((preset) => {
              const isRunning = submittingPreset === preset.id;
              const isAttack = preset.category === 'Attack';
              return (
                <div
                  key={preset.id}
                  className="bg-navy-950/60 border border-navy-800 rounded-lg p-3.5 space-y-2.5 flex flex-col justify-between hover:border-navy-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{preset.name}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                          isAttack
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{preset.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      {preset.flow.proto} • {preset.flow.service} • {preset.flow.sbytes}B
                    </div>
                  </div>

                  <button
                    onClick={() => handleRunPreset(preset)}
                    disabled={isRunning}
                    className="w-full py-1.5 px-3 bg-navy-800 hover:bg-navy-750 text-cyan-300 text-xs font-medium rounded flex items-center justify-center gap-1.5 border border-navy-700 transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Evaluating...' : 'Inject Flow'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Stream Events Table */}
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Flow Evaluation Stream</h3>
              <span className="text-xs font-mono text-cyan-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                {filteredHistory.length} Event(s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === 'all' ? 'bg-navy-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('normal')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === 'normal' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setActiveFilter('attack')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeFilter === 'attack' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Attacks
                </button>
              </div>

              {/* Export Button */}
              {predictionHistory.length > 0 && (
                <button
                  onClick={() => {
                    exportToCsv(predictionHistory, 'netshield_telemetry_stream.csv');
                    toast.success(`Exported ${predictionHistory.length} flows to CSV`, 'Export Complete');
                  }}
                  className="px-2.5 py-1.5 bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                  title="Export telemetry stream to CSV"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              )}

              {/* Clear button with ConfirmModal protection */}
              {predictionHistory.length > 0 && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 p-2 rounded-lg hover:bg-navy-800 transition-colors"
                  title="Clear frontend session history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {isRefreshing ? (
            <SkeletonTable rows={5} columns={8} />
          ) : filteredHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-navy-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-navy-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Timestamp</th>
                    <th className="px-3.5 py-2.5">Classification</th>
                    <th className="px-3.5 py-2.5">Attack Probability</th>
                    <th className="px-3.5 py-2.5">Protocol / Service / State</th>
                    <th className="px-3.5 py-2.5">Duration</th>
                    <th className="px-3.5 py-2.5">Volume (Tx/Rx)</th>
                    <th className="px-3.5 py-2.5">Model Engine</th>
                    <th className="px-3.5 py-2.5">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {filteredHistory.map((item) => {
                    const isAttack = item.prediction === 1;
                    return (
                      <tr key={item.id} className="hover:bg-navy-850/50 transition-colors">
                        <td className="px-3.5 py-2.5 text-slate-400">{formatTimestamp(item.timestamp)}</td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isAttack
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isAttack ? (
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>{item.label}</span>
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          {item.probability !== null ? (
                            <div className="flex items-center gap-2">
                              <span className={item.probability > 0.5 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                                {(item.probability * 100).toFixed(1)}%
                              </span>
                              <div className="w-12 bg-navy-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${item.probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${item.probability * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A (SVC)</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="text-slate-200">{item.flowSummary.proto}</span>
                          <span className="text-slate-400"> / {item.flowSummary.service} / {item.flowSummary.state}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-400">{item.flowSummary.dur.toFixed(4)}s</td>
                        <td className="px-3.5 py-2.5 text-slate-300">
                          {formatBytes(item.flowSummary.sbytes)} / {formatBytes(item.flowSummary.dbytes)}
                        </td>
                        <td className="px-3.5 py-2.5 text-cyan-300 font-semibold uppercase">{item.model_used}</td>
                        <td className="px-3.5 py-2.5 text-slate-400">{formatDurationMs(item.durations.total_ms)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-mono space-y-2">
              <Info className="w-6 h-6 mx-auto text-slate-400" />
              <p>No telemetry flow events matching filter "{activeFilter}".</p>
              <p className="text-[11px] text-slate-400">
                Click any of the benchmark flow buttons above to evaluate traffic patterns.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Destructive Clear Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          clearHistory();
          toast.warning('Session traffic history cleared', 'History Cleared');
        }}
        title="Clear Traffic Stream History?"
        description="This will clear all ingested flow events from your active browser session."
        confirmText="Clear History"
        variant="warning"
      />
    </>
  );
};
