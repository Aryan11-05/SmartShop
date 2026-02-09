import React, { useEffect, useState } from "react";
import { api } from "../api";

interface Product {
  id: number;
  name: string;
  barcode: string | null;
  category: string | null;
  selling_price: string;
  cost_price: string;
  reorder_level: number;
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<Product[]>("/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="card">
      <h1>Products</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Reorder level</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.barcode ?? "-"}</td>
              <td>{p.category ?? "-"}</td>
              <td>{p.cost_price}</td>
              <td>{p.selling_price}</td>
              <td>{p.reorder_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;