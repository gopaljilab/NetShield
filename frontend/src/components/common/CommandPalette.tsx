import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Cpu,
  FlaskConical,
  Settings,
  RotateCcw,
  BookOpen,
  Keyboard,
  Compass,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';
import { PageId } from '../layout/Sidebar';
import { useApp } from '../../context/AppContext';
import { useToast } from './Toast';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Models' | 'Actions' | 'Help';
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onOpenShortcuts: () => void;
  onOpenOnboarding: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenShortcuts,
  onOpenOnboarding,
}) => {
  const { models, selectedModel, setSelectedModel, refreshData, clearHistory } = useApp();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-overview',
      title: 'Go to Overview Dashboard',
      subtitle: 'Executive KPIs, attack distribution, telemetry stream',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
      shortcut: '1',
      onSelect: () => {
        onNavigate('overview');
        onClose();
      },
    },
    {
      id: 'nav-traffic',
      title: 'Go to Traffic Monitor',
      subtitle: 'Protocol breakdown, service volumes, flow distribution',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      shortcut: '2',
      onSelect: () => {
        onNavigate('traffic');
        onClose();
      },
    },
    {
      id: 'nav-detections',
      title: 'Go to Detection Center',
      subtitle: 'Inspected network flows, attack classifications, triage',
      category: 'Navigation',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      shortcut: '3',
      onSelect: () => {
        onNavigate('detections');
        onClose();
      },
    },
    {
      id: 'nav-performance',
      title: 'Go to Model Performance',
      subtitle: 'Audited metrics, ROC-AUC, latency per 1k flows',
      category: 'Navigation',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      shortcut: '4',
      onSelect: () => {
        onNavigate('performance');
        onClose();
      },
    },
    {
      id: 'nav-playground',
      title: 'Go to Prediction Playground',
      subtitle: 'Single flow analysis (42 features) & CSV batch inference',
      category: 'Navigation',
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
      shortcut: '5',
      onSelect: () => {
        onNavigate('playground');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Backend API connection, polling frequency, health probe',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      shortcut: '6',
      onSelect: () => {
        onNavigate('settings');
        onClose();
      },
    },
    {
      id: 'nav-showcase',
      title: 'Go to Academic Showcase & Citations',
      subtitle: 'BCS586 Minor Project, UNSW-NB15 citations, faculty credits',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      shortcut: '7',
      onSelect: () => {
        onNavigate('academic');
        onClose();
      },
    },

    // Models
    ...models.map((m) => ({
      id: `model-${m.name}`,
      title: `Switch Model: ${m.display_name}`,
      subtitle: `${m.algorithm_type} • Acc: ${m.accuracy_pct?.toFixed(1)}% • F1: ${m.f1_pct?.toFixed(1)}%`,
      category: 'Models' as const,
      icon: <Cpu className={`w-4 h-4 ${m.name === selectedModel ? 'text-cyan-400' : 'text-slate-400'}`} />,
      onSelect: () => {
        setSelectedModel(m.name);
        toast.success(`Switched active inference model to ${m.display_name}`, 'Model Changed');
        onClose();
      },
    })),

    // Actions
    {
      id: 'action-refresh',
      title: 'Refresh Telemetry & Health Probe',
      subtitle: 'Poll live health, models list, and cumulative statistics',
      category: 'Actions',
      icon: <RotateCcw className="w-4 h-4 text-cyan-400" />,
      shortcut: 'R',
      onSelect: () => {
        refreshData();
        toast.info('Telemetry data refreshed from FastAPI backend', 'Refreshed');
        onClose();
      },
    },
    {
      id: 'action-clear-history',
      title: 'Clear Session Flow History',
      subtitle: 'Remove all inspected flows and detections from session',
      category: 'Actions',
      icon: <X className="w-4 h-4 text-rose-400" />,
      onSelect: () => {
        clearHistory();
        toast.warning('Session prediction history has been cleared', 'History Cleared');
        onClose();
      },
    },
    {
      id: 'action-onboarding',
      title: 'Launch SOC Quickstart Tour',
      subtitle: 'Overview of UNSW-NB15 flows, anti-leakage rules, models',
      category: 'Help',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      onSelect: () => {
        onClose();
        onOpenOnboarding();
      },
    },
    {
      id: 'action-shortcuts',
      title: 'View Keyboard Shortcuts',
      subtitle: 'Cheatsheet of all hotkeys and quick navigation keys',
      category: 'Help',
      icon: <Keyboard className="w-4 h-4 text-slate-300" />,
      shortcut: '?',
      onSelect: () => {
        onClose();
        onOpenShortcuts();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-navy-900 border border-navy-750 max-w-xl w-full rounded-2xl shadow-2xl shadow-navy-950/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-navy-800 bg-navy-950/60">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. 'overview', 'xgboost', 'refresh')..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-navy-800 text-slate-400 border border-navy-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-navy-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No commands found matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-500/15 text-slate-100 border border-cyan-500/30' : 'text-slate-300 hover:bg-navy-800/60'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-navy-950/80 shrink-0 border border-navy-800">
                    {cmd.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate">{cmd.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-navy-950/60 text-slate-400 border border-navy-800">
                        {cmd.category}
                      </span>
                    </div>
                    {cmd.subtitle && (
                      <p className="text-[11px] text-slate-400 truncate">{cmd.subtitle}</p>
                    )}
                  </div>

                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-navy-950 text-cyan-300 border border-navy-750 rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}

                  <ArrowRight className={`w-3.5 h-3.5 text-cyan-400 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-navy-950/80 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="text-cyan-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>NetShield Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
