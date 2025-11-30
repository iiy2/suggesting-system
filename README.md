# Рекомендаційна Платформа Контенту (e-Learning/Новини)

## Опис проєкту

Високонавантажена рекомендаційна платформа на базі мікросервісної архітектури з використанням Docker та Kubernetes.

## Архітектура

Система складається з наступних мікросервісів:

### Мікросервіси

1. **API Gateway** (Go)
   - Точка входу до системи
   - Rate Limiting
   - Маршрутизація запитів
   - Порт: 8080

2. **User Service** (TypeScript + Node.js) ✅ **ГОТОВО**
   - Управління користувачами
   - Автентифікація та авторизація (JWT)
   - Профілі користувачів
   - ES6 Modules, Strict TypeScript
   - Порт: 3001

3. **Content Service** (Node.js)
   - Управління контентом (e-Learning курси, новини)
   - CRUD операції для контенту
   - Порт: 3002

4. **Recommendation Engine** (Go)
   - Гібридна модель рекомендацій
   - Collaborative Filtering (Item-Based CF)
   - Content-Based фільтрація
   - Порт: 8081

### Бази даних

- **PostgreSQL** - основна реляційна БД для User та Content сервісів
- **Redis** - кешування, сесії, Rate Limiting

## Технологічний стек

- **Backend**: Go 1.21+, TypeScript 5.7 + Node.js 22 LTS
- **Databases**: PostgreSQL 15, Redis 7
- **Мови**: TypeScript (ES Modules/NodeNext), Go
- **Фреймворки**: Express.js 4.21, Gin
- **ORM**: Sequelize 6.37
- **Контейнеризація**: Docker
- **Оркестрація**: Kubernetes
- **CI/CD**: GitHub Actions (планується)

## Структура проєкту

```
suggesting-system/
├── services/
│   ├── api-gateway/          # API Gateway (Go)
│   ├── user-service/         # User Service (Node.js)
│   ├── content-service/      # Content Service (Node.js)
│   └── recommendation-engine/ # Recommendation Engine (Go)
├── k8s/
│   ├── deployments/          # Kubernetes Deployments
│   ├── services/             # Kubernetes Services
│   ├── configmaps/           # ConfigMaps
│   └── secrets/              # Secrets (не комітити!)
├── docker/
│   └── docker-compose.yml    # Для локальної розробки
├── scripts/                  # Utility scripts
└── docs/                     # Документація
```

## Локальна розробка

### Передумови

- Docker 20.10+
- Docker Compose 2.0+
- Go 1.21+
- Node.js 18+
- kubectl (для Kubernetes)
- minikube або kind (для локального K8s)

### Запуск через Docker Compose

```bash
# Запустити всі сервіси
docker-compose up -d

# Переглянути логи
docker-compose logs -f

# Зупинити сервіси
docker-compose down
```

### Запуск в Kubernetes

```bash
# Застосувати конфігурації
kubectl apply -f k8s/

# Перевірити статус
kubectl get pods
kubectl get services

# Переглянути логи
kubectl logs -f <pod-name>
```

## API Endpoints

### User Service
- `POST /api/users/register` - Реєстрація користувача
- `POST /api/users/login` - Вхід
- `GET /api/users/profile` - Отримати профіль
- `PUT /api/users/profile` - Оновити профіль

### Content Service
- `GET /api/content` - Список контенту
- `GET /api/content/:id` - Деталі контенту
- `POST /api/content` - Створити контент (admin)
- `PUT /api/content/:id` - Оновити контент (admin)
- `DELETE /api/content/:id` - Видалити контент (admin)

### Recommendation Engine
- `GET /api/recommendations/:userId` - Отримати рекомендації для користувача
- `POST /api/recommendations/interactions` - Записати взаємодію користувача з контентом

## Безпека

Система реалізує захист від OWASP Top 10:

- A01: Broken Access Control - JWT автентифікація, RBAC
- A02: Cryptographic Failures - bcrypt для паролів, HTTPS
- A03: Injection - параметризовані запити, валідація
- A05: Security Misconfiguration - security headers, безпечні defaults
- A07: Authentication Failures - rate limiting, session management
- Інші: CORS, CSP, Rate Limiting

## Масштабування

Kubernetes Horizontal Pod Autoscaler (HPA) налаштований для автоматичного масштабування на основі:
- CPU utilization (70%)
- Memory utilization (80%)
- Custom metrics (RPS)

## Моніторинг

- Prometheus - метрики
- Grafana - візуалізація
- ELK Stack - логування (планується)

## Автор

Ющук Ігор Іванович

## Ліцензія

MIT
