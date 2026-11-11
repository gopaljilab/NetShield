import React, { useState } from 'react';
import {
  Server,
  Radio,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Trash2,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { formatUptime } from '../utils/formatters';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  const {
    apiUrl,
    setApiUrl,
    resetApiUrl,
    connectionStatus,
    pingLatency,
    health,
    models,
    selectedModel,
    setSelectedModel,
    refreshInterval,
    setRefreshInterval,
    clearHistory,
    predictionHistory,
  } = useApp();
  const toast = useToast();

  const [inputUrl, setInputUrl] = useState<string>(apiUrl);
  const [testResult, setTestResult] = useState<{ testing: boolean; success?: boolean; latency?: number; message?: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isResetUrlModalOpen, setIsResetUrlModalOpen] = useState(false);
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false);

  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    toast.info('Pinging NetShield REST API instance...', 'API Probe');
    const res = await apiClient.ping();
    if (res.healthy) {
      setTestResult({ testing: false, success: true, latency: res.latencyMs });
      toast.success(`Connected! Round-trip latency: ${res.latencyMs}ms`, 'API Healthy');
    } else {
      setTestResult({ testing: false, success: false, message: 'Backend health probe failed.' });
      toast.error('Backend health probe failed. Ensure backend server is running on port 8000.', 'Connection Failed');
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(inputUrl);
    setSaveSuccess(true);
    toast.success(`Backend URL updated to ${inputUrl}`, 'Settings Saved');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmResetUrl = () => {
    resetApiUrl();
    setInputUrl(apiClient.getBaseUrl());
    setSaveSuccess(true);
    toast.info('Reset backend URL to default: http://localhost:8000', 'URL Reset');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Backend API Configuration */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
          <Server className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Backend API Connection</h3>
            <p className="text-xs text-slate-400">Configure target NetShield REST API instance</p>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="api-url-input" className="text-xs font-semibold text-slate-300">
              API Base URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="api-url-input"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-navy-950 border border-navy-750 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-glow-cyan transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save URL</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testResult?.testing}
                  className="px-3 py-2 bg-navy-800 hover:bg-navy-750 text-cyan-300 border border-navy-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Radio className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-pulse' : ''}`} />
                  <span>{testResult?.testing ? 'Pinging...' : 'Ping API'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResetUrlModalOpen(true)}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs rounded-lg hover:bg-navy-800 transition-colors"
                  title="Reset to default http://localhost:8000"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/:(3000|3001|5173|5174|5175)\b/.test(inputUrl) && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Port in URL appears to be a frontend development server. NetShield FastAPI backend runs on <strong>http://localhost:8000</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('http://localhost:8000');
                    setApiUrl('http://localhost:8000');
                  }}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] rounded font-semibold transition-colors shrink-0"
                >
                  Switch to :8000
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Default is <code className="text-cyan-400 font-mono">http://localhost:8000</code>. Override can also be supplied via <code className="text-cyan-400 font-mono">VITE_API_URL</code> environment variable.
            </p>
          </div>

          {saveSuccess && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              API URL updated and persisted to local browser storage.
            </p>
          )}

          {testResult && !testResult.testing && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Connected successfully! Ping latency: {testResult.latency} ms</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Connection failed: {testResult.message}</span>
                </>
              )}
            </div>
          )}
        </form>

        {/* Live Diagnostics */}
        <div className="pt-3 border-t border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-400 block uppercase">Status</span>
            <span className={connectionStatus === 'connected' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>

          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-400 block uppercase">Roundtrip Ping</span>
            <span className="text-cyan-300 font-bold">
              {pingLatency !== null ? `${pingLatency} ms` : 'N/A'}
            </span>
          </div>

          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-400 block uppercase">Server Uptime</span>
            <span className="text-slate-200">
              {health?.uptime_seconds ? formatUptime(health.uptime_seconds) : 'N/A'}
            </span>
          </div>

          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-400 block uppercase">API Version</span>
            <span className="text-slate-200">{health?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Model & Engine Defaults */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
          <Radio className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Default Model Engine</h3>
            <p className="text-xs text-slate-400">Global model selection applied to all prediction queries</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="settings-model-select" className="text-xs font-semibold text-slate-300">
              Active Classifier
            </label>
            <select
              id="settings-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full sm:w-80 bg-navy-950 border border-navy-750 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
            >
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.display_name} {m.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
            <strong>XGBoost</strong> is the academic mentor recommendation due to superior false-alarm rejection (2.10% FPR) and sub-millisecond execution. <strong>Random Forest</strong> provides alternative ensemble bagging with 92.34% F1-score.
          </p>
        </div>
      </div>

      {/* Dashboard Polling & Session Storage */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Telemetry Refresh & Browser Cache</h3>
            <p className="text-xs text-slate-400">Configure background polling frequency and session storage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="refresh-interval-select" className="text-xs font-semibold text-slate-300">
              Auto-Refresh Frequency
            </label>
            <select
              id="refresh-interval-select"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full bg-navy-950 border border-navy-750 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value={5}>Every 5 Seconds (High Frequency)</option>
              <option value={10}>Every 10 Seconds (Recommended)</option>
              <option value={30}>Every 30 Seconds (Low Overhead)</option>
              <option value={0}>Manual Refresh Only (No Polling)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">Session History</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-xs font-mono text-slate-400">
                {predictionHistory.length} event(s) recorded
              </span>
              <button
                type="button"
                onClick={() => setIsClearCacheModalOpen(true)}
                disabled={predictionHistory.length === 0}
                className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About NetShield System */}
      <div className="bg-navy-900/90 border border-navy-800 p-6 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">About NetShield System</h3>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p>
            <strong>NetShield: AI-Powered Network Intrusion Detection System</strong> is an academic mini project developed in the Department of Computer Science & Engineering (Course Code: BCS586).
          </p>
          <p className="text-slate-400 text-[11px]">
            Backend: FastAPI 0.128, Python 3.9, scikit-learn 1.3, XGBoost 2.0 • Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts • Benchmark: UNSW-NB15.
          </p>
        </div>
      </div>

      {/* Reset URL Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetUrlModalOpen}
        onClose={() => setIsResetUrlModalOpen(false)}
        onConfirm={handleConfirmResetUrl}
        title="Reset Backend API URL?"
        description="This will clear your customized API endpoint from browser storage and reset it to default http://localhost:8000."
        confirmText="Reset to http://localhost:8000"
        variant="warning"
      />

      {/* Clear Cache Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearCacheModalOpen}
        onClose={() => setIsClearCacheModalOpen(false)}
        onConfirm={() => {
          clearHistory();
          toast.warning('Session prediction cache cleared from browser storage', 'Cache Wiped');
        }}
        title="Clear Session Telemetry Cache?"
        description="This will remove all session predictions and inspected flow events from local browser storage."
        confirmText="Clear Cache"
        variant="danger"
      />
    </div>
  );
};
