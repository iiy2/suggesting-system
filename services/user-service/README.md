# User Service (TypeScript + ES Modules)

User management microservice with authentication and authorization.

## Tech Stack

- **TypeScript 5.7** - Latest stable with enhanced type safety
- **Node.js 22 LTS** - Latest Long Term Support runtime (Iron)
- **Express.js 4.21** - Web framework
- **Sequelize 6.37** - PostgreSQL ORM
- **Redis 4.7** - Session storage & caching
- **JWT** - Authentication tokens
- **Joi 17.13** - Validation
- **Winston 3.17** - Logging
- **ES Modules (NodeNext)** - Modern JavaScript modules

## Features

- ✅ User registration with email validation
- ✅ Login/Logout with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Profile management
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (DDoS protection)
- ✅ Input validation
- ✅ Security headers (Helmet)
- ✅ CORS support
- ✅ Health check endpoint
- ✅ Graceful shutdown
- ✅ TypeScript with strict mode
- ✅ ES6 Modules

## Development

### Prerequisites

- Node.js 22+ (LTS)
- npm 10+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Run Development Server

```bash
# Start with hot reload
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
npm run lint:fix
```

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build image
docker build -t user-service:latest .

# Run container
docker run -p 3001:3001 --env-file .env user-service:latest
```

## API Endpoints

### Public Routes

#### Register
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Protected Routes (Require JWT)

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### Logout
```http
POST /api/users/logout
Authorization: Bearer <token>
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Project Structure

```
src/
├── config/
│   ├── database.ts       # Sequelize configuration
│   └── redis.ts          # Redis client
├── controllers/
│   └── authController.ts # Authentication logic
├── middleware/
│   ├── auth.ts           # JWT authentication & authorization
│   ├── rateLimiter.ts    # Rate limiting
│   ├── validator.ts      # Input validation
│   └── errorHandler.ts   # Error handling
├── models/
│   └── User.ts           # User model
├── routes/
│   └── userRoutes.ts     # API routes
├── types/
│   └── index.ts          # TypeScript types & interfaces
├── utils/
│   └── logger.ts         # Winston logger
└── index.ts              # Application entry point
```

## TypeScript Configuration

The project uses strict TypeScript configuration:

- ✅ Strict null checks
- ✅ No implicit any
- ✅ No unused locals/parameters
- ✅ Strict function types
- ✅ ES2022 target
- ✅ ESNext modules

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## Security

- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Rate limiting (100 req/min global, 5 login/15min)
- Input validation with Joi
- SQL injection protection (Sequelize ORM)
- XSS protection (Helmet)
- CORS configuration

## Health Check

```http
GET /health

Response:
{
  "status": "UP",
  "service": "user-service",
  "timestamp": "2025-11-30T12:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

## License

MIT
