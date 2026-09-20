from pathlib import Path
import json

import numpy as np
import pandas as pd
import xgboost as xgb


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = (
    BASE_DIR
    / "models"
    / "xgboost"
    / "fault_xgboost_model"
)

MODEL_PATH = (
    MODEL_DIR
    / "fault_classifier_xgboost.json"
)

LABEL_MAPPING_PATH = (
    MODEL_DIR
    / "label_mapping.json"
)

FEATURE_COLUMNS_PATH = (
    MODEL_DIR
    / "feature_columns.json"
)


with FEATURE_COLUMNS_PATH.open(
    "r",
    encoding="utf-8",
) as file:
    FEATURE_COLUMNS = json.load(file)


with LABEL_MAPPING_PATH.open(
    "r",
    encoding="utf-8",
) as file:
    LABEL_MAPPING = json.load(file)


# Load the XGBoost artifact once.
_MODEL = xgb.XGBClassifier()

_MODEL.load_model(
    str(MODEL_PATH)
)


def _timestamp_features(value):
    """
    Reproduce the preprocessing used while training XGBoost.

    Training used:
        pd.to_datetime(df["timestamp"])

    and extracted:
        year
        month
        day
        hour
        minute
    """

    timestamp = pd.to_datetime(
        pd.Series([value]),
        errors="coerce",
    )

    if timestamp.isna().any():
        raise ValueError(
            "Invalid timestamp. Send the same timestamp "
            "format used by the XGBoost training dataset."
        )

    ts = timestamp.iloc[0]

    return {
        "timestamp_year": float(ts.year),
        "timestamp_month": float(ts.month),
        "timestamp_day": float(ts.day),
        "timestamp_hour": float(ts.hour),
        "timestamp_minute": float(ts.minute),
    }


def predict_fault(request):
    data = request.model_dump()

    timestamp_features = _timestamp_features(
        data.get("timestamp", 0)
    )

    row = {
        "x": data["x"],
        "y": data["y"],
        "speed": data["speed"],
        "battery_level": data["battery_level"],
        "cpu_usage": data["cpu_usage"],
        "memory_usage": data["memory_usage"],
        "signal_strength": data["signal_strength"],
        "packet_loss": data["packet_loss"],
        "latency": data["latency"],
        "active": (
            1
            if data["active"]
            else 0
        ),
        **timestamp_features,
    }

    X = pd.DataFrame(
        [row]
    )[FEATURE_COLUMNS]

    X = X.apply(
        pd.to_numeric,
        errors="coerce",
    )

    if X.isna().any().any():
        bad = X.columns[
            X.isna().any()
        ].tolist()

        raise ValueError(
            f"Invalid XGBoost features: {bad}"
        )

    probabilities = np.asarray(
        _MODEL.predict_proba(X)
    )[0]

    class_ids = np.asarray(
        _MODEL.classes_
    )

    predicted_class_id = int(
        _MODEL.predict(X)[0]
    )

    predicted_fault = LABEL_MAPPING.get(
        str(predicted_class_id),
        str(predicted_class_id),
    )

    probability_by_fault = {
        LABEL_MAPPING.get(
            str(int(class_id)),
            str(int(class_id)),
        ): float(probability)

        for class_id, probability
        in zip(
            class_ids,
            probabilities,
        )
    }

    predicted_index = list(
        class_ids
    ).index(
        predicted_class_id
    )

    return {
        "node_id": request.node_id,
        "fault_prediction": predicted_fault,
        "fault_prediction_code": predicted_class_id,
        "fault_probability": round(
            float(
                probabilities[
                    predicted_index
                ]
            ),
            6,
        ),
        "class_probabilities": (
            probability_by_fault
        ),
        "model": "XGBoost",
    }