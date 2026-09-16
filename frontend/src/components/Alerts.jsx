import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  Link2,
  RefreshCw,
  ShieldAlert,
  Trash2,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import "./Alerts.css";

/*
|--------------------------------------------------------------------------
| DEMO ALERT DATA
|--------------------------------------------------------------------------
| Replace this with your Spring Boot alert API later.
|
| Suggested backend fields:
| id, type, severity, title, message, node, model,
| timestamp, status
|--------------------------------------------------------------------------
*/

const initialAlerts = [
  {
    id: "ALT-001",
    type: "AI_WARNING",
    severity: "CRITICAL",
    title: "High failure probability detected",
    message:
      "Random Forest predicts a high probability of failure for node N05.",
    node: "N05",
    model: "Random Forest",
    timestamp: "2 min ago",
    status: "UNREAD",
  },
  {
    id: "ALT-002",
    type: "NODE_FAILURE",
    severity: "CRITICAL",
    title: "Node failure detected",
    message:
      "Node N07 has stopped responding to network health checks.",
    node: "N07",
    model: "XGBoost",
    timestamp: "4 min ago",
    status: "UNREAD",
  },
  {
    id: "ALT-003",
    type: "LINK_FAILURE",
    severity: "HIGH",
    title: "Communication link unavailable",
    message:
      "Link L05 between N05 and N07 has become unavailable.",
    node: "N05 ↔ N07",
    model: "Network Monitor",
    timestamp: "5 min ago",
    status: "UNREAD",
  },
  {
    id: "ALT-004",
    type: "RECOVERY",
    severity: "INFO",
    title: "Recovery action initiated",
    message:
      "AI recovery engine started traffic redistribution for node N05.",
    node: "N05",
    model: "AI Recovery",
    timestamp: "6 min ago",
    status: "READ",
  },
  {
    id: "ALT-005",
    type: "CRITICAL_EVENT",
    severity: "HIGH",
    title: "Network connectivity degraded",
    message:
      "Overall network connectivity dropped below the configured threshold.",
    node: "Network",
    model: "Network Monitor",
    timestamp: "8 min ago",
    status: "READ",
  },
  {
    id: "ALT-006",
    type: "AI_WARNING",
    severity: "MEDIUM",
    title: "Battery degradation warning",
    message:
      "Node N04 is showing increasing battery degradation indicators.",
    node: "N04",
    model: "Random Forest",
    timestamp: "12 min ago",
    status: "READ",
  },
  {
    id: "ALT-007",
    type: "RECOVERY",
    severity: "INFO",
    title: "Node successfully recovered",
    message:
      "Node N03 has successfully rejoined the MANET after recovery.",
    node: "N03",
    model: "Self-Healing",
    timestamp: "18 min ago",
    status: "READ",
  },
  {
    id: "ALT-008",
    type: "LINK_FAILURE",
    severity: "MEDIUM",
    title: "Link quality degraded",
    message:
      "Communication quality on link L04 has dropped below the warning threshold.",
    node: "N04 ↔ N05",
    model: "Network Monitor",
    timestamp: "23 min ago",
    status: "READ",
  },
];

/*
|--------------------------------------------------------------------------
| Alert icon
|--------------------------------------------------------------------------
*/

function AlertTypeIcon({ type, severity }) {
  if (type === "AI_WARNING") {
    return <BrainCircuit size={18} />;
  }

  if (type === "NODE_FAILURE") {
    return <Cpu size={18} />;
  }

  if (type === "LINK_FAILURE") {
    return <Link2 size={18} />;
  }

  if (type === "RECOVERY") {
    return <RefreshCw size={18} />;
  }

  if (severity === "CRITICAL") {
    return <ShieldAlert size={18} />;
  }

  return <AlertTriangle size={18} />;
}

/*
|--------------------------------------------------------------------------
| Severity badge
|--------------------------------------------------------------------------
*/

