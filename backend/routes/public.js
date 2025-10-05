const express = require("express");
const { asc, eq } = require("drizzle-orm");
const db = require("../db");
const { hospitals, villages, medicineTypes, drones, cities } = require("../db/schema");

const router = express.Router();

// Get all hospitals
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
        city: cities.name,
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

// Get all villages
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
        city: cities.name,
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

// Get all medicine types
router.get("/medicine-types", async (req, res) => {
  try {
    const result = await db.select().from(medicineTypes).orderBy(asc(medicineTypes.name));
    res.json(result);
  } catch (error) {
    console.error("Error fetching medicine types:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all drones
router.get("/drones", async (req, res) => {
  try {
    const result = await db.select().from(drones).orderBy(asc(drones.name));
    res.json(result);
  } catch (error) {
    console.error("Error fetching drones:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
