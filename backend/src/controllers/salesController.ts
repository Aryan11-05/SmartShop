import { Request, Response } from "express";
import { pool } from "../db";

interface InvoiceItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount?: number;
  cost_price: number;
}

export async function createInvoiceHandler(req: Request, res: Response) {
  const { invoice_no, items } = req.body as {
    invoice_no?: string;
    items?: InvoiceItemInput[];
  };

  if (!invoice_no || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "invoice_no and at least one item are required" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as { id: number } | undefined;
  const userId = user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  // Calculate totals
  let totalAmount = 0;
  let totalCost = 0;
  let totalProfit = 0;

  for (const item of items) {
    const discount = item.discount ?? 0;
    const lineAmount = (item.unit_price - discount) * item.quantity;
    const lineCost = item.cost_price * item.quantity;
    const lineProfit = lineAmount - lineCost;

    totalAmount += lineAmount;
    totalCost += lineCost;
    totalProfit += lineProfit;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invoiceResult = await client.query(
      `INSERT INTO invoices (invoice_no, user_id, total_amount, total_cost, total_profit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [invoice_no, userId, totalAmount, totalCost, totalProfit]
    );

    const invoiceId = invoiceResult.rows[0].id as number;

    for (const item of items) {
      const discount = item.discount ?? 0;
      const lineAmount = (item.unit_price - discount) * item.quantity;
      const lineCost = item.cost_price * item.quantity;
      const lineProfit = lineAmount - lineCost;

      await client.query(
        `INSERT INTO invoice_items
           (invoice_id, product_id, quantity, unit_price, discount, line_cost, line_profit)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [invoiceId, item.product_id, item.quantity, item.unit_price, discount, lineCost, lineProfit]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reference, created_by)
         VALUES ($1, $2, 'SALE', $3, $4)`,
        [item.product_id, -item.quantity, invoice_no, userId]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      id: invoiceId,
      invoice_no,
      total_amount: totalAmount,
      total_cost: totalCost,
      total_profit: totalProfit,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating invoice", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
}

export async function listInvoicesHandler(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };

  const fromDate = from ?? "1970-01-01";
  const toDate = to ?? "2999-12-31";

  try {
    const result = await pool.query(
      `SELECT id, invoice_no, user_id, total_amount, total_cost, total_profit, created_at
       FROM invoices
       WHERE created_at >= $1
         AND created_at < $2
       ORDER BY created_at DESC`,
      [fromDate, toDate]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error listing invoices", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

