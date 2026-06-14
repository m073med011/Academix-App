import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { useSettings } from "@/hooks/use-settings"

export function useAuthCheck() {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { settings } = useSettings()

  const redirectToSignIn = () => {
    const locale = settings.locale || "en"
    router.push(
      ensureLocalizedPathname(
        `/sign-in?redirectTo=${encodeURIComponent(pathname)}`,
        locale
      )
    )
  }

  const requireAuth = (): boolean => {
    if (status !== "authenticated") {
      redirectToSignIn()
      return false
    }
    return true
  }

  return {
    requireAuth,
    redirectToSignIn,
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
    isLoading: status === "loading",
    status,
  }
}
