const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_REPLY_LENGTH = 160;
const allowedTargets = new Set(["Ninedbase", "PriceMemo", "Other"]);

// This map is isolate-local and intentionally never written to D1 or logs.
const recentSubmissions = new Map();

const json = (payload, status, corsHeaders) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...corsHeaders,
  },
});

const allowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const origins = String(env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim());
  return origins.includes(origin) ? origin : null;
};

const cors = (origin) => origin ? {
  "access-control-allow-origin": origin,
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
  vary: "Origin",
} : {};

const cleanText = (value) => typeof value === "string" ? value.trim() : "";

async function rateKey(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const bytes = new TextEncoder().encode(`${env.RATE_LIMIT_SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (part) => part.toString(16).padStart(2, "0")).join("");
}

function pruneRateLimits(now) {
  for (const [key, timestamps] of recentSubmissions) {
    const fresh = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
    if (fresh.length) recentSubmissions.set(key, fresh);
    else recentSubmissions.delete(key);
  }
}

async function isRateLimited(request, env) {
  const now = Date.now();
  pruneRateLimits(now);
  const key = await rateKey(request, env);
  const timestamps = recentSubmissions.get(key) || [];
  if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) return true;
  timestamps.push(now);
  recentSubmissions.set(key, timestamps);
  return false;
}

async function verifyTurnstile(token, env) {
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token }),
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    const corsHeaders = cors(origin);

    if (request.method === "OPTIONS") {
      return origin ? new Response(null, { status: 204, headers: corsHeaders }) : new Response(null, { status: 403 });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true }, 200, {});
    }
    if (url.pathname !== "/api/contact" || request.method !== "POST") {
      return json({ error: "Not found." }, 404, corsHeaders);
    }
    if (!origin) return json({ error: "This origin is not allowed." }, 403, {});
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return json({ error: "Send JSON." }, 415, corsHeaders);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid request." }, 400, corsHeaders);
    }

    const target = cleanText(payload.target);
    const body = cleanText(payload.message);
    const replyTo = cleanText(payload.replyTo);
    const honeypot = cleanText(payload.website);
    if (honeypot) return json({ ok: true, message: "Received." }, 200, corsHeaders);
    if (!allowedTargets.has(target) || !body || body.length > MAX_MESSAGE_LENGTH || replyTo.length > MAX_REPLY_LENGTH) {
      return json({ error: "Check the form and try again." }, 400, corsHeaders);
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
      return json({ error: "Please use a social handle, not an email address." }, 400, corsHeaders);
    }
    if (await isRateLimited(request, env)) {
      return json({ error: "Please wait a few minutes before sending another message." }, 429, corsHeaders);
    }
    if (!(await verifyTurnstile(payload.turnstileToken, env))) {
      return json({ error: "Please complete the verification and try again." }, 400, corsHeaders);
    }

    try {
      await env.DB.prepare(
        "INSERT INTO inquiries (target, body, reply_to, created_at) VALUES (?, ?, ?, ?)"
      ).bind(target, body, replyTo || null, new Date().toISOString()).run();
      return json({ ok: true, message: "Received." }, 201, corsHeaders);
    } catch {
      return json({ error: "Couldn't receive that right now. Please try again later." }, 503, corsHeaders);
    }
  },
};
