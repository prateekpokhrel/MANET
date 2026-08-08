import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout & Auth
import Layout from './components/Layout'; // Update path if you put it elsewhere
import Login from './pages/Login';

// Import all your individual pages
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Node from './pages/Node';
import Topology from './pages/Topology';
import AIAnalysis from './pages/AIAnalysis';
import Recoverability from './pages/Recoverability';
import RecoveryLogs from './pages/RecoveryLogs';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] antialiased selection:bg-blue-100 selection:text-blue-900">
      <BrowserRouter>
        <Routes>
          {/* Redirect base URL to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Standalone Login Page (No Sidebar) */}
          <Route path="/login" element={<Login />} />
          
          {/* Application Routes - Wrapped in the Layout (Sidebar & Header) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/topology" element={<Topology />} />
            <Route path="/node" element={<Node />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/analysis" element={<AIAnalysis />} />
            <Route path="/recoverability" element={<Recoverability />} />
            <Route path="/logs" element={<RecoveryLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}