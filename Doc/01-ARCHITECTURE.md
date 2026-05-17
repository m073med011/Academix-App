# Academix 2.0 — Frontend Architecture & Overview

> **Last updated:** 2026-02-16  
> **Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · pnpm 10

---

## 1. Tech Stack Summary

| Layer               | Technology                                      | Version |
|---------------------|-------------------------------------------------|---------|
| Framework           | Next.js (App Router + Turbopack)                | 16.0.7  |
| UI Library          | React                                           | 19.2.1  |
| Language            | TypeScript (strict-ish)                         | 5       |
| Styling             | Tailwind CSS 4 + CSS Variables                  | 4.1.17  |
| Component Library   | shadcn/ui (New York style) + Radix UI           | Latest  |
| State Management    | Zustand                                         | 5.0.9   |
| Forms               | React Hook Form + Zod 4                         | 7.68 / 4.1 |
| Auth                | NextAuth.js v4                                  | 4.24.13 |
| HTTP Client         | Custom `ApiClient` / `ApiServerClient` classes  | —       |
| Animation           | Framer Motion + GSAP                            | 12.x / 3.x |
| Charts              | Recharts                                        | 3.5.1   |
| Rich Text           | TipTap                                          | 3.13.0  |
| 3D                  | Three.js + React Three Fiber                    | 0.182   |
| Calendar            | FullCalendar                                    | 6.1.19  |
| i18n                | Custom dictionary-based (EN/AR)                 | —       |
| Package Manager     | pnpm                                            | 10.24.0 |
| Node                | ≥22                                             | —       |

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────┐   │   │
│  │  │ Middleware │→ │  Layouts   │→ │    Pages      │   │   │
│  │  │(i18n+Auth) │  │(Root/Dash) │  │(Route Groups) │   │   │
│  │  └────────────┘  └─────┬──────┘  └───────────────┘   │   │
│  │                        │                             │   │
│  │              ┌─────────▼──────────┐                  │   │
│  │              │   Provider Tree    │                  │   │
│  │              │ Settings → Mode →  │                  │   │
│  │              │ Theme → Direction →│                  │   │
│  │              │ NextAuth → Sidebar │                  │   │
│  │              └─────────┬──────────┘                  │   │
│  │                        │                             │   │        
│  │  ┌─────────┐  ┌───────▼───────┐  ┌───────────────┐   │   │
│  │  │ Zustand │  │  Components   │  │  Custom Hooks │   │   │
│  │  │ Stores  │  │  (shadcn/ui)  │  │               │   │   │
│  │  └────┬────┘  └───────────────┘  └───────────────┘   │   │
│  │       │                                              │   │
│  │  ┌────▼──────────────────────────────────────────┐   │   │
│  │  │          API Layer                            │   │   │
│  │  │  apiClient (browser) / apiServer (SSR)        │   │   │
│  │  │  Token Service (cookies) · NextAuth callbacks │   │   │
│  │  └────────────────────┬──────────────────────────┘   │   │
│  └───────────────────────┼──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS
                           ▼
              ┌────────────────────────┐
              │   NestJS Backend API   │
              │   (MongoDB · JWT)      │
              └────────────────────────┘
