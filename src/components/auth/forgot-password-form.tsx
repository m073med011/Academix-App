"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { ForgotPasswordFormType, LocaleType } from "@/types"

import { ForgotPasswordSchema } from "@/schemas/forgot-passward-schema"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/components/ui/sonner"
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

export function ForgotPasswordForm({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()
  const searchParams = useSearchParams()

  const form = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")
  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  async function onSubmit(_data: ForgotPasswordFormType) {
    try {
      toast.success(dictionary.auth.forgotPassword.checkEmail, {
        description: dictionary.auth.forgotPassword.emailSent,
      })
    } catch (error) {
      toast.error(dictionary.auth.forgotPassword.somethingWrong, {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.auth.forgotPassword.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={
                      dictionary.auth.forgotPassword.emailPlaceholder
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          {dictionary.auth.forgotPassword.button}
        </ButtonLoading>
        <Link
          href={ensureLocalizedPathname(
            // Include redirect pathname if available, otherwise default to "/auth"
            redirectPathname
              ? ensureRedirectPathname("/auth", redirectPathname)
              : "/auth",
            locale
          )}
          className="-mt-4 text-center text-sm underline"
        >
          {dictionary.auth.forgotPassword.backToSignIn}
        </Link>
      </form>
    </Form>
  )
}
