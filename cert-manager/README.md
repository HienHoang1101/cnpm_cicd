# 🔐 Cert-Manager Setup Guide

## 📋 Overview

Cert-Manager automates TLS certificate management in Kubernetes:
- Automatic certificate issuance from Let's Encrypt
- Auto-renewal before expiration
- Support for multiple certificate authorities
- Integration with Ingress controllers

## 🔧 Installation

### Step 1: Install Cert-Manager

```bash
# Install cert-manager CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.crds.yaml

# Create namespace
kubectl create namespace cert-manager

# Install cert-manager using Helm
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.13.3 \
  --set installCRDs=true

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
```

**Or using kubectl:**
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
```

### Step 2: Verify Installation

```bash
# Check pods
kubectl get pods -n cert-manager

# Check CRDs
kubectl get crd | grep cert-manager

# Expected output:
# certificaterequests.cert-manager.io
# certificates.cert-manager.io
# challenges.acme.cert-manager.io
# clusterissuers.cert-manager.io
# issuers.cert-manager.io
# orders.acme.cert-manager.io
```

### Step 3: Create ClusterIssuers

**For Staging (Testing):**
```bash
kubectl apply -f cert-manager/cluster-issuer-staging.yaml
```

**For Production:**
```bash
kubectl apply -f cert-manager/cluster-issuer-prod.yaml
```

### Step 4: Verify ClusterIssuers

```bash
# Check ClusterIssuers
kubectl get clusterissuer

# Expected output:
# NAME                  READY   AGE
# letsencrypt-staging   True    10s
# letsencrypt-prod      True    10s

# Check details
kubectl describe clusterissuer letsencrypt-prod
```

## 📜 Certificate Issuance

### Method 1: Automatic via Ingress Annotation

Update your Ingress with cert-manager annotation:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fastfood-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.fastfood.com
      secretName: fastfood-tls-secret
  rules:
    - host: api.fastfood.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 5001
```

Apply:
```bash
kubectl apply -f your-ingress.yaml
```

### Method 2: Manual Certificate Resource

```bash
kubectl apply -f cert-manager/certificate-example.yaml
```

### Method 3: Using Helm Values

Update `helm/fastfood/values-prod.yaml`:
```yaml
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  tls:
    enabled: true
    secretName: fastfood-tls-secret
```

## 🔍 Monitoring Certificates

### Check Certificate Status

```bash
# List all certificates
kubectl get certificate -A

# Check specific certificate
kubectl get certificate fastfood-tls -n fastfood

# Describe certificate (shows events)
kubectl describe certificate fastfood-tls -n fastfood

# Check certificate secret
kubectl get secret fastfood-tls-secret -n fastfood
```

### Check Certificate Details

```bash
# View certificate info
kubectl get certificate fastfood-tls -n fastfood -o yaml

# Check expiration date
kubectl get secret fastfood-tls-secret -n fastfood -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -dates
```

### Monitor Certificate Requests

```bash
# List certificate requests
kubectl get certificaterequest -n fastfood

# Check ACME challenges
kubectl get challenge -n fastfood

# Check ACME orders
kubectl get order -n fastfood
```

## 🐛 Troubleshooting

### Certificate Not Issuing

**1. Check Certificate Status:**
```bash
kubectl describe certificate fastfood-tls -n fastfood
```

**2. Check CertificateRequest:**
```bash
kubectl get certificaterequest -n fastfood
kubectl describe certificaterequest <name> -n fastfood
```

**3. Check Challenge:**
```bash
kubectl get challenge -n fastfood
kubectl describe challenge <name> -n fastfood
```

**4. Check Cert-Manager Logs:**
```bash
kubectl logs -n cert-manager -l app=cert-manager
kubectl logs -n cert-manager -l app=webhook
```

### Common Issues

