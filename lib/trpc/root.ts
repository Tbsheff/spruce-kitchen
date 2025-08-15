import { createTRPCRouter } from "@/lib/trpc/server"
import { userRouter } from "./routers/user"
import { mealPlanRouter } from "./routers/mealPlan"
import { adminRouter } from "./routers/admin"

export const appRouter = createTRPCRouter({
  user: userRouter,
  mealPlan: mealPlanRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
