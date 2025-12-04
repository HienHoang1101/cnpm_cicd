# ============================================
# KỊCH BẢN DEMO CHO THUYẾT TRÌNH
# ============================================
# Script này giúp demo các kịch bản test cho CI/CD

$MONITORING_URL = "http://34.124.252.97:9091"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   FASTFOOD DELIVERY - DEMO SCRIPTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Chọn kịch bản demo:" -ForegroundColor Yellow
    Write-Host "1. Demo TEST FAIL  - Tạo lỗi và xem trên Monitoring"
    Write-Host "2. Demo TEST PASS  - Fix lỗi và xem kết quả"
    Write-Host "3. Demo PERFORMANCE - Kiểm thử hiệu năng"
    Write-Host "4. Demo SERVICE DOWN - Mô phỏng service lỗi"
    Write-Host "5. Gửi metrics thủ công"
    Write-Host "6. Xem Grafana Dashboard"
    Write-Host "0. Thoát"
    Write-Host ""
}

function Run-FailTest {
    Write-Host "`n🔴 KỊCH BẢN 1: TEST FAIL" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    
    # Chạy test fail
    Write-Host "Đang chạy demo-fail.test.js..." -ForegroundColor Yellow
    
    Push-Location "auth"
    npm test -- --testPathPattern="demo-scenarios/demo-fail" 2>&1 | Out-Null
    Pop-Location
    
    # Gửi metrics - giả lập fail
    $body = @{
        service = "auth-service"
        results = @{
            total = 5
            passed = 0
            failed = 5
        }
        coverage = 0
    } | ConvertTo-Json -Compress
    
    Write-Host "`nGửi metrics FAIL đến monitoring..." -ForegroundColor Yellow
    try {
        $headers = @{"Content-Type" = "application/json"}
        Invoke-WebRequest -Uri "$MONITORING_URL/api/report" -Method POST -Body $body -Headers $headers -UseBasicParsing | Out-Null
        Write-Host "✅ Đã gửi metrics! Kiểm tra Grafana: http://34.177.101.213" -ForegroundColor Green
    } catch {
        Write-Host "❌ Lỗi gửi metrics: $_" -ForegroundColor Red
    }
    
    Write-Host "`n📊 Kết quả: 5 tests FAILED" -ForegroundColor Red
    Write-Host "👉 Mở Grafana để xem: Test Failure Rate tăng!" -ForegroundColor Yellow
}

function Run-PassTest {
    Write-Host "`n🟢 KỊCH BẢN 2: TEST PASS (After Fix)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Chạy test pass
    Write-Host "Đang chạy demo-pass.test.js..." -ForegroundColor Yellow
    
    Push-Location "auth"
    npm test -- --testPathPattern="demo-scenarios/demo-pass" 2>&1 | Out-Null
    Pop-Location
    
    # Gửi metrics - pass
    $body = @{
        service = "auth-service"
        results = @{
            total = 10
            passed = 10
            failed = 0
        }
        coverage = 85
    } | ConvertTo-Json -Compress
    
    Write-Host "`nGửi metrics PASS đến monitoring..." -ForegroundColor Yellow
    try {
        $headers = @{"Content-Type" = "application/json"}
        Invoke-WebRequest -Uri "$MONITORING_URL/api/report" -Method POST -Body $body -Headers $headers -UseBasicParsing | Out-Null
        Write-Host "✅ Đã gửi metrics! Kiểm tra Grafana" -ForegroundColor Green
    } catch {
        Write-Host "❌ Lỗi gửi metrics: $_" -ForegroundColor Red
    }
    
    Write-Host "`n📊 Kết quả: 10/10 tests PASSED" -ForegroundColor Green
    Write-Host "👉 Mở Grafana để xem: Test Pass Rate = 100%!" -ForegroundColor Yellow
}

function Run-PerformanceTest {
    Write-Host "`n⚡ KỊCH BẢN 3: PERFORMANCE TEST" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Write-Host "Đang chạy demo-performance.test.js..." -ForegroundColor Yellow
    
    Push-Location "auth"
    npm test -- --testPathPattern="demo-scenarios/demo-performance" --verbose
    Pop-Location
    
    Write-Host "`n📊 Xem output ở trên để biết performance metrics!" -ForegroundColor Cyan
}

function Demo-ServiceDown {
    Write-Host "`n💀 KỊCH BẢN 4: SERVICE DOWN" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    
    Write-Host "Mô phỏng service down bằng cách gửi metrics với 0 tests..." -ForegroundColor Yellow
    
    $services = @("auth-service", "order-service", "payment-service")
    
    foreach ($svc in $services) {
        if ($svc -eq "auth-service") {
            # Giả lập service down
            $body = @{
                service = $svc
                results = @{
                    total = 0
                    passed = 0
                    failed = 0
                }
                status = "DOWN"
                error = "Connection refused"
            } | ConvertTo-Json -Compress
        } else {
            # Service bình thường
            $body = @{
                service = $svc
                results = @{
                    total = 20
                    passed = 18
                    failed = 2
                }
            } | ConvertTo-Json -Compress
        }
        
        try {
            $headers = @{"Content-Type" = "application/json"}
            Invoke-WebRequest -Uri "$MONITORING_URL/api/report" -Method POST -Body $body -Headers $headers -UseBasicParsing | Out-Null
            if ($svc -eq "auth-service") {
                Write-Host "💀 $svc - DOWN (đã gửi)" -ForegroundColor Red
            } else {
                Write-Host "✅ $svc - OK (đã gửi)" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Lỗi gửi $svc" -ForegroundColor Red
        }
    }
    
    Write-Host "`n👉 Mở Grafana để xem: auth-service DOWN alert!" -ForegroundColor Yellow
}

function Send-ManualMetrics {
    Write-Host "`n📤 GỬI METRICS THỦ CÔNG" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    $service = Read-Host "Nhập tên service (vd: auth-service)"
    $total = Read-Host "Số tests (total)"
    $passed = Read-Host "Số tests passed"
    $failed = Read-Host "Số tests failed"
    
    $body = @{
        service = $service
        results = @{
            total = [int]$total
            passed = [int]$passed
            failed = [int]$failed
        }
    } | ConvertTo-Json -Compress
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        Invoke-WebRequest -Uri "$MONITORING_URL/api/report" -Method POST -Body $body -Headers $headers -UseBasicParsing | Out-Null
        Write-Host "✅ Đã gửi metrics cho $service!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    }
}

function Open-Grafana {
    Write-Host "`nMở Grafana Dashboard..." -ForegroundColor Cyan
    Start-Process "http://34.177.101.213"
    Write-Host "Login: admin / FastFood@2025!" -ForegroundColor Yellow
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Chọn"
    
    switch ($choice) {
        "1" { Run-FailTest }
        "2" { Run-PassTest }
        "3" { Run-PerformanceTest }
        "4" { Demo-ServiceDown }
        "5" { Send-ManualMetrics }
        "6" { Open-Grafana }
        "0" { Write-Host "Tạm biệt!" -ForegroundColor Cyan; break }
        default { Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nNhấn Enter để tiếp tục..." -ForegroundColor Gray
        Read-Host
        Clear-Host
    }
} while ($choice -ne "0")
