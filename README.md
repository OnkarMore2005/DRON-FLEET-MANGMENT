# 🚁 Drone Service Booking Platform

A **fully functional** drone service booking platform with 3 separate web applications (User, Provider, Admin) running 100% on **localhost** with **ZERO external APIs** - everything works offline after setup!

## 🎯 Features

### ✅ **100% Localhost** - No external dependencies after setup
### ✅ **3 Separate Apps** - User, Provider, and Admin portals
### ✅ **Fake Payment System** - Simulated Razorpay integration
### ✅ **Interactive Maps** - Leaflet with OpenStreetMap (free tiles)
### ✅ **Complete CRUD** - Full booking lifecycle management
### ✅ **Analytics Dashboard** - Charts and reports
### ✅ **SQLite Database** - Single file database

---

## 📁 Project Structure

```
DRON FLEET MANGMENT/
├── backend/              # Node.js + Express + TypeScript (Port 5000)
│   ├── src/
│   │   ├── database/     # SQLite database setup
│   │   ├── middleware/   # JWT authentication
│   │   ├── routes/       # API endpoints
│   │   ├── index.ts      # Server entry point
│   │   └── seed.ts       # Database seeding script
│   ├── package.json
│   └── database.sqlite   # Created after first run
│
├── user-app/             # React + Vite + Tailwind (Port 3000)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Navbar, etc.
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Home, Services, Booking, Dashboard
│   │   └── App.tsx
│   └── package.json
│
├── provider-app/         # React + Vite + Tailwind (Port 3001)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Navbar
│   │   ├── pages/        # Dashboard, Drones, Bookings
│   │   └── App.tsx
│   └── package.json
│
└── admin-app/            # React + Vite + Tailwind (Port 3002)
    ├── src/
    │   ├── api/          # API client
    │   ├── components/   # Sidebar
    │   ├── pages/        # Dashboard, Users, Providers, Bookings, Analytics
    │   └── App.tsx
    └── package.json
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn

### **Step 1: Install Dependencies**

```powershell
# Backend
cd "D:\Projects\DRON FLEET MANGMENT\backend"
npm install

# User App
cd "D:\Projects\DRON FLEET MANGMENT\user-app"
npm install

# Provider App
cd "D:\Projects\DRON FLEET MANGMENT\provider-app"
npm install

# Admin App
cd "D:\Projects\DRON FLEET MANGMENT\admin-app"
npm install
```

### **Step 2: Seed Database**

```powershell
cd "D:\Projects\DRON FLEET MANGMENT\backend"
npm run seed
```

**⚠️ Important:** The database runs in-memory, so you'll need to run this seed command **every time** you restart the backend server.

This will create:
- ✅ 1 Admin user
- ✅ 3 Regular users
- ✅ 5 Providers (Mumbai, Delhi, Bangalore, Hyderabad, Chennai)
- ✅ 8 Services (Aerial Photography, Wedding, Real Estate, etc.)
- ✅ Drones for each provider
- ✅ 15 Sample bookings

---

## 🎮 Running the Platform

**Open 4 separate terminals and run:**

### **Terminal 1: Backend API**
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\backend"
npm run dev
```
✅ Server: http://localhost:5000

### **Terminal 2: User Portal**
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\user-app"
npm run dev
```
✅ App: http://localhost:3000

### **Terminal 3: Provider Portal**
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\provider-app"
npm run dev
```
✅ App: http://localhost:3001

