<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working in this repo

Rajiv Priyadarshi's personal site. Next.js 16 App Router, Turbopack, TypeScript,
Tailwind. Deployed on Vercel at **rajivpriyadarshi.space**.

The part that isn't obvious from the file tree: the site carries a chat assistant
that answers questions **as Rajiv, in the first person**, from a corpus assembled
out of the site's own content. Most of the non-obvious rules below exist because of
it. Read the "Where content goes" section before you add any fact about him
anywhere.

**The repo is public.** Assume everything you write is readable by strangers.

## Where content goes

The organising rule: **a fact about Rajiv lives in exactly one place, and both the
site and the assistant read it from there.** Never hand-copy a fact into a second
file. That failure has already happened once here — an early `persona.ts` held a
hand-written facts block that omitted seven of his employers, and the assistant
confidently didn't know about them.

| What you're adding | Where it goes |
| --- | --- |
| A fact about his career, projects, character, opinions, life | `src/content/*.ts` |
| A full project write-up | `src/content/case-studies.ts` (see the cue rule below) |
| A project that has only a one-line summary | `src/content/projects.ts` |
| What the assistant must refuse or deflect | `src/content/boundaries.ts` |
| The assistant's voice, length and honesty rules | `src/app/api/chat/persona.ts` — **rules only, never facts** |
| How the corpus is assembled and instructed | `src/lib/agent/corpus.ts` |
| Career chronology, capability panels | `src/app/portfolio-august/{journey,role}-data.ts` — these render on the site *and* feed the corpus |

**"Put this in memory" / "feed this into memory", from Rajiv, means add it to the
corpus under `src/content/`.** It does not mean an agent's own private memory
directory. His site has to keep knowing things after any given agent is gone —
that's the whole point.

Everything in `src/content/` is written **in the first person**, because the
assistant speaks as him.

### Never invent a fact

The failure mode that matters here is the assistant stating an invented metric,
date or employer to a recruiter, on Rajiv's own site. Before you add any specific
to the corpus, confirm it came from him or already exists in the repo — `grep` for
it. If he hasn't given you a number, the corpus should say so and instruct the
assistant to admit it rather than fill the gap. There are several places that do
exactly this; follow the pattern instead of resolving the gap yourself.

Corollary when Rajiv gives you new information: add **what he said**, and not the
plausible surrounding detail you could infer from it.

## The prompt has a cost contract — don't break it

`systemPrompt()` in `persona.ts` builds the request in this order, and the order is
load-bearing:

```
VOICE (persona rules)  ──┐
CORPUS (stable)        ──┤  byte-identical every request → cacheable prefix
caseStudyTail(asked)   ──┘  varies per conversation → must stay LAST
```

Providers cache the longest **identical prefix**, and cached input bills at a
fraction of the full rate. So:

- **Anything that varies per request goes at the very end.** A varying block in the
  middle makes everything after it uncacheable — usually a worse trade than the
  tokens it saves.
- **Anything stable goes in `CORPUS`, assembled once at module scope**, not per
  request.

The six full case-study write-ups are ~12,000 tokens and at most one is ever
relevant, so they're gated on `cues` declared per study in `case-studies.ts`. If
you add a case study, **add cues**, and keep them narrow — a cue broad enough to
fire on a general question ("design", "ambiguity", "redesign") costs thousands of
tokens on every unrelated turn. A missed cue is the cheap failure: the project
still has its line in the index, and the assistant is already told to give that
line and say it's the short version.

Measured, so you can tell whether you've regressed it: **~14,800 input tokens for a
typical question, up to ~18,500 when a write-up attaches, ~470 output.** Output is
under 2% of the bill; don't bother optimising answer length or `reasoningEffort`.

There is deliberately **no RAG**. Retrieval's job is to pick a slice when you can't
afford to send everything, and at this size we can. Chunking would also separate
the instructions from the facts they govern, which is where most of the quality
lives. Revisit only if the corpus passes ~100k tokens.

## Rules the assistant must keep

These are Rajiv's calls, not defaults. Don't relax them because a prompt would read
better without them.

- **Never link to another page of this site, and never discuss the site's own
  structure** — not what pages exist, not what is or isn't published on it, not the
  fact that it won't link out. It answers from what it holds or says it doesn't have
  the detail. The only links it hands out are contact ones.
- **First person, always.** "I led the redesign", never "Rajiv led the redesign".
- **Testimonials may be quoted with real names** — they're public and attributed on
  the site. Quote them exactly; don't paraphrase them into something stronger.
- **Comp, salary and similar get a witty deflection**, not a refusal and not an
  answer.
