# Academix 2.0 — Authentication & Middleware

---

## 1. Authentication Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                          │
│                                                                  │
│  ┌─────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │ Browser  │──▶│  Middleware   │──▶│  NextAuth    │              │
│  │ Request  │   │ (i18n+Auth)  │   │  Session     │              │
│  └─────────┘   └──────┬───────┘   └──────┬───────┘              │
│                        │                   │                      │
│         ┌──────────────▼───────────────────▼──────────┐          │
│         │            Route Decision                    │          │
│         │                                              │          │
│         │  Public?  → Allow                            │          │
│         │  Guest?   → Allow only unauthenticated       │          │
│         │  Protected? → Require auth                   │          │
│         │  Needs email verify? → Redirect /verify-email│          │
│         │  Needs 2FA? → Redirect /verify-2fa           │          │
│         │  Role = guest? → Redirect /role-selection    │          │
│         └──────────────────────────────────────────────┘          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │              Token Management                          │      │
│  │                                                        │      │
│  │  Server-Side:                                          │      │
│  │  ├── NextAuth JWT callbacks (encode tokens in session) │      │
│  │  ├── serverTokenService (HTTP-only cookies)            │      │
│  │  └── apiServer (auto-attaches session token)           │      │
│  │                                                        │      │
│  │  Client-Side:                                          │      │
│  │  ├── apiClient.getAccessToken() → /api/auth/token      │      │
│  │  ├── Token cached for 10s (dedup bursts)               │      │
│  │  └── Auto-attaches Bearer header                       │      │
│  └────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Route Classification System

Routes are classified in `configs/auth-routes.ts`:

| Route              | Type   | Behavior                                       |
|--------------------|--------|------------------------------------------------|
| `/sign-in`         | `guest`| Only accessible when NOT logged in             |
| `/register`        | `guest`| Only accessible when NOT logged in             |
| `/forgot-password` | `guest`| Only accessible when NOT logged in             |
| `/verify-email`    | `guest`| Only accessible when NOT logged in             |
| `/new-password`    | `guest`| Only accessible when NOT logged in             |
| `/` (root)         | `guest`| Landing page — only for unauthenticated        |
| `/docs`            | `public`| Accessible to everyone                        |
| `/public`          | `public`| Store, course catalog — accessible to everyone|
| Everything else    | `protected`| Requires authentication                    |

### Route Type Definitions
```typescript
// types.ts
export interface RouteType {
  type: "guest" | "public"
  exceptions?: string[]  // Sub-paths that override the parent type
}
```

> **Rule:** When adding a new route, you MUST register it in `configs/auth-routes.ts` if it should be guest-only or public. Any unregistered route defaults to **protected**.

---

## 3. Middleware Logic (`middleware.ts`)

The middleware runs on every request (except static assets) in this order:

