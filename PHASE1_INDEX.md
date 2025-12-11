# 📑 Phase 1 - Documentation Index

## 🎯 Bắt Đầu Nhanh

### Cho người mới bắt đầu
👉 **[QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md)** - Deploy trong 15 phút

### Cho người có kinh nghiệm
👉 **[PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md)** - Hướng dẫn chi tiết

### Tổng quan hoàn chỉnh
👉 **[DEVOPS_PHASE1_COMPLETE.md](DEVOPS_PHASE1_COMPLETE.md)** - Tài liệu đầy đủ

### Tóm tắt
👉 **[PHASE1_SUMMARY.md](PHASE1_SUMMARY.md)** - Tổng kết Phase 1

## 📦 Components Documentation

### 1. Helm Charts
📁 **Location:** `helm/fastfood/`  
📖 **Documentation:** [helm/fastfood/README.md](helm/fastfood/README.md)

**Files:**
- `Chart.yaml` - Chart metadata
- `values.yaml` - Default configuration
- `values-dev.yaml` - Development overrides
- `values-prod.yaml` - Production overrides
- `templates/` - Kubernetes manifests

**What it does:**
- Package management cho Kubernetes
- Multi-environment configuration
- Auto-scaling setup
- Resource management

### 2. ArgoCD (GitOps)
📁 **Location:** `argocd/`  
📖 **Documentation:** [argocd/README.md](argocd/README.md)

**Files:**
- `install.yaml` - Installation manifest
- `applications/fastfood-dev.yaml` - Dev application
- `applications/fastfood-prod.yaml` - Prod application
- `projects/fastfood-production.yaml` - Production project

**What it does:**
- GitOps continuous delivery
- Automated deployment from Git
- Self-healing applications
- Rollback capabilities

### 3. Cert-Manager (TLS)
📁 **Location:** `cert-manager/`  
📖 **Documentation:** [cert-manager/README.md](cert-manager/README.md)

**Files:**
- `install.yaml` - Installation manifest
- `cluster-issuer-staging.yaml` - Staging issuer
- `cluster-issuer-prod.yaml` - Production issuer
- `cluster-issuer-dns01.yaml` - DNS-01 issuer
- `certificate-example.yaml` - Example certificate

**What it does:**
- Automated TLS certificate issuance
- Let's Encrypt integration
- Auto-renewal before expiration
- Wildcard certificate support

## 🚀 Deployment Scripts

### Windows (PowerShell)
📄 **Script:** `scripts/deploy-phase1.ps1`

```powershell
# Deploy all to dev
.\scripts\deploy-phase1.ps1 -Environment dev

# Deploy all to prod
.\scripts\deploy-phase1.ps1 -Environment prod

# Deploy specific component
.\scripts\deploy-phase1.ps1 -Component argocd -Environment dev
```

### Linux/Mac (Bash)
📄 **Script:** `scripts/deploy-phase1.sh`

```bash
# Deploy all to dev
./scripts/deploy-phase1.sh --environment dev

# Deploy all to prod
./scripts/deploy-phase1.sh --environment prod

# Deploy specific component
./scripts/deploy-phase1.sh --component argocd --environment dev
```

## 📚 Documentation by Use Case

### "Tôi muốn deploy nhanh"
→ [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md)

### "Tôi muốn hiểu chi tiết"
→ [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md)

### "Tôi muốn customize Helm chart"
→ [helm/fastfood/README.md](helm/fastfood/README.md)

### "Tôi muốn setup ArgoCD"
→ [argocd/README.md](argocd/README.md)

### "Tôi muốn setup TLS certificates"
→ [cert-manager/README.md](cert-manager/README.md)

### "Tôi gặp lỗi"
→ Troubleshooting sections trong mỗi README

### "Tôi muốn xem tổng quan"
→ [DEVOPS_PHASE1_COMPLETE.md](DEVOPS_PHASE1_COMPLETE.md)

## 🎓 Learning Path

### Level 1: Beginner
1. Đọc [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md)
2. Run deployment script
3. Verify deployment
4. Access ArgoCD UI

### Level 2: Intermediate
1. Đọc [PHASE1_DEPLOYMENT.md](PHASE1_DEPLOYMENT.md)
2. Understand Helm charts
3. Customize values files
4. Deploy to production

### Level 3: Advanced
1. Đọc component READMEs
2. Modify Helm templates
3. Configure ArgoCD projects
4. Setup DNS-01 certificates
5. Integrate with CI/CD

