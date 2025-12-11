# 🔔 Alertmanager Configuration Guide

## Overview

Alertmanager xử lý alerts được gửi từ Prometheus và route chúng đến các receivers như Telegram, Slack, Email.

## 📋 Quick Setup

### 1. Tạo Secrets File

```bash
# Copy file mẫu
cp monitoring/alertmanager/secrets.env.example monitoring/alertmanager/secrets.env

# Edit với credentials thực của bạn
nano monitoring/alertmanager/secrets.env
```

**⚠️ QUAN TRỌNG:** File `secrets.env` chứa credentials và KHÔNG được commit lên git!

---

## 📱 Telegram Configuration (Recommended - Primary)

### Bước 1: Tạo Telegram Bot
1. Mở Telegram và tìm **@BotFather**
2. Gửi lệnh `/newbot`
3. Đặt tên bot (ví dụ: `FastFood Alerts Bot`)
4. Đặt username (ví dụ: `fastfood_alerts_bot`)
5. **Copy Bot Token** được cấp (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Bước 2: Lấy Chat ID

**Cách A: Tạo Group mới**
1. Tạo Telegram Group mới
2. Thêm bot vào group (tìm theo username)
3. Gửi một tin nhắn bất kỳ trong group
4. Truy cập URL: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
5. Tìm `"chat":{"id": -123456789}` trong response
6. **Chat ID là số âm cho group** (ví dụ: `-123456789`)

**Cách B: Chat trực tiếp với bot**
1. Mở chat với bot của bạn
2. Gửi `/start`
3. Truy cập: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Tìm chat ID (số dương cho private chat)

### Bước 3: Cập nhật Config
Mở `monitoring/alertmanager/alertmanager.yml` và thay thế:

```yaml
receivers:
  - name: 'telegram-notifications'
    telegram_configs:
      - bot_token: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'  # Your bot token
        chat_id: -123456789  # Your chat/group ID (integer)
```

### Bước 4: Test Telegram Bot
```bash
# Test gửi message
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage" \
  -d "chat_id=<YOUR_CHAT_ID>" \
  -d "text=🔔 Test alert from FastFood Monitoring"
```

---

## 💬 Slack Configuration (Backup)

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
| Critical | `critical-alerts` | Telegram + Slack |
| Warning | `telegram-notifications` | Telegram |
| Database | `telegram-notifications` | Telegram |

## 📱 Alert Channels

### Telegram (Primary - Recommended)
- Tạo Group riêng cho alerts
- Bot sẽ gửi thông báo real-time
- Hỗ trợ rich formatting với HTML

### Slack Channels (Backup)
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
├── secrets.env.example       # Secrets template
├── secrets.env               # Your secrets (DO NOT COMMIT)
├── templates/
│   ├── email.tmpl           # Email templates
│   ├── slack.tmpl           # Slack templates
│   └── telegram.tmpl        # Telegram templates
```

## 🔄 Reload Config Without Restart

```bash
# Reload config dynamically
curl -X POST http://localhost:9093/-/reload
```
