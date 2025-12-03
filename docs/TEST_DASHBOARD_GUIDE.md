# 📊 Test Report Dashboard - Hướng Dẫn Chi Tiết

## 🎯 Mục Đích

Dashboard này cung cấp cái nhìn tổng quan về:
- Kết quả test pass/fail
- Chi tiết logs của các test
- Trends theo thời gian
- Code coverage

## 🚀 Truy Cập Dashboard

### URL
```
http://localhost:3001/d/fastfood-test-results
```

### Credentials
- **Username**: admin
- **Password**: admin123

## 📈 Các Panel Trong Dashboard

### 1. Test Summary (Row đầu tiên)

| Panel | Mô Tả | Giá Trị Tốt |
|-------|-------|-------------|
| 📈 Total Tests Run | Tổng số test đã chạy | Tăng liên tục |
| ✅ Tests Passed | Số test pass | Cao nhất có thể |
| ❌ Tests Failed | Số test fail | 0 hoặc rất thấp |
| 📊 Pass Rate | Tỷ lệ pass (%) | > 95% |
| 📈 Code Coverage | Độ phủ code (%) | > 80% |
| ⏱️ Total Duration | Thời gian chạy | Ổn định |

### 2. Test Results Distribution

- **Pie Chart** hiển thị tỷ lệ:
  - 🟢 Passed (xanh lá)
  - 🔴 Failed (đỏ)
  - 🟡 Skipped (vàng)

### 3. Test Results by Service

- **Bar Chart** hiển thị số lượng pass/fail theo từng service
- Giúp xác định service nào có nhiều test fail

### 4. Test Logs

- **Logs Panel** từ Loki
- Query: `{job="test-results"}`
- Hiển thị realtime logs của quá trình test

### 5. Failed Tests Details

- **Filtered Logs Panel**
- Query: `{job="test-results"} |= "FAIL"`
- Chỉ hiển thị các test fail với chi tiết error

### 6. Test Trends

- **Time Series Charts** hiển thị:
  - Pass Rate theo thời gian
  - Code Coverage theo service

## 🔍 Cách Đọc Logs

### Format Log Test

```json
{
  "timestamp": "2024-12-02T10:30:00Z",
  "level": "info",
  "event": "test_passed",
  "suite": "auth",
  "testName": "should login successfully",
  "duration": "45ms",
  "status": "PASS"
}
```

### Các Log Levels

| Level | Ý Nghĩa | Màu |
|-------|---------|-----|
| info | Test passed | Xanh |
| warn | Test skipped | Vàng |
| error | Test failed | Đỏ |

## 📝 Queries Hữu Ích

### Lọc theo Service
```
{job="test-results", service="auth-service"}
```

### Lọc theo Status
```
{job="test-results"} |= "FAIL"
{job="test-results"} |= "PASS"
{job="test-results"} |= "SKIP"
```

### Lọc theo Time Range
- Sử dụng time picker ở góc phải trên của Grafana

## 🔔 Alerts Được Cấu Hình

### TestFailureRate
- **Condition**: Failure rate > 10%
- **Duration**: 1 phút
- **Severity**: Critical
- **Action**: Notification ngay lập tức

### NoTestsRunning
- **Condition**: Không có test nào chạy trong 2 giờ
- **Severity**: Warning
- **Action**: Kiểm tra CI/CD pipeline

## 📊 Metrics Chi Tiết

### Test Metrics

```promql
# Tổng số test đã chạy
sum(test_runs_total)

# Số test pass
sum(test_passed_total)

# Số test fail
sum(test_failures_total)

# Tỷ lệ pass
(sum(test_passed_total) / sum(test_runs_total)) * 100

# Thời gian chạy trung bình
avg(test_duration_seconds)
```

### Coverage Metrics

```promql
# Coverage trung bình
avg(code_coverage_percent)

# Coverage theo service
avg by (service) (code_coverage_percent)
```

## 🛠️ Tích Hợp với CI/CD

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'junit.xml'
    }]
  ],
  coverageReporters: ['json', 'lcov', 'text', 'html']
};
```

### Push Metrics từ CI

```yaml
# .github/workflows/ci-cd.yml
- name: Push Test Metrics
  run: |
    # Push metrics to Prometheus Pushgateway
    cat << EOF | curl --data-binary @- http://pushgateway:9091/metrics/job/tests/service/auth
    test_runs_total ${{ steps.tests.outputs.total }}
    test_passed_total ${{ steps.tests.outputs.passed }}
    test_failures_total ${{ steps.tests.outputs.failed }}
    EOF
```

## 📱 Mobile View

Dashboard được thiết kế responsive:
- Tự động adjust trên mobile
- Các panel quan trọng nhất hiển thị trước
- Touch-friendly interactions

## 🔧 Customization

### Thêm Panel Mới

1. Click "Add panel" button
2. Chọn visualization type
3. Cấu hình query
4. Save dashboard

### Thay Đổi Time Range

- Click time picker (góc phải trên)
- Chọn preset hoặc custom range
- Apply changes

### Export Dashboard

```bash
# Export as JSON
curl -X GET http://localhost:3001/api/dashboards/uid/fastfood-test-results \
  -H "Authorization: Bearer <API_KEY>" \
  -o dashboard.json
```

## 📞 Troubleshooting

### Dashboard không hiển thị data

1. Kiểm tra Prometheus đang chạy
   ```bash
   curl http://localhost:9090/api/v1/status/config
   ```

2. Kiểm tra metrics endpoint
   ```bash
   curl http://localhost:5001/metrics
   ```

3. Verify Loki connection trong Grafana
   - Data Sources > Loki > Test Connection

### Logs không xuất hiện

1. Kiểm tra Promtail
   ```bash
   docker logs promtail
   ```

2. Verify Loki ingestion
   ```bash
   curl http://localhost:3100/ready
   ```

---

*Tài liệu này là một phần của FastFood Delivery DevOps Guide*
