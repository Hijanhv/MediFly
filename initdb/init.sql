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

-- Create cities table with geolocation
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(255),
    country VARCHAR(255) DEFAULT 'India',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined cities with accurate coordinates
INSERT INTO cities (name, state, latitude, longitude) VALUES
('Pune', 'Maharashtra', 18.52043030, 73.85674370),
('Mumbai', 'Maharashtra', 19.07283050, 72.88261270),
('Delhi', 'Delhi', 28.70405920, 77.10249020),
('Bangalore', 'Karnataka', 12.97159880, 77.59456420),
('Chennai', 'Tamil Nadu', 13.08268400, 80.27071840),
('Kolkata', 'West Bengal', 22.57264630, 88.36389450),
('Hyderabad', 'Telangana', 17.38504700, 78.48667170),
('Ahmedabad', 'Gujarat', 23.02579520, 72.58727310),
('Jaipur', 'Rajasthan', 26.91243260, 75.78727090),
('Lucknow', 'Uttar Pradesh', 26.84670880, 80.94615920)
ON CONFLICT (name) DO NOTHING;

-- Create hospitals table with geolocation
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    address TEXT,
    contact_number VARCHAR(50),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample hospitals with accurate coordinates
INSERT INTO hospitals (name, city_id, address, contact_number, latitude, longitude) VALUES
-- Pune hospitals
('Sassoon General Hospital', 1, 'Wanowrie, Pune - 411040', '+91-20-2612-8000', 18.50306700, 73.88027800),
('Jehangir Hospital', 1, 'Sassoon Road, Pune - 411001', '+91-20-6666-2222', 18.52884100, 73.88495400),
-- Mumbai hospitals
('KEM Hospital', 2, 'Parel, Mumbai - 400012', '+91-22-2410-7000', 19.00518300, 72.84239800),
('Lilavati Hospital', 2, 'Bandra West, Mumbai - 400050', '+91-22-2675-0000', 19.05617600, 72.83046700),
-- Delhi hospitals
('AIIMS', 3, 'Ansari Nagar, New Delhi - 110029', '+91-11-2658-8500', 28.56809800, 77.21011300),
('Apollo Hospital', 3, 'Sarita Vihar, New Delhi - 110076', '+91-11-2692-5801', 28.53432700, 77.29208600),
-- Bangalore hospitals
('Manipal Hospital', 4, 'Halasuru, Bangalore - 560008', '+91-80-2222-1111', 12.98231400, 77.62711700),
('Fortis Hospital', 4, 'Bannerghatta Road, Bangalore - 560076', '+91-80-6621-4444', 12.89954300, 77.60349900),
-- Chennai hospitals
('Apollo Hospitals', 5, 'Greams Road, Chennai - 600006', '+91-44-2829-3333', 13.06019200, 80.25648100),
('Fortis Malar Hospital', 5, 'Adyar, Chennai - 600020', '+91-44-4289-2222', 13.00592800, 80.25771100),
-- Kolkata hospitals
('Medica Superspecialty Hospital', 6, 'Mukundapur, Kolkata - 700099', '+91-33-6642-8888', 22.50209300, 88.39545200),
('AMRI Hospital', 6, 'Salt Lake, Kolkata - 700064', '+91-33-2329-4444', 22.58493800, 88.42025300),
-- Hyderabad hospitals
('Care Hospitals', 7, 'Banjara Hills, Hyderabad - 500034', '+91-40-4455-0000', 17.41964600, 78.44683300),
('Yashoda Hospitals', 7, 'Secunderabad, Hyderabad - 500003', '+91-40-4567-8888', 17.44220800, 78.49750600),
-- Ahmedabad hospitals
('Shalby Hospitals', 8, 'Satellite, Ahmedabad - 380015', '+91-79-4020-3000', 23.02636400, 72.51431100),
('Zydus Hospitals', 8, 'SG Highway, Ahmedabad - 380054', '+91-79-6671-8888', 23.00763800, 72.50783900),
-- Jaipur hospitals
('SMS Hospital', 9, 'Rambagh Circle, Jaipur - 302015', '+91-141-254-7000', 26.90896100, 75.78878100),
('Fortis Escorts Hospital', 9, 'Malviya Nagar, Jaipur - 302017', '+91-141-399-9000', 26.85258500, 75.81378200),
-- Lucknow hospitals
('KGMU', 10, 'Chowk, Lucknow - 226003', '+91-522-2257-4500', 26.84764700, 80.94226800),
('Medanta Hospital', 10, 'Gomti Nagar, Lucknow - 226010', '+91-522-2745-1000', 26.85461200, 81.00730100)
ON CONFLICT DO NOTHING;

