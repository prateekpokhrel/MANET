import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  ServerCrash,
  ShieldAlert,
  X,
  Zap,
} from "lucide-react";

import {
  useManetSimulation,
} from "../context/ManetSimulationContext";

/*
|--------------------------------------------------------------------------
| AI FAILURE PREDICTION
|--------------------------------------------------------------------------
| This component now consumes the shared ManetSimulationContext.
|
| The previous version maintained its own static alert array and local
| alert lifecycle. That meant Dashboard/Simulation/Topology could display
| different AI states.
|
| The provider is the source of truth for:
|   - failurePrediction
|   - aiAlerts
|   - aiWorkflow
|   - recoveryLogs
|   - AI metrics
|   - node state
|
| This component is therefore a presentation + operator-action layer.
|--------------------------------------------------------------------------
*/

export default function AIfailurePrediction() {
  const {
    nodes,
    failurePrediction,
    aiAlerts,
    aiWorkflow,
    currentAIStep,
    aiSteps,
    aiMetrics,
    recoverabilityMetrics,
    recoveryLogs,

    startAIWorkflow,
    pauseAIWorkflow,
  } = useManetSimulation();

  const [monitoring, setMonitoring] =
    useState(true);

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [showLogs, setShowLogs] =
    useState(false);

  const [notificationStatus, setNotificationStatus] =
    useState({});

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE SHARED ALERTS
  |--------------------------------------------------------------------------
  */

  const alerts = useMemo(() => {
    const sharedAlerts =
      Array.isArray(aiAlerts)
        ? aiAlerts
        : [];

    return sharedAlerts.map(
      (alert, index) => {
        const targetNode =
          nodes.find(
            (node) =>
              node.id ===
              alert.nodeId
          );

        const resolved =
          alert.status ===
            "resolved" ||
          targetNode?.status ===
            "online" &&
            aiWorkflow.completedAt;

        const type =
          alert.severity ===
            "critical" ||
          alert.severity ===
            "high"
            ? "critical"
            : "warning";

        const actionType =
          alert.status ===
            "resolved"
            ? "completed"
            : "ai";

        return {
          id:
            alert.id ||
            `ALT-${index + 1}`,

          nodeId:
            alert.nodeId ||
            "MN-07",

          node:
            alert.node ||
            targetNode?.label ||
            alert.nodeId ||
            "MANET Node",

          category:
            alert.faultType ||
            "Network Fault",

          time:
            alert.timestamp ||
            "live",

          description:
            getAlertDescription(
              alert,
              targetNode,
              failurePrediction
            ),

          action:
            getAlertAction(
              alert,
              aiWorkflow,
              currentAIStep
            ),

          type,

          actionType,

          status:
            resolved
              ? "resolved"
              : alert.status ||
                "active",

          probability:
            alert.probability ??
            failurePrediction?.probability ??
            0,
        };
      }
    );
  }, [
    aiAlerts,
    nodes,
    failurePrediction,
    aiWorkflow,
    currentAIStep,
  ]);

  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.status !==
        "resolved"
    );

  const targetNode =
    nodes.find(
      (node) =>
        node.id ===
        (failurePrediction?.nodeId ||
          "MN-07")
    );

  const workflowProgress =
    aiSteps?.length
      ? Math.min(
          100,
          ((aiWorkflow.stepIndex + 1) /
            aiSteps.length) *
            100
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | OPERATOR ACTIONS
  |--------------------------------------------------------------------------
  */

  const notifyOperator = (
    alertId
  ) => {
    setNotificationStatus(
      (previous) => ({
        ...previous,
        [alertId]: true,
      })
    );
  };

  const handleRunRecovery = (
    nodeId
  ) => {
    if (
      aiWorkflow.running
    ) {
      return;
    }

    startAIWorkflow(
      nodeId ||
        failurePrediction?.nodeId ||
        "MN-07"
    );
  };

  const acknowledgeAlert = (
    alertId
  ) => {
    setNotificationStatus(
      (previous) => ({
        ...previous,
        [`ack-${alertId}`]: true,
      })
    );
  };

  return (
    <>
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">

            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-[18px] w-[18px] text-blue-600" />
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="text-[15px] font-semibold text-slate-900">
                  AI Failure Prediction
                </h2>

                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    monitoring
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      monitoring
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  {monitoring
                    ? "Monitoring"
                    : "Paused"}
                </span>

              </div>

              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Real-time fault detection and autonomous recovery response
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3 shrink-0">

            <div className="hidden md:block text-right">

              <p className="text-[9px] uppercase tracking-wide font-semibold text-slate-400">
                Model confidence
              </p>

              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {aiMetrics?.modelConfidence ??
                  failurePrediction?.confidence ??
                  0}
                %
              </p>

            </div>

            <button
              onClick={() =>
                setShowLogs(true)
              }
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View logs
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

          </div>

        </div>


        {/* =====================================================
            PRIMARY PREDICTION
        ===================================================== */}

        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Current prediction
                </span>

                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[9px] font-bold uppercase">
                  {failurePrediction?.riskLevel ||
                    "High"}{" "}
                  Risk
                </span>

                {failurePrediction?.status && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">
                    {failurePrediction.status}
                  </span>
                )}

              </div>

              <div className="flex flex-wrap items-end gap-3 mt-1">

                <h3 className="text-xl font-bold text-slate-900">
                  {failurePrediction?.nodeId ||
                    "MN-07"}
                </h3>

                <span className="text-xs text-slate-500 mb-1">
                  {targetNode?.label ||
                    "MANET Node 07"}
                </span>

              </div>

              <p className="text-xs text-slate-500 mt-1.5">
                Predicted fault:{" "}
                <span className="font-semibold text-slate-700">
                  {failurePrediction?.faultType ||
                    "Link Degradation"}
                </span>
              </p>

            </div>


            <div className="flex items-center gap-4">

              <div className="text-right">

                <p className="text-[9px] uppercase tracking-wide font-semibold text-slate-400">
                  Failure probability
                </p>

                <p className="text-2xl font-bold text-rose-600 leading-none mt-1">
                  {failurePrediction?.probability ??
                    0}
                  %
                </p>

              </div>

              <div className="w-32">

                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        failurePrediction?.probability ??
                          0
                      )}%`,
                    }}
                  />

                </div>

                <p className="text-[9px] text-slate-400 text-right mt-1">
                  {failurePrediction?.confidence ??
                    0}
                  % confidence
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            ALERTS
        ===================================================== */}

        <div>

          {alerts.length >
          0 ? (
            alerts.map(
              (alert) => (
                <AlertRow
                  key={
                    alert.id
                  }
                  alert={
                    alert
                  }
                  notified={
                    notificationStatus[
                      alert.id
                    ]
                  }
                  workflowRunning={
                    aiWorkflow.running
                  }
                  onNotify={() =>
                    notifyOperator(
                      alert.id
                    )
                  }
                  onSelect={() =>
                    setSelectedAlert(
                      alert
                    )
                  }
                  onRunRecovery={() =>
                    handleRunRecovery(
                      alert.nodeId
                    )
                  }
                />
              )
            )
          ) : (
            <EmptyAlerts />
          )}

        </div>


        {/* =====================================================
            AI WORKFLOW STATUS
        ===================================================== */}

        <div className="px-5 py-4 border-t border-slate-100">

          <div className="flex flex-col md:flex-row md:items-center gap-4">

            <div className="flex-1 min-w-0">

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <Activity className="h-3.5 w-3.5 text-indigo-500" />

                  <span className="text-xs font-semibold text-slate-700">
                    Autonomous Recovery
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
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

                <span className="text-[10px] font-bold text-slate-500">
                  {Math.round(
                    workflowProgress
                  )}
                  %
                </span>

              </div>

              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${workflowProgress}%`,
                  }}
                />

              </div>

              <p className="text-[10px] text-slate-400 mt-1.5 truncate">
                {currentAIStep?.label ||
                  "Network Monitoring"}
                {" — "}
                {currentAIStep?.description ||
                  "Monitoring node telemetry and network conditions."}
              </p>

            </div>


            <div className="flex items-center gap-2 shrink-0">

              {aiWorkflow.running ? (
                <button
                  onClick={
                    pauseAIWorkflow
                  }
                  className="px-3 py-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 transition"
                >
                  Pause AI
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleRunRecovery(
                      failurePrediction?.nodeId ||
                        "MN-07"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition"
                >
                  <Zap className="h-3 w-3" />
                  Run Recovery
                </button>
              )}

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">

          <button
            onClick={() =>
              setMonitoring(
                (previous) =>
                  !previous
              )
            }
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                monitoring
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            {monitoring
              ? "AI monitoring active"
              : "AI monitoring paused"}
          </button>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">

            <span>
              {activeAlerts.length} active
            </span>

            <span>
              {recoveryLogs?.length ??
                0} logs
            </span>

            <span className="hidden sm:inline">
              {recoverabilityMetrics?.autonomousSuccessRate ??
                0}
              % autonomous success
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          ALERT DETAILS
      ===================================================== */}

      {selectedAlert && (
        <AlertDetailsModal
          alert={
            selectedAlert
          }
          notified={
            notificationStatus[
              selectedAlert.id
            ]
          }
          acknowledged={
            notificationStatus[
              `ack-${selectedAlert.id}`
            ]
          }
          workflowRunning={
            aiWorkflow.running
          }
          onClose={() =>
            setSelectedAlert(
              null
            )
          }
          onNotify={() =>
            notifyOperator(
              selectedAlert.id
            )
          }
          onAcknowledge={() =>
            acknowledgeAlert(
              selectedAlert.id
            )
          }
          onRunRecovery={() =>
            handleRunRecovery(
              selectedAlert.nodeId
            )
          }
        />
      )}


      {/* =====================================================
          LOGS
      ===================================================== */}

      {showLogs && (
        <LogsModal
          alerts={
            alerts
          }
          recoveryLogs={
            recoveryLogs
          }
          onClose={() =>
            setShowLogs(false)
          }
          onSelect={(
            alert
          ) => {
            setShowLogs(
              false
            );
            setSelectedAlert(
              alert
            );
          }}
        />
      )}

    </>
  );
}


