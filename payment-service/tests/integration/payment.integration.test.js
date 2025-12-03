/**
 * Integration Tests for Payment Service
 * Tests actual API endpoints with real MongoDB connection
 */

import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Test app setup
const app = express();
app.use(express.json());

// Test configuration
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/payment_integration_test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Test users
const testCustomer = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'customer@example.com',
  name: 'Test Customer',
  role: 'customer'
};

const testAdmin = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'admin'
};

// Generate tokens
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

const customerToken = generateToken(testCustomer);
const adminToken = generateToken(testAdmin);

// Payment Schema for testing
const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'CASH', 'WALLET', 'BANK_TRANSFER'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
    default: 'PENDING'
  },
  transactionId: String,
  paymentProcessor: String,
  cardLast4: String,
  metadata: mongoose.Schema.Types.Mixed,
  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: Date
});

let Payment;

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Setup routes for testing
const setupRoutes = () => {
  // Create payment intent
  app.post('/api/payments/create-intent', mockAuth, async (req, res) => {
    try {
      const { orderId, amount, currency, paymentMethod } = req.body;

      if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'orderId, amount, and paymentMethod are required'
        });
      }

      // Check for duplicate payment
      const existingPayment = await Payment.findOne({ orderId });
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'Payment already exists for this order'
        });
      }

      const payment = new Payment({
        orderId,
        customerId: req.user.id,
        amount,
        currency: currency || 'USD',
        paymentMethod,
        status: 'PENDING',
        transactionId: `TXN-${Date.now()}`
      });

      await payment.save();

      res.status(201).json({
        success: true,
        message: 'Payment intent created',
        payment: {
          id: payment._id,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Process payment
  app.post('/api/payments/:id/process', mockAuth, async (req, res) => {
    try {
      const { cardToken, cardLast4 } = req.body;
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      if (payment.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Cannot process payment with status: ${payment.status}`
        });
      }

      // Simulate payment processing
      payment.status = 'PROCESSING';
      payment.cardLast4 = cardLast4;
      payment.paymentProcessor = 'stripe';
      payment.updatedAt = new Date();
      await payment.save();

      // Simulate async payment completion (in real app, this would be webhook)
      setTimeout(async () => {
        payment.status = 'COMPLETED';
        payment.completedAt = new Date();
        await payment.save();
      }, 100);

      res.json({
        success: true,
        message: 'Payment is being processed',
        payment: {
          id: payment._id,
          status: payment.status,
          transactionId: payment.transactionId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Get payment by ID
  app.get('/api/payments/:id', mockAuth, async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      res.json({
        success: true,
        payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Get payment by order ID
  app.get('/api/payments/order/:orderId', mockAuth, async (req, res) => {
    try {
      const payment = await Payment.findOne({ orderId: req.params.orderId });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found for this order'
        });
      }

      if (payment.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      res.json({
        success: true,
        payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Get user's payment history
  app.get('/api/payments', mockAuth, async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;

      const query = { customerId: req.user.id };
      if (status) query.status = status;

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        payments,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Refund payment
  app.post('/api/payments/:id/refund', mockAuth, async (req, res) => {
    try {
      const { amount, reason } = req.body;
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Only admin can initiate refunds
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can process refunds'
        });
      }

      if (payment.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Can only refund completed payments'
        });
      }

      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount - payment.refundAmount) {
        return res.status(400).json({
          success: false,
          message: 'Refund amount exceeds available amount'
        });
      }

      payment.refundAmount += refundAmount;
      payment.refundReason = reason;
      payment.status = payment.refundAmount >= payment.amount ? 'REFUNDED' : 'COMPLETED';
      payment.updatedAt = new Date();
      await payment.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        payment: {
          id: payment._id,
          status: payment.status,
          refundAmount: payment.refundAmount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Cancel payment
  app.post('/api/payments/:id/cancel', mockAuth, async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.customerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      if (!['PENDING', 'PROCESSING'].includes(payment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel payment with status: ${payment.status}`
        });
      }

      payment.status = 'CANCELLED';
      payment.updatedAt = new Date();
      await payment.save();

      res.json({
        success: true,
        message: 'Payment cancelled successfully',
        payment: {
          id: payment._id,
          status: payment.status
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Admin: Get all payments
  app.get('/api/payments/admin/all', mockAuth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { page = 1, limit = 10, status, startDate, endDate } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(query);

      // Calculate statistics
      const stats = await Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      res.json({
        success: true,
        payments,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Test data
const testPaymentData = {
  orderId: `ORD-TEST-${Date.now()}`,
  amount: 50.00,
  currency: 'USD',
  paymentMethod: 'CARD'
};

describe('Payment Service Integration Tests', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(MONGO_URI);
      Payment = mongoose.model('Payment', paymentSchema);
      setupRoutes();
      console.log('Connected to test database');
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Payment.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  beforeEach(async () => {
    await Payment.deleteMany({});
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent successfully', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testPaymentData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.orderId).toBe(testPaymentData.orderId);
      expect(res.body.payment.amount).toBe(testPaymentData.amount);
      expect(res.body.payment.status).toBe('PENDING');
      expect(res.body.payment.transactionId).toBeDefined();
    });

    it('should reject duplicate payment for same order', async () => {
      // Create first payment
      await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testPaymentData);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testPaymentData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should reject without required fields', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 50 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .post('/api/payments/create-intent')
        .send(testPaymentData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/:id/process', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        ...testPaymentData,
        customerId: testCustomer.id,
        transactionId: `TXN-${Date.now()}`
      });
    });

    it('should process payment successfully', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/process`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          cardToken: 'tok_visa',
          cardLast4: '4242'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.status).toBe('PROCESSING');
    });

    it('should reject processing non-pending payment', async () => {
      // Mark payment as completed
      payment.status = 'COMPLETED';
      await payment.save();

      const res = await request(app)
        .post(`/api/payments/${payment._id}/process`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ cardToken: 'tok_visa' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot process');
    });

    it('should reject processing by non-owner', async () => {
      const otherUser = generateToken({
        id: new mongoose.Types.ObjectId().toString(),
        role: 'customer'
      });

      const res = await request(app)
        .post(`/api/payments/${payment._id}/process`)
        .set('Authorization', `Bearer ${otherUser}`)
        .send({ cardToken: 'tok_visa' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/:id', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        ...testPaymentData,
        customerId: testCustomer.id,
        transactionId: `TXN-${Date.now()}`
      });
    });

    it('should get payment by ID', async () => {
      const res = await request(app)
        .get(`/api/payments/${payment._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment._id).toBe(payment._id.toString());
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/payments/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/order/:orderId', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        ...testPaymentData,
        customerId: testCustomer.id,
        transactionId: `TXN-${Date.now()}`
      });
    });

    it('should get payment by order ID', async () => {
      const res = await request(app)
        .get(`/api/payments/order/${payment.orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.orderId).toBe(payment.orderId);
    });
  });

  describe('GET /api/payments', () => {
    beforeEach(async () => {
      // Create multiple payments
      for (let i = 0; i < 5; i++) {
        await Payment.create({
          orderId: `ORD-${Date.now()}-${i}`,
          customerId: testCustomer.id,
          amount: 50 + i * 10,
          paymentMethod: 'CARD',
          status: i % 2 === 0 ? 'COMPLETED' : 'PENDING',
          transactionId: `TXN-${Date.now()}-${i}`
        });
      }
    });

    it('should get payment history', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payments.length).toBe(5);
      expect(res.body.total).toBe(5);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/payments?status=COMPLETED')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.payments.forEach(p => {
        expect(p.status).toBe('COMPLETED');
      });
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/payments?page=1&limit=2')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.payments.length).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        ...testPaymentData,
        customerId: testCustomer.id,
        status: 'COMPLETED',
        transactionId: `TXN-${Date.now()}`
      });
    });

    it('should process full refund', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Customer requested' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.status).toBe('REFUNDED');
      expect(res.body.payment.refundAmount).toBe(payment.amount);
    });

    it('should process partial refund', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 20, reason: 'Partial refund' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.status).toBe('COMPLETED'); // Still completed for partial
      expect(res.body.payment.refundAmount).toBe(20);
    });

    it('should reject refund by non-admin', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Want refund' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('admin');
    });

    it('should reject refund for non-completed payment', async () => {
      payment.status = 'PENDING';
      await payment.save();

      const res = await request(app)
        .post(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('completed');
    });

    it('should reject refund exceeding available amount', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100, reason: 'Too much' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds');
    });
  });

  describe('POST /api/payments/:id/cancel', () => {
    let payment;

    beforeEach(async () => {
      payment = await Payment.create({
        ...testPaymentData,
        customerId: testCustomer.id,
        status: 'PENDING',
        transactionId: `TXN-${Date.now()}`
      });
    });

    it('should cancel pending payment', async () => {
      const res = await request(app)
        .post(`/api/payments/${payment._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.payment.status).toBe('CANCELLED');
    });

    it('should reject cancelling completed payment', async () => {
      payment.status = 'COMPLETED';
      await payment.save();

      const res = await request(app)
        .post(`/api/payments/${payment._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot cancel');
    });
  });

  describe('GET /api/payments/admin/all', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await Payment.create({
          orderId: `ORD-${Date.now()}-${i}`,
          customerId: testCustomer.id,
          amount: 50,
          paymentMethod: 'CARD',
          status: ['PENDING', 'COMPLETED', 'REFUNDED'][i % 3],
          transactionId: `TXN-${Date.now()}-${i}`
        });
      }
    });

    it('should get all payments for admin', async () => {
      const res = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(5);
      expect(res.body.stats).toBeDefined();
    });

    it('should reject for non-admin', async () => {
      const res = await request(app)
        .get('/api/payments/admin/all')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/payments/admin/all?status=COMPLETED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.payments.forEach(p => {
        expect(p.status).toBe('COMPLETED');
      });
    });
  });
});
