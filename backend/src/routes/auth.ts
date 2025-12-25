import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';

const router = Router();

// Register User
router.post('/register-user', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, hashedPassword, 'USER', phone || null);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: 'USER' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastInsertRowid, name, email, role: 'USER' }
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Register Provider
router.post('/register-provider', async (req, res) => {
  try {
    const { name, email, password, phone, company, cities, latitude, longitude } = req.body;

    if (!name || !email || !password || !company || !cities) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.exec('BEGIN TRANSACTION');

    const userStmt = db.prepare(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
    );
    const userResult = userStmt.run(name, email, hashedPassword, 'PROVIDER', phone || null);

    const providerStmt = db.prepare(
      'INSERT INTO providers (user_id, company, cities, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const citiesJson = JSON.stringify(Array.isArray(cities) ? cities : [cities]);
    providerStmt.run(userResult.lastInsertRowid, company, citiesJson, 'PENDING', latitude || null, longitude || null);

    db.exec('COMMIT');

    const token = jwt.sign(
      { id: userResult.lastInsertRowid, email, role: 'PROVIDER' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Provider registered successfully. Awaiting admin approval.',
      token,
      user: { id: userResult.lastInsertRowid, name, email, role: 'PROVIDER' }
    });
  } catch (error: any) {
    db.exec('ROLLBACK');
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Login (separate endpoint with hardcoded admin check)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?');
    const user = stmt.get(email, 'ADMIN') as any;

    if (!user) {
      return res.status(401).json({ error: 'Admin access denied' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
