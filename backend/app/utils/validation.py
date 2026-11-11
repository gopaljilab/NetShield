"""NetShield Validation and Error Sanitization Utilities."""

import re
from typing import Any, Dict, List
from fastapi.exceptions import RequestValidationError


def sanitize_error_message(message: str) -> str:
    """Strip server-internal file paths and sensitive system details from error messages."""
    # Redact Unix/Mac and Windows absolute filesystem paths
    sanitized = re.sub(r"/(?:Users|home|private|tmp|var|etc|opt)/[^\s'\"]+", "[REDACTED_PATH]", message)
    sanitized = re.sub(r"[A-Za-z]:\\[^\s'\"]+", "[REDACTED_PATH]", sanitized)
    return sanitized


def format_validation_errors(exc: RequestValidationError) -> List[Dict[str, Any]]:
    """Format Pydantic RequestValidationErrors into structured, user-friendly details."""
    errors = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "Validation error")
        # Remove pydantic's "Value error, " prefix if present for cleaner output
        clean_msg = msg.replace("Value error, ", "").strip()
        errors.append({
            "field": field_path if field_path else "root",
            "message": sanitize_error_message(clean_msg),
            "type": err.get("type", "validation_error"),
        })
    return errors
