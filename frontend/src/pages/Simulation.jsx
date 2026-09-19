import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Cpu,
  HeartPulse,
  Info,
  LocateFixed,
  MapPin,
  MonitorCog,
  Network,
  Pause,
  Play,
  RefreshCw,
  Route,
  ShieldCheck,
  Signal,
  Wifi,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./Simulation.css";

const CANVAS = { width: 1100, height: 620 };
const HUB = { x: 550, y: 310 };

const INTER_NODE_RANGE = 900;
const HUB_RANGE = 260;
const MIN_NODE_DISTANCE = 88;
const HEAL_DELAY = 8000;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.2;

const initialNodes = [
  { id: "N01", nodeIdentifier: "N01", nodeType: "ROUTER", status: "ACTIVE", x: 550, y: 75, batteryLevel: 92, cpuUsage: 24, ipAddress: "192.168.1.101", packetDelay: 0.20 },
  { id: "N02", nodeIdentifier: "N02", nodeType: "ROUTER", status: "ACTIVE", x: 646, y: 95, batteryLevel: 86, cpuUsage: 31, ipAddress: "192.168.1.102", packetDelay: 0.35 },
  { id: "N03", nodeIdentifier: "N03", nodeType: "END_DEVICE", status: "ACTIVE", x: 725, y: 153, batteryLevel: 78, cpuUsage: 42, ipAddress: "192.168.1.103", packetDelay: 0.55 },
  { id: "N04", nodeIdentifier: "N04", nodeType: "ROUTER", status: "ACTIVE", x: 773, y: 237, batteryLevel: 91, cpuUsage: 28, ipAddress: "192.168.1.104", packetDelay: 0.70 },
  { id: "N05", nodeIdentifier: "N05", nodeType: "END_DEVICE", status: "ACTIVE", x: 784, y: 335, batteryLevel: 58, cpuUsage: 67, ipAddress: "192.168.1.105", packetDelay: 0.85 },
  { id: "N06", nodeIdentifier: "N06", nodeType: "ROUTER", status: "ACTIVE", x: 754, y: 428, batteryLevel: 83, cpuUsage: 35, ipAddress: "192.168.1.106", packetDelay: 1.00 },
  { id: "N07", nodeIdentifier: "N07", nodeType: "END_DEVICE", status: "ACTIVE", x: 688, y: 500, batteryLevel: 88, cpuUsage: 22, ipAddress: "192.168.1.107", packetDelay: 1.15 },
  { id: "N08", nodeIdentifier: "N08", nodeType: "ROUTER", status: "ACTIVE", x: 599, y: 540, batteryLevel: 76, cpuUsage: 44, ipAddress: "192.168.1.108", packetDelay: 1.30 },
  { id: "N09", nodeIdentifier: "N09", nodeType: "END_DEVICE", status: "ACTIVE", x: 501, y: 540, batteryLevel: 94, cpuUsage: 18, ipAddress: "192.168.1.109", packetDelay: 1.45 },
  { id: "N10", nodeIdentifier: "N10", nodeType: "ROUTER", status: "ACTIVE", x: 412, y: 500, batteryLevel: 81, cpuUsage: 36, ipAddress: "192.168.1.110", packetDelay: 1.60 },
  { id: "N11", nodeIdentifier: "N11", nodeType: "END_DEVICE", status: "ACTIVE", x: 346, y: 428, batteryLevel: 73, cpuUsage: 48, ipAddress: "192.168.1.111", packetDelay: 1.75 },
  { id: "N12", nodeIdentifier: "N12", nodeType: "ROUTER", status: "ACTIVE", x: 316, y: 335, batteryLevel: 89, cpuUsage: 26, ipAddress: "192.168.1.112", packetDelay: 1.90 },
  { id: "N13", nodeIdentifier: "N13", nodeType: "END_DEVICE", status: "ACTIVE", x: 327, y: 237, batteryLevel: 96, cpuUsage: 19, ipAddress: "192.168.1.113", packetDelay: 2.05 },
  { id: "N14", nodeIdentifier: "N14", nodeType: "ROUTER", status: "ACTIVE", x: 375, y: 153, batteryLevel: 84, cpuUsage: 33, ipAddress: "192.168.1.114", packetDelay: 2.20 },
  { id: "N15", nodeIdentifier: "N15", nodeType: "END_DEVICE", status: "ACTIVE", x: 454, y: 95, batteryLevel: 79, cpuUsage: 39, ipAddress: "192.168.1.115", packetDelay: 2.35 },
];

