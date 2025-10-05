const express = require("express");
const pool = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All routes require admin role
router.use(authenticateToken, authorizeRoles("admin"));

// ===== CITIES =====
router.get("/cities", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cities ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/cities", async (req, res) => {
  try {
    const { name, state, country, latitude, longitude } = req.body;

    if (!name || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "City name, latitude, and longitude are required" });
    }

    const result = await pool.query(
      "INSERT INTO cities (name, state, country, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, state, country || "India", latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "City already exists" });
    }
    console.error("Error creating city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/cities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state, country, latitude, longitude } = req.body;

    const result = await pool.query(
      "UPDATE cities SET name = COALESCE($1, name), state = COALESCE($2, state), country = COALESCE($3, country), latitude = COALESCE($4, latitude), longitude = COALESCE($5, longitude) WHERE id = $6 RETURNING *",
      [name, state, country, latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/cities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM cities WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json({ message: "City deleted successfully" });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== HOSPITALS =====
router.get("/hospitals", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT h.*, c.name as city_name FROM hospitals h LEFT JOIN cities c ON h.city_id = c.id ORDER BY h.name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/hospitals", async (req, res) => {
  try {
    const { name, city_id, address, contact_number, pincode } = req.body;

    // Validate required fields
    if (!name || !city_id || !pincode) {
      return res
        .status(400)
        .json({ message: "Hospital name, city, and pincode are required" });
    }

    // Validate pincode format (6 digits for Indian pincodes)
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        message: "Pincode must be a 6-digit number (e.g., 411001)",
      });
    }

    // Validate contact number format if provided
    if (contact_number && !/^[+]?[\d\s-()]+$/.test(contact_number)) {
      return res.status(400).json({
        message:
          "Contact number must contain only digits, spaces, and allowed symbols (+-())",
      });
    }

    const result = await pool.query(
      "INSERT INTO hospitals (name, city_id, address, contact_number, pincode) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, city_id, address, contact_number, pincode]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating hospital:", error);

    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Hospital with this name already exists" });
    }

    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid city selected" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/hospitals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city_id, address, contact_number, pincode } = req.body;

    // Validate pincode format if provided
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        message: "Pincode must be a 6-digit number (e.g., 411001)",
      });
    }

    const result = await pool.query(
      "UPDATE hospitals SET name = COALESCE($1, name), city_id = COALESCE($2, city_id), address = COALESCE($3, address), contact_number = COALESCE($4, contact_number), pincode = COALESCE($5, pincode) WHERE id = $6 RETURNING *",
      [name, city_id, address, contact_number, pincode, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/hospitals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM hospitals WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({ message: "Hospital deleted successfully" });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== VILLAGES =====
router.get("/villages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT v.*, c.name as city_name FROM villages v LEFT JOIN cities c ON v.city_id = c.id ORDER BY v.name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching villages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/villages", async (req, res) => {
  try {
    const { name, city_id, population, latitude, longitude } = req.body;

    if (!name || !city_id || !latitude || !longitude) {
      return res
        .status(400)
        .json({
          message: "Village name, city, latitude, and longitude are required",
        });
    }

    // Validate population if provided
    if (population !== undefined && population !== null && population !== "") {
      const pop = parseInt(population);
      if (isNaN(pop) || pop < 0) {
        return res
          .status(400)
          .json({ message: "Population must be a positive integer" });
      }
    }

    const result = await pool.query(
      "INSERT INTO villages (name, city_id, population, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, city_id, population, latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating village:", error);

    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid city selected" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/villages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city_id, population, latitude, longitude } = req.body;

    const result = await pool.query(
      "UPDATE villages SET name = COALESCE($1, name), city_id = COALESCE($2, city_id), population = COALESCE($3, population), latitude = COALESCE($4, latitude), longitude = COALESCE($5, longitude) WHERE id = $6 RETURNING *",
      [name, city_id, population, latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/villages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM villages WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.json({ message: "Village deleted successfully" });
  } catch (error) {
    console.error("Error deleting village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== MEDICINE TYPES =====
router.get("/medicine-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medicine_types ORDER BY name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching medicine types:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/medicine-types", async (req, res) => {
  try {
    const { name, icon, description, requires_refrigeration } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Medicine name is required" });
    }

    const result = await pool.query(
      "INSERT INTO medicine_types (name, icon, description, requires_refrigeration) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, icon, description, requires_refrigeration || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Medicine type already exists" });
    }
    console.error("Error creating medicine type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/medicine-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, requires_refrigeration } = req.body;

    const result = await pool.query(
      "UPDATE medicine_types SET name = COALESCE($1, name), icon = COALESCE($2, icon), description = COALESCE($3, description), requires_refrigeration = COALESCE($4, requires_refrigeration) WHERE id = $5 RETURNING *",
      [name, icon, description, requires_refrigeration, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating medicine type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/medicine-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM medicine_types WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    res.json({ message: "Medicine type deleted successfully" });
  } catch (error) {
    console.error("Error deleting medicine type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===== DRONES =====
router.get("/drones", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM drones ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching drones:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/drones", async (req, res) => {
  try {
    const { name, model, battery_level, max_payload_kg, max_range_km, status } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Drone name is required" });
    }

    const result = await pool.query(
      "INSERT INTO drones (name, model, battery_level, max_payload_kg, max_range_km, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        name,
        model,
        battery_level || 100,
        max_payload_kg || 5.0,
        max_range_km || 50.0,
        status || "available",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Drone with this name already exists" });
    }
    console.error("Error creating drone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/drones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, status, battery_level, max_payload_kg, max_range_km } =
      req.body;

    const result = await pool.query(
      "UPDATE drones SET name = COALESCE($1, name), model = COALESCE($2, model), status = COALESCE($3, status), battery_level = COALESCE($4, battery_level), max_payload_kg = COALESCE($5, max_payload_kg), max_range_km = COALESCE($6, max_range_km) WHERE id = $7 RETURNING *",
      [name, model, status, battery_level, max_payload_kg, max_range_km, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating drone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/drones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM drones WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.json({ message: "Drone deleted successfully" });
  } catch (error) {
    console.error("Error deleting drone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
