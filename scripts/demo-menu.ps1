# 🎬 KỊCH BẢN DEMO CI/CD HOÀN CHỈNH
# FastFood Delivery Platform
# ================================

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║           🍔 FASTFOOD DELIVERY - DEMO CI/CD 🍔              ║
║                   University Project 2025                    ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$menu = @"

📋 MENU DEMO:
═══════════════════════════════════════════════════════════════
[1] 🔴 Demo Test FAIL  - Tạo test fail, push code, xem pipeline
[2] 🟢 Demo Test PASS  - Fix test, push code, xem pipeline success
[3] ⚡ Demo Load Test  - Chạy performance testing
[4] 💀 Demo Service Down - Tắt service, xem monitoring + alert
[5] 💚 Demo Service Up   - Bật lại service, xem recovery
[6] 📊 Mở Grafana Dashboard
[7] 🔍 Mở GitHub Actions
[8] 📈 Gửi SonarQube metrics
[0] ❌ Thoát
═══════════════════════════════════════════════════════════════
"@

function Show-Menu {
    Write-Host $menu -ForegroundColor White
    $choice = Read-Host "Chọn demo (0-8)"
    return $choice
}

function Demo-TestFail {
    Write-Host ""
    Write-Host "🔴 DEMO 1: TEST FAIL" -ForegroundColor Red
    Write-Host "════════════════════" -ForegroundColor Red
    
    # Rename pass test to disable it
    if (Test-Path "auth\tests\demo-pass.test.js") {
        Rename-Item "auth\tests\demo-pass.test.js" "auth\tests\demo-pass.test.js.bak" -Force
    }
    
    # Enable fail test
    if (Test-Path "auth\tests\demo-fail.test.js.bak") {
        Rename-Item "auth\tests\demo-fail.test.js.bak" "auth\tests\demo-fail.test.js" -Force
    }
    
    Write-Host "✅ Demo fail test enabled" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Pushing code to trigger pipeline..." -ForegroundColor Yellow
    
    git add -A
    git commit -m "demo: add failing test to demonstrate CI/CD"
    git push
    
    Write-Host ""
    Write-Host "🔗 Open GitHub Actions to watch: https://github.com/HienHoang1101/cnpm_cicd/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏳ Wait ~3-5 minutes for pipeline to complete" -ForegroundColor Yellow
    Write-Host "👀 Expected: Pipeline should FAIL at unit-tests job" -ForegroundColor Red
}

function Demo-TestPass {
    Write-Host ""
    Write-Host "🟢 DEMO 2: TEST PASS" -ForegroundColor Green
    Write-Host "════════════════════" -ForegroundColor Green
    
    # Disable fail test
    if (Test-Path "auth\tests\demo-fail.test.js") {
        Rename-Item "auth\tests\demo-fail.test.js" "auth\tests\demo-fail.test.js.bak" -Force
    }
    
    # Enable pass test
    if (Test-Path "auth\tests\demo-pass.test.js.bak") {
        Rename-Item "auth\tests\demo-pass.test.js.bak" "auth\tests\demo-pass.test.js" -Force
    }
    
    Write-Host "✅ Demo pass test enabled" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Pushing code to trigger pipeline..." -ForegroundColor Yellow
    
    git add -A
    git commit -m "fix: fix failing test - all tests pass now"
    git push
    
    Write-Host ""
    Write-Host "🔗 Open GitHub Actions to watch: https://github.com/HienHoang1101/cnpm_cicd/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏳ Wait ~3-5 minutes for pipeline to complete" -ForegroundColor Yellow
    Write-Host "👀 Expected: Pipeline should PASS ✅" -ForegroundColor Green
}

function Demo-LoadTest {
    Write-Host ""
    Write-Host "⚡ DEMO 3: LOAD TESTING" -ForegroundColor Yellow
    Write-Host "═══════════════════════" -ForegroundColor Yellow
    
    Write-Host "📋 Prerequisites:" -ForegroundColor Cyan
    Write-Host "   - Services running locally or accessible"
    Write-Host "   - Artillery installed (npm install -g artillery)"
    Write-Host ""
    
    $confirm = Read-Host "Start load test? (y/n)"
    if ($confirm -eq "y") {
        & "$PSScriptRoot\run-load-test.ps1"
    }
}

function Demo-ServiceDown {
    Write-Host ""
    Write-Host "💀 DEMO 4: SERVICE DOWN" -ForegroundColor Red
    Write-Host "═══════════════════════" -ForegroundColor Red
    
    Write-Host "⚠️ This will scale down test-metrics-exporter to 0" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -eq "y") {
        kubectl scale deployment test-metrics-exporter -n monitoring --replicas=0
        
        Write-Host ""
        Write-Host "✅ Service scaled down!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Now check Grafana Dashboard:" -ForegroundColor Cyan
        Write-Host "   URL: http://34.177.101.213" -ForegroundColor White
        Write-Host "   Login: admin / FastFood@2025!" -ForegroundColor White
        Write-Host ""
        Write-Host "👀 Things to observe:" -ForegroundColor Yellow
        Write-Host "   1. Metrics will stop updating (flatline)"
        Write-Host "   2. If alerts configured, you'll see firing alerts"
        Write-Host "   3. Prometheus targets will show 'DOWN'"
    }
}

function Demo-ServiceUp {
    Write-Host ""
    Write-Host "💚 DEMO 5: SERVICE RECOVERY" -ForegroundColor Green
    Write-Host "═══════════════════════════" -ForegroundColor Green
    
    kubectl scale deployment test-metrics-exporter -n monitoring --replicas=1
    
    Write-Host ""
    Write-Host "✅ Service scaling back up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Wait ~30 seconds for pod to be ready" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "👀 Check Grafana - metrics should resume!" -ForegroundColor Cyan
}

function Open-Grafana {
    Write-Host ""
    Write-Host "📊 Opening Grafana Dashboard..." -ForegroundColor Cyan
    Start-Process "http://34.177.101.213"
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor Yellow
    Write-Host "   Username: admin" -ForegroundColor White
    Write-Host "   Password: FastFood@2025!" -ForegroundColor White
}

function Open-GitHub {
    Write-Host ""
    Write-Host "🔍 Opening GitHub Actions..." -ForegroundColor Cyan
    Start-Process "https://github.com/HienHoang1101/cnpm_cicd/actions"
}

function Send-SonarMetrics {
    Write-Host ""
    Write-Host "📈 Sending SonarQube Metrics..." -ForegroundColor Cyan
    & "$PSScriptRoot\sonar-to-monitoring.ps1"
}

# Main loop
do {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" { Demo-TestFail }
        "2" { Demo-TestPass }
        "3" { Demo-LoadTest }
        "4" { Demo-ServiceDown }
        "5" { Demo-ServiceUp }
        "6" { Open-Grafana }
        "7" { Open-GitHub }
        "8" { Send-SonarMetrics }
        "0" { 
            Write-Host ""
            Write-Host "👋 Goodbye! Good luck with your demo!" -ForegroundColor Cyan
            break 
        }
        default { Write-Host "❌ Invalid choice!" -ForegroundColor Red }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Read-Host "Press Enter to continue..."
    }
} while ($choice -ne "0")
