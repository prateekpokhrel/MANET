import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./AIIntelligence.css";

const models = [
  {
    name: "Random Forest",
    type: "Node Health Prediction",
    status: "Active",
    accuracy: "94.7%",
    latency: "18 ms",
    predictions: "1,284",
    icon: Brain,
  },
  {
    name: "XGBoost",
    type: "Fault Classification",
    status: "Active",
    accuracy: "96.2%",
    latency: "12 ms",
    predictions: "1,109",
    icon: ShieldCheck,
  },
  {
    name: "LSTM",
    type: "Link Quality Forecast",
    status: "Active",
    accuracy: "92.8%",
    latency: "27 ms",
    predictions: "864",
    icon: TrendingUp,
  },
  {
    name: "Isolation Forest",
    type: "Anomaly Detection",
    status: "Active",
    accuracy: "91.5%",
    latency: "9 ms",
    predictions: "742",
    icon: Activity,
  },
];

const nodes = [
  {
    node: "N01",
    health: 98,
    prediction: "Healthy",
    confidence: 97,
    risk: "Low",
    trend: "Stable",
  },
  {
    node: "N02",
    health: 94,
    prediction: "Healthy",
    confidence: 95,
    risk: "Low",
    trend: "Stable",
  },
  {
    node: "N03",
    health: 87,
    prediction: "Watch",
    confidence: 91,
    risk: "Medium",
    trend: "Declining",
  },
  {
    node: "N04",
    health: 96,
    prediction: "Healthy",
    confidence: 96,
    risk: "Low",
    trend: "Stable",
  },
  {
    node: "N05",
    health: 72,
    prediction: "At Risk",
    confidence: 93,
    risk: "High",
    trend: "Declining",
  },
  {
    node: "N06",
    health: 91,
    prediction: "Healthy",
    confidence: 94,
    risk: "Low",
    trend: "Improving",
  },
  {
    node: "N07",
    health: 42,
    prediction: "Failure Risk",
    confidence: 97,
    risk: "Critical",
    trend: "Critical",
  },
  {
    node: "N08",
    health: 89,
    prediction: "Watch",
    confidence: 89,
    risk: "Medium",
    trend: "Stable",
  },
];

const predictions = [
  {
    time: "19:51:24",
    model: "XGBoost",
    event: "Node Failure",
    node: "N07",
    confidence: 97,
    result: "Critical",
  },
  {
    time: "19:47:13",
    model: "Random Forest",
    event: "Battery Degradation",
    node: "N12",
    confidence: 94,
    result: "High Risk",
  },
  {
    time: "19:42:08",
    model: "LSTM",
    event: "Link Quality Drop",
    node: "N03 → N09",
    confidence: 91,
    result: "Predicted",
  },
  {
    time: "19:35:51",
    model: "Isolation Forest",
    event: "Traffic Anomaly",
    node: "N05",
    confidence: 88,
    result: "Anomaly",
  },
];

function RiskBadge({ risk }) {
  return (
    <span className={`ai-risk-badge ${risk.toLowerCase()}`}>
      {risk}
    </span>
  );
}

function PredictionBadge({ prediction }) {
  const className = prediction.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`prediction-badge ${className}`}>
      {prediction}
    </span>
  );
}

