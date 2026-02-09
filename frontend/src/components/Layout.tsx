import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#0f172a",
          color: "white",
          padding: "25px"
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>🚀 Smart Shop</h2>

        <nav>
          <p><Link style={{ color: "#38bdf8" }} to="/dashboard">Dashboard</Link></p>
          <p><Link style={{ color: "#38bdf8" }} to="/products">Products</Link></p>
          <p><Link style={{ color: "#38bdf8" }} to="/inventory">Inventory</Link></p>
          <p><Link style={{ color: "#38bdf8" }} to="/analytics">Analytics</Link></p>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px", background: "#f1f5f9" }}>
        <Outlet />
      </main>

    </div>
  );
}