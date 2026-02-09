import { Router } from "express";
import { createInvoiceHandler, listInvoicesHandler } from "../controllers/salesController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

// Create invoice (any authenticated staff)
router.post("/invoices", createInvoiceHandler);

// List invoices (any authenticated staff; you can restrict later)
router.get("/invoices", listInvoicesHandler);

export default router;

