# Plan: security fixes + dependency upgrade

Repo: `andylow92/christmass`, a family Christmas wishlist. It's a Next.js App Router app with next-auth v5 (Google + email/password), Drizzle ORM on Neon Postgres (`neon-http` driver), Tailwind 3 and shadcn/ui. It's deployed on Vercel. There are no tests.

The visual redesign is a separate plan (`docs/design-plan.md`) for a later session. Don't restyle anything here.

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
   - In the current UI (`components/christmas-wishlist.tsx`), don't render the status `Select` or the status card colors on the user's own gifts. Otherwise owners would see a misleading "Available" once the server returns `status: null`. Keep this change minimal; the redesign replaces the component.
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

1. **Node version:** `"engines": { "node": "24.x" }` is already in `package.json` (PR #12; Vercel reads it). Add an `.nvmrc` containing `24` and bump `@types/node` to `^24`.
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

## Phase 3: Docs

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
5. **UI smoke test with Playwright.** No restyling is expected; this checks that the upgrade didn't break the pages. In a Claude cloud session Chromium is preinstalled; launch with `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` if the default lookup fails. Locally, use any installed Playwright. No database is needed:
   - Forge a session cookie that passes the proxy:
     ```js
     const { encode } = require('next-auth/jwt');
     const token = await encode({ token: { name: 'Andy', sub: '1' }, secret: 'dummy', salt: 'authjs.session-token' });
     ```
     Then add a cookie `authjs.session-token=<token>` for `http://localhost:3123`.
   - Mock with `page.route`:
     - `**/api/auth/session` → `{ user: { id: '1', name: 'Andy', email: 'a@example.com' }, expires: '2099-01-01T00:00:00.000Z' }`. This gives the client a user id, so the own-list view works.
     - `**/api/users` → 3–4 users.
     - `**/api/gifts` → gifts across users covering all three statuses; the current user's gifts have `status: null`.
   - Check at 390×844 and 1280×900:
     - The sign-in and sign-up pages render.
     - Your own list shows the add form and no status controls.
     - Someone else's list shows the status controls.
   - No browser console errors.
6. End-to-end against a real database is not possible without credentials. Say so in the PR. The owner will test sign-in, add/edit/delete, and claiming on the Vercel preview, ideally with two accounts to confirm the owner can't see claim status.

## PR description should include

- A summary per phase.
- The `npm audit` before/after counts.
- The list of accepted build-time-only advisories.
- The verification results.
- A manual test checklist for the preview deployment.
