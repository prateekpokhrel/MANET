from pathlib import Path
import json

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = (
    BASE_DIR
    / "models"
    / "recoverability engine"
    / "recoverability_engine_model"
)

SCORE_MODEL_PATH = (
    MODEL_DIR
    / "recoverability_score_model.pkl"
)

SUCCESS_MODEL_PATH = (
    MODEL_DIR
    / "recovery_success_model.pkl"
)

CONFIG_PATH = (
    MODEL_DIR
    / "config.json"
)


with CONFIG_PATH.open(
    "r",
    encoding="utf-8",
) as file:
    CONFIG = json.load(file)


NUMERIC_FEATURES = CONFIG[
    "numeric_features"
]

CATEGORICAL_FEATURES = CONFIG[
    "categorical_features"
]

ACTIONS = CONFIG[
    "actions"
]

DECISION_THRESHOLD = float(
    CONFIG.get(
        "decision_threshold",
        55,
    )
)


_SCORE_MODEL = joblib.load(
    SCORE_MODEL_PATH
)

_SUCCESS_MODEL = joblib.load(
    SUCCESS_MODEL_PATH
)


MODEL_COLUMNS = (
    NUMERIC_FEATURES
    + [
        "fault_type_for_engine",
        "fault_severity",
        "candidate_action",
    ]
)


def _build_candidate_row(
    request,
    action,
):
    values = {
        "failure_probability": (
            request.failure_probability
        ),
        "fault_type_for_engine": (
            request.fault_type_for_engine
        ),
        "fault_severity": (
            request.fault_severity
        ),
        "node_health_score": (
            request.node_health_score
        ),
        "battery_level": (
            request.battery_level
        ),
        "link_quality": (
            request.link_quality
        ),
        "available_neighbor_nodes": (
            request.available_neighbor_nodes
        ),
        "number_of_alternative_routes": (
            request.number_of_alternative_routes
        ),
        "alternative_route_quality": (
            request.alternative_route_quality
        ),
        "current_traffic_load": (
            request.current_traffic_load
        ),
        "previous_recovery_history": (
            request.previous_recovery_history
        ),
        "predicted_link_quality": (
            request.predicted_link_quality
        ),
        "anomaly_score": (
            request.anomaly_score
        ),
        "candidate_action": action,
    }

    return pd.DataFrame(
        [
            [
                values[column]
                for column in MODEL_COLUMNS
            ]
        ],
        columns=MODEL_COLUMNS,
    )


def predict_recovery(request):

    action_results = []

    for action in ACTIONS:

        X = _build_candidate_row(
            request,
            action,
        )

        recoverability_score = float(
            _SCORE_MODEL.predict(X)[0]
        )

        success_probability = None
        success_prediction = None

        if hasattr(
            _SUCCESS_MODEL,
            "predict_proba",
        ):

            probabilities = (
                _SUCCESS_MODEL
                .predict_proba(X)[0]
            )

            classes = list(
                _SUCCESS_MODEL
                .named_steps[
                    "model"
                ]
                .classes_
            )

            if 1 in classes:

                success_index = (
                    classes.index(1)
                )

                success_probability = float(
                    probabilities[
                        success_index
                    ]
                )

            else:

                success_probability = float(
                    max(probabilities)
                )

        if hasattr(
            _SUCCESS_MODEL,
            "predict",
        ):

            success_code = int(
                _SUCCESS_MODEL.predict(
                    X
                )[0]
            )

            success_prediction = (
                "Success"
                if success_code == 1
                else "Failure"
            )

        action_results.append(
            {
                "action": action,
                "recoverability_score": round(
                    recoverability_score,
                    4,
                ),
                "recovery_success_probability": (
                    round(
                        success_probability,
                        6,
                    )
                    if success_probability
                    is not None
                    else None
                ),
                "recovery_success_percent": (
                    round(
                        success_probability * 100.0,
                        2,
                    )
                    if success_probability
                    is not None
                    else None
                ),
                "success_prediction": (
                    success_prediction
                ),
            }
        )

    # Pick the action with the highest
    # predicted recoverability score.
    best = max(
        action_results,
        key=lambda item:
            item["recoverability_score"],
    )

    if (
        best["recoverability_score"]
        >= DECISION_THRESHOLD
    ):

        decision = (
            "AI Recoverable"
        )

        recommended_action = (
            best["action"]
        )

    else:

        decision = (
            "Human Intervention Required"
        )

        recommended_action = (
            "NOTIFY_OPERATOR"
        )

    return {
        "node_id": request.node_id,
        "recoverability_score": (
            best["recoverability_score"]
        ),
        "recovery_decision": decision,
        "recommended_recovery_action": (
            recommended_action
        ),
        "decision_threshold": (
            DECISION_THRESHOLD
        ),
        "best_action_success_probability": (
            best[
                "recovery_success_probability"
            ]
        ),
        "best_action_success_percent": (
            best[
                "recovery_success_percent"
            ]
        ),
        "action_evaluations": (
            action_results
        ),
        "possible_recovery_actions": (
            ACTIONS
        ),
        "model": (
            "Recoverability Engine"
        ),
    }