"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType, SignInFormType } from "@/types"

import { SignInSchema } from "@/schemas/sign-in-schema"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/hooks/use-toast"
import { ButtonLoading } from "@/components/ui/button"
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
import { SeparatorWithText } from "@/components/ui/separator"
import { OAuthLinks } from "./oauth-links"



export function SignInForm({ dictionary, onSwitchToRegister }: { dictionary: DictionaryType; onSwitchToRegister?: () => void }) {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const redirectPathname =
    searchParams.get("redirectTo") ||
    process.env.NEXT_PUBLIC_HOME_PATHNAME ||
    "/"

  const form = useForm<SignInFormType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const locale = params.lang as LocaleType
  const { isSubmitting } = form.formState
  const isDisabled = isSubmitting

  async function onSubmit(data: SignInFormType) {
    const { email, password } = data

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result && result.error) {
        // Check for email verification required error
        if (result.error.startsWith("EMAIL_VERIFICATION_REQUIRED:")) {
          const userEmail = result.error.split(":")[1]
          toast({
            title: dictionary.auth.signIn.emailVerificationRequired,
            description: dictionary.auth.signIn.verifyEmailMessage,
          })
          router.push(
            ensureLocalizedPathname(
              `/verify-email?email=${encodeURIComponent(userEmail)}${
                redirectPathname
                  ? `&redirectTo=${encodeURIComponent(redirectPathname)}`
                  : ""
              }`,
              locale
            )
          )
          return
        }

        // Check for 2FA required error
        if (result.error.startsWith("2FA_REQUIRED:")) {
          const userEmail = result.error.split(":")[1]
          toast({
            title: dictionary.auth.signIn.twoFactorRequired,
            description: dictionary.auth.signIn.twoFactorMessage,
          })
          router.push(
            ensureLocalizedPathname(
              `/verify-2fa?email=${encodeURIComponent(userEmail)}${
                redirectPathname
                  ? `&redirectTo=${encodeURIComponent(redirectPathname)}`
                  : ""
              }`,
              locale
            )
          )
          return
        }

        // Check for account disabled error, redirect to reactivate page
        if (result.error.startsWith("ACCOUNT_DISABLED:")) {
          toast({
            variant: "destructive",
            title: dictionary.auth.signIn.accountDisabled,
            description: dictionary.auth.signIn.accountDisabledMessage,
          })
          router.push(
            ensureLocalizedPathname(
              `/reactivate-account?email=${encodeURIComponent(data.email)}`,
              locale
            )
          )
          return
        }

        // Regular error
        throw new Error(result.error)
      }

      router.push(ensureLocalizedPathname(redirectPathname, locale))
    } catch (error) {
      toast({
        variant: "destructive",
        title: dictionary.auth.signIn.signInFailed,
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid grow gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.auth.signIn.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={dictionary.auth.signIn.emailPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>{dictionary.auth.signIn.password}</FormLabel>
                  <Link
                    href={ensureLocalizedPathname(
                      redirectPathname
                        ? ensureRedirectPathname(
                            "/forgot-password",
                            redirectPathname
                          )
                        : "/forgot-password",
                      locale
                    )}
                    className="ms-auto inline-block text-sm underline"
                  >
                    {dictionary.auth.signIn.forgotPassword}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          {dictionary.auth.signIn.button}
        </ButtonLoading>
        <div className="-mt-4 text-center text-sm">
          {dictionary.auth.signIn.noAccount}{" "}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="underline"
            >
              {dictionary.auth.signIn.signUp}
            </button>
          ) : (
            <Link
              href={ensureLocalizedPathname("/auth?mode=register", locale)}
              className="underline"
            >
              {dictionary.auth.signIn.signUp}
            </Link>
          )}
        </div>
        <SeparatorWithText>
          {dictionary.auth.signIn.orContinue}
        </SeparatorWithText>
        <OAuthLinks dictionary={dictionary} />
      </form>
    </Form>
  )
}
