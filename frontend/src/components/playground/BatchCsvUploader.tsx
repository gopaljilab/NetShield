import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Cpu,
  Layers,
} from 'lucide-react';
import { NetworkFlowRecord, FLOW_FIELDS } from '../../types/flow';
import { BatchPredictionResponse } from '../../types/api';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { formatDurationMs, formatNumber } from '../../utils/formatters';

interface BatchCsvUploaderProps {
  onBatchComplete: (response: BatchPredictionResponse) => void;
}

export const BatchCsvUploader: React.FC<BatchCsvUploaderProps> = ({ onBatchComplete }) => {
  const { models, selectedModel, setSelectedModel, refreshData } = useApp();

  const [parsedFlows, setParsedFlows] = useState<NetworkFlowRecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [leakageWarning, setLeakageWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<BatchPredictionResponse | null>(null);

  // Download a mini 10-row UNSW-NB15 sample CSV for immediate testing
  const handleDownloadTemplate = () => {
    const headers = FLOW_FIELDS.map((f) => f.key);
    // 2 sample rows (1 normal, 1 attack)
    const row1 = [
      'tcp', '-', 'FIN', 0.449454, 10, 6, 534, 268, 33.37, 254, 252, 8561, 3987, 2, 1,
      47.75, 75.65, 2415.8, 115.8, 255, 2436137549, 1977154190, 255, 0.128, 0.071, 0.057,
      53, 45, 0, 0, 43, 1, 2, 2, 1, 40, 0, 0, 0, 2, 39, 0
    ];
    const row2 = [
      'ddp', '-', 'INT', 0.000009, 2, 0, 200, 0, 111111.1, 254, 0, 88888888, 0, 0, 0,
      0.009, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      100, 0, 0, 0, 4, 2, 1, 1, 1, 4, 0, 0, 0, 2, 4, 0
    ];

    const csvContent = [headers.join(','), row1.join(','), row2.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'netsheild_sample_batch_flows.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setParsingError(null);
    setLeakageWarning(null);
    setBatchResult(null);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setParsingError('The selected CSV file contains no data rows.');
          return;
        }

        const firstRow = results.data[0];
        const headers = Object.keys(firstRow);

        // Check for leakage columns and auto-strip
        const leakageFound = headers.filter((h) => ['label', 'attack_cat', 'id'].includes(h.toLowerCase()));
        if (leakageFound.length > 0) {
          setLeakageWarning(
            `Detected metadata/leakage column(s): [${leakageFound.join(', ')}]. These have been automatically excluded from model inputs.`
          );
        }

        // Validate presence of 42 features
        const missingFeatures = FLOW_FIELDS.filter((f) => !(f.key in firstRow)).map((f) => f.key);

        if (missingFeatures.length > 0) {
          setParsingError(
            `CSV is missing ${missingFeatures.length} required flow feature(s): ${missingFeatures.slice(0, 5).join(', ')}${
              missingFeatures.length > 5 ? '...' : ''
            }`
          );
          setParsedFlows([]);
          return;
        }

        // Clean & cast rows
        const cleaned: NetworkFlowRecord[] = results.data.map((row) => {
          const rec: Record<string, unknown> = {};
          FLOW_FIELDS.forEach((f) => {
            const raw = row[f.key];
            if (f.type === 'number') {
              rec[f.key] = typeof raw === 'number' && !isNaN(raw) ? Math.max(0, raw) : 0;
            } else {
              rec[f.key] = String(raw || '-');
            }
          });
          return rec as unknown as NetworkFlowRecord;
        });

        setParsedFlows(cleaned);
      },
      error: (err) => {
        setParsingError(`Failed to parse CSV file: ${err.message}`);
      },
    });
  };

  const handleRunBatchPrediction = async () => {
    if (parsedFlows.length === 0 || uploading) return;

    setUploading(true);
    setParsingError(null);

    try {
      const response = await apiClient.predictBatch(parsedFlows, selectedModel);
      setBatchResult(response);
      onBatchComplete(response);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch prediction request failed.';
      setParsingError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleExportAnnotatedCsv = () => {
    if (!batchResult || parsedFlows.length === 0) return;

    const rows = parsedFlows.map((flow, idx) => {
      const pred = batchResult.predictions[idx];
      return {
        ...flow,
        predicted_class: pred?.prediction ?? 0,
        predicted_label: pred?.label ?? 'Normal',
        attack_probability: pred?.probability ?? 'N/A',
        model_evaluated: pred?.model_used ?? selectedModel,
      };
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `netsheild_annotated_batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Batch Flow Upload (CSV)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingest batches of UNSW-NB15 flow records (up to 5,000 flows) for vectorized classification.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors self-start"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Dropzone */}
        <label
          htmlFor="batch-file-input"
          className="border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-navy-950/40"
        >
          <UploadCloud className="w-10 h-10 text-cyan-400 mb-2" />
          <span className="text-xs font-medium text-slate-200">
            {fileName ? (
              <span className="text-cyan-300 font-mono">{fileName}</span>
            ) : (
              'Click to browse or drag and drop UNSW-NB15 CSV'
            )}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            Accepts CSV with 42 network flow columns
          </span>
          <input
            id="batch-file-input"
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </label>

        {/* Anti-leakage notice */}
        {leakageWarning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{leakageWarning}</span>
          </div>
        )}

        {/* Parsing Error */}
        {parsingError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{parsingError}</span>
          </div>
        )}

        {/* File Preview & Actions */}
        {parsedFlows.length > 0 && (
          <div className="space-y-4 pt-3 border-t border-navy-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Validated <strong>{formatNumber(parsedFlows.length)}</strong> flow record(s) ready for inference.
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    {models.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunBatchPrediction}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-navy-950 flex items-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  <Layers className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
                  <span>{uploading ? 'Classifying Batch...' : 'Classify Entire Batch'}</span>
                </button>
              </div>
            </div>

            {/* Preview table of first 3 rows */}
            <div className="overflow-x-auto rounded-lg border border-navy-800">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-navy-950 text-slate-400 uppercase border-b border-navy-800">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Proto</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">Src Bytes</th>
                    <th className="px-3 py-2">Dest Bytes</th>
                    <th className="px-3 py-2">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {parsedFlows.slice(0, 3).map((f, i) => (
                    <tr key={i} className="hover:bg-navy-850/50">
                      <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2 text-cyan-300">{f.proto}</td>
                      <td className="px-3 py-2">{f.service}</td>
                      <td className="px-3 py-2">{f.state}</td>
                      <td className="px-3 py-2">{f.dur}s</td>
                      <td className="px-3 py-2">{f.sbytes}</td>
                      <td className="px-3 py-2">{f.dbytes}</td>
                      <td className="px-3 py-2">{f.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedFlows.length > 3 && (
              <p className="text-[10px] text-slate-400 italic">
                Showing preview of 3 of {formatNumber(parsedFlows.length)} rows.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Batch Results Overview */}
      {batchResult && (
        <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-3">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Vectorized Batch Evaluation
              </span>
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Classified {formatNumber(batchResult.total_flows)} Flows via {batchResult.model_used}</span>
              </h4>
            </div>

            <button
              onClick={handleExportAnnotatedCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-navy-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Annotated CSV</span>
            </button>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-navy-950/80 p-3 rounded-lg border border-navy-800">
              <span className="text-[10px] text-slate-400 block uppercase">Total Evaluated</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                {formatNumber(batchResult.total_flows)}
              </span>
            </div>

            <div className="bg-navy-950/80 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 block uppercase">Normal Flows</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {formatNumber(batchResult.normal_count)} (
                {((batchResult.normal_count / batchResult.total_flows) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="bg-navy-950/80 p-3 rounded-lg border border-rose-500/20">
              <span className="text-[10px] text-slate-400 block uppercase">Attack Detected</span>
              <span className="text-lg font-bold font-mono text-rose-400">
                {formatNumber(batchResult.attack_count)} (
                {((batchResult.attack_count / batchResult.total_flows) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="bg-navy-950/80 p-3 rounded-lg border border-cyan-500/20">
              <span className="text-[10px] text-slate-400 block uppercase">Batch Duration</span>
              <span className="text-lg font-bold font-mono text-cyan-300">
                {formatDurationMs(batchResult.batch_duration_ms)}
              </span>
            </div>
          </div>

          {/* Itemized Predictions Sample */}
          <div className="overflow-x-auto rounded-lg border border-navy-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-950 text-slate-400 uppercase border-b border-navy-800">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Decision</th>
                  <th className="px-3 py-2">Attack Probability</th>
                  <th className="px-3 py-2">Preprocessing</th>
                  <th className="px-3 py-2">Inference</th>
                  <th className="px-3 py-2">Protocol / Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-slate-300">
                {batchResult.predictions.slice(0, 5).map((p, i) => (
                  <tr key={i} className="hover:bg-navy-850/50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.prediction === 1
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {p.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {p.probability !== null ? `${(p.probability * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{p.preprocessing_duration_ms.toFixed(3)} ms</td>
                    <td className="px-3 py-2 text-slate-400">{p.inference_duration_ms.toFixed(3)} ms</td>
                    <td className="px-3 py-2 text-slate-300">
                      {parsedFlows[i]?.proto || '-'} / {parsedFlows[i]?.service || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