### **Terminal 4: Admin Portal**
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\admin-app"
npm run dev
```
✅ App: http://localhost:3002

---

## 🔑 Test Credentials

### **👤 User Portal** (http://localhost:3000)
```
Email: rahul@gmail.com
Password: password123
```

### **🏢 Provider Portal** (http://localhost:3001)
```
Email: mumbai@drones.com
Password: password123
```

### **⚙️ Admin Portal** (http://localhost:3002)
```
Email: admin@drone.com
Password: password123
```

**All passwords:** `password123`

---

## 🎯 User Features (Port 3000)

### **🏠 Home Page**
- Hero section with call-to-action
- Feature highlights
- Popular services preview

### **📦 Services Page**
- Browse all services
- Filter by category
- Search functionality
- Service cards with pricing

### **🗺️ Booking Flow**
1. **Select Location** - Click on map to set job location
2. **Choose Provider** - See nearby providers (by distance)
3. **Schedule Details** - Date, time, duration
4. **Review & Pay** - Fake Razorpay payment

### **💳 Fake Payment System**
- Test Card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV
- Instant payment confirmation

### **📊 Dashboard**
- View all bookings
- Filter by status
- Booking details with provider info
- Payment status

---

## 🏢 Provider Features (Port 3001)

### **📊 Dashboard**
- KPI cards (Total bookings, Pending, Completed, Earnings)
- Monthly earnings chart
- Bookings by category chart
- Recent bookings table

### **🚁 Drone Management**
- Add/Edit/Delete drones
- Set pricing (per hour)
- Availability toggle
- Drone specifications

### **📅 Bookings Management**
- View all bookings
- Filter by status
- Accept/Reject pending bookings
- Start job (CONFIRMED → IN_PROGRESS)
- Complete job (IN_PROGRESS → COMPLETED)
- View job location on map

---

## ⚙️ Admin Features (Port 3002)

### **📊 Dashboard**
- KPI cards (Users, Providers, Bookings, Revenue)
- Monthly performance chart
- Top services by bookings
- Revenue distribution pie chart

### **👥 User Management**
- View all users
- Search by name/email
- Filter by role (USER/PROVIDER/ADMIN)
- Delete users

### **🏢 Provider Management**
- Approve/Reject provider applications
- View provider details
- Filter by status (PENDING/APPROVED/REJECTED)
- Reconsider rejected providers

### **📦 Bookings Management**
- View all platform bookings
- Filter by status and date range
- Export to CSV
- Revenue analytics

### **📈 Analytics**
- Monthly trends (bookings & revenue)
- Service performance comparison
- Revenue distribution
- Detailed service analytics table

---

## 🗄️ Database Schema

### **Tables:**
1. **users** - All users (USER/PROVIDER/ADMIN roles)
2. **providers** - Provider profiles with status
3. **drones** - Provider's drone fleet
4. **services** - Available services
5. **bookings** - All bookings with location
6. **payments** - Fake payment records

---

## 🔌 API Endpoints

### **Authentication**
```
POST /api/auth/register-user
POST /api/auth/register-provider
POST /api/auth/login
POST /api/auth/admin-login
```

### **Services**
```
GET  /api/services
GET  /api/services/:id
```

### **Providers**
```
GET  /api/providers?lat=19.07&lng=72.87&radius=100
GET  /api/providers/:id
```

### **Bookings**
```
POST /api/bookings
GET  /api/bookings/mine
GET  /api/bookings/provider
PATCH /api/bookings/:id/status
```

### **Payments (Fake)**
```
POST /api/payments/create-order
POST /api/payments/verify
GET  /api/payments/:booking_id
```

### **Drones (Provider)**
```
GET    /api/drones
POST   /api/drones
PUT    /api/drones/:id
DELETE /api/drones/:id
```

### **Admin**
```
GET   /api/admin/stats
GET   /api/admin/users
DELETE /api/admin/users/:id
GET   /api/admin/providers
PATCH /api/admin/providers/:id/status
GET   /api/admin/bookings
GET   /api/admin/analytics/bookings
GET   /api/admin/analytics/services
```

---

## 🗺️ Maps Integration

- **Library:** Leaflet.js + React-Leaflet
- **Tiles:** OpenStreetMap (no API key required)
- **Features:**
  - Click-to-select location
  - Provider markers
  - Distance calculation (Haversine formula)
  - Job location display

---

## 💰 Fake Payment Flow

1. User clicks "Confirm & Pay"
2. Backend generates fake order ID: `order_1234567_abc`
3. Payment modal shows test card info
4. User clicks "Pay ₹X"
5. Backend generates fake payment ID: `pay_1234567_xyz`
6. Booking status → CONFIRMED
7. Payment status → PAID
8. Console logs payment confirmation email

---

## 🎨 Tech Stack

### **Backend**
- In-Memory Database (no external dependencies
- TypeScript
- SQLite (better-sqlite3)
- JWT authentication
- bcryptjs for password hashing

### **Frontend (All 3 Apps)**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Axios
- Recharts (charts/analytics)
- Leaflet (maps)
- Lucide React (icons)

---

## 📝 Key Highlights

✅ **Zero External APIs** - Works completely offline  
✅ **Fake Payment System** - No Razorpay integration needed  
✅ **Free Maps** - OpenStreetMap tiles (no API key)  
✅ **In-Memory Database** - No C++ build tools required  
⚠️ **Data Persistence** - Database resets on server restart (in-memory)  
✅ **JWT Auth** - Secure authentication  
✅ **Email Simulation** - Console logs instead of SMTP  
✅ **Location-based Search** - Haversine distance formula  
✅ **Complete CRUD** - All operations implemented  
✅ **Responsive Design** - Tailwind CSS  
✅ **Charts & Analytics** - Recharts library  

---

## ⚠️ Important Notes

### **In-Memory Database**
The backend uses an **in-memory database** to avoid C++ compilation issues with better-sqlite3. This means:
- ✅ No build tools required - works on any system
- ✅ Instant setup - no database file management
- ⚠️ Data is lost when server restarts
- 💡 Re-run `npm run seed` after each server restart

### **Why In-Memory?**
The original SQLite package (better-sqlite3) requires Visual Studio Build Tools on Windows, which causes installation errors. The in-memory solution ensures the platform works immediately on any system without additional dependencies.  

---

## 🐛 Troubleshooting

### **Port Already in Use**
```powershell
# Kill process on port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### **Database Locked**
```powershell
# For in-memory database, just restart the server
# In one terminal:
cd "D:\Projects\DRON FLEET MANGMENT\backend"
# Press Ctrl+C to stop, then:
npm run seed
npm run dev
```

