# Kubernetes Telegram Alerting Setup

## Tổng quan

Hệ thống alert Telegram cho K8s bao gồm:
- **Alertmanager**: Nhận alerts từ Prometheus và gửi tới Telegram
- **Grafana Alerting**: Gửi alerts trực tiếp tới Telegram (stress test alerts)

## Thông tin cấu hình

```
Telegram Bot Token: 8286318328:AAFXLEhcgky5Tk3SeV4kRw5K9WnBcnXWtgE
Telegram Chat ID: 8257336416
```

## Deploy lên Kubernetes

### 1. Deploy Alertmanager

```bash
# Apply Alertmanager (ConfigMap + Secret + Deployment + Service)
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Kiểm tra Alertmanager đã chạy
kubectl get pods -n monitoring -l app=alertmanager
kubectl logs -n monitoring -l app=alertmanager
```

### 2. Deploy Grafana Alerting ConfigMap

```bash
# Apply Grafana alerting ConfigMap
kubectl apply -f k8s/monitoring/grafana-telegram-alerting.yaml

# Restart Grafana để load cấu hình mới
kubectl rollout restart deployment/grafana -n monitoring
kubectl rollout status deployment/grafana -n monitoring
```

### 3. Apply Prometheus config update

```bash
# Apply cấu hình Prometheus cập nhật (đã có Alertmanager endpoint)
kubectl apply -f k8s/monitoring/prometheus-config.yaml

# Restart Prometheus
kubectl rollout restart deployment/prometheus -n monitoring
```

### 4. Kiểm tra kết nối

```bash
# Test Alertmanager
kubectl port-forward svc/alertmanager 9093:9093 -n monitoring
# Mở browser: http://localhost:9093

# Test Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring
# Mở browser: http://localhost:3000
# Login: admin / FastFood@2025!
```

## Danh sách Alerts

### Stress Test Alerts (Grafana)

| Alert | Trigger | Severity |
|-------|---------|----------|
| High Log Volume | > 10,000 logs/phút trong 1 phút | Warning |
| Extreme Log Volume | > 50,000 logs/phút trong 30s | Critical |
| High Error Rate | > 1,000 errors trong 5 phút | Critical |
| High CPU Usage | > 80% trong 5 phút | Warning |
| High Memory Usage | > 85% trong 5 phút | Warning |

### Infrastructure Alerts (Prometheus → Alertmanager)

Được định nghĩa trong `prometheus-rules.yaml`:
- Service Down
- High Response Time
- Test Failures
- Low Coverage

## Test Telegram Notifications

### Cách 1: Dùng curl từ trong cluster

```bash
# Tạo test pod
kubectl run test-curl --rm -it --restart=Never --image=curlimages/curl:latest -- sh

# Trong pod, gửi test alert
curl -X POST http://alertmanager:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "service": "test-service"
    },
    "annotations": {
      "summary": "This is a test alert from Kubernetes",
      "description": "Testing Telegram notification"
    }
  }]'
```

### Cách 2: Port-forward và test local

```bash
# Port forward Alertmanager
kubectl port-forward svc/alertmanager 9093:9093 -n monitoring

# Gửi test alert
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "K8sTestAlert",
      "severity": "critical",
      "service": "kubernetes-test"
    },
    "annotations": {
      "summary": "Kubernetes alert test successful!",
      "description": "Telegram integration working!"
    }
  }]'
```

## Giám sát Stress Test

Khi chạy stress test (giả lập nhiều log), Grafana sẽ tự động:

1. **Phát hiện** log volume tăng cao (> 10,000 logs/phút)
2. **Gửi alert** tới Telegram với severity tương ứng
3. **Tự động resolve** khi log volume giảm xuống

### Mô phỏng stress test

```bash
# Tạo nhiều log để test alert
kubectl run stress-log-test --rm -it --restart=Never --image=busybox -- sh -c '
for i in $(seq 1 15000); do
  echo "Stress test log entry $i - $(date)"
done
'
```

## Troubleshooting

### Không nhận được Telegram alerts

1. **Kiểm tra Alertmanager logs**:
   ```bash
   kubectl logs -n monitoring -l app=alertmanager -f
   ```

2. **Kiểm tra Grafana alerting**:
   - Vào Grafana → Alerting → Contact points
   - Click "Test" trên telegram-alerts

3. **Kiểm tra Secret đã mount**:
   ```bash
   kubectl exec -it deployment/alertmanager -n monitoring -- cat /etc/alertmanager/secrets/bot-token
   ```

### Grafana không load alerting config

```bash
# Kiểm tra ConfigMap
kubectl describe configmap grafana-alerting -n monitoring

# Kiểm tra mount trong Grafana
kubectl exec -it deployment/grafana -n monitoring -- ls -la /etc/grafana/provisioning/alerting/
```

## Cấu trúc Files

```
k8s/monitoring/
├── alertmanager.yaml           # Alertmanager deployment với Telegram
├── grafana.yaml                # Grafana deployment (đã update mount alerting)
├── grafana-telegram-alerting.yaml  # Grafana alerting rules + contact points
├── prometheus.yaml             # Prometheus deployment
├── prometheus-config.yaml      # Prometheus config (đã kết nối Alertmanager)
└── prometheus-rules.yaml       # Prometheus alert rules
```
