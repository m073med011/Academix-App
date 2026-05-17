# Academix 2.0 — UI Component Catalog

> All components are in `src/components/ui/`.  
> Style: **shadcn/ui (New York variant)** + Radix UI primitives.  
> Config: `components.json` → aliases `@/components/ui`, `@/lib/utils`, `@/hooks`.

---

## 1. Core Primitives (shadcn/Radix)

| Component       | File                  | Description                                                              |
|-----------------|-----------------------|--------------------------------------------------------------------------|
| Accordion       | `accordion.tsx`       | Expandable content sections (Radix)                                      |
| Alert           | `alert.tsx`           | Contextual feedback messages (info, error, warning) |
| Alert Dialog    | `alert-dialog.tsx`    | Modal confirmation dialog with actions (Radix) |
| Aspect Ratio    | `aspect-ratio.tsx`    | Maintain width-to-height ratio for media (Radix) |
| Avatar          | `avatar.tsx`          | User profile images with fallback initials (Radix) |
| Badge           | `badge.tsx`           | Small status labels/tags with variant support |
| Breadcrumb      | `breadcrumb.tsx`      | Navigation trail showing page hierarchy |
| Button          | `button.tsx`          | Primary action element with CVA variants (default, destructive, outline, secondary, ghost, link) |
| Calendar        | `calendar.tsx`        | Date picker calendar grid (react-day-picker) |
| Card            | `card.tsx`            | Content container with header, content, footer |
| Carousel        | `carousel.tsx`        | Embla-powered image/content slider with autoplay |
| Chart           | `chart.tsx`           | Recharts wrapper with theme-aware color tokens |
| Checkbox        | `checkbox.tsx`        | Toggle checkbox input (Radix) |
| Collapsible     | `collapsible.tsx`     | Show/hide content sections (Radix) |
| Command         | `command.tsx`         | Command palette / search input (cmdk) |
| Context Menu    | `context-menu.tsx`    | Right-click menu (Radix) |
| Dialog          | `dialog.tsx`          | Modal overlay dialog (Radix) |
| Drawer          | `drawer.tsx`          | Bottom sheet / slide-in panel (vaul) |
| Dropdown Menu   | `dropdown-menu.tsx`   | Popover menu with submenus (Radix) |
| Form            | `form.tsx`            | React Hook Form + Zod integration wrapper |
| Hover Card      | `hover-card.tsx`      | Content popup on hover (Radix) |
| Input           | `input.tsx`           | Standard text input |
| Input OTP       | `input-otp.tsx`       | OTP code entry (input-otp) |
| Label           | `label.tsx`           | Form input label (Radix) |
| Menubar         | `menubar.tsx`         | Desktop-style menubar (Radix) |
| Navigation Menu | `navigation-menu.tsx` | Header navigation with dropdowns (Radix) |
| Pagination      | `pagination.tsx`      | Page number navigation |
| Popover         | `popover.tsx`         | Floating content panel (Radix) |
| Progress        | `progress.tsx`        | Progress bar (Radix) |
| Radio Group     | `radio-group.tsx`     | Radio button set (Radix) |
| Resizable       | `resizable.tsx`       | Resizable split panels (react-resizable-panels) |
| Scroll Area     | `scroll-area.tsx`     | Custom styled scroll container (Radix) |
| Select          | `select.tsx`          | Dropdown select (Radix) |
| Separator       | `separator.tsx`       | Visual divider line (Radix) |
| Sheet           | `sheet.tsx`           | Slide-in side panel (Radix Dialog variant) |
| Skeleton        | `skeleton.tsx`        | Loading placeholder animation |
| Slider          | `slider.tsx`          | Range slider input (Radix) |
| Sonner          | `sonner.tsx`          | Sonner toast wrapper with theme integration |
| Switch          | `switch.tsx`          | Toggle switch (Radix) |
| Table           | `table.tsx`           | HTML table with styled variants |
| Tabs            | `tabs.tsx`            | Tab navigation (Radix) |
| Textarea        | `textarea.tsx`        | Multi-line text input |
| Toast / Toaster | `toast.tsx`           | Legacy toast system (Radix) |
| Toast / Toaster | `toaster.tsx`         | Legacy toast system (Radix) |
| Toggle          | `toggle.tsx`          | Toggle button (Radix) |
| Toggle Group    | `toggle-group.tsx`    | Group of toggles (Radix) |
| Tooltip         | `tooltip.tsx`         | Hover tooltip (Radix) |

---

## 2. Extended Components

