# Academix 2.0 — System Patterns, State & Theming

---

## 1. Provider Hierarchy

Providers wrap the entire app in `providers/index.tsx`. The nesting order matters:

```
<SettingsProvider locale={locale}>      ← Cookie-based settings (theme, radius, mode, layout)
  <ModeProvider>                         ← Light/Dark/System mode detection
    <ThemeProvider>                       ← Applies theme CSS variables
      <DirectionProvider direction={dir}> ← LTR/RTL via Radix Direction
        <NextAuthProvider session={session}> ← NextAuth SessionProvider
          <SidebarProvider>               ← shadcn sidebar state
            {children}
          </SidebarProvider>
        </NextAuthProvider>
      </DirectionProvider>
    </ThemeProvider>
  </ModeProvider>
</SettingsProvider>
```

> **Rule:** Never reorder providers. Components lower in the tree depend on values from providers above them. For example, `ThemeProvider` needs `ModeProvider` to know if it should apply light or dark variables.

### Dashboard Layout adds:
```
<DictionarySyncProvider dictionary={dictionary}> ← Syncs i18n dictionary into Zustand
  <Layout dictionary={dictionary}>                ← Sidebar + Header + Customizer
    {children}
  </Layout>
</DictionarySyncProvider>
```

---

## 2. Settings System (`contexts/settings-context.tsx`)

All user preferences are stored in a single **cookie** named `"settings"`:

```typescript
interface SettingsType {
  theme: ThemeType          // "zinc" | "slate" | "stone" | ... (12 options)
  mode: ModeType            // "light" | "dark" | "system"
  radius: RadiusType        // 0 | 0.3 | 0.5 | 0.75 | 1
  layout: LayoutType        // "vertical" | "horizontal"
  locale: LocaleType        // "en" | "ar"
  sidebarMode: SidebarModeType  // "open" | "icons" | "closed"
  lightness: number         // HSL lightness adjustment
}
```

### Default Settings:
```typescript
const defaultSettings: SettingsType = {
  theme: "zinc",
  mode: "system",
  radius: 0.5,
  layout: "vertical",
  locale: "en",
  sidebarMode: "open",
  lightness: 0,
}
```

### How to use:
```typescript
import { useSettings } from "@/hooks/use-settings"

function MyComponent() {
  const { settings, updateSettings, resetSettings } = useSettings()
  // settings.theme, settings.mode, etc.
}
```

> **Rule:** Settings are loaded from cookie on mount. The app renders `null` until settings are hydrated to avoid flash of unstyled content.

---

## 3. Theming System

### 3.1 Available Themes (12):
| Theme  | Light Primary HSL   | Dark Primary HSL    |
|--------|---------------------|---------------------|
| zinc   | `240 5.9% 10%`      | `240 5.2% 33.9%`    |
| slate  | `215.4 16.3% 46.9%` | `215.3 19.3% 34.5%` |
| stone  | `25 5.3% 44.7%`     | `33.3 5.5% 32.4%`   |
| gray   | `220 8.9% 46.1%`    | `215 13.8% 34.1%`   |
| neutral| `0 0% 45.1%`        | `0 0% 32.2%`        |
| red    | `0 72.2% 50.6%`     | `0 72.2% 50.6%`     |
| rose   | `346.8 77.2% 49.8%` | `346.8 77.2% 49.8%` |
| orange | `24.6 95% 53.1%`    | `20.5 90.2% 48.2%`  |
| green  | `142.1 76.2% 36.3%` | `142.1 70.6% 45.3%` |
| blue   | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` |
| yellow | `47.9 95.8% 53.1%`  | `47.9 95.8% 53.1%`  |
| violet | `262.1 83.3% 57.8%` | `263.4 70% 50.4%`   |

### 3.2 CSS Variable Architecture
All colors are defined as HSL values in CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --success: 142.1 76.2% 36.3%;
  --border: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
  /* + chart-1 through chart-5 */
  /* + sidebar-* variables */
  /* + FullCalendar variables (--fc-*) */
  /* + EmojiPicker variables (--epr-*) */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark overrides */
}
```

### 3.3 How Theme Switching Works
1. `ThemeProvider` reads `settings.theme` from context
2. It dynamically sets `--primary` CSS variable using the theme's `activeColor` values
3. Mode is applied via `.dark` class on the HTML element
4. `lightness` adjusts HSL lightness via `adjustLightness()` utility
5. `radius` sets `--radius` CSS variable

> **Rule:** ALWAYS use semantic color tokens (`bg-primary`, `text-foreground`, `border-border`) in components. NEVER hardcode hex/rgb colors. This ensures theming works correctly across all 12 themes and light/dark modes.

---

## 4. State Management

### 4.1 Zustand Stores

