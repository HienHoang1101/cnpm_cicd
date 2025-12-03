# FastFood Delivery - PowerShell Commands
# Run: .\scripts\commands.ps1

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Show-Help {
    Write-Color "`nFastFood Delivery - Available Commands" "Cyan"
    Write-Color "========================================" "Cyan"
    Write-Color ""
    Write-Color "Development:" "Green"
    Write-Color "  .\commands.ps1 install        - Install all dependencies"
    Write-Color "  .\commands.ps1 dev            - Start all services"
    Write-Color "  .\commands.ps1 dev-auth       - Start auth service only"
    Write-Color ""
    Write-Color "Testing:" "Green"
    Write-Color "  .\commands.ps1 test           - Run all tests"
    Write-Color "  .\commands.ps1 test-coverage  - Run tests with coverage"
    Write-Color ""
    Write-Color "Docker:" "Green"
    Write-Color "  .\commands.ps1 build          - Build all Docker images"
    Write-Color "  .\commands.ps1 start          - Start all containers"
    Write-Color "  .\commands.ps1 stop           - Stop all containers"
    Write-Color "  .\commands.ps1 logs           - View container logs"
    Write-Color ""
    Write-Color "Monitoring:" "Green"
    Write-Color "  .\commands.ps1 monitoring-up  - Start monitoring stack"
    Write-Color "  .\commands.ps1 monitoring-down- Stop monitoring stack"
    Write-Color "  .\commands.ps1 grafana        - Open Grafana"
    Write-Color ""
}

function Install-Dependencies {
    Write-Color "Installing dependencies..." "Cyan"
    
    $services = @("auth", "order", "restaurant", "payment-service", 
                  "notification-service", "admin-service", "food-delivery-server", "tests")
    
    foreach ($service in $services) {
        if (Test-Path "$service/package.json") {
            Write-Color "Installing $service..." "Yellow"
            Push-Location $service
            npm install
            Pop-Location
        }
    }
    
    Write-Color "All dependencies installed!" "Green"
}

function Start-Dev {
    Write-Color "Starting all services..." "Cyan"
    docker-compose up -d
    Write-Color "All services started!" "Green"
    Write-Color ""
    Write-Color "Services available at:" "Cyan"
    Write-Color "  Auth:         http://localhost:5001"
    Write-Color "  Order:        http://localhost:5002"
    Write-Color "  Restaurant:   http://localhost:5003"
    Write-Color "  Payment:      http://localhost:5004"
    Write-Color "  Notification: http://localhost:5005"
    Write-Color "  Admin:        http://localhost:5006"
    Write-Color "  Delivery:     http://localhost:5007"
}

function Run-Tests {
    Write-Color "Running all tests..." "Cyan"
    
    $services = @("auth", "order", "restaurant", "payment-service", 
                  "notification-service", "admin-service", "food-delivery-server")
    
    foreach ($service in $services) {
        if (Test-Path "$service/package.json") {
            Write-Color "Testing $service..." "Yellow"
            Push-Location $service
            npm test
            Pop-Location
        }
    }
    
    Write-Color "All tests completed!" "Green"
}

function Run-TestsCoverage {
    Write-Color "Running tests with coverage..." "Cyan"
    
    $services = @("auth", "order", "restaurant", "payment-service", 
                  "notification-service", "admin-service", "food-delivery-server")
    
    foreach ($service in $services) {
        if (Test-Path "$service/package.json") {
            Write-Color "Testing $service with coverage..." "Yellow"
            Push-Location $service
            npm run test:coverage
            Pop-Location
        }
    }
    
    Write-Color "Coverage reports generated!" "Green"
}

function Build-Docker {
    Write-Color "Building Docker images..." "Cyan"
    docker-compose build
    Write-Color "All images built!" "Green"
}

function Start-Containers {
    Write-Color "Starting containers..." "Cyan"
    docker-compose up -d
    Write-Color "Containers started!" "Green"
}

function Stop-Containers {
    Write-Color "Stopping containers..." "Cyan"
    docker-compose down
    Write-Color "Containers stopped!" "Green"
}

function Show-Logs {
    docker-compose logs -f
}

function Start-Monitoring {
    Write-Color "Starting monitoring stack..." "Cyan"
    docker-compose -f monitoring/docker-compose.monitoring.yml up -d
    Write-Color "Monitoring started!" "Green"
    Write-Color ""
    Write-Color "Monitoring available at:" "Cyan"
    Write-Color "  Grafana:      http://localhost:3001 (admin/admin123)"
    Write-Color "  Prometheus:   http://localhost:9090"
    Write-Color "  Alertmanager: http://localhost:9093"
}

function Stop-Monitoring {
    Write-Color "Stopping monitoring stack..." "Cyan"
    docker-compose -f monitoring/docker-compose.monitoring.yml down
    Write-Color "Monitoring stopped!" "Green"
}

function Open-Grafana {
    Start-Process "http://localhost:3001"
}

function Open-Prometheus {
    Start-Process "http://localhost:9090"
}

# Execute command
switch ($Command.ToLower()) {
    "help"           { Show-Help }
    "install"        { Install-Dependencies }
    "dev"            { Start-Dev }
    "dev-auth"       { Push-Location auth; npm run dev; Pop-Location }
    "dev-order"      { Push-Location order; npm run dev; Pop-Location }
    "test"           { Run-Tests }
    "test-coverage"  { Run-TestsCoverage }
    "build"          { Build-Docker }
    "start"          { Start-Containers }
    "stop"           { Stop-Containers }
    "restart"        { Stop-Containers; Start-Containers }
    "logs"           { Show-Logs }
    "monitoring-up"  { Start-Monitoring }
    "monitoring-down"{ Stop-Monitoring }
    "grafana"        { Open-Grafana }
    "prometheus"     { Open-Prometheus }
    "up"             { Start-Containers; Start-Monitoring }
    "down"           { Stop-Containers; Stop-Monitoring }
    "status"         { docker-compose ps }
    default          { Write-Color "Unknown command: $Command" "Red"; Show-Help }
}
