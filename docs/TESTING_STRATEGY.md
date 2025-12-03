# 🧪 Testing Strategy & Guidelines - FastFood Delivery

## 📋 Mục Lục

1. [Tổng Quan Về Testing](#1-tổng-quan-về-testing)
2. [Các Loại Test](#2-các-loại-test)
3. [Testing Pyramid](#3-testing-pyramid)
4. [Cách Viết Test Tốt](#4-cách-viết-test-tốt)
5. [Mocking & Stubbing](#5-mocking--stubbing)
6. [Test Coverage](#6-test-coverage)
7. [CI/CD Integration](#7-cicd-integration)
8. [Best Practices](#8-best-practices)

---

## 1. Tổng Quan Về Testing

### 1.1 Tại Sao Cần Testing?

```
🔍 Phát hiện bugs sớm → 💰 Tiết kiệm chi phí
🛡️ Đảm bảo chất lượng → 😊 Khách hàng hài lòng
📚 Documentation sống → 👨‍💻 Developer hiểu code
🔄 Refactor an toàn → ⚡ Phát triển nhanh hơn
```

### 1.2 Nguyên Tắc Testing

1. **F.I.R.S.T**
   - **F**ast: Tests chạy nhanh
   - **I**ndependent: Tests độc lập với nhau
   - **R**epeatable: Chạy nhiều lần cùng kết quả
   - **S**elf-validating: Pass hoặc Fail rõ ràng
   - **T**imely: Viết test đúng thời điểm

2. **AAA Pattern**
   - **A**rrange: Chuẩn bị dữ liệu
   - **A**ct: Thực hiện action
   - **A**ssert: Kiểm tra kết quả

---

## 2. Các Loại Test

### 2.1 Unit Testing

**Định nghĩa**: Kiểm tra từng function/module riêng lẻ

**Đặc điểm**:
- Nhanh nhất
- Isolated - không phụ thuộc external services
- Mock tất cả dependencies

**Ví dụ**:

```javascript
// auth/tests/auth.test.js
import { jest } from '@jest/globals';

describe('AuthController', () => {
  describe('register', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123'
      };
      
      // Mock User.create
      const mockUser = { _id: '123', ...userData };
      User.create = jest.fn().mockResolvedValue(mockUser);
      
      // Act
      const result = await authController.register(userData);
      
      // Assert
      expect(result.email).toBe('john@test.com');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'john@test.com'
      }));
    });
    
    it('should throw error if email exists', async () => {
      // Arrange
      User.findOne = jest.fn().mockResolvedValue({ email: 'exists@test.com' });
      
      // Act & Assert
      await expect(authController.register({ email: 'exists@test.com' }))
        .rejects.toThrow('Email already exists');
    });
  });
});
```

### 2.2 Integration Testing

**Định nghĩa**: Kiểm tra sự tương tác giữa các components

**Đặc điểm**:
- Chậm hơn unit test
- Có thể dùng database thật (test db)
- Test API endpoints

**Ví dụ**:

```javascript
// tests/integration/auth.integration.test.js
import request from 'supertest';
import app from '../../auth/index.js';
import mongoose from 'mongoose';

describe('Auth API Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.accessToken).toBeDefined();
    });
    
    it('should return 400 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 1',
          email: 'duplicate@test.com',
          password: 'password123'
        });
      
      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@test.com',
          password: 'password456'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('exists');
    });
  });
});
```

### 2.3 End-to-End (E2E) Testing

**Định nghĩa**: Kiểm tra toàn bộ flow từ đầu đến cuối

**Đặc điểm**:
- Chậm nhất
- Test như user thật sử dụng
- Cần tất cả services chạy

**Ví dụ**:

```javascript
// tests/e2e/order-flow.e2e.test.js
import axios from 'axios';

describe('Complete Order Flow E2E', () => {
  const BASE_URL = 'http://localhost';
  let authToken;
  let userId;
  let orderId;
  
  it('Step 1: User registers', async () => {
    const res = await axios.post(`${BASE_URL}:5001/api/auth/register`, {
      name: 'E2E Test User',
      email: `e2e_${Date.now()}@test.com`,
      password: 'password123'
    });
    
    expect(res.status).toBe(201);
    authToken = res.data.accessToken;
    userId = res.data.user._id;
  });
  
  it('Step 2: User browses restaurants', async () => {
    const res = await axios.get(`${BASE_URL}:5003/api/restaurants`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
  });
  
  it('Step 3: User creates order', async () => {
    const res = await axios.post(`${BASE_URL}:5002/api/orders`, {
      restaurantId: 'restaurant123',
      items: [{ menuItemId: 'item1', quantity: 2 }],
      deliveryAddress: '123 Test Street'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(res.status).toBe(201);
    orderId = res.data._id;
  });
  
  it('Step 4: User pays for order', async () => {
    const res = await axios.post(`${BASE_URL}:5004/api/payments`, {
      orderId,
      paymentMethod: 'card'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('completed');
  });
  
  it('Step 5: Order status is updated', async () => {
    const res = await axios.get(`${BASE_URL}:5002/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('confirmed');
  });
});
```

### 2.4 API Testing

**Định nghĩa**: Kiểm tra REST API endpoints

**Công cụ**: Supertest, Axios, Postman

```javascript
// tests/api/order.api.test.js
import request from 'supertest';

describe('Order API', () => {
  describe('GET /api/orders', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });
    
    it('should return orders for authenticated user', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  
  describe('POST /api/orders', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${validToken}`)
        .send({}); // Empty body
      
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
```

### 2.5 Performance Testing

**Định nghĩa**: Kiểm tra hiệu năng dưới tải

**Công cụ**: Artillery, k6, JMeter

```yaml
# tests/performance/load-test.yml
config:
  target: "http://localhost:5001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"

scenarios:
  - name: "User login"
    weight: 3
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          expect:
            - statusCode: 200

  - name: "Get orders"
    weight: 2
    flow:
      - get:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
```

### 2.6 Security Testing

**Định nghĩa**: Kiểm tra các lỗ hổng bảo mật

**Các kiểm tra**:
- SQL/NoSQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Authentication bypass
- Authorization flaws

```javascript
// tests/security/auth.security.test.js
describe('Security Tests', () => {
  describe('SQL Injection', () => {
    it('should prevent SQL injection in login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin'--",
          password: "anything"
        });
      
      expect(res.status).toBe(401);
    });
  });
  
  describe('XSS Prevention', () => {
    it('should sanitize user input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '<script>alert("xss")</script>',
          email: 'test@test.com',
          password: 'password123'
        });
      
      expect(res.body.user.name).not.toContain('<script>');
    });
  });
  
  describe('Rate Limiting', () => {
    it('should block after too many requests', async () => {
      // Make 100 requests rapidly
      const requests = Array(100).fill().map(() => 
        request(app).post('/api/auth/login').send({
          email: 'test@test.com',
          password: 'wrong'
        })
      );
      
      const responses = await Promise.all(requests);
      const blocked = responses.filter(r => r.status === 429);
      
      expect(blocked.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 3. Testing Pyramid

```
                    /\
                   /  \
                  / E2E \        ← Ít nhất, chậm nhất, tốn kém nhất
                 /______\
                /        \
               /Integration\     ← Vừa phải
              /____________\
             /              \
            /   Unit Tests   \   ← Nhiều nhất, nhanh nhất, rẻ nhất
           /__________________\
```

### Tỷ Lệ Đề Xuất

| Loại Test | Tỷ lệ | Số lượng (ví dụ) |
|-----------|-------|------------------|
| Unit Tests | 70% | 700 tests |
| Integration Tests | 20% | 200 tests |
| E2E Tests | 10% | 100 tests |

---

## 4. Cách Viết Test Tốt

### 4.1 Naming Convention

```javascript
// ❌ Bad
it('test1', () => {});
it('should work', () => {});

// ✅ Good
it('should return 401 when token is missing', () => {});
it('should create order when all fields are valid', () => {});
it('should throw ValidationError when email is invalid', () => {});
```

**Format**: `should [expected behavior] when [condition]`

### 4.2 One Assertion per Test

```javascript
// ❌ Bad - Multiple assertions
it('should handle user', async () => {
  const user = await createUser();
  expect(user.name).toBe('John');
  expect(user.email).toBe('john@test.com');
  expect(user.role).toBe('customer');
  expect(user.createdAt).toBeDefined();
});

// ✅ Good - Focused assertions
describe('createUser', () => {
  it('should set correct name', async () => {
    const user = await createUser({ name: 'John' });
    expect(user.name).toBe('John');
  });
  
  it('should set default role as customer', async () => {
    const user = await createUser();
    expect(user.role).toBe('customer');
  });
  
  it('should set createdAt timestamp', async () => {
    const user = await createUser();
    expect(user.createdAt).toBeDefined();
  });
});
```

### 4.3 Test Data Builders

```javascript
// tests/builders/userBuilder.js
class UserBuilder {
  constructor() {
    this.user = {
      name: 'Default Name',
      email: 'default@test.com',
      password: 'password123',
      role: 'customer'
    };
  }
  
  withName(name) {
    this.user.name = name;
    return this;
  }
  
  withEmail(email) {
    this.user.email = email;
    return this;
  }
  
  asAdmin() {
    this.user.role = 'admin';
    return this;
  }
  
  asDriver() {
    this.user.role = 'driver';
    return this;
  }
  
  build() {
    return { ...this.user };
  }
}

// Usage
const user = new UserBuilder()
  .withName('John')
  .withEmail('john@test.com')
  .asAdmin()
  .build();
```

### 4.4 Test Fixtures

```javascript
// tests/fixtures/orders.js
export const validOrder = {
  restaurantId: 'rest123',
  items: [
    { menuItemId: 'item1', quantity: 2, price: 10 },
    { menuItemId: 'item2', quantity: 1, price: 15 }
  ],
  deliveryAddress: {
    street: '123 Main St',
    city: 'Ho Chi Minh',
    lat: 10.762622,
    lng: 106.660172
  },
  specialInstructions: 'No onions please'
};

export const emptyCartOrder = {
  restaurantId: 'rest123',
  items: [],
  deliveryAddress: validOrder.deliveryAddress
};

export const invalidOrder = {
  // Missing required fields
  items: []
};
```

---

## 5. Mocking & Stubbing

### 5.1 Mocking với Jest

```javascript
// Mock entire module
jest.mock('mongoose');

// Mock specific function
import bcrypt from 'bcryptjs';
jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

// Mock implementation
const mockSave = jest.fn().mockResolvedValue({ _id: '123' });
User.prototype.save = mockSave;

// Verify mock was called
expect(mockSave).toHaveBeenCalledTimes(1);
expect(mockSave).toHaveBeenCalledWith();
```

### 5.2 Mocking External Services

```javascript
// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'secret_123',
        status: 'requires_payment_method'
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test123',
        status: 'succeeded'
      })
    }
  }));
});

