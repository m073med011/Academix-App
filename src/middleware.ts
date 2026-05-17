import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import type { NextRequest } from "next/server"

import { isGuestRoute, isPublicRoute } from "@/lib/auth-routes"
import {
  ensureLocalizedPathname,
  getLocaleFromPathname,
  getPreferredLocale,
  isPathnameMissingLocale,
} from "@/lib/i18n"
import { ensureRedirectPathname, ensureWithoutPrefix } from "@/lib/utils"

function redirect(pathname: string, request: NextRequest) {
  const { hash, search } = request.nextUrl
  let resolvedPathname = pathname

  if (isPathnameMissingLocale(pathname)) {
    const preferredLocale = getPreferredLocale(request)
    resolvedPathname = ensureLocalizedPathname(pathname, preferredLocale)
  }

  // Safely merge search params
  const [basePath, baseQuery] = resolvedPathname.split("?")
  const searchParams = new URLSearchParams(baseQuery || "")
  
  // Add params from the current request but strip 'redirectTo'
  // so it doesn't snowball across multiple redirects.
  const incomingParams = new URLSearchParams(search)
  incomingParams.forEach((value, key) => {
    if (key !== "redirectTo") {
      searchParams.set(key, value)
    }
  })

  const cleanSearch = searchParams.toString()
  resolvedPathname = basePath + (cleanSearch ? `?${cleanSearch}` : "")

  if (hash) {
    resolvedPathname += hash
  }

  const redirectUrl = new URL(resolvedPathname, request.url).toString()
  return NextResponse.redirect(redirectUrl)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(pathname)
  const locale = getLocaleFromPathname(pathname)
  const pathnameWithoutLocale =
    ensureWithoutPrefix(pathname, `/${locale}`) || "/"
  const isNotPublic = !isPublicRoute(pathnameWithoutLocale)

  // Handle authentication for protected and guest routes
  if (isNotPublic) {
    const token = await getToken({ req: request })
    const isAuthenticated = !!token
    const isGuest = isGuestRoute(pathnameWithoutLocale)
    const isProtected = !isGuest

    // Handle Email Verification Requirement
    if (isAuthenticated && token.requiresEmailVerification) {
      if (pathnameWithoutLocale !== "/verify-email") {
        return redirect("/verify-email", request)
      }
      return NextResponse.next()
    }

    // Handle 2FA Requirement
    if (isAuthenticated && token.requires2FA) {
      if (pathnameWithoutLocale !== "/verify-2fa") {
        return redirect("/verify-2fa", request)
      }
      return NextResponse.next()
    }

    // Handle Disabled Account — redirect to reactivate page
    if (isAuthenticated && (token as any).accountDisabled) {
      if (pathnameWithoutLocale !== "/reactivate-account") {
        const params = new URLSearchParams()
        if (token.email) params.set("email", token.email)
        params.set("isOAuthUser", "true")
        const query = params.toString() ? `?${params.toString()}` : ""
        return redirect(`/reactivate-account${query}`, request)
      }
      return NextResponse.next()
    }

    // Redirect authenticated users away from guest routes
    if (isAuthenticated && isGuest) {
      const homePath = process.env.NEXT_PUBLIC_HOME_PATHNAME || "/"
      return redirect(homePath, request)
    }

    // Handle Anonymous Role Redirection (new OAuth users who haven't selected a role)
    if (isAuthenticated && token.role === "anonymous") {
      // Allow access to role selection page
      if (pathnameWithoutLocale === "/role-selection") {
        return NextResponse.next()
      }
      // Redirect all other requests to role selection
      return redirect("/role-selection", request)
    }

    // Prevent fully registered users from accessing role selection
    if (
      isAuthenticated &&
      token.role !== "anonymous" &&
      pathnameWithoutLocale === "/role-selection"
    ) {
      const homePath = process.env.NEXT_PUBLIC_HOME_PATHNAME || "/"
      return redirect(homePath, request)
    }

    // Redirect unauthenticated users from protected routes to sign-in
    if (!isAuthenticated && isProtected) {
      let redirectPathname = "/auth"

      // Maintain the original path and query for redirection
      if (pathnameWithoutLocale !== "") {
        const fullPath = pathname + (request.nextUrl.search || "")
        
        redirectPathname = ensureRedirectPathname(redirectPathname, fullPath)
      }

      // We use NextResponse.redirect directly here instead of the custom redirect() helper
      // to avoid merging the current nextUrl.search onto the /auth URL, which would
      // result in messy duplicate params like /auth?redirectTo=...&tab=...
      const redirectUrl = new URL(
        isPathnameMissingLocale(redirectPathname)
          ? ensureLocalizedPathname(redirectPathname, getPreferredLocale(request))
          : redirectPathname,
        request.url
      ).toString()
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to localized URL if the pathname is missing a locale
  if (!locale) {
    return redirect(pathname, request)
  }

  /**
   * NOTE
   * If your homepage is not '/', you need to configure a redirect
   * in next.config.mjs using the redirects() function,
   * and set the HOME_PATHNAME environment variable accordingly.
   *
   * See https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirects-in-nextconfigjs
   */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images folder
     * - docs
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|docs).*)",
  ],
}
