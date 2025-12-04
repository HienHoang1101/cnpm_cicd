# Hướng dẫn cấu hình Alert & Notification trong Grafana

## 1. Truy cập Grafana
- URL: http://34.177.101.213
- Login: `admin` / `FastFood@2025!`

## 2. Cấu hình Contact Points (Kênh thông báo)

### 2.1. Email Notification
1. Vào **Alerting** → **Contact points**
2. Click **Add contact point**
3. Chọn Type: **Email**
4. Điền:
   - Name: `Email Team`
   - Addresses: `your-email@example.com`
5. Click **Save contact point**

### 2.2. Discord Notification
1. Trong Discord, tạo Webhook cho channel
2. Trong Grafana: **Alerting** → **Contact points** → **Add contact point**
3. Chọn Type: **Discord**
4. Điền Webhook URL từ Discord
5. Save

### 2.3. Slack Notification
1. Tạo Slack Webhook URL
2. Trong Grafana: **Alerting** → **Contact points** → **Add contact point**
3. Chọn Type: **Slack**
4. Điền Webhook URL
5. Save

## 3. Cấu hình Alert Rules

### 3.1. Alert khi Test Fail Rate > 20%
1. Vào **Alerting** → **Alert rules** → **New alert rule**
2. Query:
   ```
   (test_failed / test_total) * 100 > 20
   ```
3. Set thresholds và conditions
4. Chọn Contact point
5. Save

### 3.2. Alert khi Service Down
1. Tạo alert rule mới
2. Query:
   ```
   test_total == 0
   ```
3. Set condition: `WHEN last() OF A IS equal to 0`
4. Message: "Service {{ $labels.service }} is DOWN!"

## 4. Các Alert đã cấu hình sẵn

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Test Failure | Fail rate > 20% | Warning |
| Service Down | total = 0 | Critical |
| Low Coverage | coverage < 10% | Warning |
| Security Issues | vulnerabilities > 0 | Warning |

## 5. Test Notification

### Gửi metrics để trigger alert:
```powershell
# Trigger High Failure Rate Alert
$body = @{
    service = "demo-service"
    total = 10
    passed = 2
    failed = 8  # 80% fail rate
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://34.124.252.97:9091/metrics" `
  -Method POST -Body $body -ContentType "application/json"
```

## 6. Xem Alert History
- Vào **Alerting** → **Alert rules**
- Click vào rule để xem history
- Hoặc vào **Alerting** → **Silences** để tạm dừng alert

## 7. Grafana Unified Alerting
- Grafana 9+ sử dụng Unified Alerting
- Có thể tạo alert từ bất kỳ panel nào
- Right-click panel → **More** → **New alert rule**
