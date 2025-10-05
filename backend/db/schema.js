const { pgTable, serial, text, varchar, timestamp, integer, decimal, boolean } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }).default("India"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cityId: integer("city_id").references(() => cities.id),
  address: text("address"),
  contactNumber: varchar("contact_number", { length: 50 }),
  pincode: varchar("pincode", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

const villages = pgTable("villages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cityId: integer("city_id").references(() => cities.id),
  population: integer("population"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

const medicineTypes = pgTable("medicine_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  description: text("description"),
  requiresRefrigeration: boolean("requires_refrigeration").default(false),
});

const drones = pgTable("drones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }),
  batteryLevel: integer("battery_level").default(100),
  maxPayloadKg: decimal("max_payload_kg", { precision: 5, scale: 2 }),
  maxRangeKm: decimal("max_range_km", { precision: 6, scale: 2 }),
  status: varchar("status", { length: 50 }).default("available"),
});

const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").references(() => hospitals.id),
  villageId: integer("village_id").references(() => villages.id),
  medicineTypeId: integer("medicine_type_id").references(() => medicineTypes.id),
  userId: integer("user_id").references(() => users.id),
  operatorId: integer("operator_id").references(() => users.id),
  droneId: integer("drone_id").references(() => drones.id),
  priority: varchar("priority", { length: 50 }).default("normal"),
  distanceKm: decimal("distance_km", { precision: 6, scale: 2 }),
  etaMinutes: integer("eta_minutes"),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

module.exports = {
  users,
  cities,
  hospitals,
  villages,
  medicineTypes,
  drones,
  deliveries,
};
