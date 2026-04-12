# Standing Rules for Claude Code

These rules apply for the duration of this project. They complement CLAUDE.md.

## Collaboration Protocol

- Always confirm major decisions with the user before executing. Major decisions include: tech stack, game choice, deployment target, adding new services/APIs, and any architectural changes.
- When in doubt, ask. The user prefers to be consulted rather than surprised.
- Propose options with brief tradeoff analysis rather than just picking one.

## Code Quality

- Keep the codebase simple. This is a small game, not enterprise software.
- Every commit should leave the project in a working state.
- Write code that a new contributor can read and understand without extensive comments.
- Test locally before declaring something done.

## Required Deliverables

You must create and maintain these files throughout the project:

1. **README.md** — Must include: project description, local setup instructions, how to run the game, and contribution guidelines (clone, branch, PR workflow).
2. **DECISIONS_AND_OBSTACLES.md** — Must include: scope decisions, key technical decisions, friction or obstacles encountered, and tradeoffs made. Update this as you go, not just at the end.
3. **AI_USAGE.md** — Must include: how AI was used in the project, where it helped most, and what was manually verified. Update this as you go.

## Things You Must Not Do

- Do not modify or delete `assignment-BRD.md`
- Do not commit secrets, API keys, or credentials to the repository
- Do not add unnecessary dependencies — justify every addition
- Do not over-engineer — "pragmatism beats ambition, shipping beats polish"
- Do not force-push or rewrite shared commit history
