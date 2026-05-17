# Academix 2.0 — Conventions, Rules & Best Practices

> **This is the most important document.** Follow these rules to maintain codebase consistency, cleanliness, and extensibility.

---

## 1. File & Folder Naming

| Item            | Convention                  | Example |
|-----------------|-----------------------------|---------|
| Components      | `kebab-case.tsx`            | `user-dropdown.tsx` |
| Hooks           | `use-*.ts` or `use-*.tsx`   | `use-mobile.tsx` |
| Stores          | `*-store.ts`                | `cart-store.ts` |
| Schemas         | `*-schema.ts`               | `register-schema.ts` |
| Services        | `*-service.ts`              | `cart-service.ts` |
| Types           | `types.ts` or descriptive   | `api.ts` |
| Config files    | descriptive `.ts`           | `themes.ts`, `next-auth.ts` |
| Route folders   | `kebab-case`                | `forgot-password/` |
| Private folders | `_prefixed`                 | `_components/`, `_services/` |
| Layout groups   | `(parenthesized)`           | `(dashboard-layout)/` |

> **Rule:** NEVER use `PascalCase` or `camelCase` for file names. Always `kebab-case`.

---

## 2. Import Order

Follow this strict import order (enforced by `@ianvs/prettier-plugin-sort-imports`):

```typescript
// 1. External libraries (react, next, etc.)
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. Type-only imports
import type { LocaleType } from "@/types"
import type { ReactNode } from "react"

// 3. Internal aliases (@/)
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// 4. Relative imports (same feature)
import { CartItem } from "./_components/cart-item"
```

> **Rules:**
> - Type-only imports use `import type { ... }`
> - Always use `@/` path alias for cross-directory imports
> - Relative imports only within the same feature folder

---

## 3. Component Architecture

### Server vs Client Component Decision

```
Is this component interactive?
├── YES → "use client" at top
│   ├── Does it use hooks? → Client Component
│   ├── Does it handle events? → Client Component
│   └── Does it use browser APIs? → Client Component
└── NO → Server Component (default)
    ├── Does it fetch data? → async Server Component
    └── Does it only render? → Server Component
```

### Component File Structure
```typescript
// 1. "use client" directive (if needed)
"use client"

// 2. Imports
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// 3. Types/Interfaces
interface MyComponentProps {
  className?: string
  children: ReactNode
}

// 4. Component definition
export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  )
}

// 5. Display name (for forwardRef components)
MyComponent.displayName = "MyComponent"
```

> **Rules:**
> - Named exports only (no `export default`)
> - Accept `className` prop and merge with `cn()`
> - Keep components focused — one responsibility per component
> - No API calls in UI components — fetch in pages/layouts or use stores

---

## 4. Feature/Route Pattern (Colocation)

When creating a new feature route:

```
app/[lang]/(dashboard-layout)/my-feature/
├── page.tsx              # Route entry point (Server Component preferred)
├── my-feature-client.tsx # Client component wrapper (if needed)
├── _components/          # Private components for this route ONLY
│   ├── feature-card.tsx
│   └── feature-list.tsx
├── _services/            # API calls for this feature
│   └── feature-service.ts
├── _hooks/               # Custom hooks for this feature
│   └── use-feature-data.ts
└── _types/               # TypeScript types for this feature
    └── types.ts
```

> **Rules:**
> 1. `_prefixed` folders are PRIVATE — never import from another route's `_` folders
> 2. Service files handle all API calls using `apiClient` (client) or `apiServer` (server)
> 3. If a component is shared across routes, move it to `components/`
> 4. If a hook is reusable, move it to `hooks/`
> 5. Page components should be thin — delegate to child components

### Service File Pattern
```typescript
// _services/feature-service.ts
import { apiClient } from "@/lib/api-client"
import type { Feature, CreateFeatureRequest } from "@/types/api"

export const featureService = {
  async getAll() {
    const response = await apiClient.get<Feature[]>("/v1/features")
    return response.data
  },

  async create(data: CreateFeatureRequest) {
    const response = await apiClient.post<Feature>("/v1/features", data)
    return response.data
  },
}
```

---

## 5. Styling Rules

### DO:
```typescript
// ✅ Use semantic tokens
<div className="bg-background text-foreground border-border" />

// ✅ Use cn() for conditional classes
<div className={cn("base", isActive && "bg-primary")} />

// ✅ Use CSS variables for custom values
<div style={{ color: `hsl(var(--primary))` }} />

// ✅ Use Tailwind responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
```

### DON'T:
```typescript
// ❌ NEVER hardcode colors
<div className="bg-[#ff0000]" />
<div style={{ color: "red" }} />

// ❌ NEVER use arbitrary values for design tokens
<div className="rounded-[8px]" />  // Use var(--radius) instead

// ❌ NEVER override theme colors inline
<div className="bg-blue-500" />  // Use bg-primary instead
```

