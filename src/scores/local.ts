const KEY = "fbb-breakout:highscore:v1";
const NAME_KEY = "fbb-breakout:name:v1";

export function getLocalBest(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function setLocalBest(score: number): number {
  const current = getLocalBest();
  if (score <= current) return current;
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    // ignore storage errors
  }
  return score;
}

export function getSavedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setSavedName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}
