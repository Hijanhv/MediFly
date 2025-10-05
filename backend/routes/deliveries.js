const express = require("express");
const { eq, or, desc, and, sql } = require("drizzle-orm");
const db = require("../db");
const { deliveries, hospitals, villages, medicineTypes, drones, users } = require("../db/schema");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get all deliveries (users see their own, operators see assigned/unassigned)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = db.select().from(deliveries);

    if (req.user.role === "user") {
      query = query.where(eq(deliveries.userId, req.user.userId));
    } else if (req.user.role === "operator") {
      query = query.where(
        or(eq(deliveries.status, "pending"), eq(deliveries.operatorId, req.user.userId))
      );
    }

    const result = await query.orderBy(desc(deliveries.createdAt));
    res.json(result);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get delivery by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        id: deliveries.id,
        hospitalId: deliveries.hospitalId,
        villageId: deliveries.villageId,
        medicineTypeId: deliveries.medicineTypeId,
        userId: deliveries.userId,
        operatorId: deliveries.operatorId,
        droneId: deliveries.droneId,
        priority: deliveries.priority,
        distanceKm: deliveries.distanceKm,
        etaMinutes: deliveries.etaMinutes,
        estimatedArrival: deliveries.estimatedArrival,
        actualArrival: deliveries.actualArrival,
        notes: deliveries.notes,
        status: deliveries.status,
        createdAt: deliveries.createdAt,
        updatedAt: deliveries.updatedAt,
        hospitalName: hospitals.name,
        hospitalPincode: hospitals.pincode,
        villageName: villages.name,
        villageLat: villages.latitude,
        villageLng: villages.longitude,
        medicineName: medicineTypes.name,
        medicineIcon: medicineTypes.icon,
        droneName: drones.name,
        batteryLevel: drones.batteryLevel,
        userName: sql`u.name`.as("user_name"),
        operatorName: sql`o.name`.as("operator_name"),
      })
      .from(deliveries)
      .leftJoin(hospitals, eq(deliveries.hospitalId, hospitals.id))
      .leftJoin(villages, eq(deliveries.villageId, villages.id))
      .leftJoin(medicineTypes, eq(deliveries.medicineTypeId, medicineTypes.id))
      .leftJoin(drones, eq(deliveries.droneId, drones.id))
      .leftJoin(users, eq(deliveries.userId, users.id))
      .leftJoin(sql`users o`, sql`${deliveries.operatorId} = o.id`)
      .where(eq(deliveries.id, parseInt(id)));

    if (result.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const delivery = result[0];

    if (req.user.role === "user" && delivery.userId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new delivery (users)
router.post("/", authenticateToken, authorizeRoles("user", "admin"), async (req, res) => {
  try {
    const { hospital_id, village_id, medicine_type_id, priority, notes } = req.body;

    if (!hospital_id || !village_id || !medicine_type_id) {
      return res.status(400).json({
        message: "Hospital, village, and medicine type are required",
      });
    }

    const hospitalResult = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, hospital_id));

    const villageResult = await db
      .select()
      .from(villages)
      .where(eq(villages.id, village_id));

    if (hospitalResult.length === 0 || villageResult.length === 0) {
      return res.status(404).json({ message: "Hospital or village not found" });
    }

    const distance = 25;
    const etaMinutes = Math.ceil(30 + distance * 2);
    const estimatedArrival = new Date(Date.now() + etaMinutes * 60000);

    const [result] = await db
      .insert(deliveries)
      .values({
        hospitalId: hospital_id,
        villageId: village_id,
        medicineTypeId: medicine_type_id,
        userId: req.user.userId,
        priority: priority || "normal",
        distanceKm: distance.toFixed(2),
        etaMinutes: etaMinutes,
        estimatedArrival: estimatedArrival,
        notes: notes,
        status: "pending",
      })
      .returning();

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Assign operator and drone to delivery (operators)
router.patch("/:id/assign", authenticateToken, authorizeRoles("operator", "admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const droneResult = await db
      .select()
      .from(drones)
      .where(eq(drones.status, "available"))
      .orderBy(desc(drones.batteryLevel))
      .limit(1);

    if (droneResult.length === 0) {
      return res.status(400).json({ message: "No available drones at the moment" });
    }

    const drone = droneResult[0];

    const result = await db
      .update(deliveries)
      .set({
        droneId: drone.id,
        operatorId: req.user.userId,
        status: "preparing",
      })
      .where(and(eq(deliveries.id, parseInt(id)), eq(deliveries.status, "pending")))
      .returning();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Delivery not found or already assigned" });
    }

    await db
      .update(drones)
      .set({ status: "delivering" })
      .where(eq(drones.id, drone.id));

    res.json(result[0]);
  } catch (error) {
    console.error("Error assigning delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update delivery status (operators)
router.patch("/:id/status", authenticateToken, authorizeRoles("operator", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["preparing", "in-transit", "delivered", "cancelled", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const deliveryResult = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, parseInt(id)));

    if (deliveryResult.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const delivery = deliveryResult[0];

    const updateData = status === "delivered"
      ? { status, actualArrival: new Date() }
      : { status };

    const result = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, parseInt(id)))
      .returning();

    if (["delivered", "cancelled", "failed"].includes(status) && delivery.droneId) {
      const batteryDrain = Math.floor(Math.random() * 15) + 5;
      await db
        .update(drones)
        .set({
          status: "available",
          batteryLevel: sql`GREATEST(${drones.batteryLevel} - ${batteryDrain}, 10)`,
        })
        .where(eq(drones.id, delivery.droneId));
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel delivery (user or admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryCheck = await db
      .select({
        userId: deliveries.userId,
        status: deliveries.status,
        droneId: deliveries.droneId,
      })
      .from(deliveries)
      .where(eq(deliveries.id, parseInt(id)));

    if (deliveryCheck.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const delivery = deliveryCheck[0];

    if (req.user.role !== "admin" && delivery.userId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!["pending", "preparing"].includes(delivery.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel delivery in current status" });
    }

    await db
      .update(deliveries)
      .set({ status: "cancelled" })
      .where(eq(deliveries.id, parseInt(id)));

    if (delivery.droneId) {
      await db
        .update(drones)
        .set({ status: "available" })
        .where(eq(drones.id, delivery.droneId));
    }

    res.json({ message: "Delivery cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