// Mock Axios
jest.mock('axios');
axios.get.mockResolvedValue({ data: { restaurants: [] } });
axios.post.mockResolvedValue({ data: { success: true } });
```

### 5.3 Mocking Database

```javascript
// In-memory MongoDB for tests
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

---

## 6. Test Coverage

### 6.1 Coverage Metrics

| Metric | Mô Tả | Target |
|--------|-------|--------|
| **Line Coverage** | % dòng code được test | ≥ 80% |
| **Branch Coverage** | % nhánh if/else được test | ≥ 70% |
| **Function Coverage** | % functions được gọi | ≥ 80% |
| **Statement Coverage** | % statements được thực thi | ≥ 80% |

### 6.2 Jest Coverage Config

```javascript
// jest.config.js
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js'
  ]
};
```

### 6.3 Xem Coverage Report

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
        env:
          MONGO_URI: mongodb://localhost:27017/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: reports/junit.xml
```

### 7.2 Test Reports

```javascript
// jest.config.js - JUnit reporter for CI
reporters: [
  'default',
  ['jest-junit', {
    outputDirectory: 'reports',
    outputName: 'junit.xml',
    classNameTemplate: '{classname}',
    titleTemplate: '{title}'
  }]
]
```

---

## 8. Best Practices

### 8.1 DO's ✅

1. **Test behavior, không phải implementation**
   ```javascript
   // ✅ Good - test behavior
   it('should hash password before saving', async () => {
     const user = await User.create({ password: 'plain' });
     expect(user.password).not.toBe('plain');
   });
   
   // ❌ Bad - test implementation
   it('should call bcrypt.hash', async () => {
     await User.create({ password: 'plain' });
     expect(bcrypt.hash).toHaveBeenCalled();
   });
   ```

2. **Sử dụng descriptive test names**
3. **Keep tests independent**
4. **Clean up after tests**
5. **Test edge cases**
6. **Use meaningful assertions**

### 8.2 DON'Ts ❌

1. **Đừng test private methods trực tiếp**
2. **Đừng test framework/library code**
3. **Đừng có logic trong tests**
4. **Đừng sleep/wait cố định**
   ```javascript
   // ❌ Bad
   await new Promise(r => setTimeout(r, 1000));
   
   // ✅ Good
   await waitFor(() => expect(element).toBeVisible());
   ```

5. **Đừng ignore flaky tests**

### 8.3 Common Patterns

**1. Given-When-Then**
```javascript
describe('Order creation', () => {
  it('should create order successfully', async () => {
    // Given
    const user = await createUser();
    const restaurant = await createRestaurant();
    const items = [{ menuItemId: 'item1', quantity: 2 }];
    
    // When
    const order = await createOrder(user._id, restaurant._id, items);
    
    // Then
    expect(order.status).toBe('pending');
    expect(order.items.length).toBe(1);
  });
});
```

**2. Factory Pattern**
```javascript
// tests/factories/index.js
export const createUser = async (overrides = {}) => {
  return User.create({
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'password123',
    ...overrides
  });
};

export const createOrder = async (userId, restaurantId, items) => {
  return Order.create({
    userId,
    restaurantId,
    items,
    status: 'pending'
  });
};
```

**3. Page Object Pattern (for E2E)**
```javascript
// tests/pages/loginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }
  
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

---

## 📚 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/)
- [Artillery Load Testing](https://www.artillery.io/)

---

*Tài liệu này được cập nhật lần cuối: 02/12/2024*
