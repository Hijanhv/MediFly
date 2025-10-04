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

-- Create cities table (no coordinates)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(255),
    country VARCHAR(255) DEFAULT 'India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined cities
INSERT INTO cities (name, state) VALUES
('Pune', 'Maharashtra'),
('Mumbai', 'Maharashtra'),
('Delhi', 'Delhi'),
('Bangalore', 'Karnataka'),
('Chennai', 'Tamil Nadu'),
('Kolkata', 'West Bengal'),
('Hyderabad', 'Telangana'),
('Ahmedabad', 'Gujarat'),
('Jaipur', 'Rajasthan'),
('Lucknow', 'Uttar Pradesh')
ON CONFLICT (name) DO NOTHING;

-- Create hospitals table (no coordinates)
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    address TEXT,
    contact_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample hospitals
INSERT INTO hospitals (name, city_id, address, contact_number) VALUES
('Sassoon General Hospital', 1, 'Wanowrie, Pune - 411040', '+91-20-2612-8000'),
('Jehangir Hospital', 1, 'Sassoon Road, Pune - 411001', '+91-20-6666-2222'),
('KEM Hospital', 2, 'Parel, Mumbai - 400012', '+91-22-2410-7000'),
('Lilavati Hospital', 2, 'Bandra West, Mumbai - 400050', '+91-22-2675-0000'),
('AIIMS', 3, 'Ansari Nagar, New Delhi - 110029', '+91-11-2658-8500'),
('Apollo Hospital', 3, 'Sarita Vihar, New Delhi - 110076', '+91-11-2692-5801'),
('Manipal Hospital', 4, 'Halasuru, Bangalore - 560008', '+91-80-2222-1111'),
('Fortis Hospital', 4, 'Bannerghatta Road, Bangalore - 560076', '+91-80-6621-4444'),
('Apollo Hospitals', 5, 'Greams Road, Chennai - 600006', '+91-44-2829-3333'),
('Fortis Malar Hospital', 5, 'Adyar, Chennai - 600020', '+91-44-4289-2222'),
('Medica Superspecialty Hospital', 6, 'Mukundapur, Kolkata - 700099', '+91-33-6642-8888'),
('AMRI Hospital', 6, 'Salt Lake, Kolkata - 700064', '+91-33-2329-4444'),
('Care Hospitals', 7, 'Banjara Hills, Hyderabad - 500034', '+91-40-4455-0000'),
('Yashoda Hospitals', 7, 'Secunderabad, Hyderabad - 500003', '+91-40-4567-8888'),
('Shalby Hospitals', 8, 'Satellite, Ahmedabad - 380015', '+91-79-4020-3000'),
('Zydus Hospitals', 8, 'SG Highway, Ahmedabad - 380054', '+91-79-6671-8888'),
('SMS Hospital', 9, 'Rambagh Circle, Jaipur - 302015', '+91-141-254-7000'),
('Fortis Escorts Hospital', 9, 'Malviya Nagar, Jaipur - 302017', '+91-141-399-9000'),
('KGMU', 10, 'Chowk, Lucknow - 226003', '+91-522-2257-4500'),
('Medanta Hospital', 10, 'Gomti Nagar, Lucknow - 226010', '+91-522-2745-1000')
ON CONFLICT DO NOTHING;

