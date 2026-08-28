import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
  );
}