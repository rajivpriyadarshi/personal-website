import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { recordAnswer, recordQuestion } from "./analytics";
import { SYSTEM_PROMPT } from "./persona";
import { checkRateLimit, checkRequestShape, rejectionResponse } from "./rate-limit";

/* Streaming answers outlast the default serverless window. */
export const maxDuration = 30;

/* Primary. Mini rather than full: this is retrieval-free question answering over
 * a prompt that already contains every fact, so the work is comprehension and
 * tone, not reasoning depth — and latency shows in a chat panel. */
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

/* Backup, on Google's free tier. Pinned because gemini-flash-latest resolves to
 * a model whose free allowance is 20 requests/day; 3.6 has its own bucket. */
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

/* Each SDK reads one hard-coded env name — `OPENAI_API_KEY` and
 * `GOOGLE_GENERATIVE_AI_API_KEY` — and silently behaves as unconfigured under any
 * other. The keys on Vercel are named for what they're for rather than for what
 * the libraries expect, so the names are resolved here and passed explicitly.
 *
 * Standard name first, so a local `.env.local` or a future rename keeps working
 * without touching this. Read inside the request rather than at module scope:
 * these have to come from the running environment, not from whatever was set at
 * build time.
 *
 * Values are never logged or returned — only their presence is, in the 500 below. */
function readKeys() {
  return {
    openai: process.env.OPENAI_API_KEY ?? process.env.Openai_portfolio_key,
    gemini:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.Gemini_flash_lite_key,
  };
}

/* The stream masks every failure as "An error occurred." by default, which is
 * the right instinct — upstream errors can carry request details — but it makes
 * the failures that actually happen indistinguishable from a bug. Quota and
 * model-availability errors get named; everything else stays opaque. */
function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (/quota|rate.?limit|RESOURCE_EXHAUSTED|insufficient_quota/i.test(message)) {
    return "Both models behind this chat are out of quota for the moment. Try again later, or reach me on LinkedIn.";
  }

  if (/no longer available|not found|NOT_FOUND|invalid.?api.?key/i.test(message)) {
    return "The models behind this chat aren't reachable right now. That's a configuration problem on my side, not yours.";
  }

  return "Something went wrong on my end. Try again in a moment.";
}

/* Bounds the cost of a single answer no matter what gets past everything else.
 * Well above what the persona actually produces — answers run three short
 * paragraphs — so it only ever truncates something pathological. */
const MAX_OUTPUT_TOKENS = 900;

/* Not security: an Origin header is set by the browser but trivially forged by
 * anything that isn't one. It's here to turn away casual curl, scanners, and
 * anyone wiring this endpoint into their own app — the traffic that has no
 * business here and costs nothing to refuse. Requests with no Origin at all pass,
 * because same-origin GET-turned-POST from some browsers omits it and I'd rather
 * not break a real visitor to inconvenience a script. */
function fromAnotherSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

type Turn = { system: string; messages: ModelMessage[] };

function streamFromOpenAI({ system, messages }: Turn, apiKey: string) {
  const startedAt = Date.now();

  return streamText({
    model: createOpenAI({ apiKey })(OPENAI_MODEL),
    system,
    messages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onFinish: (result) =>
      recordAnswer({
        provider: "openai",
        model: OPENAI_MODEL,
        fellBack: false,
        answer: result.text,
        ms: Date.now() - startedAt,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      }),
    providerOptions: {
      openai: {
        /* The summary is what the panel shows while the answer forms, so the
         * wait reads as work rather than lag. Effort has to be medium to get
         * one — at low the model barely thinks, and the summary comes back
         * empty. Easy questions still produce nothing, which the panel handles
         * by not drawing the disclosure at all. */
        reasoningEffort: "medium",
        reasoningSummary: "detailed",
      },
    },
  }).fullStream;
}

/* `fellBack` distinguishes Gemini serving a turn because OpenAI broke from Gemini
 * serving it because it's the only key configured. Only the first is a problem, and
 * only the logs can tell the difference — the visitor sees an answer either way. */
function streamFromGemini({ system, messages }: Turn, apiKey: string, fellBack = false) {
  const startedAt = Date.now();

  return streamText({
    model: createGoogleGenerativeAI({ apiKey })(GEMINI_MODEL),
    system,
    messages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onFinish: (result) =>
      recordAnswer({
        provider: "google",
        model: GEMINI_MODEL,
        fellBack,
        answer: result.text,
        ms: Date.now() - startedAt,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      }),
    providerOptions: {
      google: { thinkingConfig: { includeThoughts: true } },
    },
  }).fullStream;
}

