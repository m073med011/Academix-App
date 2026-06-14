import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { RegisterForm } from "./register-form"

export function Register({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth
      imgSrc="/images/Screens/auth/login.jpg"
      dictionary={dictionary}
    >
      <AuthHeader>
        <AuthTitle>{dictionary.auth.register.title}</AuthTitle>
        <AuthDescription>
          {dictionary.auth.register.description}
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <RegisterForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
