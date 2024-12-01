import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5433,
  database: "node_chat",
});

export default pool;
