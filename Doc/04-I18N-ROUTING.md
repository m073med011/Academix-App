# Academix 2.0 — i18n, Routing & Navigation

---

## 1. Internationalization (i18n)

### 1.1 Supported Locales
```typescript
// configs/i18n.ts
export const i18n = {
  defaultLocale: "en",
  locales: ["en", "ar"],
  localeDirection: { en: "ltr", ar: "rtl" },
  localeNames: { en: "english", ar: "arabic" },
} as const
```

### 1.2 How i18n Works
- **URL-based:** Every route has a `[lang]` segment → `/en/dashboard`, `/ar/dashboard`
- **Dictionary-based:** JSON files at `data/dictionaries/en.json` and `ar.json`
- **Server-side loading:** `getDictionary(locale)` dynamically imports the correct JSON
- **Client-side access:** Dictionary is passed via `DictionarySyncProvider` and accessed through Zustand stores

### 1.3 Dictionary Loading
```typescript
// lib/get-dictionary.ts
const dictionaries = {
  en: () => import("@/data/dictionaries/en.json").then(m => m.default),
  ar: () => import("@/data/dictionaries/ar.json").then(m => m.default),
}

export async function getDictionary(locale: LocaleType) {
  return dictionaries[locale]()
}
```

### 1.4 Fonts by Language
```typescript
// layout.tsx
const latoFont = Lato({ subsets: ["latin"], variable: "--font-lato" })
const cairoFont = Cairo({ subsets: ["arabic"], variable: "--font-cairo" })

// Applied via CSS:
// [&:lang(en)]:font-lato [&:lang(ar)]:font-cairo
```

### 1.5 Rules for i18n
> - **All user-facing strings** must come from the dictionary, NOT hardcoded
> - When adding a new string, add it to BOTH `en.json` AND `ar.json`
> - Use `getDictionaryValue(key, section)` from `lib/utils.ts` for safe dictionary access
> - Locale is set on `<html lang={locale} dir={direction}>` — this drives font and layout direction
> - Use `ensureLocalizedPathname(path, locale)` from `lib/i18n.ts` when building links

---

## 2. Routing Architecture

### 2.1 Route Groups
```
app/[lang]/
├── page.tsx                           # Landing page (/)
├── (dashboard-layout)/                # Group: auth-required, has sidebar
│   ├── layout.tsx                     # Dashboard layout wrapper
│   ├── dashboards/
│   │   ├── analytics/                 # /dashboards/analytics
│   │   ├── crm/                       # /dashboards/crm
│   │   └── ecommerce/                 # /dashboards/ecommerce
│   ├── apps/
│   │   ├── email/                     # /apps/email (redirects to /inbox)
│   │   ├── chat/                      # /apps/chat
│   │   ├── calendar/                  # /apps/calendar
│   │   └── kanban/                    # /apps/kanban
│   ├── organizations/                 # /organizations
│   │   └── [slug]/                    # /organizations/:slug
│   ├── cart/                          # /cart
│   ├── checkout/                      # /checkout
│   ├── payment/                       # /payment
│   ├── order-confirmation/            # /order-confirmation
│   ├── pages/
│   │   ├── account/                   # /pages/account
│   │   ├── payment/                   # /pages/payment
│   │   └── pricing/                   # /pages/pricing
│   ├── public/
│   │   ├── store/                     # /public/store
│   │   └── course/                    # /public/course
│   └── (design-system)/              # UI showcase (colors, typography, components)
│       ├── colors/
│       ├── typography/
│       ├── ui/                        # 40+ component demos
│       ├── extended-ui/               # 20 extended component demos
│       ├── forms/
│       ├── tables/
│       ├── charts/
│       ├── icons/
│       └── cards/
│
└── (plain-layout)/                    # Group: no sidebar/header
    ├── layout.tsx
    ├── (auth)/                        # Auth pages
    │   ├── sign-in/
    │   ├── register/
    │   ├── forgot-password/
    │   ├── new-password/
    │   ├── verify-email/
    │   ├── verify-2fa/
    │   └── role-selection/
    └── pages/
        ├── coming-soon/
        ├── maintenance.tsx
        ├── not-found-404.tsx
        └── unauthorized-401.tsx
```

### 2.2 Navigation Data (`data/navigations.ts`)

Sidebar navigation is data-driven via `NavigationType[]`:

```typescript
interface NavigationType {
  title: string                    // Section title
  items: NavigationRootItem[]      // Section items
}

// Items can be links or have nested sub-items
type NavigationRootItem =
  | { title, href, iconName }                // Direct link
  | { title, iconName, items: NestedItem[] } // Collapsible group
```

**Navigation Sections:**
1. **Dashboards** — Analytics, Organizations
2. **Apps** — Email, Chat, Calendar, Kanban, Todo (soon)
3. **Public** — Store
4. **Design System** — Colors, Typography, UI (40+), Extended UI (20), Forms, Tables, Charts, Icons, Cards

### 2.3 Active Route Detection
```typescript
// lib/utils.ts
function isActivePathname(basePath, currentPath, exactMatch = false) {
  // exactMatch: strict comparison
  // Default: allows deeper routes (e.g., "/dashboard" matches "/dashboard/stats")
}
```

### 2.4 Dynamic Routes
| Pattern          | Example                 | Use              |
|---|---|---|
| `[lang]`         | `/en/...` or `/ar/...`  | Language segment |
| `[slug]`         | `/organizations/my-org` | Organization identifier |
| `[...not-found]` | Any unmatched path      | 404 catch-all    |
| `[...nextauth]`  | `/api/auth/*`           | NextAuth handler |

### 2.5 Redirects (`next.config.mjs`)
```javascript
async redirects() {
  return [
    { source: "/docs", destination: "/docs/overview/introduction", permanent: true },
    { source: "/:lang/apps/email", destination: "/:lang/apps/email/inbox", permanent: true },
  ]
}
```

---

## 3. Next.js Configuration Highlights

```javascript
// next.config.mjs
{
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],  // MDX support
  transpilePackages: ["lucide-react"],                        // Required for tree-shaking
  typedRoutes: false,                                         // Disabled (manual route types)
  images: {
    remotePatterns: [
      "images.unsplash.com",     // Stock photos
      "api.dicebear.com",        // Avatar generation
      "res.cloudinary.com",      // Uploaded assets
      "lh3.googleusercontent.com", // Google profile pics
      "placehold.co",            // Placeholders
      "i.pravatar.cc",           // Test avatars
      "example.com",             // Generic
    ]
  }
}
```

> **Rule:** When adding a new external image source, you MUST add its hostname to `images.remotePatterns` in `next.config.mjs`, or Next.js `<Image>` optimization will reject it.
