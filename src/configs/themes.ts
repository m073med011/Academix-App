export type ThemeColors = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  radius?: string
}

export const radii = [0, 0.3, 0.5, 0.75, 1]

// ─── Color Utilities ─────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1])
    g = parseInt("0x" + hex[2] + hex[2])
    b = parseInt("0x" + hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2])
    g = parseInt("0x" + hex[3] + hex[4])
    b = parseInt("0x" + hex[5] + hex[6])
  }

  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Returns relative luminance of a HEX color (0–1). */
function relativeLuminance(hex: string): number {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1])
    g = parseInt("0x" + hex[2] + hex[2])
    b = parseInt("0x" + hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2])
    g = parseInt("0x" + hex[3] + hex[4])
    b = parseInt("0x" + hex[5] + hex[6])
  }
  const toLinear = (c: number) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** Pick white or dark foreground based on contrast with the primary color. */
function contrastForeground(primaryHex: string): string {
  return relativeLuminance(primaryHex) > 0.4 ? "#18181b" : "#fafafa"
}

// ─── Theme Generator ─────────────────────────────────────────────────────────

export function generateThemeFromColor(primaryHex: string): {
  light: ThemeColors
  dark: ThemeColors
} {
  // Fallback if the value is undefined or not a valid hex
  if (!primaryHex || typeof primaryHex !== "string" || !primaryHex.startsWith("#")) {
    primaryHex = "#2563eb"
  }
  const [h, s, l] = hexToHsl(primaryHex)

  let lightPrimary = primaryHex
  let lightPrimaryFg = contrastForeground(lightPrimary)

  let darkPrimary = hslToHex(h, 70, 55)
  let darkPrimaryFg = contrastForeground(darkPrimary)

  // Handle monochromatic colors (white/black/grays)
  if (s < 10 || l > 95 || l < 5) {
    if (l > 90) {
      // White-ish: invert for light mode so it's visible
      lightPrimary = "#18181b"
      lightPrimaryFg = "#fafafa"
      darkPrimary = primaryHex
      darkPrimaryFg = "#18181b"
    } else if (l < 10) {
      // Black-ish: invert for dark mode so it's visible
      lightPrimary = primaryHex
      lightPrimaryFg = "#fafafa"
      darkPrimary = "#fafafa"
      darkPrimaryFg = "#18181b"
    } else {
      // Grays
      darkPrimary = primaryHex
      darkPrimaryFg = contrastForeground(darkPrimary)
    }
  }

  return {
    light: {
      background: "#ffffff",
      foreground: "#09090b",
      card: "#ffffff",
      cardForeground: "#09090b",
      popover: "#ffffff",
      popoverForeground: "#09090b",
      primary: lightPrimary,
      primaryForeground: lightPrimaryFg,
      secondary: "#f4f4f5",
      secondaryForeground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      accentForeground: "#18181b",
      destructive: "#ef4444",
      destructiveForeground: "#fafafa",
      border: "#e4e4e7",
      input: "#e4e4e7",
      ring: lightPrimary,
    },
    dark: {
      background: "#09090b",
      foreground: "#fafafa",
      card: "#09090b",
      cardForeground: "#fafafa",
      popover: "#09090b",
      popoverForeground: "#fafafa",
      primary: darkPrimary,
      primaryForeground: darkPrimaryFg,
      secondary: "#27272a",
      secondaryForeground: "#fafafa",
      muted: "#27272a",
      mutedForeground: "#a1a1aa",
      accent: "#27272a",
      accentForeground: "#fafafa",
      destructive: "#a50e0e",
      destructiveForeground: "#fafafa",
      border: "#27272a",
      input: "#27272a",
      ring: darkPrimary,
    },
  }
}
