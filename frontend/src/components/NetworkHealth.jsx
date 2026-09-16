import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Gauge,
  HeartPulse,
  Network,
  Radio,
  RefreshCw,
  Router,
  Signal,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./NetworkHealth.css";

const nodes = [
  {
    id: "N01",
    type: "ROUTER",
    status: "Healthy",
    health: 96,
    battery: 92,
    signal: 91,
    cpu: 24,
    latency: 31,
    links: 5,
  },
  {
    id: "N02",
    type: "ROUTER",
    status: "Healthy",
    health: 91,
    battery: 86,
    signal: 88,
    cpu: 31,
    latency: 36,
    links: 6,
  },
  {
    id: "N03",
    type: "END DEVICE",
    status: "Healthy",
    health: 87,
    battery: 78,
    signal: 84,
    cpu: 42,
    latency: 41,
    links: 4,
  },
  {
    id: "N04",
    type: "ROUTER",
    status: "Healthy",
    health: 94,
    battery: 91,
    signal: 93,
    cpu: 28,
    latency: 29,
    links: 5,
  },
  {
    id: "N05",
    type: "END DEVICE",
    status: "Warning",
    health: 61,
    battery: 58,
    signal: 67,
    cpu: 67,
    latency: 68,
    links: 3,
  },
  {
    id: "N06",
    type: "ROUTER",
    status: "Healthy",
    health: 89,
    battery: 83,
    signal: 86,
    cpu: 35,
    latency: 39,
    links: 5,
  },
  {
    id: "N07",
    type: "END DEVICE",
    status: "Critical",
    health: 38,
    battery: 41,
    signal: 46,
    cpu: 82,
    latency: 97,
    links: 1,
  },
  {
    id: "N08",
    type: "ROUTER",
    status: "Healthy",
    health: 86,
    battery: 76,
    signal: 81,
    cpu: 44,
    latency: 45,
    links: 4,
  },
  {
    id: "N09",
    type: "END DEVICE",
    status: "Healthy",
    health: 93,
    battery: 94,
    signal: 95,
    cpu: 18,
    latency: 27,
    links: 4,
  },
  {
    id: "N10",
    type: "ROUTER",
    status: "Healthy",
    health: 88,
    battery: 81,
    signal: 87,
    cpu: 36,
    latency: 43,
    links: 5,
  },
  {
    id: "N11",
    type: "END DEVICE",
    status: "Warning",
    health: 68,
    battery: 73,
    signal: 71,
    cpu: 48,
    latency: 61,
    links: 2,
  },
  {
    id: "N12",
    type: "ROUTER",
    status: "Healthy",
    health: 92,
    battery: 89,
    signal: 90,
    cpu: 26,
    latency: 34,
    links: 5,
  },
  {
    id: "N13",
    type: "END DEVICE",
    status: "Healthy",
    health: 95,
    battery: 96,
    signal: 94,
    cpu: 19,
    latency: 26,
    links: 4,
  },
  {
    id: "N14",
    type: "ROUTER",
    status: "Healthy",
    health: 90,
    battery: 84,
    signal: 89,
    cpu: 33,
    latency: 37,
    links: 6,
  },
  {
    id: "N15",
    type: "END DEVICE",
    status: "Healthy",
    health: 85,
    battery: 79,
    signal: 82,
    cpu: 39,
    latency: 44,
    links: 4,
  },
];

