-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'operator', 'admin')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table with predefined coordinates
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(255),
    country VARCHAR(255) DEFAULT 'India',
    latitude DECIMAL(11, 8),
    longitude DECIMAL(12, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some predefined cities with coordinates
INSERT INTO cities (name, state, latitude, longitude) VALUES
('Pune', 'Maharashtra', 18.5204, 73.8567),
('Mumbai', 'Maharashtra', 19.0760, 72.8777),
('Delhi', 'Delhi', 28.6139, 77.2090),
('Bangalore', 'Karnataka', 12.9716, 77.5946),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707)
ON CONFLICT (name) DO NOTHING;

-- Create hospitals table (coordinates optional, will use city coordinates)
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    address TEXT,
    contact_number VARCHAR(50),
    latitude DECIMAL(11, 8),
    longitude DECIMAL(12, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create villages table (coordinates optional, will use city coordinates)
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(12, 8),
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medicine types table
CREATE TABLE IF NOT EXISTS medicine_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(10),
    description TEXT,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample medicine types
INSERT INTO medicine_types (name, icon, description, requires_refrigeration) VALUES
('Insulin', '💉', 'Diabetes medication requiring refrigeration', TRUE),
('Vaccine', '🧪', 'Immunization vaccines', TRUE),
('Blood Pack', '🩸', 'Blood transfusion packs', TRUE),
('Antibiotics', '💊', 'Common antibiotics', FALSE),
('Pain Killers', '🌡️', 'Pain relief medication', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Create drones table
CREATE TABLE IF NOT EXISTS drones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    model VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'delivering', 'maintenance', 'charging')),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    max_payload_kg DECIMAL(5, 2) DEFAULT 5.0,
    max_range_km DECIMAL(6, 2) DEFAULT 50.0,
    current_latitude DECIMAL(11, 8),
    current_longitude DECIMAL(12, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    drone_id INTEGER REFERENCES drones(id) ON DELETE SET NULL,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    village_id INTEGER REFERENCES villages(id) ON DELETE CASCADE,
    medicine_type_id INTEGER REFERENCES medicine_types(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    operator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'in-transit', 'delivered', 'cancelled', 'failed')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
    distance_km DECIMAL(6, 2),
    eta_minutes INTEGER,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX idx_drones_status ON drones(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drones_updated_at BEFORE UPDATE ON drones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();