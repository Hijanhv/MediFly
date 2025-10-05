const express = require("express");
const { eq, asc, sql } = require("drizzle-orm");
const db = require("../db");
const { cities, hospitals, villages, medicineTypes, drones } = require("../db/schema");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All routes require admin role
router.use(authenticateToken, authorizeRoles("admin"));

// ===== CITIES =====
router.get("/cities", async (req, res) => {
  try {
    const result = await db.select().from(cities).orderBy(asc(cities.name));
    res.json(result);
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

    const result = await db
      .insert(cities)
      .values({
        name,
        state,
        country: country || "India",
        latitude,
        longitude,
      })
      .returning();

    res.status(201).json(result[0]);
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    const result = await db
      .update(cities)
      .set(updateData)
      .where(eq(cities.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/cities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(cities)
      .where(eq(cities.id, id))
      .returning();

    if (result.length === 0) {
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
    const result = await db
      .select({
        id: hospitals.id,
        name: hospitals.name,
        cityId: hospitals.cityId,
        address: hospitals.address,
        contactNumber: hospitals.contactNumber,
        pincode: hospitals.pincode,
        latitude: hospitals.latitude,
        longitude: hospitals.longitude,
        city_name: cities.name,
      })
      .from(hospitals)
      .leftJoin(cities, eq(hospitals.cityId, cities.id))
      .orderBy(asc(hospitals.name));
    res.json(result);
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

    const result = await db
      .insert(hospitals)
      .values({
        name,
        cityId: city_id,
        address,
        contactNumber: contact_number,
        pincode,
      })
      .returning();

    res.status(201).json(result[0]);
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (city_id !== undefined) updateData.cityId = city_id;
    if (address !== undefined) updateData.address = address;
    if (contact_number !== undefined) updateData.contactNumber = contact_number;
    if (pincode !== undefined) updateData.pincode = pincode;

    const result = await db
      .update(hospitals)
      .set(updateData)
      .where(eq(hospitals.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/hospitals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(hospitals)
      .where(eq(hospitals.id, id))
      .returning();

    if (result.length === 0) {
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
    const result = await db
      .select({
        id: villages.id,
        name: villages.name,
        cityId: villages.cityId,
        population: villages.population,
        latitude: villages.latitude,
        longitude: villages.longitude,
        city_name: cities.name,
      })
      .from(villages)
      .leftJoin(cities, eq(villages.cityId, cities.id))
      .orderBy(asc(villages.name));
    res.json(result);
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

    const result = await db
      .insert(villages)
      .values({
        name,
        cityId: city_id,
        population,
        latitude,
        longitude,
      })
      .returning();

    res.status(201).json(result[0]);
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (city_id !== undefined) updateData.cityId = city_id;
    if (population !== undefined) updateData.population = population;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    const result = await db
      .update(villages)
      .set(updateData)
      .where(eq(villages.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/villages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(villages)
      .where(eq(villages.id, id))
      .returning();

    if (result.length === 0) {
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
    const result = await db.select().from(medicineTypes).orderBy(asc(medicineTypes.name));
    res.json(result);
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

    const result = await db
      .insert(medicineTypes)
      .values({
        name,
        icon,
        description,
        requiresRefrigeration: requires_refrigeration || false,
      })
      .returning();

    res.status(201).json(result[0]);
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (requires_refrigeration !== undefined) updateData.requiresRefrigeration = requires_refrigeration;

    const result = await db
      .update(medicineTypes)
      .set(updateData)
      .where(eq(medicineTypes.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Medicine type not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating medicine type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/medicine-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(medicineTypes)
      .where(eq(medicineTypes.id, id))
      .returning();

    if (result.length === 0) {
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
    const result = await db.select().from(drones).orderBy(asc(drones.name));
    res.json(result);
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

    const result = await db
      .insert(drones)
      .values({
        name,
        model,
        batteryLevel: battery_level || 100,
        maxPayloadKg: max_payload_kg || 5.0,
        maxRangeKm: max_range_km || 50.0,
        status: status || "available",
      })
      .returning();

    res.status(201).json(result[0]);
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (status !== undefined) updateData.status = status;
    if (battery_level !== undefined) updateData.batteryLevel = battery_level;
    if (max_payload_kg !== undefined) updateData.maxPayloadKg = max_payload_kg;
    if (max_range_km !== undefined) updateData.maxRangeKm = max_range_km;

    const result = await db
      .update(drones)
      .set(updateData)
      .where(eq(drones.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating drone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/drones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(drones)
      .where(eq(drones.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.json({ message: "Drone deleted successfully" });
  } catch (error) {
    console.error("Error deleting drone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
