
import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Cpu,
  Gauge,
  HeartPulse,
  Info,
  Link2,
  MapPin,
  MonitorCog,
  Moon,
  Network,
  Pause,
  Play,
  RefreshCw,
  Router,
  ShieldCheck,
  Signal,
  Sun,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import "./Simulation.css";

/*
 * ============================================================
 * MANET SIMULATION CONFIGURATION
 * ============================================================
 */

const MIN_NODE_DISTANCE = 8;
const CONNECTION_RANGE = 32;

const initialNodes = [
  {
    id: "N01",
    nodeIdentifier: "N01",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 8,
    y: 35,
    batteryLevel: 92,
    cpuUsage: 24,
    ipAddress: "192.168.1.101",
    delay: "0s",
  },
  {
    id: "N02",
    nodeIdentifier: "N02",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 30,
    y: 14,
    batteryLevel: 86,
    cpuUsage: 31,
    ipAddress: "192.168.1.102",
    delay: "0.5s",
  },
  {
    id: "N03",
    nodeIdentifier: "N03",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 58,
    y: 28,
    batteryLevel: 78,
    cpuUsage: 42,
    ipAddress: "192.168.1.103",
    delay: "1s",
  },
  {
    id: "N04",
    nodeIdentifier: "N04",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 15,
    y: 72,
    batteryLevel: 91,
    cpuUsage: 28,
    ipAddress: "192.168.1.104",
    delay: "1.5s",
  },
  {
    id: "N05",
    nodeIdentifier: "N05",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 40,
    y: 60,
    batteryLevel: 58,
    cpuUsage: 67,
    ipAddress: "192.168.1.105",
    delay: "2s",
  },
  {
    id: "N06",
    nodeIdentifier: "N06",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 67,
    y: 73,
    batteryLevel: 83,
    cpuUsage: 35,
    ipAddress: "192.168.1.106",
    delay: "2.5s",
  },
  {
    id: "N07",
    nodeIdentifier: "N07",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 80,
    y: 18,
    batteryLevel: 88,
    cpuUsage: 22,
    ipAddress: "192.168.1.107",
    delay: "1.2s",
  },
  {
    id: "N08",
    nodeIdentifier: "N08",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 88,
    y: 48,
    batteryLevel: 76,
    cpuUsage: 44,
    ipAddress: "192.168.1.108",
    delay: "2.2s",
  },
  {
    id: "N09",
    nodeIdentifier: "N09",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 76,
    y: 88,
    batteryLevel: 94,
    cpuUsage: 18,
    ipAddress: "192.168.1.109",
    delay: "0.8s",
  },
  {
    id: "N10",
    nodeIdentifier: "N10",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 52,
    y: 88,
    batteryLevel: 81,
    cpuUsage: 36,
    ipAddress: "192.168.1.110",
    delay: "1.8s",
  },
  {
    id: "N11",
    nodeIdentifier: "N11",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 28,
    y: 88,
    batteryLevel: 73,
    cpuUsage: 48,
    ipAddress: "192.168.1.111",
    delay: "2.8s",
  },
  {
    id: "N12",
    nodeIdentifier: "N12",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 5,
    y: 12,
    batteryLevel: 89,
    cpuUsage: 26,
    ipAddress: "192.168.1.112",
    delay: "1.1s",
  },
  {
    id: "N13",
    nodeIdentifier: "N13",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 20,
    y: 45,
    batteryLevel: 96,
    cpuUsage: 19,
    ipAddress: "192.168.1.113",
    delay: "1.4s",
  },
  {
    id: "N14",
    nodeIdentifier: "N14",
    nodeType: "ROUTER",
    status: "ACTIVE",
    x: 50,
    y: 35,
    batteryLevel: 84,
    cpuUsage: 33,
    ipAddress: "192.168.1.114",
    delay: "2.1s",
  },
  {
    id: "N15",
    nodeIdentifier: "N15",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    x: 72,
    y: 54,
    batteryLevel: 79,
    cpuUsage: 39,
    ipAddress: "192.168.1.115",
    delay: "1.6s",
  },
];

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function calculateNodeHealth(node) {
  if (node.status === "FAILED" || node.status === "INACTIVE") {
    return 0;
  }

  const batteryScore = Number(node.batteryLevel ?? 0);
  const cpuScore = 100 - Number(node.cpuUsage ?? 100);

  const health = batteryScore * 0.6 + cpuScore * 0.4;

  return Math.round(Math.max(0, Math.min(100, health)));
}