-- Create villages table with geolocation
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    population INTEGER,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample villages/suburbs with accurate coordinates
INSERT INTO villages (name, city_id, population, latitude, longitude) VALUES
-- Pune suburbs
('Wagholi', 1, 50000, 18.57909600, 73.98243300),
('Hinjewadi', 1, 75000, 18.59082700, 73.73954200),
('Khadki', 1, 35000, 18.56306700, 73.84636200),
('Pimpri', 1, 150000, 18.62916200, 73.80146100),
('Chinchwad', 1, 120000, 18.64377500, 73.80431600),
-- Mumbai suburbs
('Kalyan', 2, 80000, 19.24370300, 73.13554900),
('Thane', 2, 100000, 19.21813900, 72.97849360),
('Navi Mumbai', 2, 90000, 19.03303400, 73.02966800),
('Vasai', 2, 60000, 19.46188700, 72.81247700),
('Virar', 2, 70000, 19.45591500, 72.81136000),
-- Delhi NCR
('Gurgaon', 3, 110000, 28.45949600, 77.02667800),
('Noida', 3, 95000, 28.57349500, 77.32490000),
('Ghaziabad', 3, 85000, 28.66953500, 77.45375800),
('Faridabad', 3, 75000, 28.41242400, 77.31786600),
('Dwarka', 3, 65000, 28.59229600, 77.04613500),
-- Bangalore suburbs
('Whitefield', 4, 80000, 12.96983500, 77.74985300),
('Electronic City', 4, 70000, 12.84535500, 77.66346300),
('HSR Layout', 4, 55000, 12.91157600, 77.64115200),
('Marathahalli', 4, 60000, 12.95917200, 77.70170900),
('Bannerghatta', 4, 45000, 12.80030100, 77.57668400),
-- Chennai suburbs
('Tambaram', 5, 70000, 12.92265100, 80.12718300),
('Ambattur', 5, 65000, 13.09832200, 80.16215300),
('Avadi', 5, 60000, 13.11470900, 80.10964700),
('Pallikaranai', 5, 50000, 12.94637600, 80.21980400),
('Sholinganallur', 5, 55000, 12.90074900, 80.22737300),
-- Kolkata suburbs
('Salt Lake City', 6, 90000, 22.61090900, 88.39816200),
('Rajarhat', 6, 75000, 22.62110300, 88.46531100),
('Dumdum', 6, 60000, 22.65444400, 88.42554400),
('Behala', 6, 55000, 22.49842300, 88.31067800),
('Garia', 6, 50000, 22.46716800, 88.38069800),
-- Hyderabad suburbs
('Madhapur', 7, 70000, 17.44865000, 78.39122100),
('Kondapur', 7, 65000, 17.46505700, 78.36484800),
('Gachibowli', 7, 60000, 17.44021300, 78.34867600),
('Kukatpally', 7, 80000, 17.49463900, 78.41385700),
('Lingampally', 7, 55000, 17.49530200, 78.32472200),
-- Ahmedabad suburbs
('Bodakdev', 8, 60000, 23.03953700, 72.50392700),
('Prahlad Nagar', 8, 55000, 23.00765100, 72.50730800),
('Satellite', 8, 70000, 23.02636400, 72.51431100),
('Vastrapur', 8, 50000, 23.03858200, 72.52476100),
('Gota', 8, 65000, 23.10800600, 72.55621400),
-- Jaipur suburbs
('Mansarovar', 9, 70000, 26.88773500, 75.76771100),
('Vaishali Nagar', 9, 60000, 26.93164600, 75.72629700),
('Jagatpura', 9, 55000, 26.82874400, 75.87119700),
('Malviya Nagar', 9, 50000, 26.85258500, 75.81378200),
('Jhotwara', 9, 65000, 26.95255200, 75.78027400),
-- Lucknow suburbs
('Gomti Nagar', 10, 75000, 26.85461200, 81.00730100),
('Alambagh', 10, 60000, 26.82110700, 80.93177900),
('Indira Nagar', 10, 55000, 26.89315100, 80.99975700),
('Hazratganj', 10, 50000, 26.84970000, 80.94590000),
('Aliganj', 10, 45000, 26.89646300, 80.92765400)
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

-- Create drones table
CREATE TABLE IF NOT EXISTS drones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    model VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'delivering', 'maintenance', 'charging')),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    max_payload_kg DECIMAL(5, 2) DEFAULT 5.0,
    max_range_km DECIMAL(6, 2) DEFAULT 50.0,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample drones (initially positioned at Pune)
INSERT INTO drones (name, model, battery_level, max_payload_kg, max_range_km, status, current_latitude, current_longitude) VALUES
('MediDrone-01', 'MD-X1', 100, 5.0, 50.0, 'available', 18.52043030, 73.85674370),
('MediDrone-02', 'MD-X2', 85, 6.0, 60.0, 'available', 18.52043030, 73.85674370),
('MediDrone-03', 'MD-X1', 92, 5.0, 50.0, 'available', 19.07283050, 72.88261270),
('MediDrone-04', 'MD-X3', 78, 7.0, 70.0, 'available', 19.07283050, 72.88261270),
('MediDrone-05', 'MD-X2', 65, 6.0, 60.0, 'charging', 28.70405920, 77.10249020),
('MediDrone-06', 'MD-X1', 40, 5.0, 50.0, 'maintenance', 28.70405920, 77.10249020),
('MediDrone-07', 'MD-X3', 88, 7.0, 70.0, 'available', 12.97159880, 77.59456420),
('MediDrone-08', 'MD-X2', 95, 6.0, 60.0, 'available', 12.97159880, 77.59456420),
('MediDrone-09', 'MD-X1', 72, 5.0, 50.0, 'available', 13.08268400, 80.27071840),
('MediDrone-10', 'MD-X3', 81, 7.0, 70.0, 'delivering', 22.57264630, 88.36389450)
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
CREATE INDEX idx_cities_coordinates ON cities(latitude, longitude);
CREATE INDEX idx_hospitals_coordinates ON hospitals(latitude, longitude);
CREATE INDEX idx_villages_coordinates ON villages(latitude, longitude);

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

-- Create geospatial distance calculation function (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL(6, 2) AS $$
DECLARE
    r DECIMAL := 6371; -- Earth's radius in kilometers
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);

    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);

    c := 2 * atan2(sqrt(a), sqrt(1-a));

    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
