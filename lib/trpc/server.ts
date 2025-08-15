import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts

  // Get the session from better-auth
  let session = null
  try {
    if (process.env.DATABASE_URL) {
      session = await auth.api.getSession({
        headers: req.headers as any,
      })
    }
  } catch (error) {
    // Session retrieval failed, user is not authenticated
    console.log("Session retrieval failed:", error)
  }

  return {
    db,
    session,
    req,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})
