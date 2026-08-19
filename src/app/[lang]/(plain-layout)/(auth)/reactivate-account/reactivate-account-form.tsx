"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { ShieldCheck, MailOpen } from "lucide-react"
import { z } from "zod"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import {
  ReactivateAccountSchema,
  ConfirmReactivateAccountSchema,
} from "@/schemas/reactivate-account-schema"

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
import { PasswordInput } from "@/components/ui/password-input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type ReactivateAccountFormValues = z.input<typeof ReactivateAccountSchema>
type ReactivateAccountFormType = z.output<typeof ReactivateAccountSchema>
type ConfirmReactivateAccountFormType = z.infer<
  typeof ConfirmReactivateAccountSchema
>

export function ReactivateAccountForm({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const locale = params.lang as LocaleType
  const prefillEmail = searchParams.get("email") || ""
  const isOAuthUser = searchParams.get("isOAuthUser") === "true"

  const [requiresOtp, setRequiresOtp] = useState(false)
  const [userEmail, setUserEmail] = useState(prefillEmail)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const requestForm = useForm<
    ReactivateAccountFormValues,
    undefined,
    ReactivateAccountFormType
  >({
    resolver: zodResolver(ReactivateAccountSchema),
    defaultValues: {
      email: prefillEmail,
      password: "",
      isOAuthUser,
    },
  })

  const confirmForm = useForm<ConfirmReactivateAccountFormType>({
    resolver: zodResolver(ConfirmReactivateAccountSchema),
    defaultValues: {
      email: prefillEmail,
      otp: "",
    },
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!requiresOtp) return

    const timer = setTimeout(() => {
      confirmForm.setFocus("otp")
    }, 0)

    return () => clearTimeout(timer)
  }, [confirmForm, requiresOtp])

  async function onRequestSubmit(data: ReactivateAccountFormType) {
    try {
      const response = await fetch("/api/auth/reactivate-account/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.isOAuthUser ? undefined : data.password,
          isOAuthUser: data.isOAuthUser,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to request account reactivation")
      }

      setUserEmail(data.email)
      setCountdown(0)
      setIsResending(false)
      confirmForm.reset({
        email: data.email,
        otp: "",
      })
      setRequiresOtp(true)

      toast.success("OTP Sent", {
        description: "Please check your email for the verification code.",
      })
    } catch (error) {
      toast.error(dictionary.auth.reactivateAccount.failedTitle, {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  async function onConfirmSubmit(data: ConfirmReactivateAccountFormType) {
    try {
      const response = await fetch("/api/auth/reactivate-account/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to reactivate account")
      }

      toast.success(dictionary.auth.reactivateAccount.successTitle, {
        description: dictionary.auth.reactivateAccount.successDescription,
      })

      // Sign in with the returned tokens
      const signInResult = await signIn("credentials", {
        redirect: false,
        token: result.token,
        refreshToken: result.refreshToken,
      })

      if (signInResult?.error) {
        router.push(ensureLocalizedPathname("/auth", locale))
        return
      }

      const redirectPath = process.env.NEXT_PUBLIC_HOME_PATHNAME || "/"
      router.push(ensureLocalizedPathname(redirectPath, locale))
    } catch (error) {
      toast.error(dictionary.auth.reactivateAccount.failedTitle, {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  async function handleResendCode() {
    if (countdown > 0 || !userEmail) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          purpose: "ACCOUNT_REACTIVATION",
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            dictionary.auth.reactivateAccount.resendError
        )
      }

      confirmForm.reset({
        email: userEmail,
        otp: "",
      })
      setCountdown(60)
      setTimeout(() => confirmForm.setFocus("otp"), 0)

      toast.success(dictionary.auth.reactivateAccount.codeResent, {
        description: dictionary.auth.reactivateAccount.codeResentMessage,
      })
    } catch (error) {
      toast.error(dictionary.auth.reactivateAccount.resendFailed, {
        description:
          error instanceof Error
            ? error.message
            : dictionary.auth.reactivateAccount.resendError,
      })
    } finally {
      setIsResending(false)
    }
  }

  if (requiresOtp) {
    return (
      <Form {...confirmForm}>
        <form
          onSubmit={confirmForm.handleSubmit(onConfirmSubmit)}
          className="grid gap-6"
        >
          {/* OTP Info banner */}
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <MailOpen className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-primary">
              We have sent a verification code to <strong>{userEmail}</strong>.
              Please enter it below.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={confirmForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className="flex justify-center"
                      onClick={() => confirmForm.setFocus("otp")}
                    >
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
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          </div>

          <ButtonLoading
            isLoading={confirmForm.formState.isSubmitting}
            disabled={confirmForm.formState.isSubmitting}
          >
            {confirmForm.formState.isSubmitting
              ? dictionary.auth.reactivateAccount.reactivating
              : dictionary.auth.reactivateAccount.button}
          </ButtonLoading>

          <div className="text-center text-sm">
            {dictionary.auth.reactivateAccount.didntReceive}{" "}
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={countdown > 0 || isResending}
              className="h-auto p-0 font-normal underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {countdown > 0
                ? dictionary.auth.reactivateAccount.resendIn.replace(
                    "{seconds}",
                    countdown.toString()
                  )
                : isResending
                  ? dictionary.auth.reactivateAccount.sending
                  : dictionary.auth.reactivateAccount.resend}
            </Button>
          </div>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setRequiresOtp(false)}
              className="underline"
            >
              {dictionary.auth.reactivateAccount.changeEmail}
            </button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <Form {...requestForm}>
      <form
        onSubmit={requestForm.handleSubmit(onRequestSubmit)}
        className="grid gap-6"
      >
        {/* Info banner */}
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <ShieldCheck className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            {dictionary.auth.reactivateAccount.description}
          </p>
        </div>

        <div className="grid grow gap-2">
          <FormField
            control={requestForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dictionary.auth.reactivateAccount.email}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={
                      dictionary.auth.reactivateAccount.emailPlaceholder
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password — hidden for OAuth users */}
          {!isOAuthUser && (
            <FormField
              control={requestForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.auth.reactivateAccount.password}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <ButtonLoading
          isLoading={requestForm.formState.isSubmitting}
          disabled={requestForm.formState.isSubmitting}
        >
          {requestForm.formState.isSubmitting
            ? "Sending Code..."
            : "Send Verification Code"}
        </ButtonLoading>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={async () => {
              await signOut({ redirect: false })
              router.push(ensureLocalizedPathname("/auth", locale))
            }}
            className="underline"
          >
            {dictionary.auth.reactivateAccount.backToSignIn}
          </button>
        </div>
      </form>
    </Form>
  )
}