function healthOf(node) {
  if (node.status === "FAILED" || node.status === "INACTIVE") return 0;
  const battery = Number(node.batteryLevel ?? 0);
  const cpu = Number(node.cpuUsage ?? 100);
  return Math.round(Math.max(0, Math.min(100, battery * 0.6 + (100 - cpu) * 0.4)));
}

function stateOf(node) {
  const health = healthOf(node);

  if (node.status === "FAILED") {
    return { label: "Isolated", className: "failed", icon: <AlertTriangle size={14} /> };
  }

  if (node.status === "INACTIVE") {
    return { label: "Inactive", className: "inactive", icon: <AlertTriangle size={14} /> };
  }

  if (health < 70) {
    return { label: "Fault Predicted", className: "warning", icon: <AlertTriangle size={14} /> };
  }

  return { label: "Healthy", className: "healthy", icon: <CheckCircle2 size={14} /> };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildLinks(nodes) {
  const links = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (distance(nodes[i], nodes[j]) <= INTER_NODE_RANGE) {
        links.push([nodes[i].nodeIdentifier, nodes[j].nodeIdentifier]);
      }
    }
  }

  return links;
}

function buildHubLinks(nodes) {
  return nodes
    .filter((node) => node.status === "ACTIVE" && distance(node, HUB) <= HUB_RANGE)
    .map((node) => node.nodeIdentifier);
}

function shortestPath(nodes, links, targetId) {
  const activeIds = new Set(
    nodes
      .filter((node) => node.status === "ACTIVE")
      .map((node) => node.nodeIdentifier)
  );

  if (!activeIds.has(targetId)) return null;

  const graph = new Map();
  graph.set("HUB", []);

  nodes.forEach((node) => graph.set(node.nodeIdentifier, []));

  nodes.forEach((node) => {
    if (!activeIds.has(node.nodeIdentifier)) return;

    if (distance(node, HUB) <= HUB_RANGE) {
      graph.get("HUB").push(node.nodeIdentifier);
      graph.get(node.nodeIdentifier).push("HUB");
    }
  });

  links.forEach(([a, b]) => {
    if (!activeIds.has(a) || !activeIds.has(b)) return;

    graph.get(a).push(b);
    graph.get(b).push(a);
  });

  const queue = ["HUB"];
  const previous = new Map([["HUB", null]]);

  while (queue.length) {
    const current = queue.shift();
    if (current === targetId) break;

    for (const next of graph.get(current) || []) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!previous.has(targetId)) return null;

  const path = [];
  let current = targetId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current);
  }

  return path;
}

