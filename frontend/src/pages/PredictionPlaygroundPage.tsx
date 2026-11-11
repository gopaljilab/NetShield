import React, { useState } from 'react';
import { Sliders, FileSpreadsheet, Send } from 'lucide-react';
import { FlowForm } from '../components/playground/FlowForm';
import { BatchCsvUploader } from '../components/playground/BatchCsvUploader';
import { PredictionResultCard } from '../components/playground/PredictionResultCard';
import { PredictionResponse, BatchPredictionResponse } from '../types/api';
import { NetworkFlowRecord } from '../types/flow';
import { useApp } from '../context/AppContext';

export const PredictionPlaygroundPage: React.FC = () => {
  const { addPredictionToHistory } = useApp();

  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [latestSingleResult, setLatestSingleResult] = useState<{
    result: PredictionResponse;
    flow: NetworkFlowRecord;
  } | null>(null);

  const handleSingleSuccess = (result: PredictionResponse, submittedFlow: NetworkFlowRecord) => {
    setLatestSingleResult({ result, flow: submittedFlow });
    addPredictionToHistory({
      id: `playground-${Date.now()}`,
      timestamp: result.timestamp,
      prediction: result.prediction,
      label: result.label,
      probability: result.probability,
      model_used: result.model_used,
      flowSummary: {
        proto: submittedFlow.proto,
        service: submittedFlow.service,
        state: submittedFlow.state,
        sbytes: submittedFlow.sbytes,
        dbytes: submittedFlow.dbytes,
        dur: submittedFlow.dur,
      },
      durations: {
        preprocessing_ms: result.preprocessing_duration_ms,
        inference_ms: result.inference_duration_ms,
        total_ms: result.total_duration_ms,
      },
      source: 'single',
    });
  };

  const handleBatchComplete = (response: BatchPredictionResponse) => {
    // Add first 10 to session history
    response.predictions.slice(0, 10).forEach((p, idx) => {
      addPredictionToHistory({
        id: `batch-${Date.now()}-${idx}`,
        timestamp: p.timestamp,
        prediction: p.prediction,
        label: p.label,
        probability: p.probability,
        model_used: p.model_used,
        flowSummary: {
          proto: 'batch',
          service: 'batch',
          state: 'batch',
          sbytes: 0,
          dbytes: 0,
          dur: 0,
        },
        durations: {
          preprocessing_ms: p.preprocessing_duration_ms,
          inference_ms: p.inference_duration_ms,
          total_ms: p.total_duration_ms,
        },
        source: 'batch',
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Tab Selector */}
      <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Interactive Flow Inference Playground
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Evaluate individual network telemetry feature vectors or ingest large flow datasets in batch mode. All requests pass directly to the NetShield FastAPI server.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-950 rounded-lg border border-navy-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Single Flow Form</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'batch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Batch CSV Upload</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Single Flow Mode */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {latestSingleResult && (
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                Latest Inference Outcome:
              </span>
              <PredictionResultCard
                result={latestSingleResult.result}
                flowDetails={latestSingleResult.flow as unknown as Record<string, unknown>}
              />
            </div>
          )}

          <FlowForm onSuccess={handleSingleSuccess} />
        </div>
      )}

      {/* Tab 2: Batch CSV Mode */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <BatchCsvUploader onBatchComplete={handleBatchComplete} />
        </div>
      )}
    </div>
  );
};
