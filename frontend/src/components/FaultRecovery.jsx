import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  GitBranch,
  History,
  Network,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./FaultRecovery.css";

const initialFaults = [
  {
    id: "F-1042",
    type: "Node Failure",
    severity: "Critical",
    node: "N07",
    detected: "2 min ago",
    confidence: 97,
    decision: "Reroute Traffic",
    action: "Activate alternate path",
    status: "Recovered",
    duration: "18 sec",
  },
  {
    id: "F-1041",
    type: "Low Battery",
    severity: "High",
    node: "N12",
    detected: "6 min ago",
    confidence: 94,
    decision: "Isolate Node",
    action: "Remove node from routing",
    status: "In Progress",
    duration: "12 sec",
  },
  {
    id: "F-1040",
    type: "Link Degradation",
    severity: "Medium",
    node: "N03 → N09",
    detected: "11 min ago",
    confidence: 91,
    decision: "Change Route",
    action: "Select stable link",
    status: "Recovered",
    duration: "9 sec",
  },
  {
    id: "F-1039",
    type: "High Latency",
    severity: "Medium",
    node: "N05",
    detected: "18 min ago",
    confidence: 88,
    decision: "Load Balance",
    action: "Redistribute traffic",
    status: "Recovered",
    duration: "14 sec",
  },
  {
    id: "F-1038",
    type: "Packet Loss",
    severity: "Low",
    node: "N10 → N14",
    detected: "26 min ago",
    confidence: 86,
    decision: "Monitor",
    action: "Continue observation",
    status: "Monitoring",
    duration: "—",
  },
];

const recoveryHistory = [
  {
    time: "19:47:32",
    fault: "Node Failure",
    node: "N07",
    action: "Traffic rerouted",
    result: "Successful",
  },
  {
    time: "19:43:18",
    fault: "Link Degradation",
    node: "N03 → N09",
    action: "Alternate link selected",
    result: "Successful",
  },
  {
    time: "19:36:41",
    fault: "High Latency",
    node: "N05",
    action: "Traffic redistributed",
    result: "Successful",
  },
  {
    time: "19:29:07",
    fault: "Battery Warning",
    node: "N11",
    action: "Node isolated",
    result: "Successful",
  },
];

const aiModels = [
  {
    title: "Random Forest",
    description: "Node health prediction",
    metric: "94.7% accuracy",
    icon: Cpu,
    position: "top-left",
  },
  {
    title: "XGBoost",
    description: "Fault classification",
    metric: "96.2% accuracy",
    icon: ShieldCheck,
    position: "top-right",
  },
  {
    title: "LSTM",
    description: "Link quality forecast",
    metric: "92.8% accuracy",
    icon: Activity,
    position: "bottom-left",
  },
  {
    title: "Isolation Forest",
    description: "Anomaly detection",
    metric: "91.5% accuracy",
    icon: Zap,
    position: "bottom-right",
  },
];

function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge ${severity.toLowerCase()}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`recovery-status ${className}`}>
      {status === "Recovered" && <CheckCircle2 size={14} />}
      {status === "In Progress" && <RefreshCw size={14} />}
      {status === "Monitoring" && <Activity size={14} />}
      {status}
    </span>
  );
}