| Component               | File                              | Description                                               |
|-------------------------|-----------------------------------|-----------------------------------------------------------|
| Bento Grid              | `bento-grid.tsx`                  | Magazine-style grid layout                                |
| Cloudinary Uploader     | `cloudinary-uploader.tsx`         | Drag-and-drop file upload to Cloudinary                   |
| Code Block              | `code-block.tsx`                  | Syntax-highlighted code display (Shiki)                   |
| Data Table              | `data-table/`                     | TanStack Table integration (3 files)                      |
| Date Picker             | `date-picker.tsx`                 | Calendar-based single date picker                         |
| Date Range Picker       | `date-range-picker.tsx`           | Two-date range selection                                  |
| Date Time Picker        | `date-time-picker.tsx`            | Date + time combined picker                               |
| Default Image           | `defult-Image.tsx`                | Fallback image with placeholder                           |
| Editor                  | `editor/`                         | TipTap rich text editor (2 files)                         |
| Emoji Picker            | `emoji-picker.tsx`                | Emoji selection (emoji-picker-react)                      |
| File Dropzone           | `file-dropzone.tsx`               | react-dropzone multi-file upload                          |
| File Thumbnail          | `file-thumbnail.tsx`              | File type icon/preview                                    |
| Floating Icons Hero     | `floating-icons-hero-section.tsx` | Animated hero with floating icons                         |
| Input File              | `input-file.tsx`                  | Styled file input                                         |
| Input Group             | `input-group.tsx`                 | Input with prepend/append addons                          |
| Input Phone             | `input-phone.tsx`                 | Phone number with country code (react-phone-number-input) |
| Input Spin              | `input-spin.tsx`                  | Numeric stepper input                                     |
| Input Tags              | `input-tags.tsx`                  | Tag/chip input with multi-select                          |
| Input Time              | `input-time.tsx`                  | Time-only picker                                          |
| iPhone 15 Pro           | `iphone-15-pro.tsx`               | Device mockup frame                                       |
| Keyboard                | `keyboard.tsx`                    | Keyboard shortcut display                                 |
| Media Grid              | `media-grid.tsx`                  | Responsive media gallery                                  |
| Multiple Date Picker    | `multiple-date-picker.tsx`        | Select multiple dates                                     |
| Number Scrubber         | `number-scrubber.tsx`             | Drag-to-adjust numeric input                              |
| Password Input          | `password-input.tsx`              | Input with show/hide toggle                               |
| Radial Orbital Timeline | `radial-orbital-timeline.tsx`     | Circular timeline visualization                           |
| Rating                  | `rating.tsx`                      | Star rating component                                     |
| Safari                  | `safari.tsx`                      | Safari browser mockup frame                               |
| Scroll Morph Hero       | `scroll-morph-hero.tsx`           | Scroll-driven hero animation                              |
| Shader Background       | `shader-background-wrapper.tsx`   | WebGL/Three.js gradient background                        |
| Show More Text          | `show-more-text.tsx`              | Truncated text with expand button                         |
| Sidebar                 | `sidebar.tsx`                     | shadcn sidebar (21KB — full featured)                     |
| Sortable List           | `sortable-list.tsx`               | Drag-and-drop reorderable list (hello-pangea/dnd)         |
| Steps                   | `steps.tsx`                       | Multi-step progress / wizard                              |
| Sticky Layout           | `sticky-layout.tsx`               | Sticky sidebar content layout                             |
| Time Picker             | `time-picker.tsx`                 | Hour/minute picker                                        |
| Timeline                | `timeline.tsx`                    | Vertical timeline display                                 |
| Credit Card Brand Icon  | `credit-card-brand-icon.tsx`      | Visa/Mastercard/Amex icons                                |
| Dynamic Icon            | `dynamic-icon.tsx`                | Lucide icon loaded by name                                |
| Highlight               | `highlight.tsx`                   | Text highlight wrapper                                    |
| Language Dropdown       | `language-dropdown.tsx`           | EN/AR language switcher                                   |
| Mode Dropdown           | `mode-dropdown.tsx`               | Light/Dark/System mode switcher                           |
| Pricing Plans           | `pricing-plans.tsx`               | Pricing card layout                                       |
| Social Media Links      | `social-media-links.tsx`          | Social link icons                                         |

---

## 3. Component Architecture Rules

### CVA (Class Variance Authority) Pattern
All components with variants use CVA:
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      outline: "...",
    },
    size: {
      default: "...",
      sm: "...",
      lg: "...",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})
```

### `cn()` Utility
Always merge classes with `cn()` (clsx + tailwind-merge):
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", conditional && "optional-class", className)} />
```

### Component Pattern Rules
> 1. **Use `forwardRef`** for all components that accept a `ref`
> 2. **Export the component** as named export, not default
> 3. **Accept `className`** prop and merge with `cn()`
> 4. **Use CSS variables** for colors, never hardcode
> 5. **Use Radix `Slot`** pattern via `asChild` prop when needed
> 6. **Keep components pure** — no API calls inside UI components
