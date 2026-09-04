/* Durable storage for chat transcripts.
 *
 * The runtime logs in `analytics.ts` hold the same text, but Vercel keeps them for
 * about an hour on Hobby. That's fine for watching traffic live and useless for
 * "what did people ask last week", which is the actually interesting question. So
 * every turn also lands in Blob storage, where it stays until deliberately deleted.
 *
 * One blob per turn rather than a daily file that gets appended to. Appending means
 * read-modify-write, and two turns finishing in the same moment would silently drop
 * one of them. A turn is immutable once written, so a file per turn has no races at
 * the cost of a `list()` when reading, and at this traffic that's nothing.
 *
 * `access: 'private'` matters. These are questions strangers typed, and a public
 * blob is readable by anyone holding the URL forever. Private blobs are readable
 * only with the store token, which lives in the server environment.
 *
 * Everything here degrades to a no-op without `BLOB_READ_WRITE_TOKEN` — a local
 * clone with no store attached still answers questions normally, it just doesn't
 * keep them. That's deliberate: transcript storage is never allowed to be the
 * reason a visitor doesn't get an answer.
 *
 * Still no IP and no session identifier. The pathname's date and time are the only
 * thing tying two turns together, which is enough to read a conversation in order
 * and not enough to identify anyone. */

import { get, list, put } from "@vercel/blob";

const PREFIX = "chat/";

export type Turn = {
  /* Set when the turn is created, not when it's written, so the ordering is the
     order questions were asked rather than the order answers finished. */
  at: string;
  /* Which user message this was in the thread. 1 is a fresh conversation. */
  turn: number;
  question: string;
  answer?: string;
  /* Present instead of an answer when the providers failed. A question nobody
     could answer is worth more than a question that went fine. */
  error?: string;
  provider?: string;
  model?: string;
  fellBack?: boolean;
  ms?: number;
  inputTokens?: number;
  outputTokens?: number;
};

const configured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/* `chat/2026-09-04/1757000000000-a1b2c3.json`. Date first so a day's conversations
 * fold together under a prefix; epoch millis second so `list()` returns them in
 * chronological order without sorting; a random tail so two turns landing in the
 * same millisecond can't collide on the pathname. */
function pathnameFor(at: string) {
  const day = at.slice(0, 10);
  const stamp = Date.parse(at);
  const tail = Math.random().toString(36).slice(2, 8);
  return `${PREFIX}${day}/${stamp}-${tail}.json`;
}

/* Fire-and-forget, like the rest of the analytics path. A write that fails logs and
 * is otherwise forgotten — the visitor already has their answer, and there's no
 * version of "storage is down" that should surface in a chat panel. */
export function persistTurn(turn: Turn) {
  if (!configured()) return;

  void put(pathnameFor(turn.at), JSON.stringify(turn), {
    access: "private",
    contentType: "application/json",
    /* Pathnames already carry a random tail, so the SDK doesn't need to add
       another one — and an exact pathname is what makes reading predictable. */
    addRandomSuffix: false,
  }).catch((error: unknown) => {
    console.warn("[chat] transcript write failed:", error);
  });
}

/* Newest first, which is the only order worth reading them in.
 *
 * `list()` returns pathnames in lexicographic order, and because the date and the
 * epoch stamp are both fixed-width and left-padded, that's chronological — so
 * reversing gives newest first without parsing anything. */
export async function readTurns(limit = 200): Promise<Turn[]> {
  if (!configured()) return [];

  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  const newest = blobs.map((blob) => blob.pathname).reverse().slice(0, limit);

  const turns = await Promise.all(
    newest.map(async (pathname) => {
      try {
        /* useCache: false — a transcript written seconds ago shouldn't be missing
           from the page because a CDN node hasn't caught up. */
        const result = await get(pathname, { access: "private", useCache: false });
        /* Null when the blob has gone, and a 304 with no body when the CDN says
           nothing changed — neither of which can be parsed into a turn. */
        if (!result?.stream) return null;
        return (await new Response(result.stream).json()) as Turn;
      } catch {
        /* One unreadable blob shouldn't blank the whole page. */
        return null;
      }
    }),
  );

  return turns.filter((turn): turn is Turn => turn !== null);
}
