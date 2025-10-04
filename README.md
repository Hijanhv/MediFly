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
- PostgreSQL with pg driver
- JWT for authentication
- bcrypt for password hashing
- Docker

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Leaflet.js for maps
- Tailwind CSS

## Project Structure

```
mediFly/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
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
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json
└── README.md
```

## Setup Instructions

### 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## 🚀 Quick Start with Docker

1. **Clone the repository**
```bash
git clone <your-repo>
cd mediFly
```

2. **Create environment file**
```bash
cp env.example .env
```

3. **Start all services**
```bash
docker compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend on port 3000

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

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

## Sample Data

The application includes hardcoded sample data for:

- **Hospitals**: Sassoon General Hospital, KEM Hospital (Pune), Mayo Hospital, Government Medical College (Nagpur)
- **Villages**: Wagholi, Hadapsar, Kharadi (Pune), Kamptee, Umred, Hingna (Nagpur)
- **Drones**: 4 MediDrones with different battery levels and statuses
- **Medicine Types**: Insulin, Vaccine, Blood Pack

## Customization

### Adding New Locations

To add new hospitals or villages, modify the arrays in `backend/server.js`:

```javascript
const hospitals = [
  {
    id: 1,
    name: "Hospital Name",
    city: "City",
    coordinates: [latitude, longitude],
  },
  // Add more hospitals...
];

const villages = [
  {
    id: 1,
    name: "Village Name",
    city: "City",
    coordinates: [latitude, longitude],
  },
  // Add more villages...
];
```

### Changing Map Center

To change the default map center, modify `centerPosition` in `frontend/src/components/MapComponent.js`:

```javascript
const centerPosition = [latitude, longitude];
```

### Customizing Colors

To customize the medical theme colors, modify `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'medical-blue': '#0066cc',
      'medical-red': '#dc2626',
      'medical-light': '#f0f9ff',
    },
  },
},
```

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 5000 or 3000 is already in use, the servers will automatically try the next available port.

2. **CORS errors**: Make sure the backend server is running before starting the frontend.

3. **Map not loading**: Check your internet connection as the map tiles are loaded from OpenStreetMap servers.

4. **Drone animation not working**: Ensure all dependencies are properly installed and the backend server is running.

### Development Mode

For development with hot reload:

- Frontend: React development server automatically reloads on file changes
- Backend: Use `npm run dev` in the backend directory for nodemon auto-restart

## License

This project is for educational purposes only.

## Contributing

Feel free to submit issues and enhancement requests!
