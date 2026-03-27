# RegionReach

RegionReach is a compliance-first B2B outreach SaaS for managing public business contacts, regional lead lists, verified sender identities, compliant campaigns, suppression controls, and audit trails.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS + shadcn-style UI primitives
- Clerk authentication
- PostgreSQL + Prisma
- BullMQ + Redis
- Resend or mock email provider via adapter layer
- Zod, React Hook Form, TanStack Query, TanStack Table
- Vitest for core service tests

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Clerk account and keys

## Install

```bash
npm install
cp .env.example .env
```

Fill in the environment variables in `.env`.

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
EMAIL_PROVIDER=mock
RESEND_API_KEY=
APP_URL=http://localhost:3000
WEBHOOK_SIGNING_SECRET=
DEFAULT_FROM_EMAIL=hello@regionreach.dev
DEFAULT_FROM_NAME=RegionReach
```

## Database Setup

Generate the client, apply the initial migration, and load the demo workspace:

```bash
npm run prisma:generate
npx prisma migrate dev
npm run prisma:seed
```

## Run The App

Start the Next.js app:

```bash
npm run dev
```

Run Redis locally if you do not already have it running:

```bash
docker run --name regionreach-redis -p 6379:6379 redis:7-alpine
```

Run the BullMQ worker in a second terminal:

```bash
npm run worker
```

## Email Provider Switching

- `EMAIL_PROVIDER=mock` uses the in-app mock adapter for local development and test data.
- `EMAIL_PROVIDER=resend` enables the Resend adapter and requires `RESEND_API_KEY`.

Both providers share the same `EmailProvider` interface, so campaign logic stays provider-agnostic.

## Compliance-First Usage Notes

- RegionReach is designed for lawful B2B outreach only.
- The app blocks contacts marked unsubscribed, suppressed, hard-bounced, complained, or invalid.
- Campaign launch requires a verified sender identity, a workspace postal address, and unsubscribe copy in the footer.
- Lawful basis enforcement is configurable per workspace and checked before send.
- Every compliance state change is written to audit logs and suppression data when appropriate.

## Project Structure

```text
src/
  app/
  components/
  features/
  jobs/
  lib/
  prisma/
  tests/
prisma/
```

## Deployment Notes

- Optimized for Vercel + managed Postgres + managed Redis.
- Keep secrets server-side only.
- Configure Clerk production URLs before deploying.
- Point webhook URLs to `/api/webhooks/email`.

## Testing

```bash
npm test
```
