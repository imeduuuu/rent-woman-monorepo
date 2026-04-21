# RENT WOMAN

A production-oriented monorepo for a premium adult talent directory and booking platform built with **Turborepo**, **Next.js 14 App Router**, **Express**, **Prisma**, **PostgreSQL**, **Redis**, **NextAuth.js v5 (JWT)**, **Stripe**, **AWS S3**, **Sumsub**, **AWS Rekognition**, **Socket.IO**, **Resend**, and **Twilio**.

The repo is organized for a modern split deployment:

- `apps/web` → Vercel
- `apps/api` → Railway
- `packages/db` → Prisma schema and client
- `packages/types` → shared TypeScript contracts
- `packages/ui` → shared React UI primitives
- `packages/config` → shared ESLint and Tailwind configuration

## Stack notes

- Turborepo documents recommend a root `turbo.json` and `packageManager` field for monorepos. citeturn165059search3turn165059search7
- Next.js recommends App Router for new applications, and Next.js 14 documents its App Router separately. citeturn165059search12turn165059search20
- Auth.js recommends creating an `auth.ts` configuration file and NextAuth.js v5 migration docs still reference installing `next-auth@beta` for v5. citeturn165059search5turn831938search20
- Prisma’s PostgreSQL quickstart uses `prisma generate`, migrations, and a generated Prisma Client. citeturn165059search2turn165059search18
- Stripe recommends handling real-time payment events through HTTPS webhooks. citeturn831938search1turn831938search17
- Upstash provides an HTTP-based Redis client via `@upstash/redis`; this repo also supports a plain `REDIS_URL` for local Docker Redis. citeturn831938search2
- Resend ships a Node.js SDK named `resend`. citeturn831938search3turn831938search11
- Twilio Verify supports Node.js + Express flows for phone verification. citeturn995729search0
- Sumsub’s WebSDK requires a backend-generated SDK access token, and Sumsub API requests are signed with `X-App-Access-Sig` HMAC headers. citeturn834026search0turn479652search0
- Socket.IO supports TypeScript directly on both server and client. citeturn995729search7turn995729search11
- AWS Rekognition is available through the AWS SDK for JavaScript v3 package `@aws-sdk/client-rekognition`. citeturn995729search2turn995729search13

## Monorepo layout

```text
/apps
  /web
  /api
/packages
  /db
  /types
  /ui
  /config
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- PostgreSQL 16+
- Redis 7+

## 1. Install dependencies

```bash
pnpm install
```

## 2. Start local infrastructure

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

## 3. Configure environment variables

Copy the root example file:

```bash
cp .env.example .env
```

Update every value before using real third-party services.

## 4. Generate Prisma client and run migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

## 5. Start development

```bash
pnpm dev
```

Default ports:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Useful scripts

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

## Authentication architecture

- The frontend uses **NextAuth.js v5** with **JWT sessions**.
- Credentials auth is backed by Prisma user records.
- Optional Google OAuth is enabled only if Google env vars are present.
- The Express API is intended for public REST routes, webhooks, storage/KYC/moderation integrations, and real-time messaging.
- Authenticated browser-to-server mutations that need session context can be proxied through Next.js server actions or route handlers.

## Payments architecture

- Subscription and one-time payments use **Stripe Checkout**.
- Checkout sessions are created through the Express API.
- Stripe webhook events update local payment records and user subscription state.
- Successful payments should be treated as confirmed only after webhook processing. citeturn831938search1turn831938search17

## Storage and moderation flow

1. The web app requests a signed S3 upload URL from the API.
2. The client uploads directly to S3.
3. The API runs AWS Rekognition moderation.
4. The moderation result is stored on the related `MediaAsset` record.
5. Only approved assets should be shown publicly.

## KYC flow

1. An authenticated dashboard request asks the API for a Sumsub SDK access token.
2. The API signs the request using Sumsub HMAC headers.
3. The frontend initializes the Sumsub WebSDK with the returned token.
4. Applicant review results are synced back into Prisma using webhook or polling flows.

## Realtime messaging flow

- Socket.IO runs on the Express API.
- The web app requests a short-lived HMAC socket token from a protected Next.js route.
- The Socket.IO server verifies that token before allowing the connection.
- Direct messages are persisted in PostgreSQL and emitted to the conversation room.

## Environment variables

All required variables are in `.env.example`. The set covers:

- auth
- database
- redis
- stripe
- aws s3
- aws rekognition
- sumsub
- resend
- twilio
- deployment secrets

## CI/CD

GitHub Actions file: `.github/workflows/ci.yml`

The pipeline does the following:

1. Boots PostgreSQL and Redis services
2. Installs dependencies with pnpm
3. Generates Prisma Client
4. Runs lint, typecheck, test, and build
5. Optionally deploys the web app to Vercel on `main`
6. Optionally deploys the API to Railway on `main`

Deployment jobs require repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RAILWAY_TOKEN`

## Suggested production setup

### Vercel
- Deploy `apps/web`
- Set all frontend and shared environment variables in the Vercel dashboard
- Point `NEXT_PUBLIC_API_URL` to the Railway API domain

### Railway
- Deploy `apps/api`
- Provision PostgreSQL and Redis, or use external managed services
- Set `PORT`, `DATABASE_URL`, `REDIS_URL`, Stripe, AWS, Sumsub, Resend, and Twilio secrets

## Database seeding

A starter seed is included in `packages/db/prisma/seed.ts`. It creates:

- admin account
- sample talent accounts
- public profiles
- active listings

## Security checklist before production

- Rotate every secret from `.env.example`
- Enable HTTPS everywhere
- Restrict CORS to the real frontend origin
- Enforce S3 bucket policies and signed URLs only
- Verify Stripe webhook signatures
- Use a strong `AUTH_SECRET`
- Limit Sumsub and webhook routes by IP or secret where possible
- Add rate limiting on auth, checkout, upload, and messaging routes
- Move secrets to Vercel/Railway dashboards or a secret manager
- Add image/video virus scanning if required by your compliance policy

## Notes

- This repo is designed to be a strong production starter, not a finished product.
- All code comments are in English.
- File names follow kebab-case where applicable, variables use camelCase, and React components use PascalCase.
