# Content Service

Мікросервіс для управління навчальним контентом (курси, статті, відео, новини).

## 🚀 Технології

- **Node.js 22 LTS** (Iron)
- **TypeScript 5.7.2** з strict mode
- **Express.js 4.21** - Web framework
- **Sequelize 6.37** - ORM для PostgreSQL
- **Redis 7** - Кешування
- **PostgreSQL 15** - База даних
- **Winston** - Логування
- **Joi** - Валідація
- **JWT** - Автентифікація
- **ES Modules** - NodeNext module system

## 📋 Функціональність

### API Endpoints

#### Публічні (без автентифікації)
- `GET /api/content` - Отримати список контенту з фільтрами та пагінацією
- `GET /api/content/:id` - Отримати контент за ID

#### Захищені (потрібна автентифікація)
- `POST /api/content` - Створити новий контент (admin, moderator)
- `PUT /api/content/:id` - Оновити контент (автор або admin)
- `DELETE /api/content/:id` - Видалити контент (автор або admin)

### Фільтри та пошук

Параметри запиту для `GET /api/content`:
- `page` - Номер сторінки (за замовчуванням: 1)
- `limit` - Кількість елементів на сторінку (за замовчуванням: 20)
- `contentType` - Тип контенту: course | article | video | news
- `category` - Категорія контенту
- `difficulty` - Рівень складності: beginner | intermediate | advanced
- `language` - Код мови (2 символи, наприклад: uk, en)
- `isPublished` - Статус публікації (true/false)
- `search` - Пошук за назвою та описом

### Моделі даних

**Content:**
```typescript
{
  id: string;              // UUID
  title: string;           // Назва (3-500 символів)
  description?: string;    // Опис (до 5000 символів)
  contentType: ContentType; // course | article | video | news
  category?: string;       // Категорія
  tags: string[];          // Теги
  authorId?: string;       // ID автора
  difficultyLevel?: DifficultyLevel; // beginner | intermediate | advanced
  durationMinutes?: number; // Тривалість у хвилинах
  language: string;        // Код мови (за замовчуванням: uk)
  isPublished: boolean;    // Чи опубліковано
  publishedAt?: Date;      // Дата публікації
  viewCount: number;       // Кількість переглядів
  rating: number;          // Рейтинг
  createdAt: Date;         // Дата створення
  updatedAt: Date;         // Дата оновлення
}
```

## 🔧 Розробка

### Встановлення залежностей

```bash
npm install
```

### Налаштування змінних середовища

Створіть файл `.env`:

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/content_db
DATABASE_SSL=false

# Redis
REDIS_URL=redis://redis:6379

# JWT (має співпадати з User Service)
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### Запуск у режимі розробки

```bash
# Hot reload з tsx
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Побудова production версії

```bash
# Компіляція TypeScript
npm run build

# Запуск production
npm start

# Очистити dist/ та перебудувати
npm run rebuild
```

## 🐳 Docker

### Побудова образу

```bash
docker build -t content-service:latest .
```

### Запуск контейнера

```bash
docker run -p 3002:3002 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/content_db \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-secret-key \
  content-service:latest
```

## 🔒 Безпека

### Автентифікація
- JWT токени для автентифікації
- Токени передаються через заголовок `Authorization: Bearer <token>`

### Авторизація
- **admin, moderator** - можуть створювати контент
- **Автор або admin** - можуть оновлювати/видаляти контент

### Rate Limiting
- Загальний API: 100 запитів за 15 хвилин
- Створення контенту: 10 запитів за годину

### OWASP Top 10
- ✅ Helmet.js для security headers
- ✅ CORS налаштування
- ✅ Input validation з Joi
- ✅ SQL injection захист (Sequelize ORM)
- ✅ Rate limiting
- ✅ Error handling без витоку інформації

## 📊 Кешування

### Redis стратегія:
- **Список контенту** - кешується на 5 хвилин
- **Інвалідація кешу** при створенні/оновленні/видаленні контенту

### Cache keys:
- `content:list:{where}:{page}:{limit}` - Список контенту

## 📝 Логування

Winston logger з рівнями:
- **error** - Помилки
- **warn** - Попередження
- **info** - Інформаційні повідомлення
- **debug** - Налагоджувальна інформація (тільки в development)

Логи зберігаються у:
- `logs/error.log` - Тільки помилки
- `logs/combined.log` - Всі логи
- Console - У режимі development

## 🧪 Приклади запитів

### Отримати всі курси для початківців

```bash
curl "http://localhost:3002/api/content?contentType=course&difficulty=beginner&page=1&limit=10"
```

### Створити новий контент (потрібен JWT токен)

```bash
curl -X POST http://localhost:3002/api/content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TypeScript для початківців",
    "description": "Вивчіть TypeScript з нуля",
    "contentType": "course",
    "category": "Programming",
    "tags": ["typescript", "javascript", "programming"],
    "difficultyLevel": "beginner",
    "durationMinutes": 120,
    "language": "uk",
    "isPublished": true
  }'
```

### Пошук за ключовим словом

```bash
curl "http://localhost:3002/api/content?search=TypeScript&language=uk"
```

### Оновити контент (потрібен JWT токен, тільки автор або admin)

```bash
curl -X PUT http://localhost:3002/api/content/CONTENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Оновлена назва курсу",
    "isPublished": true
  }'
```

## 📁 Структура проєкту

```
services/content-service/
├── src/
│   ├── config/
│   │   ├── database.ts      # Sequelize конфігурація
│   │   └── redis.ts         # Redis клієнт
│   ├── controllers/
│   │   └── contentController.ts # CRUD контролери
│   ├── middleware/
│   │   ├── auth.ts          # JWT автентифікація/авторизація
│   │   ├── errorHandler.ts # Обробка помилок
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   └── validator.ts    # Joi валідація
│   ├── models/
│   │   └── Content.ts      # Sequelize модель
│   ├── routes/
│   │   └── contentRoutes.ts # Express маршрути
│   ├── types/
│   │   └── index.ts        # TypeScript типи
│   ├── utils/
│   │   └── logger.ts       # Winston logger
│   └── index.ts            # Entry point
├── dist/                    # Compiled JavaScript
├── logs/                    # Log files
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── Dockerfile
└── README.md
```

## 🔄 Інтеграція з іншими сервісами

### User Service
- Використовує той самий JWT_SECRET для валідації токенів
- Перевіряє authorId при створенні контенту

### API Gateway
- Проксує запити до /api/content/*
- Додає rate limiting на рівні gateway

### Recommendation Engine
- Читає дані про контент для формування рекомендацій
- Використовує viewCount та rating для алгоритмів

## 🎯 TypeScript

### Strict Mode
Увімкнено всі strict перевірки:
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### ES Modules
- Використовується `"type": "module"` у package.json
- Module resolution: `NodeNext`
- Всі імпорти з `.js` розширенням

## 📚 Додаткова документація

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sequelize TypeScript](https://sequelize.org/docs/v6/other-topics/typescript/)
- [Express.js](https://expressjs.com/)
- [Winston Logger](https://github.com/winstonjs/winston)

## ✅ Готово до використання!

Content Service повністю готовий для:
- ✅ Розробки (npm run dev)
- ✅ Production (npm run build && npm start)
- ✅ Docker deployment
- ✅ Kubernetes deployment
