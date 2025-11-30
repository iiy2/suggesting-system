# 🎨 Посібник зі стилів - Web Application

## Файли стилів

### 1. theme.postcss
**Розташування**: `src/theme.postcss`
**Призначення**: Skeleton UI theme variables

Містить всі CSS custom properties для Skeleton UI:
- Theme colors (primary, secondary, tertiary, success, warning, error, surface)
- Font families
- Rounded corners
- On-X colors (контрастні кольори)

**Генерується автоматично** через Tailwind config.

### 2. app.css
**Розташування**: `src/app.css`
**Призначення**: Глобальні стилі додатку

Включає:
- Import theme.postcss
- Tailwind directives (@tailwind base, components, utilities, variants)
- Custom base styles (@layer base)
- Custom component styles (@layer components)
- Custom utility styles (@layer utilities)
- Animations (fadeInUp, skeleton-loading)
- Scrollbar styling
- Form element styles
- Button transitions
- Toast/Alert styles
- Responsive utilities

## Використання стилів

### Імпорт у Layout
```svelte
<script lang="ts">
  import '../app.css';  // Імпортує всі стилі
</script>
```

### Tailwind класи
Використовуйте Tailwind utility classes:
```svelte
<div class="container mx-auto p-4 space-y-4">
  <h1 class="h1 text-gradient">Title</h1>
  <button class="btn variant-filled-primary">Click</button>
</div>
```

### Skeleton UI компоненти
```svelte
<script>
  import { AppShell, Modal, Toast } from '@skeletonlabs/skeleton';
</script>

<AppShell>
  <!-- Content -->
</AppShell>
```

### Custom classes (з app.css)

#### Card hover effect:
```svelte
<div class="card card-hover p-4">
  <!-- Hover піднімає картку -->
</div>
```

#### Gradient text:
```svelte
<h1 class="text-gradient">Beautiful Gradient</h1>
```

#### Glass effect:
```svelte
<div class="glass-effect p-6">
  <!-- Glassmorphism -->
</div>
```

#### Anchor links:
```svelte
<a href="/page" class="anchor">Link with underline</a>
```

#### Chips/Badges:
```svelte
<span class="chip variant-soft">Tag</span>
```

#### Loading spinner:
```svelte
<div class="loading-spinner"></div>
```

#### Skeleton loading animation:
```svelte
<div class="skeleton-loading h-20 w-full"></div>
```

## Skeleton UI Token система

### Surface tokens (adaptive для dark mode):
```svelte
<div class="bg-surface-50-900-token">
  <!-- Light: surface-50, Dark: surface-900 -->
</div>
```

### Border tokens:
```svelte
<div class="border-surface-300-600-token">
  <!-- Responsive border color -->
</div>
```

## Themes

### Доступні preset themes:
1. **skeleton** - default theme
2. **modern** - сучасна палітра
3. **crimson** - червона палітра

### Зміна theme:
Додайте data-theme до html:
```html
<html data-theme="modern">
```

Або через JavaScript:
```javascript
document.documentElement.setAttribute('data-theme', 'modern');
```

## Dark Mode

### Включення dark mode:
```javascript
document.documentElement.classList.add('dark');
```

### Tailwind dark mode classes:
```svelte
<div class="bg-white dark:bg-gray-900">
  <!-- Adaptive background -->
</div>
```

## Animations

### FadeInUp:
```svelte
<div class="animate-fade-in-up">
  <!-- Плавна поява знизу -->
</div>
```

### Skeleton loading:
```svelte
<div class="skeleton-loading h-40 rounded">
  <!-- Пульсуюча анімація завантаження -->
</div>
```

## Custom Scrollbar

Автоматично застосовується до всіх scrollable елементів:
- Ширина: 10px
- Кольори адаптивні до theme
- Hover ефект

## Responsive Design

### Breakpoints (Tailwind):
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

### Mobile-first approach:
```svelte
<div class="px-2 md:px-4 lg:px-8">
  <!-- Mobile: 2, Tablet: 4, Desktop: 8 -->
</div>
```

## Toast Notifications

### Використання:
```typescript
import { getToastStore } from '@skeletonlabs/skeleton';

const toastStore = getToastStore();

toastStore.trigger({
  message: 'Success!',
  background: 'variant-filled-success'
});
```

### Доступні варіанти:
- `variant-filled-success` - зелений
- `variant-filled-error` - червоний
- `variant-filled-warning` - жовтий
- `variant-filled-primary` - синій

## Form Elements

### Стилізовані автоматично:
```svelte
<input type="text" class="input" />
<textarea class="textarea"></textarea>
<select class="select">
  <option>Choice</option>
</select>
```

Features:
- Focus ring (primary color)
- Border transition
- Dark mode support
- Consistent height

## Buttons

### Skeleton UI button варіанти:
```svelte
<button class="btn variant-filled-primary">Primary</button>
<button class="btn variant-filled-secondary">Secondary</button>
<button class="btn variant-ghost-surface">Ghost</button>
<button class="btn variant-soft-primary">Soft</button>
```

### Custom transitions:
- Hover smooth transition
- Active scale down (0.95)
- 200ms duration

## Best Practices

1. **Використовуйте Tailwind utility classes** коли можливо
2. **Skeleton tokens** для адаптивних кольорів
3. **Custom classes** (card-hover, text-gradient) для спеціальних ефектів
4. **Responsive design** - mobile-first approach
5. **Dark mode** - використовуйте dark: prefix
6. **Accessibility** - додавайте proper ARIA labels
7. **Performance** - уникайте inline styles

## Налаштування

### Додати нові кольори до theme:
Редагуйте `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      'custom': '#hexcolor'
    }
  }
}
```

### Додати custom utilities:
Редагуйте `app.css` в `@layer utilities`:
```css
@layer utilities {
  .my-utility {
    @apply ...;
  }
}
```

## Troubleshooting

### Стилі не застосовуються:
1. Перевірте import в +layout.svelte
2. Перезапустіть dev server
3. Очистіть .svelte-kit: `rm -rf .svelte-kit`

### Dark mode не працює:
1. Перевірте darkMode: 'class' в tailwind.config.ts
2. Додайте class="dark" до html

### Build fails:
1. Перевірте theme.postcss існує
2. Перевірте @import в app.css
3. npm install для відновлення залежностей

---

**Стилі готові до використання! 🎨**
