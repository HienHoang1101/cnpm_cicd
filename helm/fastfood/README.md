# FastFood Delivery Helm Chart

## 📋 Overview

Helm chart để deploy FastFood Delivery microservices platform lên Kubernetes.

## 🚀 Quick Start

### Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured

### Installation

```bash
# Add Bitnami repository (for dependencies)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Update dependencies
helm dependency update

# Install to development
helm install fastfood . \
  --namespace fastfood-dev \
  --create-namespace \
  --values values.yaml \
  --values values-dev.yaml

# Install to production
helm install fastfood . \
  --namespace fastfood \
  --create-namespace \
  --values values.yaml \
  --values values-prod.yaml
```

## 📦 Chart Structure

```
fastfood/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-dev.yaml         # Development overrides
├── values-prod.yaml        # Production overrides
├── templates/
│   ├── _helpers.tpl        # Template helpers
│   ├── namespace.yaml      # Namespace
│   ├── configmap.yaml      # ConfigMaps
│   ├── secrets.yaml        # Secrets
│   ├── deployment.yaml     # Deployments
│   ├── service.yaml        # Services
│   ├── ingress.yaml        # Ingress
│   └── hpa.yaml           # HorizontalPodAutoscaler
└── charts/                 # Dependencies (MongoDB, Redis)
```

## ⚙️ Configuration

### Services

Chart deploys 6 microservices:
- **auth-service** (Port 5001) - Authentication & Authorization
- **order-service** (Port 5002) - Order management
- **restaurant-service** (Port 5003) - Restaurant & menu management
- **payment-service** (Port 5005) - Payment processing
- **notification-service** (Port 5006) - Notifications
- **admin-service** (Port 5008) - Admin operations

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Kubernetes namespace | `fastfood` |
| `global.environment` | Environment name | `production` |
| `global.imageRegistry` | Container registry | `ghcr.io` |
| `authService.replicaCount` | Auth service replicas | `2` |
| `authService.image.tag` | Image tag | `latest` |
| `authService.resources.requests.memory` | Memory request | `128Mi` |
| `authService.resources.limits.memory` | Memory limit | `256Mi` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class | `nginx` |
| `mongodb.enabled` | Deploy MongoDB | `true` |
| `redis.enabled` | Deploy Redis | `true` |

### Environment-Specific Values

**Development (`values-dev.yaml`):**
- 1 replica per service
- Reduced resources
- Auto-scaling disabled
- Smaller database sizes

**Production (`values-prod.yaml`):**
- 3+ replicas per service
- Full resources
- Auto-scaling enabled
- Larger database sizes
- TLS enabled

## 🔧 Customization

### Override Values

Create custom values file:

```yaml
# custom-values.yaml
authService:
  replicaCount: 5
  image:
    tag: v1.2.3
  resources:
    requests:
      memory: "256Mi"
      cpu: "200m"

ingress:
  hosts:
    - host: api.mycompany.com
```

Install with custom values:
```bash
helm install fastfood . \
  --values values.yaml \
  --values custom-values.yaml
```

### Update Secrets

```bash
# Create secrets file (don't commit!)
cat > secrets.yaml <<EOF
secrets:
  jwtSecret: "my-super-secret-jwt-key"
  mongodbPassword: "secure-mongodb-password"
EOF

# Install with secrets
helm install fastfood . \
  --values values.yaml \
  --values secrets.yaml
```

### External Database

To use external MongoDB/Redis:

```yaml
# Disable built-in databases
mongodb:
  enabled: false

redis:
  enabled: false

# Configure external connections
externalMongodb:
  uri: "mongodb://user:pass@external-mongo:27017/fastfood"

externalRedis:
  uri: "redis://external-redis:6379"
```

## 📊 Monitoring

### Prometheus Integration

Services expose metrics on `/metrics` endpoint:

```yaml
# Prometheus scrape annotations
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "5001"
  prometheus.io/path: "/metrics"
```

Enable ServiceMonitor:
```yaml
serviceMonitor:
  enabled: true
  interval: 30s
```

## 🔄 Upgrades

### Upgrade Release

```bash
# Upgrade with new values
helm upgrade fastfood . \
  --namespace fastfood \
  --values values.yaml \
  --values values-prod.yaml

# Upgrade with new image tag
helm upgrade fastfood . \
  --namespace fastfood \
  --set authService.image.tag=v1.2.3 \
  --set orderService.image.tag=v1.2.3
```

### Rollback

```bash
# View history
helm history fastfood -n fastfood

# Rollback to previous version
helm rollback fastfood -n fastfood

# Rollback to specific revision
helm rollback fastfood 3 -n fastfood
```

## 🗑️ Uninstallation

```bash
# Uninstall release
helm uninstall fastfood -n fastfood

# Delete namespace (optional)
kubectl delete namespace fastfood
```

## 🐛 Troubleshooting

### Check Release Status

```bash
helm status fastfood -n fastfood
helm get values fastfood -n fastfood
helm get manifest fastfood -n fastfood
```

### Debug Template Rendering

```bash
# Dry-run to see rendered templates
helm install fastfood . \
  --namespace fastfood \
  --values values.yaml \
  --dry-run --debug

# Template specific file
helm template fastfood . \
  --values values.yaml \
  --show-only templates/deployment.yaml
```

### Common Issues

**Issue: ImagePullBackOff**
```bash
# Check image exists
docker pull ghcr.io/hienhoang1101/fastfood/auth-service:latest

# Update imagePullPolicy
helm upgrade fastfood . --set authService.image.pullPolicy=Always
```

**Issue: CrashLoopBackOff**
```bash
# Check pod logs
kubectl logs -n fastfood <pod-name>

# Check environment variables
kubectl describe pod -n fastfood <pod-name>
```

## 📚 Dependencies

This chart depends on:
- **MongoDB** (Bitnami) - v13.x
- **Redis** (Bitnami) - v18.x

Update dependencies:
```bash
helm dependency update
helm dependency list
```

## 🔐 Security

### Best Practices

1. **Don't commit secrets** - Use External Secrets Operator
2. **Use specific image tags** - Avoid `latest` in production
3. **Enable network policies** - Restrict pod-to-pod communication
4. **Set resource limits** - Prevent resource exhaustion
5. **Enable PodDisruptionBudget** - Ensure availability during updates

### Security Context

Pods run with security context:
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  capabilities:
    drop:
      - ALL
```

## 📖 Examples

### Minimal Development Setup

```bash
helm install fastfood . \
  --namespace fastfood-dev \
  --create-namespace \
  --set authService.replicaCount=1 \
  --set orderService.replicaCount=1 \
  --set mongodb.persistence.enabled=false \
  --set redis.master.persistence.enabled=false
```

### Production with Custom Domain

```bash
helm install fastfood . \
  --namespace fastfood \
  --create-namespace \
  --values values-prod.yaml \
  --set ingress.hosts[0].host=api.mycompany.com \
  --set ingress.tls.enabled=true
```

### Update Single Service

```bash
helm upgrade fastfood . \
  --namespace fastfood \
  --reuse-values \
  --set authService.image.tag=v1.2.3
```

## 🤝 Contributing

To modify this chart:

1. Update templates in `templates/`
2. Update default values in `values.yaml`
3. Test with `helm lint .`
4. Test installation with `helm install --dry-run`
5. Document changes in this README

## 📄 License

MIT License

---

**Maintained by:** FastFood DevOps Team  
**Chart Version:** 1.0.0  
**App Version:** 1.0.0