**Issue 1: DNS Challenge Failed**
```bash
# Check if DNS is properly configured
nslookup _acme-challenge.api.fastfood.com

# Solution: Ensure DNS provider credentials are correct
kubectl get secret cloudflare-api-token -n cert-manager
```

**Issue 2: HTTP-01 Challenge Failed**
```bash
# Check if ingress is accessible
curl http://api.fastfood.com/.well-known/acme-challenge/test

# Solution: Ensure ingress controller is working
kubectl get ingress -n fastfood
kubectl describe ingress fastfood-ingress -n fastfood
```

**Issue 3: Rate Limit Exceeded**
```bash
# Let's Encrypt has rate limits:
# - 50 certificates per domain per week
# - 5 duplicate certificates per week

# Solution: Use staging issuer for testing
# Switch to letsencrypt-staging in annotations
```

## 🔄 Certificate Renewal

Cert-Manager automatically renews certificates 30 days before expiration.

### Manual Renewal

```bash
# Delete certificate to force renewal
kubectl delete certificate fastfood-tls -n fastfood

# Certificate will be automatically recreated
kubectl get certificate -n fastfood -w
```

### Check Renewal Status

```bash
# View certificate events
kubectl describe certificate fastfood-tls -n fastfood | grep -A 10 Events

# Check renewal logs
kubectl logs -n cert-manager -l app=cert-manager | grep renewal
```

## 🔐 DNS-01 Challenge (Wildcard Certificates)

For wildcard certificates (*.fastfood.com), use DNS-01 challenge:

### Cloudflare Example

```bash
# Create API token secret
kubectl create secret generic cloudflare-api-token \
  --from-literal=api-token=<your-cloudflare-api-token> \
  -n cert-manager

# Apply DNS-01 ClusterIssuer
kubectl apply -f cert-manager/cluster-issuer-dns01.yaml
```

### Create Wildcard Certificate

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-fastfood-tls
  namespace: fastfood
spec:
  secretName: wildcard-fastfood-tls-secret
  issuerRef:
    name: letsencrypt-prod-dns01
    kind: ClusterIssuer
  dnsNames:
    - "*.fastfood.com"
    - "fastfood.com"
```

## 📊 Monitoring & Alerts

### Prometheus Metrics

Cert-Manager exposes metrics on port 9402:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cert-manager-metrics
  namespace: cert-manager
spec:
  ports:
    - port: 9402
      targetPort: 9402
  selector:
    app: cert-manager
```

### Grafana Dashboard

Import dashboard ID: 11001
- Certificate expiration dates
- Renewal success/failure rates
- ACME challenge statistics

### Alerting Rules

```yaml
groups:
  - name: cert-manager
    rules:
      - alert: CertificateExpiringSoon
        expr: certmanager_certificate_expiration_timestamp_seconds - time() < 604800
        annotations:
          summary: "Certificate {{ $labels.name }} expiring in less than 7 days"
      
      - alert: CertificateRenewalFailed
        expr: certmanager_certificate_ready_status{condition="False"} == 1
        annotations:
          summary: "Certificate {{ $labels.name }} renewal failed"
```

## 🎯 Best Practices

1. **Use Staging for Testing**
   - Always test with `letsencrypt-staging` first
   - Avoid hitting production rate limits

2. **Monitor Expiration**
   - Set up alerts for certificates expiring soon
   - Check renewal logs regularly

3. **Use DNS-01 for Wildcards**
   - HTTP-01 doesn't support wildcard certificates
   - DNS-01 works behind firewalls

4. **Backup Certificates**
   - Export certificate secrets regularly
   - Store in secure location

5. **Namespace Isolation**
   - Use ClusterIssuer for cluster-wide access
   - Use Issuer for namespace-specific certificates

## 📚 Resources

- [Cert-Manager Documentation](https://cert-manager.io/docs/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
- [ACME Protocol](https://tools.ietf.org/html/rfc8555)

---

**Maintained by:** FastFood DevOps Team  
**Last Updated:** December 2024
