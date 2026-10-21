# Design plan: a modern, beautiful Family Wishlist

Repo: `andylow92/christmass`, a family Christmas wishlist. It's a Next.js App Router app with Tailwind 3, shadcn/ui and next-auth, deployed on Vercel. This plan is **visual and UX only**: make the site feel modern, calm and delightful, and easy for every family member to use, grandparents included.

**The source of truth is the mockup: [`docs/design/mockup.html`](design/mockup.html).** It's a self-contained HTML/CSS/JS page showing every token, component, state and interaction in this plan. Rebuild it in the real app, then compare screenshots of the app against screenshots of the mockup until they match. Where this document and the mockup disagree, the mockup wins, except for the accessibility rules below.

- Mockup views: `?view=me` (your list), `?view=2` (someone else's list), `?view=4` (an empty list), `?view=login`. Add `&theme=light` or `&theme=dark`, and add `&shot` to hide the floating "Mockup" bar, which is not part of the design.
- The mockup loads Geist and Instrument Serif from Google Fonts. In a Claude cloud session, launch Playwright's Chromium with `proxy: { server: process.env.HTTPS_PROXY }` so the fonts load. The proxy's certificate is already trusted by the browser. Without the proxy, the screenshots fall back to system fonts and are useless for comparison.

## Before you start

- **Ordering:** this is meant to run after the security/upgrade PR from `docs/upgrade-plan.md` is merged, so it builds on Next.js 16 and React 19. Check `package.json` on `main`. If `next` is still 14.x, ask the user whether to wait or go ahead. The design works on either version, but whichever PR merges second must merge `main` in and regenerate `package-lock.json` with npm (never by hand).
- Branch from the latest `main` and open a PR against `main` when done. Vercel builds a preview for the user to try.

## Hard constraints

- **Don't touch the API, the database or auth logic.** Out of scope: `app/api/**`, `lib/db/**`, `lib/auth.ts`, `middleware.ts`/`proxy.ts`. Keep every `fetch` call, request body and sign-in flow working exactly as now. Only presentation and client-side UX change.
- **Never show claim status on the user's own gifts**, whatever the API returns. The surprise must stay hidden (`README.md` promises it).
- Keep Tailwind on v3 and shadcn/ui. Only these new dependencies are allowed: `next-themes`, `sonner`, and `@radix-ui/react-alert-dialog` (via the shadcn `alert-dialog` component). Use the existing `lucide-react` for icons.
- No emoji used as icons or decoration.
- Don't commit `docs/` files from this plan or the mockup unless asked.

---

## 1. Design direction

**"Modern Nordic Christmas."** Warm porcelain backgrounds, crisp white cards, deep pine green, and small touches of gold and berry. An elegant serif for headlines next to a clean sans for everything else. Festive through color, type, ornaments and a little snow in one place, not through clutter. A light theme by default, plus a full dark theme that follows the system and can be toggled.

Principles:
1. **Calm over busy.** One hero moment per page and generous whitespace. Cards never nest inside cards.
2. **Readable for everyone.** 16px base text, high contrast (WCAG AA everywhere), 44px tap targets, plain-language labels.
3. **Obvious actions.** Every card has one clear primary action ("I'll get this"). No dropdowns for status.
4. **Delight in small doses.** Swaying ornaments, a light snowfall in the hero only, a sparkle burst and a friendly toast when you claim a gift. All of it is switched off under `prefers-reduced-motion`.

## 2. Design tokens

Copy these from the mockup's `:root` and `[data-theme="dark"]` blocks. In the app, dark mode uses the `.dark` class on `<html>` (Tailwind `darkMode: ["class"]` is already configured), not `data-theme`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F7F4EE` | `#0C1512` | page background |
| `bg-glow-a` / `bg-glow-b` | `#EFE5D1` / `#E2EDE6` | gold / green at ~10% alpha | two radial glows on the page background (see the mockup `body`) |
| `surface` | `#FFFFFF` | `#131F1B` | cards, inputs |
| `surface-2` / `surface-3` | `#F3EEE5` / `#EAE3D7` | `#1A2924` / `#22342D` | soft fills, hover |
| `ink` / `ink-2` / `ink-3` | `#1C1B19` / `#5C5850` / `#77726A` | `#F1EDE5` / `#AEB8B2` / `#849089` | text: primary, secondary, tertiary |
| `line` / `line-strong` | `#E7E1D6` / `#D8CFC0` | `#22322C` / `#2F433A` | borders |
| `pine` / `pine-hover` / `pine-ink` | `#1D5A44` / `#174A38` / `#FFFFFF` | `#6CC79D` / `#84D3AE` / `#0C1512` | primary buttons |
| `pine-soft` / `pine-text` | `#E2EEE7` / `#1D5A44` | green 14% / `#8FD6B4` | "Bought" pill, hints |
| `gold-soft` / `gold-text` / `gold-line` | `#F7EDD8` / `#7A5410` / `#EAD7AE` | gold 13% / `#EBC77C` / gold 30% | "Someone's on it" pill, claimed border |
| `berry` / `berry-soft` / `berry-text` | `#B42840` / `#FBE7EA` / `#9A1F35` | `#F0778B` / berry 13% / `#F49AAA` | destructive, errors |
| `hero-1` / `hero-2` / `hero-ink` / `hero-ink-2` | `#0F3B2E` / `#17533F` / `#F6F1E7` / `#C9D8CF` | `#134034` / `#0D2A21` / same / `#B9CCC2` | hero card and auth art panel |
| tones `t0`…`t5` | see mockup | see mockup | avatar and tile tints (green, berry, gold, violet, blue, cocoa) |

- **Wire tokens into shadcn** so existing primitives pick them up. Rewrite the `:root` and `.dark` variables in `app/globals.css`:
  - `--background`=bg, `--foreground`=ink
  - `--card`/`--popover`=surface, `--card-foreground`/`--popover-foreground`=ink
  - `--primary`=pine, `--primary-foreground`=pine-ink
  - `--secondary`/`--muted`/`--accent`=surface-2, `--secondary-foreground`/`--accent-foreground`=ink, `--muted-foreground`=ink-2
  - `--destructive`=berry, `--border`/`--input`=line, `--ring`=pine
- Keep the HSL-triplet format the config already uses for solid colors. Expose the extra tokens (`surface-3`, `ink-3`, `line-strong`, the `*-soft`/`*-text` tints, `hero-*`, tones) in `tailwind.config.ts`. Translucent dark-mode tints can be full color values used without opacity modifiers.
- **Radius:** 28px hero, 20px cards, 12px inputs, 999px buttons, pills and chips. **Shadows:** `shadow-sm`, `shadow`, `shadow-lg` exactly as in the mockup. **Focus ring:** `0 0 0 3px` pine at ~28% alpha. **Easing:** `cubic-bezier(.2,.8,.2,1)`.
- Text contrast was checked against AA. Keep it that way if you adjust anything: `ink-3` must stay ≥ 4.5:1 on `surface`.

## 3. Typography

- **Display:** Instrument Serif via `next/font/google` (`Instrument_Serif`, weight `400`, styles `normal` + `italic`, variable `--font-display`). Use it for the brand name, hero and page headlines, section titles, the empty-state title and dialog titles. Italic carries the accent word: "Family *Wishlist*", "Good evening, *Andy*", "Wishes, *shared.*"
- **UI:** keep the local Geist Sans (`--font-geist-sans`) for everything else. Drop Geist Mono if nothing uses it.
- **Scale:**
  - hero h1 `clamp(40px, 7vw, 64px)` / 1.02
  - auth h1 `clamp(44px, 6.5vw, 76px)` / .98
  - section h2 `clamp(30px, 4.4vw, 40px)`
  - card title 18px/600
  - body 16px/1.55
  - secondary 15px
  - pills and chips 13px
- Remove the global `text-shadow` on `body`.

## 4. Layout and components

Content width is `max-w-[1040px]` with a 20px gutter (28px from 640px up). Breakpoints in the mockup: 520, 560, 640, 760 (cards go to 2 columns, the family row wraps), and 960 (auth goes split-screen).

Suggested files (replace `components/christmas-wishlist.tsx` and delete it, plus `components/christmas-wishlist.tsx.backup` if it still exists):

```
components/
  theme-provider.tsx        next-themes (attribute="class", defaultTheme="system", enableSystem)
  theme-toggle.tsx          Moon / Sun icon button
  header.tsx                rewrite
  brand.tsx                 gift mark + "Family Wishlist" wordmark (shared with auth pages)
  snow.tsx                  seeded snow layer (used by hero and auth art)
  ui/                       add alert-dialog, skeleton, sonner (shadcn); restyle button/input/label/textarea to the tokens
  wishlist/
    wishlist-app.tsx        data fetching, state, handlers (all the current fetch logic moves here unchanged)
    hero.tsx                greeting, countdown, ornaments
    family-picker.tsx
    list-header.tsx
    composer.tsx            "Add a wish"
    gift-card.tsx           own + others variants, inline edit form
    gift-grid-skeleton.tsx
    empty-state.tsx
    sparkle-burst.ts        tiny DOM helper, honors reduced motion
    utils.ts                splitLinks(), hostname(), tone(), initials(), daysToChristmas(), formatAdded()
```

### Header (`components/header.tsx`)
- Sticky, 64px tall. Background is `bg` at 78% with `backdrop-blur`, plus a hairline bottom border.
- Left: brand mark (34px rounded square, pine gradient, gold gift icon) and the wordmark (Instrument Serif 24px, "Wishlist" italic in `pine-text`).
- Right: theme toggle, an avatar with the first name (name hidden below 560px), and a ghost "Sign out" button with the LogOut icon. Below 560px it's icon-only with `aria-label="Sign out"`.

### Hero (`wishlist/hero.tsx`)
- Rounded 28px card with the pine gradient and two radial glows (gold top-right, green bottom-left) and `shadow-lg`. Padding is 40/28px, and 56/48px from 760px up.
- Eyebrow: Sparkles icon + "CHRISTMAS {year}" in gold, uppercase, tracked.
- h1: "Good {morning|afternoon|evening}, *{first name}*", with the name in italic gold.
- Subline: "**{n} sleeps** until Christmas · {total} wishes across the family". On Dec 25 show "**Merry Christmas!**" instead, and use "1 sleep" for the singular.
- **Hydration:** greeting and countdown depend on the viewer's local clock. Compute them on the client after mount (e.g. state set in `useEffect`) so server and client HTML don't mismatch.
- Ornaments: copy the inline SVG from the mockup, with three baubles in berry, gold and cream on strings, each swaying gently. They sit at the top-right (240px wide; 170px below 760px; 112px below 560px) and must never overlap the text.
- Snow: about 36 flakes inside the hero only, seeded (a fixed PRNG like the mockup's `makeSnow`) so layout is stable, `aria-hidden`, and not rendered under reduced motion.

### Family picker (`wishlist/family-picker.tsx`)
- Pill buttons, 48px tall: avatar (initials, tone hashed from the name), name, and a count badge. The current user comes first, labeled "You".
- **Selected pill:** `ink` background with `bg` text. Its avatar inverts to `bg`/`ink` (this keeps contrast in dark mode).
- Use `aria-pressed` and a group label "Choose whose wishlist to see".
- Below 760px: a horizontal scroll that bleeds to the screen edges, with scroll-snap and a fade mask on the right edge so it's obvious the row scrolls. From 760px up: wrap.
- **Default selection: the current user.** The page is never blank.

### List header (`wishlist/list-header.tsx`)
- Title: "Your wishlist" or "{First name}'s wishlist" in serif. Right-aligned count: "3 wishes" / "1 wish".
- Hint line:
  - own list: EyeOff icon, "Claims are hidden from you. No spoilers."
  - others: Sparkles icon, "Claim a gift so nobody doubles up. {Name} won't see it."

### Composer (`wishlist/composer.tsx`, own list only)
- One white card with:
  - a gold tile with a Plus icon
  - a borderless 17px input "Add something you'd love…" (`maxLength` 200, with a visually hidden label)
  - a primary "Add wish" button, icon-only below 520px with `aria-label`
- On focus, smoothly expand a second row with "Details or a link (optional)" (textarea) and "Price range" (input, `maxLength` 50). Use the `grid-template-rows: 0fr → 1fr` trick.
- Enter submits. Disable the button while saving. On success, clear the fields, keep focus in the input for quick entry, and show the toast "Added **{item}** to your list".

### Gift card (`wishlist/gift-card.tsx`)
- White card, 20px radius, 20px padding, `shadow`. It lifts 2px on hover (only under `@media (hover: hover)`).
- **Top:** a 44px tile with a Gift icon (tone hashed from the item name), the title (18px/600), then the description.
- **Links:** pull URLs out of the description (`https?://\S+`, http/https only) and show each as a **link chip**: ArrowUpRight icon + hostname without `www.`, `target="_blank" rel="noopener noreferrer"`, full URL in `title`. The remaining text is the description. The price shows as a chip with a Tag icon.
- **Footer** (dashed top border):
  - **Own gift:** "Added {Oct 12 | today | yesterday}" from `createdAt`, plus Edit (Pencil) and Remove (Trash2) icon buttons with `aria-label`s and `title`s. **No status, ever.**
  - **Someone else's gift:**
    - `pending`: pill "Available" + primary sm button "I'll get this" (Gift icon).
    - `will_buy`: gold pill "Someone's on it" (ShoppingBag icon) + soft sm button "Mark as bought" (Check) + an Undo icon button (Undo2). The card border turns `gold-line` and the tile goes gold.
    - `bought`: pine pill "Bought" (Check) + ghost "Undo". The card fades into the background (muted surface, smaller shadow, muted title). The tile shows a Check on green.
  - Others' cards sort Available → Someone's on it → Bought.
- **Status actions** send exactly what the current UI sends (`PATCH /api/gifts/{id}` with `{ status }`): claim = `will_buy`, mark bought = `bought`, undo = `pending`.
  - Update optimistically. On failure, roll back and toast "Couldn't update that. Please try again."
  - On claim: sparkle burst from the button (14 small squares in gold/berry/pine radiating out, 700ms) and the toast "You're getting the **{item}**. {Name} won't see it."
  - On bought: toast "Marked as bought. Nice one!"
- **Edit:** the card swaps to an inline form (Gift / Details or a link / Price range) with Cancel (ghost) and Save (primary, Check icon). Focus the first field, and Esc cancels.
- **Remove:** a shadcn `AlertDialog` styled like the mockup's dialog. Title (serif 28px) `Remove "{item}"?`, body "It will disappear from your list for everyone.", buttons "Keep it" (ghost) and "Remove" (berry).
- **Entry animation:** cards rise in (8px, fade, 500ms), staggered 50ms. Do this only on first load and when switching person, not on every state change.

### States
- **Empty** (`empty-state.tsx`): dashed `line-strong` border, the gift-box SVG from the mockup, a serif title and one line of help text.
  - own list: "Your list is empty" / "Add the first thing you're dreaming of. Your family will see it right away."
  - others: "{Name} hasn't added any wishes yet" / "Check back soon. New wishes show up here as soon as they are added."
- **Loading** (`gift-grid-skeleton.tsx`, not in the mockup): skeleton person pills and 4 skeleton cards in the same 2-column grid. Each card has a tile block, a 60% title bar, two text lines and two chip blocks. Use a soft `surface-2` pulse, with no animation under reduced motion.
- **Error:** an inline card "We couldn't load the wishlists." with a "Try again" button that refetches.

### Toasts
Use `sonner`, mounted once in the layout and styled like the mockup:
- `ink` background and `bg` text, 16px radius, `shadow-lg`
- a 34px icon tile with a gold Sparkles icon
- bottom-right on desktop, bottom-center on mobile
- auto-dismiss after ~3s

### Sign in and sign up (`app/login/page.tsx`, `app/signup/page.tsx`)
Keep all the existing auth logic and only change the markup and styles.
- **From 960px up, a split screen:**
  - Left: the art panel (pine gradient, glows, snow, brand) with the headline "Wishes, *shared.*" and the line "One list for the whole family. See what everyone's hoping for, quietly claim a gift, and never buy the same socks twice."
  - Two decorative frosted "gift cards" float at the bottom, slightly rotated and `aria-hidden`.
  - Right: the form, max 400px wide.
- **Below 960px:** the art panel becomes a top band with brand, headline and copy, and the form follows.
- **Sign in:**
  - "Welcome back" (serif 40px) and "Sign in to see what everyone's wishing for."
  - "Continue with Google" (soft button with the existing Google logo SVG), then a divider "or sign in with email".
  - Email and Password fields (placeholder "Your password"), then a full-width primary "Sign in".
  - Footer: "New here? Create an account".
- **Sign up:**
  - "Join the family list" and "Create your account to start sharing wishes."
  - Google button "Sign up with Google", then fields Name, Email, Password, Confirm password, and "Create account".
  - Footer: "Already have an account? Sign in".
  - Password hint text must match the current client validation rule. Read it from the code; don't change it.
- **Errors:** `role="alert"` box with `berry-soft` background, `berry-text` text and 12px radius.
- **Loading:** the button is disabled and shows a small spinner + "Signing in…" / "Creating your account…".
- Theme toggle in the top-right corner.

### Global
- `app/layout.tsx`:
  - Wrap in `ThemeProvider` and add `suppressHydrationWarning` on `<html>`.
  - Apply the font variables and `font-sans`, and mount `<Toaster />`.
  - Metadata: `title: { default: 'Family Wishlist', template: '%s · Family Wishlist' }`.
  - `viewport.themeColor`: `[{ media: '(prefers-color-scheme: light)', color: '#F7F4EE' }, { media: '(prefers-color-scheme: dark)', color: '#0C1512' }]`.
  - The `// keep this exactly as you have it` comment is stale; remove it.
- `app/icon.svg`: the brand mark (gold gift on a pine rounded square).
- `app/page.tsx`: render `<WishlistApp />`. Only one `<h1>` per page.
- `app/globals.css`:
  - Delete the old theme (`body` gradient, `body::before`/`::after` snow text, `text-shadow`, `.glass*`, `.festive-glow`, and the unused keyframes).
  - Add the page background glows, the reduced-motion rule (`*, *::before, *::after { animation: none !important; transition: none !important; }`), and the keyframes you need (`rise`, `sway`, `fall`, `burst`).
  - Add `[hidden] { display: none !important; }` so classes with `display` never override `hidden`. This bug showed up in the mockup.

## 5. Accessibility checklist

- Text contrast ≥ 4.5:1 in both themes (the tokens were checked; re-check anything you change).
- Every interactive element has a visible focus style: the 3px pine ring on `:focus-visible`.
- Tap targets ≥ 44px. Icon buttons may be 40px visually but need a 44px hit area on touch.
- Every icon-only button has an `aria-label`. All inputs have `<label htmlFor>`, visually hidden where the design has none.
- The family pills use `aria-pressed`, toasts announce politely, and the dialog traps focus (Radix does this).
- `prefers-reduced-motion: reduce` turns off snow, sway, rise, burst and transitions.
- No horizontal scrolling at 360px wide on any page.

---

## 6. Verification (all must pass before opening the PR)

1. `npm ci && npx tsc --noEmit && npm run lint`
2. `DATABASE_URL='postgresql://u:p@localhost:5432/db' NEXTAUTH_SECRET=dummy npm run build`. The DB client throws at import without `DATABASE_URL`, so the placeholder is needed.
3. Start with `DATABASE_URL=… NEXTAUTH_SECRET=dummy AUTH_TRUST_HOST=true npx next start -p 3123`, then confirm `curl -sI localhost:3123/` still redirects (307) to `/login`.
4. **Pixel comparison with the mockup.** With Playwright (Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` in Claude cloud sessions; use the proxy setting above), take matching screenshots of the mockup and the app at **390×844 and 1280×900**, in **light and dark**:
   - Mockup: `file://…/docs/design/mockup.html?shot&view=<me|2|4|login>&theme=<light|dark>`.
   - App, without a database:
     - Forge a session cookie so the page loads:
       ```js
       const { encode } = require('next-auth/jwt');
       const token = await encode({ token: { name: 'Andy', sub: '1' }, secret: 'dummy', salt: 'authjs.session-token' });
       // cookie: authjs.session-token=<token> for http://localhost:3123
       ```
     - Mock with `page.route`:
       - `**/api/auth/session` → `{ user: { id: '1', name: 'Andy', email: 'a@example.com' }, expires: '2099-01-01T00:00:00.000Z' }`
       - `**/api/users` and `**/api/gifts` → the same people and gifts as the mockup's `users`/`gifts` arrays. Own gifts get `status: null`. Add a `createdAt`.
       - Stub POST/PATCH/DELETE.
     - Set the theme with `page.emulateMedia({ colorScheme })`.
   - Compare each pair side by side and iterate until the only differences are intentional. Also capture states the mockup only shows interactively: composer expanded, inline edit, delete dialog, a toast after claiming, the loading skeleton (delay the mock), and the sign-up page.
5. On every page, at both sizes: `document.documentElement.scrollWidth <= window.innerWidth`, and no console errors.
6. Run once with `page.emulateMedia({ reducedMotion: 'reduce' })` and confirm no snow or animation.
7. Keyboard pass: Tab through the home page and the sign-in page. Focus is always visible and in a sensible order, Enter and Space activate, and Esc closes the dialog and cancels edits.
8. End-to-end with a real database isn't possible here. Say so in the PR; the user will try the Vercel preview.

## PR description should include

- What changed, grouped as foundations (tokens, fonts, theme), home, sign-in/sign-up, and cleanup.
- Any intentional differences from the mockup, and why.
- The verification results.
- A short checklist for the user to try on the preview:
  - sign in with Google and with email
  - switch people
  - add, edit and remove a wish
  - claim, mark bought and undo on someone else's list
  - toggle dark mode
  - check on a phone
