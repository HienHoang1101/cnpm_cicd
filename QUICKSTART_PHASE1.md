# ⚡ Phase 1 Quick Start Guide

## 🎯 Mục Tiêu
Deploy FastFood Delivery platform với Helm + ArgoCD + Cert-Manager trong 15 phút.

## 📋 Prerequisites

✅ Kubernetes cluster (Minikube/Kind/Docker Desktop/Cloud)  
✅ kubectl installed  
✅ Helm 3.8+ installed  
✅ Git repository access  

## 🚀 Deployment (3 Bước)

### Bước 1: Clone Repository
```bash
git clone https://github.com/HienHoang1101/cnpm_cicd.git
cd cnpm_cicd
```

### Bước 2: Run Deployment Script

**Windows:**
```powershell
.\scripts\deploy-phase1.ps1 -Environment dev
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-phase1.sh
./scripts/deploy-phase1.sh --environment dev
```

### Bước 3: Verify Deployment
```bash
# Check pods
kubectl get pods -n fastfood-dev

# Check services
kubectl get svc -n fastfood-dev

# Check ingress
kubectl get ingress -n fastfood-dev
```

## 🎉 Done!

Your platform is now running with:
- ✅ 6 microservices deployed
- ✅ Auto-scaling enabled
- ✅ ArgoCD managing deployments
- ✅ Cert-Manager ready for TLS

## 🔍 Access Services

### ArgoCD UI
```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

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

## 📊 Monitor Status

```bash
# Helm releases
helm list -A

# ArgoCD applications
kubectl get applications -n argocd

# Certificates
kubectl get certificate -A
```

## 🔄 Update Application

```bash
# Update Helm values
vim helm/fastfood/values-dev.yaml

# Commit to Git
git add .
git commit -m "Update configuration"
git push

# ArgoCD will auto-sync!
```

## 🐛 Troubleshooting

**Pods not starting?**
```bash
kubectl describe pod <pod-name> -n fastfood-dev
kubectl logs <pod-name> -n fastfood-dev
```

**ArgoCD not syncing?**
```bash
argocd app sync fastfood-dev --force
```

**Need help?**
- Read: `PHASE1_DEPLOYMENT.md`
- Check: `helm/fastfood/README.md`
- Check: `argocd/README.md`

## ⏭️ Next Steps

1. Configure your domain in `helm/fastfood/values-prod.yaml`
2. Deploy to production: `./scripts/deploy-phase1.sh --environment prod`
3. Set up monitoring dashboards
4. Proceed to Phase 2 (External Secrets + Velero)

---

**Time to Deploy:** ~15 minutes  
**Difficulty:** Easy  
**Support:** See documentation in `PHASE1_DEPLOYMENT.md`
