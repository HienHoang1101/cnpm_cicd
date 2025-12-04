# =========================================
# MONITORING STACK - Quick Start Guide
# FastFood Delivery Platform
# =========================================

## 📋 Overview

This monitoring stack provides comprehensive observability for the FastFood Delivery platform:

- **Prometheus** - Metrics collection & alerting
- **Grafana** - Visualization & dashboards
- **Loki** - Log aggregation
- **ELK Stack** - Advanced log analysis (Elasticsearch, Logstash, Kibana)
- **Alertmanager** - Alert routing & notifications

## 🚀 Quick Start

### Start All Monitoring Services

```bash
# Navigate to monitoring directory
cd monitoring

# Start Prometheus + Grafana + Loki stack
docker-compose -f docker-compose.monitoring.yml up -d

# Start ELK stack (optional, for advanced logging)
docker-compose -f elk/docker-compose.elk.yml up -d
```

### Access Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Kibana** | http://localhost:5601 | - |
| **Elasticsearch** | http://localhost:9200 | - |

## 📊 Available Dashboards

### Grafana Dashboards

1. **Services Overview** (`/d/fastfood-services-overview`)
   - Service health status
   - Response times
   - Uptime metrics

2. **Business Metrics** (`/d/fastfood-business-metrics`)
   - Orders & Revenue
   - Active users
   - Delivery stats
   - Authentication metrics

3. **Infrastructure** (`/d/fastfood-infrastructure`)
   - CPU, Memory, Disk usage
   - Container resources
   - Network traffic

4. **Test Results** (`/d/test-results`)
   - CI/CD test metrics

## 🔧 Configuration

### Add Metrics to Your Service

1. Install the metrics library:
```bash
npm install prom-client
```

2. Add metrics middleware:
```javascript
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics');

// Add middleware
app.use(metricsMiddleware);

// Expose /metrics endpoint
app.get('/metrics', metricsEndpoint);
```

3. Record custom metrics:
```javascript
const { recordOrder, recordPayment, recordLoginAttempt } = require('../shared/metrics');

// Record order
recordOrder('completed', 'delivery');

// Record payment
recordPayment('success', 'card', 25.99, 'USD');

// Record login attempt
recordLoginAttempt(true);
```

### Add Logging to Your Service

1. Install logging library:
```bash
npm install winston
```

2. Use the logger:
```javascript
const logger = require('../shared/logger');

// Log info
logger.info('Order created', { orderId: '123', userId: '456' });

// Log error
logger.error('Payment failed', { orderId: '123', error: err.message });
```

3. Add request logging middleware:
```javascript
const { requestLogger, errorLogger } = require('../shared/logger');

app.use(requestLogger);
app.use(errorLogger);
```

### Configure Alerts

Edit `alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@example.com'
        from: 'alertmanager@example.com'
```

## 📈 Key Metrics

### Application Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request latency |
| `orders_total` | Counter | Total orders by status |
| `payments_total` | Counter | Total payments by status |
| `active_users` | Gauge | Current active users |
| `delivery_pending_assignments` | Gauge | Pending deliveries |

### Infrastructure Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `node_cpu_seconds_total` | Counter | CPU usage |
| `node_memory_MemAvailable_bytes` | Gauge | Available memory |
| `node_filesystem_avail_bytes` | Gauge | Available disk space |
| `container_cpu_usage_seconds_total` | Counter | Container CPU |
| `container_memory_working_set_bytes` | Gauge | Container memory |

## 🚨 Alert Rules

Pre-configured alerts in `prometheus/alert.rules.yml`:

### Critical Alerts
- ServiceDown - Service unreachable for >1 minute
- DiskSpaceCritical - Disk usage >95%
- MongoDBDown - Database unreachable
- RedisDown - Cache unreachable

### Warning Alerts
- HighCPUUsage - CPU >80% for 5 minutes
- HighMemoryUsage - Memory >85% for 5 minutes
- ServiceHighErrorRate - Error rate >5%
- ServiceHighLatency - P95 latency >500ms
- HighOrderFailureRate - Order failures >10%
- PaymentServiceSlowResponse - Payment processing >3s

## 📝 Log Analysis

### Using Kibana

1. Open Kibana at http://localhost:5601
2. Go to **Discover**
3. Create index pattern: `fastfood-logs-*`
4. Explore logs with filters:
   - `log_level: error` - View errors
   - `service: auth-service` - Filter by service
   - `http_method: POST` - Filter by method

### Log Query Examples

```
# Find all errors
log_level: error

# Find orders for specific user
user_id: "user123" AND service: "order-service"

# Find slow requests (>1 second)
response_time_ms: >1000

# Find failed payments
service: "payment-service" AND parsed.status: "failed"
```

## 🔍 Troubleshooting

### Service not showing in Prometheus

1. Check service is exposing `/metrics` endpoint
2. Verify service is listed in `prometheus/prometheus.yml`
3. Check Prometheus targets: http://localhost:9090/targets

### No data in Grafana

1. Verify Prometheus data source is connected
2. Check time range is correct
3. Verify metric names match queries

### ELK Stack issues

```bash
# Check Elasticsearch health
curl http://localhost:9200/_cluster/health?pretty

# Check Logstash logs
docker logs logstash

# Check Filebeat logs
docker logs filebeat
```

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Documentation](https://www.elastic.co/guide/)
- [Loki Documentation](https://grafana.com/docs/loki/)

---

**Maintained by:** FastFood Delivery DevOps Team  
**Last Updated:** December 2025
