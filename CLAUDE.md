# CLAUDE.md — Project Orientation for Claude Code

## What Is This Project?

This is a **hiring exercise** for a "Vibe Coder" role. The goal is to build and publicly deploy a small browser-based game. The exercise evaluates delivery, judgment, problem-solving, and collaboration — not product ambition or game design sophistication.

The full requirements are in **`assignment-BRD.md`** at the project root. That file is the source of truth. Read it before doing anything else.

## What Must Be Delivered

### Day 1 — Build and Ship
- [ ] A small browser-based game (playable in the browser)
- [ ] Local high score persistence (survives page refresh, same browser)
- [ ] A public deployment (live URL someone can visit and play)
- [ ] A code repository structured for shared development
- [ ] `README.md` — local setup and contribution instructions
- [ ] `DECISIONS_AND_OBSTACLES.md` — scope, key decisions, friction encountered, tradeoffs made
- [ ] `AI_USAGE.md` — how AI was used, where it helped, what was verified

### Day 2 — Collaboration
- Grant repo access to two team members provided by the evaluators
- Ensure each person can contribute via branch + PR

### Day 3 — PR Review
- Review two PRs submitted by their team
- Accept and merge one, deploy the accepted change
- Reject one with clear feedback on what must change

### Optional Extension
- **Global high scores** — scores stored outside the browser in a shared backend or hosted data store, so multiple users on different devices can see the same score data. This "will materially strengthen a submission if executed well."

## What Is Being Evaluated

Directly from the BRD — they care most about:
1. Your ability to get to a working result
2. Your ability to overcome unfamiliar technical obstacles
3. Your judgment in choosing tools and managing complexity
4. Your ability to create a usable collaboration workflow
5. Your ability to explain what you did and why

**"Pragmatism beats ambition. Shipping beats polish."**

## Open Decisions — Confirm With the User

The following decisions have **not** been made yet. You must propose options and get explicit confirmation from the user before proceeding:

1. **Game choice** — What game to build (keep it simple per the BRD)
2. **Tech stack** — Language, framework, build tools
3. **Deployment target** — Where to host (Vercel, Netlify, GitHub Pages, etc.)
4. **Global high scores** — Whether to pursue this optional extension, and if so, what backend to use
5. **GitHub remote** — Whether you should create the remote repo or the user will handle it

## Stop Conditions — Do NOT Do These Without Asking

- **Do not choose a tech stack** without confirming with the user
- **Do not deploy** without confirming the deployment target with the user
- **Do not delete or modify** `assignment-BRD.md`
- **Do not install heavyweight frameworks** (e.g., Next.js, Django, Rails) without justifying the choice and getting confirmation
- **Do not add paid services or APIs** without confirmation
- **Do not push to a remote** until the user has confirmed the repo location

## Coding Conventions

- Write clear, self-documenting code with meaningful names
- No dead code or commented-out blocks left behind
- Commit frequently with clear, descriptive commit messages
- Keep the game simple — resist scope creep
- Structure the repo so a new contributor can clone, install, and run locally with minimal steps
- Stack-specific conventions will be added here once the stack is decided

## Project Structure

```
FBB AI Hire Test/
├── assignment-BRD.md          # BRD (source of truth, do not modify)
├── CLAUDE.md                  # This file (project orientation)
├── .claude/
│   └── rules/
│       └── project-rules.md   # Standing rules for Claude Code
├── README.md                  # Contributor instructions (flesh this out)
├── DECISIONS_AND_OBSTACLES.md # Required deliverable (maintain as you go)
├── AI_USAGE.md                # Required deliverable (maintain as you go)
├── .env.example               # Environment variable template
├── .gitignore
├── src/                       # Game source code goes here
└── public/                    # Static assets go here
```

## Getting Started

1. Read `assignment-BRD.md` thoroughly
2. Propose a game concept and tech stack to the user — keep it simple
3. Once confirmed, initialize the project (package.json or equivalent) and start building
4. Update `README.md` with real setup instructions as you go
5. Log decisions in `DECISIONS_AND_OBSTACLES.md` as you make them
6. Log AI usage in `AI_USAGE.md` as you work
