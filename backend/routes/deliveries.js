const express = require("express");
const pool = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Helper function to calculate distance
function calculateDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// DEBUG: Temporary endpoint to see all deliveries without auth (REMOVE IN PRODUCTION)
router.get("/debug-all", async (req, res) => {
  try {
    console.log("🔍 DEBUG: Fetching ALL deliveries without authentication");
    const result = await pool.query(
      "SELECT * FROM deliveries ORDER BY created_at DESC"
    );
    console.log("📋 DEBUG: Total deliveries in database:", result.rows.length);
    console.log("📋 DEBUG: Deliveries:", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("DEBUG Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DEBUG: Simple test endpoint
router.get("/debug-simple", async (req, res) => {
  try {
    console.log("🔍 DEBUG: Simple query test");
    const result = await pool.query("SELECT COUNT(*) as count FROM deliveries");
    console.log("📋 DEBUG: Count result:", result.rows);
    res.json({
      count: result.rows[0]?.count || 0,
      message: "Simple query test",
    });
  } catch (error) {
    console.error("DEBUG Simple Error:", error);
    res
      .status(500)
      .json({ message: "Simple test error", error: error.message });
  }
});

// Get all deliveries (users see their own, operators see assigned/unassigned)
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(
      "🔍 Fetching deliveries for user:",
      req.user.userId,
      "Role:",
      req.user.role
    );

    let query = `SELECT * FROM deliveries`;

    const params = [];

    // Filter based on user role
    if (req.user.role === "user") {
      query += " WHERE user_id = $1";
      params.push(req.user.userId);
      console.log("👤 User filter applied");
    } else if (req.user.role === "operator") {
      // Operators see all pending deliveries and those assigned to them
      query += " WHERE status = 'pending' OR operator_id = $1";
      params.push(req.user.userId);
      console.log(
        "👷 Operator filter applied - showing pending and assigned deliveries"
      );
    }
    // Admins see all deliveries (no filter added)

    query += " ORDER BY created_at DESC";

    console.log("📊 Final query:", query);
    console.log("📊 Query params:", params);

    const result = await pool.query(query, params);
    console.log("📋 Deliveries found:", result.rows.length);
    console.log("📋 FULL RESULT OBJECT:", JSON.stringify(result, null, 2));
    console.log("📋 RESULT.ROWS:", result.rows);
    console.log("📋 FIRST ROW:", result.rows[0]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get delivery by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        d.*,
        h.name as hospital_name, h.pincode as hospital_pincode,
        v.name as village_name, v.latitude as village_lat, v.longitude as village_lng,
        m.name as medicine_name, m.icon as medicine_icon,
        dr.name as drone_name, dr.battery_level,
        u.name as user_name,
        o.name as operator_name
      FROM deliveries d
      LEFT JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN villages v ON d.village_id = v.id
      LEFT JOIN medicine_types m ON d.medicine_type_id = m.id
      LEFT JOIN drones dr ON d.drone_id = dr.id
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN users o ON d.operator_id = o.id
      WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const delivery = result.rows[0];

    // Check permissions
    if (req.user.role === "user" && delivery.user_id !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new delivery (users)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("user", "admin"),
  async (req, res) => {
    try {
      const { hospital_id, village_id, medicine_type_id, priority, notes } =
        req.body;

      if (!hospital_id || !village_id || !medicine_type_id) {
        return res.status(400).json({
          message: "Hospital, village, and medicine type are required",
        });
      }

      // Verify hospital and village exist
      const hospitalResult = await pool.query(
        "SELECT name, pincode FROM hospitals WHERE id = $1",
        [hospital_id]
      );
      const villageResult = await pool.query(
        "SELECT name, latitude, longitude FROM villages WHERE id = $1",
        [village_id]
      );

      if (hospitalResult.rows.length === 0 || villageResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Hospital or village not found" });
      }

      // Use a simplified distance calculation based on pincode area (default 25km)
      const distance = 25; // Default distance in km
      const etaMinutes = Math.ceil(30 + distance * 2); // More realistic ETA calculation
      const estimatedArrival = new Date(Date.now() + etaMinutes * 60000);

      // Create delivery
      console.log(
        "🚀 Creating delivery for user:",
        req.user.userId,
        "with status: pending"
      );
      const result = await pool.query(
        `INSERT INTO deliveries 
        (hospital_id, village_id, medicine_type_id, user_id, priority, distance_km, eta_minutes, estimated_arrival, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') 
       RETURNING *`,
        [
          hospital_id,
          village_id,
          medicine_type_id,
          req.user.userId,
          priority || "normal",
          distance.toFixed(2),
          etaMinutes,
          estimatedArrival,
          notes,
        ]
      );

      console.log("✅ Delivery created:", result.rows[0]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Assign operator and drone to delivery (operators)
router.patch(
  "/:id/assign",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find available drone
      const droneResult = await pool.query(
        "SELECT * FROM drones WHERE status = 'available' ORDER BY battery_level DESC LIMIT 1"
      );

      if (droneResult.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "No available drones at the moment" });
      }

      const drone = droneResult.rows[0];

      // Update delivery
      const result = await pool.query(
        `UPDATE deliveries 
       SET drone_id = ?, operator_id = ?, status = 'preparing' 
       WHERE id = ? AND status = 'pending' 
       RETURNING *`,
        [drone.id, req.user.userId, id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Delivery not found or already assigned" });
      }

      // Update drone status
      await pool.query(
        "UPDATE drones SET status = 'delivering' WHERE id = ?",
        [drone.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error assigning delivery:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update delivery status (operators)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = [
        "preparing",
        "in-transit",
        "delivered",
        "cancelled",
        "failed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Get delivery info
      const deliveryResult = await pool.query(
        "SELECT * FROM deliveries WHERE id = $1",
        [id]
      );
      if (deliveryResult.rows.length === 0) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      const delivery = deliveryResult.rows[0];

      // Update delivery with current timestamp for delivered status
      const updateQuery =
        status === "delivered"
          ? "UPDATE deliveries SET status = $1, actual_arrival = datetime('now') WHERE id = $2 RETURNING *"
          : "UPDATE deliveries SET status = $1, updated_at = datetime('now') WHERE id = $2 RETURNING *";

      const result = await pool.query(updateQuery, [status, id]);

      // If delivered, cancelled, or failed, free up the drone
      if (
        ["delivered", "cancelled", "failed"].includes(status) &&
        delivery.drone_id
      ) {
        const batteryDrain = Math.floor(Math.random() * 15) + 5;
        await pool.query(
          "UPDATE drones SET status = 'available', battery_level = MAX(battery_level - $1, 10) WHERE id = $2",
          [batteryDrain, delivery.drone_id]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Cancel delivery (user or admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the delivery or is admin
    const deliveryCheck = await pool.query(
      "SELECT user_id, status, drone_id FROM deliveries WHERE id = $1",
      [id]
    );

    if (deliveryCheck.rows.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const delivery = deliveryCheck.rows[0];

    if (req.user.role !== "admin" && delivery.user_id !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!["pending", "preparing"].includes(delivery.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel delivery in current status" });
    }

    // Update delivery status
    await pool.query(
      "UPDATE deliveries SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    // Free up drone if assigned
    if (delivery.drone_id) {
      await pool.query("UPDATE drones SET status = 'available' WHERE id = $1", [
        delivery.drone_id,
      ]);
    }

    res.json({ message: "Delivery cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
