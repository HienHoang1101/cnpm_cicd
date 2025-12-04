# Script chạy Performance Test
# Usage: .\scripts\run-load-test.ps1

Write-Host "🚀 FastFood Delivery - Performance Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if artillery is installed
$artilleryInstalled = Get-Command artillery -ErrorAction SilentlyContinue
if (-not $artilleryInstalled) {
    Write-Host "📦 Installing Artillery..." -ForegroundColor Yellow
    npm install -g artillery
}

# Ensure we're in the right directory
$testDir = Join-Path $PSScriptRoot "..\tests\performance"

Write-Host ""
Write-Host "📋 Test Configuration:" -ForegroundColor Green
Write-Host "   Target: http://localhost:5001"
Write-Host "   Duration: ~4.5 minutes"
Write-Host "   Phases:"
Write-Host "     - Warm up: 30s @ 5 req/s"
Write-Host "     - Ramp up: 60s @ 10->30 req/s"
Write-Host "     - Sustained: 120s @ 30 req/s"
Write-Host "     - Spike: 30s @ 50 req/s"
Write-Host "     - Cool down: 30s @ 10 req/s"
Write-Host ""

# Run the load test
Write-Host "⚡ Starting Load Test..." -ForegroundColor Yellow
Write-Host ""

$reportPath = Join-Path $testDir "report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

# Run artillery with report output
artillery run (Join-Path $testDir "load-test.yml") --output $reportPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Load test completed successfully!" -ForegroundColor Green
    Write-Host "📊 Report saved to: $reportPath" -ForegroundColor Cyan
    
    # Generate HTML report
    $htmlReport = $reportPath -replace '.json', '.html'
    artillery report $reportPath --output $htmlReport
    Write-Host "📈 HTML Report: $htmlReport" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Load test failed!" -ForegroundColor Red
}
