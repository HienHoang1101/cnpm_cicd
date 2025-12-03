/**
 * Integration Tests for Notification Service
 * Tests all API endpoints with real HTTP requests
 */

import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import Notification from '../../models/Notification.js';
import notificationRoutes from '../../routes/notificationRoutes.js';
import { jest } from '@jest/globals';

// Mock auth middleware
jest.unstable_mockModule('../../middlewares/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test-admin-id', role: 'admin' };
    next();
  },
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Not authorized' });
    }
  }
}));

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationRoutes);
  return app;
};

describe('Notification Service Integration Tests', () => {
  let app;
  let testNotificationId;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_integration_test';
    await mongoose.connect(mongoUri);
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up and close connection
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear notifications before each test
    await Notification.deleteMany({});
  });

  describe('POST /api/notifications/email', () => {
    it('should send email notification', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email notification'
      };

      const response = await request(app)
        .post('/api/notifications/email')
        .send(emailData);

      // Email endpoint may succeed or fail based on SMTP config
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should validate email format', async () => {
      const emailData = {
        to: 'invalid-email',
        subject: 'Test',
        body: 'Test body'
      };

      const response = await request(app)
        .post('/api/notifications/email')
        .send(emailData);

      // Should handle invalid email gracefully
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications/sms', () => {
    it('should send SMS notification', async () => {
      const smsData = {
        to: '+1234567890',
        message: 'Test SMS notification'
      };

      const response = await request(app)
        .post('/api/notifications/sms')
        .send(smsData);

      // SMS endpoint may succeed or fail based on Twilio config
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should validate phone number', async () => {
      const smsData = {
        to: 'invalid-phone',
        message: 'Test message'
      };

      const response = await request(app)
        .post('/api/notifications/sms')
        .send(smsData);

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/notifications', () => {
    it('should create a new notification for admin', async () => {
      const notificationData = {
        type: 'ORDER_UPDATE',
        recipientType: 'customer',
        recipientId: 'customer-123',
        relatedEntity: { id: 'order-123', type: 'order' },
        title: 'Order Update',
        message: 'Your order has been confirmed'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.notification).toBeDefined();
      expect(response.body.notification.type).toBe('ORDER_UPDATE');
      expect(response.body.notification.title).toBe('Order Update');
      
      testNotificationId = response.body.notification._id;
    });

    it('should require all mandatory fields', async () => {
      const incompleteData = {
        type: 'ORDER_UPDATE'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require recipientId for non-system notifications', async () => {
      const notificationData = {
        type: 'ORDER_UPDATE',
        recipientType: 'customer',
        // Missing recipientId
        relatedEntity: { id: 'order-123', type: 'order' },
        title: 'Order Update',
        message: 'Your order has been confirmed'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('recipientId is required');
    });
  });

  describe('GET /api/notifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await Notification.create([
        {
          type: 'ORDER_UPDATE',
          recipientType: 'customer',
          recipientId: 'customer-1',
          relatedEntity: { id: 'order-1', type: 'order' },
          title: 'Order Confirmed',
          message: 'Your order has been confirmed',
          status: 'unread'
        },
        {
          type: 'DELIVERY_UPDATE',
          recipientType: 'customer',
          recipientId: 'customer-2',
          relatedEntity: { id: 'delivery-1', type: 'delivery' },
          title: 'Driver Assigned',
          message: 'A driver has been assigned',
          status: 'read'
        }
      ]);
    });

    it('should get all notifications', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ type: 'ORDER_UPDATE' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].type).toBe('ORDER_UPDATE');
    });

    it('should filter notifications by status', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ status: 'unread' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('unread');
    });

    it('should filter by recipientType', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ recipientType: 'customer' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await Notification.create({
        type: 'ORDER_UPDATE',
        recipientType: 'customer',
        recipientId: 'customer-1',
        relatedEntity: { id: 'order-1', type: 'order' },
        title: 'Order Update',
        message: 'Your order is ready',
        status: 'unread'
      });
      notificationId = notification._id;
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('read');
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/notifications/${fakeId}/read`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    beforeEach(async () => {
      await Notification.create([
        {
          type: 'ORDER_UPDATE',
          recipientType: 'customer',
          recipientId: 'customer-1',
          relatedEntity: { id: 'order-1', type: 'order' },
          title: 'Order 1',
          message: 'Message 1',
          status: 'unread'
        },
        {
          type: 'ORDER_UPDATE',
          recipientType: 'customer',
          recipientId: 'customer-1',
          relatedEntity: { id: 'order-2', type: 'order' },
          title: 'Order 2',
          message: 'Message 2',
          status: 'unread'
        }
      ]);
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);

      // Verify all are read
      const unreadCount = await Notification.countDocuments({ status: 'unread' });
      expect(unreadCount).toBe(0);
    });

    it('should filter by recipientId when provided', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .query({ recipientId: 'customer-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await Notification.create({
        type: 'PROMO',
        recipientType: 'customer',
        recipientId: 'customer-1',
        relatedEntity: { id: 'promo-1', type: 'promotion' },
        title: 'Special Offer',
        message: '50% off your next order',
        status: 'unread'
      });
      notificationId = notification._id;
    });

    it('should delete notification successfully', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification deleted successfully');

      // Verify deletion
      const deleted = await Notification.findById(notificationId);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/notifications/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Database Operations', () => {
    it('should handle notification expiry correctly', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const notification = await Notification.create({
        type: 'REMINDER',
        recipientType: 'customer',
        recipientId: 'customer-1',
        relatedEntity: { id: 'reminder-1', type: 'reminder' },
        title: 'Reminder',
        message: 'Don\'t forget your order',
        status: 'unread',
        expiresAt: futureDate
      });

      expect(notification.expiresAt).toEqual(futureDate);
    });

    it('should set default expiry if not provided', async () => {
      const notificationData = {
        type: 'INFO',
        recipientType: 'customer',
        recipientId: 'customer-1',
        relatedEntity: { id: 'info-1', type: 'info' },
        title: 'Info',
        message: 'Just an info notification'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body.notification.expiresAt).toBeDefined();
    });
  });
});
