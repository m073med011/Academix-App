# Academix 2.0 — Utilities Reference

> All utilities are in `src/lib/utils.ts`

---

## Class Management

| Function | Signature                             | Description                                                            |
|----------|---------------------------------------|------------------------------------------------------------------------|
| `cn`     | `(...inputs: ClassValue[]) => string` | Merge Tailwind classes with clsx + tailwind-merge. **Use everywhere.** |

---

## String Utilities

| Function               | Signature                       | Description                                         |
|------------------------|---------------------------------|-----------------------------------------------------|
| `getInitials`          | `(fullName: string) => string`  | Extract initials from a name → `"John Doe"` → `"JD"`|
| `camelCaseToTitleCase` | `(str: string) => string`       | `"firstName"` → `"First Name"`                      |
| `titleCaseToCamelCase` | `(str: string) => string`       | `"First Name"` → `"firstName"`                      |
| `slugify`              | `(text: string) => string`      | `"Hello World!"` → `"hello-world"`                  |
| `isUrl`                | `(text: string) => boolean`     | Validate URL format using Zod                       |

---

## Path/URL Utilities

| Function                 | Signature                            | Description                                      |
|--------------------------|--------------------------------------|--------------------------------------------------|
| `ensureWithPrefix`       | `(value, prefix) => string`          | Add prefix if missing                            |
| `ensureWithSuffix`       | `(value, suffix) => string`          | Add suffix if missing                            |
| `ensureWithoutPrefix`    | `(value, prefix) => string`          | Remove prefix if present                         |
| `ensureWithoutSuffix`    | `(value, suffix) => string`          | Remove suffix if present                         |
| `ensureRedirectPathname` | `(base, redirect) => string`         | Build `?redirectTo=` URL                         |
| `isActivePathname`       | `(base, current, exact?) => boolean` | Check if path is active (supports nested routes) |

---

## Formatting Utilities

| Function                  | Signature                               | Description                                 |
|---------------------------|-----------------------------------------|---------------------------------------------|
| `formatCurrency`          | `(value, locale?, currency?) => string` | Format as currency → `"$1,500"`             |
| `formatPercent`           | `(value, locale?) => string`            | Format as percentage → `"50%"`              |
| `formatDate`              | `(value) => string`                     | Format date → `"Feb 16, 2026"`              |
| `formatDateWithTime`      | `(value) => string`                     | Date + time → `"Feb 16, 2026 02:30 PM"`     |
| `formatDateShort`         | `(value) => string`                     | Short date → `"Feb 16"`                     |
| `formatTime`              | `(value) => string`                     | Time only → `"2:30 PM"`                     |
| `formatRelativeDate`      | `(value?) => string`                    | Smart: `"Today"`, `"Yesterday"`, or date    |
| `formatDistance`          | `(value) => string`                     | Time ago → `"3 hrs ago"`                    |
| `formatDuration`          | `(value) => string`                     | Duration → `"2h 30m"`                       |
| `formatNumberToCompact`   | `(value, locale?) => string`            | Compact → `"1.5K"`                          |
| `formatFileSize`          | `(bytes, decimals?) => string`          | File size → `"1.5 MB"` (decimal)            |
| `formatBytes`             | `(bytes) => string`                     | File size → `"1.5 MB"` (binary)             |
| `formatFileType`          | `(type) => string`                      | MIME type prefix → `"image"`                |
| `formatUnreadCount`       | `(count) => string/number`              | Caps at `"+99"`                             |
| `formatOverviewCardValue` | `(value, style) => string`              | Format by style (percent/duration/currency) |
| `ratingToPercentage`      | `(rating, max, digits?) => string`      | Rating as percentage                        |

---

## Number & Date Utilities

| Function        | Signature                   | Description                  |
|-----------------|-----------------------------|------------------------------|
| `isEven`        | `(num) => boolean`          | Check if number is even      |
| `isNonNegative` | `(num) => boolean`          | Check if number ≥ 0          |
| `isBeforeToday` | `(date) => boolean`         | Check if date is in the past |
| `timeToDate`    | `(timeStr, base?) => Date`  | Convert `"HH:mm"` to Date    |
| `remToPx`       | `(rem) => number`           | Convert rem to pixels        |
| `wait`          | `(ms?) => Promise`          | Async delay (default 250ms)  |

---

## Commerce Utilities

| Function                 | Signature                             | Description                  |
|--------------------------|---------------------------------------|------------------------------|
| `getCreditCardBrandName` | `(number) => string`                  | Detect card brand from number|
| `getDiscountedPrice`     | `(price, rate, isAnnual?) => number`  | Calculate discounted price   |

---

## i18n Utilities

| Function             | Signature                   | Description                                     |
|----------------------|-----------------------------|-------------------------------------------------|
| `getDictionaryValue` | `(key, section) => string`  | Safely get dictionary value (throws on invalid) |
| `adjustLightness`    | `(hsl, amount) => string`   | Adjust HSL lightness for theming                |