#### Cart Store (`stores/cart-store.ts`)
```typescript
interface CartStore {
  cart: CartWithCourses | null
  isLoading: boolean
  isInitialized: boolean
  discountCode: string | null
  discountAmount: number
  discountError: string | null
  dictionary: DictionaryType | null

  // Actions
  initializeCart(): Promise<void>
  addToCart(courseId: string): Promise<void>
  removeFromCart(courseId: string): Promise<void>
  clearCart(): Promise<void>
  refreshCart(): Promise<void>
  isInCart(courseId: string): boolean
  applyDiscount(code: string): Promise<void>
  removeDiscount(): void
}
```

**Selectors** (for computed values):
- `selectItemCount(state)` — Number of items in cart
- `selectTotalPrice(state)` — Total price (uses API's `totalPrice` or fallback calculation)
- `selectFinalPrice(state)` — Total minus discount

#### Purchased Courses Store (`stores/purchased-courses-store.ts`)
Tracks which courses the user has purchased.

### 4.2 Zustand Patterns

```typescript
// Creating a store
import { create } from "zustand"

export const useMyStore = create<MyStore>((set, get) => ({
  // State
  value: null,
  isLoading: false,

  // Actions
  doSomething: async () => {
    set({ isLoading: true })
    try {
      const data = await someService.fetch()
      set({ value: data })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Selectors (external for performance)
export const selectDerived = (state: MyStore) => computeValue(state.value)

// Usage in components
const value = useMyStore((state) => state.value)
const derived = useMyStore(selectDerived)
const doSomething = useMyStore((state) => state.doSomething)
```

> **Rules:**
> - Define selectors outside the store for memoization
> - Use `get()` inside actions to access current state
> - Always set `isLoading` in try/finally
> - Use Zustand for **global client state** only. Use React Context for **UI settings**.

---

## 5. Layout System

### 5.1 Two Layout Modes
The app supports **vertical** and **horizontal** layouts, toggled via settings:

- **Vertical Layout** — Traditional sidebar on the left/right + top header
- **Horizontal Layout** — Navigation in the header, no sidebar

```typescript
// components/layout/index.tsx
const isVertical = useIsVertical()

return isVertical
  ? <VerticalLayout>{children}</VerticalLayout>
  : <HorizontalLayout>{children}</HorizontalLayout>
```

### 5.2 Sidebar States
```typescript
type SidebarModeType = "open" | "icons" | "closed"
```
- **open** — Full sidebar with text labels
- **icons** — Collapsed sidebar showing only icons
- **closed** — Sidebar completely hidden

### 5.3 Layout Components

| Component              | File                           | Purpose |
|------------------------|--------------------------------|----------------------------------------------|
| `Layout`               | `layout/index.tsx`             | Root layout switcher (vertical/horizontal)   |
| `Sidebar`              | `layout/sidebar.tsx`           | Sidebar navigation (uses shadcn `<Sidebar>`) |
| `Customizer`           | `layout/customizer.tsx`        | Settings panel (theme, mode, radius, layout) |
| `CommandMenu`          | `layout/command-menu.tsx`      | Cmd+K command palette                        |
| `AppBreadcrumb`        | `layout/app-breadcrumb.tsx`    | Dynamic breadcrumb navigation                |
| `UserDropdown`         | `layout/user-dropdown.tsx`     | User profile menu                            |
| `NotificationDropdown` | `layout/notification-dropdown.tsx` | Notification bell                        |
| `FullScreenToggle`     | `layout/full-screen-toggle.tsx`| Fullscreen toggle                            |
| `Footer`               | `layout/footer.tsx`            | Page footer                                  |
| `LandingHeader`        | `layout/landing-header.tsx`    | Landing page header                          |
| `LandingFooter`        | `layout/landing-footer.tsx`    | Landing page footer                          |
| `ToggleMobileSidebar`  | `layout/toggle-mobile-sidebar.tsx` | Mobile hamburger                         |

---

## 6. Custom Hooks

| Hook               | File                           | Purpose                        |
|--------------------|--------------------------------|--------------------------------|
| `useSettings`      | `hooks/use-settings.ts`        | Access settings context        |
| `useMode`          | `hooks/use-mode.tsx`           | Get resolved mode (light/dark) |
| `useIsVertical`    | `hooks/use-is-vertical.tsx`    | Check if layout is vertical    |
| `useIsRtl`         | `hooks/use-is-rtl.tsx`         | Check if direction is RTL      |
| `useMobile`        | `hooks/use-mobile.tsx`         | Check if viewport is mobile    |
| `useRadius`        | `hooks/use-radius.tsx`         | Get current border radius      |
| `useScrollDrag`    | `hooks/use-scroll-drag.ts`     | Horizontal scroll via drag     |
| `useThemeScrubber` | `hooks/use-theme-scrubber.ts`  | Theme preview scrubber         |
| `useToast`         | `hooks/use-toast.ts`           | Radix toast integration        |

> **Rule:** Place feature-specific hooks in `_hooks/` inside the route. Place reusable hooks in the top-level `hooks/` directory.
