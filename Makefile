# FastFood Delivery - Makefile
# Các lệnh tiện ích cho development và deployment

.PHONY: help install dev test test-coverage build start stop logs clean monitoring deploy

# Colors
CYAN=\033[0;36m
GREEN=\033[0;32m
YELLOW=\033[0;33m
RED=\033[0;31m
NC=\033[0m # No Color

# Default target
help:
	@echo ""
	@echo "$(CYAN)FastFood Delivery - Available Commands$(NC)"
	@echo "========================================"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make install        - Install all dependencies"
	@echo "  make dev            - Start all services in development mode"
	@echo "  make dev-auth       - Start auth service only"
	@echo "  make dev-order      - Start order service only"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test           - Run all tests"
	@echo "  make test-auth      - Run auth service tests"
	@echo "  make test-order     - Run order service tests"
	@echo "  make test-coverage  - Run tests with coverage"
	@echo "  make test-ci        - Run tests in CI mode"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make build          - Build all Docker images"
	@echo "  make start          - Start all containers"
	@echo "  make stop           - Stop all containers"
	@echo "  make restart        - Restart all containers"
	@echo "  make logs           - View container logs"
	@echo "  make clean          - Remove all containers and images"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  make monitoring-up   - Start monitoring stack"
	@echo "  make monitoring-down - Stop monitoring stack"
	@echo "  make grafana         - Open Grafana in browser"
	@echo "  make prometheus      - Open Prometheus in browser"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  make db-up          - Start MongoDB"
	@echo "  make db-down        - Stop MongoDB"
	@echo "  make db-seed        - Seed database with sample data"
	@echo ""

# ============ Installation ============
install:
	@echo "$(CYAN)Installing dependencies...$(NC)"
	cd auth && npm install
	cd order && npm install
	cd restaurant && npm install
	cd payment-service && npm install
	cd notification-service && npm install
	cd admin-service && npm install
	cd food-delivery-server && npm install
	cd tests && npm install
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-auth:
	cd auth && npm install

install-order:
	cd order && npm install

install-restaurant:
	cd restaurant && npm install

install-payment:
	cd payment-service && npm install

install-notification:
	cd notification-service && npm install

install-admin:
	cd admin-service && npm install

install-delivery:
	cd food-delivery-server && npm install

# ============ Development ============
dev:
	@echo "$(CYAN)Starting all services in development mode...$(NC)"
	docker-compose up -d

dev-auth:
	cd auth && npm run dev

dev-order:
	cd order && npm run dev

dev-restaurant:
	cd restaurant && npm run dev

dev-payment:
	cd payment-service && npm run dev

dev-notification:
	cd notification-service && npm run dev

dev-admin:
	cd admin-service && npm run dev

dev-delivery:
	cd food-delivery-server && npm run dev

# ============ Testing ============
test:
	@echo "$(CYAN)Running all tests...$(NC)"
	cd auth && npm test
	cd order && npm test
	cd restaurant && npm test
	cd payment-service && npm test
	cd notification-service && npm test
	cd admin-service && npm test
	cd food-delivery-server && npm test
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-auth:
	@echo "$(CYAN)Running auth service tests...$(NC)"
	cd auth && npm test

test-order:
	@echo "$(CYAN)Running order service tests...$(NC)"
	cd order && npm test

test-restaurant:
	@echo "$(CYAN)Running restaurant service tests...$(NC)"
	cd restaurant && npm test

test-payment:
	@echo "$(CYAN)Running payment service tests...$(NC)"
	cd payment-service && npm test

test-notification:
	@echo "$(CYAN)Running notification service tests...$(NC)"
	cd notification-service && npm test

test-admin:
	@echo "$(CYAN)Running admin service tests...$(NC)"
	cd admin-service && npm test

test-delivery:
	@echo "$(CYAN)Running delivery service tests...$(NC)"
	cd food-delivery-server && npm test

test-coverage:
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	cd auth && npm run test:coverage
	cd order && npm run test:coverage
	cd restaurant && npm run test:coverage
	cd payment-service && npm run test:coverage
	cd notification-service && npm run test:coverage
	cd admin-service && npm run test:coverage
	cd food-delivery-server && npm run test:coverage
	@echo "$(GREEN)✓ Coverage reports generated$(NC)"

test-ci:
	@echo "$(CYAN)Running tests in CI mode...$(NC)"
	cd auth && npm run test:ci
	cd order && npm run test:ci
	cd restaurant && npm run test:ci
	cd payment-service && npm run test:ci
	cd notification-service && npm run test:ci
	cd admin-service && npm run test:ci
	cd food-delivery-server && npm run test:ci

test-integration:
	@echo "$(CYAN)Running integration tests...$(NC)"
	cd tests && npm test -- integration

test-e2e:
	@echo "$(CYAN)Running E2E tests...$(NC)"
	cd tests && npm test -- e2e

# ============ Docker ============
build:
	@echo "$(CYAN)Building all Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ All images built$(NC)"

build-auth:
	docker-compose build auth-service

build-order:
	docker-compose build order-service

start:
	@echo "$(CYAN)Starting all containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ All containers started$(NC)"
	@echo ""
	@echo "Services available at:"
	@echo "  Auth:         http://localhost:5001"
	@echo "  Order:        http://localhost:5002"
	@echo "  Restaurant:   http://localhost:5003"
	@echo "  Payment:      http://localhost:5004"
	@echo "  Notification: http://localhost:5005"
	@echo "  Admin:        http://localhost:5006"
	@echo "  Delivery:     http://localhost:5007"

stop:
	@echo "$(CYAN)Stopping all containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ All containers stopped$(NC)"

restart:
	@echo "$(CYAN)Restarting all containers...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ All containers restarted$(NC)"

logs:
	docker-compose logs -f

logs-auth:
	docker-compose logs -f auth-service

logs-order:
	docker-compose logs -f order-service

clean:
	@echo "$(RED)Removing all containers and images...$(NC)"
	docker-compose down -v --rmi all
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

# ============ Monitoring ============
monitoring-up:
	@echo "$(CYAN)Starting monitoring stack...$(NC)"
	docker-compose -f monitoring/docker-compose.monitoring.yml up -d
	@echo "$(GREEN)✓ Monitoring stack started$(NC)"
	@echo ""
	@echo "Monitoring available at:"
	@echo "  Grafana:      http://localhost:3001 (admin/admin123)"
	@echo "  Prometheus:   http://localhost:9090"
	@echo "  Alertmanager: http://localhost:9093"
	@echo "  Loki:         http://localhost:3100"

monitoring-down:
	@echo "$(CYAN)Stopping monitoring stack...$(NC)"
	docker-compose -f monitoring/docker-compose.monitoring.yml down
	@echo "$(GREEN)✓ Monitoring stack stopped$(NC)"

monitoring-logs:
	docker-compose -f monitoring/docker-compose.monitoring.yml logs -f

grafana:
	@echo "$(CYAN)Opening Grafana...$(NC)"
	start http://localhost:3001

prometheus:
	@echo "$(CYAN)Opening Prometheus...$(NC)"
	start http://localhost:9090

# ============ Database ============
db-up:
	@echo "$(CYAN)Starting MongoDB...$(NC)"
	docker-compose up -d mongodb
	@echo "$(GREEN)✓ MongoDB started$(NC)"

db-down:
	docker-compose stop mongodb

db-seed:
	@echo "$(CYAN)Seeding database...$(NC)"
	cd auth && npm run seed:admin
	@echo "$(GREEN)✓ Database seeded$(NC)"

# ============ Quick Commands ============
up: start monitoring-up
	@echo ""
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✓ FastFood Delivery is running!$(NC)"
	@echo "$(GREEN)========================================$(NC)"

down: stop monitoring-down
	@echo "$(GREEN)✓ FastFood Delivery stopped$(NC)"

status:
	@echo "$(CYAN)Container Status:$(NC)"
	docker-compose ps
	@echo ""
	@echo "$(CYAN)Monitoring Status:$(NC)"
	docker-compose -f monitoring/docker-compose.monitoring.yml ps

# ============ CI/CD ============
ci-build:
	@echo "$(CYAN)CI Build...$(NC)"
	docker-compose build --no-cache

ci-test:
	@echo "$(CYAN)CI Test...$(NC)"
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit
	docker-compose -f docker-compose.test.yml down -v

lint:
	@echo "$(CYAN)Linting...$(NC)"
	cd food-delivery-admin && npm run lint
	cd food-delivery-restuarant-web && npm run lint
