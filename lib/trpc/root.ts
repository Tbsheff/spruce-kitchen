import { createTRPCRouter } from "@/lib/trpc/server.ts";
import { adminRouter } from "./routers/admin.ts";
import { mealPlanRouter } from "./routers/mealPlan.ts";
import { userRouter } from "./routers/user.ts";

export const appRouter = createTRPCRouter({
  user: userRouter,
  mealPlan: mealPlanRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
