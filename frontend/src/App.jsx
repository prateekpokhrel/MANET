import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Shared MANET simulation state
import { ManetSimulationProvider } from "./context/ManetSimulationContext";

// Layout & Auth
import Layout from "./components/Layout";
import Login from "./pages/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Node from "./pages/Node";
import Topology from "./pages/Topology";
import AIAnalysis from "./pages/AIAnalysis";
import Recoverability from "./pages/Recoverability";
import RecoveryLogs from "./pages/RecoveryLogs";
import Settings from "./pages/Settings";

/**
 * Application root.
 *
 * The ManetSimulationProvider is mounted once above all MANET pages so the
 * following screens use the same live simulation state:
 *
 * Simulation -> moves nodes / generates traffic / triggers failures
 * Topology   -> renders the same nodes, links and isolation state
 * Dashboard  -> renders telemetry, AI workflow and recovery state
 * AI pages   -> consume the same prediction/recovery information
 */
export default function App() {
  return (
    <ManetSimulationProvider>
      <div className="min-h-screen bg-[#F8FAFC] antialiased selection:bg-blue-100 selection:text-blue-900">
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            {/* Protected/application layout */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/topology"
                element={<Topology />}
              />

              <Route
                path="/node"
                element={<Node />}
              />

              <Route
                path="/simulation"
                element={<Simulation />}
              />

              <Route
                path="/analysis"
                element={<AIAnalysis />}
              />

              <Route
                path="/recoverability"
                element={<Recoverability />}
              />

              <Route
                path="/logs"
                element={<RecoveryLogs />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />
            </Route>

            {/* Unknown route */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ManetSimulationProvider>
  );
}