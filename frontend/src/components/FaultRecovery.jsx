import React, { useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Cpu,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  XCircle,
  Zap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import "./FaultRecovery.css";

/*
|--------------------------------------------------------------------------
| DEMO DATA
|--------------------------------------------------------------------------
| Replace this data with your Spring Boot API responses later.
*/

const detectedFaults = [
  {
    id: "FLT-001",
    node: "N05",
    faultType: "LOW_BATTERY",
    severity: "HIGH",
    detectedBy: "Random Forest",
    confidence: 91,
    detectedAt: "2 min ago",
    status: "RECOVERING",
  },
  {
    id: "FLT-002",
    node: "N07",
    faultType: "LINK_FAILURE",
    severity: "HIGH",
    detectedBy: "XGBoost",
    confidence: 94,
    detectedAt: "4 min ago",
    status: "RECOVERING",
  },
  {
    id: "FLT-003",
    node: "N03",
    faultType: "NODE_FAILURE",
    severity: "MEDIUM",
    detectedBy: "Random Forest",
    confidence: 86,
    detectedAt: "11 min ago",
    status: "RECOVERED",
  },
  {
    id: "FLT-004",
    node: "N09",
    faultType: "BATTERY_DEGRADATION",
    severity: "LOW",
    detectedBy: "Random Forest",
    confidence: 82,
    detectedAt: "18 min ago",
    status: "MONITORING",
  },
];

const recoveryHistory = [
  {
    id: "REC-008",
    node: "N03",
    fault: "NODE_FAILURE",
    decision: "REROUTE_TRAFFIC",
    action: "Route switched through N04 → N06",
    initiatedBy: "AI Recovery",
    status: "SUCCESS",
    time: "11 min ago",
  },
  {
    id: "REC-007",
    node: "N12",
    fault: "LINK_FAILURE",
    decision: "REESTABLISH_LINK",
    action: "Alternative link established",
    initiatedBy: "AI Recovery",
    status: "SUCCESS",
    time: "25 min ago",
  },
  {
    id: "REC-006",
    node: "N08",
    fault: "LOW_BATTERY",
    decision: "REDUCE_LOAD",
    action: "Traffic load redistributed",
    initiatedBy: "AI Recovery",
    status: "SUCCESS",
    time: "31 min ago",
  },
  {
    id: "REC-005",
    node: "N02",
    fault: "LINK_FAILURE",
    decision: "REROUTE_TRAFFIC",
    action: "Waiting for route stabilization",
    initiatedBy: "AI Recovery",
    status: "IN_PROGRESS",
    time: "42 min ago",
  },
];

const recoveryDecisions = [
  {
    node: "N05",
    fault: "LOW_BATTERY",
    decision: "REDUCE_LOAD",
    reason:
      "Battery level is below the configured threshold. Reduce traffic load to preserve node availability.",
    action: "Redistribute traffic",
    priority: "HIGH",
  },
  {
    node: "N07",
    fault: "LINK_FAILURE",
    decision: "REROUTE_TRAFFIC",
    reason:
      "Primary communication link is unavailable. An alternative route should be selected.",
    action: "Switch route",
    priority: "HIGH",
  },
];

function SeverityBadge({ severity }) {
  return (
    <span className={`fr-severity ${severity.toLowerCase()}`}>
      {severity === "HIGH" && <AlertTriangle size={11} />}
      {severity === "MEDIUM" && <ShieldAlert size={11} />}
      {severity === "LOW" && <ShieldCheck size={11} />}
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`fr-status ${normalized}`}>
      {status === "RECOVERED" && <CheckCircle2 size={11} />}
      {status === "RECOVERING" && <RefreshCw size={11} />}
      {status === "MONITORING" && <Clock3 size={11} />}
      {status === "SUCCESS" && <CheckCircle2 size={11} />}
      {status === "IN_PROGRESS" && <RefreshCw size={11} />}
      {status}
    </span>
  );
}

