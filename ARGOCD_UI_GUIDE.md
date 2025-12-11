# 🎨 ArgoCD UI Guide

## 🔐 Access Information

**URL:** http://localhost:8080 (HTTP, not HTTPS!)  
**Username:** admin  
**Password:** F6c5VIcieEfjy24Y

**Port-forward Status:** ✅ Running (Process ID: 5)  
**Port Mapping:** 8080:80 (HTTP)

## 📝 Step-by-Step Guide

### Step 1: Open Browser

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Navigate to: **http://localhost:8080** (use HTTP, not HTTPS!)
3. You should see the ArgoCD login page directly (no certificate warning)

### Step 2: Login

1. You'll see the ArgoCD login page
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `F6c5VIcieEfjy24Y`
3. Click "SIGN IN"

### Step 3: View Applications

After login, you'll see the ArgoCD dashboard with:

**Applications List:**
- **fastfood-dev** - Your development application

**Application Status:**
- **Sync Status:** Unknown (needs manual sync)
- **Health Status:** Healthy
- **Project:** default
- **Namespace:** fastfood-dev

### Step 4: Sync Application

1. **Click on "fastfood-dev"** application card
2. You'll see the application details page with:
   - Resource tree (visual representation)
   - Sync status
   - Health status
   - Git repository info

3. **Click the "SYNC" button** (top right)
4. A sync options dialog will appear:
   - **Prune:** ✅ Enabled (remove resources not in Git)
   - **Dry Run:** ❌ Disabled
   - **Apply Only:** ❌ Disabled
   
5. **Click "SYNCHRONIZE"** button
6. Watch the sync progress in real-time

### Step 5: Monitor Sync Progress

You'll see:
- **Syncing...** status with progress indicator
- Resources being created/updated
- Health checks running
- Final status: **Synced** and **Healthy**

**Expected Resources:**
- Namespace: fastfood-dev
- Deployments: 6 microservices
- Services: 6 services
- ConfigMaps: 2 configmaps
- Secrets: 1 secret
- HorizontalPodAutoscalers: 6 HPAs

## 🎯 What to Look For

### Application Overview

**Top Section:**
- **Sync Status:** Should change from "Unknown" → "Syncing" → "Synced"
- **Health Status:** Should remain "Healthy"
- **Last Sync:** Timestamp of last sync
- **Repository:** https://github.com/HienHoang1101/cnpm_cicd.git
- **Path:** helm/fastfood
- **Target Revision:** main

### Resource Tree

Visual representation showing:
- **Namespace** (fastfood-dev)
  - **Deployments** (auth-service, order-service, etc.)
    - **ReplicaSets**
      - **Pods**
  - **Services** (ClusterIP endpoints)
  - **ConfigMaps** (configuration data)
  - **Secrets** (sensitive data)
  - **HPAs** (auto-scaling rules)

### Resource Status Icons

- 🟢 **Green:** Healthy/Synced
- 🟡 **Yellow:** Progressing/Syncing
- 🔴 **Red:** Degraded/Failed
- ⚪ **Gray:** Unknown/Missing

## 🔍 Exploring the UI

### Application Details Tab

**Summary:**
- Application info
- Sync policy (auto-sync enabled)
- Health status
- Git repository details

**Parameters:**
- Helm values being used
- Environment-specific overrides

**Manifest:**
- Raw Kubernetes YAML
- Generated from Helm templates

**Events:**
- Application events
- Sync history
- Error messages

**Logs:**
- Pod logs
- Container logs
- Real-time streaming

### Sync Options

**Auto-Sync:**
- ✅ Enabled for fastfood-dev
- Automatically syncs on Git changes
- Self-healing enabled

**Manual Sync:**
- Click "SYNC" button anytime
- Force sync with "HARD REFRESH"
- Selective resource sync

**Rollback:**
- View sync history
- Rollback to previous revision
- One-click restore

## 🎨 UI Features

### 1. Application List View

**Filters:**
- By project
- By cluster
- By namespace
- By sync status
- By health status

**Actions:**
- Sync all
- Refresh all
- Create new application

### 2. Application Details View

**Toolbar:**
- **SYNC:** Manual sync
- **REFRESH:** Reload from cluster
- **DELETE:** Remove application
- **APP DETAILS:** View/edit settings
- **APP DIFF:** Compare Git vs Cluster

