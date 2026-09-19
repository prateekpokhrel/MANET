import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Home from "./components/Home";

import Simulation from "./pages/Simulation";
import NetworkHealth from "./components/NetworkHealth";
import AIIntelligence from "./components/AIIntelligence";
import FaultRecovery from "./components/FaultRecovery";
import Alerts from "./components/Alerts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        {/* Main Dashboard */}
        <Route path="/home" element={<Home />} />

        {/* Network */}
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/network-health" element={<NetworkHealth />} />

        {/* AI & Recovery */}
        <Route path="/ai-intelligence" element={<AIIntelligence />} />
        <Route path="/fault-recovery" element={<FaultRecovery />} />

        {/* Notifications */}
        <Route path="/alerts" element={<Alerts />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}