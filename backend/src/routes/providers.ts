import { Router } from 'express';
import { db } from '../database/db';

const router = Router();

// Calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get providers by location
router.get('/', (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    
    const stmt = db.prepare(`
      SELECT p.*, u.name, u.email, u.phone 
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'APPROVED'
    `);
    const providers = stmt.all() as any[];
    
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseFloat(radius as string);
      
      const nearbyProviders = providers.filter(p => {
        if (p.latitude && p.longitude) {
          const distance = calculateDistance(userLat, userLng, p.latitude, p.longitude);
          return distance <= maxRadius;
        }
        return true; // Include providers without location
      }).map(p => ({
        ...p,
        cities: JSON.parse(p.cities || '[]'),
        distance: p.latitude && p.longitude 
          ? calculateDistance(userLat, userLng, p.latitude, p.longitude).toFixed(2)
          : null
      }));
      
      return res.json({ providers: nearbyProviders });
    }
    
    const formattedProviders = providers.map(p => ({
      ...p,
      cities: JSON.parse(p.cities || '[]')
    }));
    
    res.json({ providers: formattedProviders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get provider by ID with drones
router.get('/:id', (req, res) => {
  try {
    const providerStmt = db.prepare(`
      SELECT p.*, u.name, u.email, u.phone 
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `);
    const provider = providerStmt.get(req.params.id) as any;
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const dronesStmt = db.prepare('SELECT * FROM drones WHERE provider_id = ? AND available = 1');
    const drones = dronesStmt.all(req.params.id);
    
    res.json({
      provider: {
        ...provider,
        cities: JSON.parse(provider.cities || '[]')
      },
      drones
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

export default router;
