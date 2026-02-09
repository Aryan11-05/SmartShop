import { Request, Response } from "express";
import { pool } from "../db";

export async function listProductsHandler(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, name, barcode, category, supplier_id, cost_price, selling_price,
              tax_rate, reorder_level, is_active, created_at
       FROM products
       ORDER BY name`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error listing products", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createProductHandler(req: Request, res: Response) {
  const {
    name,
    barcode,
    category,
    supplier_id,
    cost_price,
    selling_price,
    tax_rate,
    reorder_level,
  } = req.body;

  if (!name || cost_price == null || selling_price == null) {
    return res.status(400).json({ message: "name, cost_price and selling_price are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products
        (name, barcode, category, supplier_id, cost_price, selling_price, tax_rate, reorder_level)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,0),COALESCE($8,0))
       RETURNING *`,
      [name, barcode, category, supplier_id ?? null, cost_price, selling_price, tax_rate, reorder_level]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating product", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProductHandler(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const {
    name,
    barcode,
    category,
    supplier_id,
    cost_price,
    selling_price,
    tax_rate,
    reorder_level,
    is_active,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($2, name),
           barcode = COALESCE($3, barcode),
           category = COALESCE($4, category),
           supplier_id = COALESCE($5, supplier_id),
           cost_price = COALESCE($6, cost_price),
           selling_price = COALESCE($7, selling_price),
           tax_rate = COALESCE($8, tax_rate),
           reorder_level = COALESCE($9, reorder_level),
           is_active = COALESCE($10, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, name, barcode, category, supplier_id, cost_price, selling_price, tax_rate, reorder_level, is_active]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating product", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function lowStockProductsHandler(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.barcode,
         p.reorder_level,
         COALESCE(SUM(sm.quantity), 0) AS current_stock
       FROM products p
       LEFT JOIN stock_movements sm ON sm.product_id = p.id
       WHERE p.is_active = TRUE
       GROUP BY p.id
       HAVING COALESCE(SUM(sm.quantity), 0) <= p.reorder_level
       ORDER BY current_stock ASC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching low stock products", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

