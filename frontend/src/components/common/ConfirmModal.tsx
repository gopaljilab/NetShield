import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmPhrase?: string; // If provided, user must type this exact word to confirm
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  confirmPhrase,
  variant = 'danger',
  isLoading = false,
}) => {
  const [typedPhrase, setTypedPhrase] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedPhrase('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = !confirmPhrase || typedPhrase.trim() === confirmPhrase.trim();

  const handleConfirm = async () => {
    if (!isConfirmed || isLoading) return;
    await onConfirm();
    onClose();
  };

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-navy-900 border border-navy-750 max-w-md w-full rounded-2xl p-6 shadow-2xl shadow-navy-950/80 space-y-4 z-10 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDanger ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional type-to-confirm requirement */}
        {confirmPhrase && (
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-mono text-slate-400">
              Type <strong className="text-rose-400 font-bold">{confirmPhrase}</strong> to confirm:
            </label>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={confirmPhrase}
              className="w-full bg-navy-950 border border-navy-750 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
              autoFocus
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-navy-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-md flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-950/50 disabled:opacity-50 disabled:hover:bg-rose-500'
                : 'bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold disabled:opacity-50'
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
