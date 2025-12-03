# ⚡ Performance Testing Guide

## 📋 Tổng Quan

Hệ thống Performance Testing sử dụng **Artillery.io** để kiểm tra hiệu năng của các microservices.

## 🧪 Các Loại Performance Test

| Loại Test | Mục đích | Thời gian | File |
|-----------|----------|-----------|------|
| **Load Test** | Kiểm tra hiệu năng dưới tải bình thường | ~5 phút | `load-test.yml` |
| **Stress Test** | Tìm điểm giới hạn của hệ thống | ~4 phút | `stress-test.yml` |
| **Spike Test** | Kiểm tra phản ứng với tải đột biến | ~6 phút | `spike-test.yml` |
| **Soak Test** | Kiểm tra ổn định dài hạn | ~30 phút | `soak-test.yml` |

## 🚀 Cách Chạy

### Prerequisites

```bash
# Install dependencies
cd tests
npm install

# Start services
docker-compose up -d
```

### Chạy từng loại test

```bash
# Load Test - Kiểm tra tải bình thường
npm run perf:load

# Stress Test - Kiểm tra giới hạn
npm run perf:stress

# Spike Test - Kiểm tra tải đột biến
npm run perf:spike

# Soak Test - Kiểm tra dài hạn (30 phút)
npm run perf:soak

# Quick Test - Test nhanh 100 requests
npm run perf:quick
```

### Tạo HTML Report

```bash
npm run perf:report
```

## 📊 Kết Quả Mong Đợi

### Performance Targets

| Metric | Target | Acceptable |
|--------|--------|------------|
| **Response Time (p50)** | < 200ms | < 500ms |
| **Response Time (p95)** | < 500ms | < 1000ms |
| **Response Time (p99)** | < 1000ms | < 2000ms |
| **Error Rate** | < 1% | < 5% |
| **Throughput** | > 100 req/s | > 50 req/s |

### Load Phases

```
Load Test Phases:
─────────────────────────────────────────────────────────
Phase 1: Warm up      │ 5 req/s  │ 30s  │ Khởi động
Phase 2: Ramp up      │ 10→30/s  │ 60s  │ Tăng dần
Phase 3: Sustained    │ 30 req/s │ 120s │ Tải ổn định
Phase 4: Spike        │ 50 req/s │ 30s  │ Tải cao
Phase 5: Cool down    │ 10 req/s │ 30s  │ Giảm tải
─────────────────────────────────────────────────────────
```

## 📈 Đọc Kết Quả

### Output mẫu

```
Summary report @ 14:32:10(+0700)

Scenarios launched:  1500
Scenarios completed: 1485
Requests completed:  4455
Mean response/sec:   74.25
Response time (msec):
  min: 12
  max: 2341
  median: 89
  p95: 456
  p99: 892

Codes:
  200: 4200
  201: 200
  401: 55
```

### Giải thích metrics

- **Scenarios launched**: Số scenarios đã khởi chạy
- **Scenarios completed**: Số scenarios hoàn thành
- **Mean response/sec**: Throughput trung bình
- **p95/p99**: 95%/99% requests nhanh hơn giá trị này
- **Codes**: Phân bố HTTP status codes

## 🔧 Cấu Hình Custom

### Thay đổi target URL

```yaml
# load-test.yml
config:
  target: "http://your-server:port"
```

### Thêm scenarios mới

```yaml
scenarios:
  - name: "Custom Flow"
    weight: 20
    flow:
      - get:
          url: "/api/your-endpoint"
          expect:
            - statusCode: 200
```

## 🐳 Chạy với Docker

```bash
# Build test container
docker build -f tests/Dockerfile.test -t fastfood-perf-tests .

# Run performance tests
docker run --network host fastfood-perf-tests npm run perf:load
```

## ⚠️ Lưu Ý

1. **Chạy trên môi trường staging** - Không chạy stress test trên production
2. **Monitor resources** - Theo dõi CPU/Memory trong khi test
3. **Đợi hệ thống ổn định** - Đợi services khởi động xong trước khi test
4. **Kiểm tra logs** - Review logs để phát hiện errors

## 📚 Tài Liệu Tham Khảo

- [Artillery Documentation](https://www.artillery.io/docs)
- [Performance Testing Best Practices](https://www.artillery.io/blog/load-testing-best-practices)
