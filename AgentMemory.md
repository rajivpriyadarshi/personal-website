# Memory for the portfolio assistant — plan

> **Status, for anyone reading this later:** this is the original plan, kept for the
> reasoning and for Rajiv's answers to the open questions at the bottom — those are
> still binding. The mechanics have moved on, and some numbers here are stale: the
> corpus is measured at ~14,800 tokens a request (not ~20k), and the full case-study
> write-ups are no longer sent on every turn. `AGENTS.md` is the current source of
> truth on where things go and how the prompt is assembled. Phase 1 shipped; Phase 5's
> question logging shipped early, at `/admin/chats`.
## The headline recommendation
**Put the whole corpus in the system prompt. Don't build RAG.**

I want to lead with this because the reflex for "give my agent memory" is a vector database, and for this site that would be the wrong call — real infrastructure and a new class of failure (wrong chunk retrieved → confidently wrong answer about your career) bought for a problem you don't have.

Here's the arithmetic. I measured the prose actually sitting in the repo today:

| Source | Words |
| --- | --- |
| `SummarySection.tsx` | 4,135 |
| `WordsSection.tsx` (testimonials) | 3,070 |
| `archive/page.tsx` (28 project entries) | 1,935 |
| `zinc-cross-border` case study | 1,870 |
| `tax-copilot` case study | 1,231 |
| `role-data.ts` (four capability areas) | 1,165 |
| `ada` case study | 760 |
| `journey-data.ts` (13 roles) | 501 |
| **Total** | **~14,700 → roughly 20k tokens** |

Gemini Flash's context window is 1,000,000 tokens. Your entire professional history is **2% of the window.** Even tripled it's 6%.

So retrieval would be solving a problem that does not exist, while introducing one that would matter a great deal here: an agent that answers a recruiter's question from the wrong chunk. Full-corpus-in-prompt has no retrieval step, so it cannot retrieve wrongly. Every answer sees every fact.

Cost is a rounding error — Flash input pricing at ~20k tokens per turn, and Gemini's implicit caching discounts the repeated prefix heavily since the corpus is byte-identical on every request.

**The tripwire:** revisit this if the corpus passes ~150k tokens — full case-study transcripts, meeting notes, every Figma write-up. Until then, prompt-stuffing wins on accuracy, latency, cost, _and_ effort. That's rare, so let's take it.
## The problem that actually needs solving
It isn't storage. It's that **your content is trapped in JSX and already drifting.**

The `persona.ts` file I wrote last session is the evidence. It says "10 years, Singapore, fintech" — and omits LazyPay, PaySense, Porter, Coding Ninjas, OYO, MapleGraph, and Blackboard Radio. Ask the assistant "has he managed a team?" today and it will say it doesn't know, while `role-data.ts` contains three detailed panels about exactly that.

Hand-copied facts drift the moment they're written. So the goal is a **single source of truth** the agent reads directly.
## What "memory" means here — two separate things
These get conflated and they have nothing in common. Splitting them clarifies the whole plan.

**1. Knowledge about you** — your career, projects, opinions, quirks. Static, authored, versioned in git, identical for every visitor. This is what makes the assistant useful, and it's 95% of the value. Everything above concerns this.

**2. Conversation memory** — what _this visitor_ said earlier, and what visitors ask in aggregate. Dynamic, per-person, needs a database.

My strong recommendation: build (1) properly and completely, ship it, and treat (2) as a later, optional add-on. A recruiter's session is five minutes and one sitting; cross-session recall is close to worthless for them. The aggregate question log is genuinely valuable, but to _you_, not to them — and it's independent of everything else.
## Structuring the knowledge corpus
The insight that shapes this: **two of your files are already perfect prompt material.** `journey-data.ts` and `role-data.ts` are clean, structured, first-person prose written for humans. They don't need converting — they need _importing_.

So rather than authoring a parallel markdown corpus that immediately starts drifting from the site, the corpus should **reuse what already exists as data, and only author what doesn't exist yet.**