function pathD(path, nodeMap) {
  return path
    .map((id, index) => {
      const point = id === "HUB" ? HUB : nodeMap[id];
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function findSafePosition(nodes) {
  const candidates = [
    { x: 550, y: 25 },
    { x: 692, y: 25 },
    { x: 820, y: 25 },
    { x: 922, y: 40 },
    { x: 987, y: 168 },
    { x: 1010, y: 310 },
    { x: 987, y: 452 },
    { x: 922, y: 580 },
    { x: 820, y: 600 },
    { x: 692, y: 600 },
    { x: 550, y: 600 },
    { x: 408, y: 600 },
    { x: 280, y: 600 },
    { x: 178, y: 580 },
    { x: 113, y: 452 },
    { x: 90, y: 310 },
    { x: 113, y: 168 },
    { x: 178, y: 40 },
    { x: 280, y: 25 },
    { x: 408, y: 25 },
  ];

  return candidates.find(
    (candidate) =>
      distance(candidate, HUB) > 90 &&
      nodes.every((node) => distance(candidate, node) >= MIN_NODE_DISTANCE)
  ) || null;
}

function Simulation() {
  const [nodes, setNodes] = useState(initialNodes);
  const [isRunning, setIsRunning] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState("");

  const [newNode, setNewNode] = useState({
    nodeIdentifier: "",
    nodeType: "END_DEVICE",
    status: "ACTIVE",
    batteryLevel: 100,
    cpuUsage: 20,
    ipAddress: "",
  });

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((node) => [node.nodeIdentifier, node])),
    [nodes]
  );

  const links = useMemo(() => buildLinks(nodes), [nodes]);

  const hubLinks = useMemo(() => buildHubLinks(nodes), [nodes]);

  const routes = useMemo(
    () =>
      nodes
        .filter((node) => node.status === "ACTIVE")
        .map((node) => {
          const path = shortestPath(nodes, links, node.nodeIdentifier);
          return path ? { node, path, d: pathD(path, nodeMap) } : null;
        })
        .filter(Boolean),
    [nodes, links, nodeMap]
  );

  const activeLinks = useMemo(
    () =>
      links.filter(
        ([a, b]) =>
          nodeMap[a]?.status === "ACTIVE" &&
          nodeMap[b]?.status === "ACTIVE"
      ).length,
    [links, nodeMap]
  );

  const healthyCount = nodes.filter(
    (node) => stateOf(node).className === "healthy"
  ).length;

  const warningCount = nodes.filter(
    (node) => stateOf(node).className === "warning"
  ).length;

  const isolatedCount = nodes.filter(
    (node) => node.status === "FAILED"
  ).length;

  const networkHealth = nodes.length
    ? Math.round(
        nodes.reduce((sum, node) => sum + healthOf(node), 0) / nodes.length
      )
    : 0;

  const avgHops = routes.length
    ? (
        routes.reduce((sum, route) => sum + route.path.length - 1, 0) /
        routes.length
      ).toFixed(1)
    : "0.0";

  const selectedNode = selectedId ? nodeMap[selectedId] : null;

  const viewBox = useMemo(() => {
    const width = CANVAS.width / zoom;
    const height = CANVAS.height / zoom;

    const centerX = HUB.x;
    const centerY = HUB.y;

    const x = Math.max(
      0,
      Math.min(CANVAS.width - width, centerX - width / 2)
    );

    const y = Math.max(
      0,
      Math.min(CANVAS.height - height, centerY - height / 2)
    );

    return `${x} ${y} ${width} ${height}`;
  }, [zoom]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = window.setInterval(() => {
      const now = Date.now();

      setNodes((current) => {
        const due = current.filter(
          (node) =>
            node.status === "FAILED" &&
            Number(node.recoveryAt || 0) > 0 &&
            Number(node.recoveryAt) <= now
        );

        if (!due.length) return current;

        const dueIds = new Set(due.map((node) => node.nodeIdentifier));
        const healedNames = due.map((node) => node.nodeIdentifier).join(", ");

        window.setTimeout(() => {
          setRecoveryNotice(`${healedNames} healed and rejoined the network.`);
          window.setTimeout(() => setRecoveryNotice(""), 3200);
        }, 0);

        return current.map((node) =>
          dueIds.has(node.nodeIdentifier)
            ? {
                ...node,
                status: "ACTIVE",
                batteryLevel: Math.max(84, Number(node.batteryLevel)),
                cpuUsage: Math.min(32, Number(node.cpuUsage)),
                recoveryAt: null,
              }
            : node
        );
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const changeZoom = (amount) => {
    setZoom((value) =>
      Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, Number((value + amount).toFixed(2)))
      )
    );
  };

  const resetZoom = () => setZoom(1);

  const handleWheelZoom = (event) => {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 0.15 : -0.15);
  };

  const resetTopology = () => {
    setNodes(initialNodes);
    setSelectedId(null);
    setRecoveryNotice("");
    setZoom(1);
    setIsRunning(true);
  };

  const injectFault = () => {
    const degreeMap = new Map();

    links.forEach(([a, b]) => {
      degreeMap.set(a, (degreeMap.get(a) || 0) + 1);
      degreeMap.set(b, (degreeMap.get(b) || 0) + 1);
    });

    const candidates = nodes
      .filter((node) => node.status === "ACTIVE")
      .sort(
        (a, b) =>
          (degreeMap.get(b.nodeIdentifier) || 0) -
          (degreeMap.get(a.nodeIdentifier) || 0)
      );

    const target = candidates[0];

    if (!target) return;

    setNodes((current) =>
      current.map((node) =>
        node.nodeIdentifier === target.nodeIdentifier
          ? {
              ...node,
              status: "FAILED",
              batteryLevel: 8,
              cpuUsage: 96,
              recoveryAt: Date.now() + HEAL_DELAY,
            }
          : node
      )
    );

    setSelectedId(target.nodeIdentifier);
    setRecoveryNotice(
      `${target.nodeIdentifier} isolated. Network is rerouting traffic automatically.`
    );
    window.setTimeout(() => setRecoveryNotice(""), 3500);
  };

  const healNode = (id) => {
    setNodes((current) =>
      current.map((node) =>
        node.nodeIdentifier === id
          ? {
              ...node,
              status: "ACTIVE",
              batteryLevel: Math.max(84, Number(node.batteryLevel)),
              cpuUsage: Math.min(32, Number(node.cpuUsage)),
              recoveryAt: null,
            }
          : node
      )
    );

    setRecoveryNotice(`${id} healed and rejoined the network.`);
    window.setTimeout(() => setRecoveryNotice(""), 3200);
  };

  const handleInput = (event) => {
    const { name, value } = event.target;

    setNewNode((previous) => ({
      ...previous,
      [name]:
        name === "batteryLevel" || name === "cpuUsage"
          ? Math.max(0, Math.min(100, Number(value)))
          : value,
    }));
  };

  const addNode = (event) => {
    event.preventDefault();

    const identifier = newNode.nodeIdentifier.trim().toUpperCase();

    if (!identifier) return;

    if (
      nodes.some(
        (node) =>
          node.nodeIdentifier.toLowerCase() === identifier.toLowerCase()
      )
    ) {
      window.alert("A node with this identifier already exists.");
      return;
    }

    const position = findSafePosition(nodes);

    if (!position) {
      window.alert(
        "No collision-free fixed position is available. Remove a node or reset the topology."
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
        newNode.ipAddress.trim() || `192.168.1.${101 + nodes.length}`,
      packetDelay: (0.2 + (nodes.length % 10) * 0.18).toFixed(2) * 1,
      recoveryAt:
        newNode.status === "FAILED" ? Date.now() + HEAL_DELAY : null,
    };

    setNodes((current) => [...current, createdNode]);
    setSelectedId(identifier);
    setShowAddNode(false);

    setNewNode({
      nodeIdentifier: "",
      nodeType: "END_DEVICE",
      status: "ACTIVE",
      batteryLevel: 100,
      cpuUsage: 20,
      ipAddress: "",
    });
  };

  return (
    <div className="simulation-layout">
      <Sidebar activePage="simulation" />

      <main className="simulation-page">
        <header className="simulation-header">
          <div className="simulation-header-copy">
            <span className="simulation-eyebrow">SIMULATION ENVIRONMENT</span>
            <h1>Virtual MANET Network</h1>
            <p>
              Fixed-position virtual nodes with continuous packet flow,
              predictive fault detection and automatic route recovery.
            </p>
          </div>

          <div className="simulation-actions">
            <div className={`simulation-state ${isolatedCount ? "recovering" : ""}`}>
              <span className={`state-dot ${isRunning ? "active" : "paused"}`} />
              <div>
                <span>Simulation</span>
                <strong>
                  {isolatedCount
                    ? "SELF-HEALING"
                    : isRunning
                    ? "RUNNING"
                    : "PAUSED"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className={`simulation-control ${isRunning ? "running" : ""}`}
              onClick={() => setIsRunning((value) => !value)}
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              {isRunning ? "Pause" : "Resume"}
            </button>
          </div>
        </header>

        <section className="simulation-stats">
          <div className="simulation-stat-card">
            <div className="stat-icon">
              <Network size={18} />
            </div>
            <div>
              <span>Total Nodes</span>
              <strong>{nodes.length}</strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon">
              <Wifi size={18} />
            </div>
            <div>
              <span>Active Links</span>
              <strong>{activeLinks}</strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon">
              <HeartPulse size={18} />
            </div>
            <div>
              <span>Network Health</span>
              <strong className={networkHealth >= 70 ? "value-good" : "value-warn"}>
                {networkHealth}%
              </strong>
            </div>
          </div>

          <div className="simulation-stat-card">
            <div className="stat-icon attention">
              <AlertTriangle size={18} />
            </div>
            <div>
              <span>Fault / Isolated</span>
              <strong className={isolatedCount ? "value-danger" : warningCount ? "value-warn" : ""}>
                {warningCount + isolatedCount}
              </strong>
            </div>
          </div>
        </section>

        <section className="topology-card">
          <div className="topology-header">
            <div className="topology-header-copy">
              <span className="topology-label">
                <Activity size={14} />
                LIVE TOPOLOGY
              </span>
              <h2>Virtual MANET Network</h2>
              <p>
                Nodes remain fixed after creation. Blue is healthy, light
                orange is fault-predicted, and red is isolated. Packet traffic
                continuously travels hub → node → hub.
              </p>
            </div>

            <div className="topology-actions">
              <span className={`live-badge ${isolatedCount ? "recovering" : ""}`}>
                <span className={`live-dot ${isRunning ? "active" : "paused"}`} />
                {isolatedCount
                  ? "ROUTE RECOVERY"
                  : isRunning
                  ? "LIVE"
                  : "PAUSED"}
              </span>

              <button
                className="add-node-button"
                type="button"
                onClick={() => setShowAddNode(true)}
              >
                <MapPin size={15} />
                Add Node
              </button>
            </div>
          </div>

          <div
            className="network-viewport"
            onWheel={handleWheelZoom}
            role="application"
            aria-label="Interactive virtual MANET topology"
          >
            <svg
              className="network-svg"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              aria-label="Virtual MANET network diagram"
            >
              <defs>
                <pattern
                  id="manetGrid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(125,145,160,0.10)"
                    strokeWidth="1"
                  />
                </pattern>

                <radialGradient id="hubAmbient">
                  <stop offset="0%" stopColor="#236789" stopOpacity="0.22" />
                  <stop offset="72%" stopColor="#236789" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#236789" stopOpacity="0" />
                </radialGradient>

                <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="2.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
              </defs>

              <rect
                x="0"
                y="0"
                width={CANVAS.width}
                height={CANVAS.height}
                fill="#080e13"
              />
              <rect
                x="0"
                y="0"
                width={CANVAS.width}
                height={CANVAS.height}
                fill="url(#manetGrid)"
              />

              <circle
                cx={HUB.x}
                cy={HUB.y}
                r="170"
                fill="url(#hubAmbient)"
              />

              {hubLinks.map((id) => {
                const node = nodeMap[id];
                if (!node) return null;

                return (
                  <line
                    key={`hub-${id}`}
                    x1={HUB.x}
                    y1={HUB.y}
                    x2={node.x}
                    y2={node.y}
                    className="hub-link"
                  />
                );
              })}

              {links.map(([a, b]) => {
                const source = nodeMap[a];
                const target = nodeMap[b];
                if (!source || !target) return null;

                const active =
                  source.status === "ACTIVE" && target.status === "ACTIVE";

                return (
                  <line
                    key={`${a}-${b}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className={`network-link ${active ? "active" : "blocked"}`}
                  />
                );
              })}

              {routes.map((route, index) => (
                <g key={`route-${route.node.nodeIdentifier}`}>
                  <path
                    d={route.d}
                    className="route-line"
                  />

                  {isRunning && (
                    <>
                      <circle
                        r="5"
                        className="packet packet-out"
                        filter="url(#packetGlow)"
                      >
                        <animateMotion
                          dur="3.6s"
                          begin={`${route.node.packetDelay + index * 0.08}s`}
                          repeatCount="indefinite"
                          path={route.d}
                        />
                      </circle>

                      <circle
                        r="3.8"
                        className="packet packet-back"
                        filter="url(#packetGlow)"
                      >
                        <animateMotion
                          dur="3.6s"
                          begin={`${1.35 + route.node.packetDelay + index * 0.08}s`}
                          repeatCount="indefinite"
                          path={route.d}
                          keyPoints="1;0"
                          keyTimes="0;1"
                          calcMode="linear"
                        />
                      </circle>
                    </>
                  )}
                </g>
              ))}

              <g className="hub-marker">
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="72"
                  className="hub-outer-ring"
                />
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="54"
                  className="hub-core"
                />
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="42"
                  className="hub-inner"
                />
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="8"
                  className="hub-center-dot"
                />
                <text x={HUB.x} y={HUB.y - 10} className="hub-title" textAnchor="middle">
                  MANET HUB
                </text>
                <text x={HUB.x} y={HUB.y + 10} className="hub-subtitle" textAnchor="middle">
                  {routes.length} ROUTED NODES
                </text>
                <text
                  x={HUB.x}
                  y={HUB.y + 28}
                  className="hub-status"
                  textAnchor="middle"
                >
                  PACKETS FLOWING
                </text>
              </g>

              {nodes.map((node) => {
                const state = stateOf(node);
                const selected = selectedId === node.nodeIdentifier;
                const routed = routes.some(
                  (route) => route.node.nodeIdentifier === node.nodeIdentifier
                );

                return (
                  <g
                    key={node.nodeIdentifier}
                    className={`node-group ${state.className} ${selected ? "selected" : ""}`}
                    transform={`translate(${node.x} ${node.y})`}
                    onClick={() =>
                      setSelectedId(selected ? null : node.nodeIdentifier)
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.nodeIdentifier}, ${state.label}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(
                          selected ? null : node.nodeIdentifier
                        );
                      }
                    }}
                  >
                    {routed && isRunning && (
                      <circle r="38" className="node-traffic-ring" />
                    )}

                    <circle r="31" className="node-shadow" />
                    <rect
  x="-29"
  y="-25"
  width="58"
  height="50"
  rx="14"
  ry="14"
  className="node-body-svg"
/>
                   <rect
  x="-29"
  y="-25"
  width="58"
  height="50"
  rx="14"
  ry="14"
  className="node-inner-svg"
/>
                    <circle r="6.5" className="node-indicator-ring" />
                    <circle r="2.8" className="node-indicator-dot" />

                    <text
                      x="0"
                      y="-40"
                      className="node-label-svg"
                      textAnchor="middle"
                    >
                      {node.nodeIdentifier}
                    </text>

                    {state.className === "failed" && (
                      <g className="isolated-marker">
                        <circle cx="21" cy="-21" r="9" />
                        <text x="21" y="-17" textAnchor="middle">!</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="network-zoom-controls">
              <button
                type="button"
                onClick={() => changeZoom(0.15)}
                aria-label="Zoom in"
                title="Zoom in"
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn size={17} />
              </button>
              <button
                type="button"
                onClick={() => changeZoom(-0.15)}
                aria-label="Zoom out"
                title="Zoom out"
                disabled={zoom <= MIN_ZOOM}
              >
                <ZoomOut size={17} />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                aria-label="Fit network"
                title="Fit network"
              >
                <LocateFixed size={16} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
            </div>

            <div className={`network-route-status ${isolatedCount ? "recovery" : ""}`}>
              <Route size={13} />
              <span>
                {isolatedCount
                  ? `Rerouting around ${isolatedCount} isolated node${isolatedCount > 1 ? "s" : ""}`
                  : `Optimal routes active · average ${avgHops} hops`}
              </span>
            </div>

            {recoveryNotice && (
              <div className="recovery-toast">
                <ShieldCheck size={14} />
                <span>{recoveryNotice}</span>
              </div>
            )}
          </div>

          <div className="node-inspector">
            {selectedNode ? (
              <>
                <div className="inspector-main">
                  <div className={`inspector-node-icon ${stateOf(selectedNode).className}`}>
                    <CircleDot size={18} />
                  </div>
                  <div>
                    <span>SELECTED NODE</span>
                    <strong>{selectedNode.nodeIdentifier}</strong>
                    <small>
                      {selectedNode.nodeType} · {stateOf(selectedNode).label}
                    </small>
                  </div>
                </div>

                <div className="inspector-metric">
                  <span>HEALTH</span>
                  <strong className={stateOf(selectedNode).className === "failed" ? "value-danger" : stateOf(selectedNode).className === "warning" ? "value-warn" : "value-good"}>
                    {healthOf(selectedNode)}%
                  </strong>
                </div>

                <div className="inspector-metric">
                  <span>BATTERY</span>
                  <strong>{selectedNode.batteryLevel}%</strong>
                </div>

                <div className="inspector-metric">
                  <span>CPU</span>
                  <strong>{selectedNode.cpuUsage}%</strong>
                </div>

                <div className="inspector-metric inspector-route">
                  <span>ROUTE</span>
                  <strong>
                    {selectedNode.status === "FAILED"
                      ? "REROUTED"
                      : routes.some(
                          (route) =>
                            route.node.nodeIdentifier === selectedNode.nodeIdentifier
                        )
                      ? "ACTIVE"
                      : "UNAVAILABLE"}
                  </strong>
                </div>

                {selectedNode.status === "FAILED" && (
                  <button
                    type="button"
                    className="heal-node-button"
                    onClick={() => healNode(selectedNode.nodeIdentifier)}
                  >
                    <ShieldCheck size={14} />
                    Heal Now
                  </button>
                )}
              </>
            ) : (
              <div className="inspector-empty">
                <Info size={16} />
                <div>
                  <strong>Select a node</strong>
                  <span>Click any node to inspect health, resources and routing status.</span>
                </div>
              </div>
            )}
          </div>

          <div className="topology-footer">
            <div className="legend">
              <span><i className="legend-dot healthy-dot" />Healthy</span>
              <span><i className="legend-dot warning-dot" />Fault predicted</span>
              <span><i className="legend-dot failed-dot" />Isolated</span>
              <span><i className="legend-line" />Connection</span>
              <span><i className="legend-packet" />Data flow</span>
            </div>
            <span className="node-count">
              Showing {nodes.length} fixed network nodes
            </span>
          </div>
        </section>

        <section className="simulation-grid">
          <div className="simulation-panel">
            <div className="panel-heading">
              <div>
                <h3>Simulation Control</h3>
                <p>Start, pause, reset and test the self-healing virtual MANET.</p>
              </div>
              <MonitorCog size={19} />
            </div>

            <div className="control-list">
              <button
                type="button"
                className={isRunning ? "control-active" : ""}
                onClick={() => setIsRunning(true)}
              >
                <Play size={15} />
                Start Simulation
              </button>

              <button
                type="button"
                className={!isRunning ? "control-active" : ""}
                onClick={() => setIsRunning(false)}
              >
                <Pause size={15} />
                Pause Network
              </button>

              <button type="button" onClick={resetTopology}>
                <RefreshCw size={15} />
                Reset Topology
              </button>

              <button type="button" onClick={() => setShowAddNode(true)}>
                <MapPin size={15} />
                Add Network Node
              </button>

              <button
                type="button"
                className="fault-control"
                onClick={injectFault}
                disabled={!nodes.some((node) => node.status === "ACTIVE")}
              >
                <AlertTriangle size={15} />
                Test Fault Recovery
              </button>

              <button
                type="button"
                className="view-control"
                onClick={resetZoom}
              >
                <LocateFixed size={15} />
                Fit Network View
              </button>
            </div>
          </div>

          <div className="simulation-panel">
            <div className="panel-heading">
              <div>
                <h3>Network Intelligence</h3>
                <p>Live routing, fault prediction and self-healing state.</p>
              </div>
              <BrainCircuit size={19} />
            </div>

            <div className="intelligence-list">
              <div>
                <span>Topology Stability</span>
                <strong className={networkHealth >= 70 ? "value-good" : "value-warn"}>
                  {networkHealth >= 80
                    ? "High"
                    : networkHealth >= 60
                    ? "Moderate"
                    : "Low"}
                </strong>
              </div>

              <div>
                <span>Healthy Nodes</span>
                <strong className="value-good">{healthyCount}</strong>
              </div>

              <div>
                <span>Fault Predicted</span>
                <strong className="value-warn">{warningCount}</strong>
              </div>

              <div>
                <span>Isolated Nodes</span>
                <strong className="value-danger">{isolatedCount}</strong>
              </div>

              <div>
                <span>Active Routes</span>
                <strong className="value-good">{routes.length}</strong>
              </div>

              <div>
                <span>Average Route Hops</span>
                <strong>{avgHops}</strong>
              </div>

              <div>
                <span>Automatic Recovery</span>
                <strong className="value-good">ENABLED</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAddNode && (
        <div
          className="node-modal-overlay"
          onClick={() => setShowAddNode(false)}
        >
          <div className="node-modal" onClick={(event) => event.stopPropagation()}>
            <div className="node-modal-header">
              <div>
                <span className="simulation-eyebrow">NODE CONFIGURATION</span>
                <h2>Add New Network Node</h2>
                <p>Create a node at a fixed collision-free position.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddNode(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addNode}>
              <div className="node-form-grid">
                <div className="form-group">
                  <label>
                    Node Identifier <span>*</span>
                  </label>
                  <input
                    name="nodeIdentifier"
                    value={newNode.nodeIdentifier}
                    onChange={handleInput}
                    placeholder="Example: N16"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Node Type</label>
                  <select
                    name="nodeType"
                    value={newNode.nodeType}
                    onChange={handleInput}
                  >
                    <option value="ROUTER">Router</option>
                    <option value="END_DEVICE">End Device</option>
                    <option value="GATEWAY">Gateway</option>
                    <option value="SENSOR">Sensor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={newNode.status}
                    onChange={handleInput}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="FAILED">Failed / Isolated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Battery Level</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="batteryLevel"
                      min="0"
                      max="100"
                      value={newNode.batteryLevel}
                      onChange={handleInput}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>CPU Usage</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      name="cpuUsage"
                      min="0"
                      max="100"
                      value={newNode.cpuUsage}
                      onChange={handleInput}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>IP Address</label>
                  <input
                    name="ipAddress"
                    value={newNode.ipAddress}
                    onChange={handleInput}
                    placeholder="192.168.1.116"
                  />
                </div>
              </div>

              <div className="position-info">
                <Info size={16} />
                <div>
                  <strong>Fixed Position</strong>
                  <p>
                    The node is placed once and never moves. Only health,
                    routing and recovery state changes during the simulation.
                  </p>
                </div>
              </div>

              <div className="node-modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddNode(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="create-node-button">
                  <MapPin size={16} />
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

export default Simulation;