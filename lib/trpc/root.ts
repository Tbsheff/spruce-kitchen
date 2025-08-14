import { createTRPCRouter } from "@/lib/trpc/server"
import { userRouter } from "./routers/user"
import { mealPlanRouter } from "./routers/mealPlan"

export const appRouter = createTRPCRouter({
  user: userRouter,
  mealPlan: mealPlanRouter,
})

export type AppRouter = typeof appRouter
