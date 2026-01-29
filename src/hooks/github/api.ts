import { fetch } from "@tauri-apps/plugin-http";
import { Command } from "@tauri-apps/plugin-shell";
import type { MyActivity, Comment, CachedData, GitHubEvent } from "./types";
import { mapEvent } from "./mappers";

export const API = "https://api.github.com";
export const CACHE_TTL = 30 * 60 * 1000;
const TOKEN_TTL = 5 * 60 * 1000;

let cachedToken: { value: string; timestamp: number } | null = null;
let _cachedUsername: string | null = (() => {
  try {
    return localStorage.getItem("gh_username");
  } catch {
    return null;
  }
})();

export function getCachedUsername(): string | null {
  return _cachedUsername;
}

export function setCachedUsername(username: string) {
  _cachedUsername = username;
  localStorage.setItem("gh_username", username);
}

export async function getToken(): Promise<string | null> {
  if (cachedToken && Date.now() - cachedToken.timestamp < TOKEN_TTL) {
    return cachedToken.value;
  }
  try {
    const out = await Command.create("gh", ["auth", "token"]).execute();
    const token = out.stdout.trim() || null;
    if (token) cachedToken = { value: token, timestamp: Date.now() };
    return token;
  } catch (e) {
    console.error("[gitbar] getToken failed:", e);
    return null;
  }
}

export function clearTokenCache() {
  cachedToken = null;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelay = 1000,
): Promise<Response> {
  let opts = options;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, opts);
    if (res.status === 401) {
      clearTokenCache();
      const freshToken = await getToken();
      if (freshToken && opts.headers) {
        const headers = { ...opts.headers } as Record<string, string>;
        headers["Authorization"] = `Bearer ${freshToken}`;
        opts = { ...opts, headers };
      }
      continue;
    }
    if (res.status === 403) {
      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        const reset = res.headers.get("X-RateLimit-Reset");
        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "soon";
        throw new Error(`GitHub rate limit exceeded. Resets at ${resetTime}`);
      }
    }
    if (res.ok || res.status < 500) return res;
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  return fetch(url, opts);
}

const COMMENTS_CACHE_MAX = 50;
const commentsCache = new Map<string, { data: Comment[]; timestamp: number }>();

export async function fetchComments(repo: string, number: number): Promise<Comment[]> {
  const key = `${repo}#${number}`;
  const cached = commentsCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    commentsCache.delete(key);
    commentsCache.set(key, cached);
    return cached.data;
  }

  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API}/repos/${repo}/issues/${number}/comments?per_page=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) throw new Error(`Comments: HTTP ${res.status}`);
    const comments = (await res.json()) as Array<{
      id: number;
      body: string;
      user: { login: string; avatar_url: string } | null;
      created_at: string;
      updated_at: string;
    }>;
    const mapped = comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.user?.login ?? "ghost",
      authorAvatar: c.user?.avatar_url ?? "",
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    if (commentsCache.size >= COMMENTS_CACHE_MAX) {
      const oldest = commentsCache.keys().next().value!;
      commentsCache.delete(oldest);
    }
    commentsCache.set(key, { data: mapped, timestamp: Date.now() });
    return mapped;
  } catch (e) {
    console.error("[gitbar] fetchComments failed:", e);
    throw e;
  }
}

export async function fetchPRReviewComments(repo: string, number: number): Promise<Comment[]> {
  const key = `review:${repo}#${number}`;
  const cached = commentsCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    commentsCache.delete(key);
    commentsCache.set(key, cached);
    return cached.data;
  }

  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API}/repos/${repo}/pulls/${number}/comments?per_page=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) throw new Error(`Review comments: HTTP ${res.status}`);
    const comments = (await res.json()) as Array<{
      id: number;
      body: string;
      user: { login: string; avatar_url: string } | null;
      created_at: string;
      updated_at: string;
    }>;
    const mapped = comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.user?.login ?? "ghost",
      authorAvatar: c.user?.avatar_url ?? "",
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    if (commentsCache.size >= COMMENTS_CACHE_MAX) {
      const oldest = commentsCache.keys().next().value!;
      commentsCache.delete(oldest);
    }
    commentsCache.set(key, { data: mapped, timestamp: Date.now() });
    return mapped;
  } catch (e) {
    console.error("[gitbar] fetchPRReviewComments failed:", e);
    throw e;
  }
}

export async function fetchAllComments(
  repo: string,
  number: number,
  isPR: boolean,
): Promise<Comment[]> {
  const [issueComments, reviewComments] = await Promise.all([
    fetchComments(repo, number),
    isPR ? fetchPRReviewComments(repo, number) : Promise.resolve([]),
  ]);
  return [...issueComments, ...reviewComments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function fetchUserEvents(username: string, token: string): Promise<MyActivity[]> {
  try {
    const res = await fetchWithRetry(`${API}/users/${username}/events?per_page=15`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) return [];
    const events = (await res.json()) as GitHubEvent[];
    return events.map(mapEvent).filter((e): e is MyActivity => e !== null);
  } catch (e) {
    console.error("[gitbar] fetchUserEvents failed:", e);
    return [];
  }
}

// Module-level cache (hydrated from localStorage on cold start)
let _cache: CachedData | null = (() => {
  try {
    const raw = localStorage.getItem("gh_cache");
    return raw ? (JSON.parse(raw) as CachedData) : null;
  } catch (e) {
    console.error("[gitbar] cache hydration failed:", e);
    return null;
  }
})();

export function getCache(): CachedData | null {
  return _cache;
}

export function persistCache(data: CachedData) {
  _cache = data;
  try {
    const stripBody = <T extends { body: string | null }>(items: T[]): T[] =>
      items.map((i) => ({ ...i, body: null }));
    const stripped: CachedData = {
      ...data,
      myPRs: stripBody(data.myPRs),
      assignedPRs: stripBody(data.assignedPRs),
      reviewRequests: stripBody(data.reviewRequests),
      prMentions: stripBody(data.prMentions),
      myIssues: stripBody(data.myIssues),
      assignedIssues: stripBody(data.assignedIssues),
      issueMentions: stripBody(data.issueMentions),
    };
    localStorage.setItem("gh_cache", JSON.stringify(stripped));
  } catch (e) {
    console.error("[gitbar] persistCache failed (quota exceeded?):", e);
  }
}
