import React, { useState } from 'react';
import {
  Menu,
  RotateCw,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from './Sidebar';
import { SAMPLE_FLOWS } from '../../utils/sampleFlows';
import { apiClient } from '../../api/client';
import { ThreatRateIndicator } from '../common/ThreatRateIndicator';
import { useToast } from '../common/Toast';

interface HeaderProps {
  activePage: PageId;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcutsModal: () => void;
  onOpenOnboarding: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Security Operations Center',
    subtitle: 'Real-time telemetry, classification ratios, and operational health',
  },
  traffic: {
    title: 'Traffic Monitor',
    subtitle: 'Flow-level packet stream analysis and prediction telemetry',
  },
  detections: {
    title: 'Detection Center',
    subtitle: 'ML attack classifications, confidence probabilities, and threat alerts',
  },
  performance: {
    title: 'Model Performance & Benchmarks',
    subtitle: 'Academic UNSW-NB15 evaluation metrics and inference latency comparisons',
  },
  playground: {
    title: 'Prediction Playground',
    subtitle: 'Direct single-flow classification and high-throughput CSV batch evaluation',
  },
  settings: {
    title: 'System & Engine Settings',
    subtitle: 'API endpoints, polling frequencies, and deployment configurations',
  },
  academic: {
    title: 'Academic Showcase & Citations',
    subtitle: 'BCS586 Minor Project, UNSW-NB15 dataset citations, and research foundation',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  onOpenOnboarding,
}) => {
  const {
    connectionStatus,
    pingLatency,
    models,
    selectedModel,
    setSelectedModel,
    refreshData,
    isRefreshing,
    lastUpdated,
    addPredictionToHistory,
  } = useApp();
  const toast = useToast();

  const [quickRunning, setQuickRunning] = useState<boolean>(false);

  const pageInfo = PAGE_TITLES[activePage] || {
    title: 'Dashboard',
    subtitle: 'AI-Powered Network Intrusion Detection System',
  };

  const handleQuickRunSample = async () => {
    if (quickRunning) return;
    setQuickRunning(true);
    try {
      // Pick a random sample preset
      const sample = SAMPLE_FLOWS[Math.floor(Math.random() * SAMPLE_FLOWS.length)];
      toast.info(`Evaluating flow with ${selectedModel.toUpperCase()}...`, 'Quick Flow Test');
      const res = await apiClient.predict(sample.flow, selectedModel);

      addPredictionToHistory({
        id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: res.timestamp,
        prediction: res.prediction,
        label: res.label,
        probability: res.probability,
        model_used: res.model_used,
        flowSummary: {
          proto: sample.flow.proto,
          service: sample.flow.service,
          state: sample.flow.state,
          sbytes: sample.flow.sbytes,
          dbytes: sample.flow.dbytes,
          dur: sample.flow.dur,
        },
        durations: {
          preprocessing_ms: res.preprocessing_duration_ms,
          inference_ms: res.inference_duration_ms,
          total_ms: res.total_duration_ms,
        },
        source: 'sample',
      });

      if (res.label === 'Attack') {
        toast.warning(`Attack Classified: ${sample.description} (${(res.probability ? res.probability * 100 : 90).toFixed(1)}% conf)`, 'Threat Detected');
      } else {
        toast.success(`Normal Flow Classified: ${sample.description}`, 'Safe Traffic');
      }

      refreshData();
    } catch (err) {
      toast.error('Quick sample flow evaluation failed.', 'Prediction Error');
      console.error('Quick sample run failed:', err);
    } finally {
      setQuickRunning(false);
    }
  };

  const handleModelChange = (modelName: string) => {
    // Optimistic UI update: instantly update state
    setSelectedModel(modelName);
    const m = models.find((item) => item.name === modelName);
    toast.success(`Active inference model updated to ${m ? m.display_name : modelName}`, 'Model Switched');
  };

  return (
    <header className="w-full h-16 bg-navy-900/80 backdrop-blur-md border-b border-navy-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2 sm:mr-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 focus:outline-none shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
            {pageInfo.title}
          </h1>
          <p className="hidden xl:block text-xs text-slate-400 truncate max-w-xs 2xl:max-w-md">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions Toolbar: Search, TR Indicator, Model Selector, Run Sample, and Utilities Group */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Command Palette Button (⌘K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono bg-navy-950/80 hover:bg-navy-850 text-slate-300 border border-navy-750 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shrink-0"
          title="Open Command Palette (Cmd + K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden md:inline text-slate-400">Search</span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 text-[10px] font-mono font-semibold bg-navy-900 text-cyan-300 border border-navy-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Live TR-Based Threat Rate Indicator (visible on xl+ screens) */}
        <div className="hidden xl:block shrink-0">
          <ThreatRateIndicator />
        </div>

        {/* Model Selector Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 bg-navy-950/70 border border-navy-750 px-2 py-1.5 rounded-lg shrink-0">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-transparent text-xs font-mono font-medium text-cyan-300 focus:outline-none cursor-pointer max-w-[130px] truncate"
            aria-label="Active Model Classifier"
          >
            {models.length > 0 ? (
              models.map((m) => (
                <option key={m.name} value={m.name} className="bg-navy-900 text-slate-200">
                  {m.display_name} {m.is_default ? '(Default)' : ''}
                </option>
              ))
            ) : (
              <option value="xgboost" className="bg-navy-900 text-slate-200">
                XGBoost (Default)
              </option>
            )}
          </select>
        </div>

        {/* Primary CTA: Quick Test Flow Button */}
        <button
          onClick={handleQuickRunSample}
          disabled={quickRunning || connectionStatus !== 'connected'}
          title="Send a sample network flow to the backend model"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95 shrink-0 whitespace-nowrap"
        >
          <Play className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${quickRunning ? 'animate-spin' : ''}`} />
          <span>{quickRunning ? 'Evaluating...' : 'Run Sample'}</span>
        </button>

        {/* Unified Utilities Toolbar Group (Refresh, Tour, Shortcuts, Status Indicator) */}
        <div className="flex items-center bg-navy-950/70 border border-navy-750 rounded-lg p-0.5 shadow-sm shrink-0">
          {/* Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            title={`Refresh telemetry (Last: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'})`}
            className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-navy-850 transition-colors disabled:opacity-50"
            aria-label="Refresh telemetry data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Quick Tour / Onboarding Icon */}
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-navy-850 transition-colors hidden sm:block"
            title="Launch SOC Quickstart Tour"
            aria-label="Launch Quick Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Keyboard Shortcuts Cheatsheet Button */}
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-navy-850 transition-colors hidden sm:block"
            title="Keyboard Shortcuts Cheatsheet (?)"
            aria-label="Shortcuts Cheatsheet"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Compact Connection Status Pill */}
          <div
            className="px-2 py-1 flex items-center gap-1.5 border-l border-navy-800 text-[11px] font-mono select-none"
            title={
              connectionStatus === 'connected'
                ? `Backend Connected (${pingLatency !== null ? `${pingLatency}ms` : 'ok'})`
                : 'Backend Disconnected'
            }
          >
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                <span className="text-rose-400 font-medium hidden md:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
