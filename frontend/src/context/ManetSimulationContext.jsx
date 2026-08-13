import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ManetSimulationContext = createContext(null);

/* =========================================================
   WORLD CONFIGURATION
========================================================= */

const WORLD = {
  width: 1000,
  height: 620,
  radioRange: 155,
};

/* =========================================================
   INITIAL MANET NODES
========================================================= */

const NODE_POSITIONS = [
  ["GW-01", "Gateway Alpha", "gateway", 120, 290, 0.12, -0.04, 96, 31],
  ["MN-02", "MANET Node 02", "mobile", 205, 215, 0.18, 0.11, 87, 42],
  ["MN-03", "MANET Node 03", "mobile", 310, 165, -0.12, 0.16, 78, 38],
  ["MN-04", "MANET Node 04", "mobile", 430, 205, 0.13, -0.11, 82, 45],
  ["MN-05", "MANET Node 05", "mobile", 535, 145, -0.16, 0.09, 73, 51],
  ["MN-06", "MANET Node 06", "mobile", 660, 190, 0.11, 0.13, 88, 29],
  ["MN-07", "MANET Node 07", "mobile", 790, 155, -0.13, 0.1, 69, 57],
  ["MN-08", "MANET Node 08", "mobile", 875, 255, -0.17, -0.08, 91, 34],
  ["MN-09", "MANET Node 09", "mobile", 760, 310, 0.15, -0.13, 61, 68],
  ["MN-10", "MANET Node 10", "mobile", 625, 300, -0.1, 0.14, 84, 43],
  ["MN-11", "MANET Node 11", "mobile", 475, 315, 0.17, -0.09, 76, 47],
  ["MN-12", "MANET Node 12", "mobile", 335, 290, -0.15, 0.1, 89, 33],
  ["MN-13", "MANET Node 13", "mobile", 210, 350, 0.1, -0.15, 71, 52],
  ["MN-14", "MANET Node 14", "mobile", 300, 410, 0.14, 0.08, 82, 36],
  ["MN-15", "MANET Node 15", "mobile", 435, 425, -0.12, -0.13, 64, 61],
  ["MN-16", "MANET Node 16", "mobile", 560, 400, 0.11, 0.12, 86, 39],
  ["MN-17", "MANET Node 17", "mobile", 700, 410, -0.16, 0.1, 75, 48],
  ["MN-18", "MANET Node 18", "mobile", 835, 390, 0.12, -0.12, 58, 72],
  ["MN-19", "MANET Node 19", "mobile", 880, 500, -0.14, -0.09, 90, 27],
  ["MN-20", "MANET Node 20", "mobile", 720, 520, 0.1, -0.15, 79, 44],
  ["MN-21", "MANET Node 21", "mobile", 565, 525, -0.13, 0.08, 83, 41],
  ["MN-22", "MANET Node 22", "mobile", 390, 515, 0.16, -0.1, 67, 58],
  ["MN-23", "MANET Node 23", "mobile", 220, 500, 0.09, 0.13, 74, 46],
  ["MN-24", "MANET Node 24", "mobile", 110, 420, -0.1, -0.11, 81, 35],
];

const INITIAL_NODES = NODE_POSITIONS.map(
  ([
    id,
    label,
    type,
    x,
    y,
    vx,
    vy,
    battery,
    cpu,
  ]) => ({
    id,
    label,
    type,
    x,
    y,
    vx,
    vy,
    battery,
    cpu,
    status:
      id === "MN-07" ||
      id === "MN-09" ||
      id === "MN-15" ||
      id === "MN-18"
        ? "warning"
        : "online",
    fault: null,
    failureProbability: 0,
    recoveryState: "stable",
    trafficRerouted: false,
  })
);

/* =========================================================
   AI WORKFLOW
========================================================= */

