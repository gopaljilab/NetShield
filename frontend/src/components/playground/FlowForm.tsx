import React, { useState, useMemo } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Cpu,
  Layers,
  Database,
  SlidersHorizontal,
  Binary,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { NetworkFlowRecord, FLOW_CATEGORIES, FLOW_FIELDS } from '../../types/flow';
import { PredictionResponse } from '../../types/api';
import { SAMPLE_FLOWS, SampleFlowPreset } from '../../utils/sampleFlows';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { useDebouncedCallback } from '../../hooks/useDebounce';

interface FlowFormProps {
  onSuccess: (result: PredictionResponse, submittedFlow: NetworkFlowRecord) => void;
}

const DEFAULT_FLOW: NetworkFlowRecord = {
  proto: 'tcp',
  service: 'http',
  state: 'FIN',
  dur: 0.1,
  spkts: 10,
  dpkts: 8,
  sbytes: 500,
  dbytes: 1200,
  rate: 180.0,
  sttl: 62,
  dttl: 252,
  sload: 40000.0,
  dload: 96000.0,
  sloss: 0,
  dloss: 0,
  sinpkt: 10.0,
  dinpkt: 12.0,
  sjit: 25.0,
  djit: 30.0,
  swin: 255,
  stcpb: 1000000,
  dtcpb: 2000000,
  dwin: 255,
  tcprtt: 0.05,
  synack: 0.02,
  ackdat: 0.03,
  smean: 50,
  dmean: 150,
  trans_depth: 1,
  response_body_len: 800,
  ct_srv_src: 2,
  ct_state_ttl: 1,
  ct_dst_ltm: 2,
  ct_src_dport_ltm: 1,
  ct_dst_sport_ltm: 1,
  ct_dst_src_ltm: 2,
  is_ftp_login: 0,
  ct_ftp_cmd: 0,
  ct_flw_http_mthd: 1,
  ct_src_ltm: 2,
  ct_srv_dst: 2,
  is_sm_ips_ports: 0,
};

const DRAFT_STORAGE_KEY = 'netshield_flow_draft';

