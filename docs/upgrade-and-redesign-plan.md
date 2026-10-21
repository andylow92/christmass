# Plan: security update + visual redesign

Repo: `andylow92/christmass`, a family Christmas wishlist. It's a Next.js App Router app with next-auth v5 (Google + email/password), Drizzle ORM on Neon Postgres (`neon-http` driver), Tailwind 3 and shadcn/ui. It's deployed on Vercel. There are no tests.

Work on a new branch off `main` and open a PR when done. Vercel will build a preview deployment from it. Keep commits in the phase order below so the security fixes are reviewable on their own.

## Hard constraints

- **No database schema changes or migrations.** The production tables were created by hand (SQL in `README.md`). There is no `drizzle/` migrations folder. Do not run `drizzle-kit generate`, `push` or `migrate`. `lib/db/schema.ts` stays as it is.
- Keep both sign-in methods (Google OAuth + credentials) and the `ALLOWED_EMAILS` allowlist working exactly as now.
- Keep Tailwind on **v3** (`tailwindcss@^3.4.19`, the `v3-lts` tag). A Tailwind v4 migration is out of scope.
- Keep TypeScript on `^5` (don't move to TS 7).
- The comment `// keep this exactly as you have it` in `app/layout.tsx` is stale. Edit the file as needed and drop the comment.

---

## Phase 1: Security fixes in our own code (commit 1)

These are real bugs found in review. Fix them before touching dependencies.

1. **Done in PR #12, skip it.** `app/api/users/route.ts` now requires `auth()`, returns only `{ id, name }`, has no `POST`, and is `force-dynamic`. Keep that behavior through the upgrade; Verification step 4 re-checks it.
2. **`app/api/gifts/[id]/route.ts` PATCH passes the raw request body to `.set(updates)`.** This lets a gift owner reassign `userId`/`id`/`createdAt`, and anyone set `status` to an arbitrary string.
   - Validate with zod (already a dependency). Put the shared schemas in a new `lib/validation.ts`:
     - details: `item` trimmed, 1–200 chars; `description` ≤ 2000 chars, optional/nullable; `priceRange` ≤ 50 chars, optional/nullable.
     - status: `z.enum(['pending', 'will_buy', 'bought'])`.
   - Owner may update **only** details. Non-owners may update **only** status. Return 403 for the other combination and 400 for invalid input.
   - Write only whitelisted fields, and also set `updatedAt: new Date()`.
3. **The surprise isn't hidden.** `README.md` promises "Mark gifts as purchased (hidden from the gift owner)", but owners currently see and can change the status of their own gifts. Enforce it on the server:
   - `GET /api/gifts`: for gifts where `userId === currentUserId`, return `status: null`.
   - `POST /api/gifts`: validate with the details schema and return the created gift with `status: null`.
   - The PATCH rule above already blocks owners from changing their own status.
4. **`app/api/signup/route.ts` and `lib/auth.ts` (credentials `authorize` + Google `signIn` callback):**
   - Normalize email with `trim().toLowerCase()` before the allowlist check, the lookup and the insert.
   - Look up users case-insensitively (`sql\`lower(${users.email}) = ${email}\``) so existing mixed-case rows still match.
   - Enforce password length ≥ 8 on the server, and update the client check in `app/signup/page.tsx` to match.
   - Validate `name` (1–60 chars).
5. Delete the dead file `components/christmas-wishlist.tsx.backup`.

## Phase 2: Runtime and dependency upgrades (commit 2)

Why: Node.js shipped security releases on 2026-10-21 (22.23.4 / 24.22.1 / 26.12.1). `npm audit --omit=dev` on the current lockfile reports 3 critical + 15 high advisories.

- **Next.js 14 is no longer patched.** 14.2.35 (Dec 2025) is the last 14.x release. Its open advisories are fixed only in 15.5.24+ or 16.x. The list includes a critical middleware authorization bypass (fixed in 14.2.25), and this app uses middleware for page auth.
- **next-auth ≤ 5.0.0-beta.31** has critical Auth.js advisories, fixed in beta.32.
- **drizzle-orm < 0.45.2** has a SQL-identifier injection advisory.

Steps:

1. **Pin the Node version** in `package.json`: `"engines": { "node": "24.x" }` (Vercel reads this). Add an `.nvmrc` containing `24`. Bump `@types/node` to `^24`.
2. **Upgrade Next.js to 16 (latest `16.4.x`) and React to 19.** Start with `npx @next/codemod@latest upgrade latest`, then fix by hand:
   - `react`, `react-dom` → `^19`; `@types/react`, `@types/react-dom` → `^19`.
   - Route handler `params` is now a Promise in `app/api/gifts/[id]/route.ts`: `{ params }: { params: Promise<{ id: string }> }`, then `const { id } = await params`.
   - `middleware.ts` is deprecated in Next 16 in favor of `proxy.ts`. Rename it, keeping the same logic and `config.matcher`, and use the Auth.js-documented export for `proxy.ts`. If the Auth.js wrapper misbehaves as a proxy, keep `middleware.ts`; it is still supported. Either way, verify the redirect check listed under Verification.
   - `next lint` is removed in Next 16. Move to ESLint 9 flat config: an `eslint.config.mjs` using `eslint-config-next` (core-web-vitals + typescript), replacing `.eslintrc.json`, with `"lint": "eslint ."`. Use `eslint@^9`, not 10. The codemod `npx @next/codemod@latest next-lint-to-eslint-cli .` can do this.
   - Remove the redundant `'use client'` from `app/page.tsx` (it only renders a client component).
3. `next-auth` → **exactly** `5.0.0-beta.32` (pin; it is a beta). Its peer deps allow Next 16 + React 19.
4. **Database packages:**
   - `drizzle-orm` → `^0.45.4`.
   - `drizzle-kit` → `^0.31.11`. Update `drizzle.config.ts` to the new format: `dialect: 'postgresql'`, `dbCredentials: { url: process.env.DATABASE_URL! }`. Update the scripts `generate:pg` → `drizzle-kit generate` and `push:pg` → `drizzle-kit push`, but do not run them.
   - `@neondatabase/serverless` → `^1.2.0`. In `lib/db/index.ts` and `lib/db/migrate.ts`, remove `neonConfig.fetchConnectionCache` (deprecated; caching is always on) and drop the `as NeonQueryFunction<boolean, boolean>` casts if they no longer type-check.
5. **Other packages:**
   - Upgrade to latest: `lucide-react` (1.x is needed for React 19), every `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwindcss-animate`, `autoprefixer`, `postcss`.
   - Keep `tailwind-merge@^2` (v3 targets Tailwind 4) and `tailwindcss@^3.4.19`.
   - `zod` → `^4`.
6. Remove the unused deps `react-hook-form` and `@hookform/resolvers`.
7. Run `npm install` to regenerate `package-lock.json` (never edit it by hand). Then run `npm audit --omit=dev`. Target: **no critical/high advisories in runtime packages**. Advisories that remain only via Tailwind 3's build-time file watcher (`chokidar` / `braces` / `micromatch`) are acceptable; list them in the PR description.

## Phase 3: Redesign (commits 3+)

### What's wrong today (seen in screenshots at 1280px and 390px)

- The title appears three times on the home page: header "Christmas Wishlist 🎄", page `<h1>` "Family Christmas Wishlist", and the card title again.
- Muddy glassmorphism everywhere: translucent green on green, cards nested 3 levels deep, gradient-clipped text with heavy text-shadow that renders brownish.
- Emoji used as icons (💰 🔗 🎄 ⭐ 🎁) and pulsing/bouncing decorations in corners.
- A global `text-shadow` on `body`.
- The `body::before` "❄ ❄ ❄" text renders as a dotted texture, not snow.
- `background-attachment: fixed` leaves a **white area below the gradient** on long pages.
- **Mobile: the main card overflows the viewport on the right** (nested `p-8`/`p-4` padding plus fixed widths). `overflow-x: hidden` on `body` hides the overflow by clipping the content.
- Nothing shows until you click a family member: no default selection, no empty states, no loading state.
- Status `Select` dropdowns per card. "Bought" cards are a murky brown-red.
- Accessibility: icon-only edit/delete buttons have no `aria-label`. Form `<Label>`s on the wishlist aren't tied to inputs. There is no `prefers-reduced-motion` handling. Delete has no confirmation.

### Design direction: "cozy evening by the tree"

A warm, elegant look rather than a busy one: a deep pine night background, cream paper cards, cranberry for actions, gold for small highlights, and a serif display face for headings. Festive through color, type and a light snowfall, not through emoji.

**Tokens.** Replace the variables in `app/globals.css`. This is a single theme; drop the unused `.dark` block. Values are HSL triplets for the existing shadcn `hsl(var(--x))` setup. Small tweaks are fine as long as text stays WCAG AA (≥ 4.5:1).

| Token | Value | Use |
|---|---|---|
| `--background` | `163 50% 11%` (#0E2A22 pine night) | page background |
| `--foreground` | `40 65% 95%` (cream) | text on the page background |
| `--card` / `--popover` | `40 65% 95%` (#FBF6EC cream) | cards, menus |
| `--card-foreground` / `--popover-foreground` | `30 27% 13%` (#2A2118 ink) | text on cards |
| `--muted` | `38 45% 89%` | subtle fills on cards |
| `--muted-foreground` | `32 15% 36%` (#6B5E4F) | secondary text on cards (≈5.8:1 on cream) |
| `--primary` | `350 65% 42%` (#B3263E cranberry) | primary buttons, selected states |
| `--primary-foreground` | `0 0% 100%` | |
| `--accent` | `39 75% 56%` (#E3A83B gold) | stars, focus ring on dark, highlights |
| `--accent-foreground` | `30 27% 13%` | |
| `--success` (new) | `154 46% 34%` (#2E7D5B evergreen) | "Bought" |
| `--warning` (new) | `38 85% 30%` text on `43 88% 88%` bg | "Claimed" badge |
| `--border` / `--input` | `36 30% 82%` | borders on cards |
| `--ring` | `350 65% 42%` | focus on cards |
| `--radius` | `1rem` | |

Add `success` and `warning` to `tailwind.config.ts` colors.

**Type.** Add **Fraunces** (variable serif) with `next/font/google` as `--font-display` for the app name and headings. Keep Geist Sans (local) for UI text and apply it on `<body>`. Remove the `text-shadow` on `body`.

**Background and motion.**

- Background: put `bg-background` on `<html>`/`<body>` with `min-h-dvh`. Add a soft gold glow at the top, e.g. `radial-gradient(1200px 600px at 50% -10%, hsl(39 75% 56% / .16), transparent 60%)`. Remove `background-attachment: fixed`, `body::before` and `body::after`, and the `.glass*` and `.festive-glow` utilities once nothing references them.
- New `components/snowfall.tsx` (client):
  - About 40 flakes (white, 2–6px, 0.4–0.9 opacity) falling with a slight sway on CSS keyframes, at 8–20s durations, in a `fixed inset-0 pointer-events-none z-0` layer with `aria-hidden`.
  - Use a constant seeded array or render after mount to avoid hydration mismatches.
  - Render nothing under `prefers-reduced-motion: reduce`.
- Add a global reduced-motion rule that disables transitions/animations.
- Remove all `animate-pulse`/`animate-bounce` decorations and `hover:scale-*` on buttons. A subtle `hover:-translate-y-0.5` + shadow on gift cards is fine.

### Layout and components

Split `components/christmas-wishlist.tsx` (434 lines) into `components/wishlist/`:

- `wishlist-app.tsx`: container with data fetching, state and handlers. A small `use-wishlist.ts` hook is fine.
- `family-picker.tsx`
- `gift-card.tsx`
- `gift-status-control.tsx`
- `add-gift-form.tsx`
- `empty-state.tsx`
- `gift-skeleton.tsx`
- `linkified-text.tsx`

Add the shadcn primitives `badge`, `skeleton`, `alert-dialog` (needs `@radix-ui/react-alert-dialog`) and `sonner` (toasts; add the `sonner` package and mount `<Toaster />` in the layout). Delete `components/christmas-wishlist.tsx` when done.

**Header (`components/header.tsx`):**

- Slim sticky bar, `bg-background/80 backdrop-blur`, bottom border `border-white/10`.
- Left: a gold gift icon in a small circle + "Family Wishlist" in Fraunces.
- Right: an initials avatar + first name (name hidden below `sm`) and a ghost "Sign out" button. Below `sm` it's icon-only with `aria-label="Sign out"`.
- No emoji.

**Home (`app/page.tsx` → `<WishlistApp />`):**

- **One `<h1>` only:** "Hi, {firstName}" in Fraunces (text-4xl / md:text-5xl, cream).
  - Subline in muted cream: "**N sleeps until Christmas**". Compute days until the next Dec 25 on the client. On Dec 25 show "Merry Christmas!"
- **Family picker:**
  - A row of chips. Each chip has a deterministic initials avatar (hash the name into ~6 festive hues), the name, and a wish count.
  - The current user's chip comes first, labeled "You".
  - Selected chip: cream background with cranberry ring. Unselected: `bg-white/5` with cream text.
  - Below `md`: a horizontal scroll with snap, no wrapping. At `md` and up: wrap.
  - Buttons use `aria-pressed`.
  - **Default selection is the current user**, so the page is never blank.
- **Section heading:** "Your wishlist" or "{Name}'s wishlist" + count, in Fraunces text-2xl.
- **Own list:**
  - An "Add a wish" cream card at the top. Fields:
    - "What would you like?" (required, `maxLength=200`)
    - "Details or a link" (textarea, optional)
    - "Price range" (optional)
  - Each field gets a proper `<Label htmlFor>`.
  - Cranberry submit button "Add to my list" with a Plus icon. It is disabled while submitting, and Enter in the first field submits.
  - Gift cards in own view show **no status at all**, only Edit / Delete icon buttons with `aria-label`s and tooltips or `title`.
  - Edit: inline form in the card. Save / Cancel; Esc cancels.
  - Delete: a confirmation `AlertDialog` ("Remove '{item}' from your list?").
- **Someone else's list:**
  - Cards sorted Available → Claimed → Bought.
  - Status shown as a 3-option **segmented control** ("Available · I'll get it · Bought", `role="radiogroup"`) replacing the Select.
  - Updates are optimistic, with a rollback + toast on error.
  - Card treatment:
    - Available: plain cream card.
    - Claimed (`will_buy`): 4px gold left border + warning badge "Someone's getting this".
    - Bought: 4px evergreen left border + success badge "Bought", card at ~85% opacity.
- **Gift card content:**
  - Item title: semibold, ink.
  - Description with links via `linkified-text.tsx`. Each link renders as its hostname plus an external-link icon (e.g. `example.com ↗`), with the full URL in `title`. Only `http(s)` URLs become links. Long text wraps (`break-words`).
  - Price as a small muted pill with a lucide `Tag` icon.
  - Layout: one column below `md`, two columns at `md` and up.
- **States:**
  - Loading: 3 skeleton cards.
  - Empty, own list: "Your list is empty — add the first thing you're dreaming of."
  - Empty, others: "{Name} hasn't added any wishes yet."
  - Fetch or mutation errors: toast plus a "Try again" action.
- **Container:** `max-w-5xl mx-auto px-4 sm:px-6`. Cards never nest inside cards. **No horizontal overflow at 360px wide.**

**Login and signup (`app/login/page.tsx`, `app/signup/page.tsx`):**

- Centered `max-w-md` column on the pine background.
- Above the card: the gold gift mark + "Family Wishlist" in Fraunces (cream).
- Cream card with title "Welcome back" / "Join the family list" and a one-line muted subtitle.
- Google button first (outline, full width), then an "or" divider, then the email/password form with a full-width cranberry primary button.
- Error box: `role="alert"`, soft red background on cream.
- Remove the corner emoji, the pulsing icons and the gradient text.
- Keep all existing auth logic.

**Metadata (`app/layout.tsx`):**

- `title: { default: 'Family Christmas Wishlist', template: '%s · Family Wishlist' }`
- `export const viewport = { themeColor: '#0E2A22' }`
- Add `app/icon.svg`: a simple gold gift on pine.
- Apply the font variables plus `font-sans` on `<body>`, and render `<Snowfall />` behind the content.

## Phase 4: Docs

Update `README.md`:

- Tech stack: Next.js 16, React 19, Node 24.
- The new drizzle scripts.
- `AUTH_TRUST_HOST=true` for running `next start` locally.
- Keep the "status hidden from the owner" feature line, which is now true.

---

## Verification (all must pass before opening the PR)

1. `npm ci && npx tsc --noEmit && npm run lint`
2. Build with dummy env (the DB client throws at import without `DATABASE_URL`):
   `DATABASE_URL='postgresql://u:p@localhost:5432/db' NEXTAUTH_SECRET=dummy npm run build`
   This worked on the current code; it must still work.
3. `npm audit --omit=dev`: no critical/high in runtime packages (see Phase 2.7).
4. Start with `DATABASE_URL=… NEXTAUTH_SECRET=dummy AUTH_TRUST_HOST=true npx next start -p 3123`, then:
   - `curl -sI localhost:3123/` → 307 redirect to `/login` (proxy/middleware still protects pages).
   - `curl -s -o /dev/null -w '%{http_code}' localhost:3123/api/users` → `401`.
   - `curl -s -X POST localhost:3123/api/users -H 'content-type: application/json' -d '{"name":"x"}' -o /dev/null -w '%{http_code}'` → `405`.
5. **Visual QA with Playwright.** In a Claude cloud session Chromium is preinstalled; launch with `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` if the default lookup fails. Locally, use any installed Playwright. No database is needed:
   - Forge a session cookie that passes the proxy:
     ```js
     const { encode } = require('next-auth/jwt');
     const token = await encode({ token: { name: 'Andy', sub: '1' }, secret: 'dummy', salt: 'authjs.session-token' });
     ```
     Then add a cookie `authjs.session-token=<token>` for `http://localhost:3123`.
   - Mock with `page.route`:
     - `**/api/auth/session` → `{ user: { id: '1', name: 'Andy', email: 'a@example.com' }, expires: '2099-01-01T00:00:00.000Z' }`. This gives the client a user id, so the own-list view works.
     - `**/api/users` → 3–4 users.
     - `**/api/gifts` → gifts across users covering all three statuses, a long description and a URL.
     - POST/PATCH/DELETE as needed.
   - Screenshot at **390×844 and 1280×900**:
     - login and signup
     - own list (empty, with items, editing, delete dialog)
     - someone else's list (all three statuses)
     - the loading skeleton (delay the mock)
   - Assert `document.documentElement.scrollWidth <= window.innerWidth` on every page and both sizes.
   - Run once with `page.emulateMedia({ reducedMotion: 'reduce' })` and confirm no snow renders.
   - Look at each screenshot and fix anything that looks off before finishing.
6. End-to-end against a real database is not possible without credentials. Say so in the PR. The owner will test sign-in, add/edit/delete, and claiming on the Vercel preview, ideally with two accounts to confirm the owner can't see claim status.

## PR description should include

- A summary per phase.
- The `npm audit` before/after counts.
- The list of accepted build-time-only advisories.
- The verification results.
- A manual test checklist for the preview deployment.
