# LearnHub Development Guide for AI Agents

**Project:** Learning Management Application (MVP)  
**Stack:** Next.js 15 + React 18 + TypeScript + Tailwind CSS + Prisma  
**Status:** Early MVP scaffold with app shell, calendar UI, settings/notifications mocks, and core backend work still open

---

## Quick Start Commands

```bash
npm install           # Install dependencies
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
```

---

## Project Overview

LearnHub is a web-based learning management system designed for students to plan, organize, and track their study activities. The application provides centralized dashboard views, calendar-based task scheduling, and learning plan management.

**Key Features (in design/implementation):**
- Dashboard with task overview
- Calendar view for deadlines and planning
- Study plan management
- Activity/event tracking

See [design documentation](./docs/design/design.md) and [tech stack details](./docs/tech-stack.md).

---

## Architecture & Tech Stack

### Frontend (Current Focus)
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 18 + TypeScript
- **Component Primitives:** Base UI (@base-ui/react) wrapped with Tailwind styling
- **Icons:** Lucide React
- **Styling:** Tailwind CSS v4 with CSS variables
- **Form & Variants:** class-variance-authority, clsx, tailwind-merge

### Backend & Data
- **Database:** PostgreSQL (configured in Prisma, core domain models defined)
- **ORM:** Prisma 6 (`prisma` CLI + `@prisma/client`, both on 6.x)
- **API Routes:** Next.js API routes; `/api/calendar/external` already loads the DHBW ICS feed, other feature routes are still scaffolded

### Project Setup
- **Component Library Setup:** shadcn/ui (base-nova style, Base UI icons)
- **TypeScript Config:** Strict mode enabled, path alias `@/*` for imports
- **Component Config:** [components.json](./components.json) defines shadcn setup

See [full tech stack](./docs/tech-stack.md) for detailed rationale.

---

## Directory Structure & Conventions

### Naming Conventions

**Files:**
- Components: **PascalCase** (e.g., `DashboardShell.tsx`, `LoginForm.tsx`)
- Directories: **kebab-case** (e.g., `app-shell`, `study-plan`, `dashboard`)
- Utilities/Helpers: **camelCase** (e.g., `utils.ts`)

**Component Organization:**
```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (app)/              # Authenticated app route group with DashboardShell
│   │   ├── dashboard/      # Dashboard route (/dashboard)
│   │   ├── calendar/       # Calendar route (/calendar)
│   │   ├── notifications/  # Notifications route (/notifications)
│   │   ├── settings/       # Settings route (/settings)
│   │   └── layout.tsx      # App shell layout
│   ├── page.tsx            # Home route (/)
│   ├── login/page.tsx      # Login route (/login)
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── components/             # Reusable React components
│   ├── ui/                 # UI primitives (button, input, card, label, checkbox)
│   ├── layout/             # Layout components (DashboardShell, Sidebar, Topbar)
│   ├── login/              # Login-specific components
│   ├── dashboard/          # Dashboard components (placeholder)
│   ├── calendar/           # Calendar components and views
│   ├── notifications/      # Notifications mock UI
│   ├── settings/           # Settings mock UI
│   ├── study-plan/         # Study plan components (placeholder)
│   └── app-shell/          # App shell components (placeholder)
│
├── lib/                    # Utilities & helpers
│   ├── utils.ts            # `cn()` utility for Tailwind class merging
│   ├── calendar/           # ICS mapping and external calendar hook
│   ├── api/                # API client utilities (empty, ready for implementation)
│   ├── db/                 # Database queries & helpers (empty)
│   ├── calculations/       # Business logic (empty)
│   └── utils/              # Additional utilities (empty)
│
├── types/                  # TypeScript type definitions (empty, ready for use)
└── prisma/                 # Prisma schema & migrations
    └── schema.prisma       # Database schema (basic config only)
```

---

## Component Patterns & Conventions

### 1. Layout Components
**Location:** `src/components/layout/`  
**Pattern:** Often client components with state management

**Example:** [DashboardShell.tsx](src/components/layout/DashboardShell.tsx)
```typescript
"use client"; // Client component for state management
export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  // ... render layout with sidebar, topbar, content
}
```

**Sidebar** and **Topbar** are child components receiving props for state control.

### 2. UI Primitives (src/components/ui/)
**Pattern:** Base UI components wrapped with Tailwind styling

**Available components:**
- `button.tsx` - Button with variants (default, outline, secondary, ghost, destructive, link)
- `input.tsx` - Text input with validation states
- `label.tsx` - Form label
- `card.tsx` - Card container with header/title/description
- `checkbox.tsx` - Checkbox with Lucide icon

These use the `cn()` utility from `src/lib/utils.ts` to merge Tailwind classes.

### 3. Page Components (Server or Client)
**Location:** `src/app/*/page.tsx`  
**Pattern:** Typically server components by default, use "use client" only for interactivity

**Example:** [dashboard/page.tsx](src/app/(app)/dashboard/page.tsx)
```typescript
export default function DashboardPage() {
  return <div className="p-6">{/* Dashboard content */}</div>;
}
```

Pages inside `src/app/(app)/` are already wrapped by `src/app/(app)/layout.tsx`, so they must not render `DashboardShell` again.

### 4. Creating New Components
**When adding a component:**
1. Choose location based on scope (feature vs. shared)
2. Use PascalCase filename
3. Export named component
4. Define TypeScript interface for props
5. Use `cn()` utility for class merging in Tailwind projects
6. Add "use client" only if component has state/events

**Import paths:**
- Use `@/` path alias (e.g., `import { Button } from "@/components/ui/button"`)
- Don't use relative paths

---