/* Parts that carry no visible content, so they can be thrown away if the
 * primary provider turns out to have failed. */
const PRELUDE = new Set(["start", "start-step", "raw"]);

/* The SDK has no runtime provider fallback — customProvider's is for models it
 * can't look up, not for models that error. And a provider failure arrives as a
 * part inside the stream rather than a thrown call, so the only way to catch it
 * is to read the stream and watch.
 *
 * So: hold everything back until the first part a visitor would actually see. If
 * an error lands before that, nothing has been sent yet and the backup provider
 * can take the turn from the top. Past that first visible part we're committed —
 * a mid-stream failure surfaces as an error rather than restarting the answer
 * against a different model. */
function withFallback<T extends { type: string }>(
  primary: ReadableStream<T>,
  backup: () => ReadableStream<T>,
  onSwitch: (error: unknown) => void,
): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(controller) {
      const held: T[] = [];
      let committed = false;

      const drain = async (stream: ReadableStream<T>, canSwitch: boolean) => {
        const reader = stream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (canSwitch && !committed) {
              if (value.type === "error") {
                void reader.cancel();
                onSwitch((value as { error?: unknown }).error);
                held.length = 0;
                await drain(backup(), false);
                return;
              }

              if (PRELUDE.has(value.type)) {
                held.push(value);
                continue;
              }

              committed = true;
              for (const part of held) controller.enqueue(part);
              held.length = 0;
            }

            controller.enqueue(value);
          }

          /* A turn that produced nothing but prelude still has to be sent, or
             the client waits on a stream that never says anything. */
          for (const part of held) controller.enqueue(part);
          held.length = 0;
        } finally {
          reader.releaseLock();
        }
      };

      try {
        try {
          await drain(primary, true);
        } catch (error) {
          if (committed) throw error;
          onSwitch(error);
          held.length = 0;
          await drain(backup(), false);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function POST(request: Request) {
  if (fromAnotherSite(request)) {
    return rejectionResponse({
      status: 403,
      message: "This chat only answers from Rajiv's own site.",
    });
  }

  const keys = readKeys();

  if (!keys.openai && !keys.gemini) {
    /* Fails loudly rather than as an opaque upstream 400 — this is the one
     * misconfiguration that will actually happen, on a fresh clone or a deploy
     * where the env vars didn't make it. Names both accepted spellings, because
     * the failure that already happened once was a key that was present under a
     * name nothing reads. */
    return rejectionResponse({
      status: 500,
      message:
        "No model key found. Set OPENAI_API_KEY (or Openai_portfolio_key) " +
        "and/or GOOGLE_GENERATIVE_AI_API_KEY (or Gemini_flash_lite_key).",
    });
  }

  /* AssistantChatTransport forwards a frontend `system` message alongside the
   * thread; it's appended to the brief rather than replacing it, so the client
   * can add page context but can't talk the assistant out of its rules. */
  const { messages, system }: { messages: UIMessage[]; system?: string } =
    await request.json();

  /* Shape first, then the counters — a malformed request shouldn't eat into a
     real visitor's allowance. */
  const rejection = checkRequestShape(messages) ?? checkRateLimit(request);
  if (rejection) return rejectionResponse(rejection);

  /* Recorded before the model runs, so a question is captured even if answering it
     then fails — the questions nobody could answer are the interesting ones. */
  recordQuestion(messages);

  const turn: Turn = {
    system: system ? `${SYSTEM_PROMPT}\n\n${system}` : SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  };

  /* OpenAI first whenever it's configured; Gemini is the backup, and only the
     sole provider when there's no OpenAI key at all. */
  const stream =
    keys.openai && keys.gemini
      ? withFallback(
          streamFromOpenAI(turn, keys.openai),
          () => streamFromGemini(turn, keys.gemini!, true),
          (error) =>
            console.warn(
              `[chat] ${OPENAI_MODEL} failed, falling back to ${GEMINI_MODEL}:`,
              error,
            ),
        )
      : keys.openai
        ? streamFromOpenAI(turn, keys.openai)
        : streamFromGemini(turn, keys.gemini!);

  return createUIMessageStreamResponse({
    /* Reasoning is off by default in the UI stream — it has to be opted into. */
    stream: toUIMessageStream({ stream, sendReasoning: true, onError: describeError }),
  });
}
