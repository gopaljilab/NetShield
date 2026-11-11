import { PredictionHistoryItem } from '../types/flow';

/**
 * Exports prediction history items to a downloadable CSV file.
 */
export function exportToCsv(items: PredictionHistoryItem[], filename = 'netshield_detections.csv') {
  if (items.length === 0) return;

  const headers = [
    'id',
    'timestamp',
    'prediction',
    'label',
    'probability',
    'model_used',
    'proto',
    'service',
    'state',
    'dur_sec',
    'sbytes',
    'dbytes',
    'inference_ms',
    'total_ms',
    'source',
  ];

  const rows = items.map((item) => [
    item.id,
    item.timestamp,
    item.prediction,
    item.label,
    item.probability !== null ? item.probability.toFixed(4) : '',
    item.model_used,
    item.flowSummary.proto,
    item.flowSummary.service,
    item.flowSummary.state,
    item.flowSummary.dur,
    item.flowSummary.sbytes,
    item.flowSummary.dbytes,
    item.durations.inference_ms.toFixed(2),
    item.durations.total_ms.toFixed(2),
    item.source,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports prediction history items to a downloadable JSON file.
 */
export function exportToJson(items: PredictionHistoryItem[], filename = 'netshield_detections.json') {
  if (items.length === 0) return;

  const jsonStr = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
