# Pathway · B2.2 «Тропа» — design system + handoff for Cursor (Next.js 16)

> Replaces the B2.1 handoff (kept untouched in `../handoff-b21/`). Copy this folder into the repo as `design/handoff/`.
> Stack: **Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4** (shadcn variables).
> Verified: every file in `src/` type-checks (TS strict) and renders in the Vite preview (`B22/preview/tropa.html?view=…`); reference renders in `reference/`.
> `app-routes/` are examples (not compiled here, `next` is not installed in the preview) — adapt imports to your data layer.

**Idea.** The dashboard is a *map*: an illustrated winding road with steps (done / current / locked). Around it: chunky «3D» buttons (4px bottom edge, press-down), colourful icon tiles, sticker stats, collectible university cards (monogram + flag, never logos), quests and streak, a documents «backpack», and an AI buddy that is always labelled «ИИ, не человек». Headings in **Unbounded**, everything else **Onest**, hand notes in **Caveat**.

## 0. Folder
```
handoff/
├─ HANDOFF.md
├─ src/
│  ├─ app/globals.css            tokens light+dark, Tropa utilities, reduced/lite, PRINT CSS for the CV
│  ├─ app/fonts.ts               next/font: Onest + Unbounded + Caveat (cyrillic subsets)
│  ├─ app/layout.example.tsx     merge into your layout.tsx
│  ├─ components/pathway/
│  │  ├─ PathwayProviders.tsx    MotionConfig(reduced) + html.lite
│  │  ├─ ui/                     tropa.tsx (Display, TCard, Button, IconTile, WidgetHeader, Skeleton, WidgetSkeleton, EmptyCta, ExampleChip, Logo) · Flag · UniMonogram · illustrations (Signpost, PathHills)
│  │  ├─ shell/                  AppShell (sidebar, topbar, mobile bottom bar, «Ещё» sheet) · ThemeToggle · nav.ts
│  │  ├─ dashboard/              ProgressRoad (+MapScenery) · StatTiles · ProfileStrengthRing · StreakCard · PopularUniversities · CheckChancesForm · ChancesColumns · DeadlinesTickets · OpportunitiesList · DocumentsBackpack · AiBuddyCard · DashboardScreen
│  │  ├─ onboarding/             OnboardingFlow (10 questions + summary) · RoadProgress (mini road)
│  │  ├─ profile/ cv/ landing/ auth/   ProfileScreen · CvBuilderScreen (+CvSheet) · LandingHero · AuthScreen
│  │  └─ primitives/             Ring · Num · Flame · Scribble (HandNote, Arrow, Underline) · MentorMark · Photo · States (ErrorState)
│  ├─ components/react-bits/     CountUp · Counter · ClickSpark (already patched, 'use client')
│  ├─ lib/                       prefs.ts (reduced/lite, SSR-safe) · format.ts (RU dates, plural, initials) · utils.ts (cn)
│  ├─ types/pathway.ts           ALL data contracts (read this first)
│  └─ fixtures/                  ⚠️ tropa.ts + images.ts — EXAMPLE data for /dev/states only
├─ app-routes/                   page examples: (app) layout, dashboard (+loading), profile, cv, onboarding, login, signup, landing, credits, dev/states
├─ public/images/campus/         3 CC BY-SA campus photos + CREDITS.md
└─ reference/                    WebP renders to compare against (see §10)
```

