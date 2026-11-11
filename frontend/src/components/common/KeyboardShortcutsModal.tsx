import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K / Ctrl K', desc: 'Open Command Palette' },
    { key: '?', desc: 'Open this Keyboard Shortcuts cheatsheet' },
    { key: 'R', desc: 'Refresh live telemetry & API health probe' },
    { key: '1', desc: 'Navigate to Overview Dashboard' },
    { key: '2', desc: 'Navigate to Traffic Monitor' },
    { key: '3', desc: 'Navigate to Detection Center' },
    { key: '4', desc: 'Navigate to Model Performance' },
    { key: '5', desc: 'Navigate to Prediction Playground' },
    { key: '6', desc: 'Navigate to Settings' },
    { key: '7', desc: 'Navigate to Academic Showcase' },
    { key: 'Esc', desc: 'Close dialogs, command palette, and modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-navy-900 border border-navy-750 max-w-md w-full rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <Keyboard className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100 font-mono">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-navy-800/60 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono font-semibold bg-navy-950 text-cyan-300 border border-navy-750 rounded shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400 font-mono">
          Press <kbd className="text-cyan-300 font-bold">Esc</kbd> anytime to dismiss.
        </div>
      </div>
    </div>
  );
};
