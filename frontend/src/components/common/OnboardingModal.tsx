import React, { useState } from 'react';
import {
  Shield,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from './Toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { models, selectedModel, setSelectedModel, refreshInterval, setRefreshInterval } = useApp();
  const toast = useToast();
  const [step, setStep] = useState<number>(1);
  const [prefModel, setPrefModel] = useState<string>(selectedModel);
  const [prefInterval, setPrefInterval] = useState<number>(refreshInterval);

  if (!isOpen) return null;

  const handleFinish = () => {
    setSelectedModel(prefModel);
    setRefreshInterval(prefInterval);
    localStorage.setItem('netshield_onboarding_completed', 'true');
    toast.success('Your NetShield SOC preferences have been saved!', 'Setup Complete');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-navy-900 border border-navy-750 max-w-xl w-full rounded-2xl shadow-2xl z-10 overflow-hidden space-y-6 p-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header & Steps Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Welcome to NETSHIELD</h3>
              <p className="text-[11px] text-slate-400">AI-Powered Network Intrusion Detection System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              Step {step} of 3
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-navy-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: System & Dataset Architecture */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Academic Defensive Cyber Telemetry</span>
              </div>
              <p>
                NetShield classifies offline network flows using <strong>42 telemetry features</strong> derived from the benchmark <strong>UNSW-NB15</strong> intrusion detection dataset.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Zero Data Leakage</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  <code className="text-cyan-300">id</code>, <code className="text-cyan-300">attack_cat</code>, and <code className="text-cyan-300">label</code> are strictly stripped from all inputs.
                </p>
              </div>

              <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5 ML Models Ready</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  XGBoost, Random Forest, Decision Tree, Logistic Regression, and Linear SVC loaded in memory.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Data Capture - Select Default Inference Engine */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Select Preferred ML Inference Model
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Choose the primary model for your detection playground and batch classification:
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {models.map((m) => {
                const isSelected = prefModel === m.name;
                return (
                  <div
                    key={m.name}
                    onClick={() => setPrefModel(m.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-100 shadow-glow-cyan'
                        : 'bg-navy-950/60 border-navy-800 text-slate-300 hover:border-navy-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{m.display_name}</span>
                        {m.is_default && (
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                            Audited Best
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Acc: {m.accuracy_pct?.toFixed(1)}% • F1: {m.f1_pct?.toFixed(1)}% • FPR: {m.fpr_pct?.toFixed(1)}%
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-navy-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Polling & Telemetry Frequency */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Telemetry Monitoring Interval
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Configure background telemetry polling frequency from the FastAPI backend:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { sec: 5, label: 'Real-time (5s)', desc: 'Frequent health & statistics ping' },
                { sec: 10, label: 'Balanced (10s)', desc: 'Recommended default for college demo' },
                { sec: 30, label: 'Relaxed (30s)', desc: 'Low bandwidth telemetry check' },
                { sec: 0, label: 'Manual Only', desc: 'Refresh only on hotkey (R) or click' },
              ].map((opt) => (
                <div
                  key={opt.sec}
                  onClick={() => setPrefInterval(opt.sec)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                    prefInterval === opt.sec
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-100 shadow-glow-cyan'
                      : 'bg-navy-950/60 border-navy-800 text-slate-300 hover:border-navy-700'
                  }`}
                >
                  <div className="font-bold font-mono">{opt.label}</div>
                  <div className="text-[11px] text-slate-400">{opt.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <p>
                💡 <strong>Tip:</strong> Press <kbd className="text-cyan-300 font-mono font-bold">⌘K</kbd> anytime to open the Command Palette, or <kbd className="text-cyan-300 font-mono font-bold">?</kbd> for keyboard shortcuts.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-navy-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 rounded-lg hover:bg-navy-800 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-glow-cyan transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save & Enter SOC</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
