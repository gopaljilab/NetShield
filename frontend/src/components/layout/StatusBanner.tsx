import React from 'react';
import { AlertCircle, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatusBannerProps {
  onNavigateToSettings: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ onNavigateToSettings }) => {
  const { connectionStatus, errorMessage, apiUrl, refreshData, isRefreshing } = useApp();

  if (connectionStatus === 'connected') {
    return null;
  }

  return (
    <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rose-200">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <div>
          <span className="font-semibold text-rose-300">Backend API Disconnected: </span>
          <span>
            Unable to connect to NetShield backend at <code className="bg-navy-950 px-1 py-0.5 rounded text-rose-300 font-mono">{apiUrl}</code>.{' '}
            {errorMessage ? `(${errorMessage})` : 'Ensure Uvicorn server is running.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => refreshData()}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Retry Connection</span>
        </button>

        <button
          onClick={onNavigateToSettings}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 transition-colors"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Configure URL</span>
        </button>
      </div>
    </div>
  );
};
