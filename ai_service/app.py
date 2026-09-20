from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas.prediction import (
    FailurePredictionRequest,
    LSTMRequest,
    IsolationRequest,
    RecoveryRequest,
    PredictAllRequest,
)
from services.random_forest_service import predict_failure
from services.xgboost_service import predict_fault
from services.lstm_service import predict_link_quality
from services.isolation_service import detect_anomaly
from services.recovery_service import predict_recovery


app = FastAPI(
    title="MANET AI Service",
    description="AI inference service for the MANET predictive self-healing platform.",
    version="1.0.0",
)

# Development CORS configuration.
# Restrict this list to your frontend URL before production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "MANET AI Service",
        "status": "running",
        "models": [
            "random_forest",
            "xgboost",
            "lstm",
            "isolation_forest",
            "recoverability_engine",
        ],
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "MANET AI Service",
    }


@app.post("/ai/random-forest")
def random_forest(request: FailurePredictionRequest):
    return predict_failure(request)


@app.post("/ai/xgboost")
def xgboost(request: FailurePredictionRequest):
    return predict_fault(request)


@app.post("/ai/lstm")
def lstm(request: LSTMRequest):
    return predict_link_quality(request)


@app.post("/ai/isolation")
def isolation(request: IsolationRequest):
    return detect_anomaly(request)


@app.post("/ai/recovery")
def recovery(request: RecoveryRequest):
    return predict_recovery(request)


@app.post("/ai/predict-all")
def predict_all(request: PredictAllRequest):
    """
    Convenience endpoint for Random Forest + XGBoost + Isolation Forest.

    LSTM and the recovery engine remain separate because they require
    sequence/candidate-action data.
    """
    rf = predict_failure(request.failure)
    xgb = predict_fault(request.failure)
    isolation = detect_anomaly(request.isolation)

    return {
        "node_id": request.failure.node_id,
        "random_forest": rf,
        "xgboost": xgb,
        "isolation_forest": isolation,
    }