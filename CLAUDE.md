# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**gosZayavleniya** is a web service for creating legally correct applications/statements (заявления) through a step-by-step constructor with ready-made templates for МФЦ, courts, banks, FNS, and other organizations. The application is built in Russian and targets Russian legal documents.

**Tech Stack:**
- Next.js 14 (App Router)
- React 18 with TypeScript
- Prisma ORM + SQLite (development database)
- NextAuth.js for authentication (credentials provider with bcryptjs)
- TailwindCSS for styling
- React Hook Form + Zod for forms and validation
- html2pdf.js for PDF generation
- Zustand for state management (not yet implemented)

## Essential Commands

### Development
```bash
npm run dev              # Start development server on localhost:3000
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

### Database (Prisma)
```bash
npx prisma migrate dev           # Create and apply new migration
npx prisma migrate dev --name init  # Create initial migration
npx prisma migrate reset         # Reset database (deletes all data)
npm run db:migrate               # Alias for prisma migrate dev
npm run db:seed                  # Seed database with test data
npm run db:studio                # Open Prisma Studio (database GUI)
npx prisma generate              # Generate Prisma Client after schema changes
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
3. DATABASE_URL is pre-configured for SQLite: `file:./prisma/dev.db`
4. Run migrations: `npx prisma migrate dev --name init` (also runs seed automatically)
5. Or run seed separately: `npm run db:seed`

**Test User:** email: `test@example.com`, password: `password123`

## Architecture & Data Model

### Database Schema

**Important: SQLite Limitations**
SQLite does not support JSON fields or array types. The schema uses workarounds:
- **JSON fields** (contentJson, filledData, validationRules) → stored as String, parse with `JSON.parse()` / stringify with `JSON.stringify()`
- **Array fields** (tags, options) → stored as comma-separated String, split with `.split(',')` / join with `.join(',')`

The application uses a multi-step form-based document generation system:

**Core Models:**
- **User** - Users with email/password authentication
- **Category** - Document categories (МФЦ, Courts, Banks, FNS, Employers, Other)
- **Template** - Document templates with HTML content and variable placeholders
- **FormField** - Multi-step form fields that populate template variables
- **Document** - User-created documents (draft or generated status)

**Key Relationships:**
- Templates belong to Categories and have many FormFields
- FormFields are organized by `stepNumber` and `order` for multi-step forms
- Documents reference both User and Template, storing `filledData` as JSON
- Template `contentJson.html` contains placeholders like `{{fullName}}`, `{{inn}}` that map to FormField `fieldName` values

**Template System:**
Templates store an HTML structure with variable placeholders (e.g., `{{fullName}}`, `{{amount}}`). Form fields are multi-step (controlled by `stepNumber`) and when filled by users, the data populates these placeholders to generate the final document.

