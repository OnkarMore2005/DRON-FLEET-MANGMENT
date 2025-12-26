import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database/db';

// Import routes
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import providersRoutes from './routes/providers';
import bookingsRoutes from './routes/bookings';
import paymentsRoutes from './routes/payments';
import dronesRoutes from './routes/drones';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure default accounts exist for quick login even after restart
const ensureDefaultAccounts = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);

  const findUser = db.prepare('SELECT * FROM users WHERE email = ?');

  // Admin
  const admin = findUser.get('admin@drone.com');
  if (!admin) {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)');
    stmt.run('Admin User', 'admin@drone.com', passwordHash, 'ADMIN', '+91-9999999999');
    console.log('✅ Auto-created admin: admin@drone.com / password123');
  }

  // Default user
  const user = findUser.get('rahul@gmail.com');
  if (!user) {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)');
    stmt.run('Rahul Sharma', 'rahul@gmail.com', passwordHash, 'USER', '+91-9876543210');
    console.log('✅ Auto-created user: rahul@gmail.com / password123');
  }

  // Default provider user + profile (auto-approved)
  const provider = findUser.get('mumbai@drones.com');
  if (!provider) {
    const userStmt = db.prepare('INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)');
    const result = userStmt.run('Mumbai Drones', 'mumbai@drones.com', passwordHash, 'PROVIDER', '+91-9876543220');

    const providerStmt = db.prepare(
      'INSERT INTO providers (user_id, company, cities, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)'
    );
    providerStmt.run(
      result.lastInsertRowid,
      'Mumbai Aerial Services',
      JSON.stringify(['Mumbai', 'Navi Mumbai', 'Thane']),
      'APPROVED',
      19.076,
      72.8777
    );
    console.log('✅ Auto-created provider: mumbai@drones.com / password123');
  }
};

const startServer = async () => {
  // Initialize database and ensure defaults
  initDatabase();
  await ensureDefaultAccounts();

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Drone Booking API is running' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/providers', providersRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/drones', dronesRoutes);
  app.use('/api/admin', adminRoutes);

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Database: SQLite (database.sqlite)`);
  });
};

startServer();
