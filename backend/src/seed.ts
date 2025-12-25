import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database/db';

const seed = async () => {
  console.log('🌱 Seeding database...\n');

  // Initialize database
  initDatabase();

  // Clear existing data
  db.exec('DELETE FROM payments');
  db.exec('DELETE FROM bookings');
  db.exec('DELETE FROM drones');
  db.exec('DELETE FROM services');
  db.exec('DELETE FROM providers');
  db.exec('DELETE FROM users');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const adminStmt = db.prepare(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
  );
  adminStmt.run('Admin User', 'admin@drone.com', hashedPassword, 'ADMIN', '+91-9999999999');
  console.log('✅ Admin created: admin@drone.com / password123');

  // Create regular users
  const users = [
    { name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9876543210' },
    { name: 'Priya Patel', email: 'priya@gmail.com', phone: '+91-9876543211' },
    { name: 'Amit Kumar', email: 'amit@gmail.com', phone: '+91-9876543212' }
  ];

  const userStmt = db.prepare(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
  );

  users.forEach(user => {
    userStmt.run(user.name, user.email, hashedPassword, 'USER', user.phone);
  });
  console.log('✅ 3 users created');

  // Create provider users and profiles
  const providers = [
    {
      name: 'Mumbai Drones',
      email: 'mumbai@drones.com',
      phone: '+91-9876543220',
      company: 'Mumbai Aerial Services',
      cities: ['Mumbai', 'Navi Mumbai', 'Thane'],
      lat: 19.0760,
      lng: 72.8777
    },
    {
      name: 'Delhi Sky',
      email: 'delhi@drones.com',
      phone: '+91-9876543221',
      company: 'Capital Drone Solutions',
      cities: ['Delhi', 'Noida', 'Gurgaon'],
      lat: 28.7041,
      lng: 77.1025
    },
    {
      name: 'Bangalore Wings',
      email: 'bangalore@drones.com',
      phone: '+91-9876543222',
      company: 'Tech City Aerials',
      cities: ['Bangalore', 'Whitefield'],
      lat: 12.9716,
      lng: 77.5946
    },
    {
      name: 'Hyderabad Aerials',
      email: 'hyderabad@drones.com',
      phone: '+91-9876543223',
      company: 'Pearl City Drones',
      cities: ['Hyderabad', 'Secunderabad'],
      lat: 17.3850,
      lng: 78.4867
    },
    {
      name: 'Chennai Flyers',
      email: 'chennai@drones.com',
      phone: '+91-9876543224',
      company: 'South India Drone Hub',
      cities: ['Chennai', 'Tambaram'],
      lat: 13.0827,
      lng: 80.2707
    }
  ];

  const providerUserStmt = db.prepare(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)'
  );
  const providerStmt = db.prepare(
    'INSERT INTO providers (user_id, company, cities, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)'
  );

  providers.forEach(provider => {
    const result = providerUserStmt.run(
      provider.name,
      provider.email,
      hashedPassword,
      'PROVIDER',
      provider.phone
    );
    providerStmt.run(
      result.lastInsertRowid,
      provider.company,
      JSON.stringify(provider.cities),
      'APPROVED',
      provider.lat,
      provider.lng
    );
  });
  console.log('✅ 5 providers created (all approved)');

  // Create services
  const services = [
    {
      name: 'Aerial Photography',
      description: 'Professional aerial photography for events, real estate, and commercial projects',
      base_price: 5000,
      category: 'Photography',
      image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f'
    },
    {
      name: 'Wedding Coverage',
      description: 'Capture your special day from breathtaking aerial angles',
      base_price: 15000,
      category: 'Photography',
      image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552'
    },
    {
      name: 'Real Estate Survey',
      description: 'Complete property documentation and aerial mapping',
      base_price: 8000,
      category: 'Survey',
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
    },
    {
      name: 'Agriculture Monitoring',
      description: 'Crop health analysis and field mapping using multispectral imaging',
      base_price: 12000,
      category: 'Agriculture',
      image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d'
    },
    {
      name: 'Construction Site Monitoring',
      description: 'Track construction progress with regular aerial updates',
      base_price: 10000,
      category: 'Survey',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5'
    },
    {
      name: 'Event Coverage',
      description: 'Live event streaming and recording from aerial perspective',
      base_price: 20000,
      category: 'Photography',
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
    },
    {
      name: 'Infrastructure Inspection',
      description: 'Detailed inspection of bridges, towers, and buildings',
      base_price: 18000,
      category: 'Inspection',
      image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12'
    },
    {
      name: 'Delivery Service',
      description: 'Fast and secure drone delivery for small packages',
      base_price: 500,
      category: 'Delivery',
      image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108'
    }
  ];

  const serviceStmt = db.prepare(
    'INSERT INTO services (name, description, base_price, category, image_url) VALUES (?, ?, ?, ?, ?)'
  );

  services.forEach(service => {
    serviceStmt.run(
      service.name,
      service.description,
      service.base_price,
      service.category,
      service.image_url
    );
  });
  console.log('✅ 8 services created');

  // Create drones for each provider
  const droneTypes = [
    { name: 'DJI Mavic 3 Pro', type: 'Camera Drone', price: 3000, specs: '4K Camera, 46min flight, 15km range' },
    { name: 'DJI Phantom 4 RTK', type: 'Mapping Drone', price: 5000, specs: 'RTK Module, Survey Grade, 30min flight' },
    { name: 'DJI Agras T30', type: 'Agriculture Drone', price: 8000, specs: '30L spray tank, 16L/min flow rate' },
    { name: 'DJI Inspire 3', type: 'Cinema Drone', price: 10000, specs: '8K Camera, 360° obstacle sensing' },
    { name: 'Custom Racing Drone', type: 'FPV Drone', price: 2000, specs: 'High speed, Acrobatic capabilities' }
  ];

  const droneStmt = db.prepare(
    'INSERT INTO drones (provider_id, name, type, price_per_hour, available, specs) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (let providerId = 1; providerId <= 5; providerId++) {
    // Each provider gets 3-4 random drones
    const numDrones = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numDrones; i++) {
      const drone = droneTypes[Math.floor(Math.random() * droneTypes.length)];
      droneStmt.run(
        providerId,
        drone.name,
        drone.type,
        drone.price,
        Math.random() > 0.2 ? 1 : 0, // 80% available
        drone.specs
      );
    }
  }
  console.log('✅ Drones created for all providers');

  // Create sample bookings
  const bookingStmt = db.prepare(`
    INSERT INTO bookings (
      user_id, provider_id, service_id, drone_id, date, time,
      latitude, longitude, address, status, amount, duration_hours
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  const today = new Date();

  for (let i = 0; i < 15; i++) {
    const userId = 2 + Math.floor(Math.random() * 3); // Users 2-4
    const providerId = 1 + Math.floor(Math.random() * 5); // Providers 1-5
    const serviceId = 1 + Math.floor(Math.random() * 8); // Services 1-8
    const droneId = 1 + Math.floor(Math.random() * 15); // Random drone
    
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30) - 15);
    
    const amount = 5000 + Math.floor(Math.random() * 15000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    bookingStmt.run(
      userId,
      providerId,
      serviceId,
      droneId,
      bookingDate.toISOString().split('T')[0],
      '10:00 AM',
      19.0760 + (Math.random() - 0.5) * 0.1,
      72.8777 + (Math.random() - 0.5) * 0.1,
      'Sample Address, Mumbai',
      status,
      amount,
      2
    );
  }
  console.log('✅ 15 sample bookings created');

  // Create payments for confirmed/completed bookings
  const paymentsStmt = db.prepare(`
    INSERT INTO payments (booking_id, amount, status, fake_order_id, fake_payment_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const bookings = db.prepare('SELECT id, amount FROM bookings WHERE status IN ("CONFIRMED", "COMPLETED")').all() as any[];
  
  bookings.forEach((booking, index) => {
    paymentsStmt.run(
      booking.id,
      booking.amount,
      'PAID',
      `order_seed_${Date.now()}_${index}`,
      `pay_seed_${Date.now()}_${index}`
    );
  });
  console.log(`✅ ${bookings.length} payments created`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('   Admin: admin@drone.com / password123');
  console.log('   User: rahul@gmail.com / password123');
  console.log('   Provider: mumbai@drones.com / password123');
  console.log('   (All passwords are: password123)\n');

  console.log('Database is running in-memory mode');
};

seed().catch(console.error);
