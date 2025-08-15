# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Next.js hot reload
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (currently disabled during builds via next.config.mjs)

### Database Commands
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit migrate` - Apply migrations to database
- `npx drizzle-kit studio` - Open Drizzle Studio for database inspection

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password and OAuth (Google, Facebook)
- **API Layer**: tRPC for type-safe API calls
- **UI Components**: Radix UI primitives with custom components
- **Email**: Resend for transactional emails
- **Fonts**: Geist Sans and Geist Mono

### Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable UI components
  - `/ui` - Core UI primitives and shared components
  - `/auth` - Authentication-related components
  - `/onboarding` - Multi-step onboarding flow components
- `/lib` - Core utilities and configurations
  - `/auth.ts` - Better Auth configuration
  - `/trpc` - tRPC client/server setup and routers
  - `/db` - Database schema and configuration
- `/hooks` - Custom React hooks
- `/middleware.ts` - Next.js middleware for route protection

### Authentication System
- Uses Better Auth library with email/password and OAuth providers
- Route protection via middleware.ts with role-based access
- Protected routes: `/onboarding`, `/dashboard`, `/profile`, `/settings`
- Auth routes: `/login`, `/signup` (redirect authenticated users)
- Email verification required when RESEND_API_KEY is configured

### Database Schema
Core entities:
- `user` - User accounts with basic profile information
- `session` - User sessions with device tracking
- `account` - OAuth provider accounts linked to users
- `verification` - Email verification tokens
- `mealPlan` - User meal subscriptions and preferences
- `order` - Individual orders with status tracking

### tRPC API Structure
- `userRouter` - User profile and account management
- `mealPlanRouter` - Meal plan creation and management
- Type-safe client-server communication with React Query integration

### Component Architecture
- **Server Components**: Default for pages and data fetching
- **Client Components**: Interactive UI with "use client" directive
- **Auth Guard**: Wrapper component for protected pages
- **Onboarding Flow**: Multi-step form with state management

### Styling System
- Custom brand colors: raisin, isabelline, hookers, persian
- CSS variables for theming with HSL color space
- Custom animations for landing page experience
- Responsive design with container queries

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - For email functionality (optional)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` - Facebook OAuth

## Development Notes

### Common Patterns
- Use `AuthGuard` wrapper for protected pages
- Implement proper loading states for async operations
- Follow the established toast notification patterns
- Use tRPC hooks for data fetching and mutations

### Client/Server Component Guidelines
- Pages default to Server Components for better performance
- Use "use client" only when interactivity is required
- Event handlers cannot be passed to Client Component props (use callbacks)
- State management should be localized to client components

### Database Migrations
- Schema changes go in `/lib/db/schema.ts`
- Generate migrations after schema changes
- All timestamps use PostgreSQL timestamp with timezone

### Brand and Design
- Primary brand color is orange (#E28441)
- Uses "Spruce Kitchen" branding throughout
- Custom liquid glass button component for CTAs
- Responsive header with scroll-based styling changes