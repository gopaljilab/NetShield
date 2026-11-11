import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ModelMetadata } from '../../types/api';

interface ModelComparisonBarChartProps {
  models: ModelMetadata[];
}

type MetricKey =
  | 'accuracy_pct'
  | 'precision_pct'
  | 'recall_pct'
  | 'f1_pct'
  | 'fpr_pct'
  | 'roc_auc_pct'
  | 'latency_ms_per_1k';

interface MetricOption {
  key: MetricKey;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
}

const METRICS: MetricOption[] = [
  { key: 'f1_pct', label: 'F1-Score', unit: '%' },
  { key: 'accuracy_pct', label: 'Accuracy', unit: '%' },
  { key: 'precision_pct', label: 'Precision', unit: '%' },
  { key: 'recall_pct', label: 'Recall', unit: '%' },
  { key: 'fpr_pct', label: 'False Positive Rate', unit: '%', lowerIsBetter: true },
  { key: 'roc_auc_pct', label: 'ROC-AUC', unit: '%' },
  { key: 'latency_ms_per_1k', label: 'Latency (per 1k flows)', unit: 'ms', lowerIsBetter: true },
];

export const ModelComparisonBarChart: React.FC<ModelComparisonBarChartProps> = ({ models }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('f1_pct');

  const currentOption = METRICS.find((m) => m.key === selectedMetric) || METRICS[0];

  const chartData = models.map((m) => {
    const rawVal = m[selectedMetric];
    return {
      name: m.name,
      displayName: m.display_name.split(' (')[0], // cleaner label
      value: typeof rawVal === 'number' ? rawVal : 0,
      isDefault: m.is_default,
    };
  });

  return (
    <div className="space-y-4">
      {/* Metric Selector Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-navy-950/60 border border-navy-800 rounded-lg">
        {METRICS.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedMetric === metric.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="displayName"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              interval={0}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              domain={
                currentOption.key === 'latency_ms_per_1k'
                  ? [0, 'auto']
                  : currentOption.key === 'fpr_pct'
                  ? [0, 6]
                  : [80, 100]
              }
              unit={currentOption.unit === '%' ? '%' : ''}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-navy-950 border border-navy-750 px-3 py-2 rounded-lg shadow-xl text-xs font-mono">
                      <p className="font-semibold text-slate-200">{data.displayName}</p>
                      <p className="text-cyan-400 mt-1">
                        {currentOption.label}:{' '}
                        <span className="font-bold">
                          {data.value} {currentOption.unit}
                        </span>
                      </p>
                      {data.isDefault && (
                        <p className="text-[10px] text-emerald-400 mt-0.5">★ Production Default</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                let fill = '#06B6D4'; // default cyan
                if (entry.isDefault) fill = '#10B981'; // emerald for default
                if (currentOption.lowerIsBetter && entry.value > 3) fill = '#F59E0B'; // amber for higher latency/FPR
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-navy-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Production Default (XGBoost)
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 ml-2" /> Evaluated Classifiers
        </span>
        <span>
          {currentOption.lowerIsBetter ? 'Lower value is superior' : 'Higher value is superior'}
        </span>
      </div>
    </div>
  );
};
