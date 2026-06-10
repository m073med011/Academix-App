"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType, NewPasswordFormType } from "@/types"

import { NewPasswordSchema } from "@/schemas/new-passward-schema"

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

export function NewPasswordForm({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()
  const searchParams = useSearchParams()

  const form = useForm<NewPasswordFormType>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")
  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  async function onSubmit(_data: NewPasswordFormType) {
    try {
      toast.success(dictionary.auth.newPassword.passwordUpdated, {
        description: dictionary.auth.newPassword.passwordUpdateSuccess,
      })
    } catch (error) {
      toast.error(dictionary.auth.newPassword.somethingWrong, {
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.auth.newPassword.password}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dictionary.auth.newPassword.confirmPassword}
                </FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          {dictionary.auth.newPassword.button}
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
          {dictionary.auth.newPassword.backToSignIn}
        </Link>
      </form>
    </Form>
  )
}
