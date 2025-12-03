/**
 * Integration Tests for Auth Service
 * Tests actual API endpoints with real MongoDB connection
 */

import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

// Import routes and models
import authRoutes from '../../routes/authRoutes.js';
import userRoutes from '../../routes/userRoutes.js';
import User from '../../model/User.js';

// Test app setup
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test configuration
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/auth_integration_test';

// Test data
const testUser = {
  email: 'integration-test@example.com',
  password: 'TestPassword123!',
  name: 'Integration Test User',
  phone: '1234567890',
  role: 'customer'
};

const testRestaurantUser = {
  email: 'restaurant-test@example.com',
  password: 'TestPassword123!',
  name: 'Restaurant Owner',
  phone: '0987654321',
  role: 'restaurant',
  nic: '123456789V',
  nicImage: 'https://example.com/nic.jpg'
};

describe('Auth Service Integration Tests', () => {
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
      // Clean up test users
      await User.deleteMany({ 
        email: { 
          $in: [testUser.email, testRestaurantUser.email, 'updated-test@example.com'] 
        } 
      });
      await mongoose.connection.close();
      console.log('Test database connection closed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  // Clean up before each test suite
  beforeEach(async () => {
    await User.deleteMany({ 
      email: { 
        $in: [testUser.email, testRestaurantUser.email] 
      } 
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.role).toBe('customer');
      expect(res.body.user.status).toBe('active');
      expect(res.body.user.password).toBeUndefined();

      // Verify user in database
      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser).toBeDefined();
      expect(dbUser.name).toBe(testUser.name);
    });

    it('should register a restaurant with pending status', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testRestaurantUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('restaurant');
      expect(res.body.user.status).toBe('pending_approval');
    });

    it('should reject registration without NIC for restaurant', async () => {
      const invalidRestaurant = {
        email: 'invalid-restaurant@example.com',
        password: 'TestPassword123!',
        name: 'Invalid Restaurant',
        phone: '1111111111',
        role: 'restaurant'
        // Missing nic and nicImage
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidRestaurant)
        .expect(400);

      expect(res.body.message).toBe('NIC details required');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject login without email or password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide email and password');
    });

    it('should reject login for pending approval accounts', async () => {
      // Register restaurant (pending approval)
      await request(app)
        .post('/api/auth/register')
        .send(testRestaurantUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testRestaurantUser.email,
          password: testRestaurantUser.password
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('pending_approval');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;

    beforeEach(async () => {
      // Create user and get refresh token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No refresh token provided');
    });
  });

  describe('GET /api/auth/validate-token', () => {
    let accessToken;

    beforeEach(async () => {
      // Create user and get access token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      accessToken = loginRes.body.token;
    });

    it('should validate a valid token', async () => {
      const res = await request(app)
        .get('/api/auth/validate-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Token is valid');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/validate-token')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid token');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/validate-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No token provided');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should send password reset link for valid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Password reset link sent');
      expect(res.body.resetUrl).toBeDefined();
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No user found');
    });

    it('should reject request without email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide your email address');
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    let resetToken;

    beforeEach(async () => {
      // Create user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Get reset token
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      // Extract token from URL
      resetToken = res.body.resetUrl.split('/').pop();
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword456!';

      const res = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: newPassword })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password has been reset successfully');

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
    });

    it('should reject invalid reset token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/invalid-token')
        .send({ password: 'NewPassword456!' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired');
    });

    it('should reject reset without new password', async () => {
      const res = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide a new password');
    });
  });
});