/* =========================================================
   ALERT ROW
========================================================= */

function AlertRow({
  alert,
  notified,
  workflowRunning,
  onNotify,
  onSelect,
  onRunRecovery,
}) {
  const isCritical =
    alert.type ===
    "critical";

  const isResolved =
    alert.status ===
    "resolved";

  return (
    <div
      onClick={
        onSelect
      }
      className={`px-5 py-4 transition cursor-pointer ${
        isResolved
          ? "opacity-60"
          : "hover:bg-slate-50/60"
      }`}
    >

      <div className="flex gap-3">

        <div
          className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center ${
            isCritical
              ? "bg-rose-50 text-rose-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {isCritical ? (
            <ServerCrash className="h-[17px] w-[17px]" />
          ) : (
            <AlertCircle className="h-[17px] w-[17px]" />
          )}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h4 className="text-sm font-semibold text-slate-900">
              {alert.node}
            </h4>

            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
              {alert.category}
            </span>

            {isResolved && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                Resolved
              </span>
            )}

            <span className="ml-auto text-[11px] text-slate-400">
              {alert.time}
            </span>

          </div>


          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {alert.description}
          </p>


          <div
            className={`mt-3 rounded-lg border px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              alert.actionType ===
              "ai"
                ? "bg-blue-50/50 border-blue-100"
                : "bg-slate-50 border-slate-200"
            }`}
          >

            <div
              className={`flex items-center gap-2 min-w-0 text-xs font-medium ${
                alert.actionType ===
                "ai"
                  ? "text-blue-700"
                  : "text-slate-600"
              }`}
            >

              {alert.actionType ===
              "ai" ? (
                <Activity className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              )}

              <span className="truncate">
                {alert.action}
              </span>

            </div>


            <div className="flex items-center gap-2 shrink-0">

              <span className="text-[9px] font-bold text-slate-400">
                {alert.probability}%
              </span>

              {!isResolved &&
                alert.actionType ===
                  "ai" && (
                  <button
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      onRunRecovery();
                    }}
                    disabled={
                      workflowRunning
                    }
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md transition ${
                      workflowRunning
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                    }`}
                  >
                    {workflowRunning
                      ? "AI Running"
                      : "AI Healing"}
                  </button>
                )}

              {alert.actionType !==
                "ai" &&
                !isResolved && (
                  <button
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      onNotify();
                    }}
                    disabled={
                      notified
                    }
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition ${
                      notified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {notified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Notified
                      </>
                    ) : (
                      <>
                        <Bell className="h-3 w-3" />
                        Notify
                      </>
                    )}
                  </button>
                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ALERT DETAILS MODAL
========================================================= */

function AlertDetailsModal({
  alert,
  notified,
  acknowledged,
  workflowRunning,
  onClose,
  onNotify,
  onAcknowledge,
  onRunRecovery,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px] p-4"
      onClick={
        onClose
      }
    >

      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                alert.type ===
                "critical"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {alert.type ===
              "critical" ? (
                <ServerCrash className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>

            <div>

              <h3 className="text-sm font-semibold text-slate-900">
                {alert.node}
              </h3>

              <p className="text-xs text-slate-500">
                {alert.category}
              </p>

            </div>

          </div>

          <button
            onClick={
              onClose
            }
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>

        </div>


        <div className="p-5 space-y-4">

          <div className="grid grid-cols-2 gap-2">

            <InfoCard
              label="Probability"
              value={`${alert.probability}%`}
            />

            <InfoCard
              label="Status"
              value={
                alert.status
              }
            />

          </div>


          <div>

            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Detection
            </p>

            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              {alert.description}
            </p>

          </div>


          <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3">

            <div className="flex items-center gap-2">

              <Activity className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-semibold text-blue-800">
                AI response
              </span>

            </div>

            <p className="text-xs text-blue-700/80 mt-2">
              {alert.action}
            </p>

          </div>


          <div className="flex items-center gap-2 text-xs text-slate-400">

            <Clock3 className="h-3.5 w-3.5" />

            Detected{" "}
            {alert.time}

          </div>

        </div>


        <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap justify-end gap-2">

          <button
            onClick={
              onClose
            }
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg border border-slate-200"
          >
            Close
          </button>

          <button
            onClick={
              onAcknowledge
            }
            className={`px-3 py-2 text-xs font-semibold rounded-lg ${
              acknowledged
                ? "bg-emerald-50 text-emerald-700"
                : "text-blue-700 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            {acknowledged
              ? "Acknowledged"
              : "Acknowledge"}
          </button>

          {alert.status !==
            "resolved" && (
            <button
              onClick={
                onRunRecovery
              }
              disabled={
                workflowRunning
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg"
            >
              <Zap className="h-3 w-3" />
              {workflowRunning
                ? "AI Running"
                : "Run Recovery"}
            </button>
          )}

          {alert.type ===
            "critical" &&
            !notified && (
              <button
                onClick={
                  onNotify
                }
                className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Notify Operator
              </button>
            )}

          {notified && (
            <span className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-3 w-3" />
              Operator Notified
            </span>
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   LOGS MODAL
========================================================= */

function LogsModal({
  alerts,
  recoveryLogs,
  onClose,
  onSelect,
}) {
  const combinedLogs =
    [
      ...(Array.isArray(
        alerts
      )
        ? alerts.map(
            (alert) => ({
              id: `alert-${alert.id}`,
              kind: "prediction",
              node:
                alert.node,
              action:
                alert.category,
              status:
                alert.status,
              time:
                alert.time,
              description:
                alert.description,
              alert,
            })
          )
        : []),

      ...(Array.isArray(
        recoveryLogs
      )
        ? recoveryLogs.map(
            (log) => ({
              id:
                log.id,
              kind: "recovery",
              node:
                log.node,
              action:
                log.action,
              status:
                log.status,
              time:
                log.time,
              description:
                "AI recovery workflow event.",
              alert: null,
            })
          )
        : []),
    ].slice(0, 30);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px] p-4"
      onClick={
        onClose
      }
    >

      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              AI Failure & Recovery Logs
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              Shared prediction alerts and autonomous recovery events
            </p>

          </div>

          <button
            onClick={
              onClose
            }
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>

        </div>


        <div className="max-h-[460px] overflow-y-auto">

          {combinedLogs.length >
          0 ? (
            combinedLogs.map(
              (log) => (
                <button
                  key={
                    log.id
                  }
                  onClick={() => {
                    if (
                      log.alert
                    ) {
                      onSelect(
                        log.alert
                      );
                    }
                  }}
                  className="w-full text-left px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition"
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.kind ===
                        "recovery"
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {log.kind ===
                      "recovery" ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {log.node}
                        </p>

                        <span className="text-[10px] text-slate-400 shrink-0">
                          {log.time}
                        </span>

                      </div>

                      <p className="text-xs font-medium text-slate-600 mt-1">
                        {log.action}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {log.description}
                      </p>

                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase shrink-0 ${
                        log.status ===
                        "Completed"
                          ? "text-emerald-600"
                          : log.status ===
                            "resolved"
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {log.status}
                    </span>

                    {log.alert && (
                      <ChevronRight className="h-4 w-4 text-slate-300 mt-1 shrink-0" />
                    )}

                  </div>

                </button>
              )
            )
          ) : (
            <div className="py-16 text-center">

              <Activity className="h-7 w-7 text-slate-300 mx-auto" />

              <p className="text-xs text-slate-400 mt-2">
                No AI events recorded yet.
              </p>

            </div>
          )}

        </div>


        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">

          <span className="text-xs text-slate-400">
            {combinedLogs.length} events
          </span>

          <button
            onClick={
              onClose
            }
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyAlerts() {
  return (
    <div className="px-5 py-10 text-center">

      <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">

        <CheckCircle2 className="h-5 w-5 text-emerald-600" />

      </div>

      <p className="text-sm font-semibold text-slate-700 mt-3">
        No active failure alerts
      </p>

      <p className="text-xs text-slate-400 mt-1">
        The shared AI monitoring engine has not reported an active prediction.
      </p>

    </div>
  );
}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
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
   ALERT DESCRIPTION
========================================================= */

function getAlertDescription(
  alert,
  targetNode,
  prediction
) {
  const fault =
    alert?.faultType ||
    prediction?.faultType ||
    "network degradation";

  const probability =
    alert?.probability ??
    prediction?.probability ??
    0;

  if (
    targetNode?.status ===
    "isolated"
  ) {
    return `AI has isolated ${targetNode.id} after detecting a high-risk ${fault.toLowerCase()} condition.`;
  }

  if (
    targetNode?.status ===
    "recovering"
  ) {
    return `Recovery actions are active for ${targetNode.id}. The AI workflow is verifying node health and connectivity.`;
  }

  if (
    alert?.status ===
    "resolved"
  ) {
    return `The predicted ${fault.toLowerCase()} condition was addressed and the affected node has returned to service.`;
  }

  return `AI detected a ${probability}% predicted failure probability associated with ${fault.toLowerCase()}.`;
}


/* =========================================================
   ALERT ACTION
========================================================= */

function getAlertAction(
  alert,
  workflow,
  currentStep
) {
  if (
    alert?.status ===
    "resolved"
  ) {
    return "Recovery completed and node reintegrated into the MANET.";
  }

  if (
    workflow?.running &&
    currentStep
  ) {
    return `${currentStep.label}: ${currentStep.description}`;
  }

  return "AI recovery workflow is available for this predicted fault.";
}