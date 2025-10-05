require("dotenv").config({ path: __dirname + "/../.env" });

// Debug JWT_SECRET loading
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
console.log("Environment file path:", __dirname + "/../.env");
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not found, using fallback");
  process.env.JWT_SECRET = "fallback-secret-key-for-development";
}
const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
    await pool.query("SELECT 1");
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

// Start server
app.listen(PORT, () => {
  console.log(`🚁 MediFly backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  pool.end(() => {
    console.log("Database pool closed");
    process.exit(0);
  });
});
