# 🍔 FastFood Delivery - CI/CD & Monitoring Guide

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Monitoring Stack](#monitoring-stack)
4. [Testing Strategy](#testing-strategy)
5. [Hướng Dẫn Triển Khai](#hướng-dẫn-triển-khai)
6. [Dashboard & Metrics](#dashboard--metrics)
7. [Alerts & Notifications](#alerts--notifications)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan Hệ Thống

### Kiến Trúc Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                     FASTFOOD DELIVERY PLATFORM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Auth Service│  │Order Service│  │ Restaurant  │              │
│  │   :5001     │  │   :5002     │  │   :5003     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Delivery   │  │   Payment   │  │Notification │              │
│  │   :5004     │  │   :5005     │  │   :5006     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐                                                 │
│  │   Admin     │                                                 │
│  │   :5008     │                                                 │
│  └─────────────┘                                                 │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      MONITORING STACK                            │
│                                                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │Prometheus │  │  Grafana  │  │   Loki    │  │Alertmanager│    │
│  │   :9090   │  │   :3001   │  │   :3100   │  │   :9093    │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Công Nghệ Sử Dụng

| Component | Technology | Mục Đích |
|-----------|------------|----------|
| Backend | Node.js + Express | API Services |
| Database | MongoDB | Data Storage |
| Message Queue | Kafka | Event Streaming |
| CI/CD | GitHub Actions | Automation |
| Monitoring | Prometheus + Grafana | Metrics & Visualization |
| Logging | Loki + Promtail | Log Aggregation |
| Alerting | Alertmanager | Alert Management |
| Containerization | Docker | Deployment |

---

## 🔄 CI/CD Pipeline

### Pipeline Overview

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  PUSH   │───►│  LINT   │───►│  TEST   │───►│  BUILD  │───►│ DEPLOY  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                   │              │              │              │
                   ▼              ▼              ▼              ▼
              ESLint          Unit Tests    Docker Build    Staging/
              Reports         Integration   Push to         Production
                              E2E           Registry
```

### Jobs Trong Pipeline

1. **🔍 Lint & Code Quality**
   - ESLint check cho tất cả services
   - Output reports dạng JSON

2. **🧪 Unit Tests**
   - Chạy parallel cho từng service
   - Coverage reports với Codecov
   - JUnit XML reports

3. **🔗 Integration Tests**
   - Chạy với MongoDB & Redis services
   - Test communication giữa các services

4. **🌐 E2E Tests**
   - Chạy với Docker Compose
   - Complete user journey tests

5. **🐳 Build Docker Images**
   - Multi-stage builds
   - Push to GitHub Container Registry

6. **🔒 Security Scan**
   - Trivy vulnerability scanner
   - SARIF reports

7. **🚀 Deploy**
   - Staging deployment từ `develop` branch
   - Production deployment từ `main` branch

### Cấu Hình CI/CD

File: `.github/workflows/ci-cd.yml`

```yaml
# Triggers
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Environment Variables
env:
  NODE_VERSION: '18'
  DOCKER_REGISTRY: ghcr.io
```

### Chạy Pipeline Locally

```bash
# Install act (GitHub Actions runner)
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run pipeline
act push -j unit-tests
```

---

## 📊 Monitoring Stack

### Khởi Chạy Monitoring

```bash
# Start monitoring stack
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services
docker-compose -f docker-compose.monitoring.yml ps
```

### Truy Cập Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | - |
| Alertmanager | http://localhost:9093 | - |
| Loki | http://localhost:3100 | - |

### Prometheus Metrics

Các metrics được thu thập:

```
# HTTP Metrics
http_request_duration_seconds
http_requests_total
http_requests_in_progress

# Database Metrics
db_query_duration_seconds
db_connections_active

# Business Metrics
orders_created_total
orders_completed_total
payments_processed_total

# Test Metrics
test_runs_total
test_passed_total
test_failures_total
code_coverage_percent
```

### Grafana Dashboards

1. **🍔 Services Overview**
   - Service health status
   - Request rates
   - Response times
   - Container metrics

2. **🧪 Test Results Dashboard**
   - Test pass/fail rates
   - Code coverage trends
   - Failed test logs
   - Test execution times

### Cấu Hình Scrape Interval

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
           ╱╲
          ╱  ╲         E2E Tests (10%)
         ╱────╲        - Complete user journeys
        ╱      ╲       - Cross-service flows
       ╱────────╲
      ╱          ╲     Integration Tests (20%)
     ╱────────────╲    - Service communication
    ╱              ╲   - Database interactions
   ╱────────────────╲
  ╱                  ╲ Unit Tests (70%)
 ╱────────────────────╲- Individual functions
╱                      ╲- Business logic
```

### Chạy Tests

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# All Tests với Coverage
npm run test:coverage

# Watch Mode
npm run test:watch
```

### Test Reports

```bash
# Generate HTML Report
npm run test:report

# Coverage Report Location
./coverage/lcov-report/index.html

# JUnit Report
./reports/junit.xml
```

### Test Cases Structure

```
tests/
├── integration/
│   └── services.integration.test.js
├── e2e/
│   └── complete-flow.e2e.test.js
├── reports/
├── coverage/
└── package.json

auth/
└── tests/
    └── auth.test.js

order/
└── tests/
    └── order.test.js
```

### Test Coverage Goals

| Metric | Target | Minimum |
|--------|--------|---------|
| Statements | 80% | 60% |
| Branches | 75% | 50% |
| Functions | 80% | 60% |
| Lines | 80% | 60% |

---

## 🚀 Hướng Dẫn Triển Khai

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Git
- GitHub Account

### 1. Clone Repository

```bash
git clone https://github.com/HienHoang1101/cnpm_cicd.git
cd cnpm_cicd
```

### 2. Cấu Hình Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Start All Services

```bash
# Development mode
docker-compose up -d

# With monitoring
docker-compose -f docker-compose.yml -f monitoring/docker-compose.monitoring.yml up -d
```

### 4. Start Testing Environment

```bash
# Build and start test environment
docker-compose -f docker-compose.test.yml up -d

# Run tests
docker-compose -f docker-compose.test.yml run test-runner

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

### 5. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Via Loki (in Grafana)
# Navigate to Explore > Loki
```

---

## 📈 Dashboard & Metrics

### Key Performance Indicators (KPIs)

| KPI | Description | Target |
|-----|-------------|--------|
| Uptime | Service availability | 99.9% |
| Response Time (p95) | 95th percentile latency | < 500ms |
| Error Rate | 5xx errors / total requests | < 1% |
| Test Pass Rate | Passed tests / total tests | > 95% |
| Code Coverage | Covered lines / total lines | > 80% |

### Grafana Panels

#### Services Overview Dashboard

1. **Service Status** - UP/DOWN indicators
2. **Request Rate** - Requests per second by service
3. **Response Time** - p50, p95, p99 latencies
4. **Error Rate** - 4xx and 5xx error rates
5. **CPU Usage** - Container CPU utilization
6. **Memory Usage** - Container memory consumption

#### Test Results Dashboard

1. **Total Tests Run** - Counter
2. **Tests Passed** - Counter (green)
3. **Tests Failed** - Counter (red)
4. **Pass Rate** - Percentage gauge
5. **Code Coverage** - Percentage gauge
6. **Test Duration** - Histogram
7. **Test Logs** - Loki logs panel
8. **Failed Tests** - Filtered error logs

### Custom Queries

```promql
# Request rate per service
sum(rate(http_requests_total[5m])) by (service)

# p95 Response Time
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Error Rate
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Test Pass Rate
(sum(test_passed_total) / sum(test_runs_total)) * 100
```

---

## 🔔 Alerts & Notifications

### Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| ServiceDown | `up == 0` for 1m | Critical |
| HighResponseTime | p95 > 2s for 5m | Warning |
| HighErrorRate | Error rate > 5% for 5m | Critical |
| ContainerHighCPU | CPU > 80% for 5m | Warning |
| TestFailureRate | Failure rate > 10% | Critical |

### Alert Routing

```yaml
# Critical alerts -> Immediate notification
- severity: critical
  receiver: critical-alerts
  repeat_interval: 5m

# Warning alerts -> Standard notification
- severity: warning
  receiver: warning-alerts
  repeat_interval: 30m
```

### Notification Channels

Configure in `alertmanager/alertmanager.yml`:

- Webhook (default)
- Email (configure SMTP)
- Slack (add webhook URL)
- PagerDuty (add integration key)

---

## 📚 Best Practices

### 1. Code Quality

```bash
# Always run linter before commit
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### 2. Testing

```bash
# Write tests for new features
# Minimum: 1 happy path + 1 error case

# Run tests before pushing
npm run test:unit
```

### 3. Commits

```bash
# Use conventional commits
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(order): correct total calculation"
git commit -m "test(payment): add integration tests"
```

### 4. Monitoring

- Check Grafana dashboards daily
- Set up alert notifications
- Review slow queries in logs
- Monitor test trends

### 5. Security

- Never commit secrets
- Use environment variables
- Rotate credentials regularly
- Keep dependencies updated

---

## 🔧 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   docker-compose logs <service-name>
   docker-compose restart <service-name>
   ```

2. **Tests failing locally**
   ```bash
   # Ensure dependencies are installed
   npm install
   
   # Clear jest cache
   npm run test -- --clearCache
   ```

3. **Prometheus not scraping**
   ```bash
   # Check targets
   curl http://localhost:9090/api/v1/targets
   
   # Verify service metrics endpoint
   curl http://localhost:5001/metrics
   ```

4. **Loki not receiving logs**
   ```bash
   # Check promtail status
   docker logs promtail
   
   # Verify Loki is ready
   curl http://localhost:3100/ready
   ```

---

## 📞 Support

- **Documentation**: Xem các file README trong từng service
- **Issues**: Tạo issue trên GitHub
- **Logs**: Kiểm tra Grafana/Loki dashboards

---

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

*Last Updated: December 2024*
