import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Cpu,
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
       
        <section className="home-stats">

          {networkStats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
            />
          ))}

        </section>


        

        <section className="home-panel home-overview-panel">

          <div className="home-panel-heading">

            <div>
              <h2>Network Overview</h2>

              <p>
                Current state of the virtual MANET.
              </p>
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
              <span>Average Latency</span>
              <strong>42 ms</strong>
              <small>Network response</small>
            </div>

            <div className="home-overview-item">
              <span>Average Battery</span>
              <strong>81%</strong>
              <small>Node battery level</small>
            </div>

          </div>

        </section>


       

        <section className="home-content-grid">


          

          <div className="home-panel">

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


            <div className="prediction-main">

              <div className="prediction-node">

                <div className="prediction-node-icon">
                  <Cpu size={22} />
                </div>

                <div>
                  <span>Highest Risk Node</span>
                  <strong>N05</strong>
                </div>

              </div>


              <div className="prediction-risk">

                <span>Failure Probability</span>

                <strong>87%</strong>

              </div>

            </div>


            <div className="prediction-progress">

              <div className="prediction-progress-header">
                <span>Risk Level</span>
                <strong>HIGH</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-value high"
                  style={{ width: "87%" }}
                />
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


          {/* ==================================================
              XGBOOST
          ================================================== */}

          <div className="home-panel">

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


            <div className="classification-node">

              <span>Latest Affected Node</span>

              <strong>N07</strong>

            </div>


            <div className="classification-list">

              <div className="classification-row">
                <span>Fault Type</span>
                <strong>LINK_FAILURE</strong>
              </div>

              <div className="classification-row">
                <span>Model</span>
                <strong>XGBoost</strong>
              </div>

              <div className="classification-row">
                <span>Confidence</span>
                <strong className="success-text">
                  94%
                </strong>
              </div>

              <div className="classification-row">
                <span>Status</span>
                <strong className="warning-text">
                  RECOVERING
                </strong>
              </div>

            </div>

          </div>

        </section>


       

        <section className="home-panel">

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
                <AlertTriangle size={16} />
                <span>Active Faults</span>
              </div>

              <strong>2</strong>

              <small>Nodes affected</small>

            </div>


            <div className="recovery-card ai">

              <div className="recovery-card-top">
                <BrainCircuit size={16} />
                <span>AI Recovery</span>
              </div>

              <strong>1</strong>

              <small>In progress</small>

            </div>


            <div className="recovery-card">

              <div className="recovery-card-top">
                <RefreshCw size={16} />
                <span>Recovering</span>
              </div>

              <strong>2</strong>

              <small>Active recovery actions</small>

            </div>


            <div className="recovery-card success">

              <div className="recovery-card-top">
                <CheckCircle2 size={16} />
                <span>Recovered</span>
              </div>

              <strong>8</strong>

              <small>Successful recoveries</small>

            </div>

          </div>

        </section>


       

        <section className="home-panel">

          <div className="home-panel-heading">

            <div>
              <h2>AI Models</h2>

              <p>
                Trained models currently available in
                the NeuroHeal system.
              </p>
            </div>

            <div className="models-count">
              2 TRAINED
            </div>

          </div>


          <div className="model-grid">

            {/* Random Forest */}

            <div className="model-card">

              <div className="model-card-header">

                <div className="model-icon">
                  <BrainCircuit size={18} />
                </div>

                <span className="model-ready">
                  TRAINED
                </span>

              </div>

              <h3>Random Forest</h3>

              <p>
                Node failure prediction and risk
                assessment.
              </p>

            </div>


            {/* XGBoost */}

            <div className="model-card">

              <div className="model-card-header">

                <div className="model-icon">
                  <Zap size={18} />
                </div>

                <span className="model-ready">
                  TRAINED
                </span>

              </div>

              <h3>XGBoost</h3>

              <p>
                Fault classification and failure
                identification.
              </p>

            </div>

          </div>

        </section>


      

        <section className="home-panel home-events">

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