### **Clear Cache**
```powershell
# Frontend apps
npm run dev -- --force
```

---

## 📧 Console Email Logs

Payment confirmations and provider status updates are logged to the backend console:

```
📧 ========== PAYMENT CONFIRMATION EMAIL ==========
✅ Payment Successful!
Order ID: order_1703012345_abc123
Payment ID: pay_1703012345_xyz789
Booking ID: 5
User ID: 2
Timestamp: 12/25/2025, 11:30:00 PM
==================================================
```

---

## 🎯 Testing Workflow

1. **Register User** → http://localhost:3000/register
2. **Browse Services** → Select a service
3. **Book Service** → Click map, choose provider, set date/time
4. **Fake Payment** → Use test card `4111 1111 1111 1111`
5. **View Dashboard** → Check booking status
6. **Provider Login** → http://localhost:3001/login
7. **Manage Bookings** → Accept/Reject/Complete bookings
8. **Admin Login** → http://localhost:3002/login
9. **Approve Providers** → Manage platform
10. **Analytics** → View charts and export CSV

---

## 🚀 Production Build

```powershell
# Backend
cd backend
npm run build
npm start

# Each frontend app
cd user-app (or provider-app or admin-app)
npm run build
# Serve dist folder with static server
```

---

## 📄 License

This is a demo project for educational purposes.

---

## 🙏 Credits

- **Maps:** OpenStreetMap contributors
- **Icons:** Lucide React
- **Charts:** Recharts
- **UI:** Tailwind CSS

---

**🎉 Enjoy your fully functional drone booking platform!**
