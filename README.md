# RegionReach

RegionReach is a compliance-first B2B outreach SaaS for managing public business contacts, regional lead lists, verified sender identities, compliant campaigns, suppression controls, unsubscribe flows, and audit trails.

## Compliance-First Note

RegionReach is designed for lawful B2B outreach only.

- Public business contact intake only
- CSV imports with source tracking
- Lawful basis, consent, objection, and outreach status controls
- Suppression list and unsubscribe enforcement
- Sender verification checks before launch
- Audit logging and campaign safety gates

The app does not support illegal scraping, hidden sender identity, domain rotation to evade spam controls, or unsafe mass inbox abuse.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Prisma ORM
- Neon PostgreSQL
- Auth.js Credentials authentication
- bcryptjs password hashing
- BullMQ + Redis
- Zod
- React Hook Form
- TanStack Query
- TanStack Table
- Vitest

## Prerequisites

- Node.js 20+
- A Neon PostgreSQL project
- Redis 7+

## Neon Setup

Create a Neon project and branch, then open the `Connect` panel.

Use:

- `DATABASE_URL`: the pooled connection string, usually the hostname containing `-pooler`
- `DIRECT_URL`: the direct non-pooled connection string, usually the hostname without `-pooler`

Example pattern:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
```

## Install

```bash
npm install
cp .env.example .env
```

Fill in your environment values in `.env`.

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
EMAIL_PROVIDER=mock
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
WEBHOOK_SIGNING_SECRET=
DEFAULT_FROM_EMAIL=
DEFAULT_FROM_NAME=
RESEND_API_KEY=
```

## Prisma Migration And Seed

Generate the client:

```bash
npm run prisma:generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

Load demo data:

```bash
npm run prisma:seed
```

## Run The App

Start the Next.js app:

```bash
npm run dev
```

Run Redis locally:

```bash
docker run --name regionreach-redis -p 6379:6379 redis:7-alpine
```

Run the BullMQ worker in another terminal:

```bash
npm run worker
```

## Demo Login

After seeding:

- Email: `demo@regionreach.app`
- Password: `Demo12345!`

## Switching Email Providers Later

- `EMAIL_PROVIDER=mock` uses the in-app mock provider for local development and tests.
- `EMAIL_PROVIDER=resend` enables the Resend adapter placeholder and requires `RESEND_API_KEY`.

The campaign workflow stays provider-agnostic through the shared email provider interface.

## Deployment Notes

- Optimized for Vercel + Neon + managed Redis
- Keep `AUTH_SECRET`, database credentials, webhook secrets, and email provider keys server-side only
- Set both `DATABASE_URL` and `DIRECT_URL` in Vercel
- Point email provider webhooks to `/api/webhooks/email`

## Testing

```bash
npm test
```
