import React from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}
      >
        {/* Card 1 */}
        <div style={cardStyle}>
          <h3>Total Sales</h3>
          <p>₹12,400</p>
        </div>

        {/* Card 2 */}
        <div style={cardStyle}>
          <h3>Products</h3>
          <p>45 Items</p>
        </div>

        {/* Card 3 */}
        <div style={cardStyle}>
          <h3>Low Stock</h3>
          <p>6 Alerts</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "220px",
  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
};