export const FlowForm: React.FC<FlowFormProps> = ({ onSuccess }) => {
  const { models, selectedModel, setSelectedModel, refreshData } = useApp();
  const toast = useToast();

  // Initialize from saved draft or DEFAULT_FLOW
  const [flow, setFlow] = useState<NetworkFlowRecord>(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FLOW;
    } catch {
      return DEFAULT_FLOW;
    }
  });

  const [activeCategory, setActiveCategory] = useState<'basic' | 'tcp' | 'content' | 'counts'>('basic');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSavedBadge, setIsSavedBadge] = useState(false);

  // Auto-save draft to sessionStorage (debounced 500ms)
  const saveDraft = useDebouncedCallback((draft: NetworkFlowRecord) => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setIsSavedBadge(true);
      setTimeout(() => setIsSavedBadge(false), 2000);
    } catch {
      // ignore
    }
  }, 500);

  // Smart Form Validation: Real-time validation across all 42 fields
  const fieldValidation = useMemo(() => {
    const errors: Record<string, string> = {};
    let validCount = 0;

    FLOW_FIELDS.forEach((field) => {
      const val = flow[field.key];
      let fieldError: string | null = null;

      if (field.type === 'number') {
        const num = Number(val);
        if (val === '' || isNaN(num)) {
          fieldError = 'Required number';
        } else if (num < 0) {
          fieldError = 'Must be ≥ 0';
        } else if (field.max !== undefined && num > field.max) {
          fieldError = `Max ${field.max}`;
        }
      } else {
        if (!val || String(val).trim() === '') {
          fieldError = 'Required field';
        }
      }

      if (fieldError) {
        errors[field.key] = fieldError;
      } else {
        validCount++;
      }
    });

    return { errors, validCount, total: FLOW_FIELDS.length };
  }, [flow]);

  const handleFieldChange = (key: keyof NetworkFlowRecord, value: string | number) => {
    setFlow((prev) => {
      const next = { ...prev, [key]: value };
      saveDraft(next);
      return next;
    });
  };

  const handleApplyPreset = (preset: SampleFlowPreset) => {
    setFlow({ ...preset.flow });
    saveDraft(preset.flow);
    setActivePreset(preset.id);
    setError(null);
    toast.info(`Loaded preset: ${preset.name} (${preset.category})`, 'Preset Applied');
  };

  const handleConfirmReset = () => {
    setFlow(DEFAULT_FLOW);
    saveDraft(DEFAULT_FLOW);
    setActivePreset(null);
    setError(null);
    toast.info('Form features reset to default baseline', 'Reset Complete');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(fieldValidation.errors).length > 0) {
      const firstError = Object.entries(fieldValidation.errors)[0];
      setError(`Validation error on ${firstError[0]}: ${firstError[1]}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      toast.info(`Evaluating flow with ${selectedModel.toUpperCase()}...`, 'Submitting Flow');
      const response = await apiClient.predict(flow, selectedModel);
      onSuccess(response, flow);

      if (response.label === 'Attack') {
        toast.warning(
          `Attack Detected! Probability: ${(response.probability ? response.probability * 100 : 90).toFixed(1)}%`,
          'Detection Result'
        );
      } else {
        toast.success('Flow Classified as Normal Traffic', 'Safe Telemetry');
      }

      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction request failed.';
      setError(msg);
      toast.error(msg, 'Inference Error');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryIcons = {
    basic: Layers,
    tcp: SlidersHorizontal,
    content: Binary,
    counts: Database,
  };

  const currentCategoryFields = FLOW_FIELDS.filter((f) => f.category === activeCategory);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Presets Row */}
        <div className="bg-navy-900/90 border border-navy-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Test Presets (Verified UNSW-NB15 Benchmark Flows)
            </span>
            <div className="flex items-center gap-2">
              {isSavedBadge && (
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 text-cyan-400" />
                  Auto-saved
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_FLOWS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan'
                      : 'bg-navy-950/60 border-navy-800/80 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{preset.name}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                        preset.category === 'Attack'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Progress & Category Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-900/90 border border-navy-800 p-2.5 px-4 rounded-xl">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FLOW_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.id];
              const isActive = activeCategory === cat.id;
              const catFields = FLOW_FIELDS.filter((f) => f.category === cat.id);
              const catErrors = catFields.filter((f) => fieldValidation.errors[f.key]).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.title.split(' ')[0]}</span>
                  {catErrors > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Validation Status Pill */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0 self-end sm:self-auto">
            {fieldValidation.validCount === fieldValidation.total ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>42/42 Valid Features</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                <span>{Object.keys(fieldValidation.errors).length} Fields Need Attention</span>
              </span>
            )}
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4 shadow-xl">
          <div className="border-b border-navy-800 pb-2">
            <h3 className="text-sm font-bold text-slate-100">
              {FLOW_CATEGORIES.find((c) => c.id === activeCategory)?.title}
            </h3>
            <p className="text-xs text-slate-400">
              {FLOW_CATEGORIES.find((c) => c.id === activeCategory)?.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategoryFields.map((field) => {
              const val = flow[field.key] ?? '';
              const fieldError = fieldValidation.errors[field.key];

              return (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor={`field-${field.key}`}
                      className="font-medium text-slate-300 font-mono text-[11px]"
                      title={field.description}
                    >
                      {field.label}
                    </label>
                    {fieldError && (
                      <span className="text-[10px] font-mono text-rose-400 font-semibold">
                        {fieldError}
                      </span>
                    )}
                  </div>

                  {field.type === 'select' ? (
                    <select
                      id={`field-${field.key}`}
                      value={val}
                      onChange={(e) =>
                        handleFieldChange(
                          field.key,
                          ['is_ftp_login', 'is_sm_ips_ports'].includes(field.key)
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      className={`w-full bg-navy-950 border ${
                        fieldError ? 'border-rose-500/80 focus:border-rose-500' : 'border-navy-750 focus:border-cyan-500'
                      } rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none transition-colors`}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} className="bg-navy-900 text-slate-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`field-${field.key}`}
                      type="number"
                      step={field.step ?? 'any'}
                      min={field.min}
                      max={field.max}
                      value={val}
                      onChange={(e) =>
                        handleFieldChange(
                          field.key,
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className={`w-full bg-navy-950 border ${
                        fieldError ? 'border-rose-500/80 focus:border-rose-500' : 'border-navy-750 focus:border-cyan-500'
                      } rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none transition-colors`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-navy-900/90 border border-navy-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Target ML Classifier:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-navy-950 border border-navy-750 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.name} value={m.name} className="bg-navy-900 text-slate-200">
                  {m.display_name} {m.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={submitting || Object.keys(fieldValidation.errors).length > 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Feature Vector...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Classify Network Flow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Destructive Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Flow Feature Inputs?"
        description="This will discard any modified flow features and restore the default baseline UNSW-NB15 flow parameters."
        confirmText="Reset to Defaults"
        variant="warning"
      />
    </>
  );
};
