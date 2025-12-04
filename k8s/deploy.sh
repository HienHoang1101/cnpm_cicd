#!/bin/bash
# Kubernetes Deployment Script for FastFood Delivery
# Supports: Minikube, Kind, Docker Desktop, or any K8s cluster

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  FastFood Delivery K8s Deployment  ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install it first.${NC}"
    exit 1
fi

# Check cluster connection
echo -e "\n${YELLOW}📡 Checking Kubernetes cluster connection...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo -e "${YELLOW}Please start your cluster:${NC}"
    echo "  - Minikube: minikube start"
    echo "  - Kind: kind create cluster"
    echo "  - Docker Desktop: Enable Kubernetes in settings"
    exit 1
fi

echo -e "${GREEN}✅ Connected to Kubernetes cluster${NC}"
kubectl cluster-info | head -2

# Parse arguments
NAMESPACE="fastfood"
ACTION=${1:-"deploy"}
ENVIRONMENT=${2:-"development"}

case $ACTION in
    "deploy")
        echo -e "\n${BLUE}🚀 Deploying FastFood to Kubernetes...${NC}"
        
        # Create namespace
        echo -e "\n${YELLOW}📁 Creating namespace...${NC}"
        kubectl apply -f namespace.yaml
        
        # Apply ConfigMaps and Secrets
        echo -e "\n${YELLOW}🔧 Applying configurations...${NC}"
        kubectl apply -f configmap.yaml
        kubectl apply -f secrets.yaml
        
        # Deploy infrastructure
        echo -e "\n${YELLOW}🏗️ Deploying infrastructure...${NC}"
        kubectl apply -f mongodb.yaml
        kubectl apply -f redis.yaml
        
        # Wait for infrastructure
        echo -e "\n${YELLOW}⏳ Waiting for infrastructure to be ready...${NC}"
        kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s || true
        kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=60s || true
        
        # Deploy services
        echo -e "\n${YELLOW}🎯 Deploying microservices...${NC}"
        kubectl apply -f auth-service.yaml
        kubectl apply -f order-service.yaml
        kubectl apply -f restaurant-service.yaml
        kubectl apply -f payment-service.yaml
        kubectl apply -f notification-service.yaml
        
        # Apply network policies
        echo -e "\n${YELLOW}🔒 Applying network policies...${NC}"
        kubectl apply -f network-policies.yaml
        
        # Apply PDBs
        echo -e "\n${YELLOW}🛡️ Applying Pod Disruption Budgets...${NC}"
        kubectl apply -f pdb.yaml
        
        # Apply Ingress
        echo -e "\n${YELLOW}🌐 Configuring Ingress...${NC}"
        kubectl apply -f ingress.yaml
        
        # Apply monitoring (optional)
        if [ -f "monitoring.yaml" ]; then
            echo -e "\n${YELLOW}📊 Applying monitoring configs...${NC}"
            kubectl apply -f monitoring.yaml 2>/dev/null || echo "Prometheus Operator not installed, skipping..."
        fi
        
        echo -e "\n${GREEN}✅ Deployment complete!${NC}"
        ;;
        
    "status")
        echo -e "\n${BLUE}📊 Cluster Status${NC}"
        echo -e "\n${YELLOW}Pods:${NC}"
        kubectl get pods -n $NAMESPACE -o wide
        
        echo -e "\n${YELLOW}Services:${NC}"
        kubectl get svc -n $NAMESPACE
        
        echo -e "\n${YELLOW}Deployments:${NC}"
        kubectl get deployments -n $NAMESPACE
        
        echo -e "\n${YELLOW}HPA:${NC}"
        kubectl get hpa -n $NAMESPACE
        
        echo -e "\n${YELLOW}Ingress:${NC}"
        kubectl get ingress -n $NAMESPACE
        ;;
        
    "delete")
        echo -e "\n${RED}🗑️ Deleting FastFood deployment...${NC}"
        read -p "Are you sure? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl delete namespace $NAMESPACE --ignore-not-found
            echo -e "${GREEN}✅ Deployment deleted${NC}"
        else
            echo -e "${YELLOW}Cancelled${NC}"
        fi
        ;;
        
    "logs")
        SERVICE=${2:-"auth-service"}
        echo -e "\n${BLUE}📜 Logs for $SERVICE${NC}"
        kubectl logs -l app=$SERVICE -n $NAMESPACE --tail=100 -f
        ;;
        
    "restart")
        SERVICE=${2:-"all"}
        if [ "$SERVICE" = "all" ]; then
            echo -e "\n${YELLOW}🔄 Restarting all services...${NC}"
            kubectl rollout restart deployment -n $NAMESPACE
        else
            echo -e "\n${YELLOW}🔄 Restarting $SERVICE...${NC}"
            kubectl rollout restart deployment/$SERVICE -n $NAMESPACE
        fi
        ;;
        
    "scale")
        SERVICE=$2
        REPLICAS=$3
        if [ -z "$SERVICE" ] || [ -z "$REPLICAS" ]; then
            echo -e "${RED}Usage: ./deploy.sh scale <service> <replicas>${NC}"
            exit 1
        fi
        echo -e "\n${YELLOW}📈 Scaling $SERVICE to $REPLICAS replicas...${NC}"
        kubectl scale deployment/$SERVICE --replicas=$REPLICAS -n $NAMESPACE
        ;;
        
    *)
        echo -e "${YELLOW}Usage: ./deploy.sh [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  deploy    - Deploy all services to Kubernetes"
        echo "  status    - Show deployment status"
        echo "  delete    - Delete the deployment"
        echo "  logs      - View logs (usage: logs <service-name>)"
        echo "  restart   - Restart services (usage: restart [service|all])"
        echo "  scale     - Scale service (usage: scale <service> <replicas>)"
        ;;
esac

echo ""
