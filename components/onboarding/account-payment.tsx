"use client"

import { AuthCard } from "./auth-card"
import { PaymentCard } from "./payment-card"
import { OrderSummary } from "./order-summary"

type AuthMode = "login" | "signup"
type AuthStep = "auth" | "payment"
type Size = "small" | "medium"

interface AccountPaymentProps {
  authStep: AuthStep
  authMode: AuthMode
  email: string
  password: string
  firstName: string
  lastName: string
  paymentMethod?: string
  size?: Size
  onAuthModeChange: (mode: AuthMode) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onFirstNameChange: (firstName: string) => void
  onLastNameChange: (lastName: string) => void
  onPaymentMethodChange: (method: string) => void
  onAuthSubmit: () => void
}

export function AccountPayment({
  authStep,
  authMode,
  email,
  password,
  firstName,
  lastName,
  paymentMethod,
  size,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onPaymentMethodChange,
  onAuthSubmit,
}: AccountPaymentProps) {
  return (
    <section aria-label="Account and payment" className="max-w-2xl mx-auto space-y-6">
      <AuthCard
        authMode={authMode}
        email={email}
        password={password}
        firstName={firstName}
        lastName={lastName}
        isComplete={authStep === "payment"}
        onAuthModeChange={onAuthModeChange}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onFirstNameChange={onFirstNameChange}
        onLastNameChange={onLastNameChange}
        onSubmit={onAuthSubmit}
      />

      {authStep === "payment" && (
        <>
          <PaymentCard paymentMethod={paymentMethod} onPaymentMethodChange={onPaymentMethodChange} />
          <OrderSummary size={size} />
        </>
      )}
    </section>
  )
}
