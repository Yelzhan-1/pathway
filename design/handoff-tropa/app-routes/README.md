# app-routes — examples for `src/app/**`

Server pages fetch data and pass **JSON-only props**; interactive screens are Client Components.
`(app)` routes share one layout with `<AppShell>` so the shell does not re-mount between pages.

| File here | Put it at | Notes |
|---|---|---|
| `app-layout.tsx` | `src/app/(app)/layout.tsx` | loads ShellData once, renders `<AppShell>`; `active` comes from the segment |
| `dashboard/page.tsx` | `src/app/(app)/dashboard/page.tsx` | NOW-data binding, LATER widgets get `null` |
| `dashboard/loading.tsx` | same folder | skeleton grid |
| `profile/page.tsx` | `src/app/(app)/profile/page.tsx` | |
| `cv/page.tsx` | `src/app/(app)/cv/page.tsx` | print = only `.cv-print-root` |
| `onboarding/page.tsx` + `OnboardingClient.tsx` | `src/app/onboarding/` | no shell; `onFinish` is a server action |
| `login/page.tsx`, `signup/page.tsx` | `src/app/(auth)/…` | |
| `page.tsx` | `src/app/page.tsx` | landing hero |
| `credits/page.tsx` | `src/app/credits/page.tsx` | CC BY-SA credits (required) |
| `dev/states/page.tsx` | `src/app/dev/states/page.tsx` | fixtures gallery, `notFound()` in production |
