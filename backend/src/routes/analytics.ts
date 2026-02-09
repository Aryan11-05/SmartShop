import { Router } from "express";
import {
  forecastLowStockHandler,
  salesSummaryHandler,
  topProductsHandler,
} from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

// Sales totals
router.get("/sales-summary", salesSummaryHandler);

// Top products
router.get("/top-products", topProductsHandler);

// Forecast low stock
router.get("/forecast-low-stock", forecastLowStockHandler);

export default router;

