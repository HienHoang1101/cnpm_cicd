/**
 * Integration Tests for Order Service
 * Tests actual API endpoints with real MongoDB connection
 */

import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Import routes and models
import orderRoutes from '../../routes/orderRoutes.js';
import cartRoutes from '../../routes/cartRoutes.js';
import Order from '../../model/order.js';
import CartItem from '../../model/cartItem.js';

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/orders', mockAuthMiddleware, orderRoutes);
app.use('/api/cart', mockAuthMiddleware, cartRoutes);

// Test configuration
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/order_integration_test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Test data
const testCustomer = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'customer@example.com',
  name: 'Test Customer',
  phone: '1234567890',
  role: 'customer'
};

const testRestaurant = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'restaurant@example.com',
  name: 'Test Restaurant Owner',
  role: 'restaurant'
};

const testAdmin = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'ADMIN'
};

// Generate test tokens
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

const customerToken = generateToken(testCustomer);
const restaurantToken = generateToken(testRestaurant);
const adminToken = generateToken(testAdmin);

// Test order data
const testOrderData = {
  orderId: `ORD-TEST-${Date.now()}`,
  customerId: testCustomer.id,
  customerName: testCustomer.name,
  customerEmail: testCustomer.email,
  customerPhone: testCustomer.phone,
  type: 'DELIVERY',
  deliveryAddress: {
    street: '123 Test Street',
    city: 'Test City',
    latitude: 37.7749,
    longitude: -122.4194
  },
  restaurantOrder: {
    restaurantId: new mongoose.Types.ObjectId().toString(),
    ownerId: testRestaurant.id,
    restaurantName: 'Test Restaurant',
    restaurantLocation: { lat: 37.7849, lng: -122.4094 },
    items: [
      {
        itemId: new mongoose.Types.ObjectId().toString(),
        name: 'Test Burger',
        price: 10.99,
        quantity: 2
      },
      {
        itemId: new mongoose.Types.ObjectId().toString(),
        name: 'Test Fries',
        price: 4.99,
        quantity: 1
      }
    ],
    subtotal: 26.97,
    tax: 2.16,
    deliveryFee: 2.99,
    status: 'PLACED',
    statusHistory: [{
      status: 'PLACED',
      timestamp: new Date(),
      updatedBy: testCustomer.id,
      notes: 'Order placed'
    }]
  },
  totalAmount: 32.12,
  paymentMethod: 'CASH',
  paymentStatus: 'PENDING'
};

