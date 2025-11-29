# Архитектура проекта "Конструктор заявлений"

## 1. Обзор системы

**Название проекта:** Конструктор заявлений для госорганов и банков

**Описание:** Веб-сервис для создания юридически корректных заявлений через пошаговый конструктор с готовыми шаблонами для МФЦ, судов, банков, ФНС и других организаций.

**Ключевые функции:**
- Поиск и выбор шаблонов заявлений
- Пошаговое заполнение заявления с валидацией
- Предварительный просмотр и редактирование документа
- Генерация PDF для печати
- Интеграция с Госуслугами для онлайн-отправки
- Личный кабинет с историей документов

---

## 2. Технологический стек

### 2.1 Frontend
- **Фреймворк:** Next.js 14+ (App Router)
- **Язык:** TypeScript 5+
- **UI библиотека:** React 18+
- **Стилизация:** TailwindCSS 3+ (уже используется в дизайне)
- **Управление состоянием:** Zustand / React Context API
- **Формы:** React Hook Form + Zod (валидация)
- **HTTP клиент:** Axios / Fetch API
- **Генерация PDF:** react-pdf / jsPDF + html2pdf
- **Иконки:** Material Symbols Outlined (Google Fonts)
- **Шрифты:** Public Sans (Google Fonts)

### 2.2 Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Next.js API Routes (серверные компоненты)
- **Язык:** TypeScript 5+
- **База данных:** PostgreSQL 15+
- **ORM:** Prisma 5+
- **Аутентификация:** NextAuth.js / Clerk
- **Валидация:** Zod
- **Генерация документов:** Puppeteer (для сложных PDF) или pdf-lib

### 2.3 Инфраструктура
- **Хостинг:** Vercel / Railway / AWS
- **База данных:** Supabase / Neon / AWS RDS
- **Файловое хранилище:** AWS S3 / Cloudflare R2 / Supabase Storage
- **CDN:** Vercel Edge Network / Cloudflare
- **Мониторинг:** Sentry (ошибки) + Vercel Analytics
- **Email сервис:** Resend / SendGrid

### 2.4 Дополнительные инструменты
- **Линтинг:** ESLint + Prettier
- **Тестирование:** Vitest (unit) + Playwright (e2e)
- **CI/CD:** GitHub Actions / Vercel
- **Система контроля версий:** Git + GitHub

---

## 3. Архитектура базы данных

### 3.1 Основные таблицы

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │    templates     │
├─────────────────┤         ├──────────────────┤
│ id              │         │ id               │
│ email           │         │ title            │
│ name            │         │ description      │
│ password_hash   │         │ category_id      │
│ created_at      │         │ content_json     │
│ updated_at      │         │ is_active        │
└─────────────────┘         │ popularity_score │
                            │ tags             │
                            │ applicant_type   │ (physical/legal)
                            │ created_at       │
                            │ updated_at       │
                            └──────────────────┘
                                      │
                                      │ 1:N
                                      ▼
                            ┌──────────────────┐
                            │   categories     │
                            ├──────────────────┤
                            │ id               │
                            │ name             │
                            │ slug             │
                            │ icon             │
                            │ description      │
                            │ order            │
                            └──────────────────┘

