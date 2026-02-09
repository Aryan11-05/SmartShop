import { Router } from "express";
import { loginHandler, meHandler } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", loginHandler);
router.get("/me", authMiddleware, meHandler);

export default router;

