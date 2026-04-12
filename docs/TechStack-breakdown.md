## Tech Stack Breakdown

Five layers, no overlap, nothing missing.

---

### 1. Language: TypeScript

**What it is:** JavaScript with type safety — you write code that the browser can run, but with guardrails that catch bugs before they happen.

**Why this vs. alternatives:**
- *vs. plain JavaScript:* TypeScript catches typos and wrong data shapes at build time instead of at runtime in front of a user. Zero cost at deploy — it compiles down to JavaScript anyway.
- *vs. Python/other backend languages:* The game runs in the browser. The browser speaks JavaScript. TypeScript is the thinnest possible layer on top of that.
- *vs. a game-specific language (C#/Unity, GDScript/Godot):* Those require plugins or exports to run in a browser. Overkill for a brick-breaker. The BRD says keep it simple.

---

### 2. Build Tool: Vite

**What it is:** The thing that takes your TypeScript source files and turns them into a optimized bundle the browser can load. Also runs a local dev server with hot reload so you see changes instantly.

**Why this vs. alternatives:**
- *vs. Webpack:* Webpack is powerful but complex to configure. Vite works out of the box with zero config for a vanilla TS project. Faster startup, simpler setup.
- *vs. no build tool (just a script tag):* You'd lose TypeScript compilation, module imports, and production optimization (minification, tree-shaking). Vite gives you all of that for free.
- *vs. Parcel:* Similar simplicity, but Vite has become the industry default. Better ecosystem, better Vercel integration.

---

### 3. Rendering: HTML Canvas API (browser-native)

**What it is:** A built-in browser drawing surface. You draw shapes, text, and images frame-by-frame — like a digital whiteboard that redraws 60 times per second.

**Why this vs. alternatives:**
- *vs. Phaser/PixiJS (game frameworks):* Those are full game engines with physics, sprite systems, scene managers. Massive overkill for a paddle-and-ball game. They'd add hundreds of KB of dependencies and complexity the BRD explicitly says to avoid.
- *vs. DOM elements + CSS:* You *can* make a game by moving HTML divs around, but it's slower, harder to control precisely, and not how games are built. Canvas is purpose-built for this.
- *vs. WebGL:* That's for 3D or GPU-intensive 2D. A brick-breaker doesn't need it. Canvas 2D is simpler and sufficient.

---

### 4. Hosting & Deployment: Vercel

**What it is:** A cloud platform that takes your code from GitHub, builds it, and serves it at a public URL. Also runs serverless functions (small backend endpoints) without you managing a server.

**Why this vs. alternatives:**
- *vs. GitHub Pages:* Free and simple, but static-only — no serverless functions. You'd have no way to run the global leaderboard backend. That would mean finding and wiring up a separate backend host.
- *vs. Netlify:* Very similar capability, but Vercel has tighter Vite integration and built-in KV storage (see below), so everything stays under one roof.
- *vs. AWS/GCP/a VPS:* Massively over-provisioned for a single-page game. More config, more cost, more ops. The BRD values shipping speed over infrastructure sophistication.
- **Bonus:** Vercel auto-generates preview URLs for every PR branch. This is directly useful for Day 3 when you're reviewing PRs — you can play the changed game at a unique URL before merging.

---

### 5. Global Leaderboard Backend: Vercel KV (Upstash Redis)

**What it is:** A key-value database (specifically Redis) that Vercel hosts for you. It stores the global high score list. Your serverless function writes scores to it and reads the top 10 back.

**Why this vs. alternatives:**
- *vs. Supabase/Postgres:* A full relational database is overkill for a single sorted list of scores. Redis has a native "sorted set" data structure (`ZADD`/`ZRANGE`) that is literally designed for leaderboards — one command to insert a score, one command to get the top N.
- *vs. a JSON file or SQLite:* Those are local-only — they don't work in serverless environments where each request may run on a different machine. You need a hosted data store.
- *vs. Firebase Realtime DB:* Would work, but adds a Google dependency and client-side SDK. Vercel KV is accessed server-side from the serverless function, keeping the client simple and secrets off the frontend.
- *vs. building nothing (skip global scores):* The BRD says this optional extension "will materially strengthen a submission." Worth the small added complexity.