### Directory Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page (landing)
│   └── globals.css      # Global styles with TailwindCSS
├── components/
│   ├── layout/          # Layout components (Header, Footer, MainLayout)
│   └── ui/              # Reusable UI components (Button, Card, Input, etc.)
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   └── utils.ts         # Utility functions (cn, formatDate, debounce)
├── types/               # TypeScript type definitions
│   ├── template.ts      # Template, FormField, Category types
│   ├── document.ts      # Document type with status enum
│   └── user.ts          # User type
├── constants/           # App constants
│   ├── categories.ts    # Category definitions (matches seed data)
│   └── fieldTypes.ts    # Form field type definitions
└── store/               # Zustand stores (not yet implemented)

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Database seeding script
```

### Important Patterns

**Path Aliases:** The project uses `@/*` to reference `src/*` (configured in `tsconfig.json`)

**Styling:** Uses TailwindCSS with a custom utility `cn()` from `lib/utils.ts` that combines `clsx` and `tailwind-merge` for conditional class merging.

**Prisma Client:** Always import from `@/lib/prisma` (not `@prisma/client` directly) to ensure singleton pattern in development.

**Icons:** Uses Google Material Symbols Outlined font (loaded in root layout). Reference icons as: `<span className="material-symbols-outlined">icon_name</span>`

**Font:** Uses Public Sans from Google Fonts, configured in `app/layout.tsx`

**SEO & Metadata:**
- Root layout includes base metadata and Open Graph tags
- `src/app/robots.ts` - Generates robots.txt for search engines
- `src/app/sitemap.ts` - Generates XML sitemap dynamically
- `StructuredData` component provides JSON-LD for rich snippets
- Each page should define its own metadata export for proper SEO

### Core Utilities (`src/lib/utils.ts`)
- `cn(...inputs)` - Merges CSS classes with clsx and tailwind-merge
- `formatDate(date)` - Formats dates to DD.MM.YYYY format
- `delay(ms)` - Promise-based delay utility
- `debounce(func, wait)` - Debounce function for performance optimization

### Key Components
**Forms:**
- `DynamicFormField` - Renders form fields based on type (text, number, date, select, textarea)
- `Stepper` - Multi-step form progress indicator
- `ProgressBar` - Shows completion progress
- `SaveIndicator` - Auto-save status indicator

**Documents:**
- `DocumentPreview` - Renders filled template with data
- `DocumentCard` - Document list item in dashboard
- `DataChecklist` - Shows which fields are filled

**Templates:**
- `TemplateCard` - Template display card
- `TemplateFilter` - Category and search filtering

**Layout:**
- `Header` - Main navigation with auth status
- `Footer` - Site footer with links
- `MainLayout` - Wrapper with header/footer
- `SessionProvider` - NextAuth session context
- `ToastProvider` - Toast notifications

## Development Notes

### Implemented Pages
The following pages are fully implemented:
- `/` - Landing page with hero section, category grid, and popular templates
- `/templates` - Template listing page with category filtering
- `/login` and `/register` - Authentication pages with NextAuth.js
- `/create/[templateId]` - Multi-step form for creating documents
- `/create/[templateId]/preview` - Document preview and PDF generation
- `/dashboard` - User dashboard showing created documents

### API Routes
Implemented API endpoints:
- `POST /api/register` - User registration
- `GET /api/templates` - List all templates (with filtering)
- `GET /api/templates/[id]` - Get template by ID
- `POST /api/documents` - Create new document
- `GET /api/documents` - Get user's documents
- `GET /api/documents/[id]` - Get document by ID
- `PATCH /api/documents/[id]` - Update document

### Document Creation Workflow
The multi-step document creation process works as follows:

**1. Template Selection** (`/templates`)
- User browses templates by category
- Filters by applicant type, category, search term
- Clicks template to start creation

**2. Multi-Step Form** (`/create/[templateId]`)
- Load template with associated FormFields
- Group fields by `stepNumber` (sorted by `order` within each step)
- Display current step's fields using `DynamicFormField` component
- Validate using `validationRules` JSON (Zod schemas for patterns, min/max, required)
- Auto-save draft every change (debounced)
- Store progress in Document's `filledData` (JSON string in database)
- Navigate between steps with `Stepper` component

**3. Preview & Generate** (`/create/[templateId]/preview`)
- Load Document with filled data
- Render template using `renderTemplate(template.contentJson.html, filledData)`
- Display preview with contentEditable for final edits
- Generate PDF using `generatePDF()` from client-side
- Option to download or save to cloud storage (future)
- Mark Document status as "generated"

**4. Dashboard** (`/dashboard`)
- View all user documents (drafts + generated)
- Filter by status, search by title
- Download PDFs, continue editing drafts, or delete documents

### Field Types
Supported form field types (from `fieldTypes.ts`):
- `text` - Single-line text input
- `number` - Numeric input
- `date` - Date picker
- `select` - Dropdown with options from FormField.options
- `textarea` - Multi-line text input

### Authentication
NextAuth.js is fully configured and implemented:
- **API Route:** `src/app/api/auth/[...nextauth]/route.ts`
- **Credentials Provider:** Email/password with bcryptjs hashing
- **Protected Routes:** `/dashboard/*` and `/create/*` (see `middleware.ts`)
- **Session:** JWT-based strategy
- **Pages:** `/login` and `/register` are implemented
- **Header:** Shows user info and sign out when authenticated

**Usage in components:**
```typescript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
// status: 'loading' | 'authenticated' | 'unauthenticated'
```

**Server-side session:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
```

### PDF Generation
PDF generation is implemented using `html2pdf.js`:
- **Location:** `src/lib/pdfGenerator.ts`
- **Functions:**
  - `generatePDF(element, options)` - Generates PDF Blob from HTML element
  - `downloadPDF(element, filename)` - Generates and downloads PDF
- **Usage:** Client-side only (uses html2canvas and jsPDF under the hood)
- **Configuration:** Default A4, portrait, 10mm margins, can be customized
- **Future:** S3/Cloudflare R2 upload for storing PDFs (credentials in `.env.example`)

### Template Rendering
Template rendering system for populating placeholders:
- **Location:** `src/lib/templateRenderer.ts`
- **Functions:**
  - `renderTemplate(htmlTemplate, filledData)` - Replaces `{{variableName}}` placeholders with user data
  - `extractTemplateVariables(htmlTemplate)` - Returns array of all variables in template
  - `validateTemplateData(htmlTemplate, filledData)` - Checks if all variables are filled
- **Placeholder Format:** `{{variableName}}` in HTML template
- **Missing Data:** Unfilled placeholders show as `[variableName]` in gray italic

### Applicant Types
Templates have `applicantType` field:
- `"physical"` - For individual persons only
- `"legal"` - For legal entities only
- `"both"` - Can be used by both

Filter templates based on user type when displaying in UI.

## Seeded Data

Running `npm run db:seed` creates:
- 6 categories (МФЦ, Courts, Banks, FNS, Employers, Other)
- 2 templates:
  - "Заявление на налоговый вычет за лечение" (Tax deduction for medical expenses) - 8 form fields across 3 steps
  - "Претензия в банк о возврате комиссии" (Bank complaint for fee refund) - 12 form fields across 3 steps
- 1 test user (test@example.com / password123)

Refer to `prisma/seed.ts` for the complete template structure and field definitions.

## Code Style

- TypeScript strict mode enabled
- Prettier configured with tailwindcss plugin
- ESLint with next.js config
- Russian language used for UI text and comments
- Use `formatDate()` from utils for consistent DD.MM.YYYY format

## Common Development Tasks

### Adding a New Template
1. Add template data to `prisma/seed.ts`
2. Run `npm run db:seed` to populate database
3. Or use Prisma Studio (`npm run db:studio`) to add via GUI

### Creating a New Form Field Type
1. Add type to `src/constants/fieldTypes.ts`
2. Update `DynamicFormField` component to handle new type
3. Update Prisma schema if needed and run migration

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma Client is auto-generated after migration
4. Update seed script if needed

### Debugging Tips
- **Database Issues:** Use `npm run db:studio` to inspect database visually
- **Type Errors:** Run `npm run type-check` for full TypeScript validation
- **Session Issues:** Clear cookies and restart dev server
- **PDF Generation:** Ensure element is rendered before calling `generatePDF()`
- **SQLite Limitations:** Remember JSON fields are stored as strings - always parse/stringify

### Working with JSON Fields in SQLite
Since SQLite stores JSON as strings, always:
```typescript
// Reading from database
const template = await prisma.template.findUnique({ where: { id } })
const contentJson = JSON.parse(template.contentJson)

// Writing to database
const contentJson = { html: '...', ... }
await prisma.template.create({
  data: {
    contentJson: JSON.stringify(contentJson),
    ...
  }
})
```

### Working with Array Fields in SQLite
Arrays are stored as comma-separated strings:
```typescript
// Reading
const tags = template.tags.split(',')

// Writing
const tags = ['tag1', 'tag2', 'tag3']
await prisma.template.create({
  data: {
    tags: tags.join(','),
    ...
  }
})
```
