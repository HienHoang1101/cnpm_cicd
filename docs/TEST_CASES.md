# 📋 Test Cases - FastFood Delivery Platform

> **Phiên bản:** 2.0  
> **Cập nhật lần cuối:** Tháng 6, 2025  
> **Tổng số Test Cases:** 140+  
> **Tỷ lệ pass:** 100% (107/107 Unit Tests)

---

## 📑 Mục Lục

1. [Tổng Quan Phân Loại Test](#tổng-quan-phân-loại-test)
2. [UNIT TESTS](#unit-tests)
3. [INTEGRATION TESTS](#integration-tests)
4. [END-TO-END (E2E) TESTS](#end-to-end-e2e-tests)
5. [Test Matrix](#test-matrix)

---

## 🎯 Tổng Quan Phân Loại Test

### Định Nghĩa Các Loại Test

| Loại Test | Mô Tả | Phạm Vi | Mục Đích |
|-----------|-------|---------|----------|
| **Unit Test** | Test từng function/method riêng lẻ | Một function/class | Đảm bảo logic đúng |
| **Integration Test** | Test tương tác giữa các thành phần | Nhiều modules/services | Đảm bảo giao tiếp đúng |
| **E2E Test** | Test toàn bộ luồng nghiệp vụ | Toàn hệ thống | Đảm bảo UX đúng |

### Phân Bố Test Cases

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHÂN BỐ TEST CASES                           │
├─────────────────────────────────────────────────────────────────┤
│  UNIT TESTS (107 tests)          ████████████████████  80%      │
│  INTEGRATION TESTS (25 tests)    █████                 15%      │
│  E2E TESTS (8 tests)             ██                    5%       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 UNIT TESTS

> **Unit Test là gì?**
> - Test **một function/method duy nhất** một cách độc lập
> - **Mock tất cả dependencies** (database, external APIs, other services)
> - Chạy **nhanh** (< 100ms per test)
> - **Không cần** kết nối network, database thực

### Unit Tests Test Cái Gì?

| Thành Phần | Unit Test Kiểm Tra |
|------------|-------------------|
| **Controllers** | Logic xử lý request, response format, status codes |
| **Services** | Business logic, tính toán, data transformation |
| **Models** | Validation rules, schema, default values |
| **Middlewares** | Authentication logic, authorization rules |
| **Utils** | Helper functions, formatters, validators |

---

### 1. Auth Service - Unit Tests (20 tests)

**📁 File:** `auth/tests/auth.test.js`  
**🎯 Mục đích:** Test logic xác thực và phân quyền người dùng

#### 1.1 Controller Tests - authController.js

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| AUTH-U-001 | Đăng ký user mới thành công | Unit | `register()` - tạo user với data hợp lệ |
| AUTH-U-002 | Đăng ký thất bại - email đã tồn tại | Unit | `register()` - validate email unique |
| AUTH-U-003 | Đăng ký thất bại - thiếu required fields | Unit | `register()` - validate required fields |
| AUTH-U-004 | Đăng ký thất bại - email format sai | Unit | `register()` - validate email format |
| AUTH-U-005 | Đăng nhập thành công | Unit | `login()` - verify credentials, return JWT |
| AUTH-U-006 | Đăng nhập thất bại - sai password | Unit | `login()` - password comparison |
| AUTH-U-007 | Đăng nhập thất bại - user không tồn tại | Unit | `login()` - user lookup |
| AUTH-U-008 | Refresh token thành công | Unit | `refreshToken()` - generate new token |
| AUTH-U-009 | Logout thành công | Unit | `logout()` - invalidate session |

#### 1.2 Middleware Tests - auth.js

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| AUTH-U-010 | Verify token hợp lệ | Unit | `verifyToken()` - JWT decode, expiry check |
| AUTH-U-011 | Reject token hết hạn | Unit | `verifyToken()` - expiry validation |
| AUTH-U-012 | Reject token không hợp lệ | Unit | `verifyToken()` - signature validation |
| AUTH-U-013 | Reject request không có token | Unit | `verifyToken()` - missing token handling |
| AUTH-U-014 | Admin authorization check | Unit | `isAdmin()` - role-based access |
| AUTH-U-015 | Restaurant owner authorization | Unit | `isRestaurantOwner()` - owner check |
| AUTH-U-016 | Delivery driver authorization | Unit | `isDriver()` - driver role check |

#### 1.3 Model Tests - User.js

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| AUTH-U-017 | User schema validation | Unit | Schema required fields, types |
| AUTH-U-018 | Password hashing pre-save | Unit | `pre('save')` hook - bcrypt hash |
| AUTH-U-019 | Compare password method | Unit | `comparePassword()` - bcrypt compare |
| AUTH-U-020 | Email uniqueness constraint | Unit | Schema unique index |

**Mock Dependencies:**
- `mongoose` - MongoDB operations
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Token generation/verification

---

### 2. Order Service - Unit Tests (22 tests)

**📁 File:** `order/tests/order.test.js`  
**🎯 Mục đích:** Test logic quản lý đơn hàng

#### 2.1 Controller Tests - orderController.js

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| ORD-U-001 | Tạo đơn hàng thành công | Unit | `createOrder()` - order creation logic |
| ORD-U-002 | Tạo đơn hàng thất bại - giỏ hàng trống | Unit | `createOrder()` - empty cart validation |
| ORD-U-003 | Tạo đơn hàng thất bại - địa chỉ không hợp lệ | Unit | `createOrder()` - address validation |
| ORD-U-004 | Lấy danh sách đơn hàng của user | Unit | `getUserOrders()` - query by userId |
| ORD-U-005 | Lấy chi tiết đơn hàng | Unit | `getOrderById()` - find by ID |
| ORD-U-006 | Cập nhật trạng thái đơn hàng | Unit | `updateOrderStatus()` - status transition |
| ORD-U-007 | Hủy đơn hàng thành công | Unit | `cancelOrder()` - cancel logic |
| ORD-U-008 | Hủy đơn hàng thất bại - đã giao | Unit | `cancelOrder()` - status check |

#### 2.2 Order Status Logic

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| ORD-U-009 | Status transition: pending → confirmed | Unit | State machine - valid transition |
| ORD-U-010 | Status transition: confirmed → preparing | Unit | State machine - kitchen flow |
| ORD-U-011 | Status transition: preparing → ready | Unit | State machine - food ready |
| ORD-U-012 | Status transition: ready → picked_up | Unit | State machine - driver pickup |
| ORD-U-013 | Status transition: picked_up → delivered | Unit | State machine - delivery complete |
| ORD-U-014 | Invalid status transition rejected | Unit | State machine - prevent invalid |
| ORD-U-015 | Cancelled status is final | Unit | State machine - terminal state |

#### 2.3 Price Calculation

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| ORD-U-016 | Tính subtotal chính xác | Unit | `calculateSubtotal()` - item prices sum |
| ORD-U-017 | Tính phí giao hàng | Unit | `calculateDeliveryFee()` - distance-based |
| ORD-U-018 | Áp dụng mã giảm giá | Unit | `applyDiscount()` - coupon logic |
| ORD-U-019 | Tính tổng tiền | Unit | `calculateTotal()` - final amount |
| ORD-U-020 | Tính thuế (nếu có) | Unit | `calculateTax()` - tax rate |
| ORD-U-021 | Làm tròn số tiền | Unit | Price rounding to 2 decimals |
| ORD-U-022 | Validate minimum order amount | Unit | `validateMinimum()` - threshold check |

**Mock Dependencies:**
- `mongoose` - MongoDB operations
- `Restaurant Service` - Menu/pricing data
- `Notification Service` - Order updates

---

### 3. Restaurant Service - Unit Tests (18 tests)

**📁 File:** `restaurant/tests/restaurant.test.js`  
**🎯 Mục đích:** Test logic quản lý nhà hàng và menu

#### 3.1 Restaurant Management

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| RES-U-001 | Tạo nhà hàng mới | Unit | `createRestaurant()` - creation logic |
| RES-U-002 | Lấy danh sách nhà hàng | Unit | `getAllRestaurants()` - pagination |
| RES-U-003 | Tìm kiếm nhà hàng theo tên | Unit | `searchRestaurants()` - text search |
| RES-U-004 | Lọc nhà hàng theo category | Unit | `filterByCategory()` - filter logic |
| RES-U-005 | Lấy nhà hàng gần vị trí | Unit | `getNearbyRestaurants()` - geo query |
| RES-U-006 | Cập nhật thông tin nhà hàng | Unit | `updateRestaurant()` - update fields |
| RES-U-007 | Xóa nhà hàng | Unit | `deleteRestaurant()` - soft delete |

#### 3.2 Menu Management

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| RES-U-008 | Thêm món ăn mới | Unit | `addMenuItem()` - item creation |
| RES-U-009 | Cập nhật thông tin món | Unit | `updateMenuItem()` - item update |
| RES-U-010 | Xóa món ăn | Unit | `deleteMenuItem()` - item removal |
| RES-U-011 | Đánh dấu món hết hàng | Unit | `markOutOfStock()` - availability |
| RES-U-012 | Thay đổi giá món | Unit | `updatePrice()` - price change |
| RES-U-013 | Thêm/xóa category | Unit | `manageCategories()` - categorization |

#### 3.3 Business Hours & Availability

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| RES-U-014 | Cập nhật giờ hoạt động | Unit | `updateBusinessHours()` - schedule |
| RES-U-015 | Kiểm tra nhà hàng đang mở | Unit | `isOpen()` - current time check |
| RES-U-016 | Tạm đóng cửa | Unit | `temporaryClose()` - pause orders |
| RES-U-017 | Mở cửa lại | Unit | `reopen()` - resume orders |
| RES-U-018 | Validate business hours format | Unit | Hours validation (00:00-23:59) |

**Mock Dependencies:**
- `mongoose` - MongoDB operations
- `Firebase Storage` - Image uploads

---

### 4. Payment Service - Unit Tests (15 tests)

**📁 File:** `payment-service/tests/payment.test.js`  
**🎯 Mục đích:** Test logic xử lý thanh toán

#### 4.1 Payment Processing

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| PAY-U-001 | Tạo payment intent | Unit | `createPaymentIntent()` - Stripe intent |
| PAY-U-002 | Xử lý thanh toán thành công | Unit | `processPayment()` - success flow |
| PAY-U-003 | Xử lý thanh toán thất bại | Unit | `processPayment()` - failure handling |
| PAY-U-004 | Hoàn tiền toàn bộ | Unit | `refund()` - full refund |
| PAY-U-005 | Hoàn tiền một phần | Unit | `partialRefund()` - partial amount |
| PAY-U-006 | Validate payment amount | Unit | Amount validation (> 0) |
| PAY-U-007 | Handle duplicate payments | Unit | Idempotency check |

#### 4.2 Payment Methods

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| PAY-U-008 | Thanh toán COD (Cash on Delivery) | Unit | `processCOD()` - cash payment |
| PAY-U-009 | Thanh toán thẻ Credit/Debit | Unit | `processCard()` - card payment |
| PAY-U-010 | Thanh toán ví điện tử | Unit | `processWallet()` - e-wallet |
| PAY-U-011 | Lưu payment method | Unit | `savePaymentMethod()` - tokenization |
| PAY-U-012 | Xóa payment method | Unit | `deletePaymentMethod()` - removal |

#### 4.3 Payment Status

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| PAY-U-013 | Check payment status | Unit | `getPaymentStatus()` - status query |
| PAY-U-014 | Update payment status | Unit | `updateStatus()` - status change |
| PAY-U-015 | Payment webhook handling | Unit | `handleWebhook()` - Stripe events |

**Mock Dependencies:**
- `mongoose` - MongoDB operations
- `Stripe SDK` - Payment gateway
- `Order Service` - Order updates

---

### 5. Notification Service - Unit Tests (12 tests)

**📁 File:** `notification-service/tests/notification.test.js`  
**🎯 Mục đích:** Test logic gửi thông báo

#### 5.1 Push Notifications

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| NOT-U-001 | Gửi push notification | Unit | `sendPush()` - FCM/APNs send |
| NOT-U-002 | Gửi batch notifications | Unit | `sendBatch()` - multiple recipients |
| NOT-U-003 | Xử lý invalid device token | Unit | Token validation & cleanup |
| NOT-U-004 | Retry failed notification | Unit | Retry logic with backoff |

#### 5.2 Email Notifications

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| NOT-U-005 | Gửi email thông báo | Unit | `sendEmail()` - SMTP send |
| NOT-U-006 | Email template rendering | Unit | Template variable substitution |
| NOT-U-007 | Validate email address | Unit | Email format validation |
| NOT-U-008 | Handle email bounce | Unit | Bounce handling logic |

#### 5.3 SMS Notifications

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| NOT-U-009 | Gửi SMS | Unit | `sendSMS()` - Twilio send |
| NOT-U-010 | Validate phone number | Unit | Phone format validation |
| NOT-U-011 | SMS rate limiting | Unit | Rate limit per user |
| NOT-U-012 | Handle SMS failure | Unit | Failure handling & retry |

**Mock Dependencies:**
- `Firebase Cloud Messaging` - Push notifications
- `Nodemailer` - Email sending
- `Twilio SDK` - SMS sending
- `Kafka` - Message queue

---

### 6. Admin Service - Unit Tests (10 tests)

**📁 File:** `admin-service/tests/admin.test.js`  
**🎯 Mục đích:** Test logic quản trị hệ thống

#### 6.1 Settlement Management

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| ADM-U-001 | Tính toán settlement cho nhà hàng | Unit | `calculateSettlement()` - revenue calc |
| ADM-U-002 | Tạo settlement report | Unit | `generateReport()` - report creation |
| ADM-U-003 | Xử lý thanh toán cho nhà hàng | Unit | `processSettlement()` - payout |
| ADM-U-004 | Lấy lịch sử settlement | Unit | `getSettlementHistory()` - history |

#### 6.2 Admin Operations

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| ADM-U-005 | Dashboard statistics | Unit | `getDashboardStats()` - aggregation |
| ADM-U-006 | User management | Unit | `manageUsers()` - user operations |
| ADM-U-007 | Restaurant approval | Unit | `approveRestaurant()` - approval flow |
| ADM-U-008 | Driver verification | Unit | `verifyDriver()` - verification |
| ADM-U-009 | System configuration | Unit | `updateConfig()` - config update |
| ADM-U-010 | Audit logging | Unit | `logAction()` - audit trail |

**Mock Dependencies:**
- `mongoose` - MongoDB operations
- `Order Service` - Order data
- `Bank API` - Fund transfers

---

### 7. Food Delivery Server - Unit Tests (10 tests)

**📁 File:** `food-delivery-server/tests/server.test.js`  
**🎯 Mục đích:** Test logic server chính

#### 7.1 Core Server Functions

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| SRV-U-001 | Health check endpoint | Unit | `/health` - server status |
| SRV-U-002 | Error handling middleware | Unit | Global error handler |
| SRV-U-003 | Request logging | Unit | Morgan/Winston logging |
| SRV-U-004 | Rate limiting | Unit | Rate limit middleware |
| SRV-U-005 | CORS configuration | Unit | CORS headers |
| SRV-U-006 | Request validation | Unit | Input sanitization |
| SRV-U-007 | Response formatting | Unit | Standard response format |
| SRV-U-008 | Compression middleware | Unit | Response compression |
| SRV-U-009 | Helmet security | Unit | Security headers |
| SRV-U-010 | Graceful shutdown | Unit | Shutdown handling |

---

## 🔗 INTEGRATION TESTS

> **Integration Test là gì?**
> - Test **sự tương tác** giữa nhiều thành phần
> - Sử dụng **database thực** (MongoDB Memory Server cho tests)
> - Test **API endpoints** với HTTP requests thực
> - Kiểm tra **data flow** giữa các layers

### Integration Tests Test Cái Gì?

| Thành Phần | Integration Test Kiểm Tra |
|------------|--------------------------|
| **API Routes** | HTTP request → Controller → Service → Database |
| **Database** | CRUD operations, queries, indexes |
| **Service-to-Service** | Internal API calls giữa các services |
| **Middleware Chain** | Request flow qua nhiều middlewares |

---

### 8. API Integration Tests (25 tests)

**📁 Files:** `*/tests/*.integration.test.js`  
**🎯 Mục đích:** Test API endpoints end-to-end trong một service

#### 8.1 Auth API Integration

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| INT-AUTH-001 | POST /api/auth/register | Integration | Full registration flow với DB |
| INT-AUTH-002 | POST /api/auth/login | Integration | Full login flow với JWT generation |
| INT-AUTH-003 | GET /api/auth/profile | Integration | Token verification + profile fetch |
| INT-AUTH-004 | PUT /api/auth/profile | Integration | Profile update với DB persist |
| INT-AUTH-005 | POST /api/auth/forgot-password | Integration | Password reset email flow |

#### 8.2 Order API Integration

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| INT-ORD-001 | POST /api/orders | Integration | Order creation + DB persist |
| INT-ORD-002 | GET /api/orders/:id | Integration | Order fetch + populate relations |
| INT-ORD-003 | PUT /api/orders/:id/status | Integration | Status update + notification trigger |
| INT-ORD-004 | GET /api/orders/user/:userId | Integration | User orders with pagination |
| INT-ORD-005 | DELETE /api/orders/:id | Integration | Order cancellation flow |

#### 8.3 Restaurant API Integration

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| INT-RES-001 | POST /api/restaurants | Integration | Restaurant creation + validation |
| INT-RES-002 | GET /api/restaurants | Integration | List with filters + pagination |
| INT-RES-003 | GET /api/restaurants/:id/menu | Integration | Menu fetch with categories |
| INT-RES-004 | POST /api/restaurants/:id/menu | Integration | Menu item creation |
| INT-RES-005 | GET /api/restaurants/nearby | Integration | Geo query với coordinates |

#### 8.4 Payment API Integration

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| INT-PAY-001 | POST /api/payments/create-intent | Integration | Stripe intent creation |
| INT-PAY-002 | POST /api/payments/confirm | Integration | Payment confirmation flow |
| INT-PAY-003 | POST /api/payments/refund | Integration | Refund processing |
| INT-PAY-004 | GET /api/payments/:orderId | Integration | Payment status query |
| INT-PAY-005 | POST /api/payments/webhook | Integration | Webhook event handling |

#### 8.5 Notification API Integration

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| INT-NOT-001 | POST /api/notifications/send | Integration | Notification dispatch |
| INT-NOT-002 | GET /api/notifications/user/:id | Integration | User notifications list |
| INT-NOT-003 | PUT /api/notifications/:id/read | Integration | Mark as read |
| INT-NOT-004 | DELETE /api/notifications/:id | Integration | Notification deletion |
| INT-NOT-005 | Kafka message consumption | Integration | Event-driven notification |

---

## 🌐 END-TO-END (E2E) TESTS

> **E2E Test là gì?**
> - Test **toàn bộ luồng** từ user đến database và ngược lại
> - Mô phỏng **hành vi thực** của người dùng
> - Test **cross-service** communication
> - Chạy trên **môi trường giống production**

### E2E Tests Test Cái Gì?

| Luồng | E2E Test Kiểm Tra |
|-------|-------------------|
| **User Journey** | Complete flow từ đăng ký đến đặt hàng |
| **Cross-Service** | Auth → Order → Payment → Notification |
| **Error Recovery** | System behavior khi có lỗi |
| **Performance** | Response times dưới tải |

---

### 9. Complete User Journey Tests (8 tests)

**📁 Files:** `tests/e2e/*.e2e.test.js`  
**🎯 Mục đích:** Test complete user flows

#### 9.1 Customer Journey

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| E2E-001 | Đăng ký → Đăng nhập → Đặt hàng → Thanh toán | E2E | Complete customer order flow |
| E2E-002 | Tìm nhà hàng → Xem menu → Thêm giỏ hàng → Checkout | E2E | Shopping flow |
| E2E-003 | Theo dõi đơn hàng real-time | E2E | WebSocket order tracking |
| E2E-004 | Đánh giá nhà hàng sau khi nhận hàng | E2E | Post-delivery review flow |

#### 9.2 Restaurant Owner Journey

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| E2E-005 | Nhận đơn → Chuẩn bị → Báo sẵn sàng | E2E | Restaurant order processing |
| E2E-006 | Quản lý menu → Cập nhật giá → Đánh dấu hết hàng | E2E | Menu management flow |

#### 9.3 Delivery Driver Journey

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| E2E-007 | Nhận assignment → Pickup → Deliver → Complete | E2E | Full delivery cycle |
| E2E-008 | Cập nhật vị trí → Thông báo customer | E2E | Real-time location tracking |

---

## 📊 Test Matrix

### Service Coverage Matrix

| Service | Unit Tests | Integration | E2E | Total | Coverage |
|---------|------------|-------------|-----|-------|----------|
| Auth | 20 | 5 | 2 | 27 | 85% |
| Order | 22 | 5 | 3 | 30 | 82% |
| Restaurant | 18 | 5 | 2 | 25 | 78% |
| Payment | 15 | 5 | 1 | 21 | 75% |
| Notification | 12 | 5 | 0 | 17 | 70% |
| Admin | 10 | 0 | 0 | 10 | 65% |
| Server | 10 | 0 | 0 | 10 | 60% |
| **TOTAL** | **107** | **25** | **8** | **140** | **78%** |

### Test Type Distribution

```
Unit Tests:      ████████████████████████████████████████  107 (76%)
Integration:     ██████████                                 25 (18%)
E2E Tests:       ███                                         8 (6%)
─────────────────────────────────────────────────────────────────
Total:                                                      140 (100%)
```

### Test Execution Time

| Loại Test | Số Lượng | Thời Gian Trung Bình | Tổng Thời Gian |
|-----------|----------|---------------------|----------------|
| Unit Tests | 107 | 50ms | ~5s |
| Integration | 25 | 200ms | ~5s |
| E2E Tests | 8 | 2s | ~16s |
| Performance | 4 | 5min | ~15min |
| **TOTAL** | 144 | - | **~20min** |

---

## ⚡ PERFORMANCE TESTS

> **Performance Test là gì?**
> - Test **hiệu năng** của hệ thống dưới các điều kiện tải khác nhau
> - Đo lường **response time**, **throughput**, **error rate**
> - Xác định **bottleneck** và **giới hạn** của hệ thống
> - Tool: **Artillery.io**

### Performance Tests Test Cái Gì?

| Loại Test | Kiểm Tra | Thời Gian |
|-----------|----------|-----------|
| **Load Test** | Hiệu năng dưới tải bình thường | ~5 phút |
| **Stress Test** | Điểm giới hạn của hệ thống | ~4 phút |
| **Spike Test** | Phản ứng với tải đột biến | ~6 phút |
| **Soak Test** | Ổn định dài hạn, memory leak | ~30 phút |

---

### 10. Performance Test Cases (4 tests)

**📁 Files:** `tests/performance/*.yml`

#### 10.1 Load Test

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| PERF-001 | Auth endpoints under load | Performance | Login/Register với 30 req/s |
| PERF-002 | Restaurant browsing load | Performance | GET restaurants với 50 req/s |
| PERF-003 | Order creation load | Performance | POST orders với 20 req/s |
| PERF-004 | Health check response | Performance | Health endpoints < 100ms |

**Targets:**
- Response Time (p95): < 500ms
- Error Rate: < 1%
- Throughput: > 100 req/s

#### 10.2 Stress Test

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| STRESS-001 | Auth under extreme load | Stress | Login với 200 req/s |
| STRESS-002 | API breaking point | Stress | Tìm giới hạn với 500 req/s |
| STRESS-003 | Error handling under load | Stress | Error rate tại breaking point |

**Targets:**
- Max Error Rate: < 10% tại breaking point
- System recovery: < 60s

#### 10.3 Spike Test

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| SPIKE-001 | Flash sale simulation | Spike | 10x → 20x → 50x normal load |
| SPIKE-002 | Recovery after spike | Spike | System trở về normal < 60s |
| SPIKE-003 | Database connection pool | Spike | Connection pool không exhaust |

**Targets:**
- Recovery time: < 60s
- No data loss during spike

#### 10.4 Soak Test

| ID | Test Case | Loại | Test Cái Gì |
|----|-----------|------|-------------|
| SOAK-001 | Memory stability | Soak | No memory leak sau 30 phút |
| SOAK-002 | Connection stability | Soak | DB connections ổn định |
| SOAK-003 | Response time consistency | Soak | p99 không tăng theo thời gian |

**Targets:**
- Memory increase: < 10% sau 30 phút
- Response time drift: < 20%

---

### Chạy Performance Tests

```bash
cd tests

# Load Test
npm run perf:load

# Stress Test  
npm run perf:stress

# Spike Test
npm run perf:spike

# Soak Test (30 phút)
npm run perf:soak

# Quick Test
npm run perf:quick

# Generate HTML Report
npm run perf:report
```

---

## 🔧 Cách Chạy Tests

### Chạy Unit Tests

```bash
# Chạy tất cả unit tests
npm test

# Chạy unit tests cho một service
cd auth && npm test
cd order && npm test
cd restaurant && npm test

# Chạy với coverage
npm test -- --coverage
```

### Chạy Integration Tests

```bash
# Chạy integration tests
npm run test:integration

# Chạy với database thực
MONGODB_URI=mongodb://localhost:27017/test npm run test:integration
```

### Chạy E2E Tests

```bash
# Start services trước
docker-compose up -d

# Chạy E2E tests
npm run test:e2e
```

---

## 📝 Test File Structure

```
cnpm_cicd/
├── auth/
│   └── tests/
│       ├── auth.test.js           # Unit tests
│       └── auth.integration.test.js  # Integration tests
├── order/
│   └── tests/
│       ├── order.test.js          # Unit tests
│       └── order.integration.test.js
├── restaurant/
│   └── tests/
│       ├── restaurant.test.js     # Unit tests
│       └── restaurant.integration.test.js
├── payment-service/
│   └── tests/
│       ├── payment.test.js        # Unit tests
│       └── payment.integration.test.js
├── notification-service/
│   └── tests/
│       ├── notification.test.js   # Unit tests
│       └── notification.integration.test.js
├── admin-service/
│   └── tests/
│       └── admin.test.js          # Unit tests
├── food-delivery-server/
│   └── tests/
│       └── server.test.js         # Unit tests
└── tests/
    ├── e2e/
    │   ├── customer.e2e.test.js   # E2E tests
    │   ├── restaurant.e2e.test.js
    │   └── delivery.e2e.test.js
    └── performance/               # Performance tests
        ├── load-test.yml
        ├── stress-test.yml
        ├── spike-test.yml
        ├── soak-test.yml
        ├── helpers/
        │   └── functions.js
        └── README.md
```

---

## 📚 Tham Khảo

- [TEST_PLAN.md](./TEST_PLAN.md) - Kế hoạch testing tổng thể
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Chiến lược testing
- [TEST_EXECUTION_REPORT.md](./TEST_EXECUTION_REPORT.md) - Báo cáo thực thi
- [API Documentation](./api/README.md) - Tài liệu API
- [Performance Testing Guide](../tests/performance/README.md) - Hướng dẫn Performance Testing

---

**Người tạo:** FastFood Delivery Team  
**Ngày tạo:** Tháng 12, 2025  
**Phiên bản:** 2.1
