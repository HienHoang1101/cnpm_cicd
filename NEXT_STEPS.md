# ⏭️ Next Steps After Phase 1

## 🎯 Current Status

✅ **Helm Charts** - Deployed and running  
✅ **ArgoCD** - Installed and configured  
⚠️ **Cert-Manager** - Pending (waiting for cluster resources)

## 📋 Immediate Actions (Today)

### 1. Complete Cert-Manager Setup

**Wait for pods to be ready:**
```bash
# Monitor status
kubectl get pods -n cert-manager -w

# Expected output (when ready):
# cert-manager-xxx                  1/1     Running
# cert-manager-cainjector-xxx       1/1     Running
# cert-manager-webhook-xxx          1/1     Running
```

**Create ClusterIssuers:**
```bash
# Once all pods are Running
kubectl apply -f cert-manager/cluster-issuer-staging.yaml
kubectl apply -f cert-manager/cluster-issuer-prod.yaml

# Verify
kubectl get clusterissuer
```

### 2. Access ArgoCD UI

```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser: https://localhost:8080
# Username: admin
# Password: F6c5VIcieEfjy24Y
```

**In ArgoCD UI:**
- ✅ Verify fastfood-dev application is Healthy
- ✅ Check sync status
- ✅ Review deployed resources
- ✅ Test manual sync

### 3. Verify All Services

```bash
# Check all pods
kubectl get pods -n fastfood

# Check services
kubectl get svc -n fastfood

# Test auth service
kubectl port-forward svc/auth-service -n fastfood 5001:5001
curl http://localhost:5001/health

# Test order service
kubectl port-forward svc/order-service -n fastfood 5002:5002
curl http://localhost:5002/health
```

## 📅 Short Term (This Week)

### 4. Configure DNS (If deploying to production)

**Get LoadBalancer IP:**
```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

**Update DNS records:**
```
A record: api.fastfood.com -> <LoadBalancer-IP>
A record: *.fastfood.com -> <LoadBalancer-IP>
```

**Update Helm values:**
```yaml
# helm/fastfood/values-prod.yaml
ingress:
  hosts:
    - host: api.fastfood.com  # Your actual domain
```

### 5. Test Certificate Issuance

**Create test certificate:**
```bash
kubectl apply -f cert-manager/certificate-example.yaml
```

**Monitor certificate:**
```bash
# Check status
kubectl get certificate -n fastfood

# View details
kubectl describe certificate fastfood-tls -n fastfood

# Check if secret created
kubectl get secret fastfood-tls-secret -n fastfood
```

**Troubleshoot if needed:**
```bash
# Check certificate request
kubectl get certificaterequest -n fastfood

# Check ACME challenge
kubectl get challenge -n fastfood

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

### 6. Test GitOps Workflow

**Make a change:**
```bash
# Edit configuration
vim helm/fastfood/values-dev.yaml

# Example: Change replica count
authService:
  replicaCount: 3  # Changed from 2

# Commit and push
git add .
git commit -m "Scale auth service to 3 replicas"
git push
```

**Watch ArgoCD sync:**
```bash
# Monitor in terminal
kubectl get applications -n argocd -w

# Or watch in ArgoCD UI
# https://localhost:8080
```

**Verify change:**
```bash
kubectl get pods -n fastfood-dev | grep auth-service
# Should show 3 pods
```

### 7. Test Rollback

**Via ArgoCD UI:**
1. Go to Application → fastfood-dev
2. Click "History and Rollback"
3. Select previous revision
4. Click "Rollback"

**Via CLI:**
```bash
# Install ArgoCD CLI first
# Windows: Download from https://github.com/argoproj/argo-cd/releases

# Login
argocd login localhost:8080 --username admin --password F6c5VIcieEfjy24Y --insecure

# View history
argocd app history fastfood-dev

# Rollback
argocd app rollback fastfood-dev <revision-number>
```

## 📊 Medium Term (Next Week)

### 8. Deploy to Production

**Create production project:**
```bash
kubectl apply -f argocd/projects/fastfood-production.yaml
```

**Create production application:**
```bash
kubectl apply -f argocd/applications/fastfood-prod.yaml
```

**Monitor deployment:**
```bash
kubectl get applications -n argocd
kubectl get pods -n fastfood
```

