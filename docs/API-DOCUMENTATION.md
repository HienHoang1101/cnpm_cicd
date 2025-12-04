# 📚 FastFood Delivery - API Documentation

## Overview

FastFood Delivery là một hệ thống đặt đồ ăn sử dụng kiến trúc Microservices với 7 services chính.

## 🌐 API Documentation URLs

Mỗi service có Swagger UI riêng:

| Service | Port | Swagger URL |
|---------|------|-------------|
| **Auth Service** | 5001 | http://localhost:5001/api-docs |
| **Order Service** | 5002 | http://localhost:5002/api-docs |
| **Restaurant Service** | 5003 | http://localhost:5003/api-docs |
| **Delivery Service** | 5004 | http://localhost:5004/api-docs |
| **Payment Service** | 5005 | http://localhost:5005/api-docs |
| **Notification Service** | 5006 | http://localhost:5006/api-docs |
| **Admin Service** | 5008 | http://localhost:5008/api-docs |

## 🔐 Authentication

### JWT Token Flow
```
1. POST /api/auth/login → Nhận access token + refresh token
2. Thêm header: Authorization: Bearer <access_token>
3. Khi token hết hạn: POST /api/auth/refresh-token
```

### Token Format
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

## 👤 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `customer` | Khách hàng đặt đồ ăn | Đặt hàng, xem menu, theo dõi đơn |
| `restaurant` | Chủ/quản lý nhà hàng | Quản lý menu, xác nhận đơn |
| `delivery` | Người giao hàng | Nhận đơn, cập nhật vị trí |
| `admin` | Quản trị viên hệ thống | Full access |

## 📦 API Services

### 1. Auth Service (Port 5001)

**Endpoints chính:**
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Thông tin user hiện tại
- `GET /api/users` - Danh sách users (Admin)
- `POST /api/users/me/addresses` - Thêm địa chỉ

### 2. Order Service (Port 5002)

**Endpoints chính:**
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Danh sách đơn hàng của user
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái
- `GET /api/orders/:id/tracking` - Theo dõi đơn hàng
- `POST /api/cart` - Thêm vào giỏ hàng

**WebSocket:**
```javascript
// Real-time order tracking
const ws = new WebSocket('ws://localhost:5002/ws/orders/ORDER_ID');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Order update:', update);
};
```

### 3. Restaurant Service (Port 5003)

**Endpoints chính:**
- `GET /api/restaurants` - Danh sách nhà hàng
- `GET /api/restaurants/:id` - Chi tiết nhà hàng
- `GET /api/restaurants/:id/menu` - Menu nhà hàng
- `POST /api/restaurants/:id/menu` - Thêm món (Owner)
- `POST /api/restaurants/:id/reviews` - Đánh giá

### 4. Payment Service (Port 5005)

**Endpoints chính:**
- `POST /api/payment` - Tạo thanh toán
- `GET /api/payment/:id` - Chi tiết thanh toán
- `POST /api/payment/:id/refund` - Hoàn tiền
- `POST /api/payment/webhook` - Webhook từ payment gateway

**Payment Methods:**
- `cash` - Tiền mặt
- `card` - Thẻ tín dụng/ghi nợ
- `momo` - Ví MoMo
- `zalopay` - ZaloPay
- `vnpay` - VNPay

### 5. Notification Service (Port 5006)

**Endpoints chính:**
- `GET /api/notifications` - Danh sách thông báo
- `POST /api/notifications/send` - Gửi thông báo
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc
- `POST /api/notifications/fcm-token` - Đăng ký FCM token

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🔄 Order Status Flow

```
pending → confirmed → preparing → ready → picked_up → on_the_way → delivered
    ↓
cancelled
```

| Status | Description |
|--------|-------------|
| `pending` | Đơn hàng mới tạo |
| `confirmed` | Nhà hàng xác nhận |
| `preparing` | Đang chuẩn bị |
| `ready` | Sẵn sàng giao |
| `picked_up` | Shipper đã lấy |
| `on_the_way` | Đang giao |
| `delivered` | Đã giao |
| `cancelled` | Đã hủy |

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Order
```bash
curl -X POST http://localhost:5002/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId": "...",
    "items": [{"menuItemId": "...", "quantity": 2}],
    "deliveryAddress": {...},
    "paymentMethod": "cash"
  }'
```

### Get Restaurants
```bash
curl http://localhost:5003/api/restaurants?page=1&limit=10
```

## 📝 Postman Collection

Import Postman collection từ:
```
/docs/postman/FastFood-Delivery.postman_collection.json
```

## 🔗 Related Documentation

- [Monitoring Dashboard](http://localhost:3001) - Grafana
- [API Metrics](http://localhost:9090) - Prometheus
- [Log Analysis](http://localhost:5601) - Kibana

## 📞 Support

- Email: api@fastfood.com
- GitHub Issues: https://github.com/HienHoang1101/cnpm_cicd/issues
