# 📚 FastFood Delivery - Documentation

> Tài liệu đầy đủ cho dự án FastFood Delivery Microservices Platform

## 📋 Mục Lục Tài Liệu

### 🧪 Testing Documentation

| File | Mô Tả | Status |
|------|-------|--------|
| [TEST_PLAN.md](./TEST_PLAN.md) | Kế hoạch kiểm thử tổng thể | ✅ Updated |
| [TEST_CASES.md](./TEST_CASES.md) | Chi tiết các test cases (140+) | ✅ Updated |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Chiến lược và best practices | ✅ Updated |
| [TEST_EXECUTION_REPORT.md](./TEST_EXECUTION_REPORT.md) | Báo cáo kết quả test | ✅ Updated |
| [TEST_DASHBOARD_GUIDE.md](./TEST_DASHBOARD_GUIDE.md) | Hướng dẫn sử dụng Test Dashboard | ✅ Updated |
| [TEST_REPORT_TEMPLATE.md](./TEST_REPORT_TEMPLATE.md) | Template báo cáo test | ✅ Available |

### 📡 API Documentation

| File | Mô Tả | Status |
|------|-------|--------|
| [api/README.md](./api/README.md) | Hướng dẫn sử dụng API docs | ✅ New |
| [api/openapi.yaml](./api/openapi.yaml) | OpenAPI 3.0.3 Specification | ✅ New |
| [api/index.html](./api/index.html) | Swagger UI Interface | ✅ New |
| [api/postman_collection.json](./api/postman_collection.json) | Postman Collection | ✅ New |
| [api/postman_environment.json](./api/postman_environment.json) | Postman Environment | ✅ New |

### 🔍 Monitoring Documentation

| File | Mô Tả | Status |
|------|-------|--------|
| [LOGS_MONITORING_GUIDE.md](./LOGS_MONITORING_GUIDE.md) | Hướng dẫn logs & monitoring | ✅ Updated |

---

## 📊 Project Status Summary

### ✅ Completed Features

| Category | Items | Status |
|----------|-------|--------|
| **CI/CD** | GitHub Actions Pipeline | ✅ Working |
| **Unit Tests** | 107 tests across 7 services | ✅ All Passing |
| **Integration Tests** | MongoDB Memory Server | ✅ Implemented |
| **Monitoring** | Prometheus + Grafana + Alertmanager | ✅ Configured |
| **API Docs** | OpenAPI/Swagger + Postman | ✅ Complete |
| **Test Docs** | Test Plan, Cases, Strategy, Reports | ✅ Complete |

### 📈 Test Results Overview

```
┌────────────────────────────────────────────────────────┐
│                    TEST SUMMARY                        │
├────────────────────────────────────────────────────────┤
│  ✅ Total Tests:     107                               │
│  ✅ Passed:          107                               │
│  ❌ Failed:          0                                 │
│  📊 Pass Rate:       100%                              │
└────────────────────────────────────────────────────────┘
```

| Service | Tests | Status |
|---------|-------|--------|
| Auth Service | 17 | ✅ Pass |
| Order Service | 26 | ✅ Pass |
| Restaurant Service | 20 | ✅ Pass |
| Payment Service | 14 | ✅ Pass |
| Notification Service | 15 | ✅ Pass |
| Admin Service | 15 | ✅ Pass |
| Delivery Service | 14 | ✅ Pass |

---

## 🚀 Quick Start

### View API Documentation

```bash
# Option 1: Local HTTP Server
cd docs/api
python -m http.server 8888
# Open http://localhost:8888

# Option 2: Online Swagger Editor
# Go to https://editor.swagger.io/
# Import docs/api/openapi.yaml
```

### Run Tests

```bash
# All tests
npm run test:all

# Specific service
cd auth && npm test
cd order && npm test
cd restaurant && npm test
cd payment-service && npm test
cd notification-service && npm test
cd admin-service && npm test
cd food-delivery-server && npm test
```

### Start Monitoring

```bash
# Start monitoring stack
cd monitoring
docker-compose up -d

# Access URLs
# - Grafana: http://localhost:3001 (admin/admin123)
# - Prometheus: http://localhost:9090
# - Alertmanager: http://localhost:9093
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FASTFOOD DELIVERY PLATFORM               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Auth   │ │  Order  │ │Restaurant│ │ Payment │           │
│  │ :5001   │ │ :5002   │ │  :5003  │ │  :5005  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│  ┌────┴───────────┴───────────┴───────────┴────┐           │
│  │                  API Gateway                 │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │Notifica-│ │  Admin  │ │Delivery │                       │
│  │  tion   │ │ :5008   │ │ :5004   │                       │
│  │ :5006   │ └─────────┘ └─────────┘                       │
│  └─────────┘                                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ MongoDB │ │  Redis  │ │  Kafka  │ │ Docker  │           │
│  │ :27017  │ │  :6379  │ │  :9092  │ │Compose  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MONITORING                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Prometheus│ │ Grafana │ │Alertman-│ │ Promtail│           │
│  │  :9090  │ │  :3001  │ │ger:9093 │ │ + Loki  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Repository Structure

```
cnpm_cicd/
├── 📁 .github/workflows/     # CI/CD Pipeline
│   └── ci-cd.yml
├── 📁 docs/                  # Documentation (YOU ARE HERE)
│   ├── 📁 api/              # API Documentation
│   │   ├── index.html
│   │   ├── openapi.yaml
│   │   ├── postman_collection.json
│   │   └── postman_environment.json
│   ├── TEST_PLAN.md
│   ├── TEST_CASES.md
│   ├── TESTING_STRATEGY.md
│   ├── TEST_EXECUTION_REPORT.md
│   ├── LOGS_MONITORING_GUIDE.md
│   └── TEST_DASHBOARD_GUIDE.md
├── 📁 monitoring/           # Monitoring Configuration
│   ├── docker-compose.yml
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
├── 📁 auth/                 # Auth Service
├── 📁 order/                # Order Service
├── 📁 restaurant/           # Restaurant Service
├── 📁 payment-service/      # Payment Service
├── 📁 notification-service/ # Notification Service
├── 📁 admin-service/        # Admin Service
├── 📁 food-delivery-server/ # Delivery Service
├── 📁 client-delivery-app/  # Mobile App (Driver)
├── 📁 foodapp-client/       # Mobile App (Customer)
├── 📁 food-delivery-admin/  # Admin Web
└── 📁 food-delivery-restuarant-web/ # Restaurant Web
```

---

## 📞 Contact & Support

- **GitHub Repository**: [HienHoang1101/cnpm_cicd](https://github.com/HienHoang1101/cnpm_cicd)
- **Branch**: main
- **Latest Commit**: See GitHub

---

## 📝 Changelog

### 03/12/2024
- ✅ Added comprehensive API documentation (OpenAPI/Swagger)
- ✅ Added Postman Collection & Environment
- ✅ Updated all test documentation
- ✅ Fixed CI/CD pipeline issues
- ✅ Implemented MongoDB Memory Server for integration tests

### 02/12/2024
- ✅ Initial test documentation created
- ✅ Monitoring setup (Prometheus, Grafana, Alertmanager)
- ✅ Unit tests for all services

---

*Last Updated: 03/12/2024*