describe('Order Service Integration Tests', () => {
  // Connect to test database before all tests
  beforeAll(async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to test database');
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    try {
      await Order.deleteMany({});
      await CartItem.deleteMany({});
      await mongoose.connection.close();
      console.log('Test database connection closed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  // Clean up before each test
  beforeEach(async () => {
    await Order.deleteMany({});
    await CartItem.deleteMany({});
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create(testOrderData);
      await Order.create({
        ...testOrderData,
        orderId: `ORD-TEST-${Date.now() + 1}`,
        restaurantOrder: {
          ...testOrderData.restaurantOrder,
          status: 'DELIVERED'
        }
      });
    });

    it('should get user orders successfully', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.orders).toBeDefined();
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const res = await request(app)
        .get('/api/orders?status=PLACED')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      res.body.orders.forEach(order => {
        expect(order.status).toBe('PLACED');
      });
    });

    it('should paginate orders', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.page).toBe('1');
      expect(res.body.limit).toBe('1');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(res.body.message).toBe('No token provided');
    });
  });

  describe('GET /api/orders/:id', () => {
    let createdOrder;

    beforeEach(async () => {
      createdOrder = await Order.create(testOrderData);
    });

    it('should get order by ID successfully', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrder.orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.orderId).toBe(createdOrder.orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/ORD-NONEXISTENT')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(res.body.status).toBe(404);
      expect(res.body.message).toBe('Order not found');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    let createdOrder;

    beforeEach(async () => {
      createdOrder = await Order.create(testOrderData);
    });

    it('should update order status successfully', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          status: 'PREPARING',
          notes: 'Started preparing order',
          estimatedReadyMinutes: 30
        })
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.message).toBe('Order status updated successfully');
      expect(res.body.order.status).toBe('PREPARING');
    });

    it('should reject invalid status value', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(res.body.status).toBe(400);
      expect(res.body.message).toBe('Invalid status value');
    });

    it('should track status history', async () => {
      await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'PREPARING' });

      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'READY_FOR_PICKUP' })
        .expect(200);

      expect(res.body.order.statusHistory.length).toBeGreaterThan(1);
    });
  });

  describe('GET /api/orders/:id/tracking', () => {
    let createdOrder;

    beforeEach(async () => {
      createdOrder = await Order.create({
        ...testOrderData,
        restaurantOrder: {
          ...testOrderData.restaurantOrder,
          status: 'OUT_FOR_DELIVERY'
        }
      });
    });

    it('should get order tracking info', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrder.orderId}/tracking`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.orderId).toBe(createdOrder.orderId);
      expect(res.body.status).toBe('OUT_FOR_DELIVERY');
      expect(res.body.lastUpdated).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/ORD-NONEXISTENT/tracking')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(res.body.status).toBe(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let createdOrder;

    beforeEach(async () => {
      createdOrder = await Order.create(testOrderData);
    });

    it('should delete order successfully', async () => {
      const res = await request(app)
        .delete(`/api/orders/${createdOrder.orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.message).toBe('Order deleted successfully');

      // Verify order is deleted
      const deletedOrder = await Order.findOne({ orderId: createdOrder.orderId });
      expect(deletedOrder).toBeNull();
    });

    it('should reject deletion of processing order by customer', async () => {
      // Update order to PREPARING status
      await Order.updateOne(
        { orderId: createdOrder.orderId },
        { 'restaurantOrder.status': 'PREPARING' }
      );

      const res = await request(app)
        .delete(`/api/orders/${createdOrder.orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(res.body.status).toBe(400);
      expect(res.body.message).toContain('Cannot delete order');
    });

    it('should allow admin to delete any order', async () => {
      // Update order to PREPARING status
      await Order.updateOne(
        { orderId: createdOrder.orderId },
        { 'restaurantOrder.status': 'PREPARING' }
      );

      const res = await request(app)
        .delete(`/api/orders/${createdOrder.orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
    });
  });

  describe('GET /api/orders/admin/all', () => {
    beforeEach(async () => {
      // Create multiple test orders
      for (let i = 0; i < 5; i++) {
        await Order.create({
          ...testOrderData,
          orderId: `ORD-TEST-${Date.now() + i}`,
          createdAt: new Date(Date.now() - i * 86400000) // Different days
        });
      }
    });

    it('should get all orders for admin', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.orders).toBeDefined();
      expect(res.body.count).toBe(5);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all?status=PLACED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.orders.length).toBeLessThanOrEqual(2);
    });
  });

  describe('POST /api/orders/batch', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create(testOrderData);
      await Order.create({
        ...testOrderData,
        orderId: `ORD-TEST-${Date.now() + 1}`
      });
    });

    it('should fetch multiple orders by IDs', async () => {
      const orders = await Order.find({});
      const orderIds = orders.map(o => o.orderId);

      const res = await request(app)
        .post('/api/orders/batch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderIds })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(orderIds.length);
    });

    it('should return missing IDs for non-existent orders', async () => {
      const res = await request(app)
        .post('/api/orders/batch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderIds: ['ORD-NONEXISTENT-1', 'ORD-NONEXISTENT-2'] })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.missingIds).toBeDefined();
      expect(res.body.missingIds.length).toBe(2);
    });

    it('should reject invalid orderIds format', async () => {
      const res = await request(app)
        .post('/api/orders/batch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderIds: 'not-an-array' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Payment Status Updates', () => {
    let createdOrder;

    beforeEach(async () => {
      createdOrder = await Order.create(testOrderData);
    });

    it('should update payment details', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/payment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paymentDetails: {
            transactionId: 'TXN-123456',
            paymentProcessor: 'stripe'
          }
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.order.paymentStatus).toBe('PROCESSING');
    });

    it('should update payment status to PAID', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'PAID',
          paymentDetails: {
            transactionId: 'TXN-123456',
            paymentProcessor: 'stripe'
          }
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.order.paymentStatus).toBe('PAID');
    });

    it('should reject invalid payment status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrder.orderId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID',
          paymentDetails: { transactionId: 'TXN-123' }
        })
        .expect(400);

      expect(res.body.error).toContain('Invalid payment status');
    });
  });
});

describe('Cart Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  });

  beforeEach(async () => {
    await CartItem.deleteMany({});
  });

  const testCartItem = {
    restaurantId: new mongoose.Types.ObjectId().toString(),
    itemId: new mongoose.Types.ObjectId().toString(),
    name: 'Test Item',
    itemPrice: 10.99,
    quantity: 2,
    totalPrice: 21.98
  };

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testCartItem)
        .expect(201);

      expect(res.body.status).toBe(201);
      expect(res.body.message).toContain('added');
    });
  });

  describe('GET /api/cart', () => {
    beforeEach(async () => {
      await CartItem.create({
        ...testCartItem,
        customerId: testCustomer.id
      });
    });

    it('should get cart items', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
      expect(res.body.cartItems).toBeDefined();
    });
  });

  describe('DELETE /api/cart/:id', () => {
    let cartItem;

    beforeEach(async () => {
      cartItem = await CartItem.create({
        ...testCartItem,
        customerId: testCustomer.id
      });
    });

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/${cartItem._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      await CartItem.create({
        ...testCartItem,
        customerId: testCustomer.id
      });
      await CartItem.create({
        ...testCartItem,
        customerId: testCustomer.id,
        name: 'Another Item'
      });
    });

    it('should clear entire cart', async () => {
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.status).toBe(200);

      // Verify cart is empty
      const cartItems = await CartItem.find({ customerId: testCustomer.id });
      expect(cartItems.length).toBe(0);
    });
  });
});