function FaultRecovery() {
  const [faults, setFaults] = useState(initialFaults);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedFault, setSelectedFault] = useState(initialFaults[0]);

  const filteredFaults = useMemo(() => {
    return faults.filter((fault) => {
      const severityMatch =
        severityFilter === "All" || fault.severity === severityFilter;

      const statusMatch =
        statusFilter === "All" || fault.status === statusFilter;

      return severityMatch && statusMatch;
    });
  }, [faults, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: faults.length,
      critical: faults.filter((fault) => fault.severity === "Critical").length,
      active: faults.filter((fault) => fault.status === "In Progress").length,
      recovered: faults.filter((fault) => fault.status === "Recovered").length,
    };
  }, [faults]);

  const refreshFaults = () => {
    setFaults([...initialFaults]);
  };

  const recoverSelectedFault = () => {
    if (!selectedFault) return;

    const updated = faults.map((fault) =>
      fault.id === selectedFault.id
        ? {
            ...fault,
            status: "Recovered",
            action: "Recovery completed",
            duration: "21 sec",
          }
        : fault
    );

    setFaults(updated);
    setSelectedFault({
      ...selectedFault,
      status: "Recovered",
      action: "Recovery completed",
      duration: "21 sec",
    });
  };

  return (
    <div className="faults-page">
      <Sidebar activePage="faults" />

      <main className="faults-main">
        <header className="faults-header">
          <div>
            <div className="page-eyebrow">
              <ShieldCheck size={15} />
              SELF-HEALING OPERATIONS
            </div>
            <h1>Faults & Recovery</h1>
            <p>
              Detect network faults, evaluate AI recovery decisions, and track
              self-healing operations.
            </p>
          </div>

          <button className="refresh-button" onClick={refreshFaults}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="fault-summary-grid">
          <div className="fault-summary-card">
            <div className="summary-icon blue">
              <AlertOctagon size={21} />
            </div>
            <div>
              <span>Total Detected</span>
              <strong>{stats.total}</strong>
            </div>
            <small>Current session</small>
          </div>

          <div className="fault-summary-card">
            <div className="summary-icon red">
              <AlertTriangle size={21} />
            </div>
            <div>
              <span>Critical Faults</span>
              <strong>{stats.critical}</strong>
            </div>
            <small>Requires attention</small>
          </div>

          <div className="fault-summary-card">
            <div className="summary-icon amber">
              <RotateCcw size={21} />
            </div>
            <div>
              <span>Active Recovery</span>
              <strong>{stats.active}</strong>
            </div>
            <small>Healing in progress</small>
          </div>

          <div className="fault-summary-card">
            <div className="summary-icon green">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Recovered</span>
              <strong>{stats.recovered}</strong>
            </div>
            <small>Successfully restored</small>
          </div>
        </section>

        <section className="recovery-flow-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">MODEL REGISTRY</span>
              <h2>AI Models</h2>
            </div>
            <span className="live-indicator">
              <span />
              ALL SYSTEMS ACTIVE
            </span>
          </div>

          <div className="ai-model-architecture">
            <div className="architecture-line line-top-left" />
            <div className="architecture-line line-top-right" />
            <div className="architecture-line line-bottom-left" />
            <div className="architecture-line line-bottom-right" />

            {aiModels.map((model) => {
              const Icon = model.icon;

              return (
                <div
                  className={`ai-model-card ${model.position}`}
                  key={model.title}
                >
                  <div className="ai-model-icon">
                    <Icon size={20} />
                  </div>

                  <div className="ai-model-content">
                    <strong>{model.title}</strong>
                    <span>{model.description}</span>
                    <small>{model.metric}</small>
                  </div>

                  <div className="model-active">
                    <span />
                    Active
                  </div>
                </div>
              );
            })}

            <div className="recovery-engine">
              <div className="recovery-engine-icon">
                <GitBranch size={24} />
              </div>
              <strong>Recovery Engine</strong>
              <span>Recovery decision & action</span>
              <small>Self-Healing Controller</small>
            </div>
          </div>
        </section>

        <section className="faults-content-grid">
          <div className="faults-list-panel">
            <div className="section-heading">
              <div>
                <span className="section-label">FAULT MONITORING</span>
                <h2>Detected Faults</h2>
              </div>
              <span className="record-count">{filteredFaults.length} events</span>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                {["All", "Critical", "High", "Medium", "Low"].map(
                  (severity) => (
                    <button
                      key={severity}
                      className={
                        severityFilter === severity ? "active" : ""
                      }
                      onClick={() => setSeverityFilter(severity)}
                    >
                      {severity}
                    </button>
                  )
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="status-select"
              >
                <option value="All">All Status</option>
                <option value="Recovered">Recovered</option>
                <option value="In Progress">In Progress</option>
                <option value="Monitoring">Monitoring</option>
              </select>
            </div>

            <div className="fault-table-wrapper">
              <table className="fault-table">
                <thead>
                  <tr>
                    <th>Fault</th>
                    <th>Severity</th>
                    <th>Affected</th>
                    <th>AI Decision</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaults.map((fault) => (
                    <tr
                      key={fault.id}
                      className={
                        selectedFault?.id === fault.id ? "selected" : ""
                      }
                      onClick={() => setSelectedFault(fault)}
                    >
                      <td>
                        <div className="fault-name">
                          <strong>{fault.type}</strong>
                          <span>{fault.id}</span>
                        </div>
                      </td>
                      <td>
                        <SeverityBadge severity={fault.severity} />
                      </td>
                      <td>
                        <span className="affected-node">{fault.node}</span>
                      </td>
                      <td>
                        <div className="decision-cell">
                          <strong>{fault.decision}</strong>
                          <span>{fault.confidence}% confidence</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={fault.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="fault-detail-panel">
            {selectedFault && (
              <>
                <div className="detail-header">
                  <div>
                    <span className="section-label">FAULT DETAILS</span>
                    <h2>{selectedFault.type}</h2>
                    <span>{selectedFault.id}</span>
                  </div>
                  <SeverityBadge severity={selectedFault.severity} />
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span>Affected Node</span>
                    <strong>
                      <Network size={15} />
                      {selectedFault.node}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Detected</span>
                    <strong>
                      <Clock3 size={15} />
                      {selectedFault.detected}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>AI Confidence</span>
                    <strong>{selectedFault.confidence}%</strong>
                  </div>

                  <div className="detail-item">
                    <span>Recovery Duration</span>
                    <strong>{selectedFault.duration}</strong>
                  </div>
                </div>

                <div className="decision-box">
                  <div className="decision-box-header">
                    <Zap size={18} />
                    <span>Recovery Decision</span>
                  </div>
                  <strong>{selectedFault.decision}</strong>
                  <p>{selectedFault.action}</p>
                </div>

                <div className="detail-status">
                  <span>Recovery Status</span>
                  <StatusBadge status={selectedFault.status} />
                </div>

                {selectedFault.status !== "Recovered" && (
                  <button
                    className="execute-recovery"
                    onClick={recoverSelectedFault}
                  >
                    <RotateCcw size={17} />
                    Execute Recovery
                  </button>
                )}
              </>
            )}
          </aside>
        </section>

        <section className="history-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">RECOVERY LOG</span>
              <h2>Recovery History</h2>
            </div>
            <History size={19} />
          </div>

          <div className="history-list">
            {recoveryHistory.map((item) => (
              <div className="history-item" key={`${item.time}-${item.node}`}>
                <div className="history-time">{item.time}</div>

                <div className="history-marker">
                  <span />
                </div>

                <div className="history-info">
                  <strong>{item.fault}</strong>
                  <span>{item.node}</span>
                </div>

                <div className="history-action">
                  <span>{item.action}</span>
                </div>

                <div className="history-result">
                  <CheckCircle2 size={15} />
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default FaultRecovery;