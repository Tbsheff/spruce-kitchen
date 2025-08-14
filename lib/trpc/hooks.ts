import { trpc } from "./client"

// Re-export commonly used hooks for convenience
export const useUser = trpc.user.getProfile.useQuery
export const useUpdateUser = trpc.user.updateProfile.useMutation
export const useUpdateUserPreferences = trpc.user.updatePreferences.useMutation
export const useUpdateDeliveryAddress = trpc.user.updateDeliveryAddress.useMutation
export const useUserOrderHistory = trpc.user.getOrderHistory.useQuery

export const useAvailableMeals = trpc.mealPlan.getAvailableMeals.useQuery
export const useCreateMealPlan = trpc.mealPlan.create.useMutation
export const useUserMealPlans = trpc.mealPlan.getUserPlans.useQuery
export const useMealPlan = trpc.mealPlan.getById.useQuery
export const useUpdateMealPlan = trpc.mealPlan.update.useMutation
export const useCancelMealPlan = trpc.mealPlan.cancel.useMutation
export const useCreateOrder = trpc.mealPlan.createOrder.useMutation

// Utility hook for invalidating queries
export function useTRPCUtils() {
  return trpc.useUtils()
}
