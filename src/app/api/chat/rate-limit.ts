/* Rate limiting for /api/chat.
 *
 * The endpoint is unauthenticated by design — a visitor shouldn't have to sign in
 * to ask a question about Rajiv — which makes it an open proxy to a paid model.
 * Without a limit, one loop from one machine can spend real money.
 *
 * What's actually being protected is tokens, not requests. Every call resends the
 * whole corpus as the system prompt (~20k tokens), and the reply is small next to
 * that. So the cost of a request is roughly fixed and roughly all input, which is
 * why there's an input cap here as well as a request cap: someone sending one
 * enormous message is more expensive than someone sending fifty normal ones.
 *
 * Counters live in memory, deliberately. The alternative is Redis, which is more
 * accurate — memory resets on cold start, and each serverless instance counts on
 * its own, so requests spread across instances get a higher effective limit than
 * the numbers below suggest. That trade is fine here: a loop from a single IP
 * lands on a single warm instance and gets blocked, which is the realistic abuse
 * case, and the global hourly and daily ceilings backstop everything else. No
 * dependency, no config, nothing to keep paid for.
 */

/* Per caller. Ten in five minutes is already generous — a real visitor spends
   20–30 seconds reading a three-paragraph answer — and forty in a day is more
   than anyone genuinely curious will ask. */
const WINDOW_MS = 5 * 60_000;
const WINDOW_MAX = 10;
const DAY_MAX = 40;

/* Across everyone. This is the spend ceiling, and the only limit that holds when
   the traffic is distributed rather than from one address. At ~20k input tokens a
   request it bounds the worst possible day to something like 12M tokens, most of
   which should land on OpenAI's automatic prefix cache, since the corpus in front
   of every request is byte-identical. */
const GLOBAL_DAY_MAX = 600;

/* A burst brake in front of the daily ceiling. Without it a script can drain the
   whole day's allowance in the first few minutes and every real visitor after that
   gets told to come back tomorrow. At 100 an hour the worst case is still 600 in a
   day, but no single hour can take more than a sixth of it, and the endpoint
   recovers on the hour instead of staying dead until midnight UTC. */
const GLOBAL_HOUR_MAX = 100;

/* A thread this long is a scraper, not a conversation. */
const MAX_MESSAGES = 20;

/* Long enough for a detailed question about a project, short enough that nobody
   can paste a novel in and bill it to the model. */
const MAX_CHARS = 1500;

/* Ceiling on the callers table, so rotating source addresses can't grow it
   without bound. Well above the number of distinct visitors this site sees. */
const MAX_TRACKED = 5000;

type Caller = {
  /* Timestamps inside the sliding window, oldest first. */
  recent: number[];
  day: string;
  dayCount: number;
};

const callers = new Map<string, Caller>();
let globalDay = "";
let globalCount = 0;
let globalHour = "";
let globalHourCount = 0;

const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);

/* "2026-09-04T14" — a fixed-width UTC hour, so the counter resets on the hour
   rather than an hour after the first request of a burst. */
const utcHour = (now: number) => new Date(now).toISOString().slice(0, 13);

/* Seconds until the current UTC hour is up, which is what a caller blocked by the
   hourly ceiling should actually wait. */
const untilNextHour = (now: number) => Math.ceil((3600_000 - (now % 3600_000)) / 1000);

/* On Vercel, `x-vercel-forwarded-for` is set by the platform and a client can't
 * overwrite it; `x-forwarded-for` can have entries prepended by whoever is
 * calling, so its leftmost value is only trusted as a last resort. An unknown
 * caller shares one bucket with every other unknown caller, which errs strict —
 * the right direction for a limiter. */
function callerKey(request: Request) {
  const header =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for");

  return header?.split(",")[0]?.trim() || "unknown";
}

/* Drops callers who can't be near a limit any more: nothing in the window, and
 * nothing counted today. If that isn't enough — an attacker cycling addresses
 * faster than they expire — the least recently seen go too. */
