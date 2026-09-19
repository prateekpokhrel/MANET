import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  KeyRound,
  LockKeyhole,
  LogIn,
  Network,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "./Login.css";

const initialNodes = [
  { id: "01", name: "NODE-01" },
  { id: "02", name: "NODE-02" },
  { id: "03", name: "NODE-03" },
  { id: "04", name: "NODE-04" },
  { id: "05", name: "NODE-05" },
  { id: "06", name: "NODE-06" },
];

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("options");

  const [formData, setFormData] = useState({
    nodeId: "",
    nodeName: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });

  const [networkState, setNetworkState] = useState("stable");
  const [faultNode, setFaultNode] = useState("03");

  // --------------------------------------------------
  // Simulated MANET network animation
  // --------------------------------------------------

  useEffect(() => {
    let timer;

    const runSimulation = () => {
      setNetworkState("stable");

      timer = setTimeout(() => {
        const selectedNode =
          initialNodes[Math.floor(Math.random() * initialNodes.length)].id;

        setFaultNode(selectedNode);
        setNetworkState("detecting");

        timer = setTimeout(() => {
          setNetworkState("fault");

          timer = setTimeout(() => {
            setNetworkState("repairing");

            timer = setTimeout(() => {
              setNetworkState("rejoining");

              timer = setTimeout(() => {
                setNetworkState("stable");

                timer = setTimeout(runSimulation, 5500);
              }, 3500);
            }, 3500);
          }, 3000);
        }, 2200);
      }, 6500);
    };

    runSimulation();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

 

    if (mode === "registry") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      if (!formData.adminKey.trim()) {
        alert("Admin key is required.");
        return;
      }

      console.log("New Node Registration:", {
        nodeName: formData.nodeName,
        nodeId: formData.nodeId,
        adminKey: formData.adminKey,
        password: formData.password,
      });

      alert("Node registered successfully!");

      // Updated application entry point
      navigate("/home");

      return;
    }

 

    console.log("Admin / Rejoin:", {
      nodeId: formData.nodeId,
      password: formData.password,
    });

    // Updated application entry point
    navigate("/home");
  };

 

  const resetForm = () => {
    setFormData({
      nodeId: "",
      nodeName: "",
      password: "",
      confirmPassword: "",
      adminKey: "",
    });

    setMode("options");
  };

  return (
    <div className="auth-page">

     

      <section className="auth-visual">

        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <Network size={21} />
          </div>

          <div>
            <h1>MANET</h1>
            <p>Mobile Ad-Hoc Network</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="visual-content">
          <span className="eyebrow">
            DECENTRALIZED NETWORK
          </span>

          <h2>
            Connect.
            <br />
            Communicate.
            <br />
            <span>Securely.</span>
          </h2>

          <p>
            Secure node management and communication for your
            mobile ad-hoc network.
          </p>
        </div>

        {/* Network Topology */}
        <div className={`topology topology-${networkState}`}>

          <div className="connection c1" />
          <div className="connection c2" />
          <div className="connection c3" />
          <div className="connection c4" />
          <div className="connection c5" />
          <div className="connection c6" />

          {/* Node 01 */}
          <div
            className={`network-node n1 ${
              faultNode === "01" ? "fault-node" : ""
            }`}
          >
            <span>01</span>
            <div className="node-core" />
          </div>

          {/* Node 02 */}
          <div
            className={`network-node n2 ${
              faultNode === "02" ? "fault-node" : ""
            }`}
          >
            <span>02</span>
            <div className="node-core" />
          </div>

          {/* Node 03 */}
          <div
            className={`network-node n3 ${
              faultNode === "03" ? "fault-node" : ""
            }`}
          >
            <span>03</span>
            <div className="node-core" />
          </div>

          {/* Node 04 */}
          <div
            className={`network-node n4 ${
              faultNode === "04" ? "fault-node" : ""
            }`}
          >
            <span>04</span>
            <div className="node-core" />
          </div>

          {/* Node 05 */}
          <div
            className={`network-node n5 ${
              faultNode === "05" ? "fault-node" : ""
            }`}
          >
            <span>05</span>
            <div className="node-core" />
          </div>

          {/* Node 06 */}
          <div
            className={`network-node n6 ${
              faultNode === "06" ? "fault-node" : ""
            }`}
          >
            <span>06</span>
            <div className="node-core" />
          </div>

          {/* Network Core */}
          <div className="network-core">
            <div className="core-ring" />
            <Network size={26} />
            <span>M</span>
          </div>
        </div>

        {/* Network Status */}
        <div className="visual-footer">
          <span className="online-dot" />

          <span>LIVE NETWORK</span>

          <strong>
            {networkState === "stable"
              ? "OPERATIONAL"
              : "MONITORING"}
          </strong>
        </div>
      </section>

     

      <section className="auth-section">
        <div className="auth-container">

          {/* Mobile Brand */}
          <div className="mobile-brand">
            <div className="brand-mark">
              <Network size={18} />
            </div>

            <strong>MANET</strong>
          </div>

          

          {mode === "options" && (
            <div className="access-screen">

              <div className="auth-heading">
                <span className="auth-label">
                  NODE ACCESS
                </span>

                <h2>Welcome to MANET</h2>

                <p>
                  Choose how you want to access the network.
                </p>
              </div>

              <div className="access-options">

                {/* Admin Login */}
                <button
                  type="button"
                  className="access-card"
                  onClick={() => setMode("admin")}
                >
                  <div className="access-icon">
                    <ShieldCheck size={21} />
                  </div>

                  <div className="access-card-content">
                    <h3>Admin Login / Rejoin</h3>
                  </div>

                  <div className="access-arrow">
                    <ArrowRight size={17} />
                  </div>
                </button>

                {/* New Node */}
                <button
                  type="button"
                  className="access-card"
                  onClick={() => setMode("registry")}
                >
                  <div className="access-icon">
                    <Plus size={21} />
                  </div>

                  <div className="access-card-content">
                    <h3>New Node Registry</h3>
                  </div>

                  <div className="access-arrow">
                    <ArrowRight size={17} />
                  </div>
                </button>

              </div>

              {/* Security Notice */}
              <div className="security-note">
                <ShieldCheck size={18} />

                <div>
                  <strong>
                    Authorized network access
                  </strong>

                  <span>
                    Only registered nodes can join the
                    MANET network.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ADMIN LOGIN / REJOIN
          ================================================= */}

          {mode === "admin" && (
            <div className="auth-form-screen">

              <button
                type="button"
                className="back-button"
                onClick={resetForm}
              >
                <ArrowLeft size={14} />
                <span>Back to access options</span>
              </button>

              <div className="auth-heading">
                <span className="auth-label">
                  ADMIN / REJOIN
                </span>

                <h2>Access the network</h2>

                <p>
                  Sign in with your existing node credentials.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Node ID */}
                <div className="field">
                  <label>Node ID / Admin ID</label>

                  <div className="input-wrapper">
                    <CircleUserRound
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="text"
                      name="nodeId"
                      placeholder="Enter node or admin ID"
                      value={formData.nodeId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label>Password</label>

                  <div className="input-wrapper">
                    <LockKeyhole
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Remember */}
                <div className="form-row">
                  <label className="remember">
                    <input type="checkbox" />
                    <span>Remember this node</span>
                  </label>

                  <button
                    type="button"
                    className="forgot"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  className="submit-button"
                  type="submit"
                >
                  <LogIn size={17} />
                  <span>Login / Rejoin</span>
                  <ArrowRight size={16} />
                </button>

              </form>

              <div className="form-footer">
                <span>
                  Need to register a new node?
                </span>

                <button
                  type="button"
                  onClick={() => setMode("registry")}
                >
                  New Node Registry
                </button>
              </div>

            </div>
          )}

          {/* =================================================
              NEW NODE REGISTRATION
          ================================================= */}

          {mode === "registry" && (
            <div className="auth-form-screen">

              <button
                type="button"
                className="back-button"
                onClick={resetForm}
              >
                <ArrowLeft size={14} />
                <span>Back to access options</span>
              </button>

              <div className="auth-heading">
                <span className="auth-label">
                  NODE REGISTRATION
                </span>

                <h2>Register new node</h2>

                <p>
                  Add a new authorized node to the MANET
                  network.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Node Name */}
                <div className="field">
                  <label>Node name</label>

                  <div className="input-wrapper">
                    <UserRound
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="text"
                      name="nodeName"
                      placeholder="Enter node name"
                      value={formData.nodeName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Node ID */}
                <div className="field">
                  <label>Node ID</label>

                  <div className="input-wrapper">
                    <Network
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="text"
                      name="nodeId"
                      placeholder="Enter unique node ID"
                      value={formData.nodeId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Admin Key */}
                <div className="field">
                  <label>
                    Admin key
                    <span className="required-label">
                      Required
                    </span>
                  </label>

                  <div className="input-wrapper">
                    <KeyRound
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="password"
                      name="adminKey"
                      placeholder="Enter administrator key"
                      value={formData.adminKey}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label>Node password</label>

                  <div className="input-wrapper">
                    <LockKeyhole
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="password"
                      name="password"
                      placeholder="Create node password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="field">
                  <label>Confirm password</label>

                  <div className="input-wrapper">
                    <LockKeyhole
                      className="input-icon"
                      size={17}
                    />

                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm node password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="submit-button"
                  type="submit"
                >
                  <Plus size={17} />
                  <span>Register Node</span>
                  <ArrowRight size={16} />
                </button>

              </form>

              {/* Admin Authorization */}
              <div className="admin-warning">
                <ShieldCheck size={17} />

                <div>
                  <strong>
                    Administrator authorization required
                  </strong>

                  <span>
                    A valid admin key is required before a
                    new node can be registered.
                  </span>
                </div>
              </div>

              <div className="form-footer">
                <span>
                  Already have a registered node?
                </span>

                <button
                  type="button"
                  onClick={() => setMode("admin")}
                >
                  Login / Rejoin
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

    </div>
  );
}