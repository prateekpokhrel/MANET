import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  LogOut,
  Network,
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import "./Home.css";



const networkStats = [
  {
    label: "Network Health",
    value: "92%",
    status: "Healthy",
    icon: ShieldCheck,
    type: "health",
  },
  {
    label: "Active Nodes",
    value: "13",
    status: "Online",
    icon: Network,
    type: "active",
  },
  {
    label: "Failed Nodes",
    value: "2",
    status: "Attention",
    icon: AlertTriangle,
    type: "failed",
  },
  {
    label: "Active Links",
    value: "24",
    status: "Connected",
    icon: Activity,
    type: "links",
  },
];

const recentEvents = [
  {
    node: "N05",
    event: "Low battery risk detected",
    model: "Random Forest",
    status: "High Risk",
    time: "2 min ago",
    type: "warning",
  },
  {
    node: "N07",
    event: "Link failure classified",
    model: "XGBoost",
    status: "Detected",
    time: "4 min ago",
    type: "danger",
  },
  {
    node: "N05",
    event: "Recovery action initiated",
    model: "Self-Healing",
    status: "In Progress",
    time: "5 min ago",
    type: "ai",
  },
  {
    node: "N03",
    event: "Node successfully rejoined",
    model: "Recovery Engine",
    status: "Recovered",
    time: "8 min ago",
    type: "success",
  },
];




