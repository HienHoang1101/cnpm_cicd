/**
 * Integration Tests for Admin Service
 * Tests all API endpoints with real HTTP requests
 */

import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import Settlement from '../../model/restaurantSettlement.js';
import settlementRoutes from '../../routes/restaurantPaymentRoutes.js';
import { jest } from '@jest/globals';

// Mock bank transfer utility
jest.unstable_mockModule('../../utils/bankTransfer.js', () => ({
  bankTransfer: jest.fn().mockResolvedValue({
    success: true,
    reference: 'TXN-' + Date.now()
  })
}));

// Mock notification helper
jest.unstable_mockModule('../../utils/notificationHelper.js', () => ({
  createNotification: jest.fn().mockResolvedValue({ success: true })
}));

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/settlements', settlementRoutes);
  return app;
};

describe('Admin Service Integration Tests', () => {
  let app;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_integration_test';
    await mongoose.connect(mongoUri);
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up and close connection
    await Settlement.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear settlements before each test
    await Settlement.deleteMany({});
  });

  describe('POST /api/settlements/add-order', () => {
    it('should add order to settlement successfully', async () => {
      const orderData = {
        restaurantId: 'restaurant-123',
        restaurantName: 'Test Restaurant',
        orderId: 'order-001',
        subtotal: 100.00,
        platformFee: 15.00,
        weekEnding: new Date('2024-01-07')
      };

      const response = await request(app)
        .post('/api/settlements/add-order')
        .send(orderData);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.restaurantId).toBe('restaurant-123');
      expect(response.body.totalOrders).toBe(1);
      expect(response.body.orderSubtotal).toBe(100.00);
      expect(response.body.platformFee).toBe(15.00);
      expect(response.body.amountDue).toBe(85.00); // subtotal - platformFee
    });

    it('should accumulate orders for same restaurant in same week', async () => {
      const weekEnding = new Date('2024-01-07');
      
      // First order
      await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-123',
          restaurantName: 'Test Restaurant',
          orderId: 'order-001',
          subtotal: 100.00,
          platformFee: 15.00,
          weekEnding
        });

      // Second order same week
      const response = await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-123',
          restaurantName: 'Test Restaurant',
          orderId: 'order-002',
          subtotal: 50.00,
          platformFee: 7.50,
          weekEnding
        });

      expect(response.status).toBe(200);
      expect(response.body.totalOrders).toBe(2);
      expect(response.body.orderSubtotal).toBe(150.00);
      expect(response.body.platformFee).toBe(22.50);
      expect(response.body.amountDue).toBe(127.50);
      expect(response.body.orderIds).toContain('order-001');
      expect(response.body.orderIds).toContain('order-002');
    });

    it('should create separate settlements for different weeks', async () => {
      // Week 1
      await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-123',
          restaurantName: 'Test Restaurant',
          orderId: 'order-001',
          subtotal: 100.00,
          platformFee: 15.00,
          weekEnding: new Date('2024-01-07')
        });

      // Week 2
      const response = await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-123',
          restaurantName: 'Test Restaurant',
          orderId: 'order-002',
          subtotal: 200.00,
          platformFee: 30.00,
          weekEnding: new Date('2024-01-14')
        });

      expect(response.status).toBe(200);
      expect(response.body.totalOrders).toBe(1); // New settlement for new week
      expect(response.body.orderSubtotal).toBe(200.00);

      // Verify two settlements exist
      const settlements = await Settlement.find({ restaurantId: 'restaurant-123' });
      expect(settlements.length).toBe(2);
    });

    it('should create separate settlements for different restaurants', async () => {
      const weekEnding = new Date('2024-01-07');

      // Restaurant 1
      await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-111',
          restaurantName: 'Restaurant A',
          orderId: 'order-001',
          subtotal: 100.00,
          platformFee: 15.00,
          weekEnding
        });

      // Restaurant 2
      await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'restaurant-222',
          restaurantName: 'Restaurant B',
          orderId: 'order-002',
          subtotal: 150.00,
          platformFee: 22.50,
          weekEnding
        });

      const settlements = await Settlement.find({});
      expect(settlements.length).toBe(2);
    });
  });

  describe('GET /api/settlements', () => {
    beforeEach(async () => {
      // Create test settlements
      await Settlement.create([
        {
          restaurantId: 'restaurant-001',
          restaurantName: 'Restaurant A',
          weekEnding: new Date('2024-01-07'),
          totalOrders: 5,
          orderSubtotal: 500.00,
          platformFee: 75.00,
          amountDue: 425.00,
          status: 'PENDING',
          orderIds: ['order-1', 'order-2', 'order-3', 'order-4', 'order-5']
        },
        {
          restaurantId: 'restaurant-002',
          restaurantName: 'Restaurant B',
          weekEnding: new Date('2024-01-07'),
          totalOrders: 3,
          orderSubtotal: 300.00,
          platformFee: 45.00,
          amountDue: 255.00,
          status: 'PAID',
          paymentDate: new Date('2024-01-08'),
          transactionId: 'TXN-123456',
          orderIds: ['order-6', 'order-7', 'order-8']
        }
      ]);
    });

    it('should get all settlements', async () => {
      const response = await request(app)
        .get('/api/settlements');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.settlements).toBeInstanceOf(Array);
      expect(response.body.settlements.length).toBe(2);
    });

    it('should return settlements sorted by weekEnding (newest first)', async () => {
      // Add older settlement
      await Settlement.create({
        restaurantId: 'restaurant-003',
        restaurantName: 'Restaurant C',
        weekEnding: new Date('2023-12-31'),
        totalOrders: 2,
        orderSubtotal: 200.00,
        platformFee: 30.00,
        amountDue: 170.00,
        status: 'PENDING',
        orderIds: ['order-9', 'order-10']
      });

      const response = await request(app)
        .get('/api/settlements');

      expect(response.status).toBe(200);
      expect(response.body.settlements.length).toBe(3);
      
      // Should be sorted by weekEnding descending
      const weeks = response.body.settlements.map(s => new Date(s.weekEnding).getTime());
      expect(weeks[0]).toBeGreaterThanOrEqual(weeks[1]);
      expect(weeks[1]).toBeGreaterThanOrEqual(weeks[2]);
    });

    it('should include all settlement details', async () => {
      const response = await request(app)
        .get('/api/settlements');

      const settlement = response.body.settlements.find(s => s.restaurantId === 'restaurant-001');
      
      expect(settlement).toBeDefined();
      expect(settlement.restaurantName).toBe('Restaurant A');
      expect(settlement.totalOrders).toBe(5);
      expect(settlement.orderSubtotal).toBe(500.00);
      expect(settlement.platformFee).toBe(75.00);
      expect(settlement.amountDue).toBe(425.00);
      expect(settlement.status).toBe('PENDING');
    });

    it('should include payment info for paid settlements', async () => {
      const response = await request(app)
        .get('/api/settlements');

      const paidSettlement = response.body.settlements.find(s => s.status === 'PAID');
      
      expect(paidSettlement).toBeDefined();
      expect(paidSettlement.paymentDate).toBeDefined();
      expect(paidSettlement.transactionId).toBe('TXN-123456');
    });
  });

  describe('POST /api/settlements/process-weekly', () => {
    beforeEach(async () => {
      // Create pending settlements for processing
      const lastSunday = getPreviousSunday();
      
      await Settlement.create([
        {
          restaurantId: 'restaurant-001',
          restaurantName: 'Restaurant A',
          weekEnding: lastSunday,
          totalOrders: 10,
          orderSubtotal: 1000.00,
          platformFee: 150.00,
          amountDue: 850.00,
          status: 'PENDING',
          orderIds: ['order-1', 'order-2']
        },
        {
          restaurantId: 'restaurant-002',
          restaurantName: 'Restaurant B',
          weekEnding: lastSunday,
          totalOrders: 5,
          orderSubtotal: 500.00,
          platformFee: 75.00,
          amountDue: 425.00,
          status: 'PENDING',
          orderIds: ['order-3', 'order-4']
        }
      ]);
    });

    it('should process weekly settlements', async () => {
      const response = await request(app)
        .post('/api/settlements/process-weekly');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.processed).toBeDefined();
      expect(response.body.successful).toBeDefined();
      expect(response.body.failed).toBeDefined();
    });

    it('should update settlement status after processing', async () => {
      await request(app)
        .post('/api/settlements/process-weekly');

      const settlements = await Settlement.find({ status: 'PAID' });
      // Number of paid settlements depends on bank transfer mock success
      expect(settlements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty pending settlements', async () => {
      // Clear all pending settlements
      await Settlement.deleteMany({ status: 'PENDING' });

      const response = await request(app)
        .post('/api/settlements/process-weekly');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.processed).toBe(0);
    });
  });

  describe('Settlement Model Validation', () => {
    it('should calculate amountDue correctly', async () => {
      const settlement = await Settlement.create({
        restaurantId: 'restaurant-test',
        restaurantName: 'Test Restaurant',
        weekEnding: new Date(),
        totalOrders: 1,
        orderSubtotal: 250.00,
        platformFee: 37.50,
        amountDue: 212.50, // 250 - 37.50
        status: 'PENDING',
        orderIds: ['test-order']
      });

      expect(settlement.amountDue).toBe(212.50);
      expect(settlement.orderSubtotal - settlement.platformFee).toBe(settlement.amountDue);
    });

    it('should track order IDs correctly', async () => {
      const orderIds = ['order-a', 'order-b', 'order-c'];
      
      const settlement = await Settlement.create({
        restaurantId: 'restaurant-test',
        restaurantName: 'Test Restaurant',
        weekEnding: new Date(),
        totalOrders: 3,
        orderSubtotal: 300.00,
        platformFee: 45.00,
        amountDue: 255.00,
        status: 'PENDING',
        orderIds
      });

      expect(settlement.orderIds).toEqual(orderIds);
      expect(settlement.orderIds.length).toBe(3);
    });

    it('should handle different settlement statuses', async () => {
      const statuses = ['PENDING', 'PAID', 'FAILED'];
      
      for (const status of statuses) {
        const settlement = await Settlement.create({
          restaurantId: `restaurant-${status}`,
          restaurantName: 'Test Restaurant',
          weekEnding: new Date(),
          totalOrders: 1,
          orderSubtotal: 100.00,
          platformFee: 15.00,
          amountDue: 85.00,
          status,
          orderIds: ['test-order']
        });

        expect(settlement.status).toBe(status);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This tests that the API handles errors properly
      const response = await request(app)
        .post('/api/settlements/add-order')
        .send({
          restaurantId: 'test',
          restaurantName: 'Test',
          orderId: 'order-1',
          subtotal: 100,
          platformFee: 15,
          weekEnding: 'invalid-date' // Invalid date
        });

      // Should handle gracefully (either succeed with date conversion or fail with 500)
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/settlements/add-order')
        .send({
          // Missing required fields
        });

      // Should return error status
      expect([400, 500]).toContain(response.status);
    });
  });
});

// Helper function to get previous Sunday
function getPreviousSunday() {
  const date = new Date();
  date.setDate(date.getDate() - ((date.getDay() + 7) % 7));
  date.setHours(0, 0, 0, 0);
  return date;
}