```
src/content/
  ├─ profile.ts        # NEW  identity, location, contact, what you want next
  ├─ craft.ts          # NEW  how you think, process, opinions, taste
  ├─ personal.ts       # NEW  travel, photography, life outside work
  ├─ faq.ts            # NEW  fit, availability, visa, comp, relocation
  ├─ boundaries.ts     # NEW  what the agent must not answer
  └─ projects/         # NEW  narrative per project, keyed to archive slugs
       ├─ tax-copilot.ts
       ├─ zinc-cross-border.ts
       └─ ada.ts

reused directly, no copying:
  src/app/portfolio-august/journey-data.ts    → career chronology
  src/app/portfolio-august/role-data.ts       → capability evidence
  src/app/archive/page.tsx                    → project index (extract to data)
```

Assembly lives in `src/lib/agent/corpus.ts` — one `buildCorpus()` that serialises the structured data and concatenates the authored files, executed **once at module scope**, not per request. `route.ts` imports the resulting string.
## Case studies as markdown — the source, not a copy
This supersedes the `.ts`-over-`.md` call above, and it's the most valuable structural decision in the plan.

I checked the shape of the one-pagers before committing to this. `zinc-cross-border/page.tsx` is 487 lines of TSX containing one `<h1>`, eight `<h2>`s, two 2-column grids, a back link, and **zero images**. `tax-copilot` is the same: `max-w-3xl`, `line-height: 170%`, prose sections.

They are not designed surfaces. They are **markdown documents wearing Tailwind** — roughly 90 lines of markdown each, expanded fivefold by markup.

So the move isn't "convert the case studies for the agent." It's:

> **The markdown becomes the source, and the case study pages render from it.**

That distinction is the whole point. A copy authored alongside the site drifts — `persona.ts` omitting seven employers is that failure already happening in this repo. A source cannot drift, because the same bytes feed the page and the prompt.

```
src/content/case-studies/
  ├─ tax-copilot.md          # frontmatter: title, slug, tags, summary, period
  ├─ zinc-cross-border.md
  └─ ada.md
        ↓ same bytes, two consumers
   ┌────┴─────────────────────┐
   ↓                          ↓
one-pager/[slug]/page.tsx   buildCorpus() → system prompt
(react-markdown +           (raw markdown, concatenated)
 existing Tailwind classes)
```

Three things make this cheap:

- **No new runtime dependency.** `react-markdown@10` is already in the tree via `@assistant-ui/react-markdown`. I'd promote it to an explicit dependency rather than rely on a transitive one, but there's nothing to install. A `components` map preserves the pages' current Tailwind styling exactly.
  
- **The bundling objection dissolves.** `outputFileTracingIncludes` exists in Next 16 — one config line and the route handler reads the corpus reliably on Vercel. That was the only real argument for `.ts`, and it doesn't survive.
  
- **Frontmatter gives the project index for free.** Title, tags, summary and period in one place, feeding the archive listing, the page, and the agent.
  
### Where the line falls
This applies to the **one-pagers only.** Not `portfolio-august` — that hero is FractalGlass canvas, GSAP timelines and matter-js physics with copy woven into the animation itself. Markdown would destroy it.

The useful distinction is **document vs. designed surface**, and it happens to fall exactly on the one-pager / hero line. `SummarySection.tsx`'s 4,135 words sit on the designed side: extract that prose to structured data as `role-data.ts` already does, but don't try to make it markdown.
## Grounding — the part that actually matters
The failure mode here isn't a vague answer. It's the assistant inventing a metric, a date, or an employer to a hiring manager. That's a reputational risk on your own site, so it deserves more than a "don't hallucinate" line in the prompt.

Four mechanisms:

1. **Attribution in the data.** Claims carry their company and period, so the model has something concrete to name and is less inclined to smooth over gaps.
  
2. **A refusal path with somewhere to go.** "I don't have that — his LinkedIn or a direct message will get you a better answer" is a _good_ outcome. Prompt for it explicitly and it happens reliably.
  
3. **~~Deep links instead of paraphrase.~~** **Reversed by your call:** the agent never mentions another page of this site — no `/archive`, no `/one-pager/*`, and nothing about what is or isn't published there. It answers from what it holds or says it doesn't have the detail, and the only links it hands out are contact ones. So the case-study prose has to reach it as _content_, not as a URL, which makes Phase 2 load-bearing rather than optional: until a project's write-up is in the corpus, a one-line summary plus "I'd have to walk you through the rest" is the whole answer.
  
4. **An eval set.** ~25 questions in `src/content/__evals__/`, each with expected substrings and forbidden substrings, run by a script against the live route. Includes adversarial ones: "did he work at Google?", "what's his salary?", "how many years at Stripe?" Cheap to build, and it's the only thing that catches corpus drift before a visitor does.
  
