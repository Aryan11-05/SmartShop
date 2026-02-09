import React, { useEffect, useState } from "react";
import { api } from "../api";

interface SalesSummary {
  total_sales: string;
  total_cost: string;
  total_profit: string;
}

interface ForecastItem {
  id: number;
  name: string;
  current_stock: string;
  avg_daily_sales: string;
  recommended_reorder_qty: string;
}

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryRes, forecastRes] = await Promise.all([
          api.get<SalesSummary>("/api/analytics/sales-summary"),
          api.get<ForecastItem[]>("/api/analytics/forecast-low-stock"),
        ]);
        setSummary(summaryRes.data);
        setForecast(forecastRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="card">
      <h1>Analytics</h1>
      {summary && (
        <div className="summary-grid">
          <div className="summary-tile">
            <h2>Total Sales</h2>
            <p>{summary.total_sales}</p>
          </div>
          <div className="summary-tile">
            <h2>Total Profit</h2>
            <p>{summary.total_profit}</p>
          </div>
        </div>
      )}

      <h2>Forecasted Low Stock</h2>
      {forecast.length === 0 ? (
        <p>No low-stock items based on recent sales.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Current stock</th>
              <th>Avg daily sales</th>
              <th>Recommended reorder qty</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.current_stock}</td>
                <td>{f.avg_daily_sales}</td>
                <td>{f.recommended_reorder_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnalyticsPage;