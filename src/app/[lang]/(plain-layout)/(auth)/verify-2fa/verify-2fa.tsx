import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { Verify2FAForm } from "./verify-2fa-form"

export function Verify2FA({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth dictionary={dictionary}>
      <AuthHeader>
        <AuthTitle>{dictionary.auth.verify2FA.title}</AuthTitle>
        <AuthDescription>
          {dictionary.auth.verify2FA.codeDescription}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <Verify2FAForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
