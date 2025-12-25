import { Router } from 'express';
import { db } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Create fake payment order
router.post('/create-order', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate fake order ID
    const fakeOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const stmt = db.prepare(`
      INSERT INTO payments (booking_id, amount, status, fake_order_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(booking_id, amount, 'PENDING', fakeOrderId);

    res.json({
      success: true,
      order_id: fakeOrderId,
      amount: amount,
      currency: 'INR',
      message: 'Use test card: 4111 1111 1111 1111'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify fake payment
router.post('/verify', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { order_id, booking_id } = req.body;

    if (!order_id || !booking_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate fake payment ID
    const fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update payment status
    const paymentStmt = db.prepare(`
      UPDATE payments 
      SET status = ?, fake_payment_id = ?
      WHERE fake_order_id = ? AND booking_id = ?
    `);
    paymentStmt.run('PAID', fakePaymentId, order_id, booking_id);

    // Update booking status to CONFIRMED
    const bookingStmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
    bookingStmt.run('CONFIRMED', booking_id);

    // Log to console (simulating email)
    console.log('\n📧 ========== PAYMENT CONFIRMATION EMAIL ==========');
    console.log(`✅ Payment Successful!`);
    console.log(`Order ID: ${order_id}`);
    console.log(`Payment ID: ${fakePaymentId}`);
    console.log(`Booking ID: ${booking_id}`);
    console.log(`User ID: ${req.user!.id}`);
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log('==================================================\n');

    res.json({
      success: true,
      payment_id: fakePaymentId,
      order_id: order_id,
      status: 'PAID',
      message: 'Payment verified successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment details
router.get('/:booking_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM payments WHERE booking_id = ?');
    const payment = stmt.get(req.params.booking_id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

export default router;
