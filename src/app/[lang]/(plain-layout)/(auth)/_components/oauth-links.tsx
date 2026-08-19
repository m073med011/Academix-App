"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { oauthLinksData } from "@/data/oauth-links"
import { ensureLocalizedPathname } from "@/lib/i18n"

import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"

export function OAuthLinks({ dictionary }: { dictionary: DictionaryType }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")

  const handleSignIn = async (provider: string) => {
    if (provider.toLowerCase() === "google") {
      setIsGoogleLoading(true)
      toast.info(
        dictionary.auth.oauth.redirecting.replace("{provider}", "Google"),
        {
          description: dictionary.auth.oauth.redirectingMessage.replace(
            "{provider}",
            "Google"
          ),
        }
      )
    }

    try {
      const callbackUrl = ensureLocalizedPathname(
        redirectPathname
          ? `/role-selection?redirectTo=${encodeURIComponent(redirectPathname)}`
          : "/role-selection",
        locale
      )

      await signIn(provider.toLowerCase(), {
        callbackUrl,
      })
    } catch (_error) {
      setIsGoogleLoading(false)
      toast.error(dictionary.auth.oauth.failed, {
        description: dictionary.auth.oauth.failedMessage.replace(
          "{provider}",
          "Google"
        ),
      })
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {oauthLinksData.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isGoogleLoading}
          onClick={() => handleSignIn(link.label)}
          aria-label={link.label}
        >
          {isGoogleLoading && link.label === "Google" ? (
            <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <link.icon className="mr-2 size-4" />
          )}
          {link.label}
        </Button>
      ))}
    </div>
  )
}