function prune(now: number, today: string) {
  for (const [key, caller] of callers) {
    const idle = caller.recent.length === 0 || now - caller.recent.at(-1)! > WINDOW_MS;
    if (idle && caller.day !== today) callers.delete(key);
  }

  if (callers.size <= MAX_TRACKED) return;

  const byAge = [...callers.entries()].sort(
    (a, b) => (a[1].recent.at(-1) ?? 0) - (b[1].recent.at(-1) ?? 0),
  );

  for (const [key] of byAge.slice(0, callers.size - MAX_TRACKED)) {
    callers.delete(key);
  }
}

type Rejection = { status: number; message: string; retryAfter?: number };

/* Cheap structural checks, before anything is counted — a malformed request
 * shouldn't consume a visitor's allowance. Runs on the raw parsed body, since a
 * caller can put anything in it. */
export function checkRequestShape(messages: unknown): Rejection | null {
  if (!Array.isArray(messages)) {
    return { status: 400, message: "That request didn't look like a conversation." };
  }

  if (messages.length > MAX_MESSAGES) {
    return {
      status: 400,
      message:
        "This conversation has gone on longer than I keep track of. Start a fresh " +
        "one, or message me on LinkedIn and we can talk properly.",
    };
  }

  for (const message of messages) {
    const parts = (message as { parts?: unknown })?.parts;
    if (!Array.isArray(parts)) continue;

    const chars = parts.reduce((total: number, part: unknown) => {
      const text = (part as { text?: unknown })?.text;
      return total + (typeof text === "string" ? text.length : 0);
    }, 0);

    if (chars > MAX_CHARS) {
      return {
        status: 400,
        message:
          "That's a longer question than I can take in one go. Trim it down, or " +
          "send it to me directly on LinkedIn.",
      };
    }
  }

  return null;
}

/* Records the request as it admits it, so a rejected call doesn't count against
 * the caller who was rejected. Called once per request, after the shape checks. */
export function checkRateLimit(request: Request): Rejection | null {
  const now = Date.now();
  const today = utcDay(now);

  if (globalDay !== today) {
    globalDay = today;
    globalCount = 0;
  }

  if (globalHour !== utcHour(now)) {
    globalHour = utcHour(now);
    globalHourCount = 0;
  }

  /* Deliberately vague about these ceilings being global — "everyone else used it
     up" invites someone to go and test that. */
  if (globalCount >= GLOBAL_DAY_MAX) {
    return {
      status: 429,
      message:
        "This chat has hit its limit for the day. Try tomorrow, or reach me on " +
        "LinkedIn and you'll get a better answer anyway.",
      retryAfter: 3600,
    };
  }

  if (globalHourCount >= GLOBAL_HOUR_MAX) {
    return {
      status: 429,
      message:
        "This chat is busier than usual right now. Try again shortly, or reach me " +
        "on LinkedIn.",
      retryAfter: untilNextHour(now),
    };
  }

  const key = callerKey(request);
  prune(now, today);

  const caller = callers.get(key) ?? { recent: [], day: today, dayCount: 0 };

  if (caller.day !== today) {
    caller.day = today;
    caller.dayCount = 0;
  }

  caller.recent = caller.recent.filter((at) => now - at < WINDOW_MS);

  if (caller.dayCount >= DAY_MAX) {
    callers.set(key, caller);
    return {
      status: 429,
      message:
        "You've asked a lot of questions today — more than I'd planned for, which " +
        "I'll take as a compliment. Come back tomorrow, or message me on LinkedIn.",
      retryAfter: 3600,
    };
  }

  if (caller.recent.length >= WINDOW_MAX) {
    callers.set(key, caller);
    const oldest = caller.recent[0]!;
    return {
      status: 429,
      message:
        "That's a lot of questions in a short stretch. Give it a couple of " +
        "minutes and ask again — or message me on LinkedIn if you're in a hurry.",
      retryAfter: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  caller.recent.push(now);
  caller.dayCount += 1;
  callers.set(key, caller);
  globalCount += 1;
  globalHourCount += 1;

  return null;
}

/* Rejections go back as plain text rather than JSON: the AI SDK transport uses
 * the raw response body as the error message, and the panel renders that message
 * to the visitor. A JSON body would show them a pair of braces. */
export function rejectionResponse({ status, message, retryAfter }: Rejection) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...(retryAfter ? { "retry-after": String(retryAfter) } : {}),
    },
  });
}
