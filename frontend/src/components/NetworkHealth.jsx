import React from "react";
import {
  Activity,
  Battery,
  CheckCircle2,
  Cpu,
  Gauge,
  Link2,
  Network,
  Radio,
  Server,
  Signal,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";

import Sidebar from "./Sidebar";
import "./NetworkHealth.css";

/*
|--------------------------------------------------------------------------
| DEMO DATA
|--------------------------------------------------------------------------
| Replace these values with your Spring Boot API responses later.
*/

const nodeHealthData = [
  {
    node: "N01",
    health: 98,
    battery: 94,
    links: 4,
    packetDelivery: 99,
    latency: 28,
    status: "HEALTHY",
  },
  {
    node: "N02",
    health: 91,
    battery: 78,
    links: 4,
    packetDelivery: 96,
    latency: 35,
    status: "HEALTHY",
  },
  {
    node: "N03",
    health: 96,
    battery: 87,
    links: 5,
    packetDelivery: 98,
    latency: 31,
    status: "HEALTHY",
  },
  {
    node: "N04",
    health: 88,
    battery: 69,
    links: 3,
    packetDelivery: 94,
    latency: 47,
    status: "WARNING",
  },
  {
    node: "N05",
    health: 42,
    battery: 23,
    links: 2,
    packetDelivery: 81,
    latency: 92,
    status: "CRITICAL",
  },
  {
    node: "N06",
    health: 95,
    battery: 91,
    links: 4,
    packetDelivery: 97,
    latency: 34,
    status: "HEALTHY",
  },
  {
    node: "N07",
    health: 57,
    battery: 61,
    links: 1,
    packetDelivery: 76,
    latency: 108,
    status: "WARNING",
  },
  {
    node: "N08",
    health: 93,
    battery: 84,
    links: 4,
    packetDelivery: 97,
    latency: 39,
    status: "HEALTHY",
  },
];

const linkHealthData = [
  {
    link: "L01",
    source: "N01",
    target: "N02",
    quality: 98,
    latency: 28,
    packetLoss: 1,
    status: "ACTIVE",
  },
  {
    link: "L02",
    source: "N02",
    target: "N03",
    quality: 94,
    latency: 34,
    packetLoss: 2,
    status: "ACTIVE",
  },
  {
    link: "L03",
    source: "N03",
    target: "N04",
    quality: 89,
    latency: 41,
    packetLoss: 3,
    status: "ACTIVE",
  },
  {
    link: "L04",
    source: "N04",
    target: "N05",
    quality: 52,
    latency: 87,
    packetLoss: 12,
    status: "DEGRADED",
  },
  {
    link: "L05",
    source: "N05",
    target: "N07",
    quality: 31,
    latency: 108,
    packetLoss: 18,
    status: "DEGRADED",
  },
];

function HealthBadge({ status }) {
  const type = status.toLowerCase();

  return (
    <span className={`nh-health-badge ${type}`}>
      {status === "HEALTHY" && <CheckCircle2 size={11} />}
      {status === "WARNING" && <Activity size={11} />}
      {status === "CRITICAL" && <TrendingDown size={11} />}
      {status}
    </span>
  );
}

function ProgressBar({ value, type = "normal" }) {
  return (
    <div className="nh-progress-track">
      <div
        className={`nh-progress-value ${type}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  iconType,
  trend,
  trendType,
}) {
  return (
    <div className="nh-metric-card">
      <div className="nh-metric-top">
        <div className={`nh-metric-icon ${iconType}`}>
          <Icon size={19} />
        </div>

        {trend && (
          <span className={`nh-trend ${trendType}`}>
            {trendType === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {trend}
          </span>
        )}
      </div>

      <span className="nh-metric-title">{title}</span>

      <div className="nh-metric-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      <span className="nh-metric-description">
        {description}
      </span>
    </div>
  );
}

function NetworkHealth() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="network-health-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="nh-header">
          <div>
            <p className="nh-eyebrow">NETWORK MONITORING</p>

            <h1>Network Health</h1>

            <p className="nh-subtitle">
              Monitor node health, link quality, battery levels,
              connectivity and network performance.
            </p>
          </div>

          <div className="nh-system-status">
            <span className="nh-live-dot" />

            <div>
              <span>NETWORK STATUS</span>
              <strong>OPERATIONAL</strong>
            </div>
          </div>
        </header>

        {/* =====================================================
            OVERALL NETWORK HEALTH
        ===================================================== */}

        <section className="nh-overall-card">
          <div className="nh-overall-left">
            <div className="nh-overall-icon">
              <Gauge size={26} />
            </div>

            <div>
              <span className="nh-overall-label">
                OVERALL NETWORK HEALTH
              </span>

              <div className="nh-overall-value">
                92<span>%</span>
              </div>

              <p>
                Network is operating within healthy parameters.
              </p>
            </div>
          </div>

          <div className="nh-overall-center">
            <div className="nh-overall-progress-header">
              <span>Health Score</span>
              <strong>92 / 100</strong>
            </div>

            <div className="nh-overall-progress">
              <div
                className="nh-overall-progress-value"
                style={{ width: "92%" }}
              />
            </div>

            <div className="nh-overall-scale">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          <div className="nh-overall-status">
            <CheckCircle2 size={18} />

            <strong>HEALTHY</strong>

            <span>Last updated 30 sec ago</span>
          </div>
        </section>

        {/* =====================================================
            PERFORMANCE METRICS
        ===================================================== */}

        <section className="nh-metrics-grid">
          <MetricCard
            title="Packet Delivery"
            value="96"
            unit="%"
            description="Successfully delivered packets"
            icon={Activity}
            iconType="blue"
            trend="+2.4%"
            trendType="up"
          />

          <MetricCard
            title="Average Latency"
            value="42"
            unit="ms"
            description="Average network response time"
            icon={Radio}
            iconType="purple"
            trend="-5.2%"
            trendType="up"
          />

          <MetricCard
            title="Connectivity"
            value="94"
            unit="%"
            description="Available network connections"
            icon={Wifi}
            iconType="green"
            trend="+1.8%"
            trendType="up"
          />

          <MetricCard
            title="Average Battery"
            value="81"
            unit="%"
            description="Average node battery level"
            icon={Battery}
            iconType="orange"
            trend="-3.1%"
            trendType="down"
          />
        </section>

        {/* =====================================================
            NODE HEALTH + BATTERY
        ===================================================== */}

        <section className="nh-two-column">
          {/* NODE HEALTH */}

          <div className="nh-section">
            <div className="nh-section-heading">
              <div>
                <h2>Node Health</h2>
                <p>Current health status of MANET nodes.</p>
              </div>

              <div className="nh-heading-icon blue">
                <Cpu size={18} />
              </div>
            </div>

            <div className="nh-node-health-summary">
              <div>
                <span>Healthy</span>
                <strong>6</strong>
              </div>

              <div>
                <span>Warning</span>
                <strong>1</strong>
              </div>

              <div>
                <span>Critical</span>
                <strong>1</strong>
              </div>
            </div>

            <div className="nh-node-bars">
              {nodeHealthData.slice(0, 6).map((node) => (
                <div className="nh-node-bar-row" key={node.node}>
                  <div className="nh-node-bar-label">
                    <span>{node.node}</span>
                    <strong>{node.health}%</strong>
                  </div>

                  <ProgressBar
                    value={node.health}
                    type={
                      node.health < 60
                        ? "critical"
                        : node.health < 80
                          ? "warning"
                          : "normal"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BATTERY STATUS */}

          <div className="nh-section">
            <div className="nh-section-heading">
              <div>
                <h2>Battery Status</h2>
                <p>Energy levels across active network nodes.</p>
              </div>

              <div className="nh-heading-icon orange">
                <Battery size={18} />
              </div>
            </div>

            <div className="battery-main">
              <div className="battery-circle">
                <div>
                  <strong>81%</strong>
                  <span>Average</span>
                </div>
              </div>

              <div className="battery-stats">
                <div>
                  <span>High</span>
                  <strong>10</strong>
                  <small>&gt; 70%</small>
                </div>

                <div>
                  <span>Medium</span>
                  <strong>3</strong>
                  <small>30–70%</small>
                </div>

                <div>
                  <span>Low</span>
                  <strong>2</strong>
                  <small>&lt; 30%</small>
                </div>
              </div>
            </div>

            <div className="battery-warning">
              <Battery size={15} />

              <div>
                <strong>N05 requires attention</strong>
                <span>
                  Current battery level: 23%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            LINK HEALTH
        ===================================================== */}

        <section className="nh-section">
          <div className="nh-section-heading">
            <div>
              <h2>Link Health</h2>

              <p>
                Communication quality and reliability between nodes.
              </p>
            </div>

            <div className="nh-heading-icon purple">
              <Link2 size={18} />
            </div>
          </div>

          <div className="nh-link-summary">
            <div className="nh-link-summary-item">
              <span>Active Links</span>
              <strong>24</strong>
              <small>Currently connected</small>
            </div>

            <div className="nh-link-summary-item">
              <span>Healthy Links</span>
              <strong>20</strong>
              <small>Good quality</small>
            </div>

            <div className="nh-link-summary-item">
              <span>Degraded</span>
              <strong>2</strong>
              <small>Requires monitoring</small>
            </div>

            <div className="nh-link-summary-item">
              <span>Failed</span>
              <strong>2</strong>
              <small>Unavailable</small>
            </div>
          </div>

          <div className="nh-link-table-wrapper">
            <table className="nh-link-table">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Connection</th>
                  <th>Quality</th>
                  <th>Latency</th>
                  <th>Packet Loss</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {linkHealthData.map((link) => (
                  <tr key={link.link}>
                    <td>
                      <strong className="nh-link-id">
                        {link.link}
                      </strong>
                    </td>

                    <td>
                      <div className="nh-connection">
                        <span>{link.source}</span>
                        <Link2 size={12} />
                        <span>{link.target}</span>
                      </div>
                    </td>

                    <td>
                      <div className="nh-quality">
                        <strong>{link.quality}%</strong>

                        <div className="nh-quality-track">
                          <div
                            className={`nh-quality-value ${
                              link.quality < 60
                                ? "critical"
                                : link.quality < 80
                                  ? "warning"
                                  : ""
                            }`}
                            style={{
                              width: `${link.quality}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="nh-table-value">
                        {link.latency} ms
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          link.packetLoss > 10
                            ? "nh-loss high"
                            : "nh-loss"
                        }
                      >
                        {link.packetLoss}%
                      </span>
                    </td>

                    <td>
                      <span
                        className={`nh-link-status ${
                          link.status.toLowerCase()
                        }`}
                      >
                        {link.status === "ACTIVE" ? (
                          <Wifi size={11} />
                        ) : (
                          <WifiOff size={11} />
                        )}

                        {link.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            NODE HEALTH TABLE
        ===================================================== */}

        <section className="nh-section">
          <div className="nh-section-heading">
            <div>
              <h2>Node Health Details</h2>

              <p>
                Detailed health and performance metrics for each node.
              </p>
            </div>

            <div className="nh-heading-icon blue">
              <Server size={18} />
            </div>
          </div>

          <div className="nh-node-table-wrapper">
            <table className="nh-node-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Health</th>
                  <th>Battery</th>
                  <th>Active Links</th>
                  <th>Packet Delivery</th>
                  <th>Latency</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {nodeHealthData.map((node) => (
                  <tr key={node.node}>
                    <td>
                      <div className="nh-node-cell">
                        <div className="nh-node-avatar">
                          <Cpu size={14} />
                        </div>

                        <strong>{node.node}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="nh-health-cell">
                        <strong>{node.health}%</strong>

                        <div className="nh-small-progress">
                          <div
                            className={
                              node.health < 60
                                ? "critical"
                                : node.health < 80
                                  ? "warning"
                                  : ""
                            }
                            style={{
                              width: `${node.health}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="nh-battery-cell">
                        <Battery size={13} />

                        <strong>{node.battery}%</strong>
                      </div>
                    </td>

                    <td>
                      <span className="nh-links-count">
                        <Link2 size={12} />
                        {node.links}
                      </span>
                    </td>

                    <td>
                      <strong className="nh-packet-value">
                        {node.packetDelivery}%
                      </strong>
                    </td>

                    <td>
                      <span className="nh-latency">
                        {node.latency} ms
                      </span>
                    </td>

                    <td>
                      <HealthBadge status={node.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="nh-footer">
          <span>
            NeuroHeal · AI-Powered Predictive Self-Healing MANET
          </span>

          <span>
            <span className="nh-footer-dot" />
            Network Monitoring Operational
          </span>
        </footer>
      </main>
    </div>
  );
}

export default NetworkHealth;