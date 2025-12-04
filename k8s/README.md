# 🚀 Kubernetes Deployment Guide - FastFood Delivery

## Free Kubernetes Options

### 1. **Minikube** (Local - Recommended for Learning)
```bash
# Install Minikube
# Windows (chocolatey)
choco install minikube

# Start cluster
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
```

### 2. **Docker Desktop** (Local - Easiest)
1. Open Docker Desktop Settings
2. Go to Kubernetes tab
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"

### 3. **Kind** (Kubernetes in Docker)
```bash
# Install Kind
choco install kind

# Create cluster
kind create cluster --name fastfood --config kind-config.yaml
```

### 4. **Free Cloud Options**
| Provider | Free Tier |
|----------|-----------|
| **Oracle Cloud** | Always Free - 4 ARM Ampere cores, 24GB RAM |
| **Google Cloud (GKE)** | $300 credit for 90 days |
| **Azure (AKS)** | $200 credit for 30 days |
| **AWS (EKS)** | Free tier available |
| **Civo** | $250 credit for startups |
| **DigitalOcean** | $200 credit for 60 days |

---

## Quick Start

### Step 1: Verify Cluster
```powershell
kubectl cluster-info
kubectl get nodes
```

### Step 2: Deploy Application
```powershell
cd k8s

# Option A: Using PowerShell script
.\deploy.ps1 -Action deploy

# Option B: Using kubectl directly
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f redis.yaml
kubectl apply -f auth-service.yaml
kubectl apply -f order-service.yaml
kubectl apply -f restaurant-service.yaml
kubectl apply -f payment-service.yaml
kubectl apply -f notification-service.yaml
kubectl apply -f ingress.yaml

# Option C: Using Kustomize
kubectl apply -k .

# For development environment
kubectl apply -k overlays/development

# For production environment
kubectl apply -k overlays/production
```

### Step 3: Check Status
```powershell
.\deploy.ps1 -Action status

# Or manually
kubectl get pods -n fastfood
kubectl get svc -n fastfood
kubectl get ingress -n fastfood
```

### Step 4: Access Services

#### Minikube
```bash
# Get Minikube IP
minikube ip

# Add to hosts file (C:\Windows\System32\drivers\etc\hosts)
<minikube-ip> api.fastfood.local

# Or use tunnel
minikube tunnel
```

#### Docker Desktop / Kind
```bash
# Port forward
kubectl port-forward svc/auth-service 5001:5001 -n fastfood
kubectl port-forward svc/order-service 5002:5002 -n fastfood
kubectl port-forward svc/restaurant-service 5003:5003 -n fastfood
```

---

## Architecture

```
                         ┌─────────────────────────────────────┐
                         │          Ingress Controller         │
                         │      (NGINX / Traefik / Kong)       │
                         └─────────────────┬───────────────────┘
                                           │
           ┌───────────────┬───────────────┼───────────────┬───────────────┐
           │               │               │               │               │
           ▼               ▼               ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    Auth     │ │    Order    │ │ Restaurant  │ │   Payment   │ │Notification │
    │   Service   │ │   Service   │ │   Service   │ │   Service   │ │   Service   │
    │  (2 pods)   │ │  (2 pods)   │ │  (2 pods)   │ │  (2 pods)   │ │  (2 pods)   │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │               │               │
           └───────────────┴───────────────┼───────────────┴───────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             ┌──────▼──────┐                              ┌───────▼──────┐
             │   MongoDB   │                              │    Redis     │
             │ StatefulSet │                              │  Deployment  │
             └─────────────┘                              └──────────────┘
```

---

## Management Commands

### View Logs
```powershell
# All pods of a service
kubectl logs -l app=auth-service -n fastfood --tail=100

# Specific pod
kubectl logs auth-service-xxx-yyy -n fastfood

# Stream logs
kubectl logs -f -l app=order-service -n fastfood
```

### Scale Services
```powershell
# Manual scaling
kubectl scale deployment/auth-service --replicas=5 -n fastfood

# Check HPA status
kubectl get hpa -n fastfood
```

### Rolling Update
```powershell
# Update image
kubectl set image deployment/auth-service auth-service=fastfood/auth-service:v2 -n fastfood

# Check rollout status
kubectl rollout status deployment/auth-service -n fastfood

# Rollback if needed
kubectl rollout undo deployment/auth-service -n fastfood
```

### Debugging
```powershell
# Describe pod
kubectl describe pod <pod-name> -n fastfood

# Execute into pod
kubectl exec -it <pod-name> -n fastfood -- sh

# Check events
kubectl get events -n fastfood --sort-by='.lastTimestamp'
```

---

## Monitoring

### Built-in Dashboard
```bash
# Minikube
minikube dashboard

# Any cluster with metrics-server
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
kubectl proxy
# Access: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

### Prometheus + Grafana (Helm)
```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

---

## Security Best Practices

1. **Secrets Management**
   - Use External Secrets Operator for production
   - Or Sealed Secrets for GitOps
   
2. **Network Policies**
   - Already configured in `network-policies.yaml`
   
3. **Pod Security**
   - Run as non-root user
   - Read-only root filesystem
   - Drop all capabilities

4. **RBAC**
   - Principle of least privilege
   - Service accounts per service

---

## Troubleshooting

### Pod CrashLoopBackOff
```bash
kubectl logs <pod-name> -n fastfood --previous
kubectl describe pod <pod-name> -n fastfood
```

### Pod Pending
```bash
kubectl describe pod <pod-name> -n fastfood
# Check: Resources, PVC, Node selector
```

### Service Not Accessible
```bash
kubectl get endpoints <service-name> -n fastfood
kubectl describe svc <service-name> -n fastfood
```

### Ingress Not Working
```bash
kubectl describe ingress fastfood-ingress -n fastfood
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

---

## Cleanup

```powershell
# Delete deployment
.\deploy.ps1 -Action delete

# Or manually
kubectl delete namespace fastfood

# Delete Minikube cluster
minikube delete

# Delete Kind cluster
kind delete cluster --name fastfood
```

---

## Next Steps

1. Set up **CI/CD Pipeline** with GitHub Actions to deploy to K8s
2. Configure **ArgoCD** for GitOps
3. Add **Cert-Manager** for TLS certificates
4. Set up **Velero** for backup and disaster recovery
