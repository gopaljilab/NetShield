"""Pytest fixtures and test setup for NetShield Backend."""

from typing import Dict, Any, Generator
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.prediction_service import prediction_service


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """TestClient instance wrapped in application lifespan."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_service_statistics():
    """Reset ephemeral runtime statistics before each test for clean isolation."""
    prediction_service.reset_statistics()


@pytest.fixture(scope="session")
def sample_normal_flow() -> Dict[str, Any]:
    """Extract a verified Normal flow from UNSW-NB15 test partition."""
    # Row index 4 in testing-set.csv is verified Normal traffic (label=0)
    return {
        "dur": 0.449454,
        "proto": "tcp",
        "service": "-",
        "state": "FIN",
        "spkts": 10.0,
        "dpkts": 6.0,
        "sbytes": 534.0,
        "dbytes": 268.0,
        "rate": 33.373826,
        "sttl": 254.0,
        "dttl": 252.0,
        "sload": 8561.499023,
        "dload": 3987.059814,
        "sloss": 2.0,
        "dloss": 1.0,
        "sinpkt": 47.750333,
        "dinpkt": 75.659602,
        "sjit": 2415.837634,
        "djit": 115.807,
        "swin": 255.0,
        "stcpb": 2436137549.0,
        "dtcpb": 1977154190.0,
        "dwin": 255.0,
        "tcprtt": 0.128381,
        "synack": 0.071147,
        "ackdat": 0.057234,
        "smean": 53.0,
        "dmean": 45.0,
        "trans_depth": 0.0,
        "response_body_len": 0.0,
        "ct_srv_src": 43.0,
        "ct_state_ttl": 1.0,
        "ct_dst_ltm": 2.0,
        "ct_src_dport_ltm": 2.0,
        "ct_dst_sport_ltm": 1.0,
        "ct_dst_src_ltm": 40.0,
        "is_ftp_login": 0.0,
        "ct_ftp_cmd": 0.0,
        "ct_flw_http_mthd": 0.0,
        "ct_src_ltm": 2.0,
        "ct_srv_dst": 39.0,
        "is_sm_ips_ports": 0.0,
    }


@pytest.fixture(scope="session")
def sample_attack_flow() -> Dict[str, Any]:
    """Extract a verified Attack flow from UNSW-NB15 test partition."""
    # Row index 47911 in testing-set.csv is verified Attack traffic (label=1)
    return {
        "dur": 0.000009,
        "proto": "ddp",
        "service": "-",
        "state": "INT",
        "spkts": 2.0,
        "dpkts": 0.0,
        "sbytes": 200.0,
        "dbytes": 0.0,
        "rate": 111111.1072,
        "sttl": 254.0,
        "dttl": 0.0,
        "sload": 88888888.0,
        "dload": 0.0,
        "sloss": 0.0,
        "dloss": 0.0,
        "sinpkt": 0.009,
        "dinpkt": 0.0,
        "sjit": 0.0,
        "djit": 0.0,
        "swin": 0.0,
        "stcpb": 0.0,
        "dtcpb": 0.0,
        "dwin": 0.0,
        "tcprtt": 0.0,
        "synack": 0.0,
        "ackdat": 0.0,
        "smean": 100.0,
        "dmean": 0.0,
        "trans_depth": 0.0,
        "response_body_len": 0.0,
        "ct_srv_src": 4.0,
        "ct_state_ttl": 2.0,
        "ct_dst_ltm": 1.0,
        "ct_src_dport_ltm": 1.0,
        "ct_dst_sport_ltm": 1.0,
        "ct_dst_src_ltm": 4.0,
        "is_ftp_login": 0.0,
        "ct_ftp_cmd": 0.0,
        "ct_flw_http_mthd": 0.0,
        "ct_src_ltm": 2.0,
        "ct_srv_dst": 4.0,
        "is_sm_ips_ports": 0.0,
    }
