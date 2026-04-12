export interface ScoreEntry {
  name: string;
  score: number;
  at: number;
}

export interface LeaderboardResponse {
  entries: ScoreEntry[];
  enabled: boolean;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardResponse> {
  try {
    const res = await fetch(`/api/scores?limit=${limit}`);
    if (!res.ok) return { entries: [], enabled: false };
    const data = (await res.json()) as LeaderboardResponse;
    return data;
  } catch {
    return { entries: [], enabled: false };
  }
}

export async function submitScore(name: string, score: number): Promise<LeaderboardResponse> {
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
    if (!res.ok) return { entries: [], enabled: false };
    return (await res.json()) as LeaderboardResponse;
  } catch {
    return { entries: [], enabled: false };
  }
}