const links = [
  { id: "L01", source: "N01", target: "N02", quality: 94, latency: 28, status: "Healthy" },
  { id: "L02", source: "N01", target: "N04", quality: 91, latency: 31, status: "Healthy" },
  { id: "L03", source: "N02", target: "N03", quality: 88, latency: 36, status: "Healthy" },
  { id: "L04", source: "N02", target: "N05", quality: 63, latency: 61, status: "Warning" },
  { id: "L05", source: "N03", target: "N07", quality: 42, latency: 89, status: "Critical" },
  { id: "L06", source: "N04", target: "N05", quality: 76, latency: 48, status: "Healthy" },
  { id: "L07", source: "N04", target: "N13", quality: 93, latency: 27, status: "Healthy" },
  { id: "L08", source: "N05", target: "N06", quality: 71, latency: 53, status: "Healthy" },
  { id: "L09", source: "N06", target: "N08", quality: 89, latency: 39, status: "Healthy" },
  { id: "L10", source: "N06", target: "N10", quality: 92, latency: 34, status: "Healthy" },
  { id: "L11", source: "N08", target: "N09", quality: 95, latency: 25, status: "Healthy" },
  { id: "L12", source: "N08", target: "N15", quality: 86, latency: 42, status: "Healthy" },
  { id: "L13", source: "N10", target: "N11", quality: 67, latency: 59, status: "Warning" },
  { id: "L14", source: "N10", target: "N14", quality: 91, latency: 32, status: "Healthy" },
  { id: "L15", source: "N12", target: "N02", quality: 96, latency: 24, status: "Healthy" },
  { id: "L16", source: "N12", target: "N13", quality: 90, latency: 30, status: "Healthy" },
  { id: "L17", source: "N14", target: "N15", quality: 87, latency: 40, status: "Healthy" },
  { id: "L18", source: "N03", target: "N14", quality: 83, latency: 44, status: "Healthy" },
];

const packetHistory = [91, 93, 92, 95, 94, 96, 95, 97, 96, 96, 97, 96];

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getHealthLabel(value) {
  if (value >= 80) return "Healthy";
  if (value >= 60) return "Warning";
  return "Critical";
}

function MetricCard({ icon: Icon, label, value, unit, status, trend, trendType }) {
  return (
    <div className="health-metric-card">
      <div className="health-metric-top">
        <div className="health-metric-icon">
          <Icon size={17} />
        </div>
        <span className={`metric-status ${getStatusClass(status)}`}>
          {status}
        </span>
      </div>

      <span className="health-metric-label">{label}</span>

      <div className="health-metric-value">
        <strong>{value}</strong>
        {unit && <span>{unit}</span>}
      </div>

      <div className={`health-metric-trend ${trendType}`}>
        {trendType === "positive" ? (
          <TrendingUp size={12} />
        ) : (
          <TrendingDown size={12} />
        )}
        <span>{trend}</span>
      </div>
    </div>
  );
}