**Resource Tree:**
- Visual hierarchy
- Click to view details
- Right-click for actions
- Filter by kind/status

### 3. Resource Details

Click any resource to see:
- **Summary:** Basic info
- **Manifest:** YAML definition
- **Events:** Kubernetes events
- **Logs:** Container logs (for pods)
- **Diff:** Git vs Cluster differences

## 🔧 Common Actions

### Sync Application

```
1. Click application
2. Click "SYNC" button
3. Review options
4. Click "SYNCHRONIZE"
```

### View Pod Logs

```
1. Click application
2. Find pod in resource tree
3. Click pod
4. Click "LOGS" tab
5. Select container (if multiple)
```

### Rollback to Previous Version

```
1. Click application
2. Click "HISTORY AND ROLLBACK"
3. Select previous revision
4. Click "ROLLBACK"
5. Confirm
```

### View Differences

```
1. Click application
2. Click "APP DIFF" button
3. Review changes
4. See what will be applied
```

### Hard Refresh

```
1. Click application
2. Click "REFRESH" button
3. Select "HARD REFRESH"
4. Clears cache and reloads
```

## 📊 Understanding Sync Status

### Unknown
- Application not yet synced
- Git state not compared with cluster
- **Action:** Click SYNC

### OutOfSync
- Git differs from cluster
- Changes detected
- **Action:** Review diff, then SYNC

### Synced
- Git matches cluster
- All resources up to date
- **Action:** None needed

### Syncing
- Sync in progress
- Resources being applied
- **Action:** Wait for completion

## 🏥 Understanding Health Status

### Healthy
- All resources running correctly
- Pods ready
- Services accessible
- **Action:** None needed

### Progressing
- Resources being created/updated
- Pods starting
- Rollout in progress
- **Action:** Wait for completion

### Degraded
- Some resources failing
- Pods crashing
- Services unavailable
- **Action:** Check logs, investigate

### Missing
- Resources not found in cluster
- Deleted manually
- **Action:** Sync to recreate

## 🎓 Tips & Tricks

### 1. Use Filters
- Filter by resource kind
- Filter by sync status
- Filter by health status
- Quickly find issues

### 2. Watch Mode
- Enable auto-refresh
- Real-time updates
- Monitor deployments live

### 3. Compact View
- Toggle compact/expanded view
- Better for many resources
- Easier navigation

### 4. Search
- Search by resource name
- Search by kind
- Quick navigation

### 5. Bookmarks
- Bookmark application URLs
- Direct access to apps
- Share with team

## 🐛 Troubleshooting

### Can't Access UI

**Issue:** Browser can't connect  
**Solution:**
```bash
# Check port-forward is running
kubectl get pods -n argocd

# Restart port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Login Failed

**Issue:** Invalid credentials  
**Solution:**
```bash
# Get password again
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Application Not Syncing

**Issue:** Sync stuck or failing  
**Solution:**
1. Check "APP DETAILS" → "EVENTS"
2. Look for error messages
3. Check Git repository is accessible
4. Verify Helm chart is valid
5. Try "HARD REFRESH"

### Resources Not Appearing

**Issue:** Expected resources missing  
**Solution:**
1. Click "REFRESH"
2. Check namespace is correct
3. Verify Helm values
4. Check "MANIFEST" tab for errors

## 📚 Next Steps

After syncing successfully:

1. **Explore Resources**
   - Click through resource tree
   - View pod logs
   - Check service endpoints

2. **Test GitOps Workflow**
   - Make a change in Git
   - Watch auto-sync
   - Verify changes applied

3. **Configure Notifications**
   - Set up Slack/email alerts
   - Get notified on sync failures
   - Monitor deployments

4. **Set Up Projects**
   - Create production project
   - Configure RBAC
   - Isolate environments

## 🔗 Useful Links

**ArgoCD Documentation:**
- [Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [User Guide](https://argo-cd.readthedocs.io/en/stable/user-guide/)
- [Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

**Our Documentation:**
- [NEXT_STEPS.md](NEXT_STEPS.md) - What to do next
- [CURRENT_STATUS.md](CURRENT_STATUS.md) - Current status
- [argocd/README.md](argocd/README.md) - ArgoCD setup guide

---

**Port-Forward Running:** ✅ Yes (Process ID: 3)  
**URL:** https://localhost:8080  
**Status:** Ready to use!

**Happy GitOps! 🚀**
