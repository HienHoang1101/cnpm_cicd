# PowerShell script for Windows users
# Kubernetes Deployment Script for FastFood Delivery

param(
    [string]$Action = "deploy",
    [string]$Service = "",
    [int]$Replicas = 0
)

$Namespace = "fastfood"

Write-Host "=====================================" -ForegroundColor Blue
Write-Host "  FastFood Delivery K8s Deployment  " -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

# Check kubectl
try {
    $null = Get-Command kubectl -ErrorAction Stop
} catch {
    Write-Host "❌ kubectl is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check cluster
Write-Host "`n📡 Checking Kubernetes cluster connection..." -ForegroundColor Yellow
try {
    kubectl cluster-info 2>&1 | Out-Null
    Write-Host "✅ Connected to Kubernetes cluster" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Kubernetes cluster" -ForegroundColor Red
    Write-Host "Please start your cluster:" -ForegroundColor Yellow
    Write-Host "  - Minikube: minikube start"
    Write-Host "  - Kind: kind create cluster"
    Write-Host "  - Docker Desktop: Enable Kubernetes in settings"
    exit 1
}

switch ($Action) {
    "deploy" {
        Write-Host "`n🚀 Deploying FastFood to Kubernetes..." -ForegroundColor Blue
        
        Write-Host "`n📁 Creating namespace..." -ForegroundColor Yellow
        kubectl apply -f namespace.yaml
        
        Write-Host "`n🔧 Applying configurations..." -ForegroundColor Yellow
        kubectl apply -f configmap.yaml
        kubectl apply -f secrets.yaml
        
        Write-Host "`n🏗️ Deploying infrastructure..." -ForegroundColor Yellow
        kubectl apply -f mongodb.yaml
        kubectl apply -f redis.yaml
        
        Write-Host "`n⏳ Waiting for infrastructure..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "`n🎯 Deploying microservices..." -ForegroundColor Yellow
        kubectl apply -f auth-service.yaml
        kubectl apply -f order-service.yaml
        kubectl apply -f restaurant-service.yaml
        kubectl apply -f payment-service.yaml
        kubectl apply -f notification-service.yaml
        
        Write-Host "`n🔒 Applying network policies..." -ForegroundColor Yellow
        kubectl apply -f network-policies.yaml
        
        Write-Host "`n🛡️ Applying Pod Disruption Budgets..." -ForegroundColor Yellow
        kubectl apply -f pdb.yaml
        
        Write-Host "`n🌐 Configuring Ingress..." -ForegroundColor Yellow
        kubectl apply -f ingress.yaml
        
        Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "`n📊 Cluster Status" -ForegroundColor Blue
        
        Write-Host "`nPods:" -ForegroundColor Yellow
        kubectl get pods -n $Namespace -o wide
        
        Write-Host "`nServices:" -ForegroundColor Yellow
        kubectl get svc -n $Namespace
        
        Write-Host "`nDeployments:" -ForegroundColor Yellow
        kubectl get deployments -n $Namespace
        
        Write-Host "`nHPA:" -ForegroundColor Yellow
        kubectl get hpa -n $Namespace
        
        Write-Host "`nIngress:" -ForegroundColor Yellow
        kubectl get ingress -n $Namespace
    }
    
    "delete" {
        Write-Host "`n🗑️ Deleting FastFood deployment..." -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (y/n)"
        if ($confirm -eq "y") {
            kubectl delete namespace $Namespace --ignore-not-found
            Write-Host "✅ Deployment deleted" -ForegroundColor Green
        } else {
            Write-Host "Cancelled" -ForegroundColor Yellow
        }
    }
    
    "logs" {
        if ([string]::IsNullOrEmpty($Service)) { $Service = "auth-service" }
        Write-Host "`n📜 Logs for $Service" -ForegroundColor Blue
        kubectl logs -l app=$Service -n $Namespace --tail=100 -f
    }
    
    "restart" {
        if ([string]::IsNullOrEmpty($Service) -or $Service -eq "all") {
            Write-Host "`n🔄 Restarting all services..." -ForegroundColor Yellow
            kubectl rollout restart deployment -n $Namespace
        } else {
            Write-Host "`n🔄 Restarting $Service..." -ForegroundColor Yellow
            kubectl rollout restart deployment/$Service -n $Namespace
        }
    }
    
    "scale" {
        if ([string]::IsNullOrEmpty($Service) -or $Replicas -eq 0) {
            Write-Host "Usage: .\deploy.ps1 -Action scale -Service <name> -Replicas <count>" -ForegroundColor Red
            exit 1
        }
        Write-Host "`n📈 Scaling $Service to $Replicas replicas..." -ForegroundColor Yellow
        kubectl scale deployment/$Service --replicas=$Replicas -n $Namespace
    }
    
    default {
        Write-Host "Usage: .\deploy.ps1 -Action [command]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  deploy    - Deploy all services"
        Write-Host "  status    - Show deployment status"
        Write-Host "  delete    - Delete the deployment"
        Write-Host "  logs      - View logs (-Service <name>)"
        Write-Host "  restart   - Restart services (-Service <name|all>)"
        Write-Host "  scale     - Scale service (-Service <name> -Replicas <count>)"
    }
}
