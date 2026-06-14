"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { getSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { toast } from "@/components/ui/sonner"
import { Button, ButtonLoading } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const Verify2FASchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .trim(),
  code: z
    .string()
    .length(6, { message: "Code must be 6 digits" })
    .regex(/^\d{6}$/, { message: "Code must be numeric" }),
})

type Verify2FAFormType = z.infer<typeof Verify2FASchema>

export function Verify2FAForm({ dictionary }: { dictionary: DictionaryType }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const emailParam = searchParams.get("email") || ""
  const locale = params.lang as LocaleType
  const requestedRedirect = searchParams.get("redirectTo")
  const homePathname = process.env.NEXT_PUBLIC_HOME_PATHNAME || "/"

  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const form = useForm<Verify2FAFormType>({
    resolver: zodResolver(Verify2FASchema),
    defaultValues: {
      email: emailParam,
      code: "",
    },
  })

  const { isSubmitting } = form.formState
  const isDisabled = isSubmitting

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  async function onSubmit(data: Verify2FAFormType) {
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Verification failed")
      }

      // Store tokens
      if (result.accessToken && result.refreshToken) {
        // Tokens are handled by NextAuth session update below

        // Establish NextAuth session
        // We use the tokens to sign in via the custom Credentials flow we added
        const signInResult = await import("next-auth/react").then((mod) =>
          mod.signIn("credentials", {
            token: result.accessToken,
            refreshToken: result.refreshToken,
            redirect: false,
          })
        )

        if (signInResult?.error) {
          throw new Error("Failed to establish session")
        }
      }

      const session = await getSession()
      const isAnonymous =
        result.user?.role === "anonymous" || session?.user?.role === "anonymous"

      let finalRedirect: string
      if (isAnonymous) {
        const roleSelectionPath = requestedRedirect
          ? `/role-selection?redirectTo=${encodeURIComponent(requestedRedirect)}`
          : "/role-selection"
        finalRedirect = ensureLocalizedPathname(roleSelectionPath, locale)
      } else {
        finalRedirect = ensureLocalizedPathname(
          requestedRedirect || homePathname,
          locale
        )
      }

      toast.success(dictionary.auth.verify2FA.verificationSuccessful, {
        description:
          result.message || dictionary.auth.verify2FA.verificationSuccess,
      })

      // Use hard navigation so middleware sees the fresh JWT
      window.location.href = finalRedirect
    } catch (error) {
      toast.error(dictionary.auth.verify2FA.verificationFailed, {
        description:
          error instanceof Error
            ? error.message
            : dictionary.auth.verify2FA.invalidCode,
      })
    }
  }

  async function handleResendCode() {
    if (countdown > 0 || !emailParam) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailParam,
          purpose: "LOGIN_VERIFICATION",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend code")
      }

      toast.success(dictionary.auth.verify2FA.codeResent, {
        description: dictionary.auth.verify2FA.codeResentMessage,
      })

      // Start 60 second countdown
      setCountdown(60)
      form.setValue("code", "")
    } catch (error) {
      toast.error(dictionary.auth.verify2FA.resendFailed, {
        description:
          error instanceof Error
            ? error.message
            : dictionary.auth.verify2FA.resendError,
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.auth.verify2FA.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={dictionary.auth.verify2FA.emailPlaceholder}
                    {...field}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dictionary.auth.verify2FA.verificationCode}
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
                <p className="text-muted-foreground text-xs">
                  {dictionary.auth.verify2FA.codeDescription}
                </p>
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          {dictionary.auth.verify2FA.button}
        </ButtonLoading>

        <div className="text-center text-sm">
          {dictionary.auth.verify2FA.didntReceive}{" "}
          <Button
            type="button"
            variant="link"
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className="underline disabled:opacity-50 disabled:cursor-not-allowed p-0 h-auto font-normal"
          >
            {countdown > 0
              ? dictionary.auth.verify2FA.resendIn.replace(
                  "{seconds}",
                  countdown.toString()
                )
              : isResending
                ? dictionary.auth.verify2FA.sending
                : dictionary.auth.verify2FA.resend}
          </Button>
        </div>
      </form>
    </Form>
  )
}
