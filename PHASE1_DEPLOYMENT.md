# 🚀 Phase 1 Deployment Guide

## 📋 Overview

Phase 1 triển khai 3 components chính:
1. **Helm Charts** - Package management cho Kubernetes
2. **ArgoCD** - GitOps continuous delivery
3. **Cert-Manager** - Automated TLS certificate management

## ⚡ Quick Start

### Automated Deployment

**Windows (PowerShell):**
```powershell
# Deploy all components to development
.\scripts\deploy-phase1.ps1 -Environment dev

# Deploy all components to production
.\scripts\deploy-phase1.ps1 -Environment prod

# Deploy specific component
.\scripts\deploy-phase1.ps1 -Component argocd -Environment dev

# Skip confirmation
.\scripts\deploy-phase1.ps1 -Environment dev -SkipConfirmation
```

**Linux/Mac (Bash):**
```bash
# Make script executable
chmod +x scripts/deploy-phase1.sh

# Deploy all components to development
./scripts/deploy-phase1.sh --environment dev

# Deploy all components to production
./scripts/deploy-phase1.sh --environment prod

# Deploy specific component
./scripts/deploy-phase1.sh --component argocd --environment dev

# Skip confirmation
./scripts/deploy-phase1.sh --environment dev --yes
```

## 📦 Manual Deployment

### Step 1: Deploy Helm Charts

```bash
# Add Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Update dependencies
cd helm/fastfood
helm dependency update
cd ../..

# Deploy to development
helm upgrade --install fastfood ./helm/fastfood \
  --namespace fastfood-dev \
  --create-namespace \
  --values ./helm/fastfood/values.yaml \
  --values ./helm/fastfood/values-dev.yaml \
  --wait

# Deploy to production
helm upgrade --install fastfood ./helm/fastfood \
  --namespace fastfood \
  --create-namespace \
  --values ./helm/fastfood/values.yaml \
  --values ./helm/fastfood/values-prod.yaml \
  --wait
```

### Step 2: Deploy ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Apply custom configurations
kubectl apply -f argocd/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

**Access ArgoCD UI:**
```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser: https://localhost:8080
# Username: admin
# Password: (from command above)
```

### Step 3: Deploy Cert-Manager

```bash
# Install CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml

# Create namespace
kubectl create namespace cert-manager

# Install using Helm
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.13.3 \
  --set installCRDs=true \
  --wait

# Create ClusterIssuers
kubectl apply -f cert-manager/cluster-issuer-staging.yaml
kubectl apply -f cert-manager/cluster-issuer-prod.yaml
```

### Step 4: Deploy ArgoCD Applications

```bash
# Development
kubectl apply -f argocd/applications/fastfood-dev.yaml

# Production (create project first)
kubectl apply -f argocd/projects/fastfood-production.yaml
kubectl apply -f argocd/applications/fastfood-prod.yaml
```

## 🔍 Verification

### Check Helm Deployment

```bash
# List releases
helm list -A

# Check pods
kubectl get pods -n fastfood-dev
kubectl get pods -n fastfood

# Check services
kubectl get svc -n fastfood-dev
```

### Check ArgoCD

```bash
# Check pods
kubectl get pods -n argocd

# List applications
kubectl get applications -n argocd

# Check application status
kubectl describe application fastfood-dev -n argocd
```

### Check Cert-Manager

```bash
# Check pods
kubectl get pods -n cert-manager

# Check ClusterIssuers
kubectl get clusterissuer

# Expected output:
# NAME                  READY   AGE
# letsencrypt-staging   True    1m
# letsencrypt-prod      True    1m
```

## 🎯 Post-Deployment Tasks

### 1. Configure DNS

Point your domain to the cluster:
```bash
# Get LoadBalancer IP (if using cloud provider)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Or get NodePort (if using Minikube/Kind)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Add to DNS:
# A record: api.fastfood.com -> <IP>
```

### 2. Update Ingress with Your Domain

Edit `helm/fastfood/values-prod.yaml`:
```yaml
ingress:
  hosts:
    - host: api.fastfood.com  # Change to your domain
```

Upgrade Helm release:
```bash
helm upgrade fastfood ./helm/fastfood \
  --namespace fastfood \
  --values ./helm/fastfood/values.yaml \
  --values ./helm/fastfood/values-prod.yaml
```

### 3. Test Certificate Issuance

```bash
# Check certificate status
kubectl get certificate -n fastfood

# Check certificate details
kubectl describe certificate fastfood-tls -n fastfood

# Check certificate secret
kubectl get secret fastfood-tls-secret -n fastfood
```

