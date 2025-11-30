# Web Application - Recommendation System

Modern web interface for the e-Learning Recommendation System built with SvelteKit and Skeleton UI.

## 🚀 Technology Stack

- **Framework**: SvelteKit 2.7.4 + Svelte 5.1.16
- **Language**: TypeScript 5.7.2
- **UI Library**: Skeleton UI 2.10.2
- **Styling**: Tailwind CSS 3.4.15
- **HTTP Client**: Axios 1.7.9
- **Build Tool**: Vite 6.0.3

## 📋 Features

- **Authentication**: JWT-based login/registration with secure token storage
- **Content Browsing**: Browse, search, and filter educational content
- **Personalized Recommendations**: Get content recommendations based on user behavior
- **Interactive Rating**: Rate content and track viewing progress
- **Admin Panel**: Create, update, and delete content (admin only)
- **User Dashboard**: Manage profile and view activity
- **Responsive Design**: Mobile-first design with Skeleton UI components

## 🏗️ Project Structure

```
web-app/
├── src/
│   ├── lib/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navigation.svelte
│   │   │   ├── ContentCard.svelte
│   │   │   ├── RecommendationCard.svelte
│   │   │   ├── FilterPanel.svelte
│   │   │   └── RatingStars.svelte
│   │   ├── services/          # API service layer
│   │   │   ├── api.ts         # Base API client
│   │   │   ├── auth.service.ts
│   │   │   ├── content.service.ts
│   │   │   └── recommendations.service.ts
│   │   ├── stores/            # Svelte stores for state management
│   │   │   ├── auth.ts
│   │   │   └── content.ts
│   │   └── types/             # TypeScript type definitions
│   │       └── index.ts
│   ├── routes/                # SvelteKit file-based routing
│   │   ├── +page.svelte       # Home page
│   │   ├── +layout.svelte     # Root layout
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── content/           # Content pages
│   │   │   ├── +page.svelte   # Content list
│   │   │   └── [id]/          # Content details
│   │   ├── recommendations/   # Recommendations page
│   │   ├── dashboard/         # User dashboard
│   │   └── admin/             # Admin panel
│   ├── app.html               # HTML template
│   └── app.css                # Global styles
├── static/                    # Static assets
├── Dockerfile                 # Docker configuration
├── package.json               # Dependencies
├── svelte.config.js           # SvelteKit configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 22.x or higher
- npm or yarn

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your API Gateway URL:
   ```env
   PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t recommendation-web-app .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e PUBLIC_API_URL=http://api-gateway:8080 \
  --name web-app \
  recommendation-web-app
```

### Docker Compose

The web app is integrated into the main `docker-compose.yml`:

```yaml
web-app:
  build: ./web-app
  ports:
    - "3000:3000"
  environment:
    - PUBLIC_API_URL=http://api-gateway:8080
  depends_on:
    - api-gateway
```

## 📦 Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built application will be in the `build/` directory.

## 🎨 UI Components

### Custom Components

#### ContentCard
Displays content items with metadata (title, type, difficulty, rating, etc.)

```svelte
<ContentCard content={contentObject} />
```

#### RecommendationCard
Shows recommended content with recommendation score and reason

```svelte
<RecommendationCard recommendation={recObject} />
```

#### FilterPanel
Interactive filter controls for content search

```svelte
<FilterPanel />
```

#### RatingStars
Star rating display/input component

```svelte
<RatingStars
  rating={4.5}
  interactive={true}
  onRate={(rating) => console.log(rating)}
/>
```

## 🔌 API Integration

The application communicates with the backend through the API Gateway:

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Content Endpoints
- `GET /api/content` - Get all content (with filters)
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create content (admin)
- `PUT /api/content/:id` - Update content (admin)
- `DELETE /api/content/:id` - Delete content (admin)

### Recommendation Endpoints
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/similar/:id` - Get similar content
- `POST /api/recommendations/interaction` - Record user interaction

## 🔐 Authentication Flow

1. User submits login/registration form
2. API returns JWT token on success
3. Token is stored in `authStore` and `localStorage`
4. Axios interceptor adds token to all API requests
5. On 401 response, user is redirected to login

## 🎯 State Management

### Auth Store
Manages authentication state and user data:

```typescript
authStore.subscribe(state => {
  console.log(state.user);
  console.log(state.isAuthenticated);
});

authStore.setAuth(user, token);
authStore.clearAuth();
```

### Content Store
Manages content list and filters:

```typescript
contentStore.setContent(items, pagination);
contentStore.setFilters({ search: 'javascript' });
contentStore.setPage(2);
```

## 🎨 Theming

The application uses Skeleton UI themes. Available presets:
- `skeleton` (default)
- `modern`
- `crimson`

To change theme, update `tailwind.config.ts`:

```typescript
skeleton({
  themes: {
    preset: ['skeleton', 'modern', 'crimson']
  }
})
```

## 🧪 Development

### Recommended VS Code Extensions
- Svelte for VS Code
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Code Style
- Follow TypeScript strict mode
- Use ES modules
- Prefer composition over inheritance
- Write clean, self-documenting code

## 📝 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with features
- **Login** (`/auth/login`) - User login
- **Register** (`/auth/register`) - User registration
- **Content** (`/content`) - Browse all content
- **Content Details** (`/content/:id`) - View content details

### Protected Pages (Auth Required)
- **Recommendations** (`/recommendations`) - Personalized recommendations
- **Dashboard** (`/dashboard`) - User profile and settings

### Admin Pages (Admin Role Required)
- **Admin Panel** (`/admin`) - Content management

## 🔧 Configuration

### Vite Proxy (Development)
API requests are proxied through Vite during development:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### Path Aliases
```typescript
$lib -> ./src/lib
$components -> ./src/lib/components
$stores -> ./src/lib/stores
$services -> ./src/lib/services
$types -> ./src/lib/types
```

## 📊 Performance

- **SSR**: Server-side rendering with SvelteKit
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Build**: Vite production build with tree-shaking
- **PurgeCSS**: Unused CSS automatically removed

## 🐛 Troubleshooting

### API Connection Issues
1. Check API Gateway is running on port 8080
2. Verify `PUBLIC_API_URL` environment variable
3. Check browser console for CORS errors

### Build Errors
1. Clear `.svelte-kit` directory: `rm -rf .svelte-kit`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version` (should be 22.x)

### Authentication Issues
1. Clear localStorage: `localStorage.clear()`
2. Check JWT token expiration
3. Verify user credentials

## 📄 License

This project is part of the e-Learning Recommendation System.

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test changes before committing
4. Update documentation when needed

## 📞 Support

For issues and questions, please refer to the main project documentation.
