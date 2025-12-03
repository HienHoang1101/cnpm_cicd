# 🔔 Alertmanager Configuration Guide

## Overview

Alertmanager xử lý alerts được gửi từ Prometheus và route chúng đến các receivers như Slack, Email.

## 📋 Quick Setup

### 1. Tạo Secrets File

```bash
# Copy file mẫu
cp monitoring/alertmanager/secrets.env.example monitoring/alertmanager/secrets.env

# Edit với credentials thực của bạn
nano monitoring/alertmanager/secrets.env
```

**⚠️ QUAN TRỌNG:** File `secrets.env` chứa credentials và KHÔNG được commit lên git!

### 2. Slack Configuration

#### Bước 1: Tạo Slack App
1. Truy cập https://api.slack.com/apps
2. Click **"Create New App"** → **"From Scratch"**
3. Đặt tên app: `FastFood Alerts`
4. Chọn workspace của bạn

#### Bước 2: Enable Incoming Webhooks
1. Trong app settings, vào **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** → ON
3. Click **"Add New Webhook to Workspace"**
4. Chọn channel (e.g., `#fastfood-alerts`)
5. Copy Webhook URL

#### Bước 3: Cập nhật config
Mở `monitoring/alertmanager/alertmanager.yml` và thay thế:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

### 2. Email Configuration (Gmail)

#### Bước 1: Bật 2-Factor Authentication
1. Truy cập https://myaccount.google.com/security
2. Enable **"2-Step Verification"**

#### Bước 2: Tạo App Password
1. Truy cập https://myaccount.google.com/apppasswords
2. Select app: **"Mail"**
3. Select device: **"Other"** → nhập "Alertmanager"
4. Copy 16-character password

#### Bước 3: Cập nhật config
Mở `monitoring/alertmanager/alertmanager.yml` và thay thế:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'your-email@gmail.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-16-char-app-password'
```

Và cập nhật email nhận alerts:

```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@your-company.com'
```

### 3. Restart Alertmanager

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

### 4. Verify Configuration

```bash
# Check logs
docker logs alertmanager --tail 20

# Check health
curl http://localhost:9093/-/healthy
```

## 🎯 Alert Routing

| Severity | Receiver | Channels |
|----------|----------|----------|
| Critical | `critical-alerts` | Slack + Email |
| Warning | `slack-notifications` | Slack only |
| Database | `slack-notifications` | Slack only |

## 📱 Alert Channels

### Slack Channels (Recommended)
- `#fastfood-alerts` - General alerts
- `#fastfood-critical` - Critical alerts only

### Email Recipients
- Update `to:` field in `alertmanager.yml`
- Có thể thêm nhiều email, phân cách bằng `,`

## 🧪 Test Alerts

### Cách 1: Trigger test alert qua Prometheus
1. Dừng một service: `docker stop auth-service`
2. Đợi ~1 phút, alert sẽ được gửi
3. Khởi động lại: `docker start auth-service`

### Cách 2: Trigger manual alert
```bash
# Gửi test alert
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "service": "test"
    },
    "annotations": {
      "summary": "This is a test alert",
      "description": "Testing Alertmanager configuration"
    }
  }]'
```

## 📊 Alert Rules

Current alert rules trong `prometheus/alert.rules.yml`:

| Alert | Condition | Severity |
|-------|-----------|----------|
| ServiceDown | Service không response | critical |
| MongoDBDown | MongoDB không kết nối được | critical |
| RedisDown | Redis không kết nối được | critical |
| HighResponseTime | Response > 2s | warning |

## 🔧 Troubleshooting

### Alertmanager không start
```bash
# Check logs
docker logs alertmanager

# Validate config
docker exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

### Không nhận được Slack notifications
1. Verify webhook URL đúng
2. Check channel tồn tại
3. Verify app có permission post messages

### Không nhận được Email
1. Verify App Password đúng (16 ký tự, không có space)
2. Check email address đúng format
3. Check spam folder
4. Verify "Less secure app access" không cần thiết với App Password

## 🔗 Useful Links

- **Alertmanager UI**: http://localhost:9093
- **Prometheus Alerts**: http://localhost:9090/alerts
- **Grafana**: http://localhost:3001

## 📁 File Structure

```
monitoring/alertmanager/
├── alertmanager.yml          # Main config
├── templates/
│   ├── email.tmpl           # Email templates
│   └── slack.tmpl           # Slack templates
```

## 🔄 Reload Config Without Restart

```bash
# Reload config dynamically
curl -X POST http://localhost:9093/-/reload
```
