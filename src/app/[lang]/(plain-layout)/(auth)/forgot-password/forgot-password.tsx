import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { ForgotPasswordForm } from "./forgot-password-form"

export function ForgotPassword({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth dictionary={dictionary}>
      <AuthHeader>
        <AuthTitle>{dictionary.auth.forgotPassword.title}</AuthTitle>
        <AuthDescription>
          {dictionary.auth.forgotPassword.description}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <ForgotPasswordForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
