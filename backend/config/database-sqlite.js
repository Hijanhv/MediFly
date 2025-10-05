const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create SQLite database
const db = new sqlite3.Database(
  path.join(__dirname, "../medifly.db"),
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to SQLite database");
      initializeDatabase();
    }
  }
);

function initializeDatabase() {
  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'operator', 'admin')),
      name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample users with hashed passwords (password is '123456' for all)
    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync("123456", 10);

    const sampleUsers = [
      ["user@medifly.com", hashedPassword, "user", "John Doe"],
      ["operator@medifly.com", hashedPassword, "operator", "Jane Smith"],
      ["admin@medifly.com", hashedPassword, "admin", "Admin User"],
    ];

    sampleUsers.forEach((user) => {
      db.run(
        `INSERT OR IGNORE INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`,
        user
      );
    });

    // Cities table
    db.run(`CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      state VARCHAR(255),
      country VARCHAR(255) DEFAULT 'India',
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample cities
    const cities = [
      ["Pune", "Maharashtra", 18.5204303, 73.8567437],
      ["Mumbai", "Maharashtra", 19.0728305, 72.8826127],
      ["Delhi", "Delhi", 28.7040592, 77.1024902],
      ["Bangalore", "Karnataka", 12.9715988, 77.5945642],
      ["Chennai", "Tamil Nadu", 13.082684, 80.2707184],
    ];

    cities.forEach((city) => {
      db.run(
        `INSERT OR IGNORE INTO cities (name, state, latitude, longitude) VALUES (?, ?, ?, ?)`,
        city
      );
    });

    // Drop existing hospitals table and recreate without latitude/longitude
    db.run(`DROP TABLE IF EXISTS hospitals`);

    // Recreate hospitals table without latitude/longitude columns
    db.run(`CREATE TABLE hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
      address TEXT,
      contact_number VARCHAR(50),
      pincode VARCHAR(10) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add some sample hospitals with pincodes
    const sampleHospitals = [
      ["Apollo Hospital Pune", 1, "Baner Road, Pune", "020-39802020", "411045"],
      ["Fortis Hospital Mumbai", 2, "Mulund, Mumbai", "022-67914444", "400080"],
      ["AIIMS Delhi", 3, "Ansari Nagar, Delhi", "011-26588500", "110029"],
      [
        "Manipal Hospital Bangalore",
        4,
        "HAL Airport Road, Bangalore",
        "080-25024444",
        "560017",
      ],
      ["Apollo Chennai", 5, "Greams Lane, Chennai", "044-28296000", "600006"],
    ];

    sampleHospitals.forEach((hospital) => {
      db.run(
        `INSERT OR IGNORE INTO hospitals (name, city_id, address, contact_number, pincode) VALUES (?, ?, ?, ?, ?)`,
        hospital
      );
    });

    // Villages table
    db.run(`CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
      population INTEGER,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample villages
    const sampleVillages = [
      ["Wagholi", 1, 25000, 18.597974, 73.937243],
      ["Hinjewadi", 1, 30000, 18.590611, 73.739758],
      ["Baner", 1, 35000, 18.559882, 73.786044],
      ["Kharadi", 1, 28000, 18.551828, 73.960242],
      ["Hadapsar", 1, 40000, 18.508386, 73.92692],
    ];

    sampleVillages.forEach((village) => {
      db.run(
        `INSERT OR IGNORE INTO villages (name, city_id, population, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
        village
      );
    });

    // Medicine types table
    db.run(`CREATE TABLE IF NOT EXISTS medicine_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      icon VARCHAR(10),
      description TEXT,
      requires_refrigeration BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample medicine types
    const sampleMedicines = [
      ["Insulin", "💉", "Diabetes medication requiring refrigeration", true],
      ["Vaccine", "🧪", "Immunization vaccines", true],
      ["Antibiotics", "💊", "General antibiotics for infections", false],
      ["Pain Relief", "🩹", "Pain management medications", false],
      ["Emergency Kit", "🚑", "Emergency medical supplies", false],
    ];

    sampleMedicines.forEach((medicine) => {
      db.run(
        `INSERT OR IGNORE INTO medicine_types (name, icon, description, requires_refrigeration) VALUES (?, ?, ?, ?)`,
        medicine
      );
    });

    // Drones table
    db.run(`CREATE TABLE IF NOT EXISTS drones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      model VARCHAR(255),
      battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
      status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in-flight', 'maintenance', 'charging')),
      max_payload_kg DECIMAL(5,2) DEFAULT 5.00,
      max_range_km DECIMAL(6,2) DEFAULT 50.00,
      current_latitude DECIMAL(10, 8),
      current_longitude DECIMAL(11, 8),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample drones
    const sampleDrones = [
      [
        "MediFly-001",
        "DJI Matrice 300",
        85,
        "available",
        5.0,
        50.0,
        18.5204,
        73.8567,
      ],
      [
        "MediFly-002",
        "DJI Matrice 300",
        92,
        "available",
        5.0,
        50.0,
        18.5204,
        73.8567,
      ],
      [
        "MediFly-003",
        "DJI Air 2S",
        78,
        "charging",
        3.0,
        30.0,
        18.5204,
        73.8567,
      ],
      [
        "MediFly-004",
        "DJI Phantom 4",
        100,
        "available",
        2.5,
        25.0,
        18.5204,
        73.8567,
      ],
      [
        "MediFly-005",
        "Custom Delivery Drone",
        45,
        "maintenance",
        8.0,
        60.0,
        18.5204,
        73.8567,
      ],
    ];

    sampleDrones.forEach((drone) => {
      db.run(
        `INSERT OR IGNORE INTO drones (name, model, battery_level, status, max_payload_kg, max_range_km, current_latitude, current_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        drone
      );
    });

    // Deliveries table
    db.run(`CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
      village_id INTEGER NOT NULL REFERENCES villages(id),
      medicine_type_id INTEGER NOT NULL REFERENCES medicine_types(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      operator_id INTEGER REFERENCES users(id),
      drone_id INTEGER REFERENCES drones(id),
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'in-transit', 'delivered', 'cancelled', 'failed')),
      priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
      distance_km DECIMAL(6,2),
      eta_minutes INTEGER,
      estimated_arrival DATETIME,
      actual_arrival DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample deliveries for testing
    const sampleDeliveries = [
      [
        1,
        1,
        1,
        1,
        null,
        null,
        "pending",
        "high",
        15.5,
        45,
        null,
        null,
        "Urgent insulin delivery needed",
      ],
      [
        1,
        2,
        2,
        2,
        null,
        null,
        "pending",
        "normal",
        22.3,
        65,
        null,
        null,
        "Regular vaccine transport",
      ],
      [
        2,
        3,
        3,
        1,
        null,
        null,
        "pending",
        "emergency",
        8.7,
        25,
        null,
        null,
        "Emergency antibiotic delivery",
      ],
    ];

    sampleDeliveries.forEach((delivery) => {
      db.run(
        `INSERT OR IGNORE INTO deliveries (hospital_id, village_id, medicine_type_id, user_id, operator_id, drone_id, status, priority, distance_km, eta_minutes, actual_arrival, estimated_arrival, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        delivery
      );
    });

    console.log("Database initialized successfully");
  });
}

// Adapter to make SQLite work like PostgreSQL pool
const pool = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2, etc. to SQLite ? placeholders
      let sqliteQuery = text;
      console.log("🔍 Original query:", text);
      console.log("🔍 Original params:", params);

      if (params && params.length > 0) {
        for (let i = params.length; i >= 1; i--) {
          sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}`, "g"), "?");
        }
      }

      console.log("🔍 Converted SQLite query:", sqliteQuery);
      console.log("🔍 Final params:", params);

      if (sqliteQuery.toUpperCase().startsWith("SELECT")) {
        console.log("🔍 Using db.all() for SELECT query");
        db.all(sqliteQuery, params, (err, rows) => {
          console.log("🔍 db.all() callback - err:", err);
          console.log(
            "🔍 db.all() callback - rows count:",
            rows ? rows.length : 0
          );
          console.log(
            "🔍 db.all() callback - rows:",
            JSON.stringify(rows).substring(0, 500)
          );
          if (err) {
            console.error(
              "SQLite query error:",
              err,
              "Query:",
              sqliteQuery,
              "Params:",
              params
            );
            reject(err);
          } else {
            console.log("🔍 Resolving with", rows ? rows.length : 0, "rows");
            resolve({ rows: rows || [] });
          }
        });
      } else {
        db.run(sqliteQuery, params, function (err) {
          if (err) {
            console.error(
              "SQLite query error:",
              err,
              "Query:",
              sqliteQuery,
              "Params:",
              params
            );
            reject(err);
          } else {
            // Emulate RETURNING by selecting affected row(s)
            if (sqliteQuery.toUpperCase().includes("RETURNING")) {
              const upper = sqliteQuery.toUpperCase();
              // Determine table name
              const insertMatch = upper.match(/INSERT\s+INTO\s+(\w+)/i);
              const updateMatch = upper.match(/UPDATE\s+(\w+)/i);
              const tableName =
                (insertMatch && insertMatch[1]) ||
                (updateMatch && updateMatch[1]) ||
                "users";

              // Determine id to select
              let idValue = null;
              if (insertMatch) {
                idValue = this.lastID;
              } else if (updateMatch) {
                // Find placeholder index for WHERE id = $n in original text
                const whereIdMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
                if (whereIdMatch) {
                  const idx = parseInt(whereIdMatch[1], 10) - 1;
                  idValue = params[idx];
                }
              }

              if (idValue != null) {
                const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
                db.get(selectQuery, [idValue], (selectErr, row) => {
                  if (selectErr) {
                    reject(selectErr);
                  } else {
                    resolve({ rows: row ? [row] : [], rowCount: this.changes });
                  }
                });
              } else {
                resolve({ rows: [], rowCount: this.changes });
              }
            } else {
              resolve({ rows: [], rowCount: this.changes });
            }
          }
        });
      }
    });
  },
};

module.exports = pool;
