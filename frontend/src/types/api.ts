/**
 * TypeScript interfaces matching the NetShield FastAPI backend schemas exactly.
 */

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  models_loaded: boolean;
  available_models: string[];
  default_model: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface ModelMetadata {
  name: string;
  display_name: string;
  algorithm_type: string;
  is_default: boolean;
  supports_probability: boolean;
  accuracy_pct: number | null;
  precision_pct: number | null;
  recall_pct: number | null;
  f1_pct: number | null;
  fpr_pct: number | null;
  fnr_pct: number | null;
  roc_auc_pct: number | null;
  latency_ms_per_1k: number | null;
  description: string;
}

export interface ModelsListResponse {
  models: ModelMetadata[];
  default_model: string;
}

export interface StatisticsResponse {
  total_predictions: number;
  normal_predictions: number;
  attack_predictions: number;
  predictions_by_model: Record<string, number>;
  uptime_seconds: number;
  server_start_time: string;
  timestamp: string;
  ephemeral_notice: string;
}

export interface PredictionResponse {
  prediction: 0 | 1;
  label: 'Normal' | 'Attack';
  probability: number | null;
  model_used: string;
  timestamp: string;
  preprocessing_duration_ms: number;
  inference_duration_ms: number;
  total_duration_ms: number;
}

export interface BatchPredictionResponse {
  total_flows: number;
  normal_count: number;
  attack_count: number;
  model_used: string;
  timestamp: string;
  batch_duration_ms: number;
  predictions: PredictionResponse[];
}

export interface ApiErrorResponse {
  error?: string;
  detail?: string | Array<{ field: string; message: string; type: string }>;
  message?: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
