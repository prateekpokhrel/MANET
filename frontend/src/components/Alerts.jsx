import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Info,
  Link2,
  Network,
  RefreshCw,
  ShieldAlert,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./Alerts.css";

const initialAlerts = [
  {
    id: 1,
    title: "Critical Node Failure",
    description: "Node N07 stopped responding to network health checks.",
    category: "Node Failure",
    severity: "Critical",
    node: "N07",
    time: "2 min ago",
    timestamp: "19:51:24",
    unread: true,
    recovery: "Traffic successfully rerouted",
  },
  {
    id: 2,
    title: "Battery Level Critical",
    description: "Node N12 battery capacity has fallen below the safe threshold.",
    category: "AI Warning",
    severity: "High",
    node: "N12",
    time: "6 min ago",
    timestamp: "19:47:13",
    unread: true,
    recovery: "Isolation recommended",
  },
  {
    id: 3,
    title: "Link Quality Degraded",
    description: "Signal quality between N03 and N09 is below the configured threshold.",
    category: "Link Failure",
    severity: "Medium",
    node: "N03 → N09",
    time: "11 min ago",
    timestamp: "19:42:08",
    unread: true,
    recovery: "Alternate route selected",
  },
  {
    id: 4,
    title: "High Latency Detected",
    description: "Network latency on node N05 exceeded the expected operating range.",
    category: "AI Warning",
    severity: "Medium",
    node: "N05",
    time: "18 min ago",
    timestamp: "19:35:51",
    unread: false,
    recovery: "Traffic redistributed",
  },
  {
    id: 5,
    title: "Packet Loss Increase",
    description: "Packet delivery on the N10 to N14 path has degraded.",
    category: "Link Failure",
    severity: "Low",
    node: "N10 → N14",
    time: "26 min ago",
    timestamp: "19:28:37",
    unread: false,
    recovery: "Monitoring",
  },
  {
    id: 6,
    title: "Recovery Completed",
    description: "Self-healing successfully restored connectivity for node N07.",
    category: "Recovery",
    severity: "Info",
    node: "N07",
    time: "31 min ago",
    timestamp: "19:23:16",
    unread: false,
    recovery: "Completed",
  },
  {
    id: 7,
    title: "Node Battery Warning",
    description: "Node N11 battery level is approaching the warning threshold.",
    category: "AI Warning",
    severity: "Low",
    node: "N11",
    time: "42 min ago",
    timestamp: "19:12:04",
    unread: false,
    recovery: "Monitoring",
  },
];

const criticalEvents = [
  {
    title: "Node N07 failure",
    detail: "Automatic rerouting initiated",
    time: "19:51:24",
    severity: "Critical",
  },
  {
    title: "Node N12 battery critical",
    detail: "Isolation action pending",
    time: "19:47:13",
    severity: "High",
  },
  {
    title: "N03 → N09 link degradation",
    detail: "Alternate path activated",
    time: "19:42:08",
    severity: "Medium",
  },
];

const recoveryNotifications = [
  {
    title: "Traffic rerouted",
    node: "N07",
    duration: "18 sec",
    result: "Successful",
  },
  {
    title: "Alternate link selected",
    node: "N03 → N09",
    duration: "9 sec",
    result: "Successful",
  },
  {
    title: "Traffic redistributed",
    node: "N05",
    duration: "14 sec",
    result: "Successful",
  },
];

