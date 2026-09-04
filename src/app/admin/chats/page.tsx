/* Every question anyone has asked the chat, newest first.
 *
 * Behind Basic Auth via `src/proxy.ts`, and behind `robots: noindex` besides —
 * these are strangers' questions, and the only person with a reason to read them
 * is me.
 *
 * Deliberately plain. This is a log reader, not a page of the portfolio: no
 * animation, no scroll effects, nothing that gets in the way of scanning a couple
 * of hundred rows. */

import type { Metadata } from "next";
import { readTurns } from "@/app/api/chat/transcript";

export const metadata: Metadata = {
  title: "Chat transcripts",
  robots: { index: false, follow: false },
};

/* Never prerendered and never cached — the whole point is what happened in the
 * last few minutes. Without this the page is built once and serves a snapshot of
 * an empty store forever. */
export const dynamic = "force-dynamic";

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  });

export default async function ChatTranscriptsPage() {
  const turns = await readTurns();

  /* The counts worth having at a glance: how much traffic, and how much of it
     was an opening question rather than a follow-up. A thread that never gets a
     second question means the first answer didn't land. */
  const openings = turns.filter((turn) => turn.turn === 1).length;
  const failures = turns.filter((turn) => turn.error).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-mono text-[13px] leading-relaxed">
      <h1 className="text-base font-semibold">Chat transcripts</h1>

      <p className="mt-2 text-neutral-500">
        {turns.length === 0
          ? "Nothing stored yet. If this stays empty after a few chats, the Blob store isn't attached — persistTurn no-ops without BLOB_READ_WRITE_TOKEN."
          : `${turns.length} turns · ${openings} conversations · ${failures} failed`}
      </p>

      <ol className="mt-10 space-y-8">
        {turns.map((turn) => (
          /* The pathname would be the natural key, but it isn't carried in the
             record. Timestamp plus turn number is unique in practice and stable
             across renders, which is all React needs here. */
          <li key={`${turn.at}-${turn.turn}`} className="border-t border-neutral-200 pt-4">
            <div className="flex flex-wrap gap-x-3 text-[11px] uppercase tracking-wide text-neutral-400">
              <span>{stamp(turn.at)}</span>
              <span>turn {turn.turn}</span>
              {turn.model && <span>{turn.model}</span>}
              {turn.fellBack && <span className="text-amber-600">fell back</span>}
              {turn.ms !== undefined && <span>{(turn.ms / 1000).toFixed(1)}s</span>}
              {turn.outputTokens !== undefined && (
                <span>
                  {turn.inputTokens ?? "?"}&thinsp;/&thinsp;{turn.outputTokens} tok
                </span>
              )}
            </div>

            <p className="mt-3 font-semibold whitespace-pre-wrap">{turn.question}</p>

            {turn.error ? (
              <p className="mt-2 whitespace-pre-wrap text-red-600">{turn.error}</p>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-neutral-700">{turn.answer}</p>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