### Step-by-step Flow:
1. **Extract locale** from pathname
2. **Strip locale** to get the clean path
3. **Check if route is public** — if yes, skip auth checks
4. **If route is NOT public:**
   - Get the JWT token via `getToken()`
   - **Email verification check:** If authenticated but `requiresEmailVerification`, redirect to `/verify-email`
   - **2FA check:** If authenticated but `requires2FA`, redirect to `/verify-2fa`
   - **Guest route + authenticated:** Redirect to home (can't access login page when logged in)
   - **Guest role redirect:** If user has role `"guest"`, force redirect to `/role-selection`
   - **Protected route + unauthenticated:** Redirect to `/sign-in` with `?redirectTo=` parameter
5. **Locale check:** If pathname is missing a locale prefix, redirect to add one

### Matcher Pattern:
```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|docs).*)",
  ],
}
```

> **Rule:** The middleware excludes `api/`, `_next/`, static files, and the `docs` folder. If you add new static asset folders, add them to this regex.

---

## 4. NextAuth Configuration (`configs/next-auth.ts`)

### Key Points:
- **Providers:** Credentials + Google OAuth
- **Session strategy:** JWT (not database sessions)
- **Token payload includes:** `user`, `role`, `accessToken`, `refreshToken`, `requiresEmailVerification`, `requires2FA`
- **Token refresh:** Handled in the `jwt` callback — checks expiry and auto-refreshes

### Auth API Routes (BFF Layer):

| Endpoint                                 | Purpose                                 |
|------------------------------------------|-----------------------------------------|
| `POST /api/auth/sign-in`                 | Proxy login to backend, returns session |
| `POST /api/auth/register`                | Proxy registration to backend           |
| `POST /api/auth/verify-email`            | Verify email with OTP code              |
| `POST /api/auth/verify-2fa`              | Verify 2FA code                         |
| `POST /api/auth/resend-verification`     | Resend OTP                              |
| `POST /api/auth/complete-registration`   | Complete OAuth registration             |
| `GET  /api/auth/token`                   | Return current access token to client   |
| `GET/POST /api/auth/[...nextauth]`       | NextAuth handler                        |

---

## 5. Token Service (`lib/token-service.ts`)

Server-side token management using HTTP-only cookies:

| Cookie               | Purpose              | HttpOnly | MaxAge  |
|----------------------|----------------------|----------|---------|
| `lms_access_token`   | JWT access token     | ✅ Yes   | 150 min |
| `lms_refresh_token`  | JWT refresh token    | ✅ Yes   | 7 days  |
| `lms_user_data`      | User info for client | ❌ No    | 7 days  |

### Key Methods:
- `setTokens(access, refresh, userData?)` — Store tokens in cookies
- `getAccessToken()` / `getRefreshToken()` — Read from cookies
- `clearTokens()` — Delete all auth cookies
- `hasValidTokens()` — Check if both tokens exist
- `refreshAccessToken()` — Call backend `/auth/refresh` and update cookies

### Utility Functions:
- `parseJwtPayload(token)` — Decode JWT without verification
- `isTokenExpired(token)` — Check if JWT is expired
- `getTokenExpiresIn(token)` — Get seconds until expiry

---

## 6. API Client Layer

### Client-Side: `apiClient` (lib/api-client.ts)
- Singleton instance of `ApiClient` class
- Used in **client components** (browser)
- Gets access token from `/api/auth/token`
- Caches token for 10 seconds to deduplicate burst requests
- Auto-attaches `Authorization: Bearer` header
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `upload()`
- Throws `ApiClientError` with status-specific helpers (`.isUnauthorized()`, `.isNotFound()`, etc.)

### Server-Side: `apiServer` (lib/api-server.ts)
- Singleton instance of `ApiServerClient` class
- Used in **Server Components** and **API routes**
- Gets access token from NextAuth `getServerSession()`
- Same HTTP method interface as `apiClient`

> **Rule:** NEVER use `apiClient` in Server Components. NEVER use `apiServer` in Client Components. They are designed for their specific rendering contexts.

### API Response Types:
```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

interface ApiError {
  success: false
  error: string
  statusCode: number
}

interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  total: number
  page: number
  totalPages: number
}
```

---

## 7. Auth Components (`components/auth/`)

| Component              | File                         | Purpose                        |
|------------------------|------------------------------|--------------------------------|
| `AuthLayout`           | `auth-layout.tsx`            | Shared layout for all auth pages|
| `SignInForm`           | `sign-in-form.tsx`           | Email/password login form      |
| `RegisterForm`         | `register-form.tsx`          | Full registration form         |
| `ForgotPasswordForm`   | `forgot-password-form.tsx`   | Email input for password reset |
| `NewPasswordForm`      | `new-password-form.tsx`      | New password + OTP input       |
| `VerifyEmailForm`      | `verify-email-form.tsx`      | OTP verification form          |
| `Verify2FAForm`        | `verify-2fa-form.tsx`        | 2FA OTP verification           |
| `RoleSelectionForm`    | `role-selection-form.tsx`    | Post-OAuth role picker         |
| `OAuthLinks`           | `oauth-links.tsx`            | Google login button            |
| `PasswordRequirements` | `password-requirements.tsx`  | Live password validation UI    |

### Auth Validation Schemas (`schemas/`):
```
schemas/
├── sign-in-schema.ts          # email + password
├── register-schema.ts         # name + email + password + confirm
├── forgot-passward-schema.ts  # email only
├── new-passward-schema.ts     # password + confirm + OTP
├── verify-email-schema.ts     # code (OTP)
└── coming-soon-schema.ts      # email (for waitlist)
```

> **Rule:** All form validation uses **Zod schemas** with `@hookform/resolvers`. Never add inline validation logic in components — always define schemas in `schemas/`.
