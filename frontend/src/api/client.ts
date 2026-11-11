import {
  HealthResponse,
  ModelsListResponse,
  StatisticsResponse,
  PredictionResponse,
  BatchPredictionResponse,
} from '../types/api';
import { NetworkFlowRecord } from '../types/flow';

// Default backend API URL with fallback order: localStorage -> env -> default
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class NetShieldApiClient {
  private baseUrl: string;

  constructor() {
    let stored = localStorage.getItem('netshield_api_url');
    // If stored URL points to a known non-backend frontend port (e.g. 3001, 3000, 5173, 5174, 5175)
    // or is pointing to the same port as the frontend, clean it and reset to DEFAULT_API_URL (port 8000)
    if (stored) {
      const isFrontendPort = /:(3000|3001|5173|5174|5175)\b/.test(stored);
      if (isFrontendPort) {
        console.warn(`[NetShield] Clearing stale frontend URL "${stored}" from localStorage. Resetting to backend: ${DEFAULT_API_URL}`);
        localStorage.removeItem('netshield_api_url');
        stored = null;
      }
    }
    this.baseUrl = stored || DEFAULT_API_URL;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    // Strip trailing slash if present
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('netshield_api_url', this.baseUrl);
  }

  public resetBaseUrl(): void {
    this.baseUrl = DEFAULT_API_URL;
    localStorage.removeItem('netshield_api_url');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            if (Array.isArray(errorJson.detail)) {
              // Pydantic validation error array
              const fieldErrors = errorJson.detail
                .map((d: { field?: string; message?: string; loc?: string[]; msg?: string }) => {
                  const field = d.field || (d.loc ? d.loc.join('.') : 'field');
                  const msg = d.message || d.msg || 'Invalid value';
                  return `${field}: ${msg}`;
                })
                .join('; ');
              errorMessage = `Validation failed: ${fieldErrors}`;
            } else {
              errorMessage = String(errorJson.detail);
            }
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
          // If response body is not JSON, use default status text
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      // Auto-recovery: If connection failed and we were using a non-default URL (like an accidental frontend port),
      // auto-reset to DEFAULT_API_URL (http://localhost:8000) and retry once!
      if (this.baseUrl !== DEFAULT_API_URL) {
        console.warn(`[NetShield] Request to ${this.baseUrl} failed. Auto-recovering to backend at ${DEFAULT_API_URL}...`);
        this.resetBaseUrl();
        try {
          const recoveryUrl = `${DEFAULT_API_URL}${endpoint}`;
          const recoveryResponse = await fetch(recoveryUrl, { ...options, headers });
          if (recoveryResponse.ok) {
            return (await recoveryResponse.json()) as T;
          }
        } catch {
          // Fall through to proxy attempt
        }
      }

      // Secondary auto-recovery: Try relative endpoint through Vite dev proxy
      if (typeof window !== 'undefined' && this.baseUrl !== '') {
        try {
          const proxyResponse = await fetch(endpoint, { ...options, headers });
          if (proxyResponse.ok) {
            return (await proxyResponse.json()) as T;
          }
        } catch {
          // Fall through to original error
        }
      }

      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unknown network error occurred while communicating with NetShield backend.');
    }
  }

  // Health and Readiness
  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/v1/health');
  }

  // Models Discovery
  public async getModels(): Promise<ModelsListResponse> {
    return this.request<ModelsListResponse>('/api/v1/models');
  }

  // Cumulative Runtime Telemetry
  public async getStatistics(): Promise<StatisticsResponse> {
    return this.request<StatisticsResponse>('/api/v1/statistics');
  }

  // Single Flow Classification
  public async predict(
    flow: NetworkFlowRecord,
    modelName?: string
  ): Promise<PredictionResponse> {
    const query = modelName ? `?model_name=${encodeURIComponent(modelName)}` : '';
    return this.request<PredictionResponse>(`/api/v1/predict${query}`, {
      method: 'POST',
      body: JSON.stringify(flow),
    });
  }

  // Batch Flows Classification
  public async predictBatch(
    flows: NetworkFlowRecord[],
    modelName?: string
  ): Promise<BatchPredictionResponse> {
    const query = modelName ? `?model_name=${encodeURIComponent(modelName)}` : '';
    return this.request<BatchPredictionResponse>(`/api/v1/predict/batch${query}`, {
      method: 'POST',
      body: JSON.stringify({ flows, model_name: modelName }),
    });
  }

  // Latency & Connection Ping
  public async ping(): Promise<{ latencyMs: number; healthy: boolean }> {
    const start = performance.now();
    try {
      const health = await this.getHealth();
      const latencyMs = Math.round(performance.now() - start);
      return { latencyMs, healthy: health.status === 'healthy' };
    } catch {
      return { latencyMs: -1, healthy: false };
    }
  }
}

export const apiClient = new NetShieldApiClient();
