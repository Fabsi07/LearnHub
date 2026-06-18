# LearnHub Development Guide for AI Agents

**Project:** Learning Management Application (MVP)  
**Stack:** Next.js 15 + React 18 + TypeScript + Tailwind CSS + Prisma  
**Status:** Functional local MVP with authentication, persistent study plans/tasks,
calendar integration, deterministic scheduling, notifications, feedback, and
role-based administration. Some settings and presentation/demo preparation remain open.

---

## Quick Start Commands

```bash
npm ci                # Install dependencies exactly from package-lock.json
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript without emitting files
npm test              # Run unit tests
npm run prisma:generate  # Generate Prisma Client
npm run prisma:deploy    # Apply committed migrations after setup/pull
npm run prisma:migrate   # Create a migration after editing schema.prisma
```

---

## Project Overview

LearnHub is a web-based learning management system designed for students to plan, organize, and track their study activities. The application provides centralized dashboard views, calendar-based task scheduling, and learning plan management.

**Implemented core features:**
- Registration, login/logout, database sessions, and protected routes
- Dashboard with learning-session, task, and study-plan summaries
- Persistent study-plan and task CRUD with progress tracking and replanning
- Deterministic workload calculation and collision-aware calendar scheduling
- Day/week/month/list calendar views, local events, and DHBW ICS integration
- Missed-session notifications and persistent notification settings
- User feedback plus `ADMIN`/`DEV` management views

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
- **API Routes:** Next.js Route Handlers for auth, study plans/tasks, calendar
  events/sources, notifications/settings, feedback, profile avatars, and admin users

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
│   │   ├── study-plan/     # Study-plan overview/detail routes
│   │   ├── feedback/       # User feedback route
│   │   ├── admin/          # ADMIN/DEV management route
│   │   └── layout.tsx      # App shell layout
│   ├── page.tsx            # Home route (/)
│   ├── login/page.tsx      # Login route (/login)
│   ├── register/page.tsx   # Registration route (/register)
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── components/             # Reusable React components
│   ├── ui/                 # UI primitives (button, input, card, label, checkbox)
│   ├── layout/             # Layout components (DashboardShell, Sidebar, Topbar)
│   ├── login/              # Login-specific components
│   ├── dashboard/          # Dashboard summaries and progress
│   ├── calendar/           # Calendar components and views
│   ├── notifications/      # Persistent notification UI
│   ├── settings/           # Profile/calendar/notification settings
│   ├── study-plan/         # Study-plan, task, scheduler preview UI
│   ├── feedback/           # Feedback submission
│   └── admin/              # User and feedback management
│
├── lib/                    # Utilities & helpers
│   ├── utils.ts            # `cn()` utility for Tailwind class merging
│   ├── auth/               # Password, cookie, session, and role helpers
│   ├── calculations/       # Study-plan calculation and replanning
│   ├── calendar/           # ICS mapping and external calendar hook
│   ├── study-plan/         # DTOs, validation, progress, scheduler, hooks
│   ├── notifications/      # Notification types, summaries, settings, checks
│   ├── feedback/           # Feedback server/types
│   └── admin/              # Admin user helpers
│
└── prisma/                 # Prisma schema & migrations
    ├── schema.prisma       # Complete current domain schema
    └── migrations/         # Committed database migrations
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
  // ... load notification summary and render sidebar/topbar/content
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

### API Routes (Current Status: Implemented MVP)
**Location:** `src/app/api/`

Current status:
- Auth: register, login, logout
- Study plans: CRUD, task CRUD, open-task replanning
- Calendar: local event CRUD, DHBW ICS feed, persisted course source
- Notifications: list/update/delete, missed-session checks and settings
- Feedback: submission and management
- Admin: role-protected user management
- Profile: avatar upload

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
**Current Status:** PostgreSQL schema and migrations are implemented.

**Schema location:** [prisma/schema.prisma](./prisma/schema.prisma)

Current models include `User`, `Session`, `StudyPlan`, `Task`, `CalendarEvent`,
`CalendarSource`, `Notification`, `NotificationSettings`, and `Feedback`.

**When changing models:**
1. Define in `schema.prisma`
2. Run `npm run prisma:migrate` to create migrations
3. Run `npm run prisma:generate` to update Prisma Client

For a fresh checkout or after pulling committed migrations, use
`npm run prisma:deploy` instead of creating a new migration.

---

## Common Development Tasks

### Adding a New Page
1. Create the route in the appropriate public or `(app)` directory
2. Add `page.tsx` file
3. Use existing layouts or create new ones
4. Example: [dashboard/page.tsx](src/app/(app)/dashboard/page.tsx)

### Adding a New Component
1. Create file in appropriate `src/components/` subdirectory
2. Export named component with PascalCase name
3. Define props interface
4. Use existing UI primitives from `src/components/ui/`

### Adding UI Primitives
Use the existing shadcn/Base UI setup. New primitives can be added manually in
`src/components/ui/` following the established component patterns.

### Styling
- Use **Tailwind CSS utilities** directly in JSX
- Use `cn()` utility from `@/lib/utils` for conditional/merged classes
- CSS variables available for theme customization (see [globals.css](src/app/globals.css))

### Type Definitions
- Keep feature DTOs/types in `src/lib/<feature>/` unless they are truly global
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
**Note:** Each developer needs a local `.env` (see README/SETUP). Apply committed
migrations with `npm run prisma:deploy`, then run `npm run prisma:generate`.
Use `POSTGRES_PORT` plus the matching `DATABASE_URL` for local port conflicts.

### 3. APIs Are User-Scoped
All protected route handlers must validate the database session. Queries and
mutations for study plans, tasks, events, notifications, and feedback must stay
scoped to the authenticated user. Middleware cookie checks are not a substitute
for server-side session and role checks.

### 4. Some Settings Are Still Partial
Profile name/e-mail changes, password reset, general deadline reminders, and
daily digest controls are visible but not fully persisted. Do not present these
as completed backend features.

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

## Current Follow-up Areas

1. **Demo readiness:** reproducible presentation data and a verified end-to-end demo flow
2. **Documentation:** align PRD, acceptance test, and architecture documents with the implemented MVP
3. **Settings:** persist the remaining profile/reminder controls or label them clearly as future work
4. **Testing:** extend coverage beyond the current study-plan unit tests to API and end-to-end flows
5. **Product hardening:** deployment, rate limiting, password recovery, and external storage remain outside the local MVP

---

## AI Agent Tips

- When adding features, follow the existing component patterns (PascalCase files, kebab-case dirs)
- Use the `@/*` path alias consistently
- Leverage existing UI components from `src/components/ui/` to maintain consistency
- Keep components small and focused; split large features into multiple components
- Always use the `cn()` utility for conditional class merging
- Check [components.json](./components.json) for import aliases before creating utility functions
- Preserve the existing Prisma models, API ownership checks, and scheduler constraints
