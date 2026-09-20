from pathlib import Path

import joblib
import numpy as np
import keras


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = (
    BASE_DIR
    / "models"
    / "lstm"
    / "lstm_link_quality_model"
)

MODEL_PATH = (
    MODEL_DIR
    / "lstm_link_quality.keras"
)

FEATURE_SCALER_PATH = (
    MODEL_DIR
    / "feature_scaler.pkl"
)

LINK_QUALITY_SCALER_PATH = (
    MODEL_DIR
    / "link_quality_scaler.pkl"
)

RSSI_SCALER_PATH = (
    MODEL_DIR
    / "rssi_scaler.pkl"
)

SEQUENCE_LENGTH = 5

FEATURE_COLUMNS = [
    "rssi",
    "packet_loss",
    "latency",
    "throughput",
    "link_quality",
    "node_distance",
    "mobility_speed",
]


# Load once.
_MODEL = keras.models.load_model(
    MODEL_PATH,
    compile=False,
)

_FEATURE_SCALER = joblib.load(
    FEATURE_SCALER_PATH
)

_LINK_QUALITY_SCALER = joblib.load(
    LINK_QUALITY_SCALER_PATH
)

_RSSI_SCALER = joblib.load(
    RSSI_SCALER_PATH
)


def predict_link_quality(request):

    if len(request.sequence) != SEQUENCE_LENGTH:
        raise ValueError(
            f"LSTM requires exactly "
            f"{SEQUENCE_LENGTH} historical time steps."
        )

    rows = []

    for timestep in request.sequence:

        rows.append([
            timestep.rssi,
            timestep.packet_loss,
            timestep.latency,
            timestep.throughput,
            timestep.link_quality,
            timestep.node_distance,
            timestep.mobility_speed,
        ])

    X = np.asarray(
        rows,
        dtype=np.float32,
    )

    # Scale each historical row.
    X_scaled = _FEATURE_SCALER.transform(
        X
    )

    # Required model shape:
    # (batch, time_steps, features)
    X_scaled = X_scaled.reshape(
        1,
        SEQUENCE_LENGTH,
        len(FEATURE_COLUMNS),
    )

    predictions = _MODEL.predict(
        X_scaled,
        verbose=0,
    )

    # Model outputs:
    # 0 -> future_link_quality
    # 1 -> future_rssi
    # 2 -> failure_risk

    future_link_quality_scaled = (
        np.asarray(
            predictions[0]
        ).reshape(
            -1,
            1,
        )
    )

    future_rssi_scaled = (
        np.asarray(
            predictions[1]
        ).reshape(
            -1,
            1,
        )
    )

    failure_risk = float(
        np.asarray(
            predictions[2]
        ).reshape(
            -1
        )[0]
    )

    # Convert predicted values back to
    # their original units.
    future_link_quality = float(
        _LINK_QUALITY_SCALER
        .inverse_transform(
            future_link_quality_scaled
        )[0, 0]
    )

    future_rssi = float(
        _RSSI_SCALER
        .inverse_transform(
            future_rssi_scaled
        )[0, 0]
    )

    # Keep risk within [0,1].
    failure_risk = max(
        0.0,
        min(
            1.0,
            failure_risk,
        ),
    )

    # Saved LSTM configuration uses 0.05
    # as the future link-quality proxy threshold.
    link_failure_risk_status = (
        "High"
        if future_link_quality < 0.05
        else "Low"
    )

    return {
        "node_id": request.node_id,
        "predicted_future_link_quality": round(
            future_link_quality,
            6,
        ),
        "predicted_future_rssi": round(
            future_rssi,
            6,
        ),
        "failure_risk": round(
            failure_risk,
            6,
        ),
        "failure_risk_percent": round(
            failure_risk * 100.0,
            2,
        ),
        "link_failure_risk_status": (
            link_failure_risk_status
        ),
        "model": "LSTM",
        "sequence_length": SEQUENCE_LENGTH,
    }