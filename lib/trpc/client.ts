import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/lib/trpc/root.ts";

export const trpc = createTRPCReact<AppRouter>();
