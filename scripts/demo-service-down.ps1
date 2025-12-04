# Script Demo: Service Down Monitoring
# Usage: .\scripts\demo-service-down.ps1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("down", "up", "status")]
    [string]$Action = "status"
)

Write-Host "🔧 FastFood - Service Down Demo" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Define services to test
$services = @(
    @{Name="auth-service"; Deployment="auth"; Port=5001},
    @{Name="order-service"; Deployment="order"; Port=5002},
    @{Name="restaurant-service"; Deployment="restaurant"; Port=5003},
    @{Name="payment-service"; Deployment="payment"; Port=5004}
)

function Get-ServiceStatus {
    Write-Host "📊 Checking service status..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check kubectl pods
    kubectl get pods -n default 2>$null | Select-String -Pattern "auth|order|restaurant|payment"
    
    Write-Host ""
    Write-Host "📈 Prometheus Targets:" -ForegroundColor Cyan
    
    # Check Prometheus targets (if accessible)
    try {
        $promUrl = "http://localhost:9090/api/v1/targets"
        $targets = Invoke-RestMethod -Uri $promUrl -TimeoutSec 5 -ErrorAction SilentlyContinue
        foreach ($target in $targets.data.activeTargets) {
            $status = if ($target.health -eq "up") { "✅" } else { "❌" }
            Write-Host "  $status $($target.labels.job): $($target.health)"
        }
    } catch {
        Write-Host "  ⚠️ Prometheus not accessible locally" -ForegroundColor Yellow
    }
}

function Stop-DemoService {
    param([string]$ServiceName)
    
    Write-Host "⏹️ Stopping $ServiceName..." -ForegroundColor Red
    
    # Scale down the deployment to 0
    kubectl scale deployment $ServiceName --replicas=0 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $ServiceName scaled to 0 replicas" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to stop $ServiceName" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "⏳ Waiting 10 seconds for metrics to update..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "📊 Check Grafana Dashboard to see the change!" -ForegroundColor Cyan
    Write-Host "   URL: http://34.177.101.213" -ForegroundColor White
    Write-Host "   Login: admin / FastFood@2025!" -ForegroundColor White
}

function Start-DemoService {
    param([string]$ServiceName)
    
    Write-Host "▶️ Starting $ServiceName..." -ForegroundColor Green
    
    # Scale up the deployment to 1
    kubectl scale deployment $ServiceName --replicas=1 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $ServiceName scaled to 1 replica" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to start $ServiceName" -ForegroundColor Red
    }
}

switch ($Action) {
    "status" {
        Get-ServiceStatus
    }
    "down" {
        Write-Host "🔴 Demo: Taking services DOWN" -ForegroundColor Red
        Write-Host ""
        
        # Stop test-metrics-exporter to simulate monitoring seeing "down"
        Stop-DemoService -ServiceName "test-metrics-exporter"
        
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Open Grafana: http://34.177.101.213"
        Write-Host "   2. Go to Alerting > Alert rules"
        Write-Host "   3. You should see alerts firing!"
        Write-Host ""
        Write-Host "   To restore: .\scripts\demo-service-down.ps1 -Action up"
    }
    "up" {
        Write-Host "🟢 Demo: Bringing services UP" -ForegroundColor Green
        Write-Host ""
        
        Start-DemoService -ServiceName "test-metrics-exporter"
        
        Write-Host ""
        Write-Host "⏳ Service should be back online in ~30 seconds"
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Demo script finished!" -ForegroundColor Cyan
