import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "@/lib/trpc/root.ts";
import { createTRPCContext } from "@/lib/trpc/server.ts";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext(opts),
    // Only attach onError in development; under exactOptionalPropertyTypes we
    // can't pass an explicit `undefined` to an optional field — spread instead.
    ...(process.env.NODE_ENV === "development" && {
      onError: ({ path, error }: { path?: string; error: { message: string } }) => {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
        );
      },
    }),
  });

export { handler as GET, handler as POST };
