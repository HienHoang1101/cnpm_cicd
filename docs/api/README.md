# 🍔 FastFood Delivery API Documentation

Interactive API documentation for all FastFood Delivery microservices.

## 📖 Quick Links

- **Swagger UI**: Open `index.html` in a browser
- **OpenAPI Spec**: `openapi.yaml`
- **Postman Collection**: Import `openapi.yaml` into Postman

## 🚀 How to View Documentation

### Option 1: Local HTTP Server

```bash
# Using Python
cd docs/api
python -m http.server 8080

# Using Node.js (http-server)
npx http-server docs/api -p 8080

# Using PHP
php -S localhost:8080 -t docs/api
```

Then open http://localhost:8080 in your browser.

### Option 2: VS Code Extension

Install the "Swagger Viewer" or "OpenAPI (Swagger) Editor" extension in VS Code and open `openapi.yaml`.

### Option 3: Online Swagger Editor

1. Go to https://editor.swagger.io/
2. File → Import File → Select `openapi.yaml`

## 📋 API Services Overview

| Service | Port | Base Path | Description |
|---------|------|-----------|-------------|
| Auth | 5001 | `/api/auth`, `/api/users` | Authentication & User Management |
| Order | 5002 | `/api/orders`, `/api/cart` | Order & Cart Management |
| Restaurant | 5003 | `/api/restaurants`, `/api/dishes` | Restaurant & Menu Management |
| Delivery | 5004 | `/api/delivery` | Delivery Driver Operations |
| Payment | 5005 | `/api/payments` | Payment Processing |
| Notification | 5006 | `/api/notifications` | Push, Email, SMS Notifications |
| Admin | 5008 | `/api/admin` | Admin Dashboard & Settlements |

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Returns `accessToken` and `refreshToken`
3. **Refresh**: `POST /api/auth/refresh-token` → Get new access token

### Example Login Request

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## 📱 Main API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new account
- `POST /login` - Login and get tokens
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Invalidate session
- `GET /me` - Get current user profile
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password

### Users (`/api/users`)
- `GET /me` - Get profile
- `PUT /me` - Update profile
- `PUT /me/password` - Change password
- `GET /me/addresses` - List addresses
- `POST /me/addresses` - Add address
- `PUT /me/addresses/:id` - Update address
- `DELETE /me/addresses/:id` - Delete address

### Orders (`/api/orders`)
- `GET /` - List user orders
- `POST /` - Create new order
- `GET /:id` - Get order details
- `PATCH /:id/status` - Update order status
- `PATCH /:id/cancel` - Cancel order
- `GET /:id/tracking` - Real-time tracking

### Cart (`/api/cart`)
- `GET /` - Get cart items
- `POST /items` - Add item
- `PUT /items/:id` - Update quantity
- `DELETE /items/:id` - Remove item
- `DELETE /` - Clear cart

### Restaurants (`/api/restaurants`)
- `GET /` - List restaurants
- `GET /search` - Search restaurants
- `GET /nearby` - Find nearby restaurants
- `GET /:id` - Restaurant details
- `GET /:id/dishes` - Restaurant menu

### Payments (`/api/payments`)
- `POST /initiate` - Start payment (card, MoMo, ZaloPay)
- `POST /initiate-cod` - Cash on Delivery
- `POST /webhook` - Payment provider callback

### Notifications (`/api/notifications`)
- `GET /` - List notifications
- `PATCH /:id/read` - Mark as read
- `PATCH /read-all` - Mark all as read

## 🔄 WebSocket Events

### Order Tracking (Socket.io)
```javascript
// Connect to order tracking
const socket = io('http://localhost:5002');

// Join order room
socket.emit('joinOrder', { orderId: 'order_id' });

// Listen for updates
socket.on('orderUpdate', (data) => {
  console.log('Order status:', data.status);
  console.log('Driver location:', data.driverLocation);
});

// Driver location updates
socket.on('driverLocation', (data) => {
  console.log('Driver position:', data.lat, data.lng);
});
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": { ... }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

## 🛠 Development

### Environment Variables

Each service requires environment variables. See individual service `.env.example` files.

Common variables:
```env
PORT=500X
MONGODB_URI=mongodb://localhost:27017/fastfood
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://localhost:6379
```

### Running Services Locally

```bash
# Start all services with Docker
docker-compose up -d

# Or run individual services
cd auth && npm install && npm run dev
cd order && npm install && npm run dev
# ... etc
```

## 📝 API Versioning

Current API version: **v1** (implicit in paths)

Future versions will use explicit versioning:
- `/api/v1/auth/...`
- `/api/v2/auth/...`

## 🔗 Related Documentation

- [Project README](../../README.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Monitoring Setup](../MONITORING.md)

## 📧 Support

For API issues, please open a GitHub issue or contact the development team.

---

**Generated**: $(date)  
**OpenAPI Version**: 3.0.3  
**Total Endpoints**: 50+
