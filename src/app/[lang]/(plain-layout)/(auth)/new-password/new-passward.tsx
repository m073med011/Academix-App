import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { NewPasswordForm } from "./new-password-form"

export function NewPassword({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth dictionary={dictionary}>
      <AuthHeader>
        <AuthTitle>{dictionary.auth.newPassword.title}</AuthTitle>
        <AuthDescription>
          {dictionary.auth.newPassword.description}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <NewPasswordForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
