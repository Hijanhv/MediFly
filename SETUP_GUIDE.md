# MediFly Quick Setup Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Create Environment File

```bash
cp env.example .env
```

The default values in `.env` are fine for local development.

### Step 2: Start Docker Services

```bash
docker compose up --build
```

This will:
- Build the backend and frontend containers
- Start PostgreSQL database
- Initialize the database with schema
- Start all services

**Wait for**: `🚁 MediFly backend server running on port 5000`

### Step 3: Access the Application

Open your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 4: Create Your First Account

1. Click "Sign up" on the login page
2. Choose your role:
   - **User**: Request medical deliveries
   - **Operator**: Manage deliveries and drones
   - **Admin**: Configure the entire system

## 📝 Recommended Setup Order

### 1. Create an Admin Account
```
Email: admin@medifly.com
Password: admin123
Role: Admin
```

### 2. Add Initial Data (as Admin)

a. **Add Cities**
   - Go to Admin Panel → Cities
   - Example: Pune, Maharashtra (18.5204, 73.8567)

b. **Add Hospitals**
   - Go to Admin Panel → Hospitals
   - Example: Sassoon Hospital, Pune (18.5294, 73.8565)

c. **Add Villages**
   - Go to Admin Panel → Villages  
   - Example: Wagholi, Pune (18.5667, 73.9333)

d. **Add Medicine Types**
   - Go to Admin Panel → Medicines
   - Examples: Insulin 💉, Vaccine 🧪, Blood Pack 🩸

e. **Add Drones**
   - Go to Admin Panel → Drones
   - Example: MediDrone-01, Battery: 100%

### 3. Create Operator Account
```
Email: operator@medifly.com
Password: operator123
Role: Operator
```

### 4. Create User Account
```
Email: user@medifly.com
Password: user123
Role: User
```

## 🎯 Testing the Complete Flow

### As User:
1. Login with user account
2. Request a delivery:
   - Select hospital (pickup)
   - Select village (delivery)
   - Select medicine type
   - Set priority
   - Submit request
3. Watch delivery status update

### As Operator:
1. Login with operator account
2. View pending deliveries
3. Click "Assign & Prepare" on a delivery
4. Click "Launch Drone" when ready
5. Click "Mark as Delivered" when complete

### As Admin:
1. Login with admin account
2. Manage all system data
3. Add/edit/delete cities, hospitals, villages, medicines, drones

## 🛑 Stopping the Application

```bash
# Stop services but keep data
docker compose down

# Stop services and remove data
docker compose down -v
```

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if database is healthy
docker compose ps

# View backend logs
docker compose logs backend
```

### Port Already in Use
Edit `.env` file:
```
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Reset Everything
```bash
docker compose down -v
docker compose up --build
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Public Endpoints
- `GET /api/hospitals` - List hospitals
- `GET /api/villages` - List villages
- `GET /api/medicine-types` - List medicine types
- `GET /api/drones` - List drones

### Deliveries (requires authentication)
- `GET /api/deliveries` - List user's deliveries
- `POST /api/deliveries` - Create delivery request
- `PATCH /api/deliveries/:id/assign` - Assign operator/drone
- `PATCH /api/deliveries/:id/status` - Update status
- `DELETE /api/deliveries/:id` - Cancel delivery

### Admin Endpoints (requires admin role)
- Full CRUD operations for:
  - `/api/admin/cities`
  - `/api/admin/hospitals`
  - `/api/admin/villages`
  - `/api/admin/medicine-types`
  - `/api/admin/drones`

## 🎉 You're All Set!

Your mediFly system is now running with:
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Admin panel for data management
- ✅ Operator panel for delivery management
- ✅ User interface for requesting deliveries
- ✅ Real-time tracking and updates