function FaultRecovery() {
  const [selectedFault, setSelectedFault] = useState(detectedFaults[0]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="fault-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="fault-header">
          <div>
            <p className="fault-eyebrow">SELF-HEALING CONTROL CENTER</p>

            <h1>Faults & Recovery</h1>

            <p className="fault-subtitle">
              Detect network faults, evaluate their severity and monitor
              automated recovery actions.
            </p>
          </div>

          <div className="fault-system-status">
            <span className="fault-live-dot" />

            <div>
              <span>SELF-HEALING ENGINE</span>
              <strong>OPERATIONAL</strong>
            </div>
          </div>
        </header>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="fault-summary-grid">
          <div className="fault-summary-card">
            <div className="fault-summary-icon red">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Detected Faults</span>
              <strong>2</strong>
              <small>Active incidents</small>
            </div>
          </div>

          <div className="fault-summary-card">
            <div className="fault-summary-icon orange">
              <RefreshCw size={20} />
            </div>

            <div>
              <span>Recovering</span>
              <strong>2</strong>
              <small>Actions in progress</small>
            </div>
          </div>

          <div className="fault-summary-card">
            <div className="fault-summary-icon green">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Recovered</span>
              <strong>8</strong>
              <small>Successful recoveries</small>
            </div>
          </div>

          <div className="fault-summary-card">
            <div className="fault-summary-icon purple">
              <BrainCircuit size={20} />
            </div>

            <div>
              <span>AI Decisions</span>
              <strong>10</strong>
              <small>Automated decisions</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            DETECTED FAULTS
        ===================================================== */}

        <section className="fault-section">
          <div className="fault-section-heading">
            <div>
              <h2>Detected Faults</h2>

              <p>
                Faults detected from the current MANET simulation.
              </p>
            </div>

            <span className="fault-live-label">
              <span />
              LIVE
            </span>
          </div>

          <div className="fault-table-wrapper">
            <table className="fault-table">
              <thead>
                <tr>
                  <th>Fault ID</th>
                  <th>Node</th>
                  <th>Fault Type</th>
                  <th>Severity</th>
                  <th>Detected By</th>
                  <th>Confidence</th>
                  <th>Detected</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {detectedFaults.map((fault) => (
                  <tr
                    key={fault.id}
                    className={
                      selectedFault.id === fault.id
                        ? "selected-fault"
                        : ""
                    }
                    onClick={() => setSelectedFault(fault)}
                  >
                    <td>
                      <span className="fault-id">{fault.id}</span>
                    </td>

                    <td>
                      <div className="fault-node">
                        <div className="fault-node-icon">
                          <Cpu size={14} />
                        </div>

                        <strong>{fault.node}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="fault-type">
                        {fault.faultType}
                      </span>
                    </td>

                    <td>
                      <SeverityBadge severity={fault.severity} />
                    </td>

                    <td>
                      <span className="detected-model">
                        {fault.detectedBy}
                      </span>
                    </td>

                    <td>
                      <strong className="confidence">
                        {fault.confidence}%
                      </strong>
                    </td>

                    <td>
                      <span className="detected-time">
                        {fault.detectedAt}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={fault.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="table-hint">
            Select a fault to view its recovery decision and affected node.
          </p>
        </section>

        {/* =====================================================
            FAULT DETAILS + RECOVERY DECISION
        ===================================================== */}

        <section className="fault-detail-grid">
          {/* AFFECTED NODE */}

          <div className="fault-section detail-card">
            <div className="fault-section-heading">
              <div>
                <h2>Affected Node</h2>

                <p>Selected fault details.</p>
              </div>

              <Cpu size={19} />
            </div>

            <div className="affected-node">
              <div className="affected-node-icon">
                <Cpu size={27} />
              </div>

              <div>
                <span>Node</span>
                <strong>{selectedFault.node}</strong>
              </div>

              <SeverityBadge severity={selectedFault.severity} />
            </div>

            <div className="node-detail-list">
              <div>
                <span>Fault Type</span>
                <strong>{selectedFault.faultType}</strong>
              </div>

              <div>
                <span>Detected By</span>
                <strong>{selectedFault.detectedBy}</strong>
              </div>

              <div>
                <span>Prediction Confidence</span>
                <strong>{selectedFault.confidence}%</strong>
              </div>

              <div>
                <span>Current Status</span>
                <StatusBadge status={selectedFault.status} />
              </div>
            </div>
          </div>

          {/* RECOVERY DECISION */}

          <div className="fault-section detail-card">
            <div className="fault-section-heading">
              <div>
                <h2>Recovery Decision</h2>

                <p>Decision generated by the recovery engine.</p>
              </div>

              <BrainCircuit size={19} />
            </div>

            {recoveryDecisions
              .filter(
                (decision) =>
                  decision.node === selectedFault.node
              )
              .map((decision) => (
                <div className="decision-content" key={decision.node}>
                  <div className="decision-header">
                    <div className="decision-icon">
                      <BrainCircuit size={21} />
                    </div>

                    <div>
                      <span>AI RECOMMENDATION</span>
                      <strong>{decision.decision}</strong>
                    </div>
                  </div>

                  <div className="decision-reason">
                    <span>Reason</span>
                    <p>{decision.reason}</p>
                  </div>

                  <div className="decision-action">
                    <div>
                      <span>Recommended Action</span>
                      <strong>{decision.action}</strong>
                    </div>

                    <span
                      className={`decision-priority ${decision.priority.toLowerCase()}`}
                    >
                      {decision.priority}
                    </span>
                  </div>
                </div>
              ))}

            {!recoveryDecisions.some(
              (decision) => decision.node === selectedFault.node
            ) && (
              <div className="no-decision">
                <ShieldCheck size={23} />

                <strong>No recovery decision required</strong>

                <span>
                  This node is currently being monitored.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            RECOVERY ACTION
        ===================================================== */}

        <section className="fault-section">
          <div className="fault-section-heading">
            <div>
              <h2>Recovery Actions</h2>

              <p>
                Actions currently being executed to restore network
                operation.
              </p>
            </div>

            <RefreshCw size={19} />
          </div>

          <div className="recovery-action-grid">
            <div className="recovery-action-card active">
              <div className="recovery-action-header">
                <div className="recovery-action-icon">
                  <RefreshCw size={19} />
                </div>

                <StatusBadge status="IN_PROGRESS" />
              </div>

              <span className="recovery-node">NODE N05</span>

              <h3>Reduce Traffic Load</h3>

              <p>
                Traffic is being redistributed to reduce battery
                consumption on the affected node.
              </p>

              <div className="recovery-progress-header">
                <span>Recovery Progress</span>
                <strong>68%</strong>
              </div>

              <div className="recovery-progress-track">
                <div
                  className="recovery-progress-value"
                  style={{ width: "68%" }}
                />
              </div>

              <div className="recovery-action-footer">
                <span>
                  <BrainCircuit size={12} />
                  AI Recovery
                </span>

                <span>Started 2 min ago</span>
              </div>
            </div>

            <div className="recovery-action-card active">
              <div className="recovery-action-header">
                <div className="recovery-action-icon orange">
                  <NetworkIcon />
                </div>

                <StatusBadge status="IN_PROGRESS" />
              </div>

              <span className="recovery-node">NODE N07</span>

              <h3>Reroute Traffic</h3>

              <p>
                Traffic is being redirected through an alternative
                communication path.
              </p>

              <div className="recovery-progress-header">
                <span>Recovery Progress</span>
                <strong>45%</strong>
              </div>

              <div className="recovery-progress-track">
                <div
                  className="recovery-progress-value"
                  style={{ width: "45%" }}
                />
              </div>

              <div className="recovery-action-footer">
                <span>
                  <BrainCircuit size={12} />
                  AI Recovery
                </span>

                <span>Started 4 min ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RECOVERY HISTORY
        ===================================================== */}

        <section className="fault-section">
          <div className="fault-section-heading">
            <div>
              <h2>Recovery History</h2>

              <p>
                Previous recovery decisions and their outcomes.
              </p>
            </div>

            <Clock3 size={19} />
          </div>

          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Recovery ID</th>
                  <th>Node</th>
                  <th>Fault</th>
                  <th>Decision</th>
                  <th>Action</th>
                  <th>Initiated By</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {recoveryHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="recovery-id">
                        {item.id}
                      </strong>
                    </td>

                    <td>
                      <div className="history-node">
                        <Cpu size={13} />
                        {item.node}
                      </div>
                    </td>

                    <td>
                      <span className="history-fault">
                        {item.fault}
                      </span>
                    </td>

                    <td>
                      <span className="history-decision">
                        {item.decision}
                      </span>
                    </td>

                    <td>
                      <span className="history-action">
                        {item.action}
                      </span>
                    </td>

                    <td>
                      <span className="initiated-by">
                        <BrainCircuit size={11} />
                        {item.initiatedBy}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      <span className="history-time">
                        {item.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            SELF HEALING FLOW
        ===================================================== */}

        <section className="fault-section healing-flow-section">
          <div className="fault-section-heading">
            <div>
              <h2>Self-Healing Flow</h2>

              <p>
                NeuroHeal fault detection and recovery workflow.
              </p>
            </div>

            <ShieldCheck size={19} />
          </div>

          <div className="healing-flow">
            <div className="flow-step completed">
              <div className="flow-icon">
                <AlertTriangle size={18} />
              </div>

              <strong>Fault Detected</strong>
              <span>Network anomaly identified</span>
            </div>

            <div className="flow-line completed" />

            <div className="flow-step completed">
              <div className="flow-icon">
                <BrainCircuit size={18} />
              </div>

              <strong>AI Analysis</strong>
              <span>Fault classified and risk evaluated</span>
            </div>

            <div className="flow-line completed" />

            <div className="flow-step active">
              <div className="flow-icon">
                <Zap size={18} />
              </div>

              <strong>Recovery Decision</strong>
              <span>Best recovery action selected</span>
            </div>

            <div className="flow-line active" />

            <div className="flow-step active">
              <div className="flow-icon">
                <RefreshCw size={18} />
              </div>

              <strong>Self-Healing</strong>
              <span>Recovery action executing</span>
            </div>

            <div className="flow-line" />

            <div className="flow-step">
              <div className="flow-icon">
                <CheckCircle2 size={18} />
              </div>

              <strong>Recovered</strong>
              <span>Network returns to stable state</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="fault-footer">
          <span>
            NeuroHeal · Predictive Self-Healing MANET
          </span>

          <span>
            <span className="fault-footer-dot" />
            Recovery Engine Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Small network icon used by the recovery action card.
|--------------------------------------------------------------------------
*/

function NetworkIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v5" />
      <path d="M12 12 5 17" />
      <path d="m12 12 7 5" />
    </svg>
  );
}

export default FaultRecovery;