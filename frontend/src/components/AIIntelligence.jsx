import React from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Cpu,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import "./AIIntelligence.css";

/*
|--------------------------------------------------------------------------
| DEMO DATA
|--------------------------------------------------------------------------
| Replace these values with your Spring Boot API responses later.
*/

const modelStatus = [
  {
    name: "Random Forest",
    purpose: "Node failure prediction",
    status: "READY",
    statusType: "ready",
    icon: BrainCircuit,
    description:
      "Predicts the probability of a node experiencing a failure based on network and node metrics.",
  },
  {
    name: "XGBoost",
    purpose: "Fault classification",
    status: "READY",
    statusType: "ready",
    icon: Zap,
    description:
      "Classifies detected network faults and identifies the most probable fault category.",
  },
  {
    name: "LSTM",
    purpose: "Link-quality prediction",
    status: "PIPELINE",
    statusType: "pipeline",
    icon: Activity,
    description:
      "Future model for predicting link-quality changes from network time-series data.",
  },
  {
    name: "Isolation Forest",
    purpose: "Anomaly detection",
    status: "PIPELINE",
    statusType: "pipeline",
    icon: ShieldAlert,
    description:
      "Future model for identifying abnormal network behavior and potential anomalies.",
  },
];

const nodePredictions = [
  {
    node: "N05",
    prediction: "Failure Risk",
    fault: "LOW_BATTERY",
    probability: 87,
    confidence: 91,
    model: "Random Forest",
    status: "HIGH RISK",
    statusType: "high",
  },
  {
    node: "N07",
    prediction: "Failure Risk",
    fault: "LINK_FAILURE",
    probability: 72,
    confidence: 88,
    model: "Random Forest",
    status: "MEDIUM RISK",
    statusType: "medium",
  },
  {
    node: "N03",
    prediction: "Failure Risk",
    fault: "NORMAL",
    probability: 18,
    confidence: 94,
    model: "Random Forest",
    status: "LOW RISK",
    statusType: "low",
  },
  {
    node: "N11",
    prediction: "Failure Risk",
    fault: "NORMAL",
    probability: 11,
    confidence: 96,
    model: "Random Forest",
    status: "LOW RISK",
    statusType: "low",
  },
  {
    node: "N02",
    prediction: "Failure Risk",
    fault: "BATTERY_DEGRADATION",
    probability: 63,
    confidence: 84,
    model: "Random Forest",
    status: "MEDIUM RISK",
    statusType: "medium",
  },
];

const faultClassification = {
  node: "N07",
  fault: "LINK_FAILURE",
  confidence: 94,
  severity: "HIGH",
  model: "XGBoost",
  timestamp: "2 minutes ago",
};

function ModelStatusCard({
  name,
  purpose,
  status,
  statusType,
  icon: Icon,
  description,
}) {
  return (
    <div className={`ai-model-card ${statusType}`}>
      <div className="ai-model-top">
        <div className="ai-model-icon">
          <Icon size={20} />
        </div>

        <span className={`ai-model-status ${statusType}`}>
          {statusType === "ready" ? (
            <CheckCircle2 size={12} />
          ) : (
            <Clock3 size={12} />
          )}

          {status}
        </span>
      </div>

      <h3>{name}</h3>

      <span className="ai-model-purpose">{purpose}</span>

      <p>{description}</p>
    </div>
  );
}

function RiskBadge({ type, children }) {
  return (
    <span className={`ai-risk-badge ${type}`}>
      {children}
    </span>
  );
}

