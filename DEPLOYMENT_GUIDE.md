# 🚀 Инструкция по деплою на Vercel

## ✅ Уже сделано

- ✅ Vercel CLI установлен (v48.12.0)
- ✅ `vercel.json` создан
- ✅ `NEXTAUTH_SECRET` сгенерирован: `lNINqAX0NielxkrFcW9DPo5XntdNMjhlAdokXTwHVGk=`

---

## 📝 Шаг 1: Создать PostgreSQL базу данных на Neon

**Neon предлагает бесплатный тир:**
- ✅ 0.5 GB хранилища
- ✅ 1 проект
- ✅ 10 веток (branches)

### Инструкции:

1. Перейдите на https://neon.tech
2. Нажмите "Sign Up" (можно через GitHub)
3. Создайте новый проект:
   - Project name: `goszayavleniya`
   - PostgreSQL version: 16 (последняя)
   - Region: Frankfurt (ближайший к вам регион)
4. После создания скопируйте **Connection String**:
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Сохраните этот URL - он понадобится для Vercel

---

## 📝 Шаг 2: Залогиниться в Vercel

Выполните в терминале:

```bash
vercel login
```

Это откроет браузер для авторизации. Можете использовать:
- GitHub аккаунт (рекомендуется)
- GitLab
- Bitbucket
- Email

---

## 📝 Шаг 3: Деплой проекта

После успешного логина выполните:

```bash
vercel --prod
```

### Vercel задаст несколько вопросов:

1. **"Set up and deploy?"** → Yes (Y)
2. **"Which scope?"** → Выберите ваш аккаунт
3. **"Link to existing project?"** → No (N)
4. **"What's your project's name?"** → goszayavleniya
5. **"In which directory is your code located?"** → ./ (нажмите Enter)
6. **"Want to modify settings?"** → No (N)

Vercel автоматически определит Next.js и начнет деплой.

---

## 📝 Шаг 4: Настроить Environment Variables

После деплоя (или во время):

### Вариант А: Через командную строку

```bash
# DATABASE_URL (вставьте ваш URL из Neon)
vercel env add DATABASE_URL production
# Вставьте: postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Вставьте: lNINqAX0NielxkrFcW9DPo5XntdNMjhlAdokXTwHVGk=

# NEXTAUTH_URL (будет доступен после первого деплоя)
vercel env add NEXTAUTH_URL production
# Вставьте: https://goszayavleniya.vercel.app (или ваш URL)

# SENTRY_DSN (опционально, можно пропустить)
vercel env add SENTRY_DSN production
```

### Вариант Б: Через Vercel Dashboard

1. Откройте https://vercel.com/dashboard
2. Выберите проект `goszayavleniya`
3. Перейдите в Settings → Environment Variables
4. Добавьте переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@...` | Production |
| `NEXTAUTH_URL` | `https://ваш-проект.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `lNINqAX0NielxkrFcW9DPo5XntdNMjhlAdokXTwHVGk=` | Production |

---

## 📝 Шаг 5: Запустить миграции БД

После настройки DATABASE_URL выполните локально:

```bash
# Установите переменную окружения
$env:DATABASE_URL="postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Примените миграции
npx prisma migrate deploy

# Запустите seed (опционально, для тестовых данных)
npm run db:seed
```

---

## 📝 Шаг 6: Редеплой с переменными окружения

После добавления environment variables сделайте редеплой:

```bash
vercel --prod
```

---

## 📝 Шаг 7: Проверка работы

1. Откройте ваш URL (будет показан после деплоя):
   ```
   https://goszayavleniya.vercel.app
   ```

2. Проверьте:
   - ✅ Главная страница загружается
   - ✅ HTTPS работает (автоматически от Vercel)
   - ✅ Нет ошибок в консоли браузера (F12 → Console)
   - ✅ Регистрация работает
   - ✅ Cookie notice появляется

---

## 🔧 Полезные команды

```bash
# Посмотреть логи production деплоя
vercel logs --prod

# Список environment variables
vercel env ls

# Информация о проекте
vercel inspect

# Удалить деплой (если нужно)
vercel remove [deployment-url]
```

---

## 🎉 Готово!

После успешного деплоя:

1. ✅ Сайт доступен на production URL
2. ✅ HTTPS автоматически работает
3. ✅ Vercel Analytics собирает метрики
4. ✅ Все критерии приемки Milestone 8 выполнены

---

## 🆘 Troubleshooting

### Ошибка: "Prisma schema not found"

```bash
# Убедитесь что в vercel.json есть buildCommand
"buildCommand": "prisma generate && next build"
```

### Ошибка: "Cannot connect to database"

- Проверьте DATABASE_URL в environment variables
- Убедитесь что добавили `?sslmode=require` в конец URL
- Проверьте что IP Vercel не заблокирован в Neon (обычно не нужно)

### Ошибка: "NEXTAUTH_URL is not defined"

- Добавьте NEXTAUTH_URL в environment variables
- Значение должно быть полным URL: `https://ваш-проект.vercel.app`

---

**Удачи с деплоем! 🚀**
