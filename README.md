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

2. **User Service** (TypeScript + Node.js)
   - Управління користувачами
   - Автентифікація та авторизація (JWT)
   - Профілі користувачів
   - ES6 Modules, Strict TypeScript
   - Порт: 3001

3. **Content Service** (TypeScript + Node.js 22)
   - Управління контентом (e-Learning курси, новини)
   - CRUD операції для контенту
   - Кешування через Redis
   - Порт: 3002

4. **Recommendation Engine** (Go)
   - Гібридна модель рекомендацій
   - Collaborative Filtering (Item-Based CF)
   - Content-Based фільтрація
   - Порт: 8081

5. **Web Application** (SvelteKit + TypeScript)
   - Сучасний веб-інтерфейс
   - Svelte 5 + SvelteKit 2
   - Skeleton UI компоненти
   - SSR підтримка
   - Порт: 3000

### Бази даних

- **PostgreSQL** - основна реляційна БД для User та Content сервісів
- **Redis** - кешування, сесії, Rate Limiting

## Технологічний стек

### Backend
- **Go**: 1.23 (API Gateway, Recommendation Engine)
- **Node.js**: 22 LTS (User Service, Content Service)
- **TypeScript**: 5.7.2 (строгий режим, ES Modules)

### Frontend
- **SvelteKit**: 2.7.4 (SSR framework)
- **Svelte**: 5.1.16 (reactive UI)
- **Skeleton UI**: 2.10.2 (component library)
- **Tailwind CSS**: 3.4.15
- **Axios**: 1.7.9

### Databases
- **PostgreSQL**: 15-alpine
- **Redis**: 7-alpine

### Frameworks & Libraries
- **Backend**: Express.js 4.21, Gin, Sequelize 6.37
- **Frontend**: Vite 6.0.3, TypeScript 5.7.2

### DevOps
- **Контейнеризація**: Docker
- **Оркестрація**: Kubernetes (ready)
- **CI/CD**: GitHub Actions (планується)

## Структура проєкту

```
suggesting-system/
├── services/
│   ├── api-gateway/          # API Gateway (Go 1.23)
│   ├── user-service/         # User Service (TypeScript + Node.js 22)
│   ├── content-service/      # Content Service (TypeScript + Node.js 22)
│   └── recommendation-engine/ # Recommendation Engine (Go 1.23)
├── web-app/                  # Web Application (SvelteKit + TypeScript)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # UI components
│   │   │   ├── services/    # API clients
│   │   │   ├── stores/      # Svelte stores
│   │   │   └── types/       # TypeScript types
│   │   └── routes/          # SvelteKit pages
│   ├── Dockerfile
│   └── README.md
├── scripts/                  # Utility scripts (init-db.sql)
├── docker-compose.yml        # Локальна розробка (5 сервісів)
└── README.md                 # Ця документація
```

## Локальна розробка

### Передумови

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Go**: 1.23+ (для розробки backend)
- **Node.js**: 22+ (для розробки frontend/services)
- **npm**: 10+

### Швидкий старт (Docker Compose)

1. **Клонувати репозиторій**:
   ```bash
   git clone <repository-url>
   cd suggesting-system
   ```

2. **Запустити всі сервіси**:
   ```bash
   docker-compose up -d
   ```

   Це запустить:
   - PostgreSQL (порт 5432)
   - Redis (порт 6379)
   - API Gateway (порт 8080)
   - User Service (порт 3001)
   - Content Service (порт 3002)
   - Recommendation Engine (порт 8081)
   - Web App (порт 3000)

3. **Перевірити статус**:
   ```bash
   docker-compose ps
   ```

4. **Переглянути логи**:
   ```bash
   docker-compose logs -f

   # Логи окремого сервісу
   docker-compose logs -f web-app
   ```

5. **Зупинити систему**:
   ```bash
   docker-compose down

   # Видалити також volumes (БД дані)
   docker-compose down -v
   ```

### Доступ до сервісів

- **Web Application**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001
- **Content Service**: http://localhost:3002
- **Recommendation Engine**: http://localhost:8081
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Розробка окремих сервісів

#### Web Application (SvelteKit)

```bash
cd web-app
npm install
npm run dev
# Відкрийте http://localhost:3000
```

Детальна документація: [web-app/README.md](web-app/README.md)

#### User Service

```bash
cd services/user-service
npm install
npm run dev
```

#### Content Service

```bash
cd services/content-service
npm install
npm run dev
```

#### API Gateway

```bash
cd services/api-gateway
go mod download
go run cmd/main.go
```

#### Recommendation Engine

```bash
cd services/recommendation-engine
go mod download
go run cmd/main.go
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
