import { useTranslations } from "next-intl"

import LogIn from "./LogIn"
import SignUpForm from "./SignUp"

export default function CombinedForms() {
  return (
    <div>
      <SignUpForm />
      <LogIn />
    </div>
  )
}