### 9. Set Up Monitoring

**Configure Prometheus:**
```bash
# Services already expose /metrics
# Verify metrics endpoint
kubectl port-forward svc/auth-service -n fastfood 5001:5001
curl http://localhost:5001/metrics
```

**Set up Grafana dashboards:**
- Import dashboard from `monitoring/grafana/dashboards/`
- Configure data source (Prometheus)
- Set up alerts

### 10. Team Training

**Schedule sessions:**
- GitOps workflow (1 hour)
- ArgoCD UI walkthrough (30 min)
- Troubleshooting guide (1 hour)
- Rollback procedures (30 min)

**Create documentation:**
- Team wiki pages
- Runbooks for common tasks
- Incident response procedures

## 🚀 Long Term (Phase 2 Planning)

### 11. External Secrets Operator

**Why:**
- Remove hardcoded secrets from Git
- Centralized secret management
- Automated secret rotation

**Tasks:**
- Evaluate secret management solutions (Vault, AWS Secrets Manager)
- Design secret structure
- Plan migration strategy
- Create implementation timeline

**Resources:**
- [External Secrets Operator](https://external-secrets.io/)
- [HashiCorp Vault](https://www.vaultproject.io/)

### 12. Velero Backup

**Why:**
- Disaster recovery
- Cluster migration
- Backup automation

**Tasks:**
- Choose backup storage (S3, GCS, Azure Blob)
- Install Velero
- Configure backup schedules
- Test restore procedures

**Resources:**
- [Velero Documentation](https://velero.io/docs/)
- [Backup Best Practices](https://velero.io/docs/main/backup-reference/)

### 13. Service Mesh (Istio)

**Why:**
- Traffic management
- Circuit breaker
- mTLS between services
- Distributed tracing
- Advanced observability

**Tasks:**
- Evaluate Istio vs Linkerd
- Plan rollout strategy
- Configure traffic policies
- Set up tracing (Jaeger/Tempo)

**Resources:**
- [Istio Documentation](https://istio.io/latest/docs/)
- [Linkerd Documentation](https://linkerd.io/2/overview/)

## 📚 Learning Resources

### Helm
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Helm Template Guide](https://helm.sh/docs/chart_template_guide/)

### ArgoCD
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [GitOps Principles](https://www.gitops.tech/)

### Cert-Manager
- [Cert-Manager Tutorial](https://cert-manager.io/docs/tutorials/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)

### Kubernetes
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Production Checklist](https://kubernetes.io/docs/setup/best-practices/)

## ✅ Checklist

### Today
- [ ] Wait for Cert-Manager pods to be Running
- [ ] Create ClusterIssuers
- [ ] Access ArgoCD UI
- [ ] Verify all services healthy
- [ ] Test service endpoints

### This Week
- [ ] Configure DNS (if production)
- [ ] Test certificate issuance
- [ ] Test GitOps workflow (make a change)
- [ ] Test rollback procedure
- [ ] Document procedures

### Next Week
- [ ] Deploy to production
- [ ] Set up monitoring dashboards
- [ ] Configure alerts
- [ ] Train team on GitOps
- [ ] Create runbooks

### Phase 2 Planning
- [ ] Research External Secrets solutions
- [ ] Evaluate backup strategies
- [ ] Plan Service Mesh implementation
- [ ] Create Phase 2 timeline

## 📞 Need Help?

**Documentation:**
- [START_HERE.md](START_HERE.md) - Quick guide
- [PHASE1_DEPLOYMENT_RESULT.md](PHASE1_DEPLOYMENT_RESULT.md) - Current status
- [PHASE1_INDEX.md](PHASE1_INDEX.md) - Full documentation index

**Troubleshooting:**
- Check component READMEs in `helm/`, `argocd/`, `cert-manager/`
- Review logs: `kubectl logs <pod-name> -n <namespace>`
- Check events: `kubectl get events -n <namespace>`

**Support:**
- GitHub Issues: https://github.com/HienHoang1101/cnpm_cicd/issues
- DevOps Team: devops@fastfood.com

---

**Last Updated:** December 11, 2024  
**Phase 1 Status:** 80% Complete  
**Next Milestone:** Complete Cert-Manager setup
