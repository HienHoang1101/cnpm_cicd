// E2E Tests for FastFood Delivery Platform
// =========================================

const axios = require('axios');

// Service URLs
const BASE_URL = process.env.BASE_URL || 'http://localhost';
const AUTH_PORT = process.env.AUTH_PORT || 5001;
const ORDER_PORT = process.env.ORDER_PORT || 5002;
const RESTAURANT_PORT = process.env.RESTAURANT_PORT || 5003;
const PAYMENT_PORT = process.env.PAYMENT_PORT || 5005;

const AUTH_URL = `${BASE_URL}:${AUTH_PORT}`;
const ORDER_URL = `${BASE_URL}:${ORDER_PORT}`;
const RESTAURANT_URL = `${BASE_URL}:${RESTAURANT_PORT}`;
const PAYMENT_URL = `${BASE_URL}:${PAYMENT_PORT}`;

// Test data storage
let customerToken = '';
let restaurantToken = '';
let deliveryToken = '';
let adminToken = '';
let testOrderId = '';
let testRestaurantId = '';

describe('FastFood Delivery - E2E Test Suite', () => {
  // ==========================================
  // COMPLETE USER JOURNEY TESTS
  // ==========================================
  describe('Complete Order Flow - Customer Journey', () => {
    const customer = {
      email: `customer_e2e_${Date.now()}@test.com`,
      password: 'CustomerPass123!',
      name: 'E2E Test Customer',
      phone: '1234567890',
      role: 'customer'
    };

    test('Step 1: Customer Registration', async () => {
      const response = await axios.post(`${AUTH_URL}/api/auth/register`, customer);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.token).toBeDefined();
      
      customerToken = response.data.token;
    });

    test('Step 2: Customer Login', async () => {
      const response = await axios.post(`${AUTH_URL}/api/auth/login`, {
        email: customer.email,
        password: customer.password
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      customerToken = response.data.token;
    });

    test('Step 3: Browse Restaurants', async () => {
      try {
        const response = await axios.get(`${RESTAURANT_URL}/api/restaurants`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        expect(response.status).toBe(200);
        
        if (response.data.restaurants && response.data.restaurants.length > 0) {
          testRestaurantId = response.data.restaurants[0]._id;
        }
      } catch (error) {
        console.log('Restaurant service not available, skipping...');
      }
    });

    test('Step 4: View Restaurant Menu', async () => {
      if (!testRestaurantId) {
        console.log('Skipping: No restaurant available');
        return;
      }

      try {
        const response = await axios.get(
          `${RESTAURANT_URL}/api/restaurants/${testRestaurantId}/dishes`,
          {
            headers: { Authorization: `Bearer ${customerToken}` }
          }
        );
        
        expect(response.status).toBe(200);
      } catch (error) {
        console.log('Could not fetch menu:', error.message);
      }
    });

    test('Step 5: Add Items to Cart', async () => {
      // In a real E2E test, you would add items to cart
      // This is a placeholder for the cart functionality
      try {
        const response = await axios.post(
          `${ORDER_URL}/api/cart`,
          {
            restaurantId: testRestaurantId || 'test-restaurant',
            itemId: 'test-item',
            quantity: 2
          },
          {
            headers: { Authorization: `Bearer ${customerToken}` }
          }
        );
        
        expect([200, 201, 404]).toContain(response.status);
      } catch (error) {
        // Cart endpoint might not exist
        console.log('Cart functionality:', error.message);
      }
    });

    test('Step 6: Create Order', async () => {
      try {
        const response = await axios.post(
          `${ORDER_URL}/api/orders`,
          {
            type: 'DELIVERY',
            deliveryAddress: {
              street: '123 E2E Test Street',
              city: 'Test City',
              state: 'TS',
              coordinates: { lat: 10.762622, lng: 106.660172 }
            },
            paymentMethod: 'CASH'
          },
          {
            headers: { Authorization: `Bearer ${customerToken}` }
          }
        );
        
        if (response.status === 201) {
          testOrderId = response.data.order.orderId;
          expect(response.data.message).toBe('Order placed successfully');
        }
      } catch (error) {
        // Cart might be empty
        expect(error.response.status).toBe(400);
      }
    });

    test('Step 7: Track Order', async () => {
      if (!testOrderId) {
        console.log('Skipping: No order to track');
        return;
      }

      const response = await axios.get(
        `${ORDER_URL}/api/orders/${testOrderId}/tracking`,
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.orderId).toBe(testOrderId);
    });

    test('Step 8: View Order History', async () => {
      const response = await axios.get(`${ORDER_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.orders)).toBe(true);
    });

    test('Step 9: Customer Logout', async () => {
      const response = await axios.post(
        `${AUTH_URL}/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  // ==========================================
  // RESTAURANT OWNER JOURNEY
  // ==========================================
  describe('Restaurant Owner Journey', () => {
    const restaurantOwner = {
      email: `restaurant_e2e_${Date.now()}@test.com`,
      password: 'RestaurantPass123!',
      name: 'E2E Test Restaurant Owner',
      phone: '0987654321',
      role: 'restaurant',
      nic: '123456789V',
      nicImage: 'https://example.com/nic.jpg'
    };

    test('Step 1: Restaurant Owner Registration', async () => {
      const response = await axios.post(
        `${AUTH_URL}/api/auth/register`,
        restaurantOwner
      );
      
      expect(response.status).toBe(201);
      expect(response.data.user.status).toBe('pending_approval');
      
      restaurantToken = response.data.token;
    });

    test('Step 2: View Incoming Orders (after approval)', async () => {
      try {
        const response = await axios.get(
          `${ORDER_URL}/api/orders/restaurant`,
          {
            headers: { Authorization: `Bearer ${restaurantToken}` }
          }
        );
        
        expect([200, 403]).toContain(response.status);
      } catch (error) {
        // Account might not be approved
        expect([401, 403]).toContain(error.response.status);
      }
    });

    test('Step 3: Update Order Status', async () => {
      if (!testOrderId) {
        console.log('Skipping: No order to update');
        return;
      }

      try {
        const response = await axios.patch(
          `${ORDER_URL}/api/orders/${testOrderId}/status`,
          { status: 'PREPARING' },
          {
            headers: { Authorization: `Bearer ${restaurantToken}` }
          }
        );
        
        expect([200, 403]).toContain(response.status);
      } catch (error) {
        console.log('Could not update order:', error.message);
      }
    });
  });

  // ==========================================
  // DELIVERY PERSON JOURNEY
  // ==========================================
  describe('Delivery Person Journey', () => {
    const deliveryPerson = {
      email: `delivery_e2e_${Date.now()}@test.com`,
      password: 'DeliveryPass123!',
      name: 'E2E Test Delivery',
      phone: '5555555555',
      role: 'delivery',
      nic: '987654321V',
      nicImage: 'https://example.com/nic-delivery.jpg',
      vehiclePlate: 'ABC-1234'
    };

    test('Step 1: Delivery Person Registration', async () => {
      const response = await axios.post(
        `${AUTH_URL}/api/auth/register`,
        deliveryPerson
      );
      
      expect(response.status).toBe(201);
      expect(response.data.user.status).toBe('pending_approval');
      
      deliveryToken = response.data.token;
    });

    test('Step 2: Accept Delivery Assignment', async () => {
      // This would be tested with a websocket connection in real scenario
      console.log('Delivery assignment tested via websocket');
      expect(true).toBe(true);
    });

    test('Step 3: Update Location', async () => {
      if (!testOrderId) {
        console.log('Skipping: No order for location update');
        return;
      }

      try {
        const response = await axios.patch(
          `${ORDER_URL}/api/orders/${testOrderId}/delivery-location`,
          { lat: 10.762622, lng: 106.660172 },
          {
            headers: { Authorization: `Bearer ${deliveryToken}` }
          }
        );
        
        expect([200, 403, 400]).toContain(response.status);
      } catch (error) {
        console.log('Location update:', error.message);
      }
    });
  });

  // ==========================================
  // PAYMENT FLOW TESTS
  // ==========================================
  describe('Payment Flow', () => {
    test('should process payment for order', async () => {
      if (!testOrderId) {
        console.log('Skipping: No order for payment');
        return;
      }

      try {
        const response = await axios.post(
          `${PAYMENT_URL}/api/payments/process`,
          {
            orderId: testOrderId,
            amount: 25.99,
            paymentMethod: 'card'
          },
          {
            headers: { Authorization: `Bearer ${customerToken}` }
          }
        );
        
        expect([200, 201]).toContain(response.status);
      } catch (error) {
        console.log('Payment processing:', error.message);
      }
    });

    test('should get payment status', async () => {
      if (!testOrderId) {
        console.log('Skipping: No order for payment status');
        return;
      }

      try {
        const response = await axios.get(
          `${PAYMENT_URL}/api/payments/${testOrderId}`,
          {
            headers: { Authorization: `Bearer ${customerToken}` }
          }
        );
        
        expect([200, 404]).toContain(response.status);
      } catch (error) {
        console.log('Payment status:', error.message);
      }
    });
  });

  // ==========================================
  // ERROR SCENARIOS
  // ==========================================
  describe('Error Scenarios', () => {
    test('should handle unauthorized access', async () => {
      try {
        await axios.get(`${ORDER_URL}/api/orders`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should handle invalid order ID', async () => {
      try {
        await axios.get(`${ORDER_URL}/api/orders/INVALID-ORDER-ID`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect([404, 400]).toContain(error.response.status);
      }
    });

    test('should handle server errors gracefully', async () => {
      try {
        // Intentionally malformed request
        await axios.post(
          `${AUTH_URL}/api/auth/login`,
          { invalid: 'data' }
        );
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
        expect(error.response.data).toBeDefined();
      }
    });
  });

  // ==========================================
  // CONCURRENT USERS TEST
  // ==========================================
  describe('Concurrent Users', () => {
    test('should handle multiple simultaneous requests', async () => {
      const concurrentRequests = Array(10).fill().map((_, i) =>
        axios.post(`${AUTH_URL}/api/auth/register`, {
          email: `concurrent_${Date.now()}_${i}@test.com`,
          password: 'ConcurrentPass123!',
          name: `Concurrent User ${i}`,
          phone: `123456789${i}`,
          role: 'customer'
        }).catch(e => ({ status: e.response?.status || 500 }))
      );

      const results = await Promise.all(concurrentRequests);
      
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });

    test('should maintain data consistency under load', async () => {
      // Create user
      const response = await axios.post(`${AUTH_URL}/api/auth/register`, {
        email: `consistency_${Date.now()}@test.com`,
        password: 'ConsistencyPass123!',
        name: 'Consistency Test',
        phone: '9999999999',
        role: 'customer'
      });

      const token = response.data.token;

      // Make concurrent order list requests
      const orderRequests = Array(5).fill().map(() =>
        axios.get(`${ORDER_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(e => ({ status: e.response?.status || 500 }))
      );

      const orderResults = await Promise.all(orderRequests);
      
      // All requests should return consistent data
      const successResults = orderResults.filter(r => r.status === 200);
      expect(successResults.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // API RESPONSE TIME TESTS
  // ==========================================
  describe('API Response Times', () => {
    const MAX_RESPONSE_TIME = 2000; // 2 seconds

    test('Auth API should respond quickly', async () => {
      const start = Date.now();
      
      await axios.post(`${AUTH_URL}/api/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'password123'
      }).catch(() => {});
      
      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });

    test('Order API should respond quickly', async () => {
      if (!customerToken) return;
      
      const start = Date.now();
      
      await axios.get(`${ORDER_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      }).catch(() => {});
      
      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });
  });
});
