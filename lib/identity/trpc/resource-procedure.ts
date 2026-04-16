// Resource-scoped procedure factory. Collapses the repeating
// "auth → load row → check ownership → audit → handle" pattern into a
// single declarative config. Routers drop boilerplate; the factory owns
// NOT_FOUND vs FORBIDDEN discrimination, audit-on-success, and synchronous
// ownership math via ctx.me.can(permission, ownerOf(row)).

import { TRPCError } from "@trpc/server";
import type { z } from "zod";
import type { CurrentUser } from "@/lib/identity/core/domain.ts";
import { protectedProcedure } from "@/lib/trpc/procedures.ts";

export interface ResourceProcedureConfig<TSchema extends z.ZodTypeAny, TRow> {
  /** Optional action verb for audit events. Defaults to "access". */
  readonly action?: string;
  /** Zod schema for input. Parsed before the row loader runs. */
  readonly input: TSchema;
  /**
   * Loads the target row from the database. Called after authentication,
   * before the permission check. Return null to produce a NOT_FOUND error —
   * never a 403 — so the existence of a row is not used as a signal.
   */
  readonly loadRow: (
    input: z.infer<TSchema>,
    me: CurrentUser
  ) => Promise<TRow | null>;
  /**
   * Extracts the owner id from the loaded row. Default assumes `row.userId`.
   * Override when the ownership field has a different name.
   */
  readonly ownerOf?: (row: TRow) => string;
  /** Permission name to check, e.g. "mealplan:write:own". */
  readonly permission: string;
  /** Resource slug for audit/error messages, e.g. "mealplan". */
  readonly resource: string;
}

function defaultOwnerOf<TRow>(row: TRow): string {
  const owner = (row as { userId?: unknown }).userId;
  if (typeof owner !== "string") {
    throw new Error(
      "resourceProcedure: row has no string `userId` field; provide `ownerOf` explicitly."
    );
  }
  return owner;
}

export function resourceProcedure<TSchema extends z.ZodTypeAny, TRow>(
  config: ResourceProcedureConfig<TSchema, TRow>
) {
  const action = config.action ?? "access";
  const ownerOf = config.ownerOf ?? defaultOwnerOf<TRow>;

  return protectedProcedure
    .input(config.input)
    .use(async ({ ctx, input, next }) => {
      const parsedInput = input as z.infer<TSchema>;
      const me = ctx.me;
      const row = await config.loadRow(parsedInput, me);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${config.resource} not found`,
        });
      }

      const ownerId = ownerOf(row);
      if (!me.can(config.permission, ownerId)) {
        ctx.audit
          .log(
            `${config.resource}:${action}_denied`,
            config.resource,
            ownerId,
            { required: config.permission }
          )
          .catch((err) => {
            console.error("audit log failed:", err);
          });
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Access denied. Required permission: ${config.permission}`,
        });
      }

      const result = await next({ ctx: { ...ctx, row } });

      if (result.ok) {
        ctx.audit
          .log(`${config.resource}:${action}`, config.resource, ownerId)
          .catch((err) => {
            console.error("audit log failed:", err);
          });
      }

      return result;
    });
}