> **Key Rule:** The entire color system runs through CSS variables. If you hardcode a color, it will NOT respect theme changes or dark mode.

---

## 6. State Management Rules

| State Type          | Solution             | When to Use |
|---------------------|----------------------|-------------|
| Server Data         | Fetch in Server Components | Data for initial page render |
| Global Client State | Zustand              | Cart, user preferences, shared data |
| UI Settings         | React Context        | Theme, mode, direction, sidebar |
| Form State          | React Hook Form      | All forms |
| URL State           | Next.js searchParams | Filters, pagination, tabs |
| Ephemeral UI        | `useState`           | Modals, dropdowns, local toggles |

> **Rules:**
> - NEVER use `useState` for data that multiple components need — use Zustand
> - NEVER store API response data in React Context — use Zustand stores
> - NEVER use Zustand for UI settings (theme, mode) — use the Settings Context
> - ALWAYS define Zustand selectors outside the store for perf

---

## 7. Error Handling Pattern

```typescript
// In service files
try {
  const data = await apiClient.post<T>(endpoint, body)
  return data
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isUnauthorized()) { /* redirect to login */ }
    if (error.isNotFound()) { /* show 404 */ }
    if (error.isValidationError()) { /* show form errors */ }
  }
  throw error
}

// In Zustand stores
try {
  set({ isLoading: true })
  const result = await service.doThing()
  set({ data: result })
  toast.success("Done!")
} catch (error) {
  toast.error(error instanceof Error ? error.message : "Failed")
  set({ isLoading: false })
  throw error
} finally {
  set({ isLoading: false })
}
```

---

## 8. Toast / Notification Pattern

Two toast systems are available:

| System       | Import                     | Use Case |
|--------------|----------------------------|----------|
| Sonner       | `@/components/ui/sonner`   | Primary — all new toasts |
| Radix Toast  | `@/hooks/use-toast`        | Legacy — don't add new ones |

### i18n-aware Toast:
```typescript
import { toast } from "@/components/ui/sonner"

// With dictionary
toast.success({ key: "toast.cart.addedToCart", dictionary })

// Without dictionary (fallback)
toast.success("Course added to cart")
```

---

## 9. Form Pattern

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MySchema } from "@/schemas/my-schema"
import type { z } from "zod"

type FormData = z.infer<typeof MySchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(MySchema),
    defaultValues: { field: "" },
  })

  async function onSubmit(data: FormData) {
    try {
      await myService.submit(data)
      toast.success("Saved!")
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

---

## 10. Adding New Features Checklist

When adding a new feature to the project, follow this complete checklist:

- [ ] **Route:** Create folder in `app/[lang]/(dashboard-layout)/`
- [ ] **Auth:** Register route in `configs/auth-routes.ts` if public/guest
- [ ] **Navigation:** Add entry in `data/navigations.ts` for sidebar
- [ ] **Types:** Add API types in `types/api.ts`
- [ ] **Service:** Create `_services/` with API calls
- [ ] **Components:** Create `_components/` for private components
- [ ] **i18n:** Add strings to BOTH `en.json` and `ar.json`
- [ ] **Images:** Add external domains to `next.config.mjs` if needed
- [ ] **Store:** Create Zustand store in `stores/` if global state needed
- [ ] **Schema:** Create Zod schema in `schemas/` for forms

---

## 11. Environment Variables

| Variable                        | Required | Purpose |
|---------------------------------|----------|---------|
| `BASE_URL`                      | ✅       | App base URL (metadata) |
| `NEXTAUTH_URL`                  | ✅       | NextAuth URL |
| `NEXTAUTH_SECRET`               | ✅       | NextAuth encryption secret |
| `LMS_BACKEND_URL`               | ✅       | NestJS API base URL |
| `NEXT_PUBLIC_LMS_BACKEND_URL`   | ✅       | Public API URL (client) |
| `NEXT_PUBLIC_HOME_PATHNAME`     | ❌       | Redirect after login |
| `GOOGLE_CLIENT_ID`              | ❌       | Google OAuth |
| `GOOGLE_CLIENT_SECRET`          | ❌       | Google OAuth |
| `NEXT_PUBLIC_CLOUDINARY_*`      | ❌       | Cloudinary upload |

> **Rule:** Server-only secrets must NOT have `NEXT_PUBLIC_` prefix. Only browser-needed values use `NEXT_PUBLIC_`.

---

## 12. Development Commands

```bash
pnpm dev          # Start with Turbopack (hot reload)
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint auto-fix
pnpm format       # Prettier format
```

> **Node ≥ 22** and **pnpm ≥ 10** required. Do NOT use npm or yarn.
