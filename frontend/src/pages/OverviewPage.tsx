import React from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Server,
  Zap,
  ArrowUpRight,
  Sliders,
  History,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { SkeletonCard, SkeletonChart } from '../components/common/Skeleton';
import { TrafficDonutChart } from '../components/charts/TrafficDonutChart';
import { TrafficTrendAreaChart } from '../components/charts/TrafficTrendAreaChart';
import { formatNumber, formatUptime, formatDurationMs, formatTimestamp } from '../utils/formatters';

interface OverviewPageProps {
  onNavigateToPlayground: () => void;
  onNavigateToDetections: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigateToPlayground,
  onNavigateToDetections,
}) => {
  const {
    statistics,
    health,
    selectedModel,
    predictionHistory,
    connectionStatus,
    pingLatency,
    isRefreshing,
    runSampleFlow,
    isSampleRunning,
  } = useApp();

  const totalFlows = statistics?.total_predictions ?? 0;
  const normalFlows = statistics?.normal_predictions ?? 0;
  const attackFlows = statistics?.attack_predictions ?? 0;
  const uptime = statistics?.uptime_seconds ?? health?.uptime_seconds ?? 0;

  const attackRatio = totalFlows > 0 ? ((attackFlows / totalFlows) * 100).toFixed(1) : '0.0';

  if (!statistics && isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonChart height={280} />
          </div>
          <div>
            <SkeletonChart height={280} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Flows Ingested"
          value={formatNumber(totalFlows)}
          subtitle="Cumulative runtime predictions"
          icon={Activity}
          variant="cyan"
          badge={{ text: 'Real API Telemetry', type: 'info' }}
        />

        <MetricCard
          title="Normal Traffic"
          value={formatNumber(normalFlows)}
          subtitle={
            totalFlows > 0
              ? `${(100 - parseFloat(attackRatio)).toFixed(1)}% verified benign traffic`
              : '0.0% of analyzed traffic (Awaiting flows)'
          }
          icon={ShieldCheck}
          variant="green"
        />

        <MetricCard
          title="Detected Attacks"
          value={formatNumber(attackFlows)}
          subtitle={
            totalFlows > 0
              ? `${attackRatio}% anomalous traffic detected`
              : '0.0% anomalous traffic (Clean traffic)'
          }
          icon={ShieldAlert}
          variant="red"
          badge={attackFlows > 0 ? { text: `${attackFlows} Anomaly Hits`, type: 'negative' } : undefined}
        />

        <MetricCard
          title="Active Engine & Health"
          value={selectedModel.toUpperCase()}
          subtitle={`Uptime: ${formatUptime(uptime)} | Ping: ${pingLatency !== null ? `${pingLatency}ms` : 'offline'}`}
          icon={Server}
          variant={connectionStatus === 'connected' ? 'purple' : 'neutral'}
          badge={{
            text: connectionStatus === 'connected' ? `${selectedModel.toUpperCase()} Operational` : 'Disconnected',
            type: connectionStatus === 'connected' ? 'positive' : 'negative',
          }}
        />
      </div>

      {/* Middle Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Latency & Traffic Activity Stream */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-navy-800 p-5 rounded-xl flex flex-col justify-between min-h-[350px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Pipeline Response Time Timeline (Session Stream)
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end classification latency across the most recent 20 network flow predictions.
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Live Instrumentation
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center pt-2">
            <TrafficTrendAreaChart
              history={predictionHistory}
              onRunSample={() => runSampleFlow(1)}
              onLoadTestData={() => runSampleFlow(5)}
              isSampleRunning={isSampleRunning}
            />
          </div>
        </div>

        {/* Right 1 Col: Donut Ratio */}
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl flex flex-col justify-between min-h-[350px] shadow-sm">
          <div className="pb-3 border-b border-navy-800">
            <h3 className="text-sm font-semibold text-slate-100">Traffic Distribution</h3>
            <p className="text-xs text-slate-400">Classification ratio of normal vs attack traffic</p>
          </div>

          <div className="flex-1 flex flex-col justify-center pt-2">
            <TrafficDonutChart
              normalCount={normalFlows}
              attackCount={attackFlows}
              onRunSample={() => runSampleFlow(1)}
              isSampleRunning={isSampleRunning}
            />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Breakdown by Model & Recent Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Model Invocations Breakdown */}
        <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Inferences by Model
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {Object.keys(statistics?.predictions_by_model || {}).length} Active
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(statistics?.predictions_by_model || {}).length > 0 ? (
              Object.entries(statistics?.predictions_by_model || {}).map(([mName, count]) => {
                const total = statistics?.total_predictions || 1;
                const pct = ((count / total) * 100).toFixed(1);
                const isCurrent = mName === selectedModel;
                return (
                  <div key={mName} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className={isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-300'}>
                        {mName} {isCurrent ? '★' : ''}
                      </span>
                      <span className="text-slate-400">
                        {formatNumber(count)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
                      <div
                        className={`h-full rounded-full ${isCurrent ? 'bg-cyan-400' : 'bg-slate-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No model predictions registered since server restart.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-navy-800">
            <button
              onClick={onNavigateToPlayground}
              className="w-full py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-navy-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Launch Prediction Playground</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Session Prediction History */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Recent Session Predictions</h3>
                <p className="text-[11px] text-slate-400">
                  Ephemerally cached frontend session events ({predictionHistory.length} recorded)
                </p>
              </div>
            </div>

            {attackFlows > 0 && (
              <button
                onClick={onNavigateToDetections}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>View Detections</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {predictionHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-navy-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-navy-800">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Decision</th>
                    <th className="px-3 py-2">Attack Probability</th>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Protocol / Service</th>
                    <th className="px-3 py-2">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {predictionHistory.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-navy-850/50">
                      <td className="px-3 py-2 text-slate-400">{formatTimestamp(item.timestamp)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.prediction === 1
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {item.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {item.probability !== null ? `${(item.probability * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-cyan-300">{item.model_used}</td>
                      <td className="px-3 py-2 text-slate-400">
                        {item.flowSummary.proto} / {item.flowSummary.service}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {formatDurationMs(item.durations.total_ms)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-xs text-slate-300 border border-dashed border-navy-800 rounded-lg flex flex-col items-center justify-center bg-navy-950/30">
              <div className="w-10 h-10 rounded-lg bg-navy-900 border border-navy-750 flex items-center justify-center text-cyan-400 mb-2.5 shadow-sm">
                <History className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-200">No predictions recorded in this browser session.</p>
              <p className="mt-1 text-xs text-slate-300/90 max-w-sm leading-relaxed">
                Send a sample UNSW-NB15 flow packet to populate the real-time session feed.
              </p>
              <button
                onClick={() => runSampleFlow(1)}
                disabled={isSampleRunning}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all disabled:opacity-50"
              >
                <Play className={`w-3 h-3 ${isSampleRunning ? 'animate-spin' : ''}`} />
                <span>{isSampleRunning ? 'Evaluating...' : 'Evaluate Test Packet'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