```

---

## 3. Directory Structure

```
client/
├── public/                      # Static assets (images, icons, fonts)
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── globals.css          # Global styles + Tailwind config + CSS vars
│   │   ├── themes.css           # Theme-specific CSS variable overrides
│   │   ├── landing-animations.css
│   │   ├── favicon.ico
│   │   ├── api/                 # Next.js API Routes (BFF layer)
│   │   │   ├── auth/            # Auth API routes
│   │   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   │   ├── sign-in/       # Custom sign-in route
│   │   │   │   ├── register/      # Custom register route
│   │   │   │   ├── verify-email/  # Email verification
│   │   │   │   ├── verify-2fa/    # 2FA verification
│   │   │   │   ├── resend-verification/
│   │   │   │   ├── complete-registration/
│   │   │   │   └── token/         # Token refresh endpoint
│   │   │   └── cloudinary/     # Cloudinary upload endpoint
│   │   └── [lang]/             # i18n dynamic segment (en | ar)
│   │       ├── layout.tsx      # Root layout (fonts, providers, toasters)
│   │       ├── page.tsx        # Landing page
│   │       ├── global-error.tsx
│   │       ├── [...not-found]/ # Catch-all 404
│   │       ├── (dashboard-layout)/  # Auth-required layout group
│   │       │   ├── layout.tsx       # Dashboard layout (sidebar, header)
│   │       │   ├── dashboards/      # Analytics, CRM, Ecommerce
│   │       │   ├── apps/           # Email, Chat, Calendar, Kanban
│   │       │   ├── organizations/  # Org management
│   │       │   ├── cart/           # Shopping cart
│   │       │   ├── checkout/       # Payment checkout
│   │       │   ├── payment/        # Payment processing
│   │       │   ├── order-confirmation/
│   │       │   ├── pages/          # Account, Payment, Pricing
│   │       │   ├── public/         # Store, Course (publicly viewable)
│   │       │   └── (design-system)/ # UI component showcase pages
│   │       └── (plain-layout)/     # No sidebar/header layout
│   │           ├── layout.tsx
│   │           ├── (auth)/         # Auth pages (sign-in, register, etc.)
│   │           └── pages/          # Coming soon, maintenance, etc.
│   │
│   ├── components/
│   │   ├── ui/                 # 82+ shadcn/Radix primitives
│   │   ├── auth/               # Auth-specific components
│   │   ├── layout/             # Layout shell components
│   │   ├── dashboards/         # Dashboard-specific components
│   │   └── pages/              # Shared page components
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities & services
│   ├── providers/              # React context providers
│   ├── contexts/               # React contexts (definitions)
│   ├── stores/                 # Zustand stores
│   ├── schemas/                # Zod validation schemas
│   ├── configs/                # App configuration
│   ├── data/                   # Static data & i18n dictionaries
│   ├── types/                  # API type definitions
│   ├── types.ts                # Core app type definitions
│   ├── middleware.ts           # Next.js middleware (auth + i18n)
│   ├── services/               # (reserved for future services)
│   └── mdx-components.tsx      # MDX component overrides
│
├── components.json             # shadcn/ui configuration
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs
├── prettier.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## 4. Key Architectural Decisions

### 4.1 App Router with Route Groups
- **`(dashboard-layout)`** — Wraps authenticated pages with sidebar + header + customizer
- **`(plain-layout)`** — Minimal wrapper for auth pages and static error pages
- Route groups use parentheses `()` so they **don't affect the URL**

### 4.2 Colocation Pattern
Each feature route colocates its private code using underscore-prefixed folders:
```
cart/
├── _components/    # Components used ONLY by this route
├── _hooks/         # Hooks used ONLY by this route
├── _services/      # API service functions for this feature
├── _types/         # Types scoped to this feature
└── page.tsx
```
> **Rule:** Underscore-prefixed folders (`_components`, `_services`, etc.) are **private** to their parent route and must NOT be imported from other routes.

### 4.3 Server vs Client Components
- **Layouts** are `async` Server Components (fetch session, dictionary)
- **Pages** that need data fetching are Server Components
- Interactive components add `"use client"` at the top
- The `Layout` component in `components/layout/index.tsx` is a Client Component

### 4.4 BFF Pattern (Backend-for-Frontend)
The `app/api/` directory acts as a BFF layer:
- Auth routes proxy to the NestJS backend
- Token management is handled server-side via HTTP-only cookies
- The `token` endpoint provides access tokens to client components

---

## 5. Import Alias Convention

All imports use the `@/` alias mapped to `src/`:

```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LocaleType } from "@/types"
```

> **Rule:** Never use relative imports that go more than one level up (`../../`). Always use `@/` for cross-directory imports.
