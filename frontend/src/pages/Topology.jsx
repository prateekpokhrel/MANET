import React, { useMemo, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Radio,
  Smartphone,
  Activity,
  Battery,
  Cpu,
  Wifi,
  X,
  Settings2,
  Route,
  Signal,
  Network,
  CircleDot,
  Navigation,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
  RadioTower,
  Unplug,
  RotateCcw,
} from "lucide-react";

import { useManetSimulation } from "../context/ManetSimulationContext";

const WORLD = {
  width: 1100,
  height: 650,
};

export default function Topology() {
  const {
    nodes = [],
    links = [],
    networkMetrics = {},
    engineState = "idle",
    simulationTime = 0,
    radioRange = 155,

    aiWorkflow,
    currentAIStep,
    recoveryState,
    failurePrediction,
    networkEvents = [],

    // Optional values from the shared context.
    // If they are not present yet, the topology derives them
    // directly from node/recovery state.
    isolatedNodeIds = [],
    trafficMigration,
    activeRoute: contextActiveRoute = [],
    originalRoute: contextOriginalRoute = [],
  } = useManetSimulation();

  const [selectedNode, setSelectedNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [showRange, setShowRange] = useState(false);
  const [routingMode, setRoutingMode] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);

  const engineRunning = engineState === "running";

  /*
   * ------------------------------------------------------------
   * FAILURE / RECOVERY TARGET
   * ------------------------------------------------------------
   */

  const targetNodeId =
    aiWorkflow?.targetNodeId ||
    recoveryState?.nodeId ||
    failurePrediction?.nodeId ||
    null;

  const targetNode =
    nodes.find((node) => node.id === targetNodeId) || null;

  /*
   * ------------------------------------------------------------
   * ROUTES
   * ------------------------------------------------------------
   */

  const activeRoute = useMemo(() => {
    const route =
      recoveryState?.activeRoute?.length
        ? recoveryState.activeRoute
        : contextActiveRoute;

    return Array.isArray(route) ? route : [];
  }, [
    recoveryState?.activeRoute,
    contextActiveRoute,
  ]);

  const originalRoute = useMemo(() => {
    const route =
      recoveryState?.originalRoute?.length
        ? recoveryState.originalRoute
        : contextOriginalRoute;

    return Array.isArray(route) ? route : [];
  }, [
    recoveryState?.originalRoute,
    contextOriginalRoute,
  ]);

  const routeNodeSet = useMemo(
    () => new Set(activeRoute),
    [activeRoute]
  );

  const originalRouteSet = useMemo(
    () => new Set(originalRoute),
    [originalRoute]
  );

  const activeRouteLinks = useMemo(() => {
    const result = new Set();

    for (let i = 0; i < activeRoute.length - 1; i++) {
      const a = activeRoute[i];
      const b = activeRoute[i + 1];

      result.add(`${a}-${b}`);
      result.add(`${b}-${a}`);
    }

    return result;
  }, [activeRoute]);

  /*
   * ------------------------------------------------------------
   * ISOLATED NODES
   * ------------------------------------------------------------
   */

  const isolatedSet = useMemo(() => {
    const set = new Set(
      Array.isArray(isolatedNodeIds)
        ? isolatedNodeIds
        : []
    );

    nodes.forEach((node) => {
      if (
        node.status === "isolated" ||
        node.status === "offline" ||
        node.isolated === true
      ) {
        set.add(node.id);
      }
    });

    if (
      recoveryState?.phase === "isolating" ||
      recoveryState?.phase === "rerouting" ||
      recoveryState?.phase === "traffic-migration"
    ) {
      if (targetNodeId) {
        set.add(targetNodeId);
      }
    }

    return set;
  }, [
    isolatedNodeIds,
    nodes,
    recoveryState?.phase,
    targetNodeId,
  ]);

  /*
   * ------------------------------------------------------------
   * WORKFLOW STATE
   * ------------------------------------------------------------
   */

  const workflowPhase =
    recoveryState?.phase ||
    currentAIStep?.id ||
    currentAIStep?.key ||
    targetNode?.recoveryState ||
    "monitoring";

  const workflowLabel =
    currentAIStep?.label ||
    getWorkflowLabel(workflowPhase);

  const workflowProgress =
    Number(
      recoveryState?.progress ??
        currentAIStep?.progress ??
        targetNode?.recoveryProgress ??
        0
    ) || 0;

  const isIsolationPhase =
    workflowPhase === "isolating" ||
    workflowPhase === "isolated";

  const isReroutingPhase =
    workflowPhase === "rerouting" ||
    workflowPhase === "route-computation";

  const isTrafficMigrationPhase =
    workflowPhase === "traffic-migration" ||
    workflowPhase === "traffic_migration" ||
    trafficMigration?.active === true;

  const isRecoveryPhase =
    workflowPhase === "recovering" ||
    workflowPhase === "verification" ||
    workflowPhase === "reintegration";

  const isReintegrated =
    workflowPhase === "reintegration" ||
    workflowPhase === "reintegrated" ||
    targetNode?.status === "online" &&
      targetNode?.recoveryState === "stable";

  /*
   * ------------------------------------------------------------
   * NETWORK COUNTERS
   * ------------------------------------------------------------
   */

  const activeNodes = nodes.filter(
    (node) =>
      node.status !== "offline" &&
      node.status !== "isolated"
  ).length;

  const isolatedCount = nodes.filter(
    (node) =>
      isolatedSet.has(node.id)
  ).length;

  const recoveringCount = nodes.filter(
    (node) =>
      node.status === "recovering" ||
      node.recoveryState === "recovering" ||
      node.recoveryState === "verification"
  ).length;

  const warningCount = nodes.filter(
    (node) =>
      node.status === "warning" ||
      node.status === "degraded"
  ).length;

  const connectedPeers =
    networkMetrics.connectedPeers ??
    nodes.filter(
      (node) =>
        node.type !== "gateway" &&
        node.status !== "offline" &&
        node.status !== "isolated"
    ).length;

  /*
   * ------------------------------------------------------------
   * SELECTED NODE DETAILS
   * ------------------------------------------------------------
   */

  const selectedDetails = useMemo(() => {
    if (!selectedNode) return null;

    const node = nodes.find(
      (item) => item.id === selectedNode.id
    );

    if (!node) return null;

    const connectedLinks = links.filter(
      (link) =>
        link.source === node.id ||
        link.target === node.id
    );

    const neighborIds = connectedLinks.map(
      (link) =>
        link.source === node.id
          ? link.target
          : link.source
    );

    const neighbors = nodes.filter((item) =>
      neighborIds.includes(item.id)
    );

    return {
      node,
      links: connectedLinks,
      neighbors,
    };
  }, [
    selectedNode,
    nodes,
    links,
  ]);

  /*
   * ------------------------------------------------------------
   * ZOOM
   * ------------------------------------------------------------
   */

  const handleZoom = (amount) => {
    setScale((previous) =>
      Math.min(
        1.8,
        Math.max(
          0.55,
          previous + amount
        )
      )
    );
  };

  const resetZoom = () => {
    setScale(1);
  };

  /*
   * ------------------------------------------------------------
   * LINK HELPERS
   * ------------------------------------------------------------
   */

  const getLinkKey = (link) =>
    `${link.source}-${link.target}`;

  const isActiveRouteLink = (link) =>
    activeRouteLinks.has(
      getLinkKey(link)
    );

  const isOriginalRouteLink = (link) =>
    originalRouteSet.has(link.source) &&
    originalRouteSet.has(link.target);

  /*
   * ------------------------------------------------------------
   * LINK STATUS
   * ------------------------------------------------------------
   */

  const getLinkVisualState = (link, source, target) => {
    const sourceIsolated = isolatedSet.has(
      source.id
    );

    const targetIsolated = isolatedSet.has(
      target.id
    );

    const affected =
      sourceIsolated ||
      targetIsolated;

    const activeRouteLink =
      isActiveRouteLink(link);

    const originalLink =
      isOriginalRouteLink(link);

    /*
     * Failed node always wins.
     * Even if the context still contains the
     * original link, visually it is disconnected.
     */
    if (affected) {
      return {
        stroke: "#f43f5e",
        width: 2.5,
        opacity: 0.28,
        dash: "5 7",
        broken: true,
        route: false,
        original: originalLink,
      };
    }

    /*
     * Active AI route.
     */
    if (
      routingMode &&
      activeRouteLink
    ) {
      return {
        stroke: "#10b981",
        width: 4.5,
        opacity: 0.95,
        dash: undefined,
        broken: false,
        route: true,
        original: false,
      };
    }

    /*
     * Original route after failure.
     */
    if (
      routingMode &&
      originalLink &&
      activeRoute.length > 1 &&
      activeRoute.join("-") !==
        originalRoute.join("-")
    ) {
      return {
        stroke: "#fb7185",
        width: 2,
        opacity: 0.32,
        dash: "7 7",
        broken: false,
        route: false,
        original: true,
      };
    }

    /*
     * Degraded wireless link.
     */
    if (
      link.quality === "degraded" ||
      link.status === "degraded" ||
      link.health === "degraded"
    ) {
      return {
        stroke: "#f59e0b",
        width: 2.5,
        opacity: 0.85,
        dash: "5 5",
        broken: false,
        route: false,
        original: false,
      };
    }

    /*
     * Excellent wireless link.
     */
    if (
      link.quality === "excellent"
    ) {
      return {
        stroke: "#60a5fa",
        width: 2.4,
        opacity: 0.85,
        dash: undefined,
        broken: false,
        route: false,
        original: false,
      };
    }

    /*
     * Normal MANET radio link.
     */
    return {
      stroke: "#94a3b8",
      width: 1.6,
      opacity: 0.58,
      dash: undefined,
      broken: false,
      route: false,
      original: false,
    };
  };

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <div className="h-full flex flex-col space-y-4 relative">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mesh Topology Map
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold ${
                engineRunning
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : engineState === "paused"
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  engineRunning
                    ? "bg-emerald-500 animate-pulse"
                    : engineState === "paused"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />

              {engineRunning
                ? "LIVE"
                : engineState === "paused"
                ? "PAUSED"
                : "STANDBY"}
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Dynamic mobile ad-hoc network, radio connectivity and autonomous recovery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500">
            T+ {formatTime(simulationTime)}
          </div>

          <button
            onClick={() =>
              setShowTraffic(
                (previous) => !previous
              )
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold ${
              showTraffic
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Traffic
          </button>

          <button
            onClick={() =>
              setShowRange(
                (previous) => !previous
              )
            }
            className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
              showRange
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            Radio Range
          </button>

          <button
            onClick={() =>
              setRoutingMode(
                (previous) => !previous
              )
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold ${
              routingMode
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Route className="h-3.5 w-3.5" />
            Routing
          </button>

          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg shadow-sm">

            <button
              onClick={() =>
                handleZoom(0.1)
              }
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                handleZoom(-0.1)
              }
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <div className="w-px bg-slate-200 mx-1" />

            <button
              onClick={resetZoom}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

          </div>
        </div>
      </div>


      {/* ======================================================
          NETWORK STATUS
      ====================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

        <TopologyStat
          label="Active Nodes"
          value={`${activeNodes}/${nodes.length}`}
          icon={Network}
        />

        <TopologyStat
          label="Radio Links"
          value={
            networkMetrics.activeLinks ??
            links.filter(
              (link) => {
                const source = nodes.find(
                  (n) => n.id === link.source
                );

                const target = nodes.find(
                  (n) => n.id === link.target
                );

                return (
                  source &&
                  target &&
                  !isolatedSet.has(source.id) &&
                  !isolatedSet.has(target.id)
                );
              }
            ).length
          }
          icon={Wifi}
        />

        <TopologyStat
          label="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          danger={warningCount > 0}
        />

        <TopologyStat
          label="Isolated"
          value={isolatedCount}
          icon={ShieldAlert}
          danger={isolatedCount > 0}
        />

        <TopologyStat
          label="Recovering"
          value={recoveringCount}
          icon={RefreshCw}
          danger={recoveringCount > 0}
        />

      </div>


      {/* ======================================================
          AI RECOVERY WORKFLOW
      ====================================================== */}

      {targetNode && (
        <div
          className={`border rounded-xl px-4 py-3 ${
            isolatedSet.has(targetNode.id)
              ? "bg-rose-50 border-rose-200"
              : isRecoveryPhase
              ? "bg-blue-50 border-blue-200"
              : isTrafficMigrationPhase
              ? "bg-emerald-50 border-emerald-200"
              : "bg-slate-50 border-slate-200"
          }`}
        >

          <div className="flex flex-col xl:flex-row xl:items-center gap-4">

            <div className="flex items-center gap-3 min-w-[250px]">

              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  isolatedSet.has(targetNode.id)
                    ? "bg-rose-100 text-rose-600"
                    : isRecoveryPhase
                    ? "bg-blue-100 text-blue-600"
                    : isTrafficMigrationPhase
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {isolatedSet.has(targetNode.id) ? (
                  <Unplug className="h-5 w-5" />
                ) : isRecoveryPhase ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : isTrafficMigrationPhase ? (
                  <Zap className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {targetNode.id}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {getWorkflowLabel(workflowPhase)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-0.5">
                  {workflowLabel}
                </p>
              </div>

            </div>


            {/* WORKFLOW PIPELINE */}

            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center min-w-max">

                {[
                  ["monitoring", "Monitor"],
                  ["predicted", "Predict"],
                  ["classified", "Classify"],
                  ["isolating", "Isolate"],
                  ["rerouting", "Reroute"],
                  ["traffic-migration", "Migrate"],
                  ["recovering", "Recover"],
                  ["verification", "Verify"],
                  ["reintegration", "Reintegrate"],
                ].map(
                  ([key, label], index) => {

                    const currentIndex =
                      getWorkflowIndex(
                        workflowPhase
                      );

                    const stepIndex =
                      getWorkflowIndex(key);

                    const completed =
                      stepIndex <
                      currentIndex;

                    const current =
                      stepIndex ===
                      currentIndex;

                    return (
                      <React.Fragment
                        key={key}
                      >

                        <div className="flex flex-col items-center gap-1">

                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                              current
                                ? "bg-blue-600 border-blue-600 text-white"
                                : completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-200 text-slate-400"
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <span
                            className={`text-[9px] font-semibold ${
                              current
                                ? "text-blue-700"
                                : completed
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }`}
                          >
                            {label}
                          </span>

                        </div>

                        {index < 8 && (
                          <div
                            className={`w-8 h-px mx-1 ${
                              stepIndex <
                              currentIndex
                                ? "bg-emerald-400"
                                : "bg-slate-200"
                            }`}
                          />
                        )}

                      </React.Fragment>
                    );
                  }
                )}

              </div>
            </div>


            {/* PROGRESS */}

            <div className="w-full xl:w-36">

              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-500">
                  Recovery
                </span>

                <span className="text-[10px] font-bold text-slate-700">
                  {Math.min(
                    100,
                    workflowProgress
                  )}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-white overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isolatedSet.has(
                      targetNode.id
                    )
                      ? "bg-rose-500"
                      : isTrafficMigrationPhase
                      ? "bg-emerald-500"
                      : "bg-blue-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        workflowProgress
                      )
                    )}%`,
                  }}
                />
              </div>

            </div>

          </div>

          {failurePrediction?.faultType && (
            <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center gap-2 text-[10px] text-slate-500">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              Fault:
              <strong className="text-slate-700">
                {formatFault(
                  failurePrediction.faultType
                )}
              </strong>
            </div>
          )}

        </div>
      )}


      {/* ======================================================
          MAP
      ====================================================== */}

      <div className="flex-1 min-h-[600px] bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-hidden">

        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-[radial-gradient(#dbe4ef_1px,transparent_1px)] bg-[length:24px_24px]" />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none" />


        <style>{`

          @keyframes packetFlow {
            to {
              stroke-dashoffset: -28;
            }
          }

          .packet-flow {
            stroke-dasharray: 5 9;
            animation: packetFlow 0.8s linear infinite;
          }

          @keyframes routeFlow {
            to {
              stroke-dashoffset: -32;
            }
          }

          .route-flow {
            stroke-dasharray: 9 7;
            animation: routeFlow 0.55s linear infinite;
          }

          @keyframes faultPulse {
            0% {
              opacity: .15;
              transform: scale(.88);
            }

            50% {
              opacity: .8;
              transform: scale(1.18);
            }

            100% {
              opacity: .15;
              transform: scale(.88);
            }
          }

          .fault-pulse {
            animation: faultPulse 1s ease-in-out infinite;
            transform-origin: center;
          }

          @keyframes recoveryPulse {
            0% {
              opacity: .15;
              transform: scale(.9);
            }

            50% {
              opacity: .5;
              transform: scale(1.15);
            }

            100% {
              opacity: .15;
              transform: scale(.9);
            }
          }

          .recovery-pulse {
            animation: recoveryPulse 1.4s ease-in-out infinite;
            transform-origin: center;
          }

          @keyframes rangePulse {
            0% {
              opacity: .04;
            }

            50% {
              opacity: .16;
            }

            100% {
              opacity: .04;
            }
          }

          .radio-range {
            animation: rangePulse 2.5s ease-in-out infinite;
          }

          @keyframes trafficPulse {
            0% {
              opacity: .25;
              transform: scale(.75);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }

            100% {
              opacity: .25;
              transform: scale(.75);
            }
          }

          .traffic-pulse {
            animation: trafficPulse 1s ease-in-out infinite;
            transform-origin: center;
          }

        `}</style>


        {/* ====================================================
            MAP WORLD
        ==================================================== */}

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">

          <div
            style={{
              width: `${WORLD.width}px`,
              height: `${WORLD.height}px`,
              transform: `scale(${scale})`,
              transition:
                "transform .25s ease-out",
            }}
            className="relative shrink-0"
          >

            <svg
              viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
              className="w-full h-full"
            >

              {/* =================================================
                  RADIO RANGE
              ================================================= */}

              {showRange &&
                nodes.map((node) => (
                  <circle
                    key={`range-${node.id}`}
                    cx={node.x}
                    cy={node.y}
                    r={radioRange}
                    fill="rgba(59,130,246,.025)"
                    stroke="rgba(59,130,246,.18)"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                    className="radio-range"
                  />
                ))}


              {/* =================================================
                  ORIGINAL ROUTE
              ================================================= */}

              {routingMode &&
                originalRoute.length > 1 &&
                originalRoute
                  .slice(0, -1)
                  .map(
                    (nodeId, index) => {

                      const nextId =
                        originalRoute[
                          index + 1
                        ];

                      const source =
                        nodes.find(
                          (node) =>
                            node.id ===
                            nodeId
                        );

                      const target =
                        nodes.find(
                          (node) =>
                            node.id ===
                            nextId
                        );

                      if (
                        !source ||
                        !target
                      ) {
                        return null;
                      }

                      const broken =
                        isolatedSet.has(
                          source.id
                        ) ||
                        isolatedSet.has(
                          target.id
                        );

                      return (
                        <g
                          key={`original-route-${nodeId}-${nextId}`}
                        >

                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={
                              broken
                                ? "#f43f5e"
                                : "#fb7185"
                            }
                            strokeWidth={
                              broken ? 3 : 2
                            }
                            strokeDasharray={
                              broken
                                ? "3 9"
                                : "7 7"
                            }
                            opacity={
                              broken
                                ? 0.75
                                : 0.25
                            }
                          />

                          {broken && (
                            <FailureCutMark
                              source={source}
                              target={target}
                            />
                          )}

                        </g>
                      );
                    }
                  )}


              {/* =================================================
                  NORMAL RADIO LINKS
              ================================================= */}

              {links.map((link) => {

                const source =
                  nodes.find(
                    (node) =>
                      node.id ===
                      link.source
                  );

                const target =
                  nodes.find(
                    (node) =>
                      node.id ===
                      link.target
                  );

                if (
                  !source ||
                  !target
                ) {
                  return null;
                }

                const selected =
                  selectedNode &&
                  (
                    selectedNode.id ===
                      source.id ||
                    selectedNode.id ===
                      target.id
                  );

                const visual =
                  getLinkVisualState(
                    link,
                    source,
                    target
                  );

                return (
                  <g
                    key={
                      link.id ||
                      `${link.source}-${link.target}`
                    }
                  >

                    {/* BASE LINK */}

                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={
                        visual.stroke
                      }
                      strokeWidth={
                        selected
                          ? visual.width + 1
                          : visual.width
                      }
                      strokeDasharray={
                        visual.dash
                      }
                      opacity={
                        selectedNode &&
                        !selected
                          ? 0.12
                          : visual.opacity
                      }
                    />


                    {/* FAILED LINK CUT */}

                    {visual.broken && (
                      <FailureCutMark
                        source={source}
                        target={target}
                      />
                    )}


                    {/* =================================================
                        ACTIVE AI ROUTE
                    ================================================= */}

                    {routingMode &&
                      visual.route &&
                      !visual.broken && (
                        <>
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="#10b981"
                            strokeWidth="5"
                            opacity=".95"
                            className="route-flow"
                          />

                          {showTraffic && (
                            <TrafficParticle
                              source={source}
                              target={target}
                            />
                          )}
                        </>
                      )}


                    {/* =================================================
                        NORMAL TRAFFIC
                    ================================================= */}

                    {showTraffic &&
                      engineRunning &&
                      !visual.broken &&
                      !visual.route &&
                      !visual.original &&
                      link.quality !==
                        "degraded" && (
                        <line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke="#2563eb"
                          strokeWidth="1.3"
                          opacity={
                            selectedNode &&
                            !selected
                              ? 0.08
                              : 0.45
                          }
                          className="packet-flow"
                        />
                      )}

                  </g>
                );
              })}


              {/* =================================================
                  ACTIVE ROUTE ARROWS
              ================================================= */}

              {routingMode &&
                activeRoute.length > 1 &&
                activeRoute
                  .slice(0, -1)
                  .map(
                    (nodeId, index) => {

                      const nextId =
                        activeRoute[
                          index + 1
                        ];

                      const source =
                        nodes.find(
                          (node) =>
                            node.id ===
                            nodeId
                        );

                      const target =
                        nodes.find(
                          (node) =>
                            node.id ===
                            nextId
                        );

                      if (
                        !source ||
                        !target ||
                        isolatedSet.has(
                          source.id
                        ) ||
                        isolatedSet.has(
                          target.id
                        )
                      ) {
                        return null;
                      }

                      return (
                        <RouteArrow
                          key={`route-arrow-${nodeId}-${nextId}`}
                          source={source}
                          target={target}
                        />
                      );
                    }
                  )}


              {/* =================================================
                  NODES
              ================================================= */}

              {nodes.map((node) => (
                <NodeElement
                  key={node.id}
                  node={node}
                  selected={
                    selectedNode?.id ===
                    node.id
                  }
                  isTarget={
                    node.id ===
                    targetNodeId
                  }
                  isIsolated={isolatedSet.has(
                    node.id
                  )}
                  isRouteNode={
                    routeNodeSet.has(
                      node.id
                    )
                  }
                  isTrafficNode={
                    activeRoute.includes(
                      node.id
                    )
                  }
                  onClick={() =>
                    setSelectedNode(
                      node
                    )
                  }
                />
              ))}

            </svg>

          </div>
        </div>


        {/* ======================================================
            LEFT LEGEND
        ====================================================== */}

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-md z-10">

          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            MANET Legend
          </h4>

          <div className="space-y-2.5">

            <LegendItem
              icon={Radio}
              label="Gateway / Uplink"
              color="text-indigo-600"
            />

            <LegendItem
              icon={Smartphone}
              label="Mobile Node"
              color="text-blue-600"
            />

            <div className="h-px bg-slate-100 my-2" />

            <LegendItem
              circle="bg-emerald-500"
              label="Online"
            />

            <LegendItem
              circle="bg-amber-500"
              label="Warning / Degraded"
            />

            <LegendItem
              circle="bg-rose-500"
              label="Fault / Isolated"
            />

            <LegendItem
              circle="bg-blue-500"
              label="Recovering"
            />

            <div className="h-px bg-slate-100 my-2" />

            <div className="flex items-center gap-2">
              <div className="w-7 border-t-4 border-emerald-500" />

              <span className="text-[11px] text-slate-500">
                AI alternate route
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 border-t-2 border-dashed border-rose-400" />

              <span className="text-[11px] text-slate-500">
                Failed original route
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />

              <span className="text-[11px] text-slate-500">
                Live traffic
              </span>
            </div>

          </div>
        </div>


        {/* ======================================================
            RIGHT LIVE RECOVERY PANEL
        ====================================================== */}

        {(targetNode ||
          isTrafficMigrationPhase ||
          isRecoveryPhase) && (
          <div className="absolute bottom-4 right-4 w-[300px] bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg p-4 z-10">

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    isolatedCount > 0
                      ? "bg-rose-50 text-rose-600"
                      : isRecoveryPhase
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isolatedCount > 0 ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : isRecoveryPhase ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Self-Healing Engine
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {targetNode?.id ||
                      "Network"}
                  </p>
                </div>

              </div>

              <span
                className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ${
                  isolatedCount > 0
                    ? "bg-rose-100 text-rose-700"
                    : isRecoveryPhase
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {getWorkflowLabel(
                  workflowPhase
                )}
              </span>

            </div>


            <div className="space-y-2">

              <WorkflowRow
                label="Fault detection"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "predicted"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "predicted"
                  )
                }
              />

              <WorkflowRow
                label="Node isolation"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "isolating"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "isolating"
                  )
                }
              />

              <WorkflowRow
                label="Alternative route"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "rerouting"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "rerouting"
                  )
                }
              />

              <WorkflowRow
                label="Traffic migration"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "traffic-migration"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "traffic-migration"
                  )
                }
              />

              <WorkflowRow
                label="Node recovery"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "recovering"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "recovering"
                  )
                }
              />

              <WorkflowRow
                label="Health verification"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "verification"
                  )
                }
                done={
                  getWorkflowIndex(
                    workflowPhase
                  ) >
                  getWorkflowIndex(
                    "verification"
                  )
                }
              />

              <WorkflowRow
                label="Node reintegration"
                active={
                  getWorkflowIndex(
                    workflowPhase
                  ) >=
                  getWorkflowIndex(
                    "reintegration"
                  )
                }
                done={isReintegrated}
              />

            </div>


            {activeRoute.length > 1 && (
              <div className="mt-3 pt-3 border-t border-slate-100">

                <div className="flex items-center gap-2 mb-2">
                  <Route className="h-3.5 w-3.5 text-emerald-600" />

                  <span className="text-[10px] font-bold text-slate-700">
                    Active AI Route
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">

                  {activeRoute.map(
                    (nodeId, index) => (
                      <React.Fragment
                        key={`${nodeId}-${index}`}
                      >

                        <span className="text-[9px] font-semibold px-1.5 py-1 rounded bg-emerald-50 text-emerald-700">
                          {nodeId}
                        </span>

                        {index <
                          activeRoute.length -
                            1 && (
                          <ArrowRight className="h-3 w-3 text-emerald-500" />
                        )}

                      </React.Fragment>
                    )
                  )}

                </div>
              </div>
            )}

          </div>
        )}


        {/* ======================================================
            MAP STATUS
        ====================================================== */}

        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-sm px-3 py-2">

          <div className="flex items-center gap-2">

            <span
              className={`h-2 w-2 rounded-full ${
                engineRunning
                  ? "bg-emerald-500 animate-pulse"
                  : engineState ===
                    "paused"
                  ? "bg-amber-500"
                  : "bg-slate-400"
              }`}
            />

            <span className="text-[11px] font-medium text-slate-600">
              {engineRunning
                ? "Mobility simulation active"
                : engineState ===
                  "paused"
                ? "Simulation paused"
                : "Simulation standby"}
            </span>

          </div>

          <div className="flex items-center gap-3 mt-1">

            <span className="text-[10px] text-slate-400">
              Range: {radioRange}m
            </span>

            <span className="text-[10px] text-slate-400">
              {nodes.length} nodes
            </span>

            <span className="text-[10px] text-slate-400">
              {links.length} links
            </span>

          </div>

        </div>


        {/* ======================================================
            SELECTED NODE DETAILS
        ====================================================== */}

        {selectedDetails && (
          <NodeDetails
            node={selectedDetails.node}
            details={selectedDetails}
            range={radioRange}
            onClose={() =>
              setSelectedNode(null)
            }
          />
        )}

      </div>

    </div>
  );
}


/* ============================================================
   NODE ELEMENT
============================================================ */

function NodeElement({
  node,
  selected,
  isTarget,
  isIsolated,
  isRouteNode,
  isTrafficNode,
  onClick,
}) {
  const gateway =
    node.type === "gateway";

  const size =
    gateway ? 26 : 21;

  const status =
    node.status || "online";

  const effectiveStatus =
    isIsolated
      ? "isolated"
      : status;

  const isFault =
    effectiveStatus === "isolated" ||
    effectiveStatus === "warning" ||
    node.fault;

  const isRecovering =
    effectiveStatus ===
    "recovering";

  const isHealthy =
    effectiveStatus ===
      "online" &&
    !node.fault &&
    !isIsolated;

  let statusColor =
    "#10b981";

  if (
    effectiveStatus ===
    "warning"
  ) {
    statusColor = "#f59e0b";
  }

  if (
    effectiveStatus ===
    "isolated"
  ) {
    statusColor = "#f43f5e";
  }

  if (
    effectiveStatus ===
    "recovering"
  ) {
    statusColor = "#3b82f6";
  }

  const Icon =
    gateway
      ? Radio
      : Smartphone;

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onClick={onClick}
      className="cursor-pointer"
    >

      {/* HIT AREA */}

      <circle
        r={size + 20}
        fill="transparent"
      />


      {/* ======================================================
          ISOLATION ZONE
      ====================================================== */}

      {isIsolated && (
        <circle
          r={size + 17}
          fill="rgba(244,63,94,.06)"
          stroke="#f43f5e"
          strokeWidth="2"
          strokeDasharray="5 5"
          className="fault-pulse"
        />
      )}


      {/* ======================================================
          TARGET FAULT PULSE
      ====================================================== */}

      {isTarget &&
        isFault && (
          <circle
            r={size + 13}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            opacity=".65"
            className="fault-pulse"
          />
        )}


      {/* ======================================================
          RECOVERY PULSE
      ====================================================== */}

      {isRecovering && (
        <circle
          r={size + 14}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          opacity=".5"
          className="recovery-pulse"
        />
      )}


      {/* ======================================================
          AI ROUTE NODE
      ====================================================== */}

      {isRouteNode && (
        <circle
          r={size + 8}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          opacity=".9"
        />
      )}


      {/* ======================================================
          TRAFFIC NODE
      ====================================================== */}

      {isTrafficNode &&
        !isIsolated && (
          <circle
            r={size + 11}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity=".55"
            className="traffic-pulse"
          />
        )}


      {/* ======================================================
          NORMAL RADIO RING
      ====================================================== */}

      {isHealthy && (
        <circle
          r={size + 9}
          fill="none"
          stroke={
            gateway
              ? "#818cf8"
              : "#60a5fa"
          }
          strokeWidth="1"
          opacity=".25"
        />
      )}


      {/* ======================================================
          SELECTED
      ====================================================== */}

      {selected && (
        <circle
          r={size + 11}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      )}


      {/* ======================================================
          NODE BODY
      ====================================================== */}

      <circle
        r={size}
        fill={
          effectiveStatus ===
          "isolated"
            ? "#fff1f2"
            : effectiveStatus ===
              "recovering"
            ? "#eff6ff"
            : effectiveStatus ===
              "warning"
            ? "#fffbeb"
            : "white"
        }
        stroke={
          isFault
            ? statusColor
            : gateway
            ? "#818cf8"
            : "#94a3b8"
        }
        strokeWidth={
          selected ||
          isTarget ||
          isIsolated
            ? 3
            : 2
        }
        className="drop-shadow-sm"
      />


      {/* ======================================================
          NODE ICON
      ====================================================== */}

      <foreignObject
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
      >
        <div className="w-full h-full flex items-center justify-center">

          <Icon
            size={
              gateway
                ? 21
                : 16
            }
            className={
              isIsolated
                ? "text-rose-600"
                : isRecovering
                ? "text-blue-600"
                : status ===
                  "warning"
                ? "text-amber-600"
                : gateway
                ? "text-indigo-600"
                : "text-blue-600"
            }
          />

        </div>
      </foreignObject>


      {/* ======================================================
          STATUS DOT
      ====================================================== */}

      <circle
        cx={size - 4}
        cy={-(size - 4)}
        r="5"
        fill={statusColor}
        stroke="white"
        strokeWidth="2"
      />


      {/* ======================================================
          ISOLATION X MARK
      ====================================================== */}

      {isIsolated && (
        <g
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line
            x1={-7}
            y1={-7}
            x2={7}
            y2={7}
          />

          <line
            x1={7}
            y1={-7}
            x2={-7}
            y2={7}
          />
        </g>
      )}


      {/* ======================================================
          FAILURE MARKER
      ====================================================== */}

      {isTarget &&
        !isIsolated &&
        node.failureProbability >
          0 && (
          <foreignObject
            x={size - 3}
            y={-size - 11}
            width="24"
            height="24"
          >
            <div className="w-full h-full flex items-center justify-center rounded-full bg-rose-600 text-white shadow-sm">
              <AlertTriangle className="h-3 w-3" />
            </div>
          </foreignObject>
        )}


      {/* ======================================================
          RECOVERY CHECK
      ====================================================== */}

      {effectiveStatus ===
        "online" &&
        node.recoveryState ===
          "stable" &&
        isTarget && (
          <foreignObject
            x={size - 2}
            y={-size - 12}
            width="24"
            height="24"
          >
            <div className="w-full h-full flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
            </div>
          </foreignObject>
        )}


      {/* ======================================================
          NODE LABEL
      ====================================================== */}

      <text
        y={size + 18}
        textAnchor="middle"
        className={`text-[10px] font-medium pointer-events-none ${
          isTarget ||
          isIsolated
            ? "fill-slate-900 font-bold"
            : "fill-slate-500"
        }`}
      >
        {node.label ||
          node.id}
      </text>

      {isIsolated && (
        <text
          y={size + 31}
          textAnchor="middle"
          className="text-[8px] font-bold fill-rose-500 uppercase"
        >
          ISOLATED
        </text>
      )}

      {isRecovering && (
        <text
          y={size + 31}
          textAnchor="middle"
          className="text-[8px] font-bold fill-blue-500 uppercase"
        >
          RECOVERING
        </text>
      )}

    </g>
  );
}


/* ============================================================
   TRAFFIC PARTICLE
============================================================ */

function TrafficParticle({
  source,
  target,
}) {
  const id = `traffic-${source.id}-${target.id}`;

  return (
    <circle
      r="3.5"
      fill="#10b981"
      className="traffic-pulse"
    >
      <animateMotion
        dur="1.1s"
        repeatCount="indefinite"
        path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
      />
    </circle>
  );
}


/* ============================================================
   FAILED LINK CUT MARK
============================================================ */

function FailureCutMark({
  source,
  target,
}) {
  const dx =
    target.x - source.x;

  const dy =
    target.y - source.y;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy
    );

  if (!length) return null;

  const ux = dx / length;
  const uy = dy / length;

  const mx =
    (source.x +
      target.x) /
    2;

  const my =
    (source.y +
      target.y) /
    2;

  const size = 7;

  return (
    <g
      stroke="#f43f5e"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line
        x1={
          mx -
          uy * size -
          ux * 4
        }
        y1={
          my +
          ux * size -
          uy * 4
        }
        x2={
          mx +
          uy * size +
          ux * 4
        }
        y2={
          my -
          ux * size +
          uy * 4
        }
      />

      <circle
        cx={mx}
        cy={my}
        r="4"
        fill="white"
        stroke="#f43f5e"
        strokeWidth="2"
      />
    </g>
  );
}


/* ============================================================
   ROUTE ARROW
============================================================ */

function RouteArrow({
  source,
  target,
}) {
  const dx =
    target.x - source.x;

  const dy =
    target.y - source.y;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy
    );

  if (!length) {
    return null;
  }

  const ux =
    dx / length;

  const uy =
    dy / length;

  const x =
    target.x -
    ux * 30;

  const y =
    target.y -
    uy * 30;

  const size = 6;

  const leftX =
    x -
    ux * size +
    uy * size;

  const leftY =
    y -
    uy * size -
    ux * size;

  const rightX =
    x -
    ux * size -
    uy * size;

  const rightY =
    y -
    uy * size +
    ux * size;

  return (
    <polygon
      points={`${x},${y} ${leftX},${leftY} ${rightX},${rightY}`}
      fill="#059669"
      opacity=".95"
    />
  );
}


/* ============================================================
   NODE DETAILS
============================================================ */

function NodeDetails({
  node,
  details,
  range,
  onClose,
}) {
  const neighbors =
    details?.neighbors ||
    [];

  const status =
    node.status ||
    "online";

  const isolated =
    status === "isolated" ||
    node.isolated === true;

  const statusClass =
    isolated
      ? "bg-rose-50 text-rose-700"
      : status ===
        "online"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
        "warning"
      ? "bg-amber-50 text-amber-700"
      : status ===
        "recovering"
      ? "bg-blue-50 text-blue-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className="absolute top-4 right-4 w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30">

      {/* HEADER */}

      <div
        className={`p-4 border-b border-slate-100 ${
          isolated
            ? "bg-rose-50/70"
            : status ===
              "recovering"
            ? "bg-blue-50/70"
            : "bg-slate-50/80"
        }`}
      >

        <div className="flex items-start justify-between">

          <div>

            <div className="flex items-center gap-2">

              <h3 className="font-bold text-slate-900">
                {node.label ||
                  node.id}
              </h3>

              <span
                className={`h-2 w-2 rounded-full ${
                  isolated
                    ? "bg-rose-500"
                    : status ===
                      "online"
                    ? "bg-emerald-500"
                    : status ===
                      "warning"
                    ? "bg-amber-500"
                    : status ===
                      "recovering"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />

            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-1">
              {node.id}
            </p>

          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      </div>


      {/* BODY */}

      <div className="p-4 space-y-4">

        {/* STATUS */}

        <div className="flex items-center justify-between">

          <span className="text-xs font-medium text-slate-500">
            Node status
          </span>

          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${statusClass}`}
          >
            {isolated
              ? "ISOLATED"
              : status}
          </span>

        </div>


        {/* RECOVERY STATE */}

        {node.recoveryState &&
          node.recoveryState !==
            "stable" && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2">

              {status ===
              "recovering" ? (
                <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5 text-blue-600" />
              )}

              <span className="text-xs font-semibold text-blue-800">
                {formatRecoveryState(
                  node.recoveryState
                )}
              </span>

            </div>

            {node.failureProbability >
              0 && (
              <div className="mt-2">

                <div className="flex justify-between text-[10px]">

                  <span className="text-blue-600">
                    Failure probability
                  </span>

                  <strong className="text-blue-800">
                    {Number(
                      node.failureProbability
                    ).toFixed(1)}
                    %
                  </strong>

                </div>

                <div className="h-1.5 bg-white rounded-full mt-1 overflow-hidden">

                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Number(
                          node.failureProbability
                        ) || 0
                      )}%`,
                    }}
                  />

                </div>

              </div>
            )}

          </div>
        )}


        {/* FAULT */}

        {node.fault && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-100 p-3">

            <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5" />

            <div>

              <p className="text-xs font-semibold text-rose-800">
                Fault detected
              </p>

              <p className="text-[11px] text-rose-600 mt-0.5">
                {formatFault(
                  node.fault
                )}
              </p>

            </div>
          </div>
        )}


        {/* ISOLATION */}

        {isolated && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">

            <div className="flex items-center gap-2">

              <Unplug className="h-4 w-4 text-rose-600" />

              <div>
                <p className="text-xs font-bold text-rose-800">
                  Node isolated
                </p>

                <p className="text-[10px] text-rose-600 mt-0.5">
                  Traffic is being redirected through the alternate MANET route.
                </p>
              </div>

            </div>

          </div>
        )}


        {/* TELEMETRY */}

        <div className="pt-3 border-t border-slate-100 space-y-3">

          <TelemetryRow
            icon={Battery}
            label="Battery"
            value={`${Math.round(
              node.battery ?? 0
            )}%`}
          />

          <TelemetryRow
            icon={Cpu}
            label="CPU Load"
            value={`${Math.round(
              node.cpu ?? 0
            )}%`}
          />

          <TelemetryRow
            icon={Signal}
            label="RSSI"
            value={`${node.rssi ?? -55} dBm`}
          />

          <TelemetryRow
            icon={Wifi}
            label="Radio Range"
            value={`${range} m`}
          />

          <TelemetryRow
            icon={Network}
            label="Neighbors"
            value={
              isolated
                ? 0
                : neighbors.length
            }
          />

          <TelemetryRow
            icon={Route}
            label="Routing"
            value={
              isolated
                ? "Isolated"
                : neighbors.length >
                  0
                ? "Multi-hop"
                : "Disconnected"
            }
          />

        </div>


        {/* NEIGHBORS */}

        <div className="pt-3 border-t border-slate-100">

          <div className="flex items-center justify-between mb-2">

            <span className="text-xs font-semibold text-slate-700">
              Nearby peers
            </span>

            <span className="text-[10px] text-slate-400">
              {isolated
                ? 0
                : neighbors.length}{" "}
              nodes
            </span>

          </div>

          {!isolated &&
          neighbors.length >
            0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">

              {neighbors.map(
                (neighbor) => {

                  const link =
                    details.links.find(
                      (item) =>
                        item.source ===
                          neighbor.id ||
                        item.target ===
                          neighbor.id
                    );

                  return (
                    <div
                      key={
                        neighbor.id
                      }
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-50"
                    >

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            neighbor.status ===
                            "online"
                              ? "bg-emerald-500"
                              : neighbor.status ===
                                "warning"
                              ? "bg-amber-500"
                              : neighbor.status ===
                                "recovering"
                              ? "bg-blue-500"
                              : "bg-rose-500"
                          }`}
                        />

                        <span className="text-[11px] text-slate-600">
                          {neighbor.id}
                        </span>

                      </div>

                      <span className="text-[10px] text-slate-400">
                        {link
                          ? `${link.distance ?? "—"}m`
                          : "—"}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-rose-500 bg-rose-50 rounded-lg p-2.5">

              <CircleDot className="h-3.5 w-3.5" />

              {isolated
                ? "Node currently isolated"
                : "No nearby peers"}

            </div>
          )}

        </div>


        {/* POSITION */}

        <div className="pt-3 border-t border-slate-100">

          <TelemetryRow
            icon={Navigation}
            label="Position"
            value={`${Math.round(
              node.x ?? 0
            )}, ${Math.round(
              node.y ?? 0
            )}`}
          />

        </div>


        <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-semibold transition">

          <Settings2 className="h-3.5 w-3.5" />

          Configure Node

        </button>

      </div>
    </div>
  );
}


/* ============================================================
   WORKFLOW ROW
============================================================ */

function WorkflowRow({
  label,
  active,
  done,
}) {
  return (
    <div className="flex items-center gap-2">

      <div
        className={`h-4 w-4 rounded-full flex items-center justify-center ${
          done
            ? "bg-emerald-500"
            : active
            ? "bg-blue-600"
            : "bg-slate-200"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
        ) : active ? (
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        ) : null}
      </div>

      <span
        className={`text-[10px] ${
          done
            ? "text-emerald-700 font-semibold"
            : active
            ? "text-blue-700 font-semibold"
            : "text-slate-400"
        }`}
      >
        {label}
      </span>

    </div>
  );
}


/* ============================================================
   STAT
============================================================ */

function TopologyStat({
  label,
  value,
  icon: Icon,
  danger = false,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 flex items-center gap-3">

      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          danger
            ? "bg-rose-50"
            : "bg-slate-50"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            danger
              ? "text-rose-600"
              : "text-blue-600"
          }`}
        />
      </div>

      <div>

        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>

        <p
          className={`text-sm font-bold mt-0.5 ${
            danger
              ? "text-rose-600"
              : "text-slate-800"
          }`}
        >
          {value}
        </p>

      </div>
    </div>
  );
}


/* ============================================================
   LEGEND
============================================================ */

function LegendItem({
  icon: Icon,
  circle,
  label,
  color,
}) {
  return (
    <div className="flex items-center gap-2.5">

      {Icon ? (
        <Icon
          className={`h-4 w-4 ${color}`}
        />
      ) : (
        <div
          className={`h-2.5 w-2.5 rounded-full ${circle}`}
        />
      )}

      <span className="text-[11px] font-medium text-slate-600">
        {label}
      </span>

    </div>
  );
}


/* ============================================================
   TELEMETRY
============================================================ */

function TelemetryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2 text-slate-500">

        <Icon className="h-3.5 w-3.5" />

        <span className="text-xs">
          {label}
        </span>

      </div>

      <span className="text-xs font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   HELPERS
============================================================ */

const WORKFLOW_ORDER = [
  "monitoring",
  "predicted",
  "classified",
  "isolating",
  "isolated",
  "rerouting",
  "route-computation",
  "traffic-migration",
  "recovering",
  "verification",
  "reintegration",
  "reintegrated",
  "stable",
];

function getWorkflowIndex(
  phase
) {
  if (!phase) return 0;

  const normalized =
    String(phase)
      .toLowerCase()
      .replaceAll("_", "-");

  const index =
    WORKFLOW_ORDER.indexOf(
      normalized
    );

  return index >= 0
    ? index
    : 0;
}

function getWorkflowLabel(
  phase
) {
  const map = {
    monitoring:
      "Real-time monitoring",

    predicted:
      "Failure predicted",

    classified:
      "Fault classified",

    recoverability:
      "Recoverability analysis",

    isolating:
      "Node isolation",

    isolated:
      "Node isolated",

    rerouting:
      "Alternative route computation",

    "route-computation":
      "Alternative route computation",

    "traffic-migration":
      "Traffic migration",

    recovering:
      "Background recovery",

    verification:
      "Health verification",

    reintegration:
      "Node reintegration",

    reintegrated:
      "Node reintegrated",

    stable:
      "Network stable",
  };

  return (
    map[phase] ||
    String(phase || "Monitoring")
      .replaceAll(
        "-",
        " "
      )
  );
}

function formatTime(
  seconds
) {
  const total =
    Math.max(
      0,
      Math.floor(
        seconds || 0
      )
    );

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;

  return [
    hours,
    minutes,
    secs,
  ]
    .map((value) =>
      String(value).padStart(
        2,
        "0"
      )
    )
    .join(":");
}

function formatRecoveryState(
  state
) {
  return getWorkflowLabel(
    state
  );
}

function formatFault(
  fault
) {
  const map = {
    LINK_DEGRADATION:
      "Wireless link degradation",

    NODE_FAILURE:
      "Node failure",

    CONGESTION:
      "Network congestion",

    SOFTWARE_FAILURE:
      "Software failure",

    HARDWARE_FAILURE:
      "Hardware failure",

    BATTERY_FAILURE:
      "Battery failure",

    ROUTING_FAILURE:
      "Routing failure",
  };

  return (
    map[fault] ||
    String(fault || "Unknown fault")
      .replaceAll(
        "_",
        " "
      )
  );
}