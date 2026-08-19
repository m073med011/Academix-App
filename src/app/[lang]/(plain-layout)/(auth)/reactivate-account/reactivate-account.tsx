import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { ReactivateAccountForm } from "./reactivate-account-form"

export function ReactivateAccount({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  return (
    <Auth dictionary={dictionary}>
      <AuthHeader>
        <AuthTitle>
          {dictionary.auth.reactivateAccount.title}
        </AuthTitle>
        <AuthDescription>
          {dictionary.auth.reactivateAccount.description}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <ReactivateAccountForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
