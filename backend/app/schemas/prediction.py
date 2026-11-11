"""Pydantic schemas for network flow prediction requests and responses."""

from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


class NetworkFlowInput(BaseModel):
    """Network flow feature record matching the 42 UNSW-NB15 input features.

    Strictly forbids 'id', 'attack_cat', and 'label' to guarantee zero data leakage.
    Enforces non-negative numerical metrics.
    Optionally accepts 'model_name' to allow model selection in the flow payload.
    """
    model_config = ConfigDict(extra="forbid")

    # 3 Categorical Features
    proto: str = Field(..., description="Transaction protocol (e.g., 'tcp', 'udp', 'arp')")
    service: str = Field(..., description="Destination service (e.g., 'http', 'dns', '-')")
    state: str = Field(..., description="State and its dependent protocol (e.g., 'FIN', 'INT', 'CON')")

    # 39 Numerical Features
    dur: float = Field(..., ge=0.0, description="Record total duration (seconds)")
    spkts: float = Field(..., ge=0.0, description="Source to destination packet count")
    dpkts: float = Field(..., ge=0.0, description="Destination to source packet count")
    sbytes: float = Field(..., ge=0.0, description="Source to destination transaction bytes")
    dbytes: float = Field(..., ge=0.0, description="Destination to source transaction bytes")
    rate: float = Field(..., ge=0.0, description="Flow throughput in packets per second")
    sttl: float = Field(..., ge=0.0, description="Source to destination time to live")
    dttl: float = Field(..., ge=0.0, description="Destination to source time to live")
    sload: float = Field(..., ge=0.0, description="Source bits per second")
    dload: float = Field(..., ge=0.0, description="Destination bits per second")
    sloss: float = Field(..., ge=0.0, description="Source packets retransmitted or dropped")
    dloss: float = Field(..., ge=0.0, description="Destination packets retransmitted or dropped")
    sinpkt: float = Field(..., ge=0.0, description="Source interpacket arrival time (mSec)")
    dinpkt: float = Field(..., ge=0.0, description="Destination interpacket arrival time (mSec)")
    sjit: float = Field(..., ge=0.0, description="Source jitter (mSec)")
    djit: float = Field(..., ge=0.0, description="Destination jitter (mSec)")
    swin: float = Field(..., ge=0.0, description="Source TCP window advertisement value")
    stcpb: float = Field(..., ge=0.0, description="Source TCP base sequence number")
    dtcpb: float = Field(..., ge=0.0, description="Destination TCP base sequence number")
    dwin: float = Field(..., ge=0.0, description="Destination TCP window advertisement value")
    tcprtt: float = Field(..., ge=0.0, description="TCP connection setup round-trip time")
    synack: float = Field(..., ge=0.0, description="TCP setup time between SYN and SYN_ACK")
    ackdat: float = Field(..., ge=0.0, description="TCP setup time between SYN_ACK and ACK")
    smean: float = Field(..., ge=0.0, description="Mean flow packet size transmitted by src")
    dmean: float = Field(..., ge=0.0, description="Mean flow packet size transmitted by dst")
    trans_depth: float = Field(..., ge=0.0, description="Pipeline depth of HTTP request/response")
    response_body_len: float = Field(..., ge=0.0, description="Uncompressed content size of HTTP response")
    ct_srv_src: float = Field(..., ge=0.0, description="No. connections with same service and src in 100 connections")
    ct_state_ttl: float = Field(..., ge=0.0, description="Count of state according to TTL range")
    ct_dst_ltm: float = Field(..., ge=0.0, description="No. connections of same dst in 100 connections")
    ct_src_dport_ltm: float = Field(..., ge=0.0, description="No. connections of same src and dst port in 100 connections")
    ct_dst_sport_ltm: float = Field(..., ge=0.0, description="No. connections of same dst and src port in 100 connections")
    ct_dst_src_ltm: float = Field(..., ge=0.0, description="No. connections of same src and dst in 100 connections")
    is_ftp_login: float = Field(..., ge=0.0, le=1.0, description="1 if FTP session authenticated by user/pass, else 0")
    ct_ftp_cmd: float = Field(..., ge=0.0, description="No. flows with command in FTP session")
    ct_flw_http_mthd: float = Field(..., ge=0.0, description="No. flows with HTTP methods (GET, POST)")
    ct_src_ltm: float = Field(..., ge=0.0, description="No. connections of same src in 100 connections")
    ct_srv_dst: float = Field(..., ge=0.0, description="No. connections with same service and dst in 100 connections")
    is_sm_ips_ports: float = Field(..., ge=0.0, le=1.0, description="1 if src and dst IP/ports are identical, else 0")

    # Optional model override inside the body
    model_name: Optional[str] = Field(
        None,
        description="Optional model override (e.g. 'xgboost', 'random_forest')"
    )

    @model_validator(mode="before")
    @classmethod
    def reject_leakage_and_metadata(cls, data: Any) -> Any:
        if isinstance(data, dict):
            forbidden = [k for k in ["label", "attack_cat", "id"] if k in data]
            if forbidden:
                raise ValueError(
                    f"Forbidden leakage/metadata field(s) detected: {forbidden}. "
                    "NetShield prohibits passing 'label', 'attack_cat', or 'id' in prediction requests."
                )
        return data


class PredictionResponse(BaseModel):
    """Prediction outcome for a single network flow record."""
    prediction: int = Field(..., description="0 for Normal traffic, 1 for Attack traffic")
    label: str = Field(..., description="'Normal' or 'Attack'")
    probability: Optional[float] = Field(
        None,
        description="Estimated probability of attack (0.0 to 1.0) if supported by model"
    )
    model_used: str = Field(..., description="Name of the model used for classification")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of inference")
    preprocessing_duration_ms: float = Field(..., description="Feature transformation latency in milliseconds")
    inference_duration_ms: float = Field(..., description="Model inference latency in milliseconds")
    total_duration_ms: float = Field(..., description="Total end-to-end request latency in milliseconds")


class BatchPredictionRequest(BaseModel):
    """Batch prediction request schema."""
    model_config = ConfigDict(extra="forbid")
    flows: List[NetworkFlowInput] = Field(
        ...,
        min_length=1,
        description="List of network flow records to classify"
    )
    model_name: Optional[str] = Field(
        None,
        description="Optional model override for the entire batch (e.g. 'xgboost', 'random_forest')"
    )


class BatchPredictionResponse(BaseModel):
    """Summary and itemized results for a batch prediction request."""
    total_flows: int = Field(..., description="Total number of network flows processed")
    normal_count: int = Field(..., description="Count of flows classified as Normal")
    attack_count: int = Field(..., description="Count of flows classified as Attack")
    model_used: str = Field(..., description="Model identifier used for the batch")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of batch completion")
    batch_duration_ms: float = Field(..., description="Total duration for the entire batch (ms)")
    predictions: List[PredictionResponse] = Field(..., description="Itemized prediction per flow")
