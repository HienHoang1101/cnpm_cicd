# Script to send SonarQube metrics to Cloud Monitoring
# Usage: .\scripts\sonar-to-monitoring.ps1

$SonarUser = "admin"
$SonarPassword = "admin123"
$SonarUrl = "http://localhost:9000"
$ProjectKey = "fastfood-delivery"
$MonitoringUrl = "http://34.124.252.97:9091"

Write-Host "Fetching SonarQube metrics..." -ForegroundColor Cyan

# Create auth header with basic auth
$headers = @{
    Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${SonarUser}:${SonarPassword}"))
}

# Get metrics from SonarQube
$metricKeys = "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc,security_hotspots"
$uri = $SonarUrl + "/api/measures/component?component=" + $ProjectKey + "&metricKeys=" + $metricKeys

try {
    $response = Invoke-RestMethod -Uri $uri -Headers $headers
    
    # Parse metrics
    $bugs = 0
    $vulnerabilities = 0
    $codeSmells = 0
    $coverage = 0
    $duplications = 0
    $linesOfCode = 0
    $securityHotspots = 0
    
    foreach ($measure in $response.component.measures) {
        if ($measure.metric -eq "bugs") { $bugs = [int]$measure.value }
        if ($measure.metric -eq "vulnerabilities") { $vulnerabilities = [int]$measure.value }
        if ($measure.metric -eq "code_smells") { $codeSmells = [int]$measure.value }
        if ($measure.metric -eq "coverage") { $coverage = [double]$measure.value }
        if ($measure.metric -eq "duplicated_lines_density") { $duplications = [double]$measure.value }
        if ($measure.metric -eq "ncloc") { $linesOfCode = [int]$measure.value }
        if ($measure.metric -eq "security_hotspots") { $securityHotspots = [int]$measure.value }
    }
    
    Write-Host "SonarQube Metrics:" -ForegroundColor Green
    Write-Host "  Bugs: $bugs"
    Write-Host "  Vulnerabilities: $vulnerabilities"
    Write-Host "  Code Smells: $codeSmells"
    Write-Host "  Coverage: $coverage%"
    Write-Host "  Duplications: $duplications%"
    Write-Host "  Lines of Code: $linesOfCode"
    Write-Host "  Security Hotspots: $securityHotspots"
    
    # Send to Cloud Monitoring
    Write-Host "`nSending to Cloud Monitoring..." -ForegroundColor Cyan
    
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $body = @"
{
    "bugs": $bugs,
    "vulnerabilities": $vulnerabilities,
    "codeSmells": $codeSmells,
    "coverage": $coverage,
    "duplications": $duplications,
    "linesOfCode": $linesOfCode,
    "securityHotspots": $securityHotspots,
    "timestamp": "$timestamp"
}
"@
    
    $result = Invoke-RestMethod -Uri ($MonitoringUrl + "/api/sonar") -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Metrics sent to Cloud Monitoring successfully!" -ForegroundColor Green
    Write-Host "View dashboard: http://34.177.101.213" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