## API Routes & Database

### API Routes (Current Status: Scaffolded)
**Location:** `src/app/api/`

Current status:
- `api/calendar/external/route.ts` loads external DHBW ICS events.
- `api/activity/`, `api/events/`, and `api/study-plan/` are scaffolded but still empty.

**When implementing API routes:**
Use Next.js App Router API route conventions:
```typescript
export async function GET(request: Request) {
  // implementation
}

export async function POST(request: Request) {
  // implementation
}
```

### Database & Prisma
**Current Status:** Basic PostgreSQL config only (no models defined)

**Schema location:** [prisma/schema.prisma](./prisma/schema.prisma)

**When adding models:**
1. Define in `schema.prisma`
2. Run `npm run prisma:migrate` to create migrations
3. Run `npm run prisma:generate` to update Prisma Client

---

## Common Development Tasks

### Adding a New Page
1. Create directory in `src/app/` (e.g., `src/app/profile/`)
2. Add `page.tsx` file
3. Use existing layouts or create new ones
4. Example: [dashboard/page.tsx](src/app/dashboard/page.tsx)

### Adding a New Component
1. Create file in appropriate `src/components/` subdirectory
2. Export named component with PascalCase name
3. Define props interface
4. Use existing UI primitives from `src/components/ui/`

### Adding UI Primitives
Use shadcn setup (if needed):
```bash
npm run shadcn:init    # Already done (base-nova style)
# New components can be added via shadcn when needed
```

### Styling
- Use **Tailwind CSS utilities** directly in JSX
- Use `cn()` utility from `@/lib/utils` for conditional/merged classes
- CSS variables available for theme customization (see [globals.css](src/app/globals.css))

### Type Definitions
- Add shared types to `src/types/` as needed
- Use `interface` for React props
- Component-specific types can live in component files

---

## Important Files & Their Purpose

| File | Purpose |
|------|---------|
| [package.json](./package.json) | Dependencies and scripts |
| [tsconfig.json](./tsconfig.json) | TypeScript configuration with `@/*` path alias |
| [next.config.ts](./next.config.ts) | Next.js configuration |
| [components.json](./components.json) | shadcn/ui setup (base-nova, Lucide icons, CSS variables) |
| [src/app/layout.tsx](src/app/layout.tsx) | Root layout and metadata |
| [src/app/globals.css](src/app/globals.css) | Global styles and Tailwind theme variables |
| [src/lib/utils.ts](src/lib/utils.ts) | `cn()` utility for class merging (used everywhere) |
| [prisma/schema.prisma](./prisma/schema.prisma) | Database schema |
| [docs/design/design.md](./docs/design/design.md) | Design decisions and UI/UX concepts |
| [docs/tech-stack.md](./docs/tech-stack.md) | Technology rationale |

---

## Potential Pitfalls & Development Notes

### 1. Class Merging with Tailwind
**Issue:** Direct Tailwind class strings can conflict/override  
**Solution:** Always use the `cn()` utility from `@/lib/utils.ts`
```typescript
// ❌ Wrong - can cause conflicts
className="p-4 p-2"  // Last class wins inconsistently

// ✅ Correct
className={cn("p-4", someCondition && "p-2")}
```

### 2. Database: Schema Defined, Local Setup Required
**Current state:** Prisma schema and initial migration are committed (`prisma/schema.prisma`, `prisma/migrations/`).  
**Note:** Each developer needs a local `.env` with `DATABASE_URL` (see README setup section) and runs `npm run prisma:migrate` once to apply the migration against the local Docker PostgreSQL.

### 3. API Routes Are Mostly Scaffolded
**Current state:** Calendar external sync exists; study-plan, activity, and events handlers are still missing.  
**Next step:** Add `route.ts` files with GET/POST handlers when backend development begins.

### 4. Feature Directories Are Mixed
Calendar, settings, and notifications already contain components. Dashboard and study-plan are still placeholders.

### 5. TypeScript Strict Mode Enabled
- All types must be properly defined
- No implicit `any` types allowed
- Props interfaces required for all components

### 6. Server vs. Client Components
- Default: Server components (smaller bundle, better performance)
- Use "use client" only when needed for state/events
- Keep the component tree mostly server-rendered for optimal Next.js performance

---

## Useful Documentation

- **Design & Prototypes:** See [design/prototypes/prototype_1/](./docs/design/prototypes/prototype_1/) for interactive HTML mockups
- **Design Board:** Collaborative Excalidraw board referenced in [design.md](./docs/design/design.md)
- **Roles & Team:** See [roles.md](./docs/roles.md) for team structure
- **Tech Stack Rationale:** [tech-stack.md](./docs/tech-stack.md)

---

## Next Steps for Development

1. **Database Models:** Define Prisma schema for users, activities, events, study plans
2. **API Implementation:** Add route handlers for CRUD operations
3. **Feature Components:** Fill in dashboard, calendar, and study-plan components
4. **Type Definitions:** Centralize data models in `src/types/`
5. **Form Handling:** Implement form submission logic (currently only LoginForm has structure)
6. **Authentication:** Integrate authentication (not yet started)
7. **Styling Refinement:** Fine-tune Tailwind theme and component variants

---

## AI Agent Tips

- When adding features, follow the existing component patterns (PascalCase files, kebab-case dirs)
- Use the `@/*` path alias consistently
- Leverage existing UI components from `src/components/ui/` to maintain consistency
- Keep components small and focused; split large features into multiple components
- Always use the `cn()` utility for conditional class merging
- Check [components.json](./components.json) for import aliases before creating utility functions
- Most directories have `.gitkeep` files marking them as "ready for implementation" — this is intentional
