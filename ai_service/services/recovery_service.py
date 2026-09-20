from pathlib import Path
import json

import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

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


# ============================================================
# LOAD CONFIGURATION
# ============================================================

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


# ============================================================
# LOAD TRAINED MODELS ONCE
# ============================================================

_SCORE_MODEL = joblib.load(
    SCORE_MODEL_PATH
)

_SUCCESS_MODEL = joblib.load(
    SUCCESS_MODEL_PATH
)


# ============================================================
# EXACT TRAINING COLUMN ORDER
# ============================================================

MODEL_COLUMNS = (
        NUMERIC_FEATURES
        + [
            "fault_type_for_engine",
            "fault_severity",
            "candidate_action",
        ]
)


# ============================================================
# BUILD ONE CANDIDATE ACTION ROW
# ============================================================

def _build_candidate_row(
        request,
        action: str,
) -> pd.DataFrame:

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

    # IMPORTANT:
    # Keep exactly the same column order used during training.
    return pd.DataFrame(
        [
            [
                values[column]
                for column in MODEL_COLUMNS
            ]
        ],
        columns=MODEL_COLUMNS,
    )


# ============================================================
# EXTRACT SUCCESS PROBABILITY
# ============================================================

def _get_success_probability(
        model,
        X: pd.DataFrame,
) -> float | None:

    if not hasattr(
            model,
            "predict_proba",
    ):
        return None

    probabilities = model.predict_proba(X)[0]

    # Most likely the trained artifact is a Pipeline.
    if hasattr(
            model,
            "named_steps",
    ):
        inner_model = model.named_steps.get(
            "model"
        )

        if inner_model is not None:
            classes = list(
                inner_model.classes_
            )
        else:
            classes = list(
                model.classes_
            )

    elif hasattr(
            model,
            "classes_",
    ):
        classes = list(
            model.classes_
        )

    else:
        return float(
            max(probabilities)
        )

    # Success class = 1
    if 1 in classes:

        success_index = classes.index(
            1
        )

        return float(
            probabilities[
                success_index
            ]
        )

    # Fallback
    return float(
        max(probabilities)
    )


# ============================================================
# PREDICT RECOVERY
# ============================================================

def predict_recovery(request):

    action_results = []

    # --------------------------------------------------------
    # Evaluate every recovery action
    # --------------------------------------------------------

    for action in ACTIONS:

        X = _build_candidate_row(
            request,
            action,
        )

        # --------------------------------------------
        # Recoverability score
        # --------------------------------------------

        recoverability_score = float(
            _SCORE_MODEL.predict(X)[0]
        )

        # --------------------------------------------
        # Recovery success probability
        # --------------------------------------------

        success_probability = (
            _get_success_probability(
                _SUCCESS_MODEL,
                X,
            )
        )

        # --------------------------------------------
        # Success class prediction
        # --------------------------------------------

        success_prediction = None

        if hasattr(
                _SUCCESS_MODEL,
                "predict",
        ):

            success_code = int(
                _SUCCESS_MODEL.predict(X)[0]
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
                    if success_probability is not None
                    else None
                ),

                "recovery_success_percent": (
                    round(
                        success_probability * 100.0,
                        2,
                        )
                    if success_probability is not None
                    else None
                ),

                "success_prediction": (
                    success_prediction
                ),
            }
        )

    # --------------------------------------------------------
    # Find action with highest recoverability score
    # --------------------------------------------------------

    if not action_results:

        return {
            "node_id": request.node_id,
            "recoverability_score": 0.0,
            "recovery_decision": (
                "Human Intervention Required"
            ),
            "recommended_recovery_action": (
                "NOTIFY_OPERATOR"
            ),
            "decision_threshold": (
                DECISION_THRESHOLD
            ),
            "best_action_success_probability": None,
            "best_action_success_percent": None,
            "action_evaluations": [],
            "possible_recovery_actions": ACTIONS,
            "model": "Recoverability Engine",
        }

    highest_score_action = max(
        action_results,
        key=lambda item:
        item["recoverability_score"],
    )

    highest_recoverability_score = (
        highest_score_action[
            "recoverability_score"
        ]
    )

    # --------------------------------------------------------
    # Decide whether AI can recover automatically
    # --------------------------------------------------------

    if (
            highest_recoverability_score
            >= DECISION_THRESHOLD
    ):

        recovery_decision = (
            "AI Recoverable"
        )

        recommended_action = (
            highest_score_action[
                "action"
            ]
        )

    else:

        recovery_decision = (
            "Human Intervention Required"
        )

        recommended_action = (
            "NOTIFY_OPERATOR"
        )

    # --------------------------------------------------------
    # IMPORTANT FIX
    #
    # Find the actual recommended action and use THAT
    # action's success probability.
    #
    # Previously:
    #
    # best_action_success_probability
    # was always taken from the highest recoverability
    # action, even when the actual recommendation became
    # NOTIFY_OPERATOR.
    #
    # That caused:
    #
    # recommended_action = NOTIFY_OPERATOR
    #
    # but:
    #
    # best_action_success_probability = probability of
    # CONTINUE_MONITORING
    #
    # This code fixes that mismatch.
    # --------------------------------------------------------

    recommended_action_result = next(
        (
            item
            for item in action_results
            if item["action"]
               == recommended_action
        ),
        None,
    )

    if recommended_action_result is not None:

        recommended_success_probability = (
            recommended_action_result[
                "recovery_success_probability"
            ]
        )

        recommended_success_percent = (
            recommended_action_result[
                "recovery_success_percent"
            ]
        )

    else:

        recommended_success_probability = None
        recommended_success_percent = None

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {
        "node_id": request.node_id,

        # This remains the highest recoverability score.
        "recoverability_score": (
            highest_recoverability_score
        ),

        "recovery_decision": (
            recovery_decision
        ),

        "recommended_recovery_action": (
            recommended_action
        ),

        "decision_threshold": (
            DECISION_THRESHOLD
        ),

        # FIXED:
        # These now belong to the actual
        # recommended_recovery_action.
        "best_action_success_probability": (
            recommended_success_probability
        ),

        "best_action_success_percent": (
            recommended_success_percent
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