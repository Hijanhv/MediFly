# MediFly – Drone-Based Medical Aid Delivery System

A complete full-stack web application for drone-based medical aid delivery with PostgreSQL database, JWT authentication, and role-based access control.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Operator, Admin)
- Secure password hashing with bcrypt

### User Roles

#### 👤 User
- Request medical deliveries
- View delivery status in real-time
- Track delivery history
- Cancel pending deliveries

#### 👨‍✈️ Delivery Operator
- View all pending and active deliveries
- Assign drones to deliveries
- Update delivery status (preparing, in-transit, delivered)
- Monitor drone fleet status

#### 🔧 Admin
- Manage cities, hospitals, and villages
- Add/edit/delete medicine types
- Manage drone fleet
- Full system configuration

### Technical Features
- Real-time delivery tracking with interactive map
- Automatic ETA calculation
- Drone status management
- PostgreSQL database with proper schema
- Docker Compose for easy deployment
- Responsive UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL with Drizzle ORM
- JWT for authentication
- bcrypt for password hashing
- Docker & Docker Compose

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Leaflet.js for maps
- Tailwind CSS

## Project Structure

```
MediFly/
├── backend/
│   ├── db/
│   │   ├── index.js           # Drizzle ORM connection
│   │   └── schema.js          # Database schema
│   ├── middleware/
│   │   └── auth.js            # JWT authentication & RBAC
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── admin.js           # Admin CRUD endpoints
│   │   ├── deliveries.js      # Delivery management
│   │   └── public.js          # Public data endpoints
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js              # Express server
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── MapComponent.js
│   │   │   └── DeliveryPanel.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── tailwind.config.js
│   └── package.json
├── initdb/
│   └── init.sql               # Database initialization
├── docker-compose.yml         # Production-ready Docker setup
├── .env                       # Environment variables
├── .env.example               # Environment template
├── README.md
└── SETUP_GUIDE.md
```

## Setup Instructions

### 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## 🚀 Quick Start with Docker

1. **Clone the repository**
```bash
git clone <your-repo>
cd MediFly
```

2. **Create environment file**
```bash
cp .env.example .env
```

Edit `.env` and change `JWT_SECRET` for production.

3. **Start all services**
```bash
docker-compose up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend on port 3000

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

5. **Check status**
```bash
docker-compose ps
docker-compose logs backend
```

## 🔐 Getting Started

1. **Create an Admin Account**
   - Go to http://localhost:3000
   - Click "Sign up"
   - Enter your details and select "Admin" role

2. **Add Initial Data** (as Admin)
   - Add cities with coordinates
   - Add hospitals in those cities
   - Add villages for delivery
   - Add medicine types (e.g., Insulin 💉, Vaccine 🧪)
   - Add drones to the fleet

3. **Create Operator & User Accounts**
   - Register with "Operator" role to manage deliveries
   - Register with "User" role to request deliveries

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## API Endpoints

### Hospitals

- `GET /api/hospitals` - Returns list of hospitals with coordinates

### Villages

- `GET /api/villages` - Returns list of villages with coordinates

### Medicine Types

- `GET /api/medicine-types` - Returns available medicine types

### Drones

- `GET /api/drones` - Returns list of drones with status and battery level

### Deliveries

- `POST /api/deliver` - Creates a new delivery request
  - Body: `{ hospitalId, villageId, medicineId }`
  - Returns: Delivery object with ETA and status
- `GET /api/deliveries` - Returns list of all deliveries

## How to Use

1. **Select a Hospital** (pickup location) from the dropdown
2. **Select a Village** (drop-off location) from the dropdown
3. **Select Medicine Type** (Insulin, Vaccine, or Blood Pack)
4. Click **"Send Drone"** to initiate the delivery
5. Watch the drone animation on the map as it flies from hospital to village
6. Monitor the delivery status and ETA in the side panel
7. View delivery history at the bottom of the panel

## 🗄️ Database Management

All data is managed through the Admin Panel in the web interface:

- **Cities**: Add cities with GPS coordinates
- **Hospitals**: Configure hospital locations and contact info
- **Villages**: Set up delivery destinations
- **Medicine Types**: Define available medicines
- **Drones**: Manage drone fleet status

No need to edit code - everything is database-driven!

## 🚢 Production Deployment

This setup is production-ready with:
- ✅ No volume mounts (prevents local dependency conflicts)
- ✅ `.dockerignore` files (excludes node_modules)
- ✅ Health checks for database
- ✅ Proper container dependencies
- ✅ Environment-based configuration

For production, update `.env`:
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
POSTGRES_PASSWORD=<strong-password>
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
```bash
# Edit .env to change ports
BACKEND_PORT=5001
FRONTEND_PORT=3001
# Then restart
docker-compose down && docker-compose up -d --build
```

2. **Backend keeps restarting**:
```bash
# Check logs
docker-compose logs backend

# Common fix: Rebuild without cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

3. **Database connection errors**:
```bash
# Check database health
docker-compose ps
# Should show postgres as "healthy"

# Reset database
docker-compose down -v
docker-compose up -d
```

4. **Map not loading**: Check internet connection (map tiles from OpenStreetMap)

### Development Mode

For development with hot reload (not recommended for production):

Add volume mounts back to `docker-compose.yml`:
```yaml
backend:
  volumes:
    - ./backend:/app
    - /app/node_modules
```

Or run locally:
```bash
cd backend && npm run dev
cd frontend && npm start
```

## License

This project is for educational purposes only.

## Contributing

Feel free to submit issues and enhancement requests!
