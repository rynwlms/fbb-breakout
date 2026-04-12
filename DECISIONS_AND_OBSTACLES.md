# Decisions and Obstacles

A running log of scope, technical choices, and friction encountered while building FBB Breakout. Written as decisions were made, not retroactively.

## Scope

**In scope (Day 1):**

- A single-level Breakout game playable on desktop in a modern browser
- Paddle with mouse and keyboard input
- Local high score that persists across refreshes via `localStorage`
- Global top-10 leaderboard with 3-character initials
- Public deployment on Vercel with preview URLs for PRs (needed for Day 3 review flow)
- README, this file, and `AI_USAGE.md` as required deliverables

**Explicitly out of scope:**

- Multiple levels, power-ups, audio, sprites, particle effects
- Mobile / touch controls (desktop-first; may add later if cheap)
- User accounts / auth
- Automated tests (manual verification is enough at this scope — see tradeoffs below)
- Anti-cheat beyond basic server-side input validation

## Key Decisions

### 1. Game: Breakout

Snake, Flappy, and 2048 were also considered. Breakout won because:

- The mechanics are universally legible — evaluators won't need instructions.
- It gives a natural spread of code: game loop, entity collisions, state machine, HUD, persistence — enough surface area to demonstrate judgment without spilling into "real game" territory.
- It has a clear scoring mechanic that makes a global leaderboard meaningful.

### 2. Stack: Vanilla TypeScript + Vite + Canvas

No framework, no game engine. The BRD says "keep it simple" and "pragmatism beats ambition." A brick-breaker is a few hundred lines of plain code; React/Phaser/PixiJS would be dead weight. TypeScript gives guardrails at near-zero cost, Vite is the zero-config dev/build tool that pairs with it, and the HTML Canvas API is purpose-built for this kind of rendering.

### 3. Host: Vercel

Alternatives were Netlify, Cloudflare Pages, and GitHub Pages. Vercel was chosen for two concrete reasons:

1. **Serverless functions in the same deploy unit.** The global leaderboard needs a tiny backend and Vercel gives that for free with no separate host.
2. **Preview URLs per pull request.** Day 3 of the exercise is a PR review cycle. Being able to hand a reviewer a playable URL for each PR branch is directly valuable.

GitHub Pages was ruled out because it is static-only. Netlify was close on both features but adds a second vendor when Vercel KV keeps hosting + storage under one roof.

### 4. Global scores: Vercel KV (Upstash Redis)

The leaderboard is a sorted list of (name, score) pairs — Redis' native sorted set (`ZADD` / `ZRANGE`) is a one-line fit. Supabase/Postgres would have been overkill; Firebase would have added a Google SDK and client-side writes. Vercel KV is accessed only from the edge function, so no secrets ever reach the browser.

### 5. 3-character initials, not free-form names

Keeps the leaderboard readable, avoids the need for a moderation story, and matches the tone of an arcade game. The server rejects anything outside `^[A-Z0-9]{1,3}$`.

### 6. Edge runtime for `api/scores.ts`

Using `export const config = { runtime: "edge" }` lets the function use standard `Request` / `Response` objects with no extra type dependency (`@vercel/node` not needed). `@vercel/kv` works on both runtimes via REST, so there is no downside.

### 7. Graceful fallback when KV is not configured

If `KV_REST_API_URL` / `KV_REST_API_TOKEN` are missing, the endpoint returns `{ entries: [], enabled: false }` and the UI shows a message saying global scores are offline, while still tracking a local high score. This means:

- Local development works without credentials.
- A first-time deploy still works before someone clicks "link KV database" in the Vercel dashboard.
- There is no scenario where missing env vars crash the page.

## Obstacles and Friction

_To be updated as they occur during deployment and testing._

- **Canvas sizing vs. logical coordinates.** The canvas has a fixed 800×600 internal resolution and is scaled in CSS via `aspect-ratio: 4 / 3`. The game does all physics in logical coordinates and the draw step applies a scale transform — this keeps gameplay identical regardless of viewport while avoiding the mess of responsive physics.
- **Collision tunnelling.** At high ball speeds a naive AABB check can fall through brick corners or pick the wrong reflection axis. The brick collision resolver in `src/game/collisions.ts` reconstructs the previous frame position to decide whether the ball came in horizontally or vertically, which is good enough for this speed range without resorting to continuous collision detection.

## Tradeoffs

- **No tests.** At this scope, shipping the game, deploying it, and verifying it manually is a better use of time than writing Jest/Vitest. The BRD explicitly values shipping over polish. If this game grew (levels, power-ups, online play), the collision and state-machine code would be the first thing to test.
- **One level, one layout.** A brick layout generator would be trivial but adds content, not judgment. Keeping one level means the eval team can see the whole product in under a minute.
- **Sticky-paddle launch only.** No "ball falls from the top" launch sequence — the ball sits on the paddle until the player presses Space or clicks. Simpler to implement and explain.
- **Top 100 cap.** The Redis sorted set is trimmed to the top 100 entries on every write to bound storage cost. The visible leaderboard is only top 10 anyway.
