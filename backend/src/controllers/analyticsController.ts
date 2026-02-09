import { Request, Response } from "express";
import { pool } from "../db";

export async function salesSummaryHandler(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };

  const fromDate = from ?? "1970-01-01";
  const toDate = to ?? "2999-12-31";

  try {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(total_amount), 0) AS total_sales,
         COALESCE(SUM(total_cost), 0)   AS total_cost,
         COALESCE(SUM(total_profit), 0) AS total_profit
       FROM invoices
       WHERE created_at >= $1
         AND created_at < $2`,
      [fromDate, toDate]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching sales summary", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function topProductsHandler(req: Request, res: Response) {
  const { days, limit } = req.query as { days?: string; limit?: string };

  const daysInt = Number(days ?? "30");
  const limitInt = Number(limit ?? "10");

  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         SUM(ii.quantity) AS total_qty,
         SUM(ii.line_profit) AS total_profit
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii.invoice_id
       JOIN products p ON p.id = ii.product_id
       WHERE i.created_at >= NOW() - ($1::int || ' days')::interval
       GROUP BY p.id
       ORDER BY total_qty DESC
       LIMIT $2`,
      [daysInt, limitInt]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching top products", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function forecastLowStockHandler(req: Request, res: Response) {
  const { days, leadTime } = req.query as { days?: string; leadTime?: string };

  const daysInt = Number(days ?? "30");
  const leadTimeInt = Number(leadTime ?? "7");

  try {
    const result = await pool.query(
      `WITH sales AS (
         SELECT
           ii.product_id,
           SUM(ii.quantity) AS total_sold
         FROM invoice_items ii
         JOIN invoices i ON i.id = ii.invoice_id
         WHERE i.created_at >= NOW() - ($1::int || ' days')::interval
         GROUP BY ii.product_id
       ),
       avg_sales AS (
         SELECT
           product_id,
           (total_sold::NUMERIC / $1::NUMERIC) AS avg_daily_sales
         FROM sales
       ),
       stock AS (
         SELECT
           product_id,
           COALESCE(SUM(quantity), 0) AS current_stock
         FROM stock_movements
         GROUP BY product_id
       )
       SELECT
         p.id,
         p.name,
         COALESCE(s.current_stock, 0) AS current_stock,
         COALESCE(a.avg_daily_sales, 0) AS avg_daily_sales,
         (COALESCE(a.avg_daily_sales, 0) * $2::NUMERIC) AS recommended_reorder_qty
       FROM products p
       LEFT JOIN stock s ON s.product_id = p.id
       LEFT JOIN avg_sales a ON a.product_id = p.id
       WHERE p.is_active = TRUE
         AND COALESCE(s.current_stock, 0) <= p.reorder_level
       ORDER BY current_stock ASC`,
      [daysInt, leadTimeInt]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error forecasting low stock", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

