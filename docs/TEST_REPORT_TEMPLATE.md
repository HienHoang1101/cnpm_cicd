# 📊 Test Report Template - FastFood Delivery

## 📌 Thông Tin Báo Cáo

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Dự án** | FastFood Delivery Platform |
| **Version** | 1.0.0 |
| **Ngày Test** | [DD/MM/YYYY] |
| **Người Thực Hiện** | [Tên] |
| **Môi Trường** | [Development/Staging/Production] |
| **Build Number** | [#xxx] |

---

## 1. 📈 Tổng Quan Kết Quả

### 1.1 Summary

| Metric | Kết Quả | Target | Status |
|--------|---------|--------|--------|
| **Tổng số Test Cases** | xxx | - | - |
| **Passed** | xxx (xx%) | ≥95% | ✅/❌ |
| **Failed** | xxx (xx%) | ≤5% | ✅/❌ |
| **Blocked** | xxx | 0 | ✅/❌ |
| **Skipped** | xxx | - | - |
| **Code Coverage** | xx% | ≥60% | ✅/❌ |

### 1.2 Biểu Đồ Kết Quả

```
Test Results Distribution:

Passed  ████████████████████████████████████████ 85%
Failed  ████████ 10%
Blocked ██ 3%
Skipped ██ 2%
```

### 1.3 Kết Quả Theo Service

| Service | Total | Passed | Failed | Coverage |
|---------|-------|--------|--------|----------|
| Auth Service | 20 | 19 | 1 | 75% |
| Order Service | 25 | 23 | 2 | 68% |
| Restaurant Service | 18 | 18 | 0 | 72% |
| Payment Service | 15 | 14 | 1 | 65% |
| Notification Service | 12 | 12 | 0 | 60% |
| Admin Service | 15 | 14 | 1 | 62% |
| Delivery Service | 15 | 13 | 2 | 58% |
| **TOTAL** | **120** | **113** | **7** | **66%** |

---

## 2. ❌ Chi Tiết Test Cases Failed

### 2.1 AUTH-LOG-002: Login với sai password

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps to Reproduce** | 1. POST /api/auth/login<br>2. Body: { email: "test@test.com", password: "wrong" } |
| **Expected** | Status 401, message "Invalid credentials" |
| **Actual** | Status 500, Internal Server Error |
| **Root Cause** | Missing error handling in catch block |
| **Assigned To** | [Developer Name] |
| **Status** | Open |

### 2.2 ORD-STA-007: Cancel order đã preparing

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Steps to Reproduce** | 1. Create order<br>2. Update to preparing<br>3. Try to cancel |
| **Expected** | Status 400, "Cannot cancel preparing order" |
| **Actual** | Status 200, Order cancelled |
| **Root Cause** | Missing status validation in cancel handler |
| **Assigned To** | [Developer Name] |
| **Status** | In Progress |

### 2.3 [Template cho các test case failed khác]

| Field | Value |
|-------|-------|
| **TC ID** | [ID] |
| **Priority** | [High/Medium/Low] |
| **Steps to Reproduce** | [Steps] |
| **Expected** | [Expected result] |
| **Actual** | [Actual result] |
| **Root Cause** | [Analysis] |
| **Assigned To** | [Name] |
| **Status** | [Open/In Progress/Fixed] |

---

## 3. 🔍 Chi Tiết Theo Loại Test

### 3.1 Unit Tests

| Category | Total | Pass | Fail | Skip |
|----------|-------|------|------|------|
| Controllers | 40 | 38 | 2 | 0 |
| Services | 30 | 29 | 1 | 0 |
| Middleware | 15 | 15 | 0 | 0 |
| Utils | 20 | 18 | 1 | 1 |
| **Total** | **105** | **100** | **4** | **1** |

### 3.2 Integration Tests

| Flow | Total | Pass | Fail |
|------|-------|------|------|
| Auth Flow | 5 | 5 | 0 |
| Order Flow | 8 | 7 | 1 |
| Payment Flow | 5 | 4 | 1 |
| Delivery Flow | 6 | 5 | 1 |
| **Total** | **24** | **21** | **3** |

### 3.3 E2E Tests

| Scenario | Status | Duration |
|----------|--------|----------|
| Complete order journey | ✅ Pass | 45s |
| Restaurant onboarding | ✅ Pass | 30s |
| Driver delivery flow | ❌ Fail | 60s |
| Admin settlement | ✅ Pass | 25s |

---

## 4. 📊 Code Coverage Report

### 4.1 Coverage Summary

```
=============================== Coverage summary ===============================
Statements   : 66.5% ( 1200/1804 )
Branches     : 58.2% ( 450/773 )
Functions    : 72.1% ( 280/388 )
Lines        : 68.3% ( 1150/1684 )
================================================================================
```

### 4.2 Coverage by File (Top 10 Lowest)

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| notification/consumers/kafka.js | 45% | 30% | 50% | 42% |
| admin/services/analytics.js | 52% | 40% | 55% | 50% |
| delivery/websocket.js | 55% | 45% | 60% | 53% |
| payment/services/stripe.js | 58% | 48% | 62% | 56% |
| ... | ... | ... | ... | ... |

### 4.3 Uncovered Critical Paths

1. **Error handling in Kafka consumer** - Không có test cho retry mechanism
2. **Webhook signature validation** - Stripe webhook chưa được test đầy đủ
3. **WebSocket reconnection** - Logic reconnect chưa covered

---

## 5. ⏱️ Performance Metrics

### 5.1 Test Execution Time

| Phase | Duration |
|-------|----------|
| Unit Tests | 45 seconds |
| Integration Tests | 2 minutes |
| E2E Tests | 5 minutes |
| **Total** | **7 minutes 45 seconds** |

### 5.2 Slowest Tests

| Test | Duration | Service |
|------|----------|---------|
| E2E: Complete order journey | 45s | Order |
| Integration: Payment flow | 30s | Payment |
| Unit: File upload | 15s | Restaurant |

---

## 6. 🐛 Bug Summary

### 6.1 Bugs Found

| Severity | Count | Fixed | Open |
|----------|-------|-------|------|
| Critical | 0 | 0 | 0 |
| High | 2 | 1 | 1 |
| Medium | 4 | 2 | 2 |
| Low | 3 | 1 | 2 |
| **Total** | **9** | **4** | **5** |

### 6.2 Bug Trend

```
Week 1: ████████████ 12 bugs
Week 2: ████████ 8 bugs
Week 3: █████ 5 bugs
Week 4: ███ 3 bugs (current)
```

---

## 7. 📋 Recommendations

### 7.1 Action Items

| Priority | Item | Owner | Due Date |
|----------|------|-------|----------|
| High | Fix AUTH-LOG-002 error handling | [Dev] | [Date] |
| High | Add order cancel validation | [Dev] | [Date] |
| Medium | Increase Kafka consumer coverage | [Dev] | [Date] |
| Medium | Add WebSocket reconnection tests | [Dev] | [Date] |
| Low | Optimize slow tests | [QA] | [Date] |

### 7.2 Improvement Areas

1. **Coverage Improvement**
   - Thêm tests cho error handling paths
   - Cover edge cases trong payment flow
   - Test WebSocket events

2. **Test Stability**
   - Fix flaky tests trong E2E
   - Add retry mechanism cho network tests
   - Improve test isolation

3. **Performance**
   - Parallel test execution
   - Optimize database setup/teardown
   - Use test fixtures thay vì real API calls

---

## 8. 📎 Attachments

1. [Full Test Report (HTML)](./reports/test-report.html)
2. [Coverage Report (HTML)](./coverage/lcov-report/index.html)
3. [JUnit Report (XML)](./reports/junit.xml)
4. [Bug List (CSV)](./reports/bugs.csv)

---

## 9. ✅ Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Dev Lead | | | |
| Project Manager | | | |

---

## 10. 📝 Notes

- [ ] Tất cả critical bugs đã được fix trước release
- [ ] Code coverage đạt target
- [ ] Performance tests passed
- [ ] Security scan completed

---

*Report generated: [Timestamp]*
*Test Framework: Jest v29.x*
*CI/CD: GitHub Actions*
