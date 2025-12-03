# 🔍 Logs Monitoring Guide - Chi Tiết

## 📋 Tổng Quan

Hệ thống logs monitoring sử dụng stack:
- **Promtail**: Thu thập logs từ containers
- **Loki**: Lưu trữ và query logs
- **Grafana**: Visualization và dashboard

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Containers                        │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Auth      │   Order     │  Restaurant │   Payment        │
│   Service   │   Service   │   Service   │   Service        │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                      Log Files                              │
│              /var/log/containers/*.log                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Promtail        │
                    │  (Log Collector)    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Loki          │
                    │   (Log Storage)     │
                    │   Port: 3100        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Grafana        │
                    │  (Visualization)    │
                    │    Port: 3001       │
                    └─────────────────────┘
```

## 🔧 Cấu Hình Logger

### Winston Logger (shared/logger.js)

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: process.env.SERVICE_NAME || 'unknown'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export default logger;
```

### Sử Dụng Trong Services

```javascript
import logger from '../shared/logger.js';

// Info level
logger.info('User logged in', { 
  userId: user._id, 
  email: user.email 
});

// Error level
logger.error('Login failed', { 
  email: email,
  reason: 'Invalid password',
  ip: req.ip
});

// Debug level
logger.debug('Processing request', { 
  method: req.method, 
  path: req.path 
});

// Warn level
logger.warn('Rate limit approaching', { 
  ip: req.ip, 
  count: requestCount 
});
```

## 📝 Log Format

### Standard Log Entry

```json
{
  "timestamp": "2024-12-02T10:30:00.000Z",
  "level": "info",
  "service": "auth-service",
  "message": "User logged in",
  "context": {
    "userId": "64abc123def456",
    "email": "user@example.com",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  },
  "requestId": "req-abc123",
  "duration": 45
}
```

### Log Levels

| Level | Numeric | Ý Nghĩa | Sử Dụng |
|-------|---------|---------|---------|
| error | 0 | Lỗi nghiêm trọng | Exceptions, failures |
| warn | 1 | Cảnh báo | Rate limits, deprecations |
| info | 2 | Thông tin | User actions, events |
| http | 3 | HTTP requests | Request/response |
| debug | 4 | Debug info | Development |
| verbose | 5 | Chi tiết | Troubleshooting |

## 🔍 Loki Queries (LogQL)

### Basic Queries

```logql
# Tất cả logs từ auth-service
{service="auth-service"}

# Tất cả errors
{level="error"}

# Logs chứa text cụ thể
{service="auth-service"} |= "login failed"

# Regex pattern
{service=~".*-service"} |~ "error|fail|exception"
```

### Advanced Queries

```logql
# Parse JSON và filter
{service="auth-service"} 
  | json 
  | level="error"

# Count errors per service
sum by (service) (
  count_over_time({level="error"}[5m])
)

# Top 10 error messages
topk(10,
  sum by (message) (
    count_over_time({level="error"}[1h])
  )
)

# Error rate
sum(rate({level="error"}[5m])) / 
sum(rate({service=~".+"}[5m])) * 100
```

### Query Examples

```logql
# Login failures trong 1 giờ qua
{service="auth-service"} 
  |= "login failed" 
  | json 
  | email != ""

# Slow requests (> 1s)
{service=~".*-service"} 
  | json 
  | duration > 1000

# Requests theo user
{service="order-service"} 
  | json 
  | userId="64abc123"

# HTTP 5xx errors
{service=~".*-service"} 
  | json 
  | status >= 500
```

## 📊 Grafana Explore

### Truy Cập
1. Vào Grafana: http://localhost:3001
2. Click "Explore" (icon la bàn)
3. Chọn "Loki" từ dropdown

### Tips Sử Dụng

1. **Live Tail**: Click "Live" để xem logs realtime
2. **Time Range**: Sử dụng time picker để chọn range
3. **Labels**: Browser sẵn các labels có sẵn
4. **Line Limit**: Mặc định 1000 lines, có thể tăng

## 🚨 Alerting on Logs

### Error Rate Alert

```yaml
# monitoring/prometheus/log-rules.yml
groups:
  - name: log_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate({level="error"}[5m])) > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "More than 10 errors/second in last 5 minutes"
```

### Specific Error Alert

```yaml
      - alert: AuthenticationFailures
        expr: |
          sum(count_over_time(
            {service="auth-service"} |= "login failed"[5m]
          )) > 50
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate"
```

## 📱 Dashboard Panels

### Logs Panel Configuration

```json
{
  "type": "logs",
  "title": "Service Logs",
  "targets": [
    {
      "expr": "{service=~\"$service\"}",
      "refId": "A"
    }
  ],
  "options": {
    "showTime": true,
    "showLabels": true,
    "showCommonLabels": false,
    "wrapLogMessage": true,
    "prettifyLogMessage": true,
    "enableLogDetails": true,
    "sortOrder": "Descending"
  }
}
```

### Variables for Filtering

```yaml
# Dashboard variables
- name: service
  type: query
  query: label_values(service)
  multi: true
  includeAll: true

- name: level
  type: custom
  options:
    - error
    - warn
    - info
    - debug
  multi: true
  includeAll: true
```

## 🔧 Troubleshooting

### Logs không xuất hiện

1. **Kiểm tra Promtail**
   ```bash
   docker logs promtail
   ```

2. **Verify config**
   ```bash
   docker exec promtail cat /etc/promtail/config.yml
   ```

3. **Kiểm tra Loki health**
   ```bash
   curl http://localhost:3100/ready
   curl http://localhost:3100/metrics
   ```

4. **Test query trực tiếp**
   ```bash
   curl -G http://localhost:3100/loki/api/v1/labels
   ```

### Performance Issues

1. **Giảm retention**
   ```yaml
   # loki-config.yml
   limits_config:
     retention_period: 72h  # Giữ 3 ngày thay vì 7
   ```

2. **Limit query range**
   ```yaml
   limits_config:
     max_query_lookback: 24h
   ```

3. **Increase resources**
   ```yaml
   # docker-compose.yml
   loki:
     deploy:
       resources:
         limits:
           memory: 2G
         reservations:
           memory: 512M
   ```

## 📈 Best Practices

### 1. Structured Logging
```javascript
// ✅ Good
logger.info('Order created', { orderId, userId, amount });

// ❌ Bad
logger.info(`Order ${orderId} created by ${userId} for $${amount}`);
```

### 2. Request Context
```javascript
// Middleware để thêm request ID
app.use((req, res, next) => {
  req.requestId = uuid();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Sử dụng trong logs
logger.info('Processing request', { 
  requestId: req.requestId,
  ...
});
```

### 3. Sensitive Data
```javascript
// ✅ Mask sensitive data
logger.info('Payment processed', { 
  cardLast4: card.number.slice(-4),
  amount: payment.amount
});

// ❌ Never log full cards, passwords
logger.info('Payment', { cardNumber: card.number });
```

### 4. Error Context
```javascript
try {
  // ... code
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: { orderId, userId },
    requestId: req.requestId
  });
}
```

## 📚 Tài Liệu Tham Khảo

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL Reference](https://grafana.com/docs/loki/latest/logql/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/configuration/)
- [Winston Logger](https://github.com/winstonjs/winston)

---

*Tài liệu này là một phần của FastFood Delivery DevOps Guide*
