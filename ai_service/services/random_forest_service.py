from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "random_forest"
    / "random_forest_failure.pkl"
)

FEATURE_COLUMNS = [
    "node_id",
    "x",
    "y",
    "speed",
    "battery_level",
    "cpu_usage",
    "memory_usage",
    "signal_strength",
    "packet_loss",
    "latency",
]

# Load once when the service starts.
_MODEL = joblib.load(MODEL_PATH)


def predict_failure(request):
    data = request.model_dump()

    row = pd.DataFrame([data])

    missing = [
        column
        for column in FEATURE_COLUMNS
        if column not in row.columns
    ]

    if missing:
        raise ValueError(
            f"Missing Random Forest features: {missing}"
        )

    X = row[FEATURE_COLUMNS].apply(
        pd.to_numeric,
        errors="coerce",
    )

    if X.isna().any().any():
        bad = X.columns[X.isna().any()].tolist()

        raise ValueError(
            f"Non-numeric/invalid Random Forest values: {bad}"
        )

    probabilities = _MODEL.predict_proba(X)[0]

    prediction = int(
        _MODEL.predict(X)[0]
    )

    # Saved model classes are [0, 1].
    # 1 = faulty/failure.
    failure_class_index = list(
        _MODEL.classes_
    ).index(1)

    failure_probability = float(
        probabilities[failure_class_index]
    )

    return {
        "node_id": request.node_id,
        "failure_probability": round(
            failure_probability,
            6,
        ),
        "failure_probability_percent": round(
            failure_probability * 100.0,
            2,
        ),
        "failure_prediction": (
            "Failure"
            if prediction == 1
            else "Normal"
        ),
        "failure_prediction_code": prediction,
        "model": "Random Forest",
    }