- **Positioning is Head of Design.** A question about the role gets a yes and the
  differentiator — never "it depends what you mean", and never the lack of current
  direct reports offered as a doubt. The caveat about large mature orgs is real but
  belongs only when someone asks or describes one.
- **Specificity over length.** If an answer must shrink, cut the summarising
  sentence and keep the example. On questions about character, the specific thing is
  a *behaviour*, not a project citation — reciting metrics at a question about what
  he's like is dodging it with evidence.

Ordering inside the corpus decides what the model reaches for. Two separate quality
problems here were fixed by *moving* material rather than rewriting it. If answers
feel generic, check what's near the top before you add more words.

## Secrets and privacy

- **The repo is public.** `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` live only
  in `.env.local` (gitignored) and in Vercel env vars. Never commit either, never
  print one, never paste one into a chat transcript.
- **Never prefix a key with `NEXT_PUBLIC_`** — that inlines it into the client
  bundle.
- On Vercel the keys are named `Openai_portfolio_key` and `Gemini_flash_lite_key`;
  `route.ts` resolves both those and the standard names.
- **Chat transcripts store no IP and no session identifier**, and the blobs are
  `access: "private"`. Keep it that way.
- Some source material (Figma frames) contains mock PII and internal notes. None of
  it goes into the corpus.
- `/api/chat` is unauthenticated by design — a visitor shouldn't sign in to ask a
  question — which is why `rate-limit.ts` exists. It's the spend ceiling; don't
  loosen it without doing the token arithmetic in its header comment.

## Next 16 specifics that will bite you

- **`middleware.ts` is now `proxy.ts`.** A file named `middleware.ts` is read by
  nothing — and for the `/admin` auth gate that fails *open*. The gate is
  `src/proxy.ts`, exporting `proxy` and `config.matcher`. One proxy file per project.
- **`next lint` is gone.** `npx next lint` errors with "Invalid project directory".
  Use `npx eslint src`. The repo has pre-existing errors in `archive/page.tsx` and
  the experiment pages — don't be alarmed, but don't add more.
- Typecheck with `npx tsc --noEmit`. It's fast and catches most of what matters.
- Only one dev server can run; check for an existing one on :3000 before starting
  another, and read `.next/dev/logs/next-development.log` for its output.

## Verifying a change to the assistant

Typechecking proves nothing about answer quality. Ask it a real question:

```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' -H "x-real-ip: 10.0.0.1" \
  -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"YOUR QUESTION"}]}]}' \
| python3 -c "
import sys, json
out = []
for line in sys.stdin:
    if line.startswith('data: '):
        try: d = json.loads(line[6:])
        except: continue
        if d.get('type') == 'text-delta': out.append(d.get('delta', ''))
t = ''.join(out); print(t); print(f'[{len(t.split())} words]')"
```

Two things that will waste your time otherwise:

- **Filter on `type == "text-delta"`.** Grepping every `delta` field also catches
  reasoning deltas and produces duplicated, garbled output that looks like a bug in
  the product.
- **Use a distinct `x-real-ip` per call.** Without it they share the `"unknown"`
  bucket and you'll exhaust the rate limit mid-test.

Test against the openers in `src/components/agent/AgentThread.tsx` — they're the
questions visitors actually click, and each is chosen to land on something the
corpus can answer with a specific.

## Reading what people asked

Every turn is stored as one private blob and readable at **`/admin/chats`**, behind
Basic Auth (`ADMIN_PASSWORD`, any username). Question, answer, model, fallback,
latency and token counts. `turn === 1` counts conversations rather than questions —
a thread that never reaches turn 2 means the first answer didn't land.

Storage no-ops without `BLOB_READ_WRITE_TOKEN`, so a fresh clone answers questions
normally and just doesn't keep them. Never let transcript storage become a reason a
visitor doesn't get an answer.

## House style

The comments in this repo explain **why**, not what — the constraint, the thing that
was tried and didn't work, the failure the code is guarding against. Several of them
exist because an agent (or Rajiv) lost time to something non-obvious. Match that
density; a diff here is expected to leave the next reader better informed. Don't
narrate the obvious, and don't leave a comment describing a state of affairs you
just changed.

Prose in `src/content/` is Rajiv's voice: direct, specific, British spellings,
en dashes, no LinkedIn register.

## Further reading

- `AgentMemory.md` — the original plan for the assistant, with Rajiv's own answers
  to the open questions inline. Still the best statement of *why* it's built this
  way, and it records his decisions on voice, testimonials and comp. **Its numbers
  are stale** (it predates the case-study gating and measures the corpus at ~20k
  tokens); this file is the current source of truth on mechanics.
- `Design.md` — visual language of the site itself.