function AlertIcon({ severity }) {
  if (severity === "Critical") return <AlertOctagon size={18} />;
  if (severity === "High") return <AlertTriangle size={18} />;
  if (severity === "Medium") return <AlertCircle size={18} />;
  if (severity === "Low") return <Info size={18} />;
  return <CheckCircle2 size={18} />;
}

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(initialAlerts[0]);

  const categories = [
    "All",
    "Node Failure",
    "Link Failure",
    "AI Warning",
    "Recovery",
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const categoryMatch = category === "All" || alert.category === category;
      const severityMatch =
        severity === "All" || alert.severity === severity;
      const unreadMatch = !unreadOnly || alert.unread;

      return categoryMatch && severityMatch && unreadMatch;
    });
  }, [alerts, category, severity, unreadOnly]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter((alert) => alert.severity === "Critical").length,
      unread: alerts.filter((alert) => alert.unread).length,
      recovery: alerts.filter((alert) => alert.category === "Recovery").length,
    };
  }, [alerts]);

  const markAsRead = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, unread: false } : alert
      )
    );

    setSelectedAlert((current) =>
      current?.id === id ? { ...current, unread: false } : current
    );
  };

  const markAllRead = () => {
    setAlerts((current) =>
      current.map((alert) => ({ ...alert, unread: false }))
    );

    setSelectedAlert((current) =>
      current ? { ...current, unread: false } : current
    );
  };

  const clearRead = () => {
    setAlerts((current) => current.filter((alert) => alert.unread));

    if (selectedAlert && !selectedAlert.unread) {
      const next = alerts.find((alert) => alert.unread);
      setSelectedAlert(next || null);
    }
  };

  const refreshAlerts = () => {
    setAlerts([...initialAlerts]);
    setSelectedAlert(initialAlerts[0]);
  };

  return (
    <div className="alerts-page">
      <Sidebar activePage="alerts" />

      <main className="alerts-main">
        <header className="alerts-header">
          <div>
            <div className="page-eyebrow">
              <Bell size={15} />
              NETWORK EVENT CENTER
            </div>
            <h1>Alerts</h1>
            <p>
              Monitor critical network events, AI warnings, node failures,
              link failures, and recovery notifications.
            </p>
          </div>

          <button className="alerts-refresh-button" onClick={refreshAlerts}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="alerts-summary-grid">
          <div className="alert-summary-card">
            <div className="alert-summary-icon blue">
              <Bell size={20} />
            </div>
            <div>
              <span>Total Alerts</span>
              <strong>{stats.total}</strong>
            </div>
            <small>Current session</small>
          </div>

          <div className="alert-summary-card">
            <div className="alert-summary-icon red">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span>Critical Events</span>
              <strong>{stats.critical}</strong>
            </div>
            <small>High priority</small>
          </div>

          <div className="alert-summary-card">
            <div className="alert-summary-icon amber">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span>Unread</span>
              <strong>{stats.unread}</strong>
            </div>
            <small>Needs review</small>
          </div>

          <div className="alert-summary-card">
            <div className="alert-summary-icon green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span>Recoveries</span>
              <strong>{stats.recovery}</strong>
            </div>
            <small>Completed events</small>
          </div>
        </section>

        <section className="alerts-toolbar">
          <div className="toolbar-left">
            <Filter size={16} />
            <span>Filter Events</span>
          </div>

          <div className="category-tabs">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <select
            className="alert-severity-select"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Info">Info</option>
          </select>

          <label className="unread-toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            <span />
            Unread only
          </label>

          <div className="toolbar-actions">
            <button onClick={markAllRead}>
              <Check size={14} />
              Mark all read
            </button>
            <button onClick={clearRead}>
              <Trash2 size={14} />
              Clear read
            </button>
          </div>
        </section>

        <section className="alerts-layout">
          <div className="alerts-list-panel">
            <div className="alerts-panel-header">
              <div>
                <span className="section-label">EVENT STREAM</span>
                <h2>Network Alerts</h2>
              </div>
              <span className="alerts-count">
                {filteredAlerts.length} events
              </span>
            </div>

            <div className="alert-list">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <article
                    key={alert.id}
                    className={`alert-item ${
                      selectedAlert?.id === alert.id ? "selected" : ""
                    } ${alert.unread ? "unread" : ""}`}
                    onClick={() => {
                      setSelectedAlert(alert);
                      markAsRead(alert.id);
                    }}
                  >
                    <div className={`alert-icon ${alert.severity.toLowerCase()}`}>
                      <AlertIcon severity={alert.severity} />
                    </div>

                    <div className="alert-content">
                      <div className="alert-title-row">
                        <strong>{alert.title}</strong>
                        {alert.unread && <span className="unread-dot" />}
                      </div>

                      <p>{alert.description}</p>

                      <div className="alert-meta">
                        <span>{alert.category}</span>
                        <span className="meta-divider">•</span>
                        <span>
                          <Network size={11} />
                          {alert.node}
                        </span>
                        <span className="meta-divider">•</span>
                        <span>
                          <Clock3 size={11} />
                          {alert.time}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className="alert-chevron"
                    />
                  </article>
                ))
              ) : (
                <div className="empty-alerts">
                  <CheckCircle2 size={28} />
                  <strong>No matching alerts</strong>
                  <span>
                    No events match the selected filters.
                  </span>
                </div>
              )}
            </div>
          </div>

          <aside className="alert-detail-panel">
            {selectedAlert ? (
              <>
                <div className="alert-detail-top">
                  <div className={`large-alert-icon ${selectedAlert.severity.toLowerCase()}`}>
                    <AlertIcon severity={selectedAlert.severity} />
                  </div>

                  <div>
                    <span className="section-label">SELECTED EVENT</span>
                    <h2>{selectedAlert.title}</h2>
                    <span className="detail-event-id">
                      ALERT-{String(selectedAlert.id).padStart(4, "0")}
                    </span>
                  </div>
                </div>

                <div className="detail-severity-row">
                  <span>Severity</span>
                  <span
                    className={`detail-severity ${selectedAlert.severity.toLowerCase()}`}
                  >
                    {selectedAlert.severity}
                  </span>
                </div>

                <div className="alert-description">
                  <span>Description</span>
                  <p>{selectedAlert.description}</p>
                </div>

                <div className="alert-detail-grid">
                  <div>
                    <span>Affected Node</span>
                    <strong>
                      <Network size={14} />
                      {selectedAlert.node}
                    </strong>
                  </div>

                  <div>
                    <span>Detected</span>
                    <strong>
                      <Clock3 size={14} />
                      {selectedAlert.timestamp}
                    </strong>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>{selectedAlert.category}</strong>
                  </div>

                  <div>
                    <span>Event State</span>
                    <strong>
                      {selectedAlert.unread ? "Unread" : "Reviewed"}
                    </strong>
                  </div>
                </div>

                <div className="recovery-notice">
                  <div className="recovery-notice-icon">
                    <Zap size={17} />
                  </div>
                  <div>
                    <span>Recovery Action</span>
                    <strong>{selectedAlert.recovery}</strong>
                  </div>
                </div>

                {selectedAlert.unread && (
                  <button
                    className="mark-read-button"
                    onClick={() => markAsRead(selectedAlert.id)}
                  >
                    <Check size={16} />
                    Mark as Read
                  </button>
                )}
              </>
            ) : (
              <div className="no-selection">
                <Bell size={30} />
                <span>Select an alert to view details</span>
              </div>
            )}
          </aside>
        </section>

        <section className="bottom-alert-grid">
          <div className="critical-events-panel">
            <div className="bottom-panel-header">
              <div>
                <span className="section-label">PRIORITY EVENTS</span>
                <h2>Critical Network Events</h2>
              </div>
              <AlertOctagon size={18} />
            </div>

            <div className="critical-event-list">
              {criticalEvents.map((event) => (
                <div className="critical-event" key={event.time}>
                  <div className={`critical-event-icon ${event.severity.toLowerCase()}`}>
                    {event.severity === "Critical" ? (
                      <XCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                  </div>

                  <div className="critical-event-content">
                    <strong>{event.title}</strong>
                    <span>{event.detail}</span>
                  </div>

                  <time>{event.time}</time>
                </div>
              ))}
            </div>
          </div>

          <div className="recovery-notifications-panel">
            <div className="bottom-panel-header">
              <div>
                <span className="section-label">SELF-HEALING</span>
                <h2>Recovery Notifications</h2>
              </div>
              <CheckCircle2 size={18} />
            </div>

            <div className="recovery-notification-list">
              {recoveryNotifications.map((item) => (
                <div className="recovery-notification" key={item.node}>
                  <div className="recovery-check">
                    <CheckCircle2 size={16} />
                  </div>

                  <div className="recovery-notification-content">
                    <strong>{item.title}</strong>
                    <span>{item.node}</span>
                  </div>

                  <div className="recovery-duration">
                    <span>{item.duration}</span>
                    <small>{item.result}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Alerts;