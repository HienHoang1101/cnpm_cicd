#!/bin/bash
# FastFood Delivery - Phase 1 Deployment Script
# Deploys: Helm Charts + ArgoCD + Cert-Manager

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
COMPONENT="all"
ENVIRONMENT="dev"
SKIP_CONFIRMATION=false

# Functions
print_step() {
    echo -e "\n${CYAN}==> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing=()
    
    for cmd in kubectl helm; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing[*]}"
        echo ""
        echo "Installation instructions:"
        echo "  kubectl: https://kubernetes.io/docs/tasks/tools/"
        echo "  helm: https://helm.sh/docs/intro/install/"
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        echo "Please ensure your kubeconfig is configured correctly"
        exit 1
    fi
    
    print_success "Kubernetes cluster connected"
}

# Deploy Helm Charts
deploy_helm_charts() {
    print_step "Deploying Helm Charts..."
    
    # Add Bitnami repo
    echo "Adding Helm repositories..."
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Update dependencies
    echo "Updating chart dependencies..."
    cd helm/fastfood
    helm dependency update
    cd ../..
    
    # Determine values file
    local values_file="values-dev.yaml"
    local namespace="fastfood-dev"
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        values_file="values-prod.yaml"
        namespace="fastfood"
    fi
    
    # Install/Upgrade chart
    echo "Installing FastFood Helm chart to $namespace..."
    helm upgrade --install fastfood ./helm/fastfood \
        --namespace $namespace \
        --create-namespace \
        --values ./helm/fastfood/values.yaml \
        --values ./helm/fastfood/$values_file \
        --wait \
        --timeout 10m
    
    print_success "Helm charts deployed successfully"
    
    # Show status
    echo ""
    echo "Deployment status:"
    kubectl get pods -n $namespace
}

# Deploy ArgoCD
deploy_argocd() {
    print_step "Deploying ArgoCD..."
    
    # Create namespace
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    
    # Install ArgoCD
    echo "Installing ArgoCD..."
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD to be ready
    echo "Waiting for ArgoCD pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
    
    # Apply custom configurations
    echo "Applying ArgoCD configurations..."
    kubectl apply -f argocd/install.yaml
    
    # Get initial password
    print_success "ArgoCD deployed successfully"
    echo ""
    echo "ArgoCD Admin Password:"
    kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
    echo ""
    echo ""
    echo "Access ArgoCD:"
    echo "  Port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
    echo "  URL: https://localhost:8080"
    echo "  Username: admin"
    echo "  Password: (shown above)"
}

# Deploy Cert-Manager
deploy_cert_manager() {
    print_step "Deploying Cert-Manager..."
    
    # Install CRDs
    echo "Installing Cert-Manager CRDs..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml
    
    # Create namespace
    kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -
    
    # Install cert-manager using Helm
    echo "Installing Cert-Manager..."
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --version v1.13.3 \
        --set installCRDs=true \
        --wait \
        --timeout 5m
    
    # Wait for cert-manager to be ready
    echo "Waiting for Cert-Manager pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
    
    # Apply ClusterIssuers
    echo "Creating ClusterIssuers..."
    kubectl apply -f cert-manager/cluster-issuer-staging.yaml
    kubectl apply -f cert-manager/cluster-issuer-prod.yaml
    
    print_success "Cert-Manager deployed successfully"
    
    # Show status
    echo ""
    echo "Cert-Manager status:"
    kubectl get pods -n cert-manager
    kubectl get clusterissuer
}

# Deploy ArgoCD Applications
deploy_argo_applications() {
    print_step "Deploying ArgoCD Applications..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo "Creating production project..."
        kubectl apply -f argocd/projects/fastfood-production.yaml
        
        echo "Creating production application..."
        kubectl apply -f argocd/applications/fastfood-prod.yaml
    else
        echo "Creating development application..."
        kubectl apply -f argocd/applications/fastfood-dev.yaml
    fi
    
    print_success "ArgoCD applications created"
    echo ""
    echo "View applications in ArgoCD UI or run:"
    echo "  kubectl get applications -n argocd"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--component)
            COMPONENT="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -y|--yes)
            SKIP_CONFIRMATION=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -c, --component     Component to deploy (all|helm|argocd|cert-manager)"
            echo "  -e, --environment   Environment (dev|prod)"
            echo "  -y, --yes          Skip confirmation"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║   FastFood Delivery - Phase 1 Deployment                 ║
║   Components: Helm Charts + ArgoCD + Cert-Manager        ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo "Configuration:"
    echo "  Component: $COMPONENT"
    echo "  Environment: $ENVIRONMENT"
    echo ""
    
    if [ "$SKIP_CONFIRMATION" = false ]; then
        read -p "Continue with deployment? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Deployment cancelled"
            exit 0
        fi
    fi
    
    check_prerequisites
    
    case $COMPONENT in
        helm)
            deploy_helm_charts
            ;;
        argocd)
            deploy_argocd
            deploy_argo_applications
            ;;
        cert-manager)
            deploy_cert_manager
            ;;
        all)
            deploy_helm_charts
            deploy_argocd
            deploy_cert_manager
            deploy_argo_applications
            ;;
        *)
            print_error "Invalid component: $COMPONENT"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}"
    cat << "EOF"

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
EOF
    echo -e "${NC}"
}

# Run main function
main