function AIIntelligence() {
  const [selectedModel, setSelectedModel] = useState("All");
  const [selectedNode, setSelectedNode] = useState(nodes[6]);

  const filteredPredictions = useMemo(() => {
    if (selectedModel === "All") {
      return predictions;
    }

    return predictions.filter((item) => item.model === selectedModel);
  }, [selectedModel]);

  const averageConfidence = Math.round(
    nodes.reduce((total, node) => total + node.confidence, 0) / nodes.length
  );

  const averageHealth = Math.round(
    nodes.reduce((total, node) => total + node.health, 0) / nodes.length
  );

  const highRiskNodes = nodes.filter(
    (node) => node.risk === "High" || node.risk === "Critical"
  ).length;

  const activeModels = models.filter(
    (model) => model.status === "Active"
  ).length;

  const refreshAI = () => {
    window.location.reload();
  };

  return (
    <div className="ai-page">
      <Sidebar activePage="ai-intelligence" />

      <main className="ai-main">
        <header className="ai-header">
          <div>
            <div className="ai-page-eyebrow">
              <Sparkles size={15} />
              AI OPERATIONS CENTER
            </div>

            <h1>AI Intelligence</h1>

            <p>
              Predictive analytics, fault classification, anomaly detection,
              and network intelligence powered by AI models.
            </p>
          </div>

          <button className="ai-refresh-button" onClick={refreshAI}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="ai-overview-grid">
          <div className="ai-overview-card">
            <div className="ai-overview-icon blue">
              <Brain size={21} />
            </div>

            <div>
              <span>Active Models</span>
              <strong>{activeModels}</strong>
            </div>

            <small>AI services online</small>
          </div>

          <div className="ai-overview-card">
            <div className="ai-overview-icon green">
              <Gauge size={21} />
            </div>

            <div>
              <span>Avg Confidence</span>
              <strong>{averageConfidence}%</strong>
            </div>

            <small>Current predictions</small>
          </div>

          <div className="ai-overview-card">
            <div className="ai-overview-icon amber">
              <AlertTriangle size={21} />
            </div>

            <div>
              <span>High Risk Nodes</span>
              <strong>{highRiskNodes}</strong>
            </div>

            <small>Require monitoring</small>
          </div>

          <div className="ai-overview-card">
            <div className="ai-overview-icon green">
              <Network size={21} />
            </div>

            <div>
              <span>Network Health</span>
              <strong>{averageHealth}%</strong>
            </div>

            <small>AI-estimated health</small>
          </div>
        </section>

        <section className="ai-models-panel">
          <div className="ai-section-heading">
            <div>
              <span className="ai-section-label">MODEL REGISTRY</span>
              <h2>AI Models</h2>
            </div>

            <span className="ai-live-status">
              <span />
              ALL SYSTEMS ACTIVE
            </span>
          </div>

          <div className="model-architecture">
            <svg
              className="model-architecture-lines"
              viewBox="0 0 1000 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="245" y1="135" x2="430" y2="245" />
              <line x1="755" y1="135" x2="570" y2="245" />
              <line x1="245" y1="385" x2="430" y2="275" />
              <line x1="755" y1="385" x2="570" y2="275" />
            </svg>

            <div className="model-node model-node-random">
              <div className="model-card-top">
                <div className="model-icon">
                  <Brain size={20} />
                </div>

                <span className="model-status">
                  <span />
                  Active
                </span>
              </div>

              <div className="model-name">
                <strong>Random Forest</strong>
                <span>Node Health Prediction</span>
              </div>

              <div className="model-metrics">
                <div>
                  <span>Accuracy</span>
                  <strong>94.7%</strong>
                </div>

                <div>
                  <span>Latency</span>
                  <strong>18 ms</strong>
                </div>

                <div>
                  <span>Predictions</span>
                  <strong>1,284</strong>
                </div>
              </div>
            </div>

            <div className="model-node model-node-xgboost">
              <div className="model-card-top">
                <div className="model-icon">
                  <ShieldCheck size={20} />
                </div>

                <span className="model-status">
                  <span />
                  Active
                </span>
              </div>

              <div className="model-name">
                <strong>XGBoost</strong>
                <span>Fault Classification</span>
              </div>

              <div className="model-metrics">
                <div>
                  <span>Accuracy</span>
                  <strong>96.2%</strong>
                </div>

                <div>
                  <span>Latency</span>
                  <strong>12 ms</strong>
                </div>

                <div>
                  <span>Predictions</span>
                  <strong>1,109</strong>
                </div>
              </div>
            </div>

            <div className="recovery-engine-node">
              <div className="recovery-engine-icon">
                <GitBranch size={23} />
              </div>

              <div className="recovery-engine-content">
                <span>DECISION ENGINE</span>
                <strong>Recovery Engine</strong>
                <p>
                  Combines AI predictions to select the appropriate recovery
                  action.
                </p>
              </div>

              <div className="recovery-engine-status">
                <span />
                Operational
              </div>
            </div>

            <div className="model-node model-node-lstm">
              <div className="model-card-top">
                <div className="model-icon">
                  <TrendingUp size={20} />
                </div>

                <span className="model-status">
                  <span />
                  Active
                </span>
              </div>

              <div className="model-name">
                <strong>LSTM</strong>
                <span>Link Quality Forecast</span>
              </div>

              <div className="model-metrics">
                <div>
                  <span>Accuracy</span>
                  <strong>92.8%</strong>
                </div>

                <div>
                  <span>Latency</span>
                  <strong>27 ms</strong>
                </div>

                <div>
                  <span>Predictions</span>
                  <strong>864</strong>
                </div>
              </div>
            </div>

            <div className="model-node model-node-isolation">
              <div className="model-card-top">
                <div className="model-icon">
                  <Activity size={20} />
                </div>

                <span className="model-status">
                  <span />
                  Active
                </span>
              </div>

              <div className="model-name">
                <strong>Isolation Forest</strong>
                <span>Anomaly Detection</span>
              </div>

              <div className="model-metrics">
                <div>
                  <span>Accuracy</span>
                  <strong>91.5%</strong>
                </div>

                <div>
                  <span>Latency</span>
                  <strong>9 ms</strong>
                </div>

                <div>
                  <span>Predictions</span>
                  <strong>742</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ai-main-grid">
          <div className="node-prediction-panel">
            <div className="ai-section-heading">
              <div>
                <span className="ai-section-label">PREDICTIVE ANALYTICS</span>
                <h2>Node-Level Predictions</h2>
              </div>

              <span className="prediction-count">
                {nodes.length} nodes analyzed
              </span>
            </div>

            <div className="node-prediction-table-wrapper">
              <table className="node-prediction-table">
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Health</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Risk</th>
                    <th>Trend</th>
                  </tr>
                </thead>

                <tbody>
                  {nodes.map((node) => (
                    <tr
                      key={node.node}
                      className={
                        selectedNode?.node === node.node ? "selected" : ""
                      }
                      onClick={() => setSelectedNode(node)}
                    >
                      <td>
                        <span className="node-id">
                          <Network size={13} />
                          {node.node}
                        </span>
                      </td>

                      <td>
                        <div className="health-cell">
                          <span>{node.health}%</span>

                          <div className="health-track">
                            <div
                              className={`health-fill ${
                                node.health < 50
                                  ? "critical"
                                  : node.health < 75
                                  ? "warning"
                                  : "healthy"
                              }`}
                              style={{ width: `${node.health}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <PredictionBadge prediction={node.prediction} />
                      </td>

                      <td>
                        <span className="confidence-value">
                          {node.confidence}%
                        </span>
                      </td>

                      <td>
                        <RiskBadge risk={node.risk} />
                      </td>

                      <td>
                        <span
                          className={`trend-value ${node.trend
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {node.trend === "Improving" && (
                            <TrendingUp size={13} />
                          )}

                          {node.trend === "Declining" && (
                            <TrendingDown size={13} />
                          )}

                          {node.trend === "Critical" && (
                            <AlertTriangle size={13} />
                          )}

                          {node.trend === "Stable" && (
                            <Activity size={13} />
                          )}

                          {node.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="node-ai-detail-panel">
            <div className="ai-section-label">SELECTED NODE</div>

            {selectedNode && (
              <>
                <div className="selected-node-header">
                  <div className="selected-node-icon">
                    <Network size={22} />
                  </div>

                  <div>
                    <h2>{selectedNode.node}</h2>
                    <span>AI Prediction Profile</span>
                  </div>
                </div>

                <div className="node-health-ring">
                  <div className="node-ring">
                    <div>
                      <strong>{selectedNode.health}%</strong>
                      <span>Health</span>
                    </div>
                  </div>
                </div>

                <div className="selected-node-status">
                  <PredictionBadge prediction={selectedNode.prediction} />
                  <RiskBadge risk={selectedNode.risk} />
                </div>

                <div className="node-ai-metrics">
                  <div>
                    <span>Prediction Confidence</span>
                    <strong>{selectedNode.confidence}%</strong>
                  </div>

                  <div>
                    <span>Predicted Trend</span>
                    <strong>{selectedNode.trend}</strong>
                  </div>
                </div>

                <div className="ai-analysis-box">
                  <div>
                    <Sparkles size={16} />
                    AI Analysis
                  </div>

                  <p>
                    The AI engine is currently evaluating {selectedNode.node}{" "}
                    using node health, signal quality, battery, traffic, and
                    connectivity indicators.
                  </p>
                </div>
              </>
            )}
          </aside>
        </section>

        <section className="ai-lower-grid">
          <div className="recent-predictions-panel">
            <div className="ai-section-heading">
              <div>
                <span className="ai-section-label">MODEL ACTIVITY</span>
                <h2>Recent AI Predictions</h2>
              </div>

              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                className="model-filter"
              >
                <option value="All">All Models</option>

                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="prediction-list">
              {filteredPredictions.map((prediction) => (
                <div
                  className="prediction-row"
                  key={`${prediction.time}-${prediction.model}`}
                >
                  <div className="prediction-time">
                    <Clock3 size={13} />
                    {prediction.time}
                  </div>

                  <div className="prediction-model">
                    <strong>{prediction.model}</strong>
                    <span>{prediction.event}</span>
                  </div>

                  <div className="prediction-node">
                    <Network size={12} />
                    {prediction.node}
                  </div>

                  <div className="prediction-confidence">
                    <span>{prediction.confidence}%</span>
                    <small>confidence</small>
                  </div>

                  <span
                    className={`prediction-result ${prediction.result
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {prediction.result}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-system-panel">
            <div className="ai-section-heading">
              <div>
                <span className="ai-section-label">AI INFRASTRUCTURE</span>
                <h2>System Intelligence</h2>
              </div>

              <Cpu size={18} />
            </div>

            <div className="intelligence-metric">
              <div className="intelligence-icon">
                <Database size={16} />
              </div>

              <div>
                <span>Dataset Processing</span>
                <strong>Continuous</strong>
              </div>

              <CheckCircle2 size={15} />
            </div>

            <div className="intelligence-metric">
              <div className="intelligence-icon">
                <Zap size={16} />
              </div>

              <div>
                <span>Inference Engine</span>
                <strong>Operational</strong>
              </div>

              <CheckCircle2 size={15} />
            </div>

            <div className="intelligence-metric">
              <div className="intelligence-icon">
                <Activity size={16} />
              </div>

              <div>
                <span>Real-Time Monitoring</span>
                <strong>Enabled</strong>
              </div>

              <CheckCircle2 size={15} />
            </div>

            <div className="intelligence-metric">
              <div className="intelligence-icon">
                <ShieldCheck size={16} />
              </div>

              <div>
                <span>Self-Healing Integration</span>
                <strong>Connected</strong>
              </div>

              <CheckCircle2 size={15} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AIIntelligence;