## 🔍 Quick Reference

### Common Commands

**Helm:**
```bash
helm list -A
helm status fastfood -n fastfood-dev
helm upgrade fastfood ./helm/fastfood
helm rollback fastfood -n fastfood-dev
```

**ArgoCD:**
```bash
argocd app list
argocd app get fastfood-dev
argocd app sync fastfood-dev
argocd app rollback fastfood-dev
```

**Cert-Manager:**
```bash
kubectl get certificate -A
kubectl get clusterissuer
kubectl describe certificate fastfood-tls -n fastfood
```

**Kubernetes:**
```bash
kubectl get pods -n fastfood-dev
kubectl logs <pod> -n fastfood-dev
kubectl describe pod <pod> -n fastfood-dev
kubectl get events -n fastfood-dev
```

## 📊 File Structure

```
Phase 1 Files:
├── Documentation (Root)
│   ├── QUICKSTART_PHASE1.md          # Quick start guide
│   ├── PHASE1_DEPLOYMENT.md           # Detailed guide
│   ├── DEVOPS_PHASE1_COMPLETE.md      # Complete overview
│   ├── PHASE1_SUMMARY.md              # Summary
│   └── PHASE1_INDEX.md                # This file
│
├── helm/fastfood/                     # Helm Charts
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-prod.yaml
│   ├── README.md
│   └── templates/
│       ├── _helpers.tpl
│       ├── namespace.yaml
│       ├── configmap.yaml
│       ├── secrets.yaml
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       └── hpa.yaml
│
├── argocd/                            # ArgoCD
│   ├── README.md
│   ├── install.yaml
│   ├── applications/
│   │   ├── fastfood-dev.yaml
│   │   └── fastfood-prod.yaml
│   └── projects/
│       └── fastfood-production.yaml
│
├── cert-manager/                      # Cert-Manager
│   ├── README.md
│   ├── install.yaml
│   ├── cluster-issuer-staging.yaml
│   ├── cluster-issuer-prod.yaml
│   ├── cluster-issuer-dns01.yaml
│   └── certificate-example.yaml
│
└── scripts/                           # Deployment Scripts
    ├── deploy-phase1.sh               # Bash script
    └── deploy-phase1.ps1              # PowerShell script
```

## ✅ Checklist

### Before Deployment
- [ ] Kubernetes cluster running
- [ ] kubectl configured
- [ ] Helm 3.8+ installed
- [ ] Git repository cloned

### After Deployment
- [ ] All pods running
- [ ] Services accessible
- [ ] ArgoCD UI accessible
- [ ] Certificates ready
- [ ] Documentation read

### Production Readiness
- [ ] DNS configured
- [ ] TLS certificates issued
- [ ] Monitoring setup
- [ ] Backup configured
- [ ] Team trained

## 🆘 Getting Help

### Documentation
- Start with [QUICKSTART_PHASE1.md](QUICKSTART_PHASE1.md)
- Check component READMEs for specific issues
- Review troubleshooting sections

### Common Issues
- **Pods not starting:** Check logs with `kubectl logs`
- **ArgoCD not syncing:** Force sync with `argocd app sync`
- **Certificates not issuing:** Check ClusterIssuer status

### Support Channels
- GitHub Issues: https://github.com/HienHoang1101/cnpm_cicd/issues
- DevOps Team: devops@fastfood.com
- Documentation: This index

## 🎯 Success Criteria

Phase 1 is successful when:
- ✅ All 6 microservices deployed
- ✅ Auto-scaling working
- ✅ ArgoCD managing deployments
- ✅ Cert-Manager ready
- ✅ Can deploy via Git push
- ✅ Can rollback deployments
- ✅ TLS certificates working

## ⏭️ What's Next?

After completing Phase 1:
1. **Phase 2:** External Secrets + Velero Backup
2. **Phase 3:** Service Mesh (Istio) + Distributed Tracing
3. Configure monitoring alerts
4. Set up CI/CD integration
5. Train team on GitOps workflow

## 📞 Contact

**Maintained by:** FastFood DevOps Team  
**Created:** December 2024  
**Last Updated:** December 2024  
**Version:** 1.0.0

---

**Quick Links:**
- [Quick Start](QUICKSTART_PHASE1.md) | [Full Guide](PHASE1_DEPLOYMENT.md) | [Complete Docs](DEVOPS_PHASE1_COMPLETE.md) | [Summary](PHASE1_SUMMARY.md)
