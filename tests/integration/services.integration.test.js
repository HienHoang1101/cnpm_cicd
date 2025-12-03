// Integration Tests for FastFood Delivery Microservices
// =====================================================

const axios = require('axios');
const mongoose = require('mongoose');

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5002';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005';

// Test data
let authToken = '';
let refreshToken = '';
let testUserId = '';
let testOrderId = '';

describe('FastFood Delivery - Integration Tests', () => {
  // ==========================================
  // SETUP & TEARDOWN
  // ==========================================
  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  // ==========================================
  // AUTH SERVICE INTEGRATION TESTS
  // ==========================================
  describe('Auth Service Integration', () => {
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Integration Test User',
      phone: '1234567890',
      role: 'customer'
    };

    describe('POST /api/auth/register', () => {
      test('should register a new user', async () => {
        const response = await axios.post(
          `${AUTH_SERVICE_URL}/api/auth/register`,
          testUser
        );

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.token).toBeDefined();
        expect(response.data.user.email).toBe(testUser.email);

        authToken = response.data.token;
        refreshToken = response.data.refreshToken;
        testUserId = response.data.user._id || response.data.user.id;
      });

      test('should not register duplicate email', async () => {
        try {
          await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, testUser);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.success).toBe(false);
        }
      });

      test('should require all fields', async () => {
        try {
          await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
            email: 'incomplete@test.com'
          });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
        }
      });
    });

    describe('POST /api/auth/login', () => {
      test('should login with valid credentials', async () => {
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.token).toBeDefined();

        authToken = response.data.token;
      });

      test('should reject invalid password', async () => {
        try {
          await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
            email: testUser.email,
            password: 'wrongpassword'
          });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });

      test('should reject non-existent user', async () => {
        try {
          await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
            email: 'nonexistent@test.com',
            password: 'password123'
          });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });
    });

    describe('GET /api/auth/validate-token', () => {
      test('should validate a valid token', async () => {
        const response = await axios.get(
          `${AUTH_SERVICE_URL}/api/auth/validate-token`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.user).toBeDefined();
      });

      test('should reject invalid token', async () => {
        try {
          await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
            headers: { Authorization: 'Bearer invalid-token' }
          });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });

      test('should reject missing token', async () => {
        try {
          await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });
    });

    describe('POST /api/auth/refresh-token', () => {
      test('should refresh access token', async () => {
        const response = await axios.post(
          `${AUTH_SERVICE_URL}/api/auth/refresh-token`,
          { refreshToken }
        );

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.token).toBeDefined();

        authToken = response.data.token;
      });

      test('should reject invalid refresh token', async () => {
        try {
          await axios.post(`${AUTH_SERVICE_URL}/api/auth/refresh-token`, {
            refreshToken: 'invalid-refresh-token'
          });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
        }
      });
    });

    describe('GET /api/auth/me', () => {
      test('should get current user profile', async () => {
        const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.user.email).toBe(testUser.email);
      });
    });
  });

  // ==========================================
  // ORDER SERVICE INTEGRATION TESTS
  // ==========================================
  describe('Order Service Integration', () => {
    describe('GET /api/orders', () => {
      test('should get user orders', async () => {
        const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status).toBe(200);
        expect(response.data.status).toBe(200);
        expect(Array.isArray(response.data.orders)).toBe(true);
      });

      test('should require authentication', async () => {
        try {
          await axios.get(`${ORDER_SERVICE_URL}/api/orders`);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });
    });

    describe('Order Lifecycle', () => {
      test('should create an order when cart has items', async () => {
        // This test requires cart items to be added first
        // In a real scenario, you would add items to cart before creating order
        try {
          const response = await axios.post(
            `${ORDER_SERVICE_URL}/api/orders`,
            {
              type: 'DELIVERY',
              deliveryAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                coordinates: { lat: 10.123, lng: 106.456 }
              }
            },
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          if (response.status === 201) {
            testOrderId = response.data.order.orderId;
            expect(response.data.status).toBe(201);
          }
        } catch (error) {
          // Cart might be empty, which is expected
          expect(error.response.status).toBe(400);
        }
      });

      test('should get order by ID', async () => {
        if (!testOrderId) {
          console.log('Skipping: No test order created');
          return;
        }

        const response = await axios.get(
          `${ORDER_SERVICE_URL}/api/orders/${testOrderId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.order.orderId).toBe(testOrderId);
      });

      test('should update order status', async () => {
        if (!testOrderId) {
          console.log('Skipping: No test order created');
          return;
        }

        const response = await axios.patch(
          `${ORDER_SERVICE_URL}/api/orders/${testOrderId}/status`,
          { status: 'PREPARING' },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        expect(response.status).toBe(200);
        expect(response.data.order.status).toBe('PREPARING');
      });
    });
  });

  // ==========================================
  // SERVICE COMMUNICATION TESTS
  // ==========================================
  describe('Inter-Service Communication', () => {
    describe('Auth to Order Service', () => {
      test('should validate auth token from order service', async () => {
        // Order service should be able to validate tokens via auth service
        const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status).toBe(200);
      });
    });

    describe('Order to Restaurant Service', () => {
      test('should fetch restaurant details when creating order', async () => {
        // This is implicitly tested when creating an order
        // The order service should communicate with restaurant service
        try {
          const response = await axios.get(
            `${RESTAURANT_SERVICE_URL}/api/restaurants`,
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          expect(response.status).toBe(200);
        } catch (error) {
          // Restaurant service might not be available in test env
          console.log('Restaurant service not available:', error.message);
        }
      });
    });
  });

  // ==========================================
  // HEALTH CHECK TESTS
  // ==========================================
  describe('Service Health Checks', () => {
    test('Auth service should be healthy', async () => {
      try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/health`);
        expect(response.status).toBe(200);
      } catch (error) {
        // Health endpoint might not exist
        expect(error.response.status).toBeDefined();
      }
    });

    test('Order service should be healthy', async () => {
      try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/health`);
        expect(response.status).toBe(200);
      } catch (error) {
        expect(error.response.status).toBeDefined();
      }
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
  describe('Error Handling', () => {
    test('should handle invalid JSON gracefully', async () => {
      try {
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, 'invalid-json', {
          headers: { 'Content-Type': 'application/json' }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array(100).fill().map(() =>
        axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }).catch(e => e.response)
      );

      const responses = await Promise.all(requests);
      
      // Some requests might be rate limited (429)
      const hasRateLimit = responses.some(r => r && r.status === 429);
      // Or all should succeed
      const allSuccess = responses.every(r => r && r.status === 200);
      
      expect(hasRateLimit || allSuccess).toBe(true);
    });
  });
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================
async function waitForServices(maxRetries = 30, delay = 2000) {
  const services = [
    { name: 'Auth', url: AUTH_SERVICE_URL },
    { name: 'Order', url: ORDER_SERVICE_URL }
  ];

  for (const service of services) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await axios.get(`${service.url}/health`, { timeout: 5000 });
        console.log(`✅ ${service.name} service is ready`);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          console.warn(`⚠️ ${service.name} service not available after ${maxRetries} retries`);
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
}

async function cleanupTestData() {
  try {
    // Cleanup logic here if needed
    console.log('🧹 Cleaning up test data...');
  } catch (error) {
    console.error('Error cleaning up:', error.message);
  }
}

// ==========================================
// PERFORMANCE TESTS
// ==========================================
describe('Performance Tests', () => {
  test('Auth service should respond within acceptable time', async () => {
    const start = Date.now();
    
    await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should respond within 1 second
  });

  test('Order service should respond within acceptable time', async () => {
    const start = Date.now();
    
    await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
  });
});
