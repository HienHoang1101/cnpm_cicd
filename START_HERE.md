# 🚀 START HERE - Phase 1 Quick Guide

## 👋 Chào mừng đến với Phase 1!

Phase 1 đã triển khai **Helm Charts + ArgoCD + Cert-Manager** cho FastFood Delivery platform.

## ⚡ Bắt Đầu Ngay (3 bước)

### 1️⃣ Chọn Hướng Dẫn Phù Hợp

| Bạn là ai? | Đọc file nào? | Thời gian |
|------------|---------------|-----------|
| 🆕 **Người mới** | [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md) | 15 phút |
| 👨‍💻 **Developer** | [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md) | 30 phút |
| 🏗️ **DevOps Engineer** | [DEVOPS_PHASE1_COMPLETE.md](DEVOPS_PHASE1_COMPLETE.md) | 45 phút |
| 📚 **Tìm tài liệu** | [PHASE1_INDEX.md](PHASE1_INDEX.md) | 5 phút |

### 2️⃣ Deploy Phase 1

**Windows:**
```powershell
.\scripts\deploy-phase1.ps1 -Environment dev
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-phase1.sh
./scripts/deploy-phase1.sh --environment dev
```

### 3️⃣ Verify

```bash
# Check pods
kubectl get pods -n fastfood-dev

# Access ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open: https://localhost:8080
```

## 📦 Đã Triển Khai Gì?

### ✅ Helm Charts
- Package management cho 6 microservices
- Multi-environment (dev/prod)
- Auto-scaling enabled
- 📖 [Docs](helm/fastfood/README.md)

### ✅ ArgoCD
- GitOps automated deployment
- Self-healing applications
- One-click rollback
- 📖 [Docs](argocd/README.md)

### ✅ Cert-Manager
- Automated TLS certificates
- Let's Encrypt integration
- Auto-renewal
- 📖 [Docs](cert-manager/README.md)

## 🎯 Lợi Ích

| Trước | Sau |
|-------|-----|
| ❌ Manual kubectl | ✅ GitOps automation |
| ❌ No version control | ✅ Git-based deployments |
| ❌ Manual certificates | ✅ Auto TLS |
| ❌ Inconsistent envs | ✅ Consistent dev/prod |
| ❌ No rollback | ✅ One-click rollback |

## 📚 Tài Liệu Đầy Đủ

### Hướng Dẫn Chính
1. [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md) - Quick start (15 min)
2. [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md) - Chi tiết (30 min)
3. [DEVOPS_PHASE1_COMPLETE.md](DEVOPS_PHASE1_COMPLETE.md) - Đầy đủ (45 min)
4. [PHASE1_INDEX.md](PHASE1_INDEX.md) - Index (5 min)
5. [PHASE1_SUMMARY.md](PHASE1_SUMMARY.md) - Tóm tắt (10 min)
6. [README_PHASE1.md](README_PHASE1.md) - README (10 min)

### Component Docs
- [Helm Charts](helm/fastfood/README.md)
- [ArgoCD](argocd/README.md)
- [Cert-Manager](cert-manager/README.md)

## 🔍 Common Tasks

### Deploy to Dev
```bash
./scripts/deploy-phase1.sh --environment dev
```

### Deploy to Prod
```bash
./scripts/deploy-phase1.sh --environment prod
```

### Update Config
```bash
# 1. Edit values
vim helm/fastfood/values-dev.yaml

# 2. Commit
git add . && git commit -m "Update" && git push

# 3. ArgoCD auto-syncs!
```

### Access ArgoCD
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Username: admin
# Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Check Status
```bash
# Pods
kubectl get pods -n fastfood-dev

# Helm releases
helm list -A

# ArgoCD apps
kubectl get applications -n argocd

# Certificates
kubectl get certificate -A
```

## 🐛 Gặp Vấn Đề?

### Pods không start?
```bash
kubectl describe pod <pod-name> -n fastfood-dev
kubectl logs <pod-name> -n fastfood-dev
```

### ArgoCD không sync?
```bash
argocd app sync fastfood-dev --force
```

### Certificate không issue?
```bash
kubectl describe certificate fastfood-tls -n fastfood
kubectl logs -n cert-manager -l app=cert-manager
```

## 📞 Cần Giúp Đỡ?

1. **Đọc docs:** [PHASE1_INDEX.md](PHASE1_INDEX.md)
2. **Check troubleshooting:** Trong mỗi component README
3. **GitHub Issues:** https://github.com/HienHoang1101/cnpm_cicd/issues
4. **Email:** devops@fastfood.com

## ⏭️ Tiếp Theo?

### Sau khi deploy thành công:
1. ✅ Verify tất cả services running
2. ✅ Access ArgoCD UI
3. ✅ Test certificate issuance
4. ✅ Configure monitoring
5. ✅ Train team on GitOps

### Phase 2 (Coming Soon):
- External Secrets Operator
- Velero Backup
- Service Mesh (Istio)

## 🎉 Chúc Mừng!

Bạn đã sẵn sàng sử dụng Phase 1!

**Quick Links:**
- [Quick Start](QUICKSTART_PHASE1.md)
- [Full Guide](PHASE1_DEPLOYMENT.md)
- [Index](PHASE1_INDEX.md)
- [Checklist](PHASE1_CHECKLIST.md)

---

**Created:** December 2024  
**Version:** 1.0.0  
**Team:** FastFood DevOps