function StatCard({
  label,
  value,
  status,
  icon: Icon,
  type,
}) {
  return (
    <div className={`home-stat-card ${type}`}>
      <div className="home-stat-header">
        <span>{label}</span>

        <div className="home-stat-icon">
          <Icon size={19} strokeWidth={1.9} />
        </div>
      </div>

      <div className="home-stat-value">
        {value}
      </div>

      <div className="home-stat-status">
        <span className="home-status-dot" />
        {status}
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

          <div className="home-header-copy">
            <p className="home-eyebrow">
              NETWORK OPERATIONS CENTER
            </p>

            <h1>MANET Dashboard</h1>

            <p className="home-subtitle">
              Monitor network health, AI predictions, faults
              and self-healing activity.
            </p>
          </div>


          <div className="home-header-actions">

            <div className="home-simulation-status">
              <span className="live-dot" />

              <div>
                <span>Simulation</span>
                <strong>RUNNING</strong>
              </div>
            </div>


            <button
              className="home-logout"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

          </div>

        </header>

        <section className="home-metrics-layout">

          <div className="home-metric-group home-network-group">
            <div className="home-metric-group-heading">
              <div>
                <h2>Network Status</h2>
                <p>Current node and link state.</p>
              </div>
            </div>

            <div className="home-stats">
              {networkStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                />
              ))}
            </div>
          </div>

          <div className="home-metric-group home-performance-group">
            <div className="home-metric-group-heading">
              <div>
                <h2>Network Overview</h2>
                <p>Current performance of the virtual MANET.</p>
              </div>

              <span className="home-live-badge">
                <Radio size={13} />
                LIVE
              </span>
            </div>

            <div className="home-overview-grid">
              <div className="home-overview-item">
                <span>Total Nodes</span>
                <strong>15</strong>
                <small>13 active · 2 failed</small>
              </div>

              <div className="home-overview-item">
                <span>Connectivity</span>
                <strong>94%</strong>
                <small>Network connectivity</small>
              </div>

              <div className="home-overview-item">
                <span>Packet Delivery</span>
                <strong>96%</strong>
                <small>Successful delivery</small>
              </div>

              <div className="home-overview-item">
                <span>Average Battery</span>
                <strong>81%</strong>
                <small>Node battery level</small>
              </div>

              <div className="home-overview-item home-latency-item">
                <span>Average Latency</span>
                <strong>42 ms</strong>
                <small>Network response</small>
              </div>
            </div>
          </div>

        </section>


        <section className="home-lower-grid">

          {/* -------- LEFT COLUMN -------- */}
          <div className="home-lower-col">

            <div className="home-panel home-panel-flexible">

              <div className="home-panel-heading">

                <div>
                  <h2>AI Failure Prediction</h2>

                  <p>
                    Highest-risk node identified by the
                    trained Random Forest model.
                  </p>
                </div>

                <div className="home-panel-icon">
                  <BrainCircuit size={19} />
                </div>

              </div>


              <div className="prediction-split">

                <div className="risk-scale">
                  <span className="risk-scale-title">Risk Level</span>

                  <div className="risk-scale-track">
                    <div className="risk-scale-step high is-active">
                      <span>High</span>
                    
                    </div>
                  </div>
                </div>

                <div className="risk-info">

                  <div className="risk-info-row">
                    <span>Highest Risk Node</span>
                    <strong>N08</strong>
                  </div>

                  <div className="risk-info-row">
                    <span>Failure Probability</span>
                    <strong className="risk-high-text">87%</strong>
                  </div>

                </div>

              </div>


              <div className="prediction-details">

                <div>
                  <span>Predicted Fault</span>
                  <strong>LOW_BATTERY</strong>
                </div>

                <div>
                  <span>Model</span>
                  <strong>Random Forest</strong>
                </div>

              </div>

            </div>


            <div className="home-panel home-panel-flexible">

              <div className="home-panel-heading">

                <div>
                  <h2>Fault & Recovery</h2>

                  <p>
                    Current network incidents and
                    self-healing activity.
                  </p>
                </div>

                <button
                  className="panel-icon-button"
                  type="button"
                  onClick={() => navigate("/faults-recovery")}
                  aria-label="Open faults and recovery"
                >
                  <RefreshCw size={18} />
                </button>

              </div>


              <div className="recovery-grid">

                <div className="recovery-card danger">

                  <div className="recovery-card-top">
                    
                    <span>Active Faults</span>
                  </div>

                  <strong>2</strong>

                  

                </div>


                <div className="recovery-card ai">

                  <div className="recovery-card-top">
                 
                    <span>AI Recovery</span>
                  </div>

                  <strong>1</strong>

                  

                </div>


                <div className="recovery-card">

                  <div className="recovery-card-top">
                 
                    <span>Recovering</span>
                  </div>

                  <strong>2</strong>

                 

                </div>


                <div className="recovery-card success">

                  <div className="recovery-card-top">
                   
                    <span>Recovered</span>
                  </div>

                  <strong>8</strong>

                  

                </div>

              </div>

            </div>

          </div>


          {/* -------- RIGHT COLUMN -------- */}
          <div className="home-lower-col">

            <div className="home-panel home-panel-flexible">

              <div className="home-panel-heading">

                <div>
                  <h2>Fault Classification</h2>

                  <p>
                    Latest fault classified by the trained
                    XGBoost model.
                  </p>
                </div>

                <div className="home-panel-icon">
                  <Zap size={19} />
                </div>

              </div>


              <div className="classification-grid">

                <div className="classification-cell">
                  <span>Latest Affected Node</span>
                  <strong>N07</strong>
                </div>

                <div className="classification-cell">
                  <span>Fault Type</span>
                  <strong>LINK_FAILURE</strong>
                </div>

                <div className="classification-cell">
                  <span>Confidence</span>
                  <strong className="success-text">94%</strong>
                </div>

                <div className="classification-cell">
                  <span>Model</span>
                  <strong>XGBoost</strong>
                </div>

              </div>

            </div>


            <div className="home-panel home-panel-flexible home-events">

              <div className="home-panel-heading">

                <div>
                  <h2>Recent Events</h2>

                  <p>
                    Latest important network events.
                  </p>
                </div>

                <button
                  className="home-text-button"
                  type="button"
                  onClick={() => navigate("/alerts")}
                >
                  View all alerts
                </button>

              </div>


              <div className="event-list">

                {recentEvents.map((event, index) => (

                  <div
                    className="event-row"
                    key={`${event.node}-${index}`}
                  >

                    <div className={`event-icon ${event.type}`}>

                      {event.type === "success" ? (
                        <CheckCircle2 size={16} />
                      ) : event.type === "ai" ? (
                        <BrainCircuit size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}

                    </div>


                    <div className="event-main">

                      <div>
                        <strong>{event.node}</strong>

                        <span>
                          {event.event}
                        </span>
                      </div>

                      <small>
                        {event.model}
                      </small>

                    </div>


                    <div className={`event-status ${event.type}`}>
                      {event.status}
                    </div>


                    <time>
                      {event.time}
                    </time>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>


        <footer className="home-footer">

          <span>
            NeuroHeal · AI-Powered Predictive
            Self-Healing MANET
          </span>

          <span className="footer-status">
            <span className="home-status-dot" />
            System Operational
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Home;