function getHealthStatus(node) {
  const health = calculateNodeHealth(node);

  if (node.status === "FAILED") {
    return {
      label: "Failed",
      className: "failed",
      icon: <AlertTriangle size={15} />,
    };
  }

  if (health < 40) {
    return {
      label: "Critical",
      className: "critical",
      icon: <AlertTriangle size={15} />,
    };
  }

  if (health < 70) {
    return {
      label: "Warning",
      className: "warning",
      icon: <AlertTriangle size={15} />,
    };
  }

  return {
    label: "Healthy",
    className: "healthy",
    icon: <CheckCircle2 size={15} />,
  };
}

function calculateDistance(nodeA, nodeB) {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/*
 * Finds a free location for a new node.
 *
 * The new node must:
 * 1. Stay inside the topology.
 * 2. Be at least MIN_NODE_DISTANCE away from every node.
 */
function findSafeNodePosition(existingNodes) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const candidate = {
      x: Math.random() * 84 + 8,
      y: Math.random() * 78 + 10,
    };

    const collision = existingNodes.some((node) => {
      return calculateDistance(candidate, node) < MIN_NODE_DISTANCE;
    });

    if (!collision) {
      return candidate;
    }
  }

  return null;
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

function Simulation() {
  const [isRunning, setIsRunning] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);

  const [showAddNode, setShowAddNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [newNode, setNewNode] = useState({
    nodeIdentifier: "",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    batteryLevel: 100,
    cpuUsage: 20,
    ipAddress: "",
  });

  /*
   * ==========================================================
   * NODE MAP
   * ==========================================================
   */

  const nodeMap = useMemo(() => {
    return Object.fromEntries(
      nodes.map((node) => [node.nodeIdentifier, node])
    );
  }, [nodes]);

  /*
   * ==========================================================
   * DYNAMIC CONNECTIONS
   *
   * Connections are generated according to physical distance.
   * This makes the topology behave more like an actual MANET.
   * ==========================================================
   */

  const connections = useMemo(() => {
    const links = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const source = nodes[i];
        const target = nodes[j];

        const distance = calculateDistance(source, target);

        if (distance <= CONNECTION_RANGE) {
          links.push([
            source.nodeIdentifier,
            target.nodeIdentifier,
          ]);
        }
      }
    }

    return links;
  }, [nodes]);

  /*
   * ==========================================================
   * NETWORK STATISTICS
   * ==========================================================
   */

  const healthyNodes = nodes.filter(
    (node) => getHealthStatus(node).className === "healthy"
  ).length;

  const attentionNodes = nodes.filter((node) => {
    const health = calculateNodeHealth(node);
    return health < 70 && health > 0;
  }).length;

  const failedNodes = nodes.filter(
    (node) => node.status === "FAILED"
  ).length;

  const networkHealth = useMemo(() => {
    if (!nodes.length) return 0;

    const total = nodes.reduce(
      (sum, node) => sum + calculateNodeHealth(node),
      0
    );

    return Math.round(total / nodes.length);
  }, [nodes]);

  /*
   * ==========================================================
   * FORM HANDLER
   * ==========================================================
   */

  const handleNodeInput = (event) => {
    const { name, value } = event.target;

    setNewNode((prev) => ({
      ...prev,
      [name]:
        name === "batteryLevel" || name === "cpuUsage"
          ? Number(value)
          : value,
    }));
  };

  /*
   * ==========================================================
   * ADD NODE
   * ==========================================================
   */

  const addNode = (event) => {
    event.preventDefault();

    const identifier = newNode.nodeIdentifier.trim();

    if (!identifier) {
      alert("Please enter a node identifier.");
      return;
    }

    const duplicate = nodes.some(
      (node) =>
        node.nodeIdentifier.toLowerCase() === identifier.toLowerCase()
    );

    if (duplicate) {
      alert("A node with this identifier already exists.");
      return;
    }

    const position = findSafeNodePosition(nodes);

    if (!position) {
      alert(
        "No safe position is available. The topology is too crowded."
      );
      return;
    }

    const createdNode = {
      id: identifier,
      nodeIdentifier: identifier,
      nodeType: newNode.nodeType,
      status: newNode.status,
      x: position.x,
      y: position.y,
      batteryLevel: newNode.batteryLevel,
      cpuUsage: newNode.cpuUsage,
      ipAddress:
        newNode.ipAddress.trim() ||
        `192.168.1.${100 + nodes.length + 1}`,
      delay: `${(Math.random() * 3).toFixed(1)}s`,
    };

    setNodes((prev) => [...prev, createdNode]);

    setNewNode({
      nodeIdentifier: "",
      nodeType: "END_DEVICE",
      status: "ACTIVE",
      batteryLevel: 100,
      cpuUsage: 20,
      ipAddress: "",
    });

    setShowAddNode(false);
  };

  /*
   * ==========================================================
   * RESET
   * ==========================================================
   */

  const resetTopology = () => {
    setNodes(initialNodes);
    setSelectedNode(null);
  };

  /*
   * ==========================================================
   * SIDEBAR NAVIGATION
   *
   * Sidebar is responsible for navigating between:
   * Dashboard
   * Simulation
   * Nodes
   * Topology
   * AI Analysis
   * Recoverability
   * Recovery Logs
   * Settings
   * ==========================================================
   */

  return (
    <div
  className={`simulation-layout ${
    isDark ? "dark-mode" : ""
  }`}
>
  <div className="simulation-sidebar-fixed">
    <Sidebar activePage="simulation" />
  </div>

  <main className="simulation-page">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="simulation-header">
          <div>
            <span className="simulation-eyebrow">
              SIMULATION ENVIRONMENT
            </span>

            <h1>Virtual MANET Network</h1>

            <p>
              Build, monitor and simulate a dynamic mobile ad-hoc
              network in real time.
            </p>
          </div>

          <div className="simulation-actions">
            <button
              className="theme-button"
              onClick={() => setIsDark((prev) => !prev)}
              title="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className={`simulation-control ${
                isRunning ? "running" : ""
              }`}
              onClick={() => setIsRunning((prev) => !prev)}
            >
              {isRunning ? (
                <Pause size={17} />
              ) : (
                <Play size={17} />
              )}

              {isRunning ? "Running" : "Paused"}
            </button>
          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="simulation-stats">
          <div className="simulation-stat-card">
            <div className="stat-icon">
              <Network size={20} />
            </div>

            <div>
              <span>Total Nodes</span>
              <strong>{nodes.length}</strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon">
              <Wifi size={20} />
            </div>

            <div>
              <span>Active Links</span>
              <strong>{connections.length}</strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon">
              <HeartPulse size={20} />
            </div>

            <div>
              <span>Network Health</span>
              <strong>{networkHealth}%</strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon warning">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Attention</span>
              <strong>{attentionNodes + failedNodes}</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            TOPOLOGY
        ====================================================== */}

        <section className="topology-card">
          <div className="topology-header">
            <div>
              <span className="topology-label">
                <Activity size={16} />
                LIVE TOPOLOGY
              </span>

              <h2>Virtual MANET Network</h2>

              <p>
                Nodes automatically establish links when they are
                within communication range.
              </p>
            </div>

            <div className="topology-actions">
              <span className="live-badge">
                <span className="live-dot" />
                {isRunning ? "LIVE" : "PAUSED"}
              </span>

              <button
                className="add-node-button"
                onClick={() => setShowAddNode(true)}
              >
                <MapPin size={16} />
                Add Node
              </button>
            </div>
          </div>

          {/* ===================================================
              NETWORK CANVAS
          ==================================================== */}

          <div className="topology-scroll-container">
            <div className="network-topology">
              <svg
                className="connection-layer"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {connections.map(([from, to], index) => {
                  const source = nodeMap[from];
                  const target = nodeMap[to];

                  if (!source || !target) return null;

                  return (
                    <line
                      key={`${from}-${to}-${index}`}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className="network-link"
                    />
                  );
                })}
              </svg>

              {/* CENTER */}

              <div className="network-center">
                <div className="network-center-ring">
                  <Network size={28} />
                  <strong>MANET</strong>
                  <small>{nodes.length} Nodes</small>
                </div>
              </div>

              {/* NODES */}

              {nodes.map((node) => {
                const healthStatus = getHealthStatus(node);
                const health = calculateNodeHealth(node);

                return (
                  <div
                    key={node.nodeIdentifier}
                    className={`network-node ${
                      healthStatus.className
                    } ${isRunning ? "node-moving" : ""}`}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      animationDelay: node.delay,
                    }}
                    onMouseEnter={() => setSelectedNode(node)}
                    onMouseLeave={() => setSelectedNode(null)}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="node-label">
                      {node.nodeIdentifier}
                    </div>

                    <div className="node-body">
                      <CircleDot size={20} />
                    </div>

                    <span className="node-pulse" />

                    {/* =================================================
                        HEALTH TOOLTIP
                    ================================================== */}

                    {selectedNode?.nodeIdentifier ===
                      node.nodeIdentifier && (
                      <div className="node-health-tooltip">
                        <div className="tooltip-header">
                          <div>
                            <strong>
                              {node.nodeIdentifier}
                            </strong>

                            <span>
                              {node.nodeType ||
                                "NETWORK NODE"}
                            </span>
                          </div>

                          <div
                            className={`tooltip-status ${healthStatus.className}`}
                          >
                            {healthStatus.icon}
                            {healthStatus.label}
                          </div>
                        </div>

                        <div className="tooltip-health">
                          <div className="health-circle">
                            <strong>{health}%</strong>
                            <span>Health</span>
                          </div>

                          <div className="health-details">
                            <div>
                              <Battery size={14} />
                              <span>Battery</span>
                              <strong>
                                {node.batteryLevel}%
                              </strong>
                            </div>

                            <div>
                              <Cpu size={14} />
                              <span>CPU</span>
                              <strong>
                                {node.cpuUsage}%
                              </strong>
                            </div>

                            <div>
                              <Signal size={14} />
                              <span>Status</span>
                              <strong>
                                {node.status}
                              </strong>
                            </div>

                            <div>
                              <Wifi size={14} />
                              <span>IP</span>
                              <strong>
                                {node.ipAddress}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <div className="topology-footer">
            <div className="legend">
              <span>
                <i className="legend-dot healthy-dot" />
                Healthy Node
              </span>

              <span>
                <i className="legend-dot warning-dot" />
                Attention Required
              </span>

              <span>
                <i className="legend-dot failed-dot" />
                Failed Node
              </span>

              <span>
                <i className="legend-line" />
                Active Connection
              </span>
            </div>

            <span className="node-count">
              Showing {nodes.length} network nodes
            </span>
          </div>
        </section>

        {/* =====================================================
            LOWER PANELS
        ====================================================== */}

        <section className="simulation-grid">
          <div className="simulation-panel">
            <div className="panel-heading">
              <div>
                <h3>Simulation Control</h3>
                <p>
                  Manage the virtual network environment.
                </p>
              </div>

              <MonitorCog size={21} />
            </div>

            <div className="control-list">
              <button onClick={() => setIsRunning(true)}>
                <Play size={17} />
                Start Simulation
              </button>

              <button onClick={() => setIsRunning(false)}>
                <Pause size={17} />
                Pause Network
              </button>

              <button onClick={resetTopology}>
                <RefreshCw size={17} />
                Reset Topology
              </button>

              <button onClick={() => setShowAddNode(true)}>
                <MapPin size={17} />
                Add Network Node
              </button>
            </div>
          </div>

          <div className="simulation-panel">
            <div className="panel-heading">
              <div>
                <h3>Network Intelligence</h3>
                <p>
                  Current AI-assisted network analysis.
                </p>
              </div>

              <BrainCircuit size={21} />
            </div>

            <div className="intelligence-list">
              <div>
                <span>Topology Stability</span>

                <strong>
                  {networkHealth >= 80
                    ? "High"
                    : networkHealth >= 60
                    ? "Medium"
                    : "Low"}
                </strong>
              </div>

              <div>
                <span>Healthy Nodes</span>
                <strong>{healthyNodes}</strong>
              </div>

              <div>
                <span>Nodes Requiring Attention</span>
                <strong>{attentionNodes}</strong>
              </div>

              <div>
                <span>Failed Nodes</span>
                <strong>{failedNodes}</strong>
              </div>

              <div>
                <span>Active Connections</span>
                <strong>{connections.length}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =======================================================
          ADD NODE MODAL
      ======================================================== */}

      {showAddNode && (
        <div
          className="node-modal-overlay"
          onClick={() => setShowAddNode(false)}
        >
          <div
            className="node-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="node-modal-header">
              <div>
                <span className="simulation-eyebrow">
                  NODE CONFIGURATION
                </span>

                <h2>Add New Network Node</h2>

                <p>
                  Enter the node information stored by the
                  MANET backend.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowAddNode(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addNode}>
              <div className="node-form-grid">
                {/* NODE IDENTIFIER */}

                <div className="form-group">
                  <label>
                    Node Identifier
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="nodeIdentifier"
                    value={newNode.nodeIdentifier}
                    onChange={handleNodeInput}
                    placeholder="Example: N16"
                    required
                  />

                  <small>
                    Unique identifier for this network node.
                  </small>
                </div>

                {/* NODE TYPE */}

                <div className="form-group">
                  <label>Node Type</label>

                  <select
                    name="nodeType"
                    value={newNode.nodeType}
                    onChange={handleNodeInput}
                  >
                    <option value="ROUTER">Router</option>
                    <option value="END_DEVICE">
                      End Device
                    </option>
                    <option value="GATEWAY">Gateway</option>
                    <option value="SENSOR">Sensor</option>
                    <option value="MOBILE_NODE">
                      Mobile Node
                    </option>
                  </select>
                </div>

                {/* STATUS */}

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={newNode.status}
                    onChange={handleNodeInput}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                {/* BATTERY */}

                <div className="form-group">
                  <label>
                    Battery Level
                    <span>*</span>
                  </label>

                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="batteryLevel"
                      min="0"
                      max="100"
                      value={newNode.batteryLevel}
                      onChange={handleNodeInput}
                      required
                    />

                    <span>%</span>
                  </div>
                </div>

                {/* CPU */}

                <div className="form-group">
                  <label>
                    CPU Usage
                    <span>*</span>
                  </label>

                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="cpuUsage"
                      min="0"
                      max="100"
                      value={newNode.cpuUsage}
                      onChange={handleNodeInput}
                      required
                    />

                    <span>%</span>
                  </div>
                </div>

                {/* IP */}

                <div className="form-group">
                  <label>IP Address</label>

                  <input
                    type="text"
                    name="ipAddress"
                    value={newNode.ipAddress}
                    onChange={handleNodeInput}
                    placeholder="192.168.1.116"
                  />
                </div>
              </div>

              {/* POSITION INFORMATION */}

              <div className="position-info">
                <Info size={17} />

                <div>
                  <strong>Automatic Positioning</strong>

                  <p>
                    The simulation automatically places the node
                    at a safe position. New nodes cannot overlap
                    or collide with existing nodes.
                  </p>
                </div>
              </div>

              {/* FORM ACTIONS */}

              <div className="node-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddNode(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-node-button"
                >
                  <PlusIcon />
                  Create Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * Small local icon component so the main import list stays clean.
 */

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default Simulation;
