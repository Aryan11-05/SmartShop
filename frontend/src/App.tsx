import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Layout Wrapper (Industry Pattern) */}
      <Route element={<Layout />}>

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />

      </Route>

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}