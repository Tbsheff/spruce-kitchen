"use client";

import { AuthCard } from "./auth-card.tsx";
import { OrderSummary } from "./order-summary.tsx";
import { PaymentCard } from "./payment-card.tsx";

type AuthMode = "login" | "signup";
type AuthStep = "auth" | "payment";
type Size = "small" | "medium";

interface AccountPaymentProps {
  authMode: AuthMode;
  authStep: AuthStep;
  email: string;
  firstName: string;
  lastName: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onAuthSubmit: () => void;
  onEmailChange: (email: string) => void;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onPasswordChange: (password: string) => void;
  onPaymentMethodChange: (method: string) => void;
  password: string;
  paymentMethod?: string;
  size?: Size;
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
    <section
      aria-label="Account and payment"
      className="mx-auto max-w-2xl space-y-6"
    >
      <AuthCard
        authMode={authMode}
        email={email}
        firstName={firstName}
        isComplete={authStep === "payment"}
        lastName={lastName}
        onAuthModeChange={onAuthModeChange}
        onEmailChange={onEmailChange}
        onFirstNameChange={onFirstNameChange}
        onLastNameChange={onLastNameChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onAuthSubmit}
        password={password}
      />

      {authStep === "payment" && (
        <>
          <PaymentCard
            onPaymentMethodChange={onPaymentMethodChange}
            {...(paymentMethod !== undefined && { paymentMethod })}
          />
          <OrderSummary {...(size !== undefined && { size })} />
        </>
      )}
    </section>
  );
}
