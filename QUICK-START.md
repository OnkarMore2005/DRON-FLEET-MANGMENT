# 🚀 Quick Start Guide

## Step 1: Install All Dependencies (One-Time Setup)

Open PowerShell and run:

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

## Step 2: Start All Applications

**Open 4 separate PowerShell terminals** and run one command in each:

### Terminal 1 - Backend (Port 5000)
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\backend"
npm run seed
npm run dev
```

### Terminal 2 - User App (Port 3000)
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\user-app"
npm run dev
```

### Terminal 3 - Provider App (Port 3001)
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\provider-app"
npm run dev
```

### Terminal 4 - Admin App (Port 3002)
```powershell
cd "D:\Projects\DRON FLEET MANGMENT\admin-app"
npm run dev
```

## Step 3: Access the Applications

Once all servers are running, open your browser:

- **User Portal**: http://localhost:3000
  - Login: rahul@gmail.com / password123
  
- **Provider Portal**: http://localhost:3001
  - Login: mumbai@drones.com / password123
  
- **Admin Portal**: http://localhost:3002
  - Login: admin@drone.com / password123

## ⚠️ Important Notes

### In-Memory Database
- The backend database resets every time you restart the server
- **Always run `npm run seed`** before starting the backend with `npm run dev`
- Data is not persistent between server restarts

### Quick Restart
If you need to restart the backend:
1. Press `Ctrl+C` in Terminal 1
2. Run `npm run seed` again
3. Run `npm run dev`

### First-Time Login
Use the test credentials provided above. All passwords are: `password123`

## 📝 Testing Workflow

1. **User App** → Register/Login → Browse Services → Book a Service → Use test card `4111 1111 1111 1111`
2. **Provider App** → Login → Manage Drones → Accept/Reject Bookings
3. **Admin App** → Login → View Analytics → Manage Users/Providers

## 🛑 Stop All Servers

Press `Ctrl+C` in each terminal to stop the respective server.
