import { Request, Response } from "express";
import { pool } from "../db";

export async function listInventoryHandler(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.barcode,
         COALESCE(SUM(sm.quantity), 0) AS current_stock
       FROM products p
       LEFT JOIN stock_movements sm ON sm.product_id = p.id
       GROUP BY p.id
       ORDER BY p.name`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error listing inventory", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function adjustInventoryHandler(req: Request, res: Response) {
  const { product_id, quantity, reference } = req.body as {
    product_id?: number;
    quantity?: number;
    reference?: string;
  };

  if (!product_id || !quantity) {
    return res.status(400).json({ message: "product_id and quantity are required" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as { id: number } | undefined;

  try {
    const result = await pool.query(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reference, created_by)
       VALUES ($1, $2, 'ADJUSTMENT', $3, $4)
       RETURNING *`,
      [product_id, quantity, reference ?? null, user?.id ?? null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adjusting inventory", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

