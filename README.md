# Spruce Kitchen

A meal-plan subscription web app built with Next.js 15 (App Router), TypeScript, tRPC, Drizzle, and PostgreSQL.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9 (the repo pins `pnpm@9.15.0` via `packageManager`)
- A PostgreSQL database (local or hosted)

### Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in real values
pnpm db:migrate              # apply schema to your database
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Start Next.js dev server with hot reload      |
| `pnpm build`       | Production build                              |
| `pnpm start`       | Run the production build                      |
| `pnpm lint`        | Run ESLint (disabled in `next.config.mjs` builds) |
| `pnpm typecheck`   | `tsc --noEmit`                                |
| `pnpm db:generate` | Generate Drizzle migrations from schema       |
| `pnpm db:migrate`  | Apply migrations to the database              |
| `pnpm db:push`     | Push schema directly (dev shortcut)           |
| `pnpm db:studio`   | Open Drizzle Studio                           |
| `pnpm db:seed`     | Run `lib/db/seed.ts`                          |
| `pnpm db:drop`     | Drop tables (destructive)                     |

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router and React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with a custom brand palette (raisin, isabelline, hookers, persian; primary orange `#E28441`)
- **UI**: Radix UI primitives + locally-owned components under `components/ui`
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Better Auth (email/password + Google / Facebook OAuth)
- **API**: tRPC with React Query
- **Email**: Resend (optional, enables verification emails when `RESEND_API_KEY` is set)
- **Fonts**: Geist Sans + Geist Mono

## Project Structure

```
app/                 Next.js App Router pages and API routes
  (authenticated)/   Routes protected by middleware
  api/               Route handlers (tRPC, identity, auth)
components/
  ui/                Design-system primitives
  auth/              AuthGuard and auth-related UI
  onboarding/        Multi-step onboarding flow
lib/
  auth.ts            Better Auth server config
  auth-client.ts     Better Auth browser client
  db/                Drizzle schema, client, and seed
  trpc/              Routers, context, and client setup
  identity/          Current-user module (in flight on this branch)
  services/          Domain services consumed by tRPC
hooks/               Reusable React hooks
middleware.ts        Route protection and role-based access
```

## Architecture Notes

### Authentication

Better Auth is configured in `lib/auth.ts`. Route protection runs in `middleware.ts`:

- **Protected**: `/onboarding`, `/dashboard`, `/profile`, `/settings`
- **Auth routes**: `/login`, `/signup` (redirect away if already signed in)
- **Email verification**: required whenever `RESEND_API_KEY` is configured

Client-side, wrap protected pages with `<AuthGuard>` from `components/auth`.

### Data Layer

Schema lives in `lib/db/schema.ts`. Core entities: `user`, `session`, `account`, `verification`, `mealPlan`, `order`. All timestamps use `timestamp with time zone`.

After editing the schema, run `pnpm db:generate` to produce a migration, then `pnpm db:migrate` to apply it.

### API

tRPC routers live under `lib/trpc`. Current routers:

- `userRouter` — profile and account management
- `mealPlanRouter` — meal plan creation and management

Prefer tRPC hooks over raw `fetch` for any internal API call so you keep end-to-end types.

### Components

- Pages are **Server Components** by default for smaller client bundles.
- Add `"use client"` only where you need interactivity, state, or browser APIs.
- Event handlers can't cross the server/client boundary as props — pass data down, receive events via callbacks inside client components.

## Environment Variables

Copy `.env.example` to `.env.local` and populate:

| Variable                              | Required | Purpose                                |
| ------------------------------------- | :------: | -------------------------------------- |
| `DATABASE_URL`                        |    Yes   | PostgreSQL connection string           |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`     | Optional | Google OAuth                 |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Optional | Facebook OAuth               |
| `RESEND_API_KEY`                      | Optional | Transactional email + verification     |

> Note: `.env.example` currently also lists Clerk keys from an earlier iteration. Better Auth is the active auth system — the Clerk variables are unused and can be ignored.

## Deployment

The app is designed to deploy cleanly on Vercel:

1. Push to your Git remote.
2. Import the repo in Vercel and set the environment variables above.
3. Provision PostgreSQL (Neon, Vercel Postgres, RDS, etc.) and set `DATABASE_URL`.
4. Run `pnpm db:migrate` against the production database before first deploy.

## Contributing

- Create a feature branch — never commit directly to `main`.
- Keep Server/Client Component boundaries explicit.
- Generate a migration for any schema change; don't rely on `db:push` outside of local dev.
- Run `pnpm typecheck` before opening a PR.
