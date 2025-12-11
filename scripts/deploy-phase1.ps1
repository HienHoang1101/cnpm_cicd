# FastFood Delivery - Phase 1 Deployment Script
# Deploys: Helm Charts + ArgoCD + Cert-Manager

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('all', 'helm', 'argocd', 'cert-manager')]
    [string]$Component = 'all',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($message) {
    Write-ColorOutput Cyan "`n==> $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $required = @('kubectl', 'helm')
    $missing = @()
    
    foreach ($cmd in $required) {
        if (!(Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missing += $cmd
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required tools: $($missing -join ', ')"
        Write-Output "`nInstallation instructions:"
        Write-Output "  kubectl: https://kubernetes.io/docs/tasks/tools/"
        Write-Output "  helm: https://helm.sh/docs/intro/install/"
        exit 1
    }
    
    # Check cluster connection
    try {
        kubectl cluster-info | Out-Null
        Write-Success "Kubernetes cluster connected"
    } catch {
        Write-Error "Cannot connect to Kubernetes cluster"
        Write-Output "Please ensure your kubeconfig is configured correctly"
        exit 1
    }
}

# Deploy Helm Charts
function Deploy-HelmCharts {
    Write-Step "Deploying Helm Charts..."
    
    # Add Bitnami repo for dependencies
    Write-Output "Adding Helm repositories..."
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Update dependencies
    Write-Output "Updating chart dependencies..."
    Set-Location helm/fastfood
    helm dependency update
    Set-Location ../..
    
    # Determine values file
    $valuesFile = if ($Environment -eq 'prod') { 'values-prod.yaml' } else { 'values-dev.yaml' }
    $namespace = if ($Environment -eq 'prod') { 'fastfood' } else { 'fastfood-dev' }
    
    # Install/Upgrade chart
    Write-Output "Installing FastFood Helm chart to $namespace..."
    helm upgrade --install fastfood ./helm/fastfood `
        --namespace $namespace `
        --create-namespace `
        --values ./helm/fastfood/values.yaml `
        --values ./helm/fastfood/$valuesFile `
        --wait `
        --timeout 10m
    
    Write-Success "Helm charts deployed successfully"
    
    # Show status
    Write-Output "`nDeployment status:"
    kubectl get pods -n $namespace
}

# Deploy ArgoCD
function Deploy-ArgoCD {
    Write-Step "Deploying ArgoCD..."
    
    # Create namespace
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    
    # Install ArgoCD
    Write-Output "Installing ArgoCD..."
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD to be ready
    Write-Output "Waiting for ArgoCD pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
    
    # Apply custom configurations
    Write-Output "Applying ArgoCD configurations..."
    kubectl apply -f argocd/install.yaml
    
    # Get initial password
    Write-Success "ArgoCD deployed successfully"
    Write-Output "`nArgoCD Admin Password:"
    $password = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
    Write-ColorOutput Yellow $password
    
    Write-Output "`nAccess ArgoCD:"
    Write-Output "  Port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
    Write-Output "  URL: https://localhost:8080"
    Write-Output "  Username: admin"
    Write-Output "  Password: (shown above)"
}

# Deploy Cert-Manager
function Deploy-CertManager {
    Write-Step "Deploying Cert-Manager..."
    
    # Install CRDs
    Write-Output "Installing Cert-Manager CRDs..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml
    
    # Create namespace
    kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -
    
    # Install cert-manager using Helm
    Write-Output "Installing Cert-Manager..."
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    helm upgrade --install cert-manager jetstack/cert-manager `
        --namespace cert-manager `
        --version v1.13.3 `
        --set installCRDs=true `
        --wait `
        --timeout 5m
    
    # Wait for cert-manager to be ready
    Write-Output "Waiting for Cert-Manager pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
    
    # Apply ClusterIssuers
    Write-Output "Creating ClusterIssuers..."
    kubectl apply -f cert-manager/cluster-issuer-staging.yaml
    kubectl apply -f cert-manager/cluster-issuer-prod.yaml
    
    Write-Success "Cert-Manager deployed successfully"
    
    # Show status
    Write-Output "`nCert-Manager status:"
    kubectl get pods -n cert-manager
    kubectl get clusterissuer
}

# Deploy ArgoCD Applications
function Deploy-ArgoApplications {
    Write-Step "Deploying ArgoCD Applications..."
    
    if ($Environment -eq 'prod') {
        Write-Output "Creating production project..."
        kubectl apply -f argocd/projects/fastfood-production.yaml
        
        Write-Output "Creating production application..."
        kubectl apply -f argocd/applications/fastfood-prod.yaml
    } else {
        Write-Output "Creating development application..."
        kubectl apply -f argocd/applications/fastfood-dev.yaml
    }
    
    Write-Success "ArgoCD applications created"
    Write-Output "`nView applications in ArgoCD UI or run:"
    Write-Output "  kubectl get applications -n argocd"
}

# Main execution
function Main {
    Write-ColorOutput Cyan @"
╔═══════════════════════════════════════════════════════════╗
║   FastFood Delivery - Phase 1 Deployment                 ║
║   Components: Helm Charts + ArgoCD + Cert-Manager        ║
╚═══════════════════════════════════════════════════════════╝
"@
    
    Write-Output "Configuration:"
    Write-Output "  Component: $Component"
    Write-Output "  Environment: $Environment"
    Write-Output ""
    
    if (!$SkipConfirmation) {
        $confirm = Read-Host "Continue with deployment? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Warning "Deployment cancelled"
            exit 0
        }
    }
    
    Test-Prerequisites
    
    switch ($Component) {
        'helm' {
            Deploy-HelmCharts
        }
        'argocd' {
            Deploy-ArgoCD
            Deploy-ArgoApplications
        }
        'cert-manager' {
            Deploy-CertManager
        }
        'all' {
            Deploy-HelmCharts
            Deploy-ArgoCD
            Deploy-CertManager
            Deploy-ArgoApplications
        }
    }
    
    Write-ColorOutput Green @"

╔═══════════════════════════════════════════════════════════╗
║   ✓ Phase 1 Deployment Complete!                         ║
╚═══════════════════════════════════════════════════════════╝

Next Steps:
1. Access ArgoCD UI to monitor deployments
2. Configure DNS for your domain
3. Update Ingress with your domain name
4. Test certificate issuance

Documentation:
- Helm: ./helm/fastfood/README.md
- ArgoCD: ./argocd/README.md
- Cert-Manager: ./cert-manager/README.md
"@
}

# Run main function
Main
