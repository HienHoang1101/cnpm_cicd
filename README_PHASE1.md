# 🚀 FastFood Delivery - Phase 1: GitOps & Automation

## 🎉 Phase 1 Đã Hoàn Thành!

Phase 1 triển khai thành công **Helm Charts + ArgoCD + Cert-Manager** cho FastFood Delivery platform.

## ⚡ Quick Start (15 phút)

```bash
# 1. Clone repository
git clone https://github.com/HienHoang1101/cnpm_cicd.git
cd cnpm_cicd

# 2. Deploy to development
./scripts/deploy-phase1.sh --environment dev

# 3. Verify
kubectl get pods -n fastfood-dev
```

**Windows:**
```powershell
.\scripts\deploy-phase1.ps1 -Environment dev
```

## 📦 Components

### 1. Helm Charts ✅
**Location:** `helm/fastfood/`

Package management cho 6 microservices:
- auth-service (5001)
- order-service (5002)
- restaurant-service (5003)
- payment-service (5005)
- notification-service (5006)
- admin-service (5008)

**Features:**
- Multi-environment (dev/prod)
- Auto-scaling (HPA)
- Resource management
- Health checks
- Prometheus metrics

### 2. ArgoCD (GitOps) ✅
**Location:** `argocd/`

Automated deployment from Git:
- Auto-sync from repository
- Self-healing applications
- One-click rollback
- Multi-environment support
- RBAC & project isolation

### 3. Cert-Manager (TLS) ✅
**Location:** `cert-manager/`

Automated TLS certificates:
- Let's Encrypt integration
- Auto-renewal (30 days before expiry)
- HTTP-01 & DNS-01 challenges
- Wildcard certificate support

## 📚 Documentation

| Document | Description | Time |
|----------|-------------|------|
| [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md) | Quick start guide | 15 min |
| [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md) | Detailed deployment | 30 min |
| [DEVOPS_PHASE1_COMPLETE.md](DEVOPS_PHASE1_COMPLETE.md) | Complete overview | 45 min |
| [PHASE1_INDEX.md](PHASE1_INDEX.md) | Documentation index | 5 min |
| [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md) | Summary | 10 min |

### Component Docs
- [Helm Charts](helm/fastfood/README.md)
- [ArgoCD](argocd/README.md)
- [Cert-Manager](cert-manager/README.md)

## 🎯 What You Get

### Before Phase 1
- ❌ Manual kubectl apply
- ❌ No version control for deployments
- ❌ Manual certificate management
- ❌ Inconsistent environments
- ❌ No rollback mechanism

### After Phase 1
- ✅ GitOps automated deployment
- ✅ Version-controlled infrastructure
- ✅ Automated TLS certificates
- ✅ Consistent dev/prod environments
- ✅ One-click rollback
- ✅ Auto-scaling enabled

## 🔧 Usage

### Deploy to Development
```bash
./scripts/deploy-phase1.sh --environment dev
```

### Deploy to Production
```bash
./scripts/deploy-phase1.sh --environment prod
```

### Deploy Specific Component
```bash
# Helm only
./scripts/deploy-phase1.sh --component helm --environment dev

# ArgoCD only
./scripts/deploy-phase1.sh --component argocd --environment dev

# Cert-Manager only
./scripts/deploy-phase1.sh --component cert-manager --environment dev
```

### Update Application
```bash
# 1. Update configuration
vim helm/fastfood/values-dev.yaml

# 2. Commit to Git
git add .
git commit -m "Update config"
git push

# 3. ArgoCD auto-syncs!
```

## 🔍 Access Services

### ArgoCD UI
```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Open: https://localhost:8080
# Username: admin
```

### Application Services
```bash
# Port forward auth service
kubectl port-forward svc/auth-service -n fastfood-dev 5001:5001

# Test
curl http://localhost:5001/health
```

## 📊 Architecture

```
┌─────────────────────────────────────┐
│       Git Repository                │
│    (Source of Truth)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│          ArgoCD                     │
│      (GitOps Engine)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Helm Charts                   │
│   (Package Management)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Kubernetes Cluster               │
│  ┌─────────────────────────────┐   │
│  │  6 Microservices (HPA 2-5)  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   Ingress (NGINX + TLS)     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Cert-Manager                  │
│   (TLS Automation)                  │
└─────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Pods not starting?
```bash
kubectl get pods -n fastfood-dev
kubectl describe pod <pod-name> -n fastfood-dev
kubectl logs <pod-name> -n fastfood-dev
```

### ArgoCD not syncing?
```bash
argocd app get fastfood-dev
argocd app sync fastfood-dev --force
```

### Certificate not issuing?
```bash
kubectl get certificate -n fastfood
kubectl describe certificate fastfood-tls -n fastfood
kubectl logs -n cert-manager -l app=cert-manager
```

## 📈 Monitoring

```bash
# Helm releases
helm list -A

# ArgoCD applications
kubectl get applications -n argocd

# Certificates
kubectl get certificate -A

# Pods status
kubectl get pods -n fastfood-dev
```

## ✅ Success Criteria

Phase 1 is complete when:
- ✅ All 6 microservices deployed
- ✅ Auto-scaling working (HPA)
- ✅ ArgoCD managing deployments
- ✅ Cert-Manager ready
- ✅ Can deploy via Git push
- ✅ Can rollback deployments
- ✅ TLS certificates working

## ⏭️ Next Steps

### Phase 2 (Coming Soon)
1. **External Secrets Operator**
   - HashiCorp Vault integration
   - Automated secret rotation
   
2. **Velero Backup**
   - Automated cluster backups
   - Disaster recovery
   
3. **Service Mesh (Istio)**
   - Traffic management
   - Circuit breaker
   - mTLS between services

## 📞 Support

**Documentation:**
- Quick Start: [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md)
- Full Guide: [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md)
- Index: [PHASE1_INDEX.md](PHASE1_INDEX.md)

**Issues:**
- GitHub: https://github.com/HienHoang1101/cnpm_cicd/issues
- Email: devops@fastfood.com

## 🎓 Learning Resources

- [Helm Documentation](https://helm.sh/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)
- [GitOps Guide](https://www.gitops.tech/)

## 📄 License

MIT License

---

**Status:** ✅ Complete  
**Version:** 1.0.0  
**Created:** December 2024  
**Maintained by:** FastFood DevOps Team

**Quick Links:**
[Quick Start](QUICKSTART_PHASE1.md) | [Full Guide](PHASE1_DEPLOYMENT.md) | [Index](PHASE1_INDEX.md) | [Summary](PHASE1_SUMMARY.md)