const AI_STEPS = [
  {
    key: "monitoring",
    label: "Network Monitoring",
    description:
      "Monitoring node telemetry and network conditions.",
  },

  {
    key: "prediction",
    label: "Failure Prediction",
    description:
      "AI detected a high probability of node failure.",
  },

  {
    key: "classification",
    label: "Fault Classification",
    description:
      "Predicted fault type is being classified.",
  },

  {
    key: "recoverability",
    label: "Recoverability Analysis",
    description:
      "Determining whether autonomous recovery is possible.",
  },

  {
    key: "isolation",
    label: "Node Isolation",
    description:
      "Affected node isolated from active traffic.",
  },

  {
    key: "route",
    label: "Alternative Route Discovery",
    description:
      "Searching the MANET for an alternative route.",
  },

  {
    key: "migration",
    label: "Traffic Migration",
    description:
      "Traffic migrated through an alternative route.",
  },

  {
    key: "recovery",
    label: "Background Recovery",
    description:
      "Recovery action executed on the affected node.",
  },

  {
    key: "verification",
    label: "Health Verification",
    description:
      "Post-recovery health checks are being performed.",
  },

  {
    key: "reintegration",
    label: "Node Reintegration",
    description:
      "Recovered node is rejoining the MANET.",
  },

  {
    key: "completed",
    label: "Recovery Completed",
    description:
      "Autonomous recovery completed successfully.",
  },
];

/* =========================================================
   PROVIDER
========================================================= */

