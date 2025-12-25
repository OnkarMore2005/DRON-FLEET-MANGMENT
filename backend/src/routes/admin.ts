import { Router } from 'express';
import { db } from '../database/db';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

// Dashboard stats
router.get('/stats', (req: AuthRequest, res) => {
  try {
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "USER"').get() as any;
    const providersCount = db.prepare('SELECT COUNT(*) as count FROM providers WHERE status = "APPROVED"').get() as any;
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any;
    const revenueSum = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status != "CANCELLED"').get() as any;

    res.json({
      stats: {
        totalUsers: usersCount.count,
        totalProviders: providersCount.count,
        totalBookings: bookingsCount.count,
        totalRevenue: revenueSum.total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', (req: AuthRequest, res) => {
  try {
    const { role, search } = req.query;
    
    let query = 'SELECT id, name, email, role, phone, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const users = stmt.all(...params);
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all providers with details
router.get('/providers', (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, u.name, u.email, u.phone, u.created_at
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const stmt = db.prepare(query);
    const providers = stmt.all(...params) as any[];
    
    const formattedProviders = providers.map(p => ({
      ...p,
      cities: JSON.parse(p.cities || '[]')
    }));
    
    res.json({ providers: formattedProviders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Approve/Reject provider
router.patch('/providers/:id/status', (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const stmt = db.prepare('UPDATE providers SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    
    console.log(`\n📧 ========== PROVIDER STATUS UPDATE ==========`);
    console.log(`Provider ID: ${req.params.id}`);
    console.log(`New Status: ${status}`);
    console.log(`Updated by Admin ID: ${req.user!.id}`);
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log('=============================================\n');
    
    res.json({ message: `Provider ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update provider status' });
  }
});

// Get all bookings
router.get('/bookings', (req: AuthRequest, res) => {
  try {
    const { status, from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        s.name as service_name,
        p.company as provider_company,
        pay.status as payment_status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN providers p ON b.provider_id = p.id
      LEFT JOIN payments pay ON b.id = pay.booking_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (from_date) {
      query += ' AND b.date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND b.date <= ?';
      params.push(to_date);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const stmt = db.prepare(query);
    const bookings = stmt.all(...params);
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Analytics - Monthly bookings
router.get('/analytics/bookings', (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count,
        SUM(amount) as revenue
      FROM bookings
      WHERE status != 'CANCELLED'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    
    const data = stmt.all();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Analytics - Top services
router.get('/analytics/services', (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.name,
        s.category,
        COUNT(b.id) as booking_count,
        SUM(b.amount) as total_revenue
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      GROUP BY s.id
      ORDER BY booking_count DESC
      LIMIT 10
    `);
    
    const data = stmt.all();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service analytics' });
  }
});

// Delete user (and cascade delete related data)
router.delete('/users/:id', (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
