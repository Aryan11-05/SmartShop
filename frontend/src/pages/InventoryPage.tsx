import React, { useEffect, useState } from "react";
import { api } from "../api";

interface InventoryItem {
  id: number;
  name: string;
  barcode: string | null;
  current_stock: string;
}

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await api.get<InventoryItem[]>("/api/inventory");
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="card">
      <h1>Inventory</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Current stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.barcode ?? "-"}</td>
              <td>{i.current_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;