import { Redis } from "@upstash/redis";

export const config = { runtime: "edge" };

interface ScoreEntry {
  name: string;
  score: number;
  at: number;
}

interface LeaderboardResponse {
  entries: ScoreEntry[];
  enabled: boolean;
}

const KEY = "fbb-breakout:leaderboard:v1";
const MAX_LIMIT = 25;
const DEFAULT_LIMIT = 10;
const MAX_SCORE = 1_000_000;
const NAME_RE = /^[A-Z0-9]{1,3}$/;

function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.REDIS_URL;
  const token =
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.REDIS_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

function parseMember(member: string): { name: string; at: number } | null {
  const parts = member.split("|");
  if (parts.length < 2) return null;
  const [name, atStr] = parts;
  const at = Number.parseInt(atStr ?? "", 10);
  if (!name || !NAME_RE.test(name) || !Number.isFinite(at)) return null;
  return { name, at };
}

async function readLeaderboard(redis: Redis, limit: number): Promise<ScoreEntry[]> {
  const raw = (await redis.zrange(KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  const entries: ScoreEntry[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const member = String(raw[i]);
    const score = Number(raw[i + 1]);
    const parsed = parseMember(member);
    if (!parsed || !Number.isFinite(score)) continue;
    entries.push({ name: parsed.name, score, at: parsed.at });
  }
  return entries;
}

async function handleGet(url: URL): Promise<Response> {
  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.max(1, Math.min(MAX_LIMIT, limitParam))
    : DEFAULT_LIMIT;

  const redis = getRedis();
  if (!redis) {
    return json({ entries: [], enabled: false } satisfies LeaderboardResponse);
  }
  try {
    const entries = await readLeaderboard(redis, limit);
    return json({ entries, enabled: true } satisfies LeaderboardResponse);
  } catch {
    return json({ entries: [], enabled: false } satisfies LeaderboardResponse);
  }
}

async function handlePost(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return json({ error: "Invalid body" }, { status: 400 });
  }
  const { name, score } = body as { name?: unknown; score?: unknown };
  if (typeof name !== "string" || typeof score !== "number") {
    return json({ error: "name and score required" }, { status: 400 });
  }
  const cleanName = name.trim().toUpperCase().slice(0, 3);
  if (!NAME_RE.test(cleanName)) {
    return json({ error: "name must be 1-3 alphanumeric characters" }, { status: 400 });
  }
  if (!Number.isFinite(score) || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return json({ error: "invalid score" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return json({ entries: [], enabled: false } satisfies LeaderboardResponse);
  }

  try {
    const member = `${cleanName}|${Date.now()}|${Math.random().toString(36).slice(2, 8)}`;
    await redis.zadd(KEY, { score, member });
    const size = (await redis.zcard(KEY)) as number;
    if (size > 100) {
      await redis.zremrangebyrank(KEY, 0, size - 101);
    }
    const entries = await readLeaderboard(redis, DEFAULT_LIMIT);
    return json({ entries, enabled: true } satisfies LeaderboardResponse);
  } catch {
    return json({ entries: [], enabled: false } satisfies LeaderboardResponse);
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === "GET") return handleGet(url);
  if (req.method === "POST") return handlePost(req);
  return json({ error: "Method not allowed" }, { status: 405 });
}
