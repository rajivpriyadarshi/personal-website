/* Basic Auth in front of /admin.
 *
 * This is `proxy.ts`, not `middleware.ts`. Next 16 renamed the convention; the
 * behaviour is identical, but a file called `middleware.ts` is now read by nothing,
 * which is a silent failure — the admin pages would simply be public.
 *
 * Basic Auth rather than a login form and a session because there's exactly one
 * user and nothing here to personalise. The browser handles the prompt, the
 * credential rides on every request, and there's no session store to get wrong.
 * It's only meaningful over HTTPS, which is what production is.
 *
 * Runs before the page, so `readTurns()` never executes for an unauthenticated
 * request — the transcript isn't fetched and then hidden, it isn't fetched.
 *
 * Sets `ADMIN_PASSWORD`-or-nothing semantics deliberately: with no password
 * configured, /admin is refused outright rather than left open. A missing env var
 * should never be the thing that publishes visitors' questions. */

import { NextResponse, type NextRequest } from "next/server";

const REALM = 'Basic realm="Admin", charset="UTF-8"';

const challenge = () =>
  new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });

/* Length-independent comparison, so a wrong guess can't be told from a
 * nearly-right one by how long the check took. Over the public internet the
 * timing signal is buried in jitter, but the correct version is three lines. */
function matches(given: string, expected: string) {
  if (given.length !== expected.length) return false;

  let differences = 0;
  for (let i = 0; i < given.length; i += 1) {
    differences |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return differences === 0;
}

export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return challenge();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return challenge();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return challenge();
  }

  /* Any username is accepted — there's one account, and asking someone to
     remember a username as well as a password buys nothing. */
  const supplied = decoded.slice(decoded.indexOf(":") + 1);
  if (!matches(supplied, password)) return challenge();

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
