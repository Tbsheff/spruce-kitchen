"use client";

export type PurchaseType = "one-time" | "subscription";
export type Frequency = "weekly" | "bi-weekly" | "monthly";

export function isPurchaseType(value: unknown): value is PurchaseType {
  return value === "one-time" || value === "subscription";
}

export function isFrequency(value: unknown): value is Frequency {
  return value === "weekly" || value === "bi-weekly" || value === "monthly";
}
