import type { BillingType, PlanType } from "@/lib/types/enums.ts";

export const BOX_SUBTOTAL_CENTS: Record<"small" | "medium", number> = {
  small: 7999,
  medium: 14_999,
};

export const SUBSCRIPTION_DISCOUNT = 0.1;

export interface OrderTotal {
  discount: number;
  subtotal: number;
  total: number;
}

export function calculateOrderTotal(
  boxSize: "small" | "medium",
  billingType: BillingType
): OrderTotal {
  const subtotal = BOX_SUBTOTAL_CENTS[boxSize];
  const discount =
    billingType === "subscription"
      ? Math.round(subtotal * SUBSCRIPTION_DISCOUNT)
      : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function isBoxSize(
  value: PlanType | string
): value is "small" | "medium" {
  return value === "small" || value === "medium";
}
