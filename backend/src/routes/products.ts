import { Router } from "express";
import {
  createProductHandler,
  listProductsHandler,
  lowStockProductsHandler,
  updateProductHandler,
} from "../controllers/productsController";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

// All product routes require authentication
router.use(authMiddleware);

// List products (any role)
router.get("/", listProductsHandler);

// Low stock products (any role)
router.get("/low-stock", lowStockProductsHandler);

// Create / update products (OWNER or MANAGER)
router.post("/", requireRole("OWNER", "MANAGER"), createProductHandler);
router.put("/:id", requireRole("OWNER", "MANAGER"), updateProductHandler);

export default router;

