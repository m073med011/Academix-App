import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { VerifyEmailForm } from "../_components/verify-email-form"

export function VerifyEmail({
  dictionary,
  email,
}: {
  dictionary: DictionaryType
  email?: string
}) {
  return (
    <Auth dictionary={dictionary}>
      <AuthHeader>
        <AuthTitle>{dictionary.auth.verifyEmail.title}</AuthTitle>
        <AuthDescription>
          {dictionary.auth.verifyEmail.codeDescription}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <VerifyEmailForm dictionary={dictionary} email={email} />
      </AuthForm>
    </Auth>
  )
}
