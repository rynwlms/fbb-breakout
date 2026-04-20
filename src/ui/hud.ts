import type { ScoreEntry } from "../scores/remote";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

export const hud = {
  score: el<HTMLElement>("score"),
  best: el<HTMLElement>("best"),
  lives: el<HTMLElement>("lives"),
  round: el<HTMLElement>("round"),
  roundTotal: el<HTMLElement>("round-total"),
  overlay: el<HTMLDivElement>("overlay"),
  overlayTitle: el<HTMLHeadingElement>("overlay-title"),
  overlayBody: el<HTMLParagraphElement>("overlay-body"),
  startBtn: el<HTMLButtonElement>("start-btn"),
  leaderboardList: el<HTMLOListElement>("leaderboard-list"),
};

export function setScore(value: number): void {
  hud.score.textContent = String(value);
}

export function setBest(value: number): void {
  hud.best.textContent = String(value);
}

export function setLives(value: number): void {
  hud.lives.textContent = String(Math.max(0, value));
}

export function setRound(round: number, total: number): void {
  hud.round.textContent = String(Math.max(1, round));
  hud.roundTotal.textContent = String(Math.max(1, total));
}

export function showOverlay(title: string, body: string, buttonLabel = "Start"): void {
  hud.overlayTitle.textContent = title;
  hud.overlayBody.textContent = body;
  hud.startBtn.textContent = buttonLabel;
  hud.overlay.classList.remove("hidden");
}

export function hideOverlay(): void {
  hud.overlay.classList.add("hidden");
}

export function renderLeaderboard(entries: ScoreEntry[], enabled: boolean): void {
  hud.leaderboardList.innerHTML = "";
  if (!enabled) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Global scores offline — playing with local-only high score.";
    hud.leaderboardList.appendChild(li);
    return;
  }
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No scores yet. Be the first!";
    hud.leaderboardList.appendChild(li);
    return;
  }
  for (const entry of entries) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry.name;
    const score = document.createElement("span");
    score.className = "score";
    score.textContent = String(entry.score);
    li.append(name, score);
    hud.leaderboardList.appendChild(li);
  }
}
