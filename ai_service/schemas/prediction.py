from typing import List, Optional, Union
from pydantic import BaseModel, Field


TimestampValue = Union[int, float, str]


class FailurePredictionRequest(BaseModel):
    """
    Inputs for the trained Random Forest and XGBoost artifacts.

    Random Forest:
        node_id, x, y, speed, battery_level, cpu_usage,
        memory_usage, signal_strength, packet_loss, latency

    XGBoost:
        x, y, speed, battery_level, cpu_usage, memory_usage,
        signal_strength, packet_loss, latency, active,
        timestamp-derived features
    """

    node_id: int = Field(..., description="MANET node identifier")
    x: float
    y: float
    speed: float
    battery_level: float
    cpu_usage: float
    memory_usage: float
    signal_strength: float
    packet_loss: float
    latency: float
    active: bool = True
    timestamp: TimestampValue = 0


class IsolationRequest(BaseModel):
    """
    Inputs for the trained Isolation Forest.

    Exact trained feature order:
        cpu
        memory
        battery
        rssi
        packet_loss
        latency
        throughput
        queue_size
        traffic_load
        link_quality
        mobility_speed
    """

    node_id: Optional[int] = None

    cpu: float
    memory: float
    battery: float
    rssi: float
    packet_loss: float
    latency: float
    throughput: float
    queue_size: float
    traffic_load: float
    link_quality: float
    mobility_speed: float


class LSTMTimeStep(BaseModel):
    """
    One historical time step for the trained LSTM.

    The saved model expects exactly:
        5 time steps x 7 features
    """

    rssi: float
    packet_loss: float
    latency: float
    throughput: float
    link_quality: float
    node_distance: float
    mobility_speed: float


class LSTMRequest(BaseModel):
    node_id: Optional[int] = None

    sequence: List[LSTMTimeStep] = Field(
        ...,
        min_length=5,
        max_length=5,
        description="Exactly 5 historical time steps",
    )


class RecoveryRequest(BaseModel):
    """
    Inputs for the trained recoverability engine.

    Numeric features:
        failure_probability
        node_health_score
        battery_level
        link_quality
        available_neighbor_nodes
        number_of_alternative_routes
        alternative_route_quality
        current_traffic_load
        previous_recovery_history
        predicted_link_quality
        anomaly_score

    Categorical features:
        fault_type_for_engine
        fault_severity
        candidate_action

    candidate_action is generated automatically by the service for
    each available recovery action.
    """

    node_id: Optional[int] = None

    failure_probability: float = Field(..., ge=0.0, le=1.0)
    fault_type_for_engine: str
    fault_severity: str

    node_health_score: float
    battery_level: float
    link_quality: float
    available_neighbor_nodes: float
    number_of_alternative_routes: float
    alternative_route_quality: float
    current_traffic_load: float
    previous_recovery_history: float
    predicted_link_quality: float
    anomaly_score: float


class PredictAllRequest(BaseModel):
    """
    Combined request for:
        Random Forest
        XGBoost
        Isolation Forest
    """

    failure: FailurePredictionRequest
    isolation: IsolationRequest