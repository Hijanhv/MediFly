require("dotenv").config({ path: __dirname + "/../.env" });

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not found, using fallback");
  process.env.JWT_SECRET = "fallback-secret-key-for-development";
}

const express = require("express");
const cors = require("cors");
const { sql } = require("drizzle-orm");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const deliveryRoutes = require("./routes/deliveries");
const publicRoutes = require("./routes/public");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api", publicRoutes);

// Health check
app.get("/health", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`MediFly backend server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
