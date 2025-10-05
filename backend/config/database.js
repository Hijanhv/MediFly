require("dotenv").config({ path: "../../.env" });

// Use SQLite for local development when PostgreSQL is not available
if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("postgres:5432")
) {
  console.log("Using SQLite database for local development");
  module.exports = require("./database-sqlite");
} else {
  // Use PostgreSQL for production
  const { Pool } = require("pg");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  module.exports = pool;
}
