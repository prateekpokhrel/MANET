import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Network,
  HeartPulse,
  BrainCircuit,
  ShieldAlert,
  Bell,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/home",
      icon: LayoutDashboard,
    },
    {
      name: "Simulation",
      path: "/simulation",
      icon: Network,
    },
    {
      name: "Network Health",
      path: "/network-health",
      icon: HeartPulse,
    },
    {
      name: "AI Intelligence",
      path: "/ai-intelligence",
      icon: BrainCircuit,
    },
    {
      name: "Faults & Recovery",
      path: "/faults-recovery",
      icon: ShieldAlert,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: Bell,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Network size={21} strokeWidth={2} />
        </div>

        <div className="sidebar-brand-text">
          <h2>Virtual MANET</h2>
          <span>AI Operations</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-navigation">
        <div className="sidebar-section-title">
          CONTROL CENTER
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                  className="sidebar-link-icon"
                />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot" />

          <div className="status-content">
            <span className="status-label">
              System Status
            </span>

            <span className="status-value">
              Operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;