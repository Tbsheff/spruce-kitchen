import { trpc } from "./client.ts";

/**
 * Utility hook that exposes tRPC query invalidation helpers. Thin wrapper so
 * callers don't have to import `trpc` directly.
 */
export function useTRPCUtils(): ReturnType<typeof trpc.useUtils> {
  return trpc.useUtils();
}

// Query hooks — pure reads, no invalidation concerns. Direct aliases keep the
// react-query option surface intact for callers that need `{ enabled, select, ... }`.
export const useUser = trpc.user.getProfile.useQuery;
export const useUserOrderHistory = trpc.user.getOrderHistory.useQuery;
export const useAvailableMeals = trpc.mealPlan.getAvailableMeals.useQuery;
export const useUserMealPlans = trpc.mealPlan.getUserPlans.useQuery;
export const useMealPlan = trpc.mealPlan.getById.useQuery;

// Mutation hooks — wrapped so related queries get invalidated on success.
// The server response is the source of truth; callers that need the fresh
// data simply re-query and get the latest without manual `utils.*.invalidate()`.

type UpdateUserOptions = Parameters<
  typeof trpc.user.updateProfile.useMutation
>[0];
type UpdatePrefsOptions = Parameters<
  typeof trpc.user.updatePreferences.useMutation
>[0];
type UpdateAddressOptions = Parameters<
  typeof trpc.user.updateDeliveryAddress.useMutation
>[0];
type CreateMealPlanOptions = Parameters<
  typeof trpc.mealPlan.create.useMutation
>[0];
type UpdateMealPlanOptions = Parameters<
  typeof trpc.mealPlan.update.useMutation
>[0];
type CancelMealPlanOptions = Parameters<
  typeof trpc.mealPlan.cancel.useMutation
>[0];
type CreateOrderOptions = Parameters<
  typeof trpc.mealPlan.createOrder.useMutation
>[0];

export function useUpdateUser(options?: UpdateUserOptions) {
  const utils = useTRPCUtils();
  return trpc.user.updateProfile.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await utils.user.getProfile.invalidate();
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateUserPreferences(options?: UpdatePrefsOptions) {
  const utils = useTRPCUtils();
  return trpc.user.updatePreferences.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await utils.user.getProfile.invalidate();
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateDeliveryAddress(options?: UpdateAddressOptions) {
  const utils = useTRPCUtils();
  return trpc.user.updateDeliveryAddress.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await utils.user.getProfile.invalidate();
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useCreateMealPlan(options?: CreateMealPlanOptions) {
  const utils = useTRPCUtils();
  return trpc.mealPlan.create.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await utils.mealPlan.getUserPlans.invalidate();
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateMealPlan(options?: UpdateMealPlanOptions) {
  const utils = useTRPCUtils();
  return trpc.mealPlan.update.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        utils.mealPlan.getUserPlans.invalidate(),
        utils.mealPlan.getById.invalidate({ id: variables.id }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useCancelMealPlan(options?: CancelMealPlanOptions) {
  const utils = useTRPCUtils();
  return trpc.mealPlan.cancel.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        utils.mealPlan.getUserPlans.invalidate(),
        utils.mealPlan.getById.invalidate({ id: variables.id }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useCreateOrder(options?: CreateOrderOptions) {
  const utils = useTRPCUtils();
  return trpc.mealPlan.createOrder.useMutation({
    ...options,
    onSuccess: async (data, variables, context) => {
      await utils.user.getOrderHistory.invalidate();
      await options?.onSuccess?.(data, variables, context);
    },
  });
}
