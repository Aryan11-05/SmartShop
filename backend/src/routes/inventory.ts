import { Router } from "express";
import { listInventoryHandler, adjustInventoryHandler } from "../controllers/inventoryController";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

// Current stock for all products (any role)
router.get("/", listInventoryHandler);

// Manual adjustments (OWNER / MANAGER)
router.post("/adjust", requireRole("OWNER", "MANAGER"), adjustInventoryHandler);

export default router;