function SeverityBadge({ severity }) {
  const normalized = severity.toLowerCase();

  return (
    <span className={`alert-severity ${normalized}`}>
      {severity === "CRITICAL" && <XCircle size={11} />}
      {severity === "HIGH" && <AlertTriangle size={11} />}
      {severity === "MEDIUM" && <AlertCircle size={11} />}
      {severity === "INFO" && <CheckCircle2 size={11} />}

      {severity}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Type label
|--------------------------------------------------------------------------
*/

function getTypeLabel(type) {
  const labels = {
    CRITICAL_EVENT: "Critical Event",
    AI_WARNING: "AI Warning",
    NODE_FAILURE: "Node Failure",
    LINK_FAILURE: "Link Failure",
    RECOVERY: "Recovery",
  };

  return labels[type] || type;
}

/*
|--------------------------------------------------------------------------
| Main page
|--------------------------------------------------------------------------
*/

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Counts
  |--------------------------------------------------------------------------
  */

  const unreadCount = alerts.filter(
    (alert) => alert.status === "UNREAD"
  ).length;

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;

  const warningCount = alerts.filter(
    (alert) =>
      alert.severity === "HIGH" ||
      alert.severity === "MEDIUM"
  ).length;

  const recoveryCount = alerts.filter(
    (alert) => alert.type === "RECOVERY"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | Filter alerts
  |--------------------------------------------------------------------------
  */

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesType =
        filter === "ALL" || alert.type === filter;

      const matchesSeverity =
        severityFilter === "ALL" ||
        alert.severity === severityFilter;

      const matchesUnread =
        !showUnreadOnly || alert.status === "UNREAD";

      return (
        matchesType &&
        matchesSeverity &&
        matchesUnread
      );
    });
  }, [
    alerts,
    filter,
    severityFilter,
    showUnreadOnly,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Mark alert as read
  |--------------------------------------------------------------------------
  */

  const markAsRead = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? { ...alert, status: "READ" }
          : alert
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Mark all as read
  |--------------------------------------------------------------------------
  */

  const markAllAsRead = () => {
    setAlerts((current) =>
      current.map((alert) => ({
        ...alert,
        status: "READ",
      }))
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Clear read alerts
  |--------------------------------------------------------------------------
  */

  const clearReadAlerts = () => {
    setAlerts((current) =>
      current.filter(
        (alert) => alert.status !== "READ"
      )
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="alerts-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="alerts-header">
          <div>
            <p className="alerts-eyebrow">
              NETWORK EVENT CENTER
            </p>

            <h1>Alerts</h1>

            <p className="alerts-subtitle">
              Monitor critical network events, AI warnings,
              failures and recovery notifications.
            </p>
          </div>

          <div className="alerts-header-status">
            <div className="alerts-bell">
              <Bell size={20} />

              {unreadCount > 0 && (
                <span>{unreadCount}</span>
              )}
            </div>

            <div>
              <span>ALERT SYSTEM</span>
              <strong>MONITORING</strong>
            </div>
          </div>
        </header>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="alerts-summary-grid">
          <div className="alerts-summary-card critical">
            <div className="alerts-summary-icon">
              <ShieldAlert size={19} />
            </div>

            <div>
              <span>Critical Events</span>
              <strong>{criticalCount}</strong>
              <small>Immediate attention</small>
            </div>
          </div>

          <div className="alerts-summary-card warning">
            <div className="alerts-summary-icon">
              <AlertTriangle size={19} />
            </div>

            <div>
              <span>AI Warnings</span>
              <strong>
                {
                  alerts.filter(
                    (alert) =>
                      alert.type === "AI_WARNING"
                  ).length
                }
              </strong>
              <small>Predictive warnings</small>
            </div>
          </div>

          <div className="alerts-summary-card failure">
            <div className="alerts-summary-icon">
              <WifiOff size={19} />
            </div>

            <div>
              <span>Active Failures</span>
              <strong>
                {
                  alerts.filter(
                    (alert) =>
                      alert.type === "NODE_FAILURE" ||
                      alert.type === "LINK_FAILURE"
                  ).length
                }
              </strong>
              <small>Node & link failures</small>
            </div>
          </div>

          <div className="alerts-summary-card recovery">
            <div className="alerts-summary-icon">
              <RefreshCw size={19} />
            </div>

            <div>
              <span>Recovery Events</span>
              <strong>{recoveryCount}</strong>
              <small>Self-healing activity</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            ALERT CATEGORY BAR
        ===================================================== */}

        <section className="alerts-category-section">
          <div className="alerts-category-header">
            <div>
              <h2>Alert Categories</h2>

              <p>
                Filter network events by alert type.
              </p>
            </div>

            <span className="alerts-total">
              {alerts.length} total alerts
            </span>
          </div>

          <div className="alerts-category-grid">
            <button
              type="button"
              className={`alert-category ${
                filter === "ALL" ? "active" : ""
              }`}
              onClick={() => setFilter("ALL")}
            >
              <div className="alert-category-icon all">
                <Bell size={17} />
              </div>

              <div>
                <strong>All Alerts</strong>
                <span>{alerts.length}</span>
              </div>
            </button>

            <button
              type="button"
              className={`alert-category ${
                filter === "CRITICAL_EVENT"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("CRITICAL_EVENT")
              }
            >
              <div className="alert-category-icon critical">
                <ShieldAlert size={17} />
              </div>

              <div>
                <strong>Critical Events</strong>
                <span>
                  {
                    alerts.filter(
                      (alert) =>
                        alert.type ===
                        "CRITICAL_EVENT"
                    ).length
                  }
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`alert-category ${
                filter === "AI_WARNING"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("AI_WARNING")
              }
            >
              <div className="alert-category-icon ai">
                <BrainCircuit size={17} />
              </div>

              <div>
                <strong>AI Warnings</strong>
                <span>
                  {
                    alerts.filter(
                      (alert) =>
                        alert.type ===
                        "AI_WARNING"
                    ).length
                  }
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`alert-category ${
                filter === "NODE_FAILURE"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("NODE_FAILURE")
              }
            >
              <div className="alert-category-icon node">
                <Cpu size={17} />
              </div>

              <div>
                <strong>Node Failures</strong>
                <span>
                  {
                    alerts.filter(
                      (alert) =>
                        alert.type ===
                        "NODE_FAILURE"
                    ).length
                  }
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`alert-category ${
                filter === "LINK_FAILURE"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("LINK_FAILURE")
              }
            >
              <div className="alert-category-icon link">
                <Link2 size={17} />
              </div>

              <div>
                <strong>Link Failures</strong>
                <span>
                  {
                    alerts.filter(
                      (alert) =>
                        alert.type ===
                        "LINK_FAILURE"
                    ).length
                  }
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`alert-category ${
                filter === "RECOVERY"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("RECOVERY")
              }
            >
              <div className="alert-category-icon recovery">
                <RefreshCw size={17} />
              </div>

              <div>
                <strong>Recovery</strong>
                <span>
                  {
                    alerts.filter(
                      (alert) =>
                        alert.type === "RECOVERY"
                    ).length
                  }
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* =====================================================
            FILTER TOOLBAR
        ===================================================== */}

        <section className="alerts-toolbar">
          <div className="alerts-toolbar-left">
            <div className="alerts-filter">
              <label htmlFor="severity-filter">
                Severity
              </label>

              <div className="alerts-select">
                <select
                  id="severity-filter"
                  value={severityFilter}
                  onChange={(event) =>
                    setSeverityFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="ALL">
                    All Severities
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="INFO">
                    Info
                  </option>
                </select>

                <ChevronDown size={13} />
              </div>
            </div>

            <label className="unread-toggle">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(event) =>
                  setShowUnreadOnly(
                    event.target.checked
                  )
                }
              />

              <span className="toggle-box" />

              <span>Unread only</span>
            </label>
          </div>

          <div className="alerts-toolbar-actions">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="alerts-action-button"
            >
              <CheckCircle2 size={14} />
              Mark all read
            </button>

            <button
              type="button"
              onClick={clearReadAlerts}
              disabled={
                alerts.length === unreadCount
              }
              className="alerts-action-button danger"
            >
              <Trash2 size={14} />
              Clear read
            </button>
          </div>
        </section>

        {/* =====================================================
            ACTIVE ALERTS
        ===================================================== */}

        <section className="alerts-main-section">
          <div className="alerts-section-heading">
            <div>
              <h2>Network Alerts</h2>

              <p>
                Latest events generated by the MANET monitoring
                and AI systems.
              </p>
            </div>

            <div className="alerts-live-label">
              <span />
              LIVE MONITORING
            </div>
          </div>

          <div className="alerts-list">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className={`alert-item ${
                    alert.status === "UNREAD"
                      ? "unread"
                      : ""
                  } ${alert.severity.toLowerCase()}`}
                >
                  <div
                    className={`alert-item-icon ${alert.type.toLowerCase()}`}
                  >
                    <AlertTypeIcon
                      type={alert.type}
                      severity={alert.severity}
                    />
                  </div>

                  <div className="alert-item-content">
                    <div className="alert-item-top">
                      <div className="alert-item-title">
                        <span className="alert-id">
                          {alert.id}
                        </span>

                        <span className="alert-type-label">
                          {getTypeLabel(alert.type)}
                        </span>

                        {alert.status ===
                          "UNREAD" && (
                          <span className="unread-label">
                            NEW
                          </span>
                        )}
                      </div>

                      <span className="alert-time">
                        <Clock3 size={11} />
                        {alert.timestamp}
                      </span>
                    </div>

                    <h3>{alert.title}</h3>

                    <p>{alert.message}</p>

                    <div className="alert-meta">
                      <span className="alert-meta-node">
                        {alert.type ===
                        "LINK_FAILURE" ? (
                          <Link2 size={12} />
                        ) : (
                          <Cpu size={12} />
                        )}

                        {alert.node}
                      </span>

                      <span className="alert-meta-model">
                        <BrainCircuit size={12} />
                        {alert.model}
                      </span>

                      <SeverityBadge
                        severity={alert.severity}
                      />
                    </div>
                  </div>

                  <div className="alert-item-action">
                    {alert.status === "UNREAD" ? (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(alert.id)
                        }
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="read-label">
                        <CheckCircle2 size={13} />
                        Read
                      </span>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="alerts-empty">
                <div className="alerts-empty-icon">
                  <CheckCircle2 size={24} />
                </div>

                <h3>No alerts found</h3>

                <p>
                  No alerts match the current filters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            CRITICAL EVENTS
        ===================================================== */}

        <section className="alerts-bottom-grid">
          <div className="alerts-panel critical-panel">
            <div className="alerts-panel-heading">
              <div className="alerts-panel-icon critical">
                <ShieldAlert size={18} />
              </div>

              <div>
                <h2>Critical Network Events</h2>

                <p>
                  Events requiring immediate attention.
                </p>
              </div>
            </div>

            <div className="critical-events">
              {alerts
                .filter(
                  (alert) =>
                    alert.severity === "CRITICAL"
                )
                .map((alert) => (
                  <div
                    className="critical-event"
                    key={alert.id}
                  >
                    <div>
                      <strong>{alert.title}</strong>

                      <span>
                        {alert.node} · {alert.timestamp}
                      </span>
                    </div>

                    <SeverityBadge
                      severity={alert.severity}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* ===================================================
              RECOVERY NOTIFICATIONS
          =================================================== */}

          <div className="alerts-panel recovery-panel">
            <div className="alerts-panel-heading">
              <div className="alerts-panel-icon recovery">
                <RefreshCw size={18} />
              </div>

              <div>
                <h2>Recovery Notifications</h2>

                <p>
                  Latest self-healing activity.
                </p>
              </div>
            </div>

            <div className="recovery-notifications">
              {alerts
                .filter(
                  (alert) =>
                    alert.type === "RECOVERY"
                )
                .map((alert) => (
                  <div
                    className="recovery-notification"
                    key={alert.id}
                  >
                    <div className="recovery-notification-icon">
                      {alert.title.includes(
                        "recovered"
                      ) ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <RefreshCw size={15} />
                      )}
                    </div>

                    <div>
                      <strong>
                        {alert.title}
                      </strong>

                      <span>
                        {alert.node} ·{" "}
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="alerts-footer">
          <span>
            NeuroHeal · Predictive Self-Healing MANET
          </span>

          <span>
            <span className="alerts-footer-dot" />
            Alert Monitoring Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Alerts;