## 1. Install
```bash
npm i motion lucide-react clsx tailwind-merge
# optional: next-themes (swap ThemeToggle body for useTheme, attribute="class")
cp -r design/handoff/src/components/pathway design/handoff/src/components/react-bits src/components/
cp    design/handoff/src/lib/{prefs,format}.ts src/lib/        # keep your shadcn utils.ts (cn) if present
cp -r design/handoff/src/types src/ && cp design/handoff/src/app/fonts.ts src/app/
cp -r design/handoff/public/images public/
# fixtures: copy ONLY if you keep /dev/states: cp -r design/handoff/src/fixtures src/
```
**Exact deps used by handoff code:** `motion` (^12), `lucide-react`, `clsx`, `tailwind-merge`, `next` (`next/link`, `next/image`, `next/font/google`, `next/navigation`), `react`/`react-dom` 19, `tailwindcss` 4. Dev: `typescript`. *Removed vs B2.1:* gsap, @gsap/react, ogl, @hugeicons/*, canvas-confetti (no longer needed; confetti optional — see §7).
React Bits kept (already patched): **CountUp** (`Num` → ring %, stat tiles, streak, chances), **Counter** (optional for streak roll), **ClickSpark** (onboarding option select). Registry, if you need more: `"@react-bits": "https://reactbits.dev/r/{name}.json"`.

## 2. Fonts (`src/app/fonts.ts`)
- `Onest` (body/UI) subsets `cyrillic, cyrillic-ext, latin, latin-ext` — full Russian + Kazakh.
- `Unbounded` (display: H1–H3, big numbers, logo) subsets `cyrillic, cyrillic-ext, latin, latin-ext`. **Verified with fontTools: full Russian + І/і, but NO Kazakh Ә Ғ Қ Ң Ө Ұ Ү Һ.** globals.css has `:lang(kk) { --font-display: Onest }` so Kazakh headings switch to Onest entirely (no mixed glyphs). Set `lang="kk"` when you ship Kazakh.
- `Caveat` hand notes only (≤ 4 per screen, ≤ 4 words, 19–25px). **No `₸` and no `→` in Caveat** — keep them in Onest.
- `<html className={`${onest.variable} ${unbounded.variable} ${caveat.variable}`}>`; CSS maps `--font-sans`, `--font-display` (`font-display` class), `--font-hand`.
- Never use Unbounded below 14px, in inputs, buttons, nav or body text: it is wide, Cyrillic lines get long. Headings use `text-balance`.

## 3. Tokens (`src/app/globals.css`)
Replace your `:root`, `.dark`, `@theme inline` blocks with ours; keep your own `@import`s. Dark mode = `.dark` on `<html>`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` canvas | `#F3FDF8` | `#05110C` | page |
| `--foreground` ink | `#0C1F17` | `#EBF7F1` | text |
| `--primary` forest | `#075E46` | `#52CCA3` | CTA, active, done nodes |
| `--secondary` mint | `#E8FFF2` | `#043726` | chips, tracks |
| `--muted-foreground` | `#5C6C64` (5.3:1) | `#94A39B` (6.7:1) | secondary text |
| `--honey` | `#F8AC3D` | same | **decorative / fills only** (current node, streak dots, honey button bg with `--honey-ink` text 8.8:1) |
| `--honey-deep` | `#815200` (6:1 on honey-soft) | `#F8BF6C` | honey *text* |
| `--tone-{mint,honey,coral,dream,sky}-{bg,fg}` | see file | see file | icon tiles, uni cards, doc chips (all fg ≥ 5.7:1) |
| `--chunk`, `--chunk-primary`, `--chunk-honey` | `#D4E8DE`, `#014935`, `#9A6300` | `#020A07`, `#1E7D5F`, `#9A6300` | 3D bottom edges |
| `--map-*`, `--node-*` | sky/hills/trees/road | darker forest set | ProgressRoad illustration |
| `--radius-card` 26px · `--radius-hero` 30px | | | cards / map hero |

Utilities: `shadow-card` (2px edge + soft drop), `shadow-chunky`, `shadow-chunky-honey`, `shadow-chunky-soft`, `press` (translateY 3px + edge off on :active), `font-display`, `anim-node-pulse`, `anim-flame`.
**Contrast** (checked): all text ≥ 4.5:1 in both themes; tile fg/bg ≥ 5.7:1; locked-node icon 4.3:1 (non-text ≥ 3:1). Traps fixed: honey text on white (never), «Сейчас» label on the light bubble in dark mode uses `#815200`.
**Print** (bottom of globals.css): `@page A4`, only `.cv-print-root` prints, `.no-print` + shell hidden, black on white, Onest, no shadows — the CV sheet is plain on purpose.

## 4. Layout spec
| | ≥ lg (1024+) | < lg |
|---|---|---|
| Shell | Sidebar 252px (logo, 10 nav items with coloured 32px tiles, guide card, user block) + topbar 72px (search 420px, streak chip, `пример данных` chip only for fixtures, theme, bell, avatar) | Topbar 64px (logo, streak, bell). Bottom bar: **Главная · Вузы · План · AI · Профиль + «Ещё»** (6 cells, 54px, active = forest pill with chunky edge). «Ещё» = bottom sheet: other nav items 2-col, guide card, user + theme + logout. Content `pb-28`. |
| Dashboard | grid `[minmax(0,1fr) 340px] gap-4`; main: map hero (16:9) → [Popular 1.25fr | Check 1fr] → [Chances | Deadlines | Opportunities]; rail: Strength → Streak → AI → Backpack | one column in this order: hero (greeting, 3 stat tiles, **vertical** road) → Strength → Check → Popular (h-scroll snap) → Streak → Chances → Deadlines → Backpack → AI → Opportunities (`contents` wrappers + `order-*`) |
| Tilt | stickers/uni cards ±1–2° only at `lg:` | **never tilted** on mobile (readability) |
| Onboarding | no shell; header; mini road 11 nodes with labels; question column 760px; xl: live «Профиль растёт» card (answered/10) + signpost | mini road without labels + «Шаг N из 11 · Label»; sticky «Дальше» |
| Profile | scenery header (initials avatar 96, chips, ring) → [sections 2-col (xl) | rail: CV card, Backpack, Account] | one column |
| CV | [editor | A4 preview 600px sticky] at xl | editor then preview |
| Auth | [form 560 | map panel with road «Регистрация = ты здесь»] | form only |
Touch targets ≥ 40px (buttons 40/44/56). Focus: 3px `--ring` outline.

## 5. Component map (props → see `types/pathway.ts`)
Every widget: `data: X | null` (null → **empty state with one CTA**, no fake numbers) and `loading?: boolean` (skeleton with the same geometry, `role=status`).

| Component | Props | Empty state (null) | Notes |
|---|---|---|---|
| `AppShell` 'use client' | `data: ShellData, active, isExample?` | streak chip hidden when `streakDays` null | Esc closes sheet; `aria-current="page"` |
| `ProgressRoad` 'use client' | `steps: RoadStep[], finish?` | 1 step → only first node + fog + «Дальше дорога откроется сама» | desktop: SVG map (nodes as HTML overlays in % of viewBox 800×450); mobile: vertical zig-zag. Draw-in 1.2s, nodes pop (stagger 90ms), current pulses |
| `StatTiles` | `tiles: StatTile[] | null` | sticker «Смотри вузы…» + «Открыть каталог» | CountUp numbers |
| `ProfileStrengthRing` | `data: ProfileStrength | null` | «Профиль пока пустой» → /onboarding | missing rows link to `/profile#<fieldId>` |
| `StreakCard` | `data: StreakData | null` | «Огонёк зажжётся после первого шага» | |
| `PopularUniversities` 'use client' | `unis, total?, onToggleSave?` | «Каталог скоро наполнится» | Heart = `aria-pressed`, optimistic; whole card is a link |
| `CheckChancesForm` 'use client' | `options: CheckChancesOptions | null, onSubmit?, pending?` | locked preview + «Заполнить профиль» | native `<select>` |
| `ChancesColumns` | `data: ChancesSummary | null` | «Пока ни одной проверки» → `#check` | |
| `DeadlinesTickets` | `items, today` | «Дедлайнов пока нет» → /universities | ≤ 7 days = hot (red stub); days from server `today` |
| `OpportunitiesList` | `items` | «Подберём гранты и олимпиады» → /profile | kinds grant/olympiad/contest/program |
| `DocumentsBackpack` | `docs: DocItem[] | null` | «Рюкзак пока пуст» → /cv | 3-col chips done/progress/todo |
| `AiBuddyCard` | `data: AiBuddy | null` | intro message + «Заполнить профиль» | **«ИИ, не человек» in every state** |
| `OnboardingFlow` 'use client' | `data, initialStep?, initialAnswers?, onFinish?, onExit?` | — | radio/checkbox semantics, ClickSpark, spring slide |
| `RoadProgress` | `labels, current, onJump?` | — | done nodes are buttons (edit earlier answer) |
| `ProfileScreen` | `data: ProfileData, docs` | empty fields = honey dashed rows with +N% | anchors = field ids |
| `CvBuilderScreen` 'use client' / `CvSheet` | `data: CvData` | — | preview always light; print = sheet only |
| `LandingHero`, `AuthScreen` 'use client' | `data` / `mode, error?` | — | product preview labelled «пример маршрута» |

## 6. Data binding — NOW vs LATER
| Widget / field | Source | Block | Now |
|---|---|---|---|
| `firstName`, shell user, city | profile | 2 | ✅ real |
| Onboarding answers (10) | onboarding table/profile columns; option ids = enums (`app-routes/onboarding/steps.ts`) | 2 | ✅ real, save per step |
| `strength.percent` | filled / total profile fields (same list as onboarding + CV) | 2 | ✅ real |
| `strength.missing[]` | fields with `null` → `{ id, label, gain, href:/profile#id }` | 2 | ✅ real |
| Road steps | derived: Профиль (current until ≥80%), Резюме (from CV status), rest `locked` | 2 → 4 | ✅ derived now, roadmap table later |
| `docs` backpack | CV status (done/progress by `cv.percent`) + list from profile (transcript always; IELTS/TOEFL only if planned; motivation letter if abroad) | 2 | ✅ real |
| Profile page, CV builder | profile + cv tables | 2 | ✅ real |
| `popular` universities | `universities` table (35 rows) | 3 | ⚠️ can list real rows NOW (monogram + country + tags); `saved`/favorites later |
| `stats`, `checkOptions`, `chances` | matching, views, favorites, comparisons | 3 | ⛔ `null` → empty states |
| `deadlines`, `streak`, `opportunities`, road dates | roadmap/deadlines/activity | 4 | ⛔ `null` |
| `ai` | assistant | 5 | ⛔ `null` (intro card) |
| `shell.streakDays`, nav badges | activity / favorites | 3–4 | `null` / none |
`fixtures/tropa.ts` holds `exampleDashboard` (full) and `emptyDashboard` (new user) — **only** for `/dev/states` (which calls `notFound()` in production) and tests. Never import fixtures in real routes.

## 7. Motion (all transform/opacity; off in reduced, simplified in lite)
| What | How | Time |
|---|---|---|
| Road draw-in | `pathLength` 0→1 on the white road, dashes fade in | 1.2s ease-out-soft, +0.15s |
| Nodes pop | spring 420/22 | stagger 90ms from 0.35s |
| Current node | CSS `anim-node-pulse` (scale 1→1.28, fade) | 2.2s loop |
| Numbers | React Bits CountUp (`Num`) | 0.6–1.6s |
| Ring | spring 38/16 | +0.2s |
| Chunky press | `press` utility, translateY 3px | 120ms |
| Onboarding | question slide x 24→0 (spring 320/32), road fill spring 120/22, ClickSpark on select | |
| «Ещё» sheet | y 100%→0 spring 380/36 | |
| Streak flame | CSS flicker | loop |
**Reduced** (`prefers-reduced-motion` / `?reduced`): MotionConfig `always`, road drawn instantly, no pulse/flame, CountUp shows final value. **Lite** (Save-Data, 2g/3g, ≤2GB, `?lite`): `html.lite` stops pulse/flame/road animation, `Photo hideInLite` shows blur placeholder only. Optional: `canvas-confetti` one burst when a road step becomes `done` (not included; skip in reduced/lite).

## 8. Images & credits
- Only 3 campus photos (Wikimedia Commons, **CC BY-SA** → visible credit): landing shows it under the photo, `Photo` sets `title`, and **`/credits`** page lists all (`app-routes/credits/page.tsx`; link from footer).
- B2.1 Pexels portraits are **not shipped**: stock people are never shown as users/mentors. Avatars = initials.
- Universities: `UniMonogram` (palette colour by id hash) + `Flag` SVG. **No logos.**

## 9. Careful!
1. **Tailwind v4 `-translate-x-1/2` uses the `translate` property**, which *adds* to an inline `transform`. ProgressRoad nodes use inline transform only — don't add translate classes to them.
2. ProgressRoad desktop is **aspect-locked 16:9**; overlays are % of viewBox 800×450. If you change the viewBox or card aspect, change both. The hero text + stat tiles sit top-left (≤ 440px, top ≤ 215px) — keep road nodes below that (layout() does).
3. Server/client boundary: pages are Server Components passing JSON; functions (`onFinish`, `onToggleSave`, `onSubmit`) only from client wrappers.
4. `today` must come from the server in the user TZ (Asia/Almaty); never `new Date()` in components (hydration).
5. Unbounded lacks Kazakh letters → `:lang(kk)` fallback (see §2).
6. Caveat has no `₸`/`→`.
7. `AppShell` topbar is `sticky` + blur on mobile; the bottom bar is `fixed` → keep `pb-28` on content and `env(safe-area-inset-bottom)`.
8. Print: CV sheet must stay inside `.cv-print-root`; don't put Tailwind colour classes there that you'd want printed — print CSS forces black on white.
9. «35» in landing bullets / «Все 35» must come from the DB count, not hard-coded.
10. `ThemeToggle` is minimal (localStorage `theme`). Add an inline script in `<head>` (or next-themes) to set `.dark` before paint to avoid a flash.

## 10. Reference renders (`reference/*.webp`)
| File | Screen |
|---|---|
| `01-dashboard-desktop-light` | Dashboard 1440, full page, example data |
| `02-dashboard-desktop-dark` | same, dark |
| `03-dashboard-mobile-light`, `03b-dashboard-mobile-dark` | 390, full page |
| `04-dashboard-mobile-more` | «Ещё» sheet |
| `05-dashboard-empty-desktop` | brand-new user (all empty states) |
| `06-onboarding-desktop`, `07-onboarding-mobile` | step 8 «Страны» |
| `08-profile-desktop` | profile |
| `09-cv-builder-desktop` | CV editor + A4 |
| `10-landing-hero-desktop`, `11-landing-hero-mobile` | landing |
| `12-auth-signup-desktop` | signup |
Live preview (all screens): `pathway-design/B22/preview/tropa.html?view=dashboard|empty|onboarding|onboarding-summary|profile|cv|landing|auth` (+`&theme=dark`, `&reduced`, `&lite`, `&more`).
