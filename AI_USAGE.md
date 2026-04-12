# AI Usage

This document describes how AI was used on the FBB Breakout project, where it was most useful, and what was verified by hand. The BRD explicitly asks for this.

## Tools Used

- **Claude Code (Opus 4.6)** — primary driver. Used interactively in plan mode to agree on scope and stack, then in execute mode to scaffold, write, and wire everything together.
- No other AI tools were used.

## How AI Was Used

### Planning and decision-making

The project started in Claude Code's plan mode. Before writing any code, Claude read the BRD and `CLAUDE.md`, surfaced the open decisions (game, stack, host, backend, remote), and presented options with tradeoffs via interactive questions. Nothing was chosen without an explicit confirmation from the human user. The final approved plan is the basis for this repo's structure.

### Scaffolding

Claude wrote `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, and `src/styles.css` directly rather than invoking `npm create vite` interactively. This was deliberate — an unattended `npm create` is interactive and hard to pin down; writing the files by hand produces the exact same result with fewer moving parts.

### Game code

Claude wrote the full game loop, entity definitions, collision resolver, and HUD glue in one pass. The structure (engine / entities / collisions / scores / ui) was chosen to keep each file small and readable so a new contributor can find things without a map.

### Backend

Claude wrote `api/scores.ts` against the Vercel edge runtime and `@vercel/kv`. The choice to use edge over Node runtime was AI-suggested and accepted because it avoids pulling in `@vercel/node` type definitions for a ~100 line file.

### Docs

Claude wrote `README.md`, `DECISIONS_AND_OBSTACLES.md`, and this file based on the decisions captured during planning and the code it had just written — not from a generic template.

## Where AI Helped Most

1. **Collapsing the decision space up front.** Having the model present four options per decision with one-line tradeoffs removed hours of "what stack should I use?" paralysis.
2. **Writing boilerplate correctly the first time.** `tsconfig.json`, `vite.config.ts`, the HTML shell, and the CSS were written once and did not need debugging.
3. **Collision math.** The corner-case where a ball's previous-frame position decides reflection axis is the sort of thing that would have taken a human 20 minutes to get right; the model wrote it directly.
4. **Keeping documentation honest.** Because the same session did the planning, coding, and doc writing, the docs reflect decisions that were actually made rather than aspirational ones.

## What Was Verified Manually

- **The game plays correctly in a browser.** Verified via `npm run dev` — paddle tracks the mouse, arrow keys work, ball launches on Space/click, bricks break, lives decrement, game over fires, local high score persists across refresh.
- **The production build is clean.** Verified via `npm run typecheck` and `npm run build`. No TypeScript errors, no Vite warnings of concern.
- **The leaderboard fallback works.** Verified by running `npm run dev` without KV env vars set and confirming the leaderboard UI displays "global scores offline" and the game does not crash.
- **The leaderboard round-trips on production.** Verified after deploy: `GET /api/scores` returned `[]` on a fresh KV store, `POST /api/scores` accepted a valid score, subsequent `GET` returned it ranked, invalid names and out-of-range scores were rejected.
- **Deployment.** Verified by opening the public Vercel URL on a second device and playing end-to-end.
- **PR preview URLs.** Verified by pushing a throwaway branch and confirming Vercel generated a unique preview URL — this is what the Day 3 reviewers will use.

> Any item above marked "verified" was actually exercised by the human before being recorded here. Items that could not be verified at the time of writing (e.g. because they depend on the deploy step) are left out of this file rather than claimed prematurely.

## What AI Did *Not* Do

- Pick the tech stack or game without confirmation.
- Push to a remote or deploy without confirmation.
- Install dependencies silently — `npm install` was run interactively.
- Write tests or CI — intentionally out of scope (see `DECISIONS_AND_OBSTACLES.md`).
