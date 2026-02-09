import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "smartshop",
  PGUSER = "postgres",
  PGPASSWORD = "postgres",
} = process.env;

export const pool = new Pool({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});

