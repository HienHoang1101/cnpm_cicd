# 🔒 Security Testing Guide

## 📋 Tổng Quan

Hệ thống Security Testing của FastFood Delivery Platform bao gồm nhiều layers bảo mật:

1. **npm audit** - Dependency vulnerability scanning
2. **Trivy** - Container & filesystem security scanning
3. **CodeQL** - Static code analysis
4. **Security Unit Tests** - OWASP Top 10 testing

---

## 🛡️ Security Test Categories

### 1. Injection Prevention (OWASP A03:2021)

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-INJ-001 | NoSQL Injection - Email | Ngăn chặn MongoDB operators trong email |
| SEC-INJ-002 | NoSQL Injection - Password | Ngăn chặn MongoDB operators trong password |
| SEC-INJ-003 | NoSQL Injection - Search | Ngăn chặn $where operator |
| SEC-INJ-004 | Command Injection | Sanitize filenames |

### 2. XSS Prevention (OWASP A03:2021)

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-XSS-001 | Script Tag Injection | Sanitize `<script>` tags |
| SEC-XSS-002 | Event Handler Injection | Sanitize `onerror`, `onclick`, etc. |
| SEC-XSS-003 | JavaScript URL | Block `javascript:` URLs |
| SEC-XSS-004 | Encoded Script | Handle double encoding |

### 3. Broken Authentication (OWASP A07:2021)

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-AUTH-001 | Password Complexity | Enforce strong passwords |
| SEC-AUTH-002 | Password Storage | No plain text passwords |
| SEC-AUTH-003 | JWT Structure | Validate JWT format |
| SEC-AUTH-004 | Token Expiry | Detect expired tokens |
| SEC-AUTH-005 | Token Tampering | Detect modified tokens |

### 4. Broken Access Control (OWASP A01:2021)

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-AC-001 | Role-based Access | Enforce RBAC |
| SEC-AC-002 | Privilege Escalation | Prevent role changes |
| SEC-AC-003 | Resource Ownership | Enforce ownership |
| SEC-AC-004 | IDOR Prevention | Validate object IDs |

### 5. Input Validation

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-INPUT-001 | Email Validation | Validate email format |
| SEC-INPUT-002 | Phone Validation | Validate phone format |
| SEC-INPUT-003 | Payload Size | Limit request size |
| SEC-INPUT-004 | Prototype Pollution | Prevent `__proto__` attacks |
| SEC-INPUT-005 | Path Traversal | Prevent `../` attacks |

### 6. Rate Limiting

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-RATE-001 | Request Counting | Track request counts |
| SEC-RATE-002 | Auth Endpoints | Stricter limits for auth |

### 7. Security Headers

| Test ID | Test Case | Mô Tả |
|---------|-----------|-------|
| SEC-HEADER-001 | Required Headers | All security headers defined |
| SEC-HEADER-002 | CSP Policy | Content Security Policy |
| SEC-HEADER-003 | Clickjacking | X-Frame-Options |

---

## 🚀 Cách Chạy Security Tests

### Chạy Security Unit Tests

```bash
cd tests
npm test -- --testPathPattern=security
```

### Chạy npm audit

```bash
# Audit tất cả services
for service in auth order restaurant payment-service notification-service admin-service food-delivery-server; do
  echo "Auditing $service..."
  cd $service && npm audit && cd ..
done

# Audit với fix tự động
npm audit fix
```

### Chạy Trivy Scan

```bash
# Scan filesystem
trivy fs . --severity HIGH,CRITICAL

# Scan Docker image
trivy image fastfood-auth:latest
```

---

## 📊 CI/CD Security Jobs

### Job 6: Security Scan

```yaml
security:
  name: 🔒 Security Scan
  runs-on: ubuntu-latest
  steps:
    - npm audit (all services)
    - Trivy vulnerability scanner
    - Upload SARIF to GitHub Security
```

### Job 6b: CodeQL Analysis

```yaml
codeql-analysis:
  name: 🔬 CodeQL Security Analysis
  steps:
    - Initialize CodeQL
    - Autobuild
    - Perform CodeQL Analysis
```

---

## 🔍 Security Scan Reports

### npm audit Report

```
security-reports/
├── npm-audit-auth.json
├── npm-audit-order.json
├── npm-audit-restaurant.json
├── npm-audit-payment-service.json
├── npm-audit-notification-service.json
├── npm-audit-admin-service.json
├── npm-audit-food-delivery-server.json
└── npm-audit-summary.md
```

### Trivy Report

```
security-reports/
└── trivy-results.json
```

---

## 🎯 Security Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Critical Vulnerabilities | 0 | 🚨 Block deployment |
| High Vulnerabilities | < 5 | ⚠️ Fix within 7 days |
| Medium Vulnerabilities | < 20 | 📝 Fix within 30 days |
| Security Test Pass Rate | 100% | Required |

---

## 🛠️ Fixing Vulnerabilities

### npm audit fix

```bash
# Fix automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force

# View what would be fixed
npm audit fix --dry-run
```

### Manual Fix

1. Check vulnerability details in npm audit
2. Update package version in package.json
3. Run npm install
4. Test the application
5. Commit changes

---

## 📚 OWASP Top 10 Coverage

| Rank | Category | Coverage |
|------|----------|----------|
| A01 | Broken Access Control | ✅ 4 tests |
| A02 | Cryptographic Failures | ✅ Password hashing |
| A03 | Injection | ✅ 8 tests (NoSQL + XSS) |
| A04 | Insecure Design | ⏳ Planned |
| A05 | Security Misconfiguration | ✅ Headers tests |
| A06 | Vulnerable Components | ✅ npm audit |
| A07 | Auth Failures | ✅ 5 tests |
| A08 | Data Integrity Failures | ✅ Input validation |
| A09 | Logging Failures | ⏳ Planned |
| A10 | SSRF | ⏳ Planned |

---

## 🔗 Tài Liệu Liên Quan

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Trivy documentation](https://aquasecurity.github.io/trivy/)
- [CodeQL documentation](https://codeql.github.com/docs/)

---

*Cập nhật lần cuối: 03/12/2025*