export function ManetSimulationProvider({ children }) {
  /* -------------------------------------------------------
     NETWORK STATE
  ------------------------------------------------------- */

  const [nodes, setNodes] = useState(INITIAL_NODES);

  const [engineState, setEngineState] =
    useState("idle");

  const [simulationSpeed, setSimulationSpeed] =
    useState(1);

  const [radioRange, setRadioRange] =
    useState(WORLD.radioRange);

  const [packetRate, setPacketRate] =
    useState(500);

  const [simulationTime, setSimulationTime] =
    useState(0);

  /* -------------------------------------------------------
     AI STATE
  ------------------------------------------------------- */

  const [aiWorkflow, setAiWorkflow] = useState({
    running: false,
    stepIndex: 0,
    targetNodeId: "MN-07",
    startedAt: null,
    completedAt: null,
    phase: "idle",
    progress: 0,
  });

  const [recoveryState, setRecoveryState] = useState({
    active: false,
    nodeId: null,
    faultType: null,
    recoverable: true,
    phase: "idle",
    progress: 0,
    originalRoute: [],
    activeRoute: [],
  });

  const [networkEvents, setNetworkEvents] = useState([]);

  const [failurePrediction, setFailurePrediction] =
    useState({
      nodeId: "MN-07",
      probability: 91.4,
      riskLevel: "High",
      faultType: "Link Degradation",
      confidence: 94.2,
      status: "Predicted",
    });

  const [aiMetrics, setAiMetrics] = useState({
    modelConfidence: 94.2,
    falsePositiveRate: 1.8,
    predictionsToday: 27,
    successfulPredictions: 25,
  });

  const [recoverabilityMetrics, setRecoverabilityMetrics] =
    useState({
      mttr: 1.2,
      autonomousSuccessRate: 87.5,
      recoverableIncidents: 35,
      totalIncidents: 40,
    });

  const [recoveryLogs, setRecoveryLogs] = useState([
    {
      id: "EVT-9092",
      node: "Node-Beta-2",
      action: "Route Optimization",
      status: "Completed",
      time: "14:32:01",
      severity: "success",
    },
    {
      id: "EVT-9091",
      node: "Node-Alpha-7",
      action: "Background Recovery",
      status: "Failed",
      time: "14:28:11",
      severity: "danger",
    },
  ]);

  const [aiAlerts, setAiAlerts] = useState([
    {
      id: "ALT-001",
      nodeId: "MN-07",
      node: "MANET Node 07",
      probability: 91.4,
      faultType: "Link Degradation",
      severity: "high",
      status: "active",
      timestamp: "14:29:40",
    },
  ]);

  /* =======================================================
     CURRENT AI STEP
  ======================================================= */

  const currentAIStep =
    AI_STEPS[aiWorkflow.stepIndex] ||
    AI_STEPS[0];

  /* =======================================================
     NETWORK SIMULATION ENGINE
  ======================================================= */

  useEffect(() => {
    if (engineState !== "running") {
      return;
    }

    const timer = setInterval(() => {
      setSimulationTime(
        (previous) =>
          previous + 0.1 * simulationSpeed
      );

      setNodes((previousNodes) =>
        previousNodes.map((node) => {
          if (node.type === "gateway") {
            return node;
          }

          let x =
            node.x +
            node.vx *
              simulationSpeed;

          let y =
            node.y +
            node.vy *
              simulationSpeed;

          let vx = node.vx;
          let vy = node.vy;

          /* Boundary reflection */

          if (
            x < 45 ||
            x > WORLD.width - 45
          ) {
            vx = -vx;

            x = Math.max(
              45,
              Math.min(
                WORLD.width - 45,
                x
              )
            );
          }

          if (
            y < 45 ||
            y > WORLD.height - 45
          ) {
            vy = -vy;

            y = Math.max(
              45,
              Math.min(
                WORLD.height - 45,
                y
              )
            );
          }

          /* Slight mobility variation */

          vx +=
            (Math.random() - 0.5) *
            0.008;

          vy +=
            (Math.random() - 0.5) *
            0.008;

          vx = Math.max(
            -0.28,
            Math.min(0.28, vx)
          );

          vy = Math.max(
            -0.28,
            Math.min(0.28, vy)
          );

          /* Battery */

          const battery =
            Math.max(
              5,
              node.battery -
                Math.random() *
                  0.003
            );

          /* CPU */

          const cpu =
            Math.max(
              10,
              Math.min(
                95,
                node.cpu +
                  (Math.random() -
                    0.5) *
                    0.8
              )
            );

          return {
            ...node,
            x,
            y,
            vx,
            vy,
            battery,
            cpu,
          };
        })
      );
    }, 100);

    return () => clearInterval(timer);
  }, [
    engineState,
    simulationSpeed,
  ]);

  /* =======================================================
     RADIO LINKS
  ======================================================= */

  const links = useMemo(() => {
    const result = [];

    for (
      let i = 0;
      i < nodes.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < nodes.length;
        j++
      ) {
        const a = nodes[i];
        const b = nodes[j];

        if (
          ["offline", "isolated", "recovering"].includes(a.status) ||
          ["offline", "isolated", "recovering"].includes(b.status)
        ) {
          continue;
        }

        const dx =
          a.x - b.x;

        const dy =
          a.y - b.y;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        if (
          distance <=
          radioRange
        ) {
          const quality =
            1 -
            distance /
              radioRange;

          let qualityLevel =
            "good";

          if (
            quality >= 0.72
          ) {
            qualityLevel =
              "excellent";
          } else if (
            quality < 0.35
          ) {
            qualityLevel =
              "degraded";
          }

          if (
            a.status ===
              "warning" ||
            b.status ===
              "warning"
          ) {
            if (
              qualityLevel ===
              "excellent"
            ) {
              qualityLevel =
                "good";
            }
          }

          result.push({
            source: a.id,
            target: b.id,
            distance:
              Math.round(
                distance
              ),
            quality,
            qualityLevel,
          });
        }
      }
    }

    return result;
  }, [nodes, radioRange]);

  /* =======================================================
     NEIGHBORS
  ======================================================= */

  const neighbors = useMemo(() => {
    const map = {};

    nodes.forEach((node) => {
      map[node.id] = [];
    });

    links.forEach((link) => {
      map[link.source].push(
        link.target
      );

      map[link.target].push(
        link.source
      );
    });

    return map;
  }, [nodes, links]);

  /* =======================================================
     NETWORK METRICS
  ======================================================= */

  const networkMetrics = useMemo(() => {
    const activeLinks =
      links.length;

    const totalNeighbors =
      links.length * 2;

    const averageNeighbors =
      nodes.length
        ? totalNeighbors /
          nodes.length
        : 0;

    const degradedLinks =
      links.filter(
        (link) =>
          link.qualityLevel ===
          "degraded"
      ).length;

    const isolatedNodes =
      nodes.filter(
        (node) =>
          neighbors[node.id]
            ?.length === 0
      ).length;

    const generatedPackets =
      Math.floor(
        simulationTime *
          packetRate
      );

    const packetLossRate =
      Math.min(
        18,
        Math.max(
          0.5,
          degradedLinks /
              Math.max(
                1,
                activeLinks
              ) *
              8 +
            isolatedNodes *
              0.8
        )
      );

    const droppedPackets =
      Math.floor(
        generatedPackets *
          (packetLossRate /
            100)
      );

    const deliveredPackets =
      Math.max(
        0,
        generatedPackets -
          droppedPackets
      );

    const throughput =
      deliveredPackets > 0
        ? Math.round(
            (packetRate *
              (deliveredPackets /
                Math.max(
                  1,
                  generatedPackets
                )) *
              1024 *
              8) /
              1000
          )
        : 0;

    const averageLatency =
      Math.round(
        18 +
          averageNeighbors *
            2 +
          degradedLinks *
            0.5
      );

    const averageBattery =
      nodes.length
        ? nodes.reduce(
            (sum, node) =>
              sum +
              node.battery,
            0
          ) /
          nodes.length
        : 0;

    const averageCpu =
      nodes.length
        ? nodes.reduce(
            (sum, node) =>
              sum +
              node.cpu,
            0
          ) /
          nodes.length
        : 0;

    return {
      activeLinks,
      averageNeighbors:
        Number(
          averageNeighbors.toFixed(
            1
          )
        ),
      degradedLinks,
      isolatedNodes,
      generatedPackets,
      deliveredPackets,
      droppedPackets,
      packetLossRate:
        Number(
          packetLossRate.toFixed(
            2
          )
        ),
      throughput,
      averageLatency,
      averageBattery:
        Number(
          averageBattery.toFixed(
            1
          )
        ),
      averageCpu:
        Number(
          averageCpu.toFixed(
            1
          )
        ),
    };
  }, [
    links,
    neighbors,
    nodes,
    simulationTime,
    packetRate,
  ]);

  /* =======================================================
     AI WORKFLOW HELPERS
  ======================================================= */

  const addNetworkEvent = ({
    type = "system",
    nodeId = null,
    message,
  }) => {
    if (!message) return;

    setNetworkEvents((previous) => [
      {
        id: `NET-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        type,
        nodeId,
        message,
      },
      ...previous,
    ].slice(0, 20));
  };

  const addRecoveryLog = ({
    action,
    node = "MANET Node 07",
    status = "Completed",
  }) => {
    const now =
      new Date();

    const time =
      now.toLocaleTimeString(
        "en-GB",
        {
          hour12: false,
        }
      );

    setRecoveryLogs(
      (previous) => [
        {
          id: `EVT-${Math.floor(
            1000 +
              Math.random() *
                8999
          )}`,
          node,
          action,
          status,
          time,
          severity:
            status ===
            "Completed"
              ? "success"
              : "danger",
        },
        ...previous,
      ].slice(0, 20)
    );
  };

  /* =======================================================
     APPLY AI STEP TO NODE
  ======================================================= */

  const applyAIWorkflowStep = (stepIndex, targetNodeId) => {
    const step = AI_STEPS[stepIndex];
    if (!step) return;

    const targetNode = nodes.find((node) => node.id === targetNodeId);
    const nodeLabel = targetNode?.label || `MANET Node ${targetNodeId}`;

    const stateByStep = {
      monitoring: { status: "warning", recoveryState: "monitoring", fault: null },
      prediction: { status: "warning", recoveryState: "predicted", fault: "LINK_DEGRADATION" },
      classification: { status: "warning", recoveryState: "classified", fault: "LINK_DEGRADATION" },
      recoverability: { status: "warning", recoveryState: "recoverability", fault: "LINK_DEGRADATION" },
      isolation: { status: "isolated", recoveryState: "isolating", fault: "LINK_DEGRADATION" },
      route: { status: "isolated", recoveryState: "rerouting", fault: "LINK_DEGRADATION" },
      migration: { status: "isolated", recoveryState: "traffic-migration", fault: "LINK_DEGRADATION" },
      recovery: { status: "recovering", recoveryState: "recovering", fault: "LINK_DEGRADATION" },
      verification: { status: "recovering", recoveryState: "verification", fault: "LINK_DEGRADATION" },
      reintegration: { status: "online", recoveryState: "reintegration", fault: null },
      completed: { status: "online", recoveryState: "stable", fault: null },
    };

    const nodeState = stateByStep[step.key] || { status: "online", recoveryState: "stable", fault: null };

    setNodes((previous) => previous.map((node) =>
      node.id === targetNodeId
        ? {
            ...node,
            ...nodeState,
            failureProbability:
              step.key === "completed" ? 0 :
              ["prediction", "classification", "recoverability"].includes(step.key) ? 91.4 : node.failureProbability,
            trafficRerouted: ["migration", "recovery", "verification"].includes(step.key),
          }
        : node
    ));

    const progress = Math.round((stepIndex / Math.max(1, AI_STEPS.length - 1)) * 100);
    setAiWorkflow((previous) => ({ ...previous, stepIndex, phase: step.key, progress }));
    setRecoveryState((previous) => ({ ...previous, active: step.key !== "completed", nodeId: targetNodeId, faultType: "Link Degradation", recoverable: true, phase: step.key, progress }));

    const logMap = {
      prediction: "Fault Prediction", classification: "Fault Classification", recoverability: "Recoverability Analysis",
      isolation: "Node Isolation", route: "Alternative Route Discovery", migration: "Traffic Migration",
      recovery: "Background Recovery", verification: "Health Verification", reintegration: "Node Reintegration",
      completed: "Route Optimization",
    };
    if (logMap[step.key]) addRecoveryLog({ action: logMap[step.key], node: nodeLabel });

    const eventMap = {
      monitoring: "Real-time node telemetry monitoring started.",
      prediction: "Failure probability crossed the warning threshold.",
      classification: "Link degradation classified as recoverable.",
      recoverability: "AI recovery decision: autonomous recovery allowed.",
      isolation: "Faulty node isolated from active traffic.",
      route: "Alternative route computed around the affected node.",
      migration: "Traffic migrated to the alternative route.",
      recovery: "Background recovery action executed.",
      verification: "Post-recovery health verification started.",
      reintegration: "Recovered node is rejoining the mesh.",
      completed: "Recovery completed and route optimized.",
    };
    addNetworkEvent({
      type: step.key === "completed" ? "success" : ["prediction", "isolation"].includes(step.key) ? "warning" : "recovery",
      nodeId: targetNodeId,
      message: `${nodeLabel}: ${eventMap[step.key] || step.label}`,
    });

    if (["route", "migration"].includes(step.key)) {
      setRecoveryState((previous) => ({
        ...previous,
        originalRoute: previous.originalRoute.length ? previous.originalRoute : ["MN-02", targetNodeId, "MN-10"],
        activeRoute: ["MN-02", "MN-05", "MN-08", "MN-10"],
      }));
    }

    if (step.key === "prediction") {
      setAiAlerts((previous) => [{
        id: `ALT-${Date.now()}`, nodeId: targetNodeId, node: nodeLabel, probability: 91.4,
        faultType: "Link Degradation", severity: "high", status: "active", timestamp: new Date().toLocaleTimeString(),
      }, ...previous].slice(0, 10));
    }

    if (step.key === "completed") {
      setAiAlerts((previous) => previous.map((alert) => alert.nodeId === targetNodeId ? { ...alert, status: "resolved" } : alert));
    }
  };

  /* =======================================================
     RUN DUMMY AI WORKFLOW
  ======================================================= */

  const startAIWorkflow = (targetNodeId = "MN-07") => {
    const targetNode = nodes.find((node) => node.id === targetNodeId);
    if (!targetNode || targetNode.type === "gateway") return;

    setAiWorkflow({ running: true, stepIndex: 0, targetNodeId, startedAt: Date.now(), completedAt: null, phase: "monitoring", progress: 0 });
    setRecoveryState({ active: true, nodeId: targetNodeId, faultType: "Link Degradation", recoverable: true, phase: "monitoring", progress: 0, originalRoute: ["MN-02", targetNodeId, "MN-10"], activeRoute: ["MN-02", targetNodeId, "MN-10"] });
    setFailurePrediction({ nodeId: targetNodeId, probability: 91.4, riskLevel: "High", faultType: "Link Degradation", confidence: 94.2, status: "Predicted" });
    addNetworkEvent({ type: "ai", nodeId: targetNodeId, message: `${targetNode.label}: AI failure analysis initiated.` });
    addRecoveryLog({ action: "AI Monitoring Started", node: targetNode.label });
  };

  /* =======================================================
     AI WORKFLOW TIMER
  ======================================================= */

  useEffect(() => {
    if (
      !aiWorkflow.running
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        const nextStep =
          aiWorkflow.stepIndex +
          1;

        if (
          nextStep >=
          AI_STEPS.length
        ) {
          setAiWorkflow((previous) => ({
            ...previous,
            running: false,
            stepIndex: AI_STEPS.length - 1,
            phase: "completed",
            progress: 100,
            completedAt: Date.now(),
          }));

          setRecoveryState((previous) => ({ ...previous, active: false, phase: "completed", progress: 100 }));

          setRecoverabilityMetrics(
            (previous) => ({
              ...previous,
              recoverableIncidents:
                previous.recoverableIncidents +
                1,
              totalIncidents:
                previous.totalIncidents +
                1,
              autonomousSuccessRate:
                Number(
                  (
                    ((previous.recoverableIncidents +
                      1) /
                      (previous.totalIncidents +
                        1)) *
                    100
                  ).toFixed(1)
                ),
            })
          );

          return;
        }

        setAiWorkflow(
          (previous) => ({
            ...previous,
            stepIndex:
              nextStep,
          })
        );

        applyAIWorkflowStep(
          nextStep,
          aiWorkflow.targetNodeId
        );
      }, 1500);

    return () =>
      clearTimeout(timer);
  }, [
    aiWorkflow.running,
    aiWorkflow.stepIndex,
    aiWorkflow.targetNodeId,
  ]);

  /* =======================================================
     AI WORKFLOW CONTROL
  ======================================================= */

  const pauseAIWorkflow = () => {
    setAiWorkflow((previous) => ({ ...previous, running: false, phase: "paused" }));
    setRecoveryState((previous) => ({ ...previous, phase: "paused" }));
    addNetworkEvent({ type: "warning", nodeId: aiWorkflow.targetNodeId, message: "AI recovery workflow paused by operator." });
  };

  const resetAIWorkflow = () => {
    setAiWorkflow({ running: false, stepIndex: 0, targetNodeId: "MN-07", startedAt: null, completedAt: null, phase: "idle", progress: 0 });
    setRecoveryState({ active: false, nodeId: null, faultType: null, recoverable: true, phase: "idle", progress: 0, originalRoute: [], activeRoute: [] });
    setNetworkEvents([]);
    setNodes(INITIAL_NODES.map((node) => ({ ...node, fault: null, failureProbability: 0, recoveryState: "stable", trafficRerouted: false })));
    setFailurePrediction({ nodeId: "MN-07", probability: 91.4, riskLevel: "High", faultType: "Link Degradation", confidence: 94.2, status: "Predicted" });
  };

  /* =======================================================
     SIMULATION CONTROLS
  ======================================================= */

  const startSimulation = () => {
    setEngineState(
      "running"
    );
  };

  const pauseSimulation = () => {
    setEngineState(
      "paused"
    );
  };

  const stopSimulation = () => {
    setEngineState(
      "stopped"
    );
  };

  const resetSimulation = () => {
    setEngineState("idle");

    setSimulationTime(0);

    setNodes(
      INITIAL_NODES.map(
        (node) => ({
          ...node,
        })
      )
    );

    resetAIWorkflow();
  };

  /* =======================================================
     PROVIDER VALUE
  ======================================================= */

  const value = {
    /* Network */

    nodes,
    setNodes,

    links,
    neighbors,

    engineState,
    simulationTime,

    simulationSpeed,
    radioRange,
    packetRate,

    setSimulationSpeed,
    setRadioRange,
    setPacketRate,

    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,

    networkMetrics,

    world: WORLD,

    /* AI */

    aiWorkflow,
    currentAIStep,
    aiSteps: AI_STEPS,

    recoveryState,
    networkEvents,

    failurePrediction,
    setFailurePrediction,

    aiMetrics,
    setAiMetrics,

    recoverabilityMetrics,
    setRecoverabilityMetrics,

    recoveryLogs,
    setRecoveryLogs,

    aiAlerts,
    setAiAlerts,

    startAIWorkflow,
    pauseAIWorkflow,
    resetAIWorkflow,

    /* Helpers */

    addRecoveryLog,
  };

  return (
    <ManetSimulationContext.Provider
      value={value}
    >
      {children}
    </ManetSimulationContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useManetSimulation() {
  const context =
    useContext(
      ManetSimulationContext
    );

  if (!context) {
    throw new Error(
      "useManetSimulation must be used inside ManetSimulationProvider"
    );
  }

  return context;
}