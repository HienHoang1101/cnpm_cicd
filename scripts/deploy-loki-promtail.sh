#!/bin/bash
# Deploy Loki + Promtail to Kubernetes
# =====================================

set -e

echo "🚀 Deploying Loki + Promtail..."

# Check kubectl connection
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    exit 1
fi

echo "📦 Deploying Loki..."
kubectl apply -f k8s/monitoring/loki.yaml

echo "📦 Deploying Promtail..."
kubectl apply -f k8s/monitoring/promtail.yaml

echo "⏳ Waiting for Loki to be ready..."
kubectl rollout status deployment/loki -n monitoring --timeout=120s

echo "⏳ Waiting for Promtail to be ready..."
kubectl rollout status daemonset/promtail -n monitoring --timeout=120s

echo ""
echo "✅ Loki + Promtail deployed successfully!"
echo ""
echo "📊 Status:"
kubectl get pods -n monitoring -l 'app in (loki, promtail)'
echo ""
echo "🔗 Test Loki:"
echo "   kubectl port-forward svc/loki 3100:3100 -n monitoring"
echo "   curl http://localhost:3100/ready"
echo ""
echo "📈 View logs in Grafana:"
echo "   http://34.177.101.213 → Explore → Select 'Loki' datasource"
