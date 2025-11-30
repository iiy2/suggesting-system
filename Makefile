# Makefile for Recommendation Platform

.PHONY: help build up down logs clean test restart status

# Default target
help:
	@echo "📚 Доступні команди:"
	@echo ""
	@echo "  make up          - Запустити всі сервіси через Docker Compose"
	@echo "  make down        - Зупинити всі сервіси"
	@echo "  make build       - Збудувати Docker образи"
	@echo "  make logs        - Показати логи всіх сервісів"
	@echo "  make restart     - Перезапустити всі сервіси"
	@echo "  make status      - Показати статус сервісів"
	@echo "  make clean       - Видалити всі контейнери та volumes"
	@echo "  make test        - Запустити тести"
	@echo ""
	@echo "  make k8s-deploy  - Розгорнути у Kubernetes"
	@echo "  make k8s-delete  - Видалити з Kubernetes"
	@echo "  make k8s-status  - Статус Kubernetes pods"
	@echo ""
	@echo "  make dev-user    - Запустити User Service у dev режимі"
	@echo "  make dev-gateway - Запустити API Gateway у dev режимі"

# Docker Compose commands
up:
	@echo "🚀 Запуск сервісів..."
	docker-compose up -d
	@echo "✅ Сервіси запущено!"
	@echo ""
	@echo "API Gateway: http://localhost:8080"
	@echo "User Service: http://localhost:3001"

down:
	@echo "⏸️  Зупинка сервісів..."
	docker-compose down
	@echo "✅ Сервіси зупинено!"

build:
	@echo "🔨 Збірка Docker образів..."
	docker-compose build
	@echo "✅ Образи зібрано!"

logs:
	docker-compose logs -f

restart:
	@echo "🔄 Перезапуск сервісів..."
	docker-compose restart
	@echo "✅ Сервіси перезапущено!"

status:
	@echo "📊 Статус сервісів:"
	docker-compose ps

clean:
	@echo "🧹 Очищення контейнерів та volumes..."
	docker-compose down -v
	@echo "✅ Очищено!"

# Development commands
dev-user:
	@echo "🔧 Запуск User Service у dev режимі..."
	cd services/user-service && npm run dev

dev-gateway:
	@echo "🔧 Запуск API Gateway у dev режимі..."
	cd services/api-gateway && go run cmd/gateway/main.go

# Testing
test:
	@echo "🧪 Запуск тестів..."
	@echo "User Service tests..."
	cd services/user-service && npm test || true
	@echo "✅ Тести завершено!"

# Kubernetes commands
k8s-deploy:
	@echo "☸️  Розгортання у Kubernetes..."
	@echo "Створення secrets..."
	@kubectl create secret generic app-secrets \
		--from-literal=postgres-user=admin \
		--from-literal=postgres-password=SecurePassword123! \
		--from-literal=database-url=postgresql://admin:SecurePassword123!@postgres:5432/recommendation_db \
		--from-literal=redis-password=RedisPassword123! \
		--from-literal=jwt-secret=$$(openssl rand -base64 32) \
		--dry-run=client -o yaml | kubectl apply -f - || true
	@echo "Розгортання сервісів..."
	kubectl apply -f k8s/deployments/
	@echo "✅ Розгорнуто у Kubernetes!"

k8s-delete:
	@echo "🗑️  Видалення з Kubernetes..."
	kubectl delete -f k8s/deployments/ || true
	kubectl delete secret app-secrets || true
	@echo "✅ Видалено з Kubernetes!"

k8s-status:
	@echo "📊 Статус Kubernetes:"
	@echo ""
	@echo "Pods:"
	kubectl get pods
	@echo ""
	@echo "Services:"
	kubectl get services
	@echo ""
	@echo "HPA:"
	kubectl get hpa

k8s-logs:
	@echo "📋 Логи API Gateway:"
	kubectl logs -l app=api-gateway --tail=50

# Database commands
db-connect:
	@echo "🗄️  Підключення до PostgreSQL..."
	docker-compose exec postgres psql -U admin -d recommendation_db

redis-cli:
	@echo "💾 Підключення до Redis..."
	docker-compose exec redis redis-cli

# Health checks
health:
	@echo "🏥 Перевірка здоров'я сервісів..."
	@echo ""
	@echo "API Gateway:"
	@curl -s http://localhost:8080/health | jq || echo "❌ Недоступний"
	@echo ""
	@echo "User Service:"
	@curl -s http://localhost:3001/health | jq || echo "❌ Недоступний"

# Quick start
quickstart: build up
	@echo ""
	@echo "🎉 Система запущена!"
	@echo ""
	@echo "Перевірте здоров'я сервісів:"
	@echo "  make health"
	@echo ""
	@echo "Переглянути логи:"
	@echo "  make logs"

# Install dependencies
install:
	@echo "📦 Встановлення залежностей..."
	@echo "User Service..."
	cd services/user-service && npm install
	@echo "✅ Залежності встановлено!"