┌─────────────────┐
│   documents     │
├─────────────────┤
│ id              │
│ user_id         │ ──▶ users.id
│ template_id     │ ──▶ templates.id
│ title           │
│ status          │ (draft/generated)
│ filled_data     │ (JSONB)
│ pdf_url         │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│  form_fields    │
├─────────────────┤
│ id              │
│ template_id     │ ──▶ templates.id
│ field_name      │
│ field_type      │ (text/number/date/select)
│ label           │
│ placeholder     │
│ validation_rules│ (JSONB)
│ step_number     │
│ order           │
│ is_required     │
└─────────────────┘
```

### 3.2 Prisma Schema (пример)

```prisma
model User {
  id            String      @id @default(uuid())
  email         String      @unique
  name          String?
  passwordHash  String?
  documents     Document[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Category {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique
  icon        String
  description String?
  order       Int         @default(0)
  templates   Template[]
}

model Template {
  id              String      @id @default(uuid())
  title           String
  description     String
  categoryId      String
  category        Category    @relation(fields: [categoryId], references: [id])
  contentJson     Json        // Структура документа
  isActive        Boolean     @default(true)
  popularityScore Int         @default(0)
  tags            String[]
  applicantType   String      // "physical" | "legal" | "both"
  formFields      FormField[]
  documents       Document[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model FormField {
  id              String   @id @default(uuid())
  templateId      String
  template        Template @relation(fields: [templateId], references: [id])
  fieldName       String
  fieldType       String   // "text" | "number" | "date" | "select"
  label           String
  placeholder     String?
  validationRules Json?
  stepNumber      Int
  order           Int
  isRequired      Boolean  @default(false)
}

model Document {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  templateId  String
  template    Template @relation(fields: [templateId], references: [id])
  title       String
  status      String   // "draft" | "generated"
  filledData  Json     // Заполненные пользователем данные
  pdfUrl      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 4. Структура проекта (файловая система)

```
gosZayavleniya/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/
│   │   │   ├── page.tsx             # Главная страница
│   │   │   ├── templates/           # Выбор шаблона
│   │   │   │   ├── page.tsx
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx
│   │   │   ├── create/              # Создание заявления
│   │   │   │   └── [templateId]/
│   │   │   │       ├── page.tsx     # Пошаговое заполнение
│   │   │   │       └── preview/
│   │   │   │           └── page.tsx # Предпросмотр
│   │   │   └── dashboard/           # Личный кабинет
│   │   │       └── page.tsx
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   ├── templates/
│   │   │   ├── documents/
│   │   │   ├── pdf/
│   │   │   └── gosuslugi/
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # TailwindCSS
│   │
│   ├── components/                  # React компоненты
│   │   ├── ui/                      # Переиспользуемые UI элементы
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── templates/
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateFilter.tsx
│   │   │   └── CategoryGrid.tsx
│   │   ├── forms/
│   │   │   ├── StepperForm.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── ValidationErrors.tsx
│   │   └── documents/
│   │       ├── DocumentPreview.tsx
│   │       ├── DocumentEditor.tsx
│   │       └── DocumentCard.tsx
│   │
│   ├── lib/                         # Утилиты и хелперы
│   │   ├── prisma.ts                # Prisma клиент
│   │   ├── auth.ts                  # Аутентификация
│   │   ├── pdf-generator.ts         # Генерация PDF
│   │   ├── validators.ts            # Zod схемы
│   │   └── utils.ts                 # Общие утилиты
│   │
│   ├── store/                       # Глобальное состояние (Zustand)
│   │   ├── useAuthStore.ts
│   │   ├── useFormStore.ts
│   │   └── useDocumentStore.ts
│   │
│   ├── types/                       # TypeScript типы
│   │   ├── template.ts
│   │   ├── document.ts
│   │   └── user.ts
│   │
│   └── constants/                   # Константы приложения
│       ├── categories.ts
│       └── fieldTypes.ts
│
├── prisma/
│   ├── schema.prisma                # Схема базы данных
│   ├── migrations/                  # Миграции
│   └── seed.ts                      # Seed данные
│
├── public/                          # Статические файлы
│   ├── templates/                   # JSON шаблоны документов
│   └── images/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Модульная архитектура (компоненты системы)

### 5.1 Модуль аутентификации
**Функции:**
- Регистрация пользователей
- Вход/выход
- Восстановление пароля
- OAuth (опционально: Google, VK)

**Технологии:** NextAuth.js / Clerk

---

### 5.2 Модуль шаблонов
**Функции:**
- Поиск шаблонов по категориям
- Фильтрация (тип заявителя, ведомство)
- Сортировка (популярность, алфавит)
- Просмотр деталей шаблона

**API endpoints:**
```
GET  /api/templates              # Список всех шаблонов
GET  /api/templates/:id          # Детали шаблона
GET  /api/templates/category/:slug  # Шаблоны по категории
GET  /api/categories             # Список категорий
```

---

### 5.3 Модуль создания заявления
**Функции:**
- Пошаговая форма с валидацией
- Сохранение прогресса (черновики)
- Навигация по шагам (Stepper)
- Автозаполнение из профиля пользователя

**Логика:**
1. Пользователь выбирает шаблон
2. Система загружает структуру формы (form_fields)
3. Пошаговое заполнение с валидацией Zod
4. Автосохранение каждые 30 секунд
5. Переход на превью после завершения

**API endpoints:**
```
POST /api/documents              # Создать документ (черновик)
PATCH /api/documents/:id         # Обновить документ
GET /api/documents/:id           # Получить документ
```

---

### 5.4 Модуль предпросмотра и экспорта
**Функции:**
- Рендеринг документа с заполненными данными
- Inline редактирование (contentEditable)
- Генерация PDF
- Отправка через Госуслуги (API интеграция)
- Скачивание документа

**Процесс генерации PDF:**
```
1. Взять шаблон (HTML/JSON)
2. Подставить данные пользователя
3. Рендерить HTML с стилями
4. Конвертировать в PDF (Puppeteer/jsPDF)
5. Сохранить в S3/Cloudflare R2
6. Вернуть URL
```

**API endpoints:**
```
POST /api/pdf/generate           # Генерация PDF
POST /api/gosuslugi/send         # Отправка через Госуслуги
```

---

### 5.5 Модуль личного кабинета
**Функции:**
- Просмотр всех документов (черновики + готовые)
- Поиск по документам
- Фильтрация по статусу
- Удаление/редактирование документов
- Скачивание PDF

**API endpoints:**
```
GET /api/documents               # Все документы пользователя
DELETE /api/documents/:id        # Удалить документ
```

---

## 6. Интеграции

### 6.1 Госуслуги (ЕСИА)
**Описание:** Интеграция с Единой системой идентификации и аутентификации для онлайн-отправки заявлений.

**Требования:**
- OAuth 2.0 аутентификация через ЕСИА
- API для подачи заявлений (в зависимости от региона)
- Электронная подпись (опционально)

**Ссылки:**
- Документация ЕСИА: https://digital.gov.ru/ru/activity/govservices/2/

---

### 6.2 Платежная система (опционально)
**Для премиум-функций:**
- Неограниченное количество документов
- Приоритетная поддержка
- Расширенные шаблоны

**Варианты:** YooKassa, Stripe, CloudPayments

---

## 7. Безопасность

### 7.1 Меры безопасности
- **HTTPS** обязательно
- **Хеширование паролей:** bcrypt / argon2
- **JWT токены:** httpOnly cookies
- **CSRF защита:** Next.js встроенная защита
- **Rate limiting:** на API (предотвращение DDoS)
- **Валидация входных данных:** Zod на клиенте и сервере
- **SQL Injection:** защита через Prisma ORM
- **XSS:** санитизация HTML (DOMPurify)

### 7.2 Приватность данных
- **GDPR compliance:** согласие на обработку данных
- **Хранение персональных данных:** шифрование в БД
- **Право на удаление:** пользователь может удалить все данные

---

## 8. Производительность и масштабирование

### 8.1 Оптимизации
- **Server-side rendering (SSR)** для SEO
- **Incremental Static Regeneration (ISR)** для шаблонов
- **Image optimization:** Next.js Image компонент
- **Code splitting:** автоматически через Next.js
- **CDN:** для статических файлов
- **Кеширование:**
  - Redis для сессий
  - SWR/React Query для клиентского кэша
  - Database query caching (Prisma)

### 8.2 Масштабирование
- **Horizontal scaling:** Vercel автоматически
- **Database connection pooling:** Prisma + PgBouncer
- **Serverless functions:** для API routes
- **Background jobs:** для генерации PDF (Vercel Cron / Bull Queue)

---

## 9. Мониторинг и логирование

### 9.1 Инструменты
- **Sentry:** ошибки фронтенда и бэкенда
- **Vercel Analytics:** производительность и Web Vitals
- **Prisma Studio:** просмотр данных БД
- **Winston / Pino:** структурированное логирование

### 9.2 Метрики
- Время генерации PDF
- Количество созданных документов
- Популярные шаблоны
- Конверсия (от просмотра до скачивания)

---

## 10. Дополнительные возможности (будущие фичи)

1. **AI-ассистент:** помощь в заполнении заявлений через GPT-4
2. **Мобильное приложение:** React Native / Flutter
3. **Email напоминания:** о незавершенных заявлениях
4. **Шаблоны с условной логикой:** если X, то показывать Y
5. **Коллаборация:** несколько пользователей над одним документом
6. **Электронная подпись:** интеграция с КриптоПро
7. **API для разработчиков:** публичное API для интеграций
8. **Мультиязычность:** поддержка английского и других языков

---

## 11. Compliance и юридические аспекты

### 11.1 Требования
- **152-ФЗ "О персональных данных":** согласие и защита данных
- **Пользовательское соглашение**
- **Политика конфиденциальности**
- **Отказ от ответственности:** за юридическую точность документов

### 11.2 Проверка шаблонов
- Все шаблоны должны быть проверены юристами
- Регулярное обновление при изменении законодательства
- Версионирование шаблонов

---

## 12. Диаграмма архитектуры

```
┌─────────────────────────────────────────────────┐
│              Пользователь (Браузер)             │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           Next.js Frontend (React)              │
│  - Server Components                            │
│  - Client Components                            │
│  - TailwindCSS                                  │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         Next.js API Routes (Backend)            │
│  - Authentication (NextAuth)                    │
│  - Business Logic                               │
│  - Data Validation (Zod)                        │
└───────────┬─────────────────────────────────────┘
            │
            ├──────────────┬──────────────┬─────────────┐
            ▼              ▼              ▼             ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐
    │  PostgreSQL  │ │  Redis   │ │     S3       │ │  Госуслуги │
    │  (Prisma)    │ │ (Cache)  │ │  (Files)     │ │   (API)    │
    └──────────────┘ └──────────┘ └──────────────┘ └────────────┘
```

---

## 13. Резюме

Архитектура построена на современном стеке с использованием Next.js для full-stack разработки, что обеспечивает:
- **Высокую производительность** (SSR, ISR, Edge Functions)
- **SEO-оптимизацию** для органического трафика
- **Масштабируемость** через serverless архитектуру
- **Отличный UX** благодаря React и TailwindCSS
- **Безопасность** данных пользователей
- **Легкость разработки** за счет TypeScript и современных инструментов

Проект готов к развитию и добавлению новых функций по мере роста базы пользователей.
