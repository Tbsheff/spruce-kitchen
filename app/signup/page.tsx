import type { Metadata } from "next"
import SignUpClientPage from "./SignUpClientPage"

export const metadata: Metadata = {
  title: "Sign Up - Spruce Kitchen Meals",
  description: "Create your account to start enjoying chef-crafted frozen meals delivered to your door.",
}

export default function SignUpPage() {
  return <SignUpClientPage />
}
