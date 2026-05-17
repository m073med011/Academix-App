# Academix 2.0 — Frontend Documentation

> **Comprehensive senior-level documentation** for the Academix 2.0 frontend.  
> Generated: 2026-02-16

---

## 📖 Document Index

| #   | Document                                                     | What's Inside                                                                                                                                                             |
|-----|--------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 01  | [Architecture](./01-ARCHITECTURE.md)                         | Tech stack, project structure, directory tree, route groups, colocation pattern, import conventions                                                                       |
| 02  | [Authentication](./02-AUTHENTICATION.md)                     | Auth flow diagram, middleware logic, route classification, token service, API client/server layer, auth components                                                        |
| 03  | [Patterns, State & Theming](./03-PATTERNS-STATE-THEMING.md)  | Provider hierarchy, settings system, 12-theme system, CSS variable architecture, Zustand stores, layout modes, custom hooks                                               |
| 04  | [i18n & Routing](./04-I18N-ROUTING.md)                       | Internationalization (EN/AR), route architecture, navigation data structure, dynamic routes, Next.js config                                                               |
| 05  | [UI Component Catalog](./05-UI-COMPONENTS.md)                | All 82+ shadcn/Radix UI components listed with descriptions, plus extended components and architecture rules                                                              |
| 06  | [API Types Reference](./06-API-TYPES.md)                     | All TypeScript types mirroring the backend: entities, enums, request/response types, populated vs ID patterns                                                             |
| 07  | [Conventions & Rules](./07-CONVENTIONS-RULES.md)             | ⭐ **Most important** — File naming, import order, component patterns, styling rules, state management rules, error handling, form patterns, feature checklist, env vars |
| 08  | [Utilities Reference](./08-UTILITIES.md)                     | All utility functions in `lib/utils.ts` with signatures and descriptions                                                                                                  |

---

## 🚀 Quick Start

```bash
# Prerequisites: Node ≥ 22, pnpm ≥ 10

cd client
pnpm install
pnpm dev          # http://localhost:3000
```

## 🏗️ Architecture at a Glance

```
Next.js 16 (App Router + Turbopack)
├── React 19 + TypeScript 5
├── Tailwind CSS 4 + CSS Variables (12 themes)
├── shadcn/ui (New York) + Radix UI (82+ components)
├── NextAuth v4 (JWT + Google OAuth)
├── Zustand (global client state)
├── React Hook Form + Zod (forms)
├── Custom API Layer (apiClient / apiServer)
└── i18n (EN/AR with dictionary JSONs)
```

## ⚠️ Critical Rules (Quick Reference)

1. **Colors:** Always use CSS variable tokens (`bg-primary`, `text-foreground`). Never hardcode colors.
2. **Imports:** Always use `@/` alias. Never deep relative imports.
3. **Files:** Always `kebab-case`. Never PascalCase or camelCase filenames.
4. **API:** Use `apiClient` in client components, `apiServer` in server components. Never mix.
5. **State:** Zustand for global state, Context for settings, React Hook Form for forms.
6. **i18n:** All strings in both `en.json` AND `ar.json`. Never hardcode user-facing text.
7. **Routes:** Register new routes in `configs/auth-routes.ts` if public/guest.
8. **Private folders:** `_prefixed` folders are private to their route. Never import across routes.
9. **Package manager:** pnpm only. Never npm or yarn.
10. **Components:** Named exports, accept `className`, merge with `cn()`, no API calls in UI components.