function HealthProgress({ value }) {
  const status = getHealthLabel(value);

  return (
    <div className="health-progress">
      <div className="health-progress-header">
        <span>{status}</span>
        <strong>{value}%</strong>
      </div>

      <div className="health-progress-track">
        <div
          className={`health-progress-value ${getStatusClass(status)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function NetworkHealth() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const stats = useMemo(() => {
    const healthy = nodes.filter(
      (node) => node.status === "Healthy"
    ).length;

    const warning = nodes.filter(
      (node) => node.status === "Warning"
    ).length;

    const critical = nodes.filter(
      (node) => node.status === "Critical"
    ).length;

    const averageHealth = Math.round(
      nodes.reduce(
        (sum, node) => sum + node.health,
        0
      ) / nodes.length
    );

    const averageBattery = Math.round(
      nodes.reduce(
        (sum, node) => sum + node.battery,
        0
      ) / nodes.length
    );

    const averageSignal = Math.round(
      nodes.reduce(
        (sum, node) => sum + node.signal,
        0
      ) / nodes.length
    );

    const averageLatency = Math.round(
      nodes.reduce(
        (sum, node) => sum + node.latency,
        0
      ) / nodes.length
    );

    const averageLinkQuality = Math.round(
      links.reduce(
        (sum, link) => sum + link.quality,
        0
      ) / links.length
    );

    return {
      healthy,
      warning,
      critical,
      averageHealth,
      averageBattery,
      averageSignal,
      averageLatency,
      averageLinkQuality,
    };
  }, []);

  const connectivity = Math.round(
    (links.filter(
      (link) => link.status !== "Critical"
    ).length /
      links.length) *
      100
  );

  const packetDelivery = 96;

  const overallStatus =
    stats.averageHealth >= 80
      ? "Healthy"
      : stats.averageHealth >= 60
      ? "Warning"
      : "Critical";

  return (
    <div className="network-health-layout">
      <Sidebar activePage="network-health" />

      <main className="network-health-page">
        <header className="network-health-header">
          <div>
            <span className="network-health-eyebrow">
              NETWORK MONITORING
            </span>

            <h1>Network Health</h1>

            <p>
              Monitor node condition, link quality,
              battery levels and network performance.
            </p>
          </div>

          <div className="network-health-header-actions">
            <div className="network-health-live">
              <span className="network-health-live-dot" />

              <div>
                <span>Network</span>
                <strong>OPERATIONAL</strong>
              </div>
            </div>

            <button
              type="button"
              className="health-refresh-button"
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <section className="overall-health-panel">
          <div className="overall-health-main">
            <div className="overall-health-ring">
              <div>
                <strong>{stats.averageHealth}%</strong>
                <span>Overall</span>
              </div>
            </div>

            <div className="overall-health-copy">
              <span className="section-eyebrow">
                OVERALL NETWORK HEALTH
              </span>

              <h2>{overallStatus}</h2>

              <p>
                The virtual MANET is currently
                operating with {stats.healthy} healthy
                nodes and {links.length} monitored
                network links.
              </p>

              <div className="overall-health-meta">
                <span>
                  <CheckCircle2 size={13} />
                  {stats.healthy} Healthy
                </span>

                <span>
                  <AlertTriangle size={13} />
                  {stats.warning} Warning
                </span>

                <span>
                  <AlertTriangle size={13} />
                  {stats.critical} Critical
                </span>
              </div>
            </div>
          </div>

          <div className="overall-health-side">
            <div>
              <span>Connectivity</span>
              <strong>{connectivity}%</strong>
            </div>

            <div>
              <span>Packet Delivery</span>
              <strong>{packetDelivery}%</strong>
            </div>

            <div>
              <span>Average Latency</span>
              <strong>{stats.averageLatency} ms</strong>
            </div>
          </div>
        </section>

        <div className="health-section-tabs">
          <button
            type="button"
            className={
              activeSection === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("overview")
            }
          >
            Overview
          </button>

          <button
            type="button"
            className={
              activeSection === "nodes"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("nodes")
            }
          >
            Node Health
          </button>

          <button
            type="button"
            className={
              activeSection === "links"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("links")
            }
          >
            Link Health
          </button>
        </div>

        {activeSection === "overview" && (
          <>
            <section className="health-metrics-grid">
              <MetricCard
                icon={Network}
                label="Node Health"
                value={`${stats.averageHealth}`}
                unit="%"
                status={overallStatus}
                trend="+2.4%"
                trendType="positive"
              />

              <MetricCard
                icon={Wifi}
                label="Link Health"
                value={`${stats.averageLinkQuality}`}
                unit="%"
                status="Healthy"
                trend="+1.8%"
                trendType="positive"
              />

              <MetricCard
                icon={Battery}
                label="Battery Status"
                value={`${stats.averageBattery}`}
                unit="%"
                status={
                  stats.averageBattery >= 70
                    ? "Healthy"
                    : "Warning"
                }
                trend="+0.7%"
                trendType="positive"
              />

              <MetricCard
                icon={Activity}
                label="Packet Delivery"
                value={`${packetDelivery}`}
                unit="%"
                status="Healthy"
                trend="+1.2%"
                trendType="positive"
              />

              <MetricCard
                icon={Clock3}
                label="Latency"
                value={`${stats.averageLatency}`}
                unit="ms"
                status={
                  stats.averageLatency < 50
                    ? "Healthy"
                    : "Warning"
                }
                trend="-3.1%"
                trendType="positive"
              />

              <MetricCard
                icon={Radio}
                label="Connectivity"
                value={`${connectivity}`}
                unit="%"
                status="Healthy"
                trend="+0.9%"
                trendType="positive"
              />
            </section>

            <section className="health-content-grid">
              <div className="health-panel">
                <div className="health-panel-heading">
                  <div>
                    <span className="section-eyebrow">
                      PERFORMANCE
                    </span>

                    <h2>Network Performance</h2>

                    <p>
                      Recent packet delivery and
                      connectivity performance.
                    </p>
                  </div>

                  <Gauge size={18} />
                </div>

                <div className="performance-chart">
                  <div className="performance-chart-header">
                    <div>
                      <span>Packet Delivery</span>
                      <strong>
                        {packetDelivery}%
                      </strong>
                    </div>

                    <span className="performance-change">
                      <TrendingUp size={12} />
                      Stable
                    </span>
                  </div>

                  <div className="chart-area">
                    <div className="chart-grid-line line-one" />
                    <div className="chart-grid-line line-two" />
                    <div className="chart-grid-line line-three" />

                    <svg
                      className="performance-line"
                      viewBox="0 0 600 180"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={packetHistory
                          .map((value, index) => {
                            const x =
                              (index /
                                (packetHistory.length -
                                  1)) *
                              580 +
                              10;

                            const y =
                              170 -
                              ((value - 88) /
                                10) *
                                145;

                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    <div className="chart-labels">
                      <span>12:00</span>
                      <span>14:00</span>
                      <span>16:00</span>
                      <span>18:00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="health-panel">
                <div className="health-panel-heading">
                  <div>
                    <span className="section-eyebrow">
                      NETWORK CAPACITY
                    </span>

                    <h2>Connectivity Status</h2>

                    <p>
                      Current availability across
                      the virtual network.
                    </p>
                  </div>

                  <Signal size={18} />
                </div>

                <div className="connectivity-summary">
                  <div className="connectivity-number">
                    <strong>{connectivity}%</strong>
                    <span>Connected</span>
                  </div>

                  <div className="connectivity-bar">
                    <div
                      style={{
                        width: `${connectivity}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="connectivity-list">
                  <div>
                    <span>Active Links</span>
                    <strong>
                      {links.filter(
                        (link) =>
                          link.status ===
                          "Healthy"
                      ).length}
                    </strong>
                  </div>

                  <div>
                    <span>Links Requiring Attention</span>
                    <strong>
                      {links.filter(
                        (link) =>
                          link.status ===
                          "Warning"
                      ).length}
                    </strong>
                  </div>

                  <div>
                    <span>Critical Links</span>
                    <strong className="danger-value">
                      {links.filter(
                        (link) =>
                          link.status ===
                          "Critical"
                      ).length}
                    </strong>
                  </div>

                  <div>
                    <span>Average Link Quality</span>
                    <strong>
                      {stats.averageLinkQuality}%
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeSection === "nodes" && (
          <section className="health-panel node-health-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  NODE MONITORING
                </span>

                <h2>Node Health</h2>

                <p>
                  Current health condition of every
                  simulated network node.
                </p>
              </div>

              <Router size={18} />
            </div>

            <div className="node-health-table-wrapper">
              <table className="node-health-table">
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Type</th>
                    <th>Health</th>
                    <th>Battery</th>
                    <th>Signal</th>
                    <th>CPU</th>
                    <th>Latency</th>
                    <th>Links</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {nodes.map((node) => (
                    <tr
                      key={node.id}
                      className={
                        selectedNode === node.id
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setSelectedNode(node.id)
                      }
                    >
                      <td>
                        <div className="node-name">
                          <span className="node-status-dot" />
                          <strong>{node.id}</strong>
                        </div>
                      </td>

                      <td>{node.type}</td>

                      <td>
                        <HealthProgress
                          value={node.health}
                        />
                      </td>

                      <td>
                        <span className="table-value">
                          <Battery size={12} />
                          {node.battery}%
                        </span>
                      </td>

                      <td>
                        <span className="table-value">
                          <Signal size={12} />
                          {node.signal}%
                        </span>
                      </td>

                      <td>{node.cpu}%</td>

                      <td>{node.latency} ms</td>

                      <td>{node.links}</td>

                      <td>
                        <span
                          className={`table-status ${getStatusClass(
                            node.status
                          )}`}
                        >
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "links" && (
          <section className="health-panel link-health-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  LINK MONITORING
                </span>

                <h2>Link Health</h2>

                <p>
                  Quality, latency and state of active
                  MANET connections.
                </p>
              </div>

              <Wifi size={18} />
            </div>

            <div className="link-grid">
              {links.map((link) => (
                <div
                  className={`link-card ${getStatusClass(
                    link.status
                  )}`}
                  key={link.id}
                >
                  <div className="link-card-header">
                    <div className="link-id">
                      <Wifi size={14} />
                      <strong>{link.id}</strong>
                    </div>

                    <span
                      className={`table-status ${getStatusClass(
                        link.status
                      )}`}
                    >
                      {link.status}
                    </span>
                  </div>

                  <div className="link-route">
                    <span>{link.source}</span>

                    <ChevronRight size={13} />

                    <span>{link.target}</span>
                  </div>

                  <div className="link-card-metrics">
                    <div>
                      <span>Quality</span>
                      <strong>
                        {link.quality}%
                      </strong>
                    </div>

                    <div>
                      <span>Latency</span>
                      <strong>
                        {link.latency} ms
                      </strong>
                    </div>
                  </div>

                  <div className="link-quality-track">
                    <div
                      className={getStatusClass(
                        link.status
                      )}
                      style={{
                        width: `${link.quality}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="health-bottom-grid">
          <div className="health-panel battery-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  POWER MONITORING
                </span>

                <h2>Battery Status</h2>
              </div>

              <Battery size={18} />
            </div>

            <div className="battery-summary">
              <strong>{stats.averageBattery}%</strong>
              <span>Average battery level</span>
            </div>

            <div className="battery-distribution">
              <div>
                <span>Healthy</span>
                <strong>
                  {
                    nodes.filter(
                      (node) => node.battery >= 70
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span>Low</span>
                <strong>
                  {
                    nodes.filter(
                      (node) =>
                        node.battery < 70 &&
                        node.battery >= 40
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span>Critical</span>
                <strong>
                  {
                    nodes.filter(
                      (node) => node.battery < 40
                    ).length
                  }
                </strong>
              </div>
            </div>
          </div>

          <div className="health-panel latency-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  RESPONSE TIME
                </span>

                <h2>Latency</h2>
              </div>

              <Clock3 size={18} />
            </div>

            <div className="latency-main">
              <strong>{stats.averageLatency}</strong>
              <span>ms average</span>
            </div>

            <div className="latency-scale">
              <span>0 ms</span>

              <div className="latency-track">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      stats.averageLatency
                    )}%`,
                  }}
                />
              </div>

              <span>100 ms</span>
            </div>

            <div className="latency-status">
              <CheckCircle2 size={13} />
              Within normal operating range
            </div>
          </div>

          <div className="health-panel signal-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  RADIO CONDITION
                </span>

                <h2>Signal Strength</h2>
              </div>

              <Signal size={18} />
            </div>

            <div className="signal-main">
              <strong>{stats.averageSignal}%</strong>
              <span>Average signal</span>
            </div>

            <div className="signal-bars">
              <span className="filled" />
              <span className="filled" />
              <span className="filled" />
              <span className="filled" />
              <span />
            </div>

            <div className="signal-footer">
              <Zap size={12} />
              Stable radio conditions
            </div>
          </div>

          <div className="health-panel alerts-panel">
            <div className="health-panel-heading">
              <div>
                <span className="section-eyebrow">
                  HEALTH EVENTS
                </span>

                <h2>Attention Required</h2>
              </div>

              <AlertTriangle size={18} />
            </div>

            <div className="health-alert-list">
              <div>
                <span className="alert-node-dot warning" />
                <div>
                  <strong>N05</strong>
                  <span>
                    Battery level requires monitoring
                  </span>
                </div>
                <span className="alert-time">
                  2m
                </span>
              </div>

              <div>
                <span className="alert-node-dot critical" />
                <div>
                  <strong>N07</strong>
                  <span>
                    High latency and weak signal
                  </span>
                </div>
                <span className="alert-time">
                  4m
                </span>
              </div>

              <div>
                <span className="alert-node-dot warning" />
                <div>
                  <strong>N11</strong>
                  <span>
                    Link quality degradation
                  </span>
                </div>
                <span className="alert-time">
                  7m
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NetworkHealth;