## Phases
**Phase 1 — corpus foundation. ✅ Done.** Wire `journey-data.ts` and `role-data.ts` into the prompt; author `profile`, `faq`, `boundaries`; extract archive projects to data. Delete the hand-copied facts in `persona.ts`. _This alone closes the gap between what the assistant knows and what the site says, and is most of the value._

> **What shipped:** `src/content/{projects,testimonials,profile,boundaries}.ts` and `src/lib/agent/corpus.ts`. The archive page and the testimonial board now render from the extracted data, so there's one copy of each fact. `persona.ts` holds voice and rules only — the facts block is gone, and the voice is first person per your call on Q3. The projects extraction turned out much richer than the plan assumed: the archive page had 60+ named projects in nine themed groups, not the 28 the word count implied. Assembled prompt is ~11k tokens, about 1% of Flash's window.

**Phase 2 — case studies to markdown.** Convert the three one-pagers to `src/content/case-studies/*.md`, repoint the pages at them via a `[slug]` route, wire the same files into `buildCorpus()`. Then extract `SummarySection.tsx`'s prose to structured data, and author `craft` and `personal`.

**Phase 3 — grounding and evals.** Attribution, refusal path, the eval script.

**Phase 4 — the agent drives the site.** Frontend tools so it can deep-link and navigate: "here's the Tax Copilot case study" _and it opens the page_. The transport already forwards frontend tool definitions, so the plumbing exists. This is the bit that would make the assistant feel native to a portfolio rather than bolted on.

**Phase 5 — optional.** `localStorage` thread persistence; question logging to a small DB so you can see what people actually ask.

**Phase 6 — only if the tripwire trips.** Retrieval.

I'd suggest stopping after Phase 3 and living with it for a week before deciding on 4 and 5.
## Open questions — these are yours to answer
1. {==**Comp, visa, notice period, relocation.** What should the agent say? Options: answer openly, deflect to a conversation, or refuse. This is a real decision with consequences and I shouldn't guess it.==}{>>I will provide these later. Ideally the agent should have a witty tone and reply in a way saying, so you are my collegue and want to know how much i earn? smart han! But i won't be revealing it here.<<}{id="c3" by="user" at="2026-09-04T04:05:48.315Z"}
  
2. {==**Testimonials name real people** and their employers. Fair game for the agent to quote and attribute, or should it paraphrase without names?==}{>>yes. you can quote names. i will provide more<<}{id="c4" by="user" at="2026-09-04T04:06:51.815Z"}
  
3. {==**First person or third?** It currently says "Rajiv is based in Singapore." The entry card says "Ask me anything about Rajiv" — third person, consistent. But an assistant speaking _as_ you is a different, more intimate product. Your call; it changes the whole voice.==}{>>yeah it can be from frirst person perspective.<<}{id="c5" by="user" at="2026-09-04T04:07:33.472Z"}
  
4. {==**How candid about gaps and failures?** A recruiter asking "what's he weak at?" is a real question. A dodge reads badly; an honest answer is disarming. Depends how much you want to volunteer.==}{>>I will tell this to you later.<<}{id="c6" by="user" at="2026-09-04T04:08:06.755Z"}
  
5. {==~~Markdown or TypeScript for authored content.~~ **Resolved:** markdown for case studies, as their source; structured `.ts` for everything else.==}{>>This also upto you. whatever you think would be more efficient, you can tell me<<}{id="c2" by="user" at="2026-09-04T04:04:45.302Z"}
  
6. {==**Should the agent know about the 28 archive projects** in detail, or just the three with real case studies? The archive titles alone might invite questions the corpus can't answer well.==}{>>I will tell more about these projects separately.<<}{id="c7" by="user" at="2026-09-04T04:08:19.543Z"}
  
7. {==**Which case studies do you mean?** The repo has three one-pagers (760–1,870 words each). Figma has much fuller versions — `Zinc | Case Study | Brucira` at 23,000px tall, and a Secfi one at 9,200px — that aren't in the repo at all. Those would need writing out rather than converting. Still comfortably inside the token budget even so, but it's a different size of job.==}{>>I will give these later. First let;s build with whatever you have on the website<<}{id="c1" by="user" at="2026-09-04T04:03:20.331Z"}
