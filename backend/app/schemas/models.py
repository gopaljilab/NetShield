"""Model metadata and discovery response schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class ModelMetadata(BaseModel):
    """Metadata and performance benchmarks for a registered machine learning model."""
    name: str = Field(..., description="Unique model identifier used in API requests")
    display_name: str = Field(..., description="Human-readable title for UI and documentation")
    algorithm_type: str = Field(..., description="Machine learning family/class")
    is_default: bool = Field(..., description="Whether this is the default prediction model")
    supports_probability: bool = Field(..., description="True if predict_proba is supported")
    accuracy_pct: Optional[float] = Field(None, description="Test accuracy percentage on UNSW-NB15")
    precision_pct: Optional[float] = Field(None, description="Test precision percentage on UNSW-NB15")
    recall_pct: Optional[float] = Field(None, description="Test recall percentage on UNSW-NB15")
    f1_pct: Optional[float] = Field(None, description="Test F1-score percentage on UNSW-NB15")
    fpr_pct: Optional[float] = Field(None, description="Test false positive rate percentage")
    fnr_pct: Optional[float] = Field(None, description="Test false negative rate percentage")
    roc_auc_pct: Optional[float] = Field(None, description="Test ROC-AUC percentage")
    latency_ms_per_1k: Optional[float] = Field(None, description="Benchmark latency in ms per 1,000 flows")
    description: str = Field(..., description="Brief summary of algorithm strengths and characteristics")


class ModelsListResponse(BaseModel):
    """List of all available models in the NetShield deployment."""
    models: List[ModelMetadata] = Field(..., description="Available models with benchmark metrics")
    default_model: str = Field(..., description="Current default model identifier")
