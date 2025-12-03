# 📝 Test Cases Document - FastFood Delivery Platform

## 📌 Thông Tin Chung

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Dự án** | FastFood Delivery Platform |
| **Phiên bản** | 1.0.0 |
| **Tổng số Test Cases** | 150+ |
| **Ngày cập nhật** | 03/12/2024 |

---

## 📋 Mục Lục

1. [Auth Service Test Cases](#1-auth-service-test-cases)
2. [Order Service Test Cases](#2-order-service-test-cases)
3. [Restaurant Service Test Cases](#3-restaurant-service-test-cases)
4. [Payment Service Test Cases](#4-payment-service-test-cases)
5. [Notification Service Test Cases](#5-notification-service-test-cases)
6. [Admin Service Test Cases](#6-admin-service-test-cases)
7. [Delivery Service Test Cases](#7-delivery-service-test-cases)
8. [Integration Test Cases](#8-integration-test-cases)
9. [E2E Test Cases](#9-e2e-test-cases)

---

## 1. Auth Service Test Cases

### 1.1 User Registration (Đăng Ký)

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| AUTH-REG-001 | Đăng ký thành công với thông tin hợp lệ | Không có user với email này | 1. POST /api/auth/register<br>2. Body: {name, email, password, phone} | Status 201, trả về user info và tokens | High |
| AUTH-REG-002 | Đăng ký thất bại - Email đã tồn tại | User với email đã tồn tại | 1. POST /api/auth/register<br>2. Body với email đã tồn tại | Status 400, message "Email already exists" | High |
| AUTH-REG-003 | Đăng ký thất bại - Email không hợp lệ | N/A | 1. POST /api/auth/register<br>2. Email: "invalid-email" | Status 400, validation error | Medium |
| AUTH-REG-004 | Đăng ký thất bại - Password quá ngắn | N/A | 1. POST /api/auth/register<br>2. Password: "123" | Status 400, "Password must be at least 6 characters" | Medium |
| AUTH-REG-005 | Đăng ký thất bại - Thiếu required fields | N/A | 1. POST /api/auth/register<br>2. Body thiếu email | Status 400, validation error | High |
| AUTH-REG-006 | Đăng ký với role restaurant owner | N/A | 1. POST /api/auth/register<br>2. role: "restaurant_owner" | Status 201, user có role đúng | Medium |
| AUTH-REG-007 | Đăng ký với role driver | N/A | 1. POST /api/auth/register<br>2. role: "driver" | Status 201, user có role đúng | Medium |

### 1.2 User Login (Đăng Nhập)

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| AUTH-LOG-001 | Đăng nhập thành công | User đã đăng ký | 1. POST /api/auth/login<br>2. Body: {email, password} | Status 200, trả về accessToken và refreshToken | High |
| AUTH-LOG-002 | Đăng nhập thất bại - Sai password | User đã đăng ký | 1. POST /api/auth/login<br>2. Password sai | Status 401, "Invalid credentials" | High |
| AUTH-LOG-003 | Đăng nhập thất bại - Email không tồn tại | N/A | 1. POST /api/auth/login<br>2. Email không tồn tại | Status 401, "User not found" | High |
| AUTH-LOG-004 | Đăng nhập thất bại - Account bị banned | User bị banned | 1. POST /api/auth/login | Status 403, "Account is banned" | Medium |
| AUTH-LOG-005 | Đăng nhập và set cookie | User đã đăng ký | 1. POST /api/auth/login | Cookies được set đúng | Medium |

### 1.3 Token Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| AUTH-TOK-001 | Refresh token thành công | Có valid refresh token | 1. POST /api/auth/refresh<br>2. Cookie: refreshToken | Status 200, new accessToken | High |
| AUTH-TOK-002 | Refresh token thất bại - Token expired | Refresh token hết hạn | 1. POST /api/auth/refresh | Status 401, "Token expired" | High |
| AUTH-TOK-003 | Refresh token thất bại - Token invalid | Invalid refresh token | 1. POST /api/auth/refresh | Status 401, "Invalid token" | High |
| AUTH-TOK-004 | Logout thành công | User đã login | 1. POST /api/auth/logout | Status 200, cookies cleared | Medium |
| AUTH-TOK-005 | Access protected route với valid token | Valid access token | 1. GET /api/users/profile<br>2. Header: Authorization | Status 200, user data | High |
| AUTH-TOK-006 | Access protected route không có token | N/A | 1. GET /api/users/profile<br>2. No token | Status 401, "No token provided" | High |

### 1.4 Password Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| AUTH-PWD-001 | Đổi password thành công | User đã login | 1. PUT /api/auth/change-password<br>2. {oldPassword, newPassword} | Status 200, password changed | Medium |
| AUTH-PWD-002 | Đổi password thất bại - Sai old password | User đã login | 1. PUT /api/auth/change-password<br>2. Old password sai | Status 400, "Incorrect old password" | Medium |
| AUTH-PWD-003 | Forgot password - Gửi email | User đã đăng ký | 1. POST /api/auth/forgot-password<br>2. {email} | Status 200, email sent | Low |
| AUTH-PWD-004 | Reset password với valid token | Có reset token | 1. POST /api/auth/reset-password<br>2. {token, newPassword} | Status 200, password reset | Low |

---

## 2. Order Service Test Cases

### 2.1 Order Creation

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ORD-CRE-001 | Tạo đơn hàng thành công | User logged in, cart có items | 1. POST /api/orders<br>2. Body: {restaurantId, items, address} | Status 201, order created | High |
| ORD-CRE-002 | Tạo đơn hàng thất bại - Cart rỗng | User logged in, cart rỗng | 1. POST /api/orders<br>2. items: [] | Status 400, "Cart is empty" | High |
| ORD-CRE-003 | Tạo đơn hàng thất bại - Restaurant đóng cửa | Restaurant isOpen: false | 1. POST /api/orders | Status 400, "Restaurant is closed" | Medium |
| ORD-CRE-004 | Tạo đơn hàng thất bại - Item không available | Item isAvailable: false | 1. POST /api/orders | Status 400, "Item not available" | Medium |
| ORD-CRE-005 | Tạo đơn hàng với delivery address | User logged in | 1. POST /api/orders<br>2. deliveryAddress provided | Status 201, address saved | High |
| ORD-CRE-006 | Tạo đơn hàng với special instructions | User logged in | 1. POST /api/orders<br>2. specialInstructions: "No onion" | Status 201, instructions saved | Low |
| ORD-CRE-007 | Tính tổng tiền đúng | Items với các giá khác nhau | 1. POST /api/orders<br>2. Multiple items | Total = sum of (price * quantity) | High |

### 2.2 Order Status Updates

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ORD-STA-001 | Cập nhật status: pending → confirmed | Order status = pending | 1. PUT /api/orders/:id/status<br>2. status: "confirmed" | Status 200, status updated | High |
| ORD-STA-002 | Cập nhật status: confirmed → preparing | Order status = confirmed | 1. PUT /api/orders/:id/status<br>2. status: "preparing" | Status 200, status updated | High |
| ORD-STA-003 | Cập nhật status: preparing → ready | Order status = preparing | 1. PUT /api/orders/:id/status | Status 200, status updated | High |
| ORD-STA-004 | Cập nhật status: ready → picked_up | Order status = ready, driver assigned | 1. PUT /api/orders/:id/status | Status 200, status updated | High |
| ORD-STA-005 | Cập nhật status: picked_up → delivered | Order status = picked_up | 1. PUT /api/orders/:id/status | Status 200, status updated | High |
| ORD-STA-006 | Cancel order thành công | Order status = pending | 1. PUT /api/orders/:id/cancel | Status 200, order cancelled | Medium |
| ORD-STA-007 | Cancel order thất bại - Đã preparing | Order status = preparing | 1. PUT /api/orders/:id/cancel | Status 400, "Cannot cancel" | Medium |
| ORD-STA-008 | Invalid status transition | Order status = pending | 1. status: "delivered" (skip states) | Status 400, "Invalid transition" | Medium |

### 2.3 Order Query

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ORD-QRY-001 | Lấy order theo ID | Order exists | 1. GET /api/orders/:id | Status 200, order details | High |
| ORD-QRY-002 | Lấy order không tồn tại | N/A | 1. GET /api/orders/invalid-id | Status 404, "Order not found" | Medium |
| ORD-QRY-003 | Lấy danh sách orders của user | User có orders | 1. GET /api/orders/my-orders | Status 200, list of orders | High |
| ORD-QRY-004 | Lấy orders của restaurant | Restaurant owner | 1. GET /api/orders/restaurant/:id | Status 200, restaurant orders | High |
| ORD-QRY-005 | Filter orders theo status | Orders với nhiều status | 1. GET /api/orders?status=pending | Status 200, filtered orders | Medium |
| ORD-QRY-006 | Pagination orders | Nhiều orders | 1. GET /api/orders?page=1&limit=10 | Status 200, paginated results | Medium |
| ORD-QRY-007 | Sort orders theo date | Nhiều orders | 1. GET /api/orders?sort=-createdAt | Status 200, sorted by date desc | Low |

---

## 3. Restaurant Service Test Cases

### 3.1 Restaurant Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| RES-MGT-001 | Tạo restaurant mới | User role = restaurant_owner | 1. POST /api/restaurants<br>2. {name, cuisine, address} | Status 201, restaurant created | High |
| RES-MGT-002 | Cập nhật restaurant info | Owner của restaurant | 1. PUT /api/restaurants/:id<br>2. Updated data | Status 200, info updated | High |
| RES-MGT-003 | Toggle restaurant open/close | Owner của restaurant | 1. PUT /api/restaurants/:id/toggle | Status 200, isOpen toggled | High |
| RES-MGT-004 | Upload restaurant image | Owner của restaurant | 1. POST /api/restaurants/:id/image<br>2. File upload | Status 200, image URL returned | Medium |
| RES-MGT-005 | Delete restaurant | Owner của restaurant | 1. DELETE /api/restaurants/:id | Status 200, restaurant deleted | Low |
| RES-MGT-006 | Unauthorized update | Not owner | 1. PUT /api/restaurants/:id | Status 403, "Forbidden" | High |

### 3.2 Menu Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| RES-MNU-001 | Thêm menu item | Owner của restaurant | 1. POST /api/restaurants/:id/menu<br>2. {name, price, category} | Status 201, item added | High |
| RES-MNU-002 | Cập nhật menu item | Menu item exists | 1. PUT /api/menu/:itemId<br>2. Updated data | Status 200, item updated | High |
| RES-MNU-003 | Toggle item availability | Menu item exists | 1. PUT /api/menu/:itemId/toggle | Status 200, availability toggled | High |
| RES-MNU-004 | Delete menu item | Menu item exists | 1. DELETE /api/menu/:itemId | Status 200, item deleted | Medium |
| RES-MNU-005 | Thêm item với giá âm | Owner của restaurant | 1. POST /api/restaurants/:id/menu<br>2. price: -10 | Status 400, "Price must be positive" | Medium |
| RES-MNU-006 | Lấy menu của restaurant | Restaurant exists | 1. GET /api/restaurants/:id/menu | Status 200, menu items | High |

### 3.3 Restaurant Search

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| RES-SRC-001 | Tìm kiếm theo tên | Restaurants exist | 1. GET /api/restaurants?search=pho | Status 200, matching restaurants | High |
| RES-SRC-002 | Filter theo cuisine | Restaurants exist | 1. GET /api/restaurants?cuisine=vietnamese | Status 200, filtered results | Medium |
| RES-SRC-003 | Filter theo rating | Restaurants exist | 1. GET /api/restaurants?minRating=4 | Status 200, high-rated restaurants | Medium |
| RES-SRC-004 | Lấy restaurants gần vị trí | Location provided | 1. GET /api/restaurants?lat=x&lng=y&radius=5 | Status 200, nearby restaurants | Medium |
| RES-SRC-005 | Sort theo rating | Restaurants exist | 1. GET /api/restaurants?sort=-rating | Status 200, sorted by rating | Low |

---

## 4. Payment Service Test Cases

### 4.1 Payment Processing

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| PAY-PRO-001 | Tạo payment intent thành công | Order exists, valid amount | 1. POST /api/payments/create-intent<br>2. {orderId, amount} | Status 200, client_secret returned | High |
| PAY-PRO-002 | Confirm payment thành công | Valid payment intent | 1. POST /api/payments/confirm<br>2. {paymentIntentId} | Status 200, payment completed | High |
| PAY-PRO-003 | Payment thất bại - Card declined | Invalid card | 1. Stripe returns declined | Status 400, "Card declined" | High |
| PAY-PRO-004 | Payment thất bại - Insufficient funds | Card với insufficient funds | 1. Stripe returns error | Status 400, "Insufficient funds" | Medium |
| PAY-PRO-005 | Xử lý Stripe webhook | Webhook event | 1. POST /api/payments/webhook<br>2. Stripe signature | Status 200, event processed | High |

### 4.2 Refund Processing

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| PAY-REF-001 | Refund toàn bộ thành công | Payment completed | 1. POST /api/payments/:id/refund<br>2. Full amount | Status 200, refund processed | Medium |
| PAY-REF-002 | Refund một phần | Payment completed | 1. POST /api/payments/:id/refund<br>2. Partial amount | Status 200, partial refund | Medium |
| PAY-REF-003 | Refund thất bại - Đã refund | Payment already refunded | 1. POST /api/payments/:id/refund | Status 400, "Already refunded" | Medium |
| PAY-REF-004 | Refund thất bại - Amount quá lớn | Amount > original | 1. POST /api/payments/:id/refund<br>2. amount > original | Status 400, "Amount too large" | Medium |

### 4.3 Payment History

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| PAY-HIS-001 | Lấy payment history của user | User có payments | 1. GET /api/payments/history | Status 200, payment list | Medium |
| PAY-HIS-002 | Lấy payment detail | Payment exists | 1. GET /api/payments/:id | Status 200, payment details | Medium |
| PAY-HIS-003 | Filter payments theo status | Payments với status khác nhau | 1. GET /api/payments?status=completed | Status 200, filtered payments | Low |

---

## 5. Notification Service Test Cases

### 5.1 Email Notifications

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| NOT-EML-001 | Gửi order confirmation email | Order created | 1. Kafka event: ORDER_CREATED<br>2. Email sent | Email delivered successfully | Medium |
| NOT-EML-002 | Gửi order status update email | Order status changed | 1. Kafka event: ORDER_STATUS_CHANGED | Email delivered | Medium |
| NOT-EML-003 | Gửi email thất bại - Invalid email | Invalid email format | 1. Send to invalid email | Error logged, retry queued | Low |
| NOT-EML-004 | Email retry mechanism | First attempt failed | 1. Send fails<br>2. Retry 3 times | Retry attempts made | Low |

### 5.2 SMS Notifications

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| NOT-SMS-001 | Gửi SMS order ready | Order status = ready | 1. Trigger SMS notification | SMS sent via Twilio | Medium |
| NOT-SMS-002 | Gửi SMS delivery update | Driver picked up | 1. Trigger SMS | SMS sent | Medium |
| NOT-SMS-003 | SMS thất bại - Invalid phone | Invalid phone number | 1. Send to invalid phone | Error logged | Low |

### 5.3 Push Notifications

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| NOT-PSH-001 | Gửi push notification | User có FCM token | 1. Send push via Firebase | Push delivered | Medium |
| NOT-PSH-002 | Push to multiple devices | User có nhiều devices | 1. Send to all devices | All devices receive | Low |

---

## 6. Admin Service Test Cases

### 6.1 Settlement Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ADM-SET-001 | Tạo settlement cho restaurant | Orders completed | 1. POST /api/admin/settlements<br>2. {restaurantId, period} | Status 201, settlement created | High |
| ADM-SET-002 | Process settlement | Settlement pending | 1. POST /api/admin/settlements/:id/process | Status 200, settlement processed | High |
| ADM-SET-003 | Lấy settlement history | Settlements exist | 1. GET /api/admin/settlements | Status 200, settlement list | Medium |
| ADM-SET-004 | Calculate commission đúng | Orders với amounts | 1. Create settlement | Commission = 15% of total | High |

### 6.2 User Management

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ADM-USR-001 | Lấy danh sách users | Admin role | 1. GET /api/admin/users | Status 200, user list | Medium |
| ADM-USR-002 | Ban user | Admin role | 1. PUT /api/admin/users/:id/ban | Status 200, user banned | Medium |
| ADM-USR-003 | Unban user | User is banned | 1. PUT /api/admin/users/:id/unban | Status 200, user unbanned | Medium |
| ADM-USR-004 | Filter users theo role | Users với roles khác nhau | 1. GET /api/admin/users?role=driver | Status 200, filtered users | Low |

### 6.3 Restaurant Approval

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ADM-RES-001 | Approve restaurant | Restaurant pending | 1. PUT /api/admin/restaurants/:id/approve | Status 200, approved | Medium |
| ADM-RES-002 | Reject restaurant | Restaurant pending | 1. PUT /api/admin/restaurants/:id/reject<br>2. {reason} | Status 200, rejected | Medium |
| ADM-RES-003 | Suspend restaurant | Restaurant active | 1. PUT /api/admin/restaurants/:id/suspend | Status 200, suspended | Medium |

### 6.4 Analytics

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| ADM-ANA-001 | Lấy daily revenue | Orders completed | 1. GET /api/admin/analytics/revenue?date=today | Status 200, revenue data | Medium |
| ADM-ANA-002 | Lấy order statistics | Orders exist | 1. GET /api/admin/analytics/orders | Status 200, order stats | Medium |
| ADM-ANA-003 | Lấy user growth | Users registered | 1. GET /api/admin/analytics/users | Status 200, user growth data | Low |

---

## 7. Delivery Service Test Cases

### 7.1 Delivery Assignment

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| DEL-ASN-001 | Auto-assign nearest driver | Drivers available | 1. Order ready for pickup<br>2. System assigns driver | Nearest driver assigned | High |
| DEL-ASN-002 | Manual assign driver | Admin/restaurant | 1. PUT /api/deliveries/:id/assign<br>2. {driverId} | Driver assigned | Medium |
| DEL-ASN-003 | No driver available | No available drivers | 1. Order ready | Status: waiting_for_driver | Medium |
| DEL-ASN-004 | Driver reject assignment | Driver assigned | 1. PUT /api/deliveries/:id/reject | Reassign to next driver | Medium |

### 7.2 Delivery Tracking

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| DEL-TRK-001 | Update driver location | Driver on delivery | 1. POST /api/deliveries/:id/location<br>2. {lat, lng} | Location updated | High |
| DEL-TRK-002 | Get real-time location | Delivery in progress | 1. WebSocket: subscribe to delivery | Location updates received | High |
| DEL-TRK-003 | Calculate ETA | Delivery in progress | 1. GET /api/deliveries/:id/eta | ETA calculated | Medium |
| DEL-TRK-004 | Location history | Delivery completed | 1. GET /api/deliveries/:id/history | Location history returned | Low |

### 7.3 Delivery Status

| TC ID | Test Case Name | Preconditions | Test Steps | Expected Result | Priority |
|-------|---------------|---------------|------------|-----------------|----------|
| DEL-STA-001 | Driver picks up order | Driver at restaurant | 1. PUT /api/deliveries/:id/pickup | Status: picked_up | High |
| DEL-STA-002 | Driver delivers order | Driver at customer | 1. PUT /api/deliveries/:id/deliver | Status: delivered | High |
| DEL-STA-003 | Delivery failed | Cannot deliver | 1. PUT /api/deliveries/:id/failed<br>2. {reason} | Status: failed, reason logged | Medium |

---

## 8. Integration Test Cases

### 8.1 Order Flow Integration

| TC ID | Test Case Name | Services Involved | Test Steps | Expected Result | Priority |
|-------|---------------|-------------------|------------|-----------------|----------|
| INT-ORD-001 | Complete order flow | Auth, Order, Payment, Notification | 1. Login<br>2. Create order<br>3. Pay<br>4. Receive notification | All steps complete | High |
| INT-ORD-002 | Order + Restaurant | Order, Restaurant | 1. Create order<br>2. Restaurant receives<br>3. Updates status | Status synced | High |
| INT-ORD-003 | Order + Delivery | Order, Delivery | 1. Order ready<br>2. Driver assigned<br>3. Delivery tracking | Tracking works | High |

### 8.2 Payment Integration

| TC ID | Test Case Name | Services Involved | Test Steps | Expected Result | Priority |
|-------|---------------|-------------------|------------|-----------------|----------|
| INT-PAY-001 | Payment → Order status | Payment, Order | 1. Payment success<br>2. Order confirmed | Order status updated | High |
| INT-PAY-002 | Payment → Notification | Payment, Notification | 1. Payment success<br>2. Email sent | Notification sent | Medium |
| INT-PAY-003 | Refund → Order cancel | Payment, Order | 1. Cancel order<br>2. Refund processed | Both updated | Medium |

### 8.3 Authentication Integration

| TC ID | Test Case Name | Services Involved | Test Steps | Expected Result | Priority |
|-------|---------------|-------------------|------------|-----------------|----------|
| INT-AUT-001 | Auth across services | Auth, Order, Restaurant | 1. Login<br>2. Access Order API<br>3. Access Restaurant API | All authorized | High |
| INT-AUT-002 | Token refresh | Auth, any service | 1. Token expires<br>2. Refresh<br>3. Continue | Seamless refresh | High |

---

## 9. E2E Test Cases

### 9.1 Customer Journey

| TC ID | Test Case Name | Description | Expected Result | Priority |
|-------|---------------|-------------|-----------------|----------|
| E2E-CUS-001 | Complete order journey | Register → Browse → Order → Pay → Track → Receive | Order delivered | High |
| E2E-CUS-002 | Reorder previous order | Login → View history → Reorder | New order created | Medium |
| E2E-CUS-003 | Cancel order | Create order → Cancel before preparing | Order cancelled, refund if paid | Medium |

### 9.2 Restaurant Owner Journey

| TC ID | Test Case Name | Description | Expected Result | Priority |
|-------|---------------|-------------|-----------------|----------|
| E2E-RES-001 | Restaurant onboarding | Register → Create restaurant → Add menu → Go live | Restaurant active | High |
| E2E-RES-002 | Order management | Receive order → Prepare → Mark ready | Order ready for pickup | High |
| E2E-RES-003 | Menu management | Add items → Update prices → Toggle availability | Menu updated | Medium |

### 9.3 Driver Journey

| TC ID | Test Case Name | Description | Expected Result | Priority |
|-------|---------------|-------------|-----------------|----------|
| E2E-DRV-001 | Delivery completion | Accept order → Navigate → Pickup → Deliver | Delivery completed | High |
| E2E-DRV-002 | Multiple deliveries | Accept → Deliver → Accept next | Continuous deliveries | Medium |

### 9.4 Admin Journey

| TC ID | Test Case Name | Description | Expected Result | Priority |
|-------|---------------|-------------|-----------------|----------|
| E2E-ADM-001 | Restaurant approval | Review → Approve/Reject → Notify | Restaurant status updated | Medium |
| E2E-ADM-002 | Settlement process | Calculate → Review → Process → Transfer | Settlement completed | Medium |

---

## 📊 Test Case Statistics

| Category | Total | High Priority | Medium Priority | Low Priority |
|----------|-------|---------------|-----------------|--------------|
| Auth Service | 20 | 12 | 6 | 2 |
| Order Service | 25 | 15 | 8 | 2 |
| Restaurant Service | 18 | 10 | 6 | 2 |
| Payment Service | 15 | 8 | 5 | 2 |
| Notification Service | 12 | 4 | 6 | 2 |
| Admin Service | 15 | 5 | 8 | 2 |
| Delivery Service | 15 | 8 | 5 | 2 |
| Integration | 10 | 8 | 2 | 0 |
| E2E | 10 | 6 | 4 | 0 |
| **TOTAL** | **140** | **76** | **50** | **14** |

---

## 📝 Test Case Template

```markdown
| TC ID | [SERVICE]-[CATEGORY]-[NUMBER] |
|-------|-------------------------------|
| **Test Case Name** | [Tên test case] |
| **Priority** | High / Medium / Low |
| **Type** | Unit / Integration / E2E |
| **Preconditions** | [Điều kiện tiên quyết] |
| **Test Data** | [Dữ liệu test] |
| **Test Steps** | 1. Step 1<br>2. Step 2<br>3. Step 3 |
| **Expected Result** | [Kết quả mong đợi] |
| **Actual Result** | [Kết quả thực tế - điền khi test] |
| **Status** | Pass / Fail / Blocked / Not Run |
| **Notes** | [Ghi chú thêm] |
```

---

## 🔗 Tài Liệu Liên Quan

- [Test Plan](./TEST_PLAN.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Test Execution Report](./TEST_EXECUTION_REPORT.md)
- [API Documentation](./api/README.md)
- [OpenAPI Specification](./api/openapi.yaml)

---

*Tài liệu này được cập nhật lần cuối: 03/12/2024*
