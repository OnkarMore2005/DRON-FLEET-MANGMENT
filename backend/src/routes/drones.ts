import { Router } from 'express';
import { db } from '../database/db';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get provider's drones
router.get('/', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    const providerStmt = db.prepare('SELECT id FROM providers WHERE user_id = ?');
    const provider = providerStmt.get(req.user!.id) as any;

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const stmt = db.prepare('SELECT * FROM drones WHERE provider_id = ? ORDER BY created_at DESC');
    const drones = stmt.all(provider.id);

    res.json({ drones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drones' });
  }
});

// Add drone
router.post('/', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    const { name, type, price_per_hour, available, specs } = req.body;

    if (!name || !type || !price_per_hour) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const providerStmt = db.prepare('SELECT id FROM providers WHERE user_id = ?');
    const provider = providerStmt.get(req.user!.id) as any;

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const stmt = db.prepare(`
      INSERT INTO drones (provider_id, name, type, price_per_hour, available, specs)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      provider.id,
      name,
      type,
      price_per_hour,
      available !== undefined ? available : 1,
      specs || null
    );

    res.status(201).json({
      message: 'Drone added successfully',
      drone_id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add drone' });
  }
});

// Update drone
router.put('/:id', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    const { name, type, price_per_hour, available, specs } = req.body;

    const stmt = db.prepare(`
      UPDATE drones 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          price_per_hour = COALESCE(?, price_per_hour),
          available = COALESCE(?, available),
          specs = COALESCE(?, specs)
      WHERE id = ?
    `);

    stmt.run(name, type, price_per_hour, available, specs, req.params.id);

    res.json({ message: 'Drone updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update drone' });
  }
});

// Delete drone
router.delete('/:id', authenticateToken, authorizeRole('PROVIDER'), (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('DELETE FROM drones WHERE id = ?');
    stmt.run(req.params.id);

    res.json({ message: 'Drone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drone' });
  }
});

export default router;