function AIIntelligence() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="ai-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="ai-header">
          <div>
            <p className="ai-eyebrow">ARTIFICIAL INTELLIGENCE</p>

            <h1>AI Intelligence</h1>

            <p className="ai-subtitle">
              Predictive analysis, fault classification and node-level
              risk assessment for the MANET.
            </p>
          </div>

          <div className="ai-header-status">
            <span className="ai-live-dot" />

            <div>
              <span>AI ENGINE</span>
              <strong>OPERATIONAL</strong>
            </div>
          </div>
        </header>

        {/* =====================================================
            AI SUMMARY
        ===================================================== */}

        <section className="ai-summary-grid">
          <div className="ai-summary-card">
            <div className="ai-summary-icon purple">
              <BrainCircuit size={20} />
            </div>

            <div>
              <span>Trained Models</span>
              <strong>2</strong>
              <small>Random Forest + XGBoost</small>
            </div>
          </div>

          <div className="ai-summary-card">
            <div className="ai-summary-icon red">
              <ShieldAlert size={20} />
            </div>

            <div>
              <span>High Risk Nodes</span>
              <strong>1</strong>
              <small>Requires attention</small>
            </div>
          </div>

          <div className="ai-summary-card">
            <div className="ai-summary-icon orange">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Faults Classified</span>
              <strong>2</strong>
              <small>Current simulation</small>
            </div>
          </div>

          <div className="ai-summary-card">
            <div className="ai-summary-icon green">
              <Sparkles size={20} />
            </div>

            <div>
              <span>Avg Confidence</span>
              <strong>91%</strong>
              <small>Current predictions</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            MODEL STATUS
        ===================================================== */}

        <section className="ai-section">
          <div className="ai-section-heading">
            <div>
              <h2>Model Status</h2>
              <p>
                Current availability of the NeuroHeal AI models.
              </p>
            </div>

            <Cpu size={20} />
          </div>

          <div className="ai-model-grid">
            {modelStatus.map((model) => (
              <ModelStatusCard key={model.name} {...model} />
            ))}
          </div>
        </section>

        {/* =====================================================
            RANDOM FOREST
        ===================================================== */}

        <section className="ai-section">
          <div className="ai-section-heading">
            <div>
              <div className="ai-title-with-icon">
                <div className="ai-title-icon purple">
                  <BrainCircuit size={18} />
                </div>

                <h2>Random Forest Predictions</h2>
              </div>

              <p>
                Node failure probability and predicted risk level.
              </p>
            </div>

            <span className="ai-ready-label">
              <CheckCircle2 size={13} />
              MODEL READY
            </span>
          </div>

          <div className="rf-highlight">
            <div className="rf-highlight-left">
              <div className="rf-node-icon">
                <Cpu size={25} />
              </div>

              <div>
                <span>Highest Risk Node</span>
                <strong>N05</strong>
                <small>Predicted fault: LOW_BATTERY</small>
              </div>
            </div>

            <div className="rf-risk-value">
              <span>Failure Probability</span>
              <strong>87%</strong>
            </div>

            <div className="rf-confidence">
              <span>Confidence</span>
              <strong>91%</strong>
            </div>
          </div>

          <div className="rf-progress-container">
            <div className="rf-progress-header">
              <span>Node N05 Risk Level</span>
              <strong>HIGH RISK</strong>
            </div>

            <div className="rf-progress-track">
              <div
                className="rf-progress-value"
                style={{ width: "87%" }}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            XGBOOST
        ===================================================== */}

        <section className="ai-section">
          <div className="ai-section-heading">
            <div>
              <div className="ai-title-with-icon">
                <div className="ai-title-icon orange">
                  <Zap size={18} />
                </div>

                <h2>XGBoost Fault Classification</h2>
              </div>

              <p>
                Latest network fault identified by the classification model.
              </p>
            </div>

            <span className="ai-ready-label orange">
              <CheckCircle2 size={13} />
              MODEL READY
            </span>
          </div>

          <div className="xgb-grid">
            <div className="xgb-main">
              <div className="xgb-node">
                <span>Affected Node</span>
                <strong>{faultClassification.node}</strong>
              </div>

              <div className="xgb-fault">
                <span>Classified Fault</span>
                <strong>{faultClassification.fault}</strong>
              </div>

              <RiskBadge type="high">
                {faultClassification.severity}
              </RiskBadge>
            </div>

            <div className="xgb-details">
              <div>
                <span>Confidence</span>
                <strong>{faultClassification.confidence}%</strong>
              </div>

              <div>
                <span>Model</span>
                <strong>{faultClassification.model}</strong>
              </div>

              <div>
                <span>Detected</span>
                <strong>{faultClassification.timestamp}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            NODE LEVEL PREDICTIONS
        ===================================================== */}

        <section className="ai-section">
          <div className="ai-section-heading">
            <div>
              <h2>Node-Level Predictions</h2>
              <p>
                Individual node risk assessment generated by Random Forest.
              </p>
            </div>

            <span className="ai-node-count">
              {nodePredictions.length} nodes analyzed
            </span>
          </div>

          <div className="ai-table-wrapper">
            <table className="ai-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Prediction</th>
                  <th>Predicted Fault</th>
                  <th>Risk</th>
                  <th>Confidence</th>
                  <th>Model</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {nodePredictions.map((item) => (
                  <tr key={item.node}>
                    <td>
                      <div className="ai-node-cell">
                        <div className="ai-node-avatar">
                          <Cpu size={15} />
                        </div>

                        <strong>{item.node}</strong>
                      </div>
                    </td>

                    <td>{item.prediction}</td>

                    <td>
                      <span className="ai-fault-label">
                        {item.fault}
                      </span>
                    </td>

                    <td>
                      <div className="table-risk">
                        <div className="table-risk-number">
                          {item.probability}%
                        </div>

                        <div className="table-risk-track">
                          <div
                            className={`table-risk-value ${item.statusType}`}
                            style={{
                              width: `${item.probability}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="confidence-value">
                        {item.confidence}%
                      </strong>
                    </td>

                    <td>
                      <span className="ai-model-label">
                        {item.model}
                      </span>
                    </td>

                    <td>
                      <RiskBadge type={item.statusType}>
                        {item.status}
                      </RiskBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            FUTURE MODELS
        ===================================================== */}

        <section className="ai-section future-section">
          <div className="ai-section-heading">
            <div>
              <h2>Upcoming AI Models</h2>

              <p>
                Additional models planned for the NeuroHeal predictive
                self-healing pipeline.
              </p>
            </div>

            <Clock3 size={20} />
          </div>

          <div className="future-model-grid">
            <div className="future-model-card">
              <div className="future-model-icon">
                <Activity size={20} />
              </div>

              <div>
                <div className="future-model-header">
                  <h3>LSTM</h3>

                  <span>PIPELINE</span>
                </div>

                <p>
                  Time-series prediction of future MANET link quality.
                </p>

                <div className="future-model-purpose">
                  <span>Purpose</span>
                  <strong>Link Quality Prediction</strong>
                </div>
              </div>
            </div>

            <div className="future-model-card">
              <div className="future-model-icon">
                <ShieldAlert size={20} />
              </div>

              <div>
                <div className="future-model-header">
                  <h3>Isolation Forest</h3>

                  <span>PIPELINE</span>
                </div>

                <p>
                  Detection of abnormal network behavior and anomalies.
                </p>

                <div className="future-model-purpose">
                  <span>Purpose</span>
                  <strong>Anomaly Detection</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="ai-footer">
          <span>
            NeuroHeal · AI-Powered Predictive Self-Healing MANET
          </span>

          <span>
            <span className="ai-footer-dot" />
            AI Engine Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

export default AIIntelligence;