-- Create villages table (no coordinates)
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample villages
INSERT INTO villages (name, city_id, population) VALUES
('Wagholi', 1, 50000),
('Hinjewadi', 1, 75000),
('Khadki', 1, 35000),
('Pimpri', 1, 150000),
('Chinchwad', 1, 120000),
('Kalyan', 2, 80000),
('Thane', 2, 100000),
('Navi Mumbai', 2, 90000),
('Vasai', 2, 60000),
('Virar', 2, 70000),
('Gurgaon', 3, 110000),
('Noida', 3, 95000),
('Ghaziabad', 3, 85000),
('Faridabad', 3, 75000),
('Dwarka', 3, 65000),
('Whitefield', 4, 80000),
('Electronic City', 4, 70000),
('HSR Layout', 4, 55000),
('Marathahalli', 4, 60000),
('Bannerghatta', 4, 45000),
('Tambaram', 5, 70000),
('Ambattur', 5, 65000),
('Avadi', 5, 60000),
('Pallikaranai', 5, 50000),
('Sholinganallur', 5, 55000),
('Salt Lake City', 6, 90000),
('Rajarhat', 6, 75000),
('Dumdum', 6, 60000),
('Behala', 6, 55000),
('Garia', 6, 50000),
('Madhapur', 7, 70000),
('Kondapur', 7, 65000),
('Gachibowli', 7, 60000),
('Kukatpally', 7, 80000),
('Lingampally', 7, 55000),
('Bodakdev', 8, 60000),
('Prahlad Nagar', 8, 55000),
('Satellite', 8, 70000),
('Vastrapur', 8, 50000),
('Gota', 8, 65000),
('Mansarovar', 9, 70000),
('Vaishali Nagar', 9, 60000),
('Jagatpura', 9, 55000),
('Malviya Nagar', 9, 50000),
('Jhotwara', 9, 65000),
('Gomti Nagar', 10, 75000),
('Alambagh', 10, 60000),
('Indira Nagar', 10, 55000),
('Hazratganj', 10, 50000),
('Aliganj', 10, 45000)
ON CONFLICT DO NOTHING;

-- Create medicine types table
CREATE TABLE IF NOT EXISTS medicine_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(10),
    description TEXT,
    requires_refrigeration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample medicine types
INSERT INTO medicine_types (name, icon, description, requires_refrigeration) VALUES
('Insulin', '💉', 'Diabetes medication requiring refrigeration', TRUE),
('Vaccine', '🧪', 'Immunization vaccines', TRUE),
('Blood Pack', '🩸', 'Blood transfusion packs', TRUE),
('Antibiotics', '💊', 'Common antibiotics', FALSE),
('Pain Killers', '🌡️', 'Pain relief medication', FALSE),
('Antivirals', '🦠', 'Antiviral medications', TRUE),
('Heart Medication', '❤️', 'Cardiovascular drugs', FALSE),
('Allergy Medicine', '🤧', 'Antihistamines', FALSE),
('Cancer Drugs', '🎗️', 'Chemotherapy medications', TRUE),
('Vitamins', '🌿', 'Dietary supplements', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Create drones table (no coordinates)
CREATE TABLE IF NOT EXISTS drones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    model VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'delivering', 'maintenance', 'charging')),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    max_payload_kg DECIMAL(5, 2) DEFAULT 5.0,
    max_range_km DECIMAL(6, 2) DEFAULT 50.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample drones
INSERT INTO drones (name, model, battery_level, max_payload_kg, max_range_km, status) VALUES
('MediDrone-01', 'MD-X1', 100, 5.0, 50.0, 'available'),
('MediDrone-02', 'MD-X2', 85, 6.0, 60.0, 'available'),
('MediDrone-03', 'MD-X1', 92, 5.0, 50.0, 'available'),
('MediDrone-04', 'MD-X3', 78, 7.0, 70.0, 'available'),
('MediDrone-05', 'MD-X2', 65, 6.0, 60.0, 'charging'),
('MediDrone-06', 'MD-X1', 40, 5.0, 50.0, 'maintenance'),
('MediDrone-07', 'MD-X3', 88, 7.0, 70.0, 'available'),
('MediDrone-08', 'MD-X2', 95, 6.0, 60.0, 'available'),
('MediDrone-09', 'MD-X1', 72, 5.0, 50.0, 'available'),
('MediDrone-10', 'MD-X3', 81, 7.0, 70.0, 'delivering')
ON CONFLICT (name) DO NOTHING;

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