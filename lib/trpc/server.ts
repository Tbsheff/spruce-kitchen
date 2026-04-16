import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db/index.ts";
import type {
  CurrentUserState,
  IdentityPorts,
  RequestMetadata,
} from "@/lib/identity/index.ts";
import {
  createServerIdentityPorts,
  headersRequestMetadata,
  resolveCurrentUser,
} from "@/lib/identity/index.ts";

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;
  const ports: IdentityPorts = createServerIdentityPorts(req);
  const metadata: RequestMetadata = headersRequestMetadata(req);
  const currentUser: CurrentUserState = await resolveCurrentUser(ports);

  return {
    db,
    req,
    ports,
    metadata,
    currentUser,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Minimal protected base. Most routers import the richer procedures from
// lib/trpc/procedures.ts; this one is kept for compatibility with any callers
// that prefer the lighter surface.
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.currentUser.status !== "authenticated") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      me: ctx.currentUser.user,
      user: ctx.currentUser.user,
    },
  });
});
