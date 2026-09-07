import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Network,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Radio,
} from "lucide-react";
import Sidebar from "./Sidebar";
import "./Home.css";

const stats = [
  {
    label: "Network Health",
    value: "92%",
    status: "Healthy",
    type: "health",
    icon: ShieldCheck,
  },
  {
    label: "Active Nodes",
    value: "8",
    status: "Online",
    type: "active",
    icon: Network,
  },
  {
    label: "Failed Nodes",
    value: "2",
    status: "Attention",
    type: "failed",
    icon: AlertTriangle,
  },
  {
    label: "Healthy Nodes",
    value: "8",
    status: "Stable",
    type: "healthy",
    icon: CheckCircle2,
  },
];

const recentEvents = [
  {
    node: "N05",
    event: "Failure detected",
    action: "AI assigned",
    time: "2 min ago",
    type: "ai",
  },
  {
    node: "N07",
    event: "Failure detected",
    action: "Human assigned",
    time: "4 min ago",
    type: "human",
  },
  {
    node: "N05",
    event: "AI recovery initiated",
    action: "In progress",
    time: "5 min ago",
    type: "ai",
  },
  {
    node: "N07",
    event: "Operator recovery initiated",
    action: "In progress",
    time: "6 min ago",
    type: "human",
  },
  {
    node: "N03",
    event: "Successfully rejoined network",
    action: "Recovered",
    time: "8 min ago",
    type: "success",
  },
];

function StatCard({ label, value, status, type, icon: Icon }) {
  return (
    <div className={`home-stat-card ${type}`}>
      <div className="home-stat-top">
        <span>{label}</span>

        <div className="home-stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <div className="home-stat-value">{value}</div>

      <div className="home-stat-bottom">
        <span className="home-status-dot" />
        <span className="home-stat-status">{status}</span>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="home-dashboard">
        <header className="home-header">
          <div>
            <p className="home-eyebrow">NETWORK OPERATIONS CENTER</p>

            <h1>MANET Dashboard</h1>

            <p className="home-subtitle">
              Monitor network health, failure prediction, and recovery activity
              in real time.
            </p>
          </div>

          <div className="home-header-actions">
            <div className="home-simulation">
              <Radio size={18} />
              <div>
                <span className="home-simulation-label">Simulation</span>
                <strong>RUNNING</strong>
              </div>
            </div>

            <button
              className="home-logout"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <section className="home-stats">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="home-panel home-overview">
          <div className="home-panel-heading">
            <div>
              <h2>Failure & Recovery Overview</h2>
              <p>Current network incidents and recovery assignments.</p>
            </div>

            <span className="home-active-badge">
              <AlertTriangle size={15} />
              2 Active Failures
            </span>
          </div>

          <div className="home-overview-grid">
            <div className="home-overview-item">
              <span>Active Failures</span>
              <strong>2</strong>
            </div>

            <div className="home-overview-item ai">
              <span>AI Assigned</span>
              <strong>1</strong>
            </div>

            <div className="home-overview-item human">
              <span>Human Assigned</span>
              <strong>1</strong>
            </div>

            <div className="home-overview-item recovering">
              <span>Recovering</span>
              <strong>2</strong>
            </div>

            <div className="home-overview-item recovered">
              <span>Recovered</span>
              <strong>8</strong>
            </div>
          </div>
        </section>

        <section className="home-main-grid">
          <div className="home-panel">
            <div className="home-panel-heading">
              <div>
                <h2>AI Failure Prediction</h2>
                <p>Highest-risk node identified by the prediction model.</p>
              </div>

              <span className="home-risk-badge">
                <BrainCircuit size={15} />
                HIGH RISK
              </span>
            </div>

            <div className="home-prediction-node">
              <div className="home-node-icon">
                <Cpu size={25} />
              </div>

              <div className="home-node-info">
                <span>Highest Risk Node</span>
                <strong>N05</strong>
              </div>

              <div className="home-probability">
                <span>Failure Probability</span>
                <strong>87%</strong>
              </div>
            </div>

            <div className="home-prediction-details">
              <div>
                <span>Predicted Failure</span>
                <strong>LOW_BATTERY</strong>
              </div>

              <div>
                <span>Risk Level</span>
                <strong className="risk-text">HIGH</strong>
              </div>
            </div>

            <div className="home-progress">
              <div className="home-progress-track">
                <div
                  className="home-progress-value"
                  style={{ width: "87%" }}
                />
              </div>

              <span>87%</span>
            </div>
          </div>

          <div className="home-panel">
            <div className="home-panel-heading">
              <div>
                <h2>Failure Classification</h2>
                <p>Latest detected failure and assigned recovery path.</p>
              </div>

              <span className="home-human-badge">
                <Activity size={15} />
                HUMAN
              </span>
            </div>

            <div className="home-classification">
              <div className="home-classification-node">
                <span>Latest Failure</span>
                <strong>N07</strong>
              </div>

              <div className="home-classification-row">
                <span>Failure Type</span>
                <strong>LINK_FAILURE</strong>
              </div>

              <div className="home-classification-row">
                <span>Assigned To</span>
                <strong className="human-text">HUMAN</strong>
              </div>

              <div className="home-classification-row">
                <span>Status</span>
                <strong className="recovering-text">RECOVERING</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="home-main-grid">
          <div className="home-panel">
            <div className="home-panel-heading">
              <div>
                <h2>Network Status</h2>
                <p>Current network-level performance.</p>
              </div>

              <Activity size={21} />
            </div>

            <div className="home-metrics-grid">
              <div className="home-metric">
                <span>Connectivity</span>
                <strong>94%</strong>
              </div>

              <div className="home-metric">
                <span>Packet Delivery</span>
                <strong>96%</strong>
              </div>

              <div className="home-metric">
                <span>Avg. Latency</span>
                <strong>42 ms</strong>
              </div>

              <div className="home-metric">
                <span>Simulation</span>
                <strong className="running-text">RUNNING</strong>
              </div>
            </div>
          </div>

          <div className="home-panel">
            <div className="home-panel-heading">
              <div>
                <h2>Recovery Status</h2>
                <p>Current AI and human recovery activity.</p>
              </div>

              <RefreshCw size={21} />
            </div>

            <div className="home-recovery-grid">
              <div className="home-recovery-card ai">
                <span>AI Recovery</span>
                <strong>1</strong>
                <small>In Progress</small>
              </div>

              <div className="home-recovery-card human">
                <span>Human Recovery</span>
                <strong>1</strong>
                <small>In Progress</small>
              </div>

              <div className="home-recovery-card">
                <span>Total Recovering</span>
                <strong>2</strong>
                <small>Active</small>
              </div>

              <div className="home-recovery-card recovered">
                <span>Last Recovered</span>
                <strong>N03</strong>
                <small>Successfully Rejoined</small>
              </div>
            </div>
          </div>
        </section>

        <section className="home-panel home-events">
          <div className="home-panel-heading">
            <div>
              <h2>Recent Events</h2>
              <p>Latest important network and recovery events.</p>
            </div>

            <button className="home-view-all" type="button">
              View All Events
            </button>
          </div>

          <div className="home-event-list">
            {recentEvents.map((event, index) => (
              <div className="home-event" key={`${event.node}-${index}`}>
                <span className={`home-event-indicator ${event.type}`} />

                <div className="home-event-content">
                  <strong>{event.node}</strong>
                  <span>{event.event}</span>
                </div>

                <span className={`home-event-action ${event.type}`}>
                  {event.action}
                </span>

                <time>{event.time}</time>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;