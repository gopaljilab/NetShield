import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Filter,
  Eye,
  X,
  Download,
  Trash2,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PredictionHistoryItem } from '../types/flow';
import { formatDurationMs, formatTimestamp, formatBytes } from '../utils/formatters';
import { DataTable, ColumnDef, BulkAction } from '../components/common/DataTable';
import { SkeletonTable } from '../components/common/Skeleton';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { exportToCsv, exportToJson } from '../utils/exportHelpers';

interface DetectionCenterPageProps {
  onNavigateToPlayground: () => void;
}

export const DetectionCenterPage: React.FC<DetectionCenterPageProps> = ({ onNavigateToPlayground }) => {
  const { predictionHistory, isRefreshing, removeHistoryItems, restoreHistoryItems, clearHistory } = useApp();
  const toast = useToast();

  const [selectedItem, setSelectedItem] = useState<PredictionHistoryItem | null>(null);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [selectedProto, setSelectedProto] = useState<string>('all');
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Filter only attack classifications (Label 1)
  const attackRecords = useMemo(() => {
    return predictionHistory.filter((item) => item.prediction === 1);
  }, [predictionHistory]);

  // Apply confidence and protocol filters
  const filteredAttacks = useMemo(() => {
    return attackRecords.filter((item) => {
      if (item.probability !== null && item.probability * 100 < minConfidence) {
        return false;
      }
      if (selectedProto !== 'all' && item.flowSummary.proto !== selectedProto) {
        return false;
      }
      return true;
    });
  }, [attackRecords, minConfidence, selectedProto]);

  const getSeverity = (prob: number | null): { label: string; color: string; badge: string } => {
    if (prob === null) return { label: 'Flagged Anomaly', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (prob >= 0.9) return { label: 'Critical Threat', color: 'text-rose-400', badge: 'bg-rose-500/25 text-rose-300 border-rose-500/40' };
    if (prob >= 0.75) return { label: 'High Anomaly', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (prob >= 0.5) return { label: 'Medium Anomaly', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Low Suspicion', color: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  };

  const protocols = useMemo(() => {
    return Array.from(new Set(attackRecords.map((a) => a.flowSummary.proto)));
  }, [attackRecords]);

  // Bulk Actions
  const bulkActions: BulkAction<PredictionHistoryItem>[] = [
    {
      label: 'Export Selected (CSV)',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
      onClick: (selected) => {
        exportToCsv(selected, `netshield_detections_selected_${selected.length}.csv`);
        toast.success(`Exported ${selected.length} records to CSV`, 'Export Complete');
      },
    },
    {
      label: 'Export Selected (JSON)',
      icon: <FileCode className="w-3.5 h-3.5" />,
      onClick: (selected) => {
        exportToJson(selected, `netshield_detections_selected_${selected.length}.json`);
        toast.success(`Exported ${selected.length} records to JSON`, 'Export Complete');
      },
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      variant: 'danger',
      onClick: (selected) => {
        const ids = selected.map((s) => s.id);
        const removedSnapshot = [...selected];
        // Optimistic UI deletion
        removeHistoryItems(ids);
        toast.optimistic(
          `Removed ${selected.length} records from history`,
          () => restoreHistoryItems(removedSnapshot),
          'Records Deleted'
        );
      },
    },
  ];

  // Column Definitions
  const columns: ColumnDef<PredictionHistoryItem>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      sortValue: (item) => new Date(item.timestamp).getTime(),
      accessor: (item) => (
        <span className="text-slate-300 font-mono text-[11px] whitespace-nowrap">
          {formatTimestamp(item.timestamp)}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Threat Severity',
      sortable: true,
      sortValue: (item) => item.probability ?? 0.5,
      accessor: (item) => {
        const sev = getSeverity(item.probability);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${sev.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{sev.label}</span>
            {item.probability !== null && (
              <span className="opacity-75">({(item.probability * 100).toFixed(0)}%)</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'model_used',
      header: 'Classifier',
      sortable: true,
      accessor: (item) => (
        <span className="text-cyan-300 font-mono text-[11px] font-semibold uppercase">
          {item.model_used}
        </span>
      ),
    },
    {
      key: 'proto',
      header: 'Protocol',
      sortable: true,
      sortValue: (item) => item.flowSummary.proto,
      accessor: (item) => (
        <span className="px-1.5 py-0.5 rounded bg-navy-800 text-slate-200 font-mono text-[11px]">
          {item.flowSummary.proto}
        </span>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      sortable: true,
      sortValue: (item) => item.flowSummary.service,
      accessor: (item) => (
        <span className="text-slate-300 font-mono text-[11px]">
          {item.flowSummary.service}
        </span>
      ),
    },
    {
      key: 'dur',
      header: 'Duration',
      sortable: true,
      sortValue: (item) => item.flowSummary.dur,
      accessor: (item) => (
        <span className="text-slate-400 font-mono text-[11px]">
          {item.flowSummary.dur.toFixed(4)}s
        </span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume (Tx/Rx)',
      sortable: true,
      sortValue: (item) => item.flowSummary.sbytes + item.flowSummary.dbytes,
      accessor: (item) => (
        <span className="text-slate-300 font-mono text-[11px] whitespace-nowrap">
          {formatBytes(item.flowSummary.sbytes)} / {formatBytes(item.flowSummary.dbytes)}
        </span>
      ),
    },
    {
      key: 'latency',
      header: 'Latency',
      sortable: true,
      sortValue: (item) => item.durations.total_ms,
      accessor: (item) => (
        <span className="text-slate-400 font-mono text-[11px]">
          {formatDurationMs(item.durations.total_ms)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      searchable: false,
      accessor: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
          }}
          className="p-1 rounded bg-navy-800 hover:bg-navy-750 text-cyan-400 hover:text-cyan-300 transition-colors"
          title="Inspect telemetry flow"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Defensive Alert Disclaimer */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-200 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-300">
            Defensive Cybersecurity Research & Verification Principle
          </p>
          <p className="text-rose-200/90 leading-relaxed text-[11px]">
            In defensive intrusion detection, <strong>a machine learning positive classification is an algorithmic anomaly prediction, not confirmed malicious intrusion or security compromise</strong>. All flagged vectors require correlation against network topology, firewall state tables, and baseline telemetry before automated blocking actions.
          </p>
        </div>
      </div>

      {/* Main Content: Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-navy-900/90 border border-navy-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Anomalous Traffic Events</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {attackRecords.length} Detected
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Flagged as Label 1 (Attack) by NetShield classification engines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToPlayground}
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Playground</span>
          </button>
          {attackRecords.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  exportToCsv(attackRecords, 'netshield_all_detections.csv');
                  toast.success(`Exported all ${attackRecords.length} attack records to CSV`, 'Export Complete');
                }}
                className="px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export All (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(true)}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reusable DataTable with Search, Bulk Actions, and Column Toggles */}
      {isRefreshing ? (
        <SkeletonTable rows={6} columns={7} />
      ) : (
        <DataTable
          data={filteredAttacks}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search protocol, service, classifier, or timestamp..."
          bulkActions={bulkActions}
          onRowClick={(item) => setSelectedItem(item)}
          emptyMessage={
            attackRecords.length === 0
              ? 'No anomalous traffic records detected in the current session. Submit sample flows in the Prediction Playground to begin analysis.'
              : 'No detection records match the current filter criteria.'
          }
          filterSlot={
            <div className="flex items-center gap-2">
              {/* Min confidence slider */}
              <div className="flex items-center gap-2 text-xs bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800">
                <span className="text-slate-400 text-[11px]">Min Conf:</span>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-16 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-cyan-300 font-bold text-[11px]">{minConfidence}%</span>
              </div>

              {/* Protocol filter */}
              {protocols.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs bg-navy-950 px-2.5 py-1.5 rounded-lg border border-navy-800">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedProto}
                    onChange={(e) => setSelectedProto(e.target.value)}
                    className="bg-transparent text-slate-300 font-mono text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-navy-900 text-slate-200">
                      All Protos ({attackRecords.length})
                    </option>
                    {protocols.map((p) => (
                      <option key={p} value={p} className="bg-navy-900 text-slate-200">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          }
        />
      )}

      {/* Row Detail Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedItem(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative bg-navy-900 border border-navy-750 max-w-lg w-full rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-100">Flow Anomaly Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-navy-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px]">PREDICTION</span>
                <div className="text-rose-400 font-bold text-sm">Attack (Label 1)</div>
              </div>

              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px]">CONFIDENCE</span>
                <div className="text-slate-100 font-bold text-sm">
                  {selectedItem.probability !== null
                    ? `${(selectedItem.probability * 100).toFixed(2)}%`
                    : 'N/A (Linear SVC)'}
                </div>
              </div>

              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px]">CLASSIFIER ENGINE</span>
                <div className="text-cyan-300 font-bold uppercase">{selectedItem.model_used}</div>
              </div>

              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1">
                <span className="text-slate-400 text-[10px]">TIMESTAMP</span>
                <div className="text-slate-200 text-[11px]">
                  {formatTimestamp(selectedItem.timestamp)}
                </div>
              </div>
            </div>

            {/* Flow Telemetry Summary */}
            <div className="p-4 bg-navy-950/80 border border-navy-800 rounded-xl space-y-2 text-xs font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Flow Vector Snapshot
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Proto: <strong className="text-cyan-300">{selectedItem.flowSummary.proto}</strong></div>
                <div>Service: <strong className="text-cyan-300">{selectedItem.flowSummary.service}</strong></div>
                <div>State: <strong className="text-cyan-300">{selectedItem.flowSummary.state}</strong></div>
                <div>Dur: <strong className="text-cyan-300">{selectedItem.flowSummary.dur.toFixed(4)}s</strong></div>
                <div>Tx: <strong className="text-cyan-300">{formatBytes(selectedItem.flowSummary.sbytes)}</strong></div>
                <div>Rx: <strong className="text-cyan-300">{formatBytes(selectedItem.flowSummary.dbytes)}</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destructive Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          clearHistory();
          toast.warning('All detection records have been cleared from memory', 'History Wiped');
        }}
        title="Clear All Detection Records?"
        description="This will permanently delete all anomalous traffic flow detections from your active session history."
        confirmText="Clear All Records"
        confirmPhrase="CLEAR"
        variant="danger"
      />
    </div>
  );
};
