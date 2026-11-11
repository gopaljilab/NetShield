import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HealthResponse,
  ModelMetadata,
  StatisticsResponse,
  ConnectionStatus,
} from '../types/api';
import { PredictionHistoryItem } from '../types/flow';
import { apiClient } from '../api/client';
import { SAMPLE_FLOWS } from '../utils/sampleFlows';

interface AppContextType {
  connectionStatus: ConnectionStatus;
  pingLatency: number | null;
  health: HealthResponse | null;
  models: ModelMetadata[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  statistics: StatisticsResponse | null;
  predictionHistory: PredictionHistoryItem[];
  addPredictionToHistory: (item: PredictionHistoryItem) => void;
  removeHistoryItems: (ids: string[]) => void;
  restoreHistoryItems: (items: PredictionHistoryItem[]) => void;
  clearHistory: () => void;
  runSampleFlow: (count?: number) => Promise<void>;
  isSampleRunning: boolean;
  refreshInterval: number; // in seconds, 0 = manual
  setRefreshInterval: (seconds: number) => void;
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  errorMessage: string | null;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  resetApiUrl: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'netshield_session_history';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('xgboost');
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshInterval, setRefreshIntervalState] = useState<number>(() => {
    const saved = localStorage.getItem('netshield_refresh_interval');
    return saved !== null ? parseInt(saved, 10) : 10;
  });
  const [apiUrl, setApiUrlState] = useState<string>(() => apiClient.getBaseUrl());

  // Load session history from sessionStorage
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addPredictionToHistory = useCallback((item: PredictionHistoryItem) => {
    setPredictionHistory((prev) => {
      const next = [item, ...prev].slice(0, 100); // keep most recent 100
      try {
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota exceeded fallback
      }
      return next;
    });
  }, []);

  const removeHistoryItems = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setPredictionHistory((prev) => {
      const next = prev.filter((item) => !idSet.has(item.id));
      try {
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota fallback
      }
      return next;
    });
  }, []);

  const restoreHistoryItems = useCallback((items: PredictionHistoryItem[]) => {
    setPredictionHistory((prev) => {
      const next = [...items, ...prev].slice(0, 100);
      try {
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota fallback
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPredictionHistory([]);
    sessionStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const setRefreshInterval = (seconds: number) => {
    setRefreshIntervalState(seconds);
    localStorage.setItem('netshield_refresh_interval', String(seconds));
  };

  const setApiUrl = (url: string) => {
    apiClient.setBaseUrl(url);
    setApiUrlState(url);
    refreshData();
  };

  const resetApiUrl = () => {
    apiClient.resetBaseUrl();
    setApiUrlState(apiClient.getBaseUrl());
    refreshData();
  };

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);

    const pingStart = performance.now();
    try {
      // Fetch Health
      const healthData = await apiClient.getHealth();
      const latency = Math.round(performance.now() - pingStart);
      setHealth(healthData);
      setPingLatency(latency);
      setConnectionStatus(healthData.status === 'healthy' ? 'connected' : 'error');

      // Fetch Models
      const modelsData = await apiClient.getModels();
      setModels(modelsData.models);
      if (modelsData.default_model && !selectedModel) {
        setSelectedModel(modelsData.default_model);
      }

      // Fetch Statistics
      const statsData = await apiClient.getStatistics();
      setStatistics(statsData);

      setLastUpdated(new Date());
    } catch (err: unknown) {
      setConnectionStatus('disconnected');
      setPingLatency(null);
      const msg = err instanceof Error ? err.message : 'Failed to connect to NetShield backend.';
      setErrorMessage(msg);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedModel]);

  const [isSampleRunning, setIsSampleRunning] = useState<boolean>(false);

  const runSampleFlow = useCallback(
    async (count = 1) => {
      if (isSampleRunning) return;
      setIsSampleRunning(true);
      try {
        const samplesToRun =
          count === 1
            ? [SAMPLE_FLOWS[Math.floor(Math.random() * SAMPLE_FLOWS.length)]]
            : SAMPLE_FLOWS.slice(0, Math.min(count, SAMPLE_FLOWS.length));

        for (const sample of samplesToRun) {
          const res = await apiClient.predict(sample.flow, selectedModel);
          addPredictionToHistory({
            id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
        }
        await refreshData();
      } catch (err) {
        console.error('Failed to run sample flow:', err);
      } finally {
        setIsSampleRunning(false);
      }
    },
    [isSampleRunning, selectedModel, addPredictionToHistory, refreshData]
  );

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Polling timer
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      refreshData();
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, refreshData]);

  return (
    <AppContext.Provider
      value={{
        connectionStatus,
        pingLatency,
        health,
        models,
        selectedModel,
        setSelectedModel,
        statistics,
        predictionHistory,
        addPredictionToHistory,
        removeHistoryItems,
        restoreHistoryItems,
        clearHistory,
        runSampleFlow,
        isSampleRunning,
        refreshInterval,
        setRefreshInterval,
        refreshData,
        isRefreshing,
        lastUpdated,
        errorMessage,
        apiUrl,
        setApiUrl,
        resetApiUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
