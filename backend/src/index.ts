import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { registerRoutes } from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "smartshop-backend" });
});

// Register API routes
registerRoutes(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`SmartShop backend listening on port ${PORT}`);
});

