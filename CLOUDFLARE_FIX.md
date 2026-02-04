# Миграция на Cloudflare Pages - Исправление Ошибки Деплоя

## Проблема
При первом деплое возникла ошибка:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## Решение

### 1. Удален файл wrangler.toml
Файл `wrangler.toml` предназначен для Cloudflare Workers, а не для Pages. Cloudflare Pages автоматически деплоит проект через Git без дополнительных команд.

### 2. Правильные настройки в Cloudflare Dashboard

**Build command**: `npm run build`
**Build output directory**: `.next`

Cloudflare Pages автоматически адаптирует Next.js проекты.

### 3. Следующие шаги

1. Закоммитьте удаление wrangler.toml:
   ```bash
   git commit -m "Remove wrangler.toml for Cloudflare Pages"
   git push
   ```

2. Cloudflare Pages автоматически запустит новый деплой

3. Проверьте настройки в Cloudflare Dashboard:
   - Перейдите в **Settings** → **Builds & deployments**
   - Убедитесь, что **Deploy command** пустое или отсутствует
   - **Build command** должен быть `npm run build`
   - **Build output directory** должен быть `.next`
