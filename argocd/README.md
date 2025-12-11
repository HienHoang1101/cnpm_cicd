# 🚀 ArgoCD Setup Guide

## 📋 Overview

ArgoCD provides GitOps continuous delivery for Kubernetes. This setup enables:
- Automated deployment from Git
- Self-healing applications
- Rollback capabilities
- Multi-environment management

## 🔧 Installation

### Step 1: Install ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### Step 2: Access ArgoCD UI

**Option A: Port Forward (Quick)**
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Access: https://localhost:8080
```

**Option B: NodePort (Minikube/Kind)**
```bash
kubectl apply -f argocd/install.yaml
# Access: http://<node-ip>:30080
```

**Option C: Ingress (Production)**
```bash
kubectl apply -f argocd/install.yaml
# Access: https://argocd.fastfood.local
```

### Step 3: Get Initial Password

```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo

# Login credentials:
# Username: admin
# Password: <output from above command>
```

### Step 4: Install ArgoCD CLI (Optional)

**Windows (PowerShell):**
```powershell
$version = (Invoke-RestMethod https://api.github.com/repos/argoproj/argo-cd/releases/latest).tag_name
$url = "https://github.com/argoproj/argo-cd/releases/download/" + $version + "/argocd-windows-amd64.exe"
Invoke-WebRequest -Uri $url -OutFile argocd.exe
Move-Item .\argocd.exe C:\Windows\System32\argocd.exe
```

**Linux/Mac:**
```bash
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/
```

### Step 5: Login via CLI

```bash
# Port forward first
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login
argocd login localhost:8080 --username admin --password <password> --insecure

# Change password
argocd account update-password
```

## 📦 Deploy Applications

### Deploy Development Environment

```bash
# Create development application
kubectl apply -f argocd/applications/fastfood-dev.yaml

# Check status
argocd app get fastfood-dev

# Sync manually (if not auto-sync)
argocd app sync fastfood-dev

# Watch sync progress
argocd app wait fastfood-dev --health
```

### Deploy Production Environment

```bash
# Create production project first
kubectl apply -f argocd/projects/fastfood-production.yaml

# Create production application
kubectl apply -f argocd/applications/fastfood-prod.yaml

# Check status
argocd app get fastfood-prod

# Manual sync (production requires approval)
argocd app sync fastfood-prod
```

## 🎯 ArgoCD Features

### Auto-Sync
- **Development**: Enabled - Auto-deploys on Git push
- **Production**: Enabled with manual prune - Requires approval for deletions

### Self-Healing
- Automatically reverts manual changes to match Git state
- Ensures cluster state matches desired state

### Rollback
```bash
# View history
argocd app history fastfood-prod

# Rollback to previous version
argocd app rollback fastfood-prod <revision-number>
```

### Sync Waves
Applications sync in order based on annotations:
```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"  # Database first
    argocd.argoproj.io/sync-wave: "2"  # Services second
```

## 🔍 Monitoring & Troubleshooting

### Check Application Status

```bash
# List all applications
argocd app list

# Get detailed status
argocd app get fastfood-dev

# View sync status
argocd app sync-status fastfood-dev

# View application logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server
```

### Common Issues

**1. Application OutOfSync**
```bash
# Check differences
argocd app diff fastfood-dev

# Force sync
argocd app sync fastfood-dev --force
```

**2. Sync Failed**
```bash
# View sync errors
argocd app get fastfood-dev

# Check events
kubectl get events -n fastfood-dev --sort-by='.lastTimestamp'
```

**3. Health Check Failed**
```bash
# Check pod status
kubectl get pods -n fastfood-dev

# View pod logs
kubectl logs -n fastfood-dev <pod-name>
```

## 🔐 Security Best Practices

### 1. Change Default Password
```bash
argocd account update-password
```

### 2. Enable SSO (Optional)
Edit `argocd-cm` ConfigMap:
```yaml
data:
  url: https://argocd.fastfood.com
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: $GITHUB_CLIENT_ID
          clientSecret: $GITHUB_CLIENT_SECRET
```

### 3. RBAC Configuration
```bash
# Create read-only user
argocd account create developer --account-type user

# Set password
argocd account update-password --account developer
```

## 📊 Integration with CI/CD

### GitHub Actions Integration

Add to `.github/workflows/ci-cd.yml`:

```yaml
- name: Trigger ArgoCD Sync
  run: |
    argocd login ${{ secrets.ARGOCD_SERVER }} \
      --username ${{ secrets.ARGOCD_USERNAME }} \
      --password ${{ secrets.ARGOCD_PASSWORD }} \
      --insecure
    
    argocd app sync fastfood-prod --force
    argocd app wait fastfood-prod --health
```

### Image Updater (Automatic)

Install ArgoCD Image Updater:
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```

Annotate application:
```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: auth=ghcr.io/hienhoang1101/fastfood/auth-service
    argocd-image-updater.argoproj.io/auth.update-strategy: latest
```

## 🎓 Next Steps

1. ✅ **Helm Charts** - Created
2. ✅ **ArgoCD** - Installed
3. ⏭️ **Cert-Manager** - Next section

## 📚 Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Best Practices](https://www.gitops.tech/)
- [Helm Documentation](https://helm.sh/docs/)

---

**Maintained by:** FastFood DevOps Team  
**Last Updated:** December 2024