### 4. Configure ArgoCD Auto-Sync

ArgoCD will automatically sync from Git. To trigger manual sync:
```bash
# Install ArgoCD CLI
# Windows: Download from https://github.com/argoproj/argo-cd/releases
# Linux/Mac: curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64

# Login
argocd login localhost:8080 --username admin --password <password> --insecure

# Sync application
argocd app sync fastfood-dev

# Watch sync progress
argocd app wait fastfood-dev --health
```

## 📊 Monitoring

### Helm Releases

```bash
# List all releases
helm list -A

# Get release status
helm status fastfood -n fastfood-dev

# Get release history
helm history fastfood -n fastfood-dev

# Rollback if needed
helm rollback fastfood <revision> -n fastfood-dev
```

### ArgoCD Applications

```bash
# Via CLI
argocd app list
argocd app get fastfood-dev
argocd app logs fastfood-dev

# Via UI
# Open https://localhost:8080
# View application details, sync status, and logs
```

### Cert-Manager Certificates

```bash
# List certificates
kubectl get certificate -A

# Check certificate events
kubectl describe certificate fastfood-tls -n fastfood

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

## 🐛 Troubleshooting

### Helm Deployment Failed

```bash
# Check pod status
kubectl get pods -n fastfood-dev

# Check pod logs
kubectl logs <pod-name> -n fastfood-dev

# Check events
kubectl get events -n fastfood-dev --sort-by='.lastTimestamp'

# Debug deployment
kubectl describe deployment <deployment-name> -n fastfood-dev
```

### ArgoCD Application OutOfSync

```bash
# Check differences
argocd app diff fastfood-dev

# Force sync
argocd app sync fastfood-dev --force

# Check sync errors
kubectl describe application fastfood-dev -n argocd
```

### Certificate Not Issuing

```bash
# Check certificate status
kubectl describe certificate fastfood-tls -n fastfood

# Check certificate request
kubectl get certificaterequest -n fastfood
kubectl describe certificaterequest <name> -n fastfood

# Check ACME challenge
kubectl get challenge -n fastfood
kubectl describe challenge <name> -n fastfood

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

## 🔄 Updates & Rollbacks

### Update Helm Chart

```bash
# Update values
vim helm/fastfood/values-dev.yaml

# Upgrade release
helm upgrade fastfood ./helm/fastfood \
  --namespace fastfood-dev \
  --values ./helm/fastfood/values.yaml \
  --values ./helm/fastfood/values-dev.yaml

# Rollback if needed
helm rollback fastfood -n fastfood-dev
```

### Update via ArgoCD

```bash
# Commit changes to Git
git add .
git commit -m "Update configuration"
git push

# ArgoCD will auto-sync (if enabled)
# Or manually sync:
argocd app sync fastfood-dev
```

## 🔐 Security Considerations

### 1. Change ArgoCD Admin Password

```bash
argocd account update-password
```

### 2. Update Helm Secrets

```bash
# Don't commit secrets to Git!
# Use External Secrets Operator (Phase 2)

# For now, update via kubectl:
kubectl create secret generic fastfood-secrets \
  --from-literal=JWT_SECRET=<your-secret> \
  --namespace fastfood \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Update Cert-Manager Email

Edit `cert-manager/cluster-issuer-prod.yaml`:
```yaml
spec:
  acme:
    email: your-email@example.com  # Change this
```

Apply:
```bash
kubectl apply -f cert-manager/cluster-issuer-prod.yaml
```

## 📚 Documentation

- **Helm Charts**: [helm/fastfood/README.md](helm/fastfood/README.md)
- **ArgoCD**: [argocd/README.md](argocd/README.md)
- **Cert-Manager**: [cert-manager/README.md](cert-manager/README.md)

## ✅ Success Criteria

Phase 1 is complete when:
- ✅ Helm charts deployed successfully
- ✅ All pods running in target namespace
- ✅ ArgoCD UI accessible
- ✅ ArgoCD applications synced
- ✅ Cert-Manager pods running
- ✅ ClusterIssuers ready
- ✅ Test certificate issued successfully

## ⏭️ Next Steps

After Phase 1 completion:
1. **Phase 2**: External Secrets Operator + Velero Backup
2. **Phase 3**: Service Mesh (Istio) + Distributed Tracing
3. Configure monitoring alerts
4. Set up CI/CD integration with ArgoCD

---

**Maintained by:** FastFood DevOps Team  
**Last Updated:** December 2024
