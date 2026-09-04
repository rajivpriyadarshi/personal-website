/* What people ask the assistant, and what it told them.
 *
 * Two sinks, because they answer different questions and neither does both well.
 *
 * Vercel Analytics custom events give the shape of usage over time — how many
 * conversations, how deep they go, which model served them, how often the fallback
 * fires. Event properties are capped in size and are meant to be low-cardinality,
 * so the question goes in truncated and the answer doesn't go in at all.
 *
 * Runtime logs get the full text. `vercel logs` and the dashboard's log view are
 * searchable, which is enough to read back what a visitor actually asked. The
 * catch worth knowing: log retention is short — an hour on Hobby, a day on Pro —
 * so this is for looking at recent traffic, not a transcript archive. A durable
 * store (Blob, KV, a Postgres table) is a separate decision, and this file is
 * where it would go.
 *
 * What's deliberately not recorded: no IP, no session identifier, nothing that
 * links two questions to one person beyond the turn count already in the thread.
 * The interesting data is what people want to know about Rajiv, not who they are.
 */

import { track } from "@vercel/analytics/server";
import type { UIMessage } from "ai";

/* Analytics property values are truncated hard by the API; keeping it well under
 * that means a question arrives intact rather than clipped mid-word. */
const EVENT_TEXT_MAX = 180;

/* Fire-and-forget. An analytics failure must never take down an answer, and
 * awaiting it would add its latency to the visitor's first token. */
function send(event: string, properties: Record<string, string | number | boolean>) {
  void track(event, properties).catch(() => {});
}

/* Structured single-line JSON, so the log view can be searched by field rather
 * than by eyeballing prose. */
function log(entry: Record<string, unknown>) {
  console.log(JSON.stringify({ tag: "chat", ...entry }));
}

const textOf = (message: UIMessage | undefined) =>
  (message?.parts ?? [])
    .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
    .join(" ")
    .trim();

/* Called once a request is admitted, before the model runs — so a question is
 * recorded even if the answer then fails. */
export function recordQuestion(messages: UIMessage[]) {
  const question = textOf(messages.at(-1));
  if (!question) return;

  /* Turn 1 is a fresh conversation; anything higher means they kept going, which
     is the single most useful number in here. */
  const turn = messages.filter((message) => message.role === "user").length;

  log({ event: "question", turn, chars: question.length, question });
  send("chat_question", {
    turn,
    question: question.slice(0, EVENT_TEXT_MAX),
    /* Whether this is the opening question of a conversation, as its own property
       so the funnel is one filter rather than an arithmetic exercise. */
    opening: turn === 1,
  });
}

/* Called when a provider finishes a turn. `fellBack` is what shows whether OpenAI
 * is quietly failing — the visitor can't tell, and the logs otherwise wouldn't
 * either until the bill arrived. */
export function recordAnswer(args: {
  provider: string;
  model: string;
  fellBack: boolean;
  answer: string;
  ms: number;
  inputTokens?: number;
  outputTokens?: number;
}) {
  const { provider, model, fellBack, answer, ms } = args;

  log({
    event: "answer",
    provider,
    model,
    fellBack,
    ms,
    inputTokens: args.inputTokens,
    outputTokens: args.outputTokens,
    chars: answer.length,
    answer,
  });

  send("chat_answer", {
    provider,
    model,
    fellBack,
    ms,
    chars: answer.length,
    /* Empty answers are the failure that looks like success — the stream closes,
       the panel shows nothing, and no error is ever logged. Worth a property. */
    empty: answer.trim().length === 0,
  });
}
