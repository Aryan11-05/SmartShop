import { Express } from "express";
import authRouter from "./auth";
import productsRouter from "./products";
import inventoryRouter from "./inventory";
import salesRouter from "./sales";
import analyticsRouter from "./analytics";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/sales", salesRouter);
  app.use("/api/analytics", analyticsRouter);
}

