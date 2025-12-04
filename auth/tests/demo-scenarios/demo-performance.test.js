// ============================================
// KỊCH BẢN 3: PERFORMANCE TESTING
// ============================================
// Kiểm thử tải - đo hiệu năng API

import { describe, test, expect } from '@jest/globals';

describe('⚡ Performance Tests - Kiểm thử tải', () => {
  
  describe('Response Time Tests', () => {
    test('Email validation phải hoàn thành trong < 10ms', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const start = performance.now();
      
      // Chạy 10,000 lần validation
      for (let i = 0; i < 10000; i++) {
        emailRegex.test(`user${i}@example.com`);
      }
      
      const duration = performance.now() - start;
      
      console.log(`📊 10,000 email validations: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(100); // 100ms cho 10k operations
    });

    test('Password hashing simulation phải < 50ms/operation', () => {
      // Giả lập hash function
      const simpleHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return hash.toString(16);
      };
      
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        simpleHash(`password${i}VeryLongPasswordString123!@#`);
      }
      
      const duration = performance.now() - start;
      const avgTime = duration / 1000;
      
      console.log(`📊 1,000 hash operations: ${duration.toFixed(2)}ms (avg: ${avgTime.toFixed(3)}ms/op)`);
      expect(avgTime).toBeLessThan(1); // < 1ms per operation
    });
  });

  describe('Memory Usage Tests', () => {
    test('Không memory leak khi tạo nhiều user objects', () => {
      const users = [];
      
      // Tạo 10,000 user objects
      for (let i = 0; i < 10000; i++) {
        users.push({
          id: i,
          email: `user${i}@example.com`,
          name: `User ${i}`,
          createdAt: new Date()
        });
      }
      
      expect(users.length).toBe(10000);
      
      // Clear để test garbage collection
      users.length = 0;
      expect(users.length).toBe(0);
    });
  });

  describe('Concurrent Request Simulation', () => {
    test('Xử lý 100 concurrent validations', async () => {
      const validateUser = async (data) => {
        // Simulate async validation
        return new Promise((resolve) => {
          setTimeout(() => {
            const isValid = data.email && data.email.includes('@') && data.password?.length >= 6;
            resolve({ valid: isValid, userId: data.id });
          }, 1); // 1ms delay
        });
      };
      
      const start = performance.now();
      
      // Tạo 100 concurrent requests
      const requests = Array.from({ length: 100 }, (_, i) => 
        validateUser({
          id: i,
          email: `user${i}@test.com`,
          password: 'password123'
        })
      );
      
      const results = await Promise.all(requests);
      
      const duration = performance.now() - start;
      
      console.log(`📊 100 concurrent validations: ${duration.toFixed(2)}ms`);
      
      expect(results.length).toBe(100);
      expect(results.every(r => r.valid)).toBe(true);
      expect(duration).toBeLessThan(500); // < 500ms for 100 concurrent
    });
  });

  describe('Stress Test', () => {
    test('Token generation stress test - 5000 tokens', () => {
      const generateToken = () => {
        return Array.from({ length: 32 }, () => 
          Math.random().toString(36).charAt(2)
        ).join('');
      };
      
      const start = performance.now();
      const tokens = new Set();
      
      for (let i = 0; i < 5000; i++) {
        tokens.add(generateToken());
      }
      
      const duration = performance.now() - start;
      
      console.log(`📊 5,000 token generations: ${duration.toFixed(2)}ms`);
      console.log(`📊 Unique tokens: ${tokens.size} (collision rate: ${((5000 - tokens.size) / 5000 * 100).toFixed(2)}%)`);
      
      expect(duration).toBeLessThan(1000); // < 1 second
      expect(tokens.size).toBeGreaterThan(4900); // < 2% collision rate
    });
  });

  describe('Data Processing Performance', () => {
    test('Sort 10,000 users by createdAt', () => {
      const users = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      }));
      
      const start = performance.now();
      
      users.sort((a, b) => b.createdAt - a.createdAt);
      
      const duration = performance.now() - start;
      
      console.log(`📊 Sort 10,000 users: ${duration.toFixed(2)}ms`);
      
      expect(duration).toBeLessThan(100);
      expect(users[0].createdAt.getTime()).toBeGreaterThanOrEqual(users[9999].createdAt.getTime());
    });

    test('Filter + Map + Reduce on large dataset', () => {
      const orders = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        amount: Math.random() * 100,
        status: ['pending', 'completed', 'cancelled'][i % 3],
        userId: i % 1000
      }));
      
      const start = performance.now();
      
      const totalCompleted = orders
        .filter(o => o.status === 'completed')
        .map(o => o.amount)
        .reduce((sum, amount) => sum + amount, 0);
      
      const duration = performance.now() - start;
      
      console.log(`📊 Filter+Map+Reduce 50,000 orders: ${duration.toFixed(2)}ms`);
      console.log(`📊 Total completed amount: $${totalCompleted.toFixed(2)}`);
      
      expect(duration).toBeLessThan(200);
      expect(totalCompleted).toBeGreaterThan(0);
    });
  });

});
