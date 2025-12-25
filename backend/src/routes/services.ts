import { Router } from 'express';
import { db } from '../database/db';

const router = Router();

// Get all services
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM services';
    const params: any[] = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    const stmt = db.prepare(query);
    const services = stmt.all(...params);
    
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
    const service = stmt.get(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

export default router;
