import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  Route,
  HeartPulse,
  Settings,
  Network,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/home",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Real-Time Monitoring",
      path: "/monitoring",
      icon: <Activity size={20} />,
    },
    {
      name: "AI Predictions",
      path: "/predictions",
      icon: <BrainCircuit size={20} />,
    },
    {
      name: "Fault Classification",
      path: "/classification",
      icon: <AlertTriangle size={20} />,
    },
    {
      name: "Recovery",
      path: "/recovery",
      icon: <ShieldCheck size={20} />,
    },
    {
      name: "Simulation",
      path: "/simulation",
      icon: <Network size={20} />,
    },
    {
      name: "Routing & Traffic",
      path: "/routing",
      icon: <Route size={20} />,
    },
    {
      name: "Network Health",
      path: "/health",
      icon: <HeartPulse size={20} />,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Network size={24} />
        </div>

        <div>
          <h2>Virtual MANET</h2>
          <span>AI Operations</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p>CONTROL CENTER</p>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <div className="status-indicator" />

          <div>
            <span>System Status</span>
            <strong>Operational</strong>
          </div>
        </div>

        <NavLink to="/settings" className="sidebar-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;