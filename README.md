# Конструктор заявлений

Веб-сервис для создания юридически корректных заявлений через пошаговый конструктор с готовыми шаблонами для МФЦ, судов, банков, ФНС и других организаций.

## Технологический стек

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **База данных:** SQLite
- **Аутентификация:** NextAuth.js
- **Валидация:** Zod
- **Управление состоянием:** Zustand

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Настройка базы данных

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. DATABASE_URL уже настроен для SQLite: `file:./prisma/dev.db`

3. Запустите миграции Prisma (автоматически выполнит seed):
```bash
npx prisma migrate dev --name init
```

### Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
gosZayavleniya/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React компоненты
│   ├── lib/             # Утилиты и хелперы
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript типы
│   └── constants/       # Константы
├── prisma/              # Prisma схема и миграции
└── public/              # Статические файлы
```

## Команды

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production
- `npm run start` - Запуск production сборки
- `npm run lint` - Проверка кода ESLint
- `npm run format` - Форматирование кода Prettier

## Документация

- [Архитектура проекта](../architecture.md)
- [План разработки](../development-plan.md)

## Лицензия

MIT
