from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = (
    BASE_DIR
    / "models"
    / "isolation"
    / "isolation_forest_model"
)

MODEL_PATH = (
    MODEL_DIR
    / "isolation_forest_model.joblib"
)

SCALER_PATH = (
    MODEL_DIR
    / "anomaly_scaler.joblib"
)

FEATURE_COLUMNS = [
    "cpu",
    "memory",
    "battery",
    "rssi",
    "packet_loss",
    "latency",
    "throughput",
    "queue_size",
    "traffic_load",
    "link_quality",
    "mobility_speed",
]

# Load once.
_MODEL = joblib.load(
    MODEL_PATH
)

_SCALER = joblib.load(
    SCALER_PATH
)


def detect_anomaly(request):

    values = [
        request.cpu,
        request.memory,
        request.battery,
        request.rssi,
        request.packet_loss,
        request.latency,
        request.throughput,
        request.queue_size,
        request.traffic_load,
        request.link_quality,
        request.mobility_speed,
    ]

    # Keep feature names because the saved StandardScaler
    # was fitted with named columns.
    X = pd.DataFrame(
        [values],
        columns=FEATURE_COLUMNS,
        dtype=float,
    )

    # The saved Isolation Forest was trained using
    # standardized data.
    X_scaled = _SCALER.transform(
        X
    )

    model_prediction = int(
        _MODEL.predict(
            X_scaled
        )[0]
    )

    decision = float(
        _MODEL.decision_function(
            X_scaled
        )[0]
    )

    # Config defines anomaly score as negative decision function.
    anomaly_score = -decision

    status = (
        "Anomalous"
        if model_prediction == -1
        else "Normal"
    )

    return {
        "node_id": request.node_id,
        "anomaly_status": status,
        "anomaly_prediction_code": (
            model_prediction
        ),
        "anomaly_score": round(
            anomaly_score,
            6,
        ),
        "decision_function": round(
            decision,
            6,
        ),
        "model": "Isolation Forest",
    }