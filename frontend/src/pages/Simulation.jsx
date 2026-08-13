import React from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Gauge,
  Network,
  Package,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Route,
  Settings2,
  ShieldCheck,
  Square,
  Wifi,
  Zap,
} from "lucide-react";

import {
  useManetSimulation,
} from "../context/ManetSimulationContext";

/*
|--------------------------------------------------------------------------
| SIMULATION
|--------------------------------------------------------------------------
| The simulation page is now a consumer/controller of the shared
| ManetSimulationContext.
|
| IMPORTANT:
| - Simulation.jsx does NOT create a second simulation engine.
| - Simulation.jsx does NOT maintain a second node/link state.
| - The provider owns mobility, radio links, metrics and AI workflow.
| - Topology.jsx, Dashboard.jsx and AI pages therefore see the same state.
|--------------------------------------------------------------------------
*/

export default function Simulation() {
  const {
    nodes,
    links,
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

    aiWorkflow,
    currentAIStep,
    aiSteps,

    failurePrediction,
    aiMetrics,
    recoverabilityMetrics,

    recoveryLogs,
    aiAlerts,

    startAIWorkflow,
    pauseAIWorkflow,
    resetAIWorkflow,
  } = useManetSimulation();

  const deliveryRate =
    networkMetrics.generatedPackets > 0
      ? (
          (networkMetrics.deliveredPackets /
            networkMetrics.generatedPackets) *
          100
        ).toFixed(1)
      : "0.0";

  const workflowProgress =
    aiSteps?.length
      ? Math.min(
          100,
          ((aiWorkflow.stepIndex + 1) /
            aiSteps.length) *
            100
        )
      : 0;

  const targetNode =
    nodes.find(
      (node) =>
        node.id ===
        aiWorkflow.targetNodeId
    ) || null;

  const handleStart =
    () => {
      if (
        engineState ===
        "stopped"
      ) {
        resetSimulation();
      }

      startSimulation();
    };

  const handleReset =
    () => {
      resetSimulation();
      resetAIWorkflow();
    };

  return (
    <div className="h-full flex flex-col space-y-5">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              MANET Simulation
            </h1>

            <StatusBadge
              state={
                engineState
              }
            />

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Configure, execute and monitor the shared MANET simulation engine.
          </p>

        </div>


        {/* SIMULATION CONTROLS */}

        <div className="flex flex-wrap items-center gap-2">

          <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500">
            {formatTime(
              simulationTime
            )}
          </div>

          <button
            onClick={
              handleReset
            }
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          {engineState ===
            "running" && (
            <>
              <button
                onClick={
                  pauseSimulation
                }
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause
              </button>

              <button
                onClick={
                  stopSimulation
                }
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </button>
            </>
          )}

          {engineState !==
            "running" && (
            <button
              onClick={
                handleStart
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <Play className="h-3.5 w-3.5" />
              {engineState ===
              "paused"
                ? "Resume"
                : "Start Simulation"}
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          LIVE METRICS
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <RuntimeMetric
          label="Packet Delivery"
          value={`${deliveryRate}%`}
          icon={Package}
          status={
            Number(
              deliveryRate
            ) >= 95
              ? "good"
              : "warning"
          }
        />

        <RuntimeMetric
          label="Throughput"
          value={`${networkMetrics.throughput ?? 0} kbps`}
          icon={Activity}
          status="good"
        />

        <RuntimeMetric
          label="Average Latency"
          value={`${networkMetrics.averageLatency ?? 0} ms`}
          icon={Clock3}
          status={
            networkMetrics.averageLatency <
            50
              ? "good"
              : "warning"
          }
        />

        <RuntimeMetric
          label="Active Links"
          value={
            networkMetrics.activeLinks ??
            links.length
          }
          icon={Network}
          status="good"
        />

      </div>


      {/* =====================================================
          AI RECOVERY STATUS
      ===================================================== */}

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-100">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BrainCircuit className="h-[18px] w-[18px] text-indigo-600" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-sm font-semibold text-slate-900">
                    Autonomous AI Recovery
                  </h2>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      aiWorkflow.running
                        ? "bg-blue-50 text-blue-700"
                        : aiWorkflow.completedAt
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {aiWorkflow.running
                      ? "Running"
                      : aiWorkflow.completedAt
                      ? "Completed"
                      : "Standby"}
                  </span>

                </div>

                <p className="text-xs text-slate-500 mt-0.5">
                  Failure prediction → isolation → rerouting → recovery → reintegration.
                </p>

              </div>

            </div>


            <div className="flex items-center gap-2">

              {!aiWorkflow.running ? (
                <button
                  onClick={() =>
                    startAIWorkflow(
                      failurePrediction?.nodeId ||
                        "MN-07"
                    )
                  }
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Run AI Recovery
                </button>
              ) : (
                <button
                  onClick={
                    pauseAIWorkflow
                  }
                  className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Pause AI
                </button>
              )}

              <button
                onClick={
                  resetAIWorkflow
                }
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset AI
              </button>

            </div>

          </div>

        </div>


        <div className="p-5">

          {/* CURRENT STEP */}

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

            <div className="flex-1">

              <div className="flex items-center justify-between mb-2">

                <div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Current AI Step
                  </span>

                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentAIStep?.label ||
                      "Network Monitoring"}
                  </h3>

                </div>

                <span className="text-xs font-bold text-slate-600">
                  {Math.round(
                    workflowProgress
                  )}
                  %
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">

                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${workflowProgress}%`,
                  }}
                />

              </div>

              <p className="text-xs text-slate-500 mt-2">
                {currentAIStep?.description}
              </p>

            </div>


            {/* TARGET */}

            <div className="lg:w-64 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">

              <div className="flex items-center justify-between">

                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Target Node
                </span>

                <Radio className="h-3.5 w-3.5 text-indigo-500" />

              </div>

              <div className="flex items-center justify-between mt-1">

                <span className="text-sm font-bold text-slate-800">
                  {targetNode?.id ||
                    failurePrediction?.nodeId ||
                    "MN-07"}
                </span>

                <NodeStatusPill
                  status={
                    targetNode?.status ||
                    "warning"
                  }
                />

              </div>

            </div>

          </div>


          {/* WORKFLOW STEPS */}

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">

            {aiSteps.map(
              (step, index) => {

                const completed =
                  index <
                  aiWorkflow.stepIndex;

                const current =
                  index ===
                  aiWorkflow.stepIndex;

                return (
                  <div
                    key={
                      step.key
                    }
                    className={`rounded-lg border px-3 py-2.5 transition ${
                      current
                        ? "border-indigo-200 bg-indigo-50"
                        : completed
                        ? "border-emerald-100 bg-emerald-50/50"
                        : "border-slate-200 bg-white"
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          current
                            ? "bg-indigo-600 text-white"
                            : completed
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[9px] font-bold">
                            {index +
                              1}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-semibold leading-tight ${
                          current
                            ? "text-indigo-700"
                            : completed
                            ? "text-emerald-700"
                            : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-5">


        {/* ===================================================
            SIMULATION PARAMETERS
        =================================================== */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Settings2 className="h-[18px] w-[18px] text-blue-600" />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Simulation Parameters
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Changes apply directly to the shared simulation engine.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5 space-y-6">

            <ParameterSlider
              label="Simulation Speed"
              description="Controls how quickly the shared mobility engine advances."
              value={
                simulationSpeed
              }
              min={0.25}
              max={4}
              step={0.25}
              suffix="×"
              onChange={
                setSimulationSpeed
              }
            />

            <ParameterSlider
              label="Radio Transmission Range"
              description="Maximum distance at which two nodes can establish a radio link."
              value={
                radioRange
              }
              min={90}
              max={220}
              step={5}
              suffix=" m"
              onChange={
                setRadioRange
              }
            />

            <ParameterSlider
              label="Packet Rate"
              description="Synthetic application traffic generated by the network."
              value={
                packetRate
              }
              min={100}
              max={1200}
              step={50}
              suffix=" pkt/s"
              onChange={
                setPacketRate
              }
            />


            {/* ENGINE STATE */}

            <div className="pt-4 border-t border-slate-100">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      engineState ===
                      "running"
                        ? "bg-emerald-500 animate-pulse"
                        : engineState ===
                          "paused"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                  />

                  <span className="text-xs font-semibold text-slate-700">
                    Simulation Engine
                  </span>

                </div>

                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {engineState}
                </span>

              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">

                <MiniStat
                  label="Nodes"
                  value={
                    nodes.length
                  }
                  icon={Network}
                />

                <MiniStat
                  label="Links"
                  value={
                    links.length
                  }
                  icon={Wifi}
                />

                <MiniStat
                  label="Range"
                  value={`${radioRange}m`}
                  icon={Radio}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            NETWORK HEALTH
        =================================================== */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Network Health
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Current shared runtime state.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5 space-y-3">

            <HealthRow
              label="Active Nodes"
              value={
                nodes.filter(
                  (node) =>
                    node.status !==
                    "isolated"
                ).length
              }
              icon={Network}
            />

            <HealthRow
              label="Degraded Links"
              value={
                networkMetrics.degradedLinks ??
                0
              }
              icon={AlertTriangle}
              warning={
                (networkMetrics.degradedLinks ??
                  0) > 0
              }
            />

            <HealthRow
              label="Isolated Nodes"
              value={
                networkMetrics.isolatedNodes ??
                0
              }
              icon={ShieldCheck}
              warning={
                (networkMetrics.isolatedNodes ??
                  0) > 0
              }
            />

            <HealthRow
              label="Average Neighbors"
              value={
                networkMetrics.averageNeighbors ??
                0
              }
              icon={Route}
            />

            <HealthRow
              label="Packet Loss"
              value={`${networkMetrics.packetLossRate ?? 0}%`}
              icon={Package}
              warning={
                (networkMetrics.packetLossRate ??
                  0) > 5
              }
            />

            <HealthRow
              label="Average Battery"
              value={`${networkMetrics.averageBattery ?? 0}%`}
              icon={Zap}
            />

            <HealthRow
              label="Average CPU"
              value={`${networkMetrics.averageCpu ?? 0}%`}
              icon={Gauge}
            />

          </div>

        </section>

      </div>


      {/* =====================================================
          FAILURE PREDICTION + EVENT LOG
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-5">


        {/* FAILURE PREDICTION */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <BrainCircuit className="h-[18px] w-[18px] text-rose-600" />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Failure Prediction
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Current AI prediction for the target node.
                </p>

              </div>

            </div>

          </div>


          <div className="p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Target
                </p>

                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {failurePrediction?.nodeId ||
                    "MN-07"}
                </p>

              </div>

              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">
                {failurePrediction?.riskLevel ||
                  "High"}{" "}
                Risk
              </span>

            </div>


            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs text-slate-500">
                  Failure probability
                </span>

                <span className="text-sm font-bold text-rose-600">
                  {failurePrediction?.probability ??
                    0}
                  %
                </span>

              </div>

              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">

                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      failurePrediction?.probability ??
                        0
                    )}%`,
                  }}
                />

              </div>

            </div>


            <div className="grid grid-cols-2 gap-2 mt-5">

              <InfoBox
                label="Fault Type"
                value={
                  failurePrediction?.faultType ||
                  "Link Degradation"
                }
              />

              <InfoBox
                label="Confidence"
                value={`${failurePrediction?.confidence ?? 0}%`}
              />

            </div>


            <div className="grid grid-cols-2 gap-2 mt-2">

              <InfoBox
                label="Model Confidence"
                value={`${aiMetrics?.modelConfidence ?? 0}%`}
              />

              <InfoBox
                label="Success Rate"
                value={`${recoverabilityMetrics?.autonomousSuccessRate ?? 0}%`}
              />

            </div>

          </div>

        </section>


        {/* EVENT LOG */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Activity className="h-[18px] w-[18px] text-slate-600" />
                </div>

                <div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Recovery Activity
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    AI actions and network recovery events.
                  </p>

                </div>

              </div>

              <span className="text-[10px] font-bold text-slate-400">
                {recoveryLogs?.length ??
                  0}{" "}
                EVENTS
              </span>

            </div>

          </div>


          <div className="p-4">

            {(recoveryLogs?.length ??
              0) > 0 ? (
              <div className="space-y-2 max-h-[310px] overflow-y-auto">

                {recoveryLogs.map(
                  (
                    event,
                    index
                  ) => (
                    <div
                      key={
                        event.id ||
                        index
                      }
                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            event.severity ===
                            "success"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {event.severity ===
                          "success" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {event.action}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {event.node}
                          </p>

                        </div>

                      </div>

                      <div className="text-right shrink-0">

                        <p className="text-[10px] font-mono text-slate-400">
                          {event.time}
                        </p>

                        <p
                          className={`text-[9px] font-bold uppercase mt-0.5 ${
                            event.status ===
                            "Completed"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {event.status}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No recovery activity yet.
              </div>
            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          ACTIVE ALERTS
      ===================================================== */}

      {(aiAlerts?.length ??
        0) > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-[18px] w-[18px] text-amber-600" />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  AI Alerts
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Prediction alerts generated by the shared AI workflow.
                </p>

              </div>

            </div>

          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            {aiAlerts.slice(
              0,
              6
            ).map(
              (alert) => (
                <div
                  key={
                    alert.id
                  }
                  className={`rounded-lg border px-3 py-3 ${
                    alert.status ===
                    "resolved"
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-rose-100 bg-rose-50/50"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-slate-800">
                      {alert.nodeId}
                    </span>

                    <span
                      className={`text-[9px] font-bold uppercase ${
                        alert.status ===
                        "resolved"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {alert.status}
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-500 mt-1">
                    {alert.faultType}
                  </p>

                  <div className="flex items-center justify-between mt-2">

                    <span className="text-[10px] text-slate-400">
                      Probability
                    </span>

                    <strong className="text-[10px] text-slate-700">
                      {alert.probability}%
                    </strong>

                  </div>

                </div>
              )
            )}

          </div>

        </section>
      )}

    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  state,
}) {
  const config = {
    running: [
      "LIVE",
      "bg-emerald-50 border-emerald-100 text-emerald-700",
      "bg-emerald-500",
    ],
    paused: [
      "PAUSED",
      "bg-amber-50 border-amber-100 text-amber-700",
      "bg-amber-500",
    ],
    stopped: [
      "STOPPED",
      "bg-rose-50 border-rose-100 text-rose-700",
      "bg-rose-500",
    ],
    idle: [
      "STANDBY",
      "bg-slate-50 border-slate-200 text-slate-500",
      "bg-slate-400",
    ],
  };

  const [
    label,
    classes,
    dot,
  ] =
    config[state] ||
    config.idle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold ${classes}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dot} ${
          state === "running"
            ? "animate-pulse"
            : ""
        }`}
      />
      {label}
    </span>
  );
}


/* =========================================================
   RUNTIME METRIC
========================================================= */

function RuntimeMetric({
  label,
  value,
  icon: Icon,
  status = "good",
}) {
  const good =
    status ===
    "good";

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-3 flex items-center gap-3">

      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
          good
            ? "bg-blue-50"
            : "bg-amber-50"
        }`}
      >

        <Icon
          className={`h-4 w-4 ${
            good
              ? "text-blue-600"
              : "text-amber-600"
          }`}
        />

      </div>

      <div>

        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-800 mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   PARAMETER SLIDER
========================================================= */

function ParameterSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}) {
  return (
    <div>

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold text-slate-700">
            {label}
          </p>

          <p className="text-[10px] text-slate-400 mt-0.5 max-w-xl">
            {description}
          </p>

        </div>

        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold whitespace-nowrap">
          {value}
          {suffix}
        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full mt-4 accent-blue-600"
      />

      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">

      <div className="flex items-center gap-2">

        <Icon className="h-3.5 w-3.5 text-blue-500" />

        <span className="text-[10px] text-slate-400">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-800 mt-1">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   HEALTH ROW
========================================================= */

function HealthRow({
  label,
  value,
  icon: Icon,
  warning = false,
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">

      <div className="flex items-center gap-2">

        <Icon
          className={`h-3.5 w-3.5 ${
            warning
              ? "text-amber-500"
              : "text-slate-400"
          }`}
        />

        <span className="text-xs text-slate-600">
          {label}
        </span>

      </div>

      <span
        className={`text-xs font-bold ${
          warning
            ? "text-amber-600"
            : "text-slate-800"
        }`}
      >
        {value}
      </span>

    </div>
  );
}


/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">

      <p className="text-[9px] uppercase tracking-wide font-semibold text-slate-400">
        {label}
      </p>

      <p className="text-xs font-bold text-slate-800 mt-1">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   NODE STATUS
========================================================= */

function NodeStatusPill({
  status,
}) {
  const classes =
    status === "online"
      ? "bg-emerald-50 text-emerald-700"
      : status === "warning"
      ? "bg-amber-50 text-amber-700"
      : status === "recovering"
      ? "bg-blue-50 text-blue-700"
      : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${classes}`}
    >
      {status}
    </span>
  );
}


/* =========================================================
   TIME
========================================================= */

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
      (total % 3600) /
        60
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