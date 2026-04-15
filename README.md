# FBB Breakout

A small browser-based Breakout clone built for the FBB Vibe Coder hiring exercise. See [`assignment-BRD.md`](assignment-BRD.md) for the original requirements.

- **Live URL:** <https://fbb-breakout.vercel.app>
- **Stack:** TypeScript + Vite + HTML Canvas
- **Hosting:** Vercel (static site + edge function)
- **Global scores:** Vercel KV (Upstash Redis) sorted set, read/written by `api/scores.ts`
- **Day 2 collaborator:** Trice

## How to Play

- Move the paddle with your **mouse** or the **arrow keys** (`A` / `D` also work).
- Click the board or press **Space** to launch the ball.
- You have **3 lives**. Clear every brick to win.
- The ball speeds up slightly with every brick you break.
- On game over you can submit a **3-character initials** score to the global leaderboard.

## Local Setup

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Vite serves the game on <http://localhost:5173>. The global leaderboard requires Vercel KV credentials (see below); without them `/api/scores` returns an empty list and the UI falls back to local-only high scores — the rest of the game works normally.

### Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run `tsc --noEmit` |

### Running the leaderboard locally (optional)

The serverless function in `api/scores.ts` runs on the Vercel edge runtime, so testing it locally is easiest with the Vercel CLI:

```bash
npm i -g vercel
vercel link         # link this directory to your Vercel project
vercel env pull     # pulls KV_REST_API_URL / KV_REST_API_TOKEN into .env
vercel dev
```

`vercel dev` serves both the Vite frontend and `/api/scores` together.

## Project Layout

```
api/scores.ts          # Edge function: GET/POST global leaderboard (Vercel KV)
index.html             # Page shell and canvas
src/main.ts            # Boot, wires game engine to HUD and score modules
src/game/engine.ts     # Game loop, state machine, input handling
src/game/entities.ts   # Paddle / ball / brick factories and constants
src/game/collisions.ts # Ball ↔ wall / paddle / brick collision logic
src/scores/local.ts    # localStorage high score + saved initials
src/scores/remote.ts   # fetch wrappers for /api/scores
src/ui/hud.ts          # DOM refs and HUD / overlay / leaderboard rendering
src/styles.css         # Minimal dark UI
```

## Contributing

This repo uses a standard branch + PR workflow. Vercel will build a preview URL for every pull request — please paste that link in the PR description so reviewers can play-test.

1. Fork (or branch if you have push access) and clone the repo.
2. Create a feature branch: `git checkout -b your-feature`.
3. Make your changes. Keep commits small and focused.
4. Run `npm run typecheck && npm run build` before pushing.
5. Push and open a pull request against `main`.
6. Wait for review. One maintainer approval is required to merge.

### Guidelines

- Keep the code simple and framework-free — no new runtime dependencies without a clear reason.
- Do not commit real secrets. `.env.example` documents the only environment variables the project uses.
- Please describe gameplay-affecting changes with a short "how to test" section in the PR.

## License

Unlicensed / private — built for the FBB hiring exercise.
