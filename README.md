# Pathway

Pathway is a web platform that helps university applicants in Kazakhstan (school grades 9–12 and transfer students) plan and track their admissions journey. It matches applicants to universities based on real requirements, generates a personalized weekly roadmap, and will soon include an AI admissions agent to help along the way.

This repository currently contains **Block 1: the project skeleton** — authentication, route protection, the app shell, and placeholder pages. Onboarding, profile/CV, university matching, the roadmap, task tracking and the AI agent are built in later blocks.

## Stack

- [Next.js](https://nextjs.org) (App Router, `src/` directory, TypeScript strict)
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`) for Auth and Postgres
- [zod](https://zod.dev) + [react-hook-form](https://react-hook-form.com) for form validation
- [lucide-react](https://lucide.dev) icons
- [Vitest](https://vitest.dev) for unit tests

## Architecture

- **Frontend & server**: a single Next.js app (App Router) deployed on Vercel. Server Components read data directly from Supabase using the signed-in user's session (Row Level Security enforces per-user access — the app never uses a service-role key).
- **Auth**: Supabase Auth with email + password. `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`) refreshes the session cookie on every request and does a first-pass redirect for protected/auth routes. Every protected page additionally calls `supabase.auth.getUser()` server-side — the proxy is defense in depth, not the only check.
- **Database**: Postgres managed by Supabase, with schema, Row Level Security policies and triggers already provisioned outside this repo (see `src/lib/database.types.ts` for the hand-written type definitions matching the live schema). This app never runs migrations or touches the schema.
- **AI admissions agent**: not implemented yet. The `(app)` layout already reserves a UI slot for it (the "Агент" button opening an empty side sheet).

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in your Supabase project's public values:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API in the Supabase dashboard). Never put a service-role key here.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
npm run build      # Production build
```

## Folder structure

```
src/
  app/
    (auth)/            # /login, /signup — public auth pages + shared layout
    (app)/              # /dashboard, /onboarding, /profile, /universities,
                         # /roadmap, /tasks — protected pages sharing the app shell
    error.tsx           # Global error boundary (Russian copy)
    not-found.tsx        # Global 404 page (Russian copy)
    layout.tsx           # Root layout (fonts, <html lang="ru">, toaster)
    page.tsx              # Landing page
  components/
    ui/                 # shadcn/ui components
    nav/                 # Sidebar, bottom nav, top bar, user menu, agent sheet
  lib/
    supabase/            # Browser + server Supabase client factories
    validations/         # zod schemas
    actions/              # Server actions not tied to a single route (e.g. sign out)
    strings.ts            # All Russian UI copy lives here
    database.types.ts      # Hand-written types matching the live Supabase schema
  proxy.ts                 # Next.js 16 proxy (session refresh + route protection)
```

## Third-party components

| Package | License |
| --- | --- |
| next | MIT |
| react / react-dom | MIT |
| tailwindcss | MIT |
| shadcn/ui components (`src/components/ui`) | MIT |
| @base-ui/react (shadcn's underlying primitives) | MIT |
| class-variance-authority | Apache-2.0 |
| @supabase/ssr, @supabase/supabase-js | MIT |
| zod | MIT |
| react-hook-form, @hookform/resolvers | MIT |
| lucide-react | ISC |
| sonner | MIT |
| vitest | MIT |
