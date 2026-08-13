import React, { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Route,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";

import AIFailurePrediction from "./AIfailurePrediction";
import { useManetSimulation } from "../context/ManetSimulationContext";

export default function Dashboard() {
  const {
    nodes = [],
    links = [],
    engineState = "idle",
    simulationTime = 0,
    networkMetrics = {},

    startSimulation,
    pauseSimulation,
    resetSimulation,

    aiWorkflow = {
      running: false,
      stepIndex: 0,
      targetNodeId: "MN-07",
      completedAt: null,
    },

    currentAIStep,
    aiSteps = [],

    failurePrediction = {},
    aiMetrics = {},
    recoverabilityMetrics = {},
    recoveryLogs = [],

    startAIWorkflow,
    pauseAIWorkflow,
  } = useManetSimulation();

  /* =========================================================
     DERIVED NETWORK METRICS
  ========================================================= */

  const averageBattery = useMemo(() => {
    if (!nodes.length) return 0;

    return (
      nodes.reduce(
        (sum, node) =>
          sum + Number(node.battery || 0),
        0
      ) / nodes.length
    );
  }, [nodes]);

  const averageCpu = useMemo(() => {
    if (!nodes.length) return 0;

    return (
      nodes.reduce(
        (sum, node) =>
          sum + Number(node.cpu || 0),
        0
      ) / nodes.length
    );
  }, [nodes]);

  const averageLinkQuality = useMemo(() => {
    if (!links.length) return 0;

    return (
      links.reduce(
        (sum, link) =>
          sum + Number(link.quality || 0),
        0
      ) / links.length
    );
  }, [links]);

  /*
   * This is a simulated RSSI estimate derived from
   * the current mesh-link quality. It is not physical
   * RF telemetry.
   */
  const averageRssi = Math.round(
    -100 + averageLinkQuality * 45
  );

  const packetLoss =
    Number(
      networkMetrics.packetLossRate ?? 0
    );

  const activeNodes = nodes.filter(
    (node) =>
      node.status !== "isolated" &&
      node.status !== "offline"
  ).length;

  const warningNodes = nodes.filter(
    (node) =>
      node.status === "warning" ||
      node.status === "degraded" ||
      node.status === "recovering"
  ).length;

  const isolatedNodes = nodes.filter(
    (node) =>
      node.status === "isolated" ||
      node.status === "offline"
  ).length;

  const recoveringNodes = nodes.filter(
    (node) =>
      node.status === "recovering"
  ).length;

  /* =========================================================
     AI WORKFLOW
  ========================================================= */

  const workflowIndex = Math.max(
    0,
    Math.min(
      aiWorkflow.stepIndex ?? 0,
      Math.max(0, aiSteps.length - 1)
    )
  );

  const workflowStep =
    currentAIStep ||
    aiSteps[workflowIndex] ||
    {
      label: "Network Monitoring",
      description:
        "Monitoring node telemetry and network conditions.",
    };

  const workflowProgress =
    aiSteps.length > 0
      ? Math.min(
          100,
          ((workflowIndex + 1) /
            aiSteps.length) *
            100
        )
      : 0;

  const recoveryCompleted =
    Boolean(
      aiWorkflow.completedAt
    ) &&
    !aiWorkflow.running;

  const targetNode = nodes.find(
    (node) =>
      node.id ===
      (failurePrediction.nodeId ||
        aiWorkflow.targetNodeId)
  );

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleRunAIRecovery = () => {
    if (aiWorkflow.running) return;

    startAIWorkflow(
      failurePrediction.nodeId ||
        aiWorkflow.targetNodeId ||
        "MN-07"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full max-w-[1700px] mx-auto px-1 pb-8 space-y-5">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <span
              className={`h-2 w-2 rounded-full ${
                engineState === "running"
                  ? "bg-emerald-500 animate-pulse"
                  : aiWorkflow.running
                  ? "bg-blue-500 animate-pulse"
                  : "bg-slate-400"
              }`}
            />

            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Autonomous MANET Control
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Network Intelligence Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Real-time network monitoring, AI failure prediction and autonomous recovery.
          </p>

        </div>


        {/* SIMULATION CONTROLS */}

        <div className="flex items-center gap-2 flex-wrap">

          <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
            Simulation:
            <span className="ml-1 font-semibold text-slate-900">
              {Number(
                simulationTime
              ).toFixed(1)}
              s
            </span>
          </div>

          <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 capitalize">
            State:
            <span className="ml-1 font-semibold text-slate-900">
              {engineState}
            </span>
          </div>

          {engineState ===
          "running" ? (
            <button
              onClick={
                pauseSimulation
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </button>
          ) : (
            <button
              onClick={
                startSimulation
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              <Play className="h-3.5 w-3.5" />
              Start Simulation
            </button>
          )}

          <button
            onClick={
              resetSimulation
            }
            className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

        </div>

      </div>


      {/* =====================================================
          NETWORK STATUS
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <StatusPill
          icon={Radio}
          label="Active Nodes"
          value={`${activeNodes}/${nodes.length}`}
          tone="blue"
        />

        <StatusPill
          icon={Wifi}
          label="Active Links"
          value={
            networkMetrics.activeLinks ??
            links.length
          }
          tone="green"
        />

        <StatusPill
          icon={AlertTriangle}
          label="Warning Nodes"
          value={warningNodes}
          tone={
            warningNodes > 0
              ? "amber"
              : "green"
          }
        />

        <StatusPill
          icon={ShieldCheck}
          label="Isolated Nodes"
          value={isolatedNodes}
          tone={
            isolatedNodes > 0
              ? "red"
              : "green"
          }
        />

      </div>


      {/* =====================================================
          PRIMARY METRICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <MetricCard
          title="Avg Battery Life"
          value={`${averageBattery.toFixed(1)}%`}
          icon={Battery}
          trend={
            averageBattery < 60
              ? "Low"
              : "Healthy"
          }
          trendType={
            averageBattery < 60
              ? "danger"
              : "good"
          }
          progress={
            averageBattery
          }
          color="blue"
        />

        <MetricCard
          title="Network CPU Load"
          value={`${averageCpu.toFixed(1)}%`}
          icon={Cpu}
          trend={
            averageCpu > 75
              ? "High load"
              : "Normal"
          }
          trendType={
            averageCpu > 75
              ? "danger"
              : "good"
          }
          progress={averageCpu}
          color="green"
        />

        <MetricCard
          title="Avg RSSI"
          value={`${averageRssi} dBm`}
          icon={Wifi}
          trend={
            averageRssi > -65
              ? "Stable"
              : "Weak"
          }
          trendType={
            averageRssi > -65
              ? "good"
              : "danger"
          }
          progress={Math.min(
            100,
            Math.max(
              0,
              averageRssi + 100
            )
          )}
          color="indigo"
        />

        <MetricCard
          title="Packet Loss"
          value={`${packetLoss.toFixed(
            2
          )}%`}
          icon={Activity}
          trend={
            packetLoss < 2
              ? "Stable"
              : "Elevated"
          }
          trendType={
            packetLoss < 2
              ? "good"
              : "danger"
          }
          progress={Math.min(
            100,
            packetLoss * 20
          )}
          color="red"
        />

      </div>


      {/* =====================================================
          AI FAILURE + SELF HEALING
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,1fr)] gap-5">

        <AIFailurePrediction />


        {/* SELF-HEALING PIPELINE */}

        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-start justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Zap className="h-[18px] w-[18px] text-emerald-600" />
                </div>

                <div>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    Self-Healing Pipeline
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Autonomous network recovery workflow
                  </p>

                </div>

              </div>


              <button
                onClick={
                  handleRunAIRecovery
                }
                disabled={
                  aiWorkflow.running
                }
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition ${
                  aiWorkflow.running
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <BrainCircuit className="h-3.5 w-3.5" />

                {aiWorkflow.running
                  ? "Running..."
                  : recoveryCompleted
                  ? "Run Again"
                  : "Run AI Recovery"}
              </button>

            </div>

          </div>


          {/* CURRENT STEP */}

          <div className="px-5 pt-4">

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 min-w-0">

                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      aiWorkflow.running
                        ? "bg-blue-500 animate-pulse"
                        : recoveryCompleted
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />

                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {workflowStep.label}
                  </span>

                </div>

                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                  Step{" "}
                  {workflowIndex + 1}/
                  {Math.max(
                    aiSteps.length,
                    1
                  )}
                </span>

              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                {workflowStep.description}
              </p>

              <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    recoveryCompleted
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${workflowProgress}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* PIPELINE */}

          <div className="px-5 py-5">

            <div className="relative">

              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />

              {aiSteps.map(
                (
                  step,
                  index
                ) => {

                  const isCurrent =
                    index ===
                    workflowIndex;

                  const isCompleted =
                    index <
                    workflowIndex;

                  return (
                    <PipelineItem
                      key={
                        step.key ||
                        index
                      }
                      event={
                        step.label
                      }
                      desc={
                        step.description
                      }
                      status={
                        isCurrent
                          ? aiWorkflow.running
                            ? "running"
                            : recoveryCompleted
                            ? "success"
                            : "pending"
                          : isCompleted
                          ? "success"
                          : "pending"
                      }
                      last={
                        index ===
                        aiSteps.length - 1
                      }
                    />
                  );
                }
              )}

            </div>

          </div>


          {/* PIPELINE METRICS */}

          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100">

            <div className="grid grid-cols-3 gap-3">

              <SmallMetric
                label="Recovery Success"
                value={`${Number(
                  recoverabilityMetrics.autonomousSuccessRate ??
                    0
                ).toFixed(1)}%`}
                tone="green"
              />

              <SmallMetric
                label="MTTR"
                value={`${recoverabilityMetrics.mttr ?? 0}s`}
              />

              <SmallMetric
                label="Recovering"
                value={recoveringNodes}
                tone={
                  recoveringNodes > 0
                    ? "blue"
                    : "slate"
                }
              />

            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          AI INTELLIGENCE
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <IntelligenceCard
          icon={BrainCircuit}
          title="Failure Prediction"
          value={`${Number(
            failurePrediction.probability ??
              0
          ).toFixed(1)}%`}
          subtitle={`Risk: ${
            failurePrediction.riskLevel ||
            "Unknown"
          }`}
          description={`Predicted fault: ${
            failurePrediction.faultType ||
            "Not classified"
          } on ${
            failurePrediction.nodeId ||
            "—"
          }`}
          progress={
            failurePrediction.probability ??
            0
          }
          tone="blue"
        />

        <IntelligenceCard
          icon={Activity}
          title="AI Model Confidence"
          value={`${Number(
            aiMetrics.modelConfidence ??
              0
          ).toFixed(1)}%`}
          subtitle={`${aiMetrics.predictionsToday ?? 0} predictions today`}
          description={`${aiMetrics.successfulPredictions ?? 0} successful predictions`}
          progress={
            aiMetrics.modelConfidence ??
            0
          }
          tone="indigo"
        />

        <IntelligenceCard
          icon={ShieldCheck}
          title="Autonomous Recoverability"
          value={`${Number(
            recoverabilityMetrics.autonomousSuccessRate ??
              0
          ).toFixed(1)}%`}
          subtitle={`${recoverabilityMetrics.recoverableIncidents ?? 0}/${recoverabilityMetrics.totalIncidents ?? 0} incidents`}
          description="Issues resolved without human intervention"
          progress={
            recoverabilityMetrics.autonomousSuccessRate ??
            0
          }
          tone="green"
        />

      </div>


      {/* =====================================================
          RECENT RECOVERY EVENTS
      ===================================================== */}

      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Route className="h-[18px] w-[18px] text-blue-600" />
            </div>

            <div>

              <h2 className="text-[15px] font-semibold text-slate-900">
                Recent Recovery Events
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous recovery activity
              </p>

            </div>

          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {recoveryLogs.length} events
          </span>

        </div>


        <div className="divide-y divide-slate-100">

          {recoveryLogs.length >
          0 ? (
            recoveryLogs
              .slice(0, 6)
              .map(
                (
                  log,
                  index
                ) => (
                  <RecoveryRow
                    key={
                      log.id ??
                      index
                    }
                    log={log}
                  />
                )
              )
          ) : (
            <div className="px-5 py-10 text-center">

              <Route className="h-6 w-6 text-slate-300 mx-auto" />

              <p className="text-xs text-slate-400 mt-2">
                No recovery events recorded yet.
              </p>

            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          LIVE NETWORK SNAPSHOT
      ===================================================== */}

      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-100">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-[15px] font-semibold text-slate-900">
                Live MANET Snapshot
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Current node health and topology state
              </p>

            </div>

            <span className="text-[10px] font-semibold text-slate-400">
              Target:{" "}
              {targetNode?.id ||
                failurePrediction.nodeId ||
                "—"}
            </span>

          </div>

        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-5">

          <SnapshotItem
            label="Nodes"
            value={
              nodes.length
            }
          />

          <SnapshotItem
            label="Links"
            value={
              networkMetrics.activeLinks ??
              links.length
            }
          />

          <SnapshotItem
            label="Degraded Links"
            value={
              networkMetrics.degradedLinks ??
              links.filter(
                (link) =>
                  link.qualityLevel ===
                  "degraded"
              ).length
            }
          />

          <SnapshotItem
            label="Packet Loss"
            value={`${packetLoss.toFixed(
              2
            )}%`}
          />

          <SnapshotItem
            label="Throughput"
            value={`${networkMetrics.throughput ?? 0} kbps`}
          />

          <SnapshotItem
            label="Latency"
            value={`${networkMetrics.averageLatency ?? 0} ms`}
          />

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  icon: Icon,
  label,
  value,
  tone,
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green:
      "bg-emerald-50 text-emerald-600",
    amber:
      "bg-amber-50 text-amber-600",
    red: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">

      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          tones[tone] ||
          tones.blue
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-900 mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType,
  progress,
  color,
}) {
  const bars = {
    blue: "bg-blue-600",
    green:
      "bg-emerald-500",
    indigo:
      "bg-indigo-500",
    red:
      "bg-rose-500",
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">

      <div className="flex justify-between items-start mb-4">

        <div>

          <p className="text-sm font-medium text-slate-500 mb-1">
            {title}
          </p>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>

        </div>

        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">

          <Icon className="h-5 w-5 text-slate-400" />

        </div>

      </div>


      <div className="flex items-center justify-between gap-4">

        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">

          <div
            className={`h-full ${
              bars[color] ||
              bars.blue
            } rounded-full transition-all duration-500`}
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  Number(
                    progress || 0
                  )
                )
              )}%`,
            }}
          />

        </div>

        <span
          className={`text-xs font-medium ${
            trendType === "danger"
              ? "text-rose-600"
              : "text-emerald-600"
          }`}
        >
          {trend}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   PIPELINE ITEM
========================================================= */

function PipelineItem({
  event,
  desc,
  status,
  last,
}) {
  return (
    <div
      className={`relative flex gap-4 ${
        !last
          ? "pb-5"
          : ""
      }`}
    >

      <div className="flex flex-col items-center shrink-0 z-10">

        <div
          className={`h-5 w-5 rounded-full flex items-center justify-center border-2 bg-white ${
            status ===
            "success"
              ? "border-emerald-500 text-emerald-500"
              : status ===
                "running"
              ? "border-blue-500 text-blue-500"
              : "border-slate-300 text-slate-300"
          }`}
        >
          {status ===
          "success" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : status ===
            "running" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </div>

      </div>


      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <h4
            className={`text-xs font-semibold ${
              status ===
              "running"
                ? "text-blue-700"
                : status ===
                  "success"
                ? "text-slate-800"
                : "text-slate-500"
            }`}
          >
            {event}
          </h4>

          {status ===
            "running" && (
            <span className="text-[9px] font-bold uppercase text-blue-600">
              Active
            </span>
          )}

        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
          {desc}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   INTELLIGENCE CARD
========================================================= */

function IntelligenceCard({
  icon: Icon,
  title,
  value,
  subtitle,
  description,
  progress,
  tone,
}) {
  const iconTones = {
    blue:
      "bg-blue-50 text-blue-600",
    indigo:
      "bg-indigo-50 text-indigo-600",
    green:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">

      <div className="flex items-start gap-3">

        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center ${
            iconTones[tone] ||
            iconTones.blue
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-semibold text-slate-700">
            {title}
          </p>

          <div className="flex items-baseline gap-2 mt-1">

            <span className="text-xl font-bold text-slate-900">
              {value}
            </span>

            <span className="text-[10px] text-slate-400">
              {subtitle}
            </span>

          </div>

        </div>

      </div>


      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
        {description}
      </p>


      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">

        <div
          className={`h-full rounded-full ${
            tone === "green"
              ? "bg-emerald-500"
              : tone === "indigo"
              ? "bg-indigo-500"
              : "bg-blue-500"
          }`}
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                Number(
                  progress || 0
                )
              )
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   RECOVERY ROW
========================================================= */

function RecoveryRow({
  log,
}) {
  const success =
    String(
      log.status ||
        ""
    ).toLowerCase() ===
    "completed";

  return (
    <div className="px-5 py-3.5 flex items-center gap-3">

      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          success
            ? "bg-emerald-50 text-emerald-600"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        {success ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Route className="h-4 w-4" />
        )}
      </div>


      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="text-xs font-semibold text-slate-800">
            {log.action ||
              log.event ||
              "Recovery event"}
          </p>

          {log.node && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              {log.node}
            </span>
          )}

        </div>

        <p className="text-[10px] text-slate-400 mt-0.5">
          {log.description ||
            "Autonomous recovery workflow event"}
        </p>

      </div>


      <div className="text-right shrink-0">

        <p
          className={`text-[9px] font-bold uppercase ${
            success
              ? "text-emerald-600"
              : "text-slate-400"
          }`}
        >
          {log.status ||
            "Recorded"}
        </p>

        {log.time && (
          <p className="text-[9px] text-slate-400 mt-0.5">
            {log.time}
          </p>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   SMALL METRIC
========================================================= */

function SmallMetric({
  label,
  value,
  tone = "slate",
}) {
  const tones = {
    green:
      "text-emerald-600",
    blue:
      "text-blue-600",
    slate:
      "text-slate-900",
  };

  return (
    <div>

      <span className="block text-[9px] text-slate-400 uppercase tracking-wide">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          tones[tone] ||
          tones.slate
        }`}
      >
        {value}
      </span>

    </div>
  );
}


/* =========================================================
   SNAPSHOT ITEM
========================================================= */

function SnapshotItem({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">

      <p className="text-[9px] uppercase tracking-wide font-semibold text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-slate-800 mt-1">
        {value}
      </p>

    </div>
  );
}