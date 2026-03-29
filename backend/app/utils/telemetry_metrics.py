"""Helpers for reading numeric values from flexible telemetry JSON payloads."""
import math
from typing import Any, Optional


def get_metric_value(data: Optional[dict], key: str) -> Optional[float]:
    """Return a finite float for key, or None if missing or not coercible."""
    if not data or not isinstance(data, dict):
        return None
    value = data.get(key)
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return f


def normalize_telemetry_data(data: dict[str, Any]) -> dict[str, float]:
    """Keep only keys whose values coerce to finite floats (drops non-numeric)."""
    out: dict[str, float] = {}
    for k, v in data.items():
        key = str(k)
        coerced = get_metric_value({key: v}, key)
        if coerced is not None:
            out[key] = coerced
    return out
