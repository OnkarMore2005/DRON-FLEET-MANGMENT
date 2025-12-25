import { Router } from 'express';
import { db } from '../database/db';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Create booking
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      provider_id,
      service_id,
      drone_id,
      date,
      time,
      latitude,
      longitude,
      address,
      amount,
      duration_hours,
      notes
    } = req.body;

    if (!provider_id || !service_id || !date || !time || !latitude || !longitude || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO bookings (
        user_id, provider_id, service_id, drone_id, date, time,
        latitude, longitude, address, status, amount, duration_hours, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user!.id,
      provider_id,
      service_id,
      drone_id || null,
      date,
      time,
      latitude,
      longitude,
      address || null,
      'PENDING',
      amount,
      duration_hours || 1,
      notes || null
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/mine', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.category as service_category,
        p.company as provider_company,
        u.name as provider_name,
        u.phone as provider_phone,
        d.name as drone_name,
        d.type as drone_type,
        pay.status as payment_status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN providers p ON b.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN drones d ON b.drone_id = d.id
      LEFT JOIN payments pay ON b.id = pay.booking_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `);

    const bookings = stmt.all(req.user!.id);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get provider's bookings
router.get('/provider', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    // Get provider_id from user_id
    const providerStmt = db.prepare('SELECT id FROM providers WHERE user_id = ?');
    const provider = providerStmt.get(req.user!.id) as any;

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const stmt = db.prepare(`
      SELECT 
        b.*,
        s.name as service_name,
        s.category as service_category,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        d.name as drone_name,
        pay.status as payment_status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN drones d ON b.drone_id = d.id
      LEFT JOIN payments pay ON b.id = pay.booking_id
      WHERE b.provider_id = ?
      ORDER BY b.created_at DESC
    `);

    const bookings = stmt.all(provider.id);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (Provider)
router.patch('/:id/status', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);

    res.json({ message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

export default router;
