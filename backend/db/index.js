require("dotenv").config({ path: "../../.env" });

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const schema = require("./schema");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client, { schema });

module.exports = db;
