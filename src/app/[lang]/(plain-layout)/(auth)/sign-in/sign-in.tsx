import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "../_components/auth-layout"
import { SignInForm } from "./sign-in-form"

export function SignIn({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth
      imgSrc="/images/Screens/auth/login.jpg"
      dictionary={dictionary}
    >
      <AuthHeader>
        <AuthTitle>{dictionary.auth.signIn.title}</AuthTitle>
        <AuthDescription>{dictionary.auth.signIn.description}</AuthDescription>
      </AuthHeader>
      <AuthForm>
        <SignInForm dictionary={dictionary} />
      </AuthForm>
    </Auth>
  )
}
