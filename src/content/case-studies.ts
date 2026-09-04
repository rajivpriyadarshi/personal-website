/* Full write-ups for the projects that have one.
 *
 * The project index in `projects.ts` gives every project a line. These are the
 * handful Rajiv has actually written out, and they're what lets the assistant
 * answer "walk me through it" instead of reading the one-liner back. Anything
 * not in here has only its line, and the assistant is told to say so.
 *
 * `project` matches a title in `projects.ts` so the two can be read together.
 *
 * Written in the first person, because the assistant speaks as him. Numbers are
 * quoted exactly as he wrote them — the assistant is told not to round or
 * restate them, since these are the figures a hiring manager will remember. */

export type CaseStudy = {
  /** Title in `projects.ts` this expands on, if there is one. */
  project?: string;
  /* Words a visitor would actually use to ask about this project, matched against
   * the conversation to decide whether the write-up is worth sending. Nearly half
   * the assistant's prompt is these six bodies, and at most one of them is ever
   * relevant — see `caseStudyTail` in `lib/agent/corpus.ts`.
   *
   * Keep them narrow. A cue broad enough to fire on a general question ("design",
   * "ambiguity", "redesign") costs thousands of tokens on every unrelated turn,
   * which is the exact thing this exists to stop. Missing a match is the cheap
   * failure: the project still has its line in the index, and the assistant is
   * already told to give that line and say it's the short version. */
  cues: string[];
  company: string;
  title: string;
  period: string;
  role: string;
  team: string;
  /** Markdown-ish prose. `###` subheads, `-` bullets. */
  body: string;
};

const LAZYPAY_REVOLVE: CaseStudy = {
  cues: ["repayment", "repayments", "repay", "revolve", "autopay", "auto-debit", "collections", "overdue", "minimum due", "due date", "emi"],
  project: "Repayment Experience",
  company: "LazyPay by PayU",
  title: "Redesigning repayments at LazyPay (Revolve)",
  period: "2022",
  role: "Led product design",
  team: "Product, Engineering, Compliance, and Finance",
  body: `### What Revolve was
LazyPay's repayment was built like a revolving credit line. Customers had a
credit limit, spent against it, and could choose to pay just the Minimum Amount
Due each month. The rest carried forward, and the available limit stayed usable —
much like a credit card. A ₹10,000 bill could mean: pay ₹1,000 today, keep using
the rest. That flexibility *was* the product.

It made LazyPay an affordability product, not just a way to pay later. A customer
having a bad month didn't have to mean a missed payment. They could pay what they
could afford, keep using their available limit, and carry the rest forward —
avoiding late fees, penalties and the risk of default while keeping access to the
credit line. For LazyPay, the same flexibility kept customers repaying and using
the product, and the carried balance kept generating interest. It avoided a
lose-lose.

### The regulation that broke it
In April 2022, RBI's Credit Card Directions said NBFCs could not issue credit
cards, charge cards, or similar physical or virtual products without prior RBI
approval. The balance could no longer revolve indefinitely.

Whatever remained unpaid after the repayment window now had to become an EMI, and
existing customers had to be moved onto the new construct. At first the solution
sounded straightforward: turn the remaining amount into an EMI. Technically it
was. That's where the interesting problem started.

### Why the obvious answer was the wrong one
Converting the balance to an EMI was the quickest way to meet the requirement.
But Revolve was LazyPay's most profitable product, and its value came from being
flexible, familiar and easy to repay. The default solution broke all three:

- It added friction to the repayment flow.
- It asked for far too much decision-making.
- It felt like taking out a new loan.

A customer who previously had one flexible credit line could now run into
multiple EMIs, tenures, interest calculations and repayment obligations as they
moved through cycles. The system could handle that complexity. The customer
shouldn't have to.

So the goal wasn't to ship a compliant version of Revolve. It was: **how do we
keep Revolve feeling like Revolve when underneath it has become a set of loans?**
That gave us four things to hold together at once — keep the experience familiar,
make it compliant, reuse the existing lending infrastructure and ship inside the
regulatory deadline, and protect the economics of the product.

### The commercial problem underneath
Less principal staying outstanding meant less interest could be earned. We
weren't only redesigning repayment; we were deliberately changing one of the
behaviours that made Revolve commercially valuable. Which raised a second
question: how much of the old economics could we protect without pushing
customers into worse repayment decisions?

I reframed the project around one question: **how might we preserve the
flexibility that kept customers repaying, while replacing the open-ended
behaviour regulation no longer allowed?**

Customers used Revolve because they couldn't comfortably clear the full amount.
Removing partial repayment wouldn't suddenly give them more money — it would turn
a customer paying *something* into a customer paying *nothing*. That would have
hurt customers, and it would have threatened the business too. For a lending
business, repayment is the engine. If customers stop repaying, nothing else
works. That became the core of the redesign.

### Exploring before committing
We had only a few days, so I deliberately carved out time to explore the problem
before committing to the obvious implementation. I built rough concepts, ran
repayment simulations, and worked through them with product, engineering and
business.

One direction was genuinely interesting: a more ambitious construct where the
balance stayed a single, continuously living loan that restructured itself with
each repayment cycle. It preserved more of the original flexibility and needed
less explaining to the customer. It also meant rebuilding too much of the
underlying system to make the deadline. So we cut ruthlessly and converged on a
simpler construct that could be built on the existing rails while preserving the
parts of Revolve customers actually cared about.

### Holding the mental model still
The system underneath got considerably more complicated — an unpaid balance
became an EMI, multiple cycles could create multiple EMIs, and interest, tenure,
limits and repayment all had to be tracked across them. But I kept the customer's
mental model intact. They still got a bill, saw their MAD, decided how much to
pay, and moved the same slider.

What changed was what that decision *did*. Previously the slider answered "how
much do you want to pay today?" Now the same gesture determined how much was
converted into an EMI and what the customer's future repayments looked like. One
familiar decision, controlling a much more complicated financial outcome.

Notably there are no tenure choices, no interest-rate calculators, none of the
usual loan paperwork in the flow. We could have exposed all the new choices, but
customers already had a relationship with Revolve, and the system already knew
enough to make most of those decisions from their credit profile, spending and
repayment history. So we took the choices away and let the system absorb the
complexity. We surfaced only what was needed to decide honestly: what they were
paying now, what remained, and what the new repayment would mean.

The same thinking shaped where things lived. Multiple loans were still being
created across cycles, but we stopped presenting them as loans — no ongoing loans
in the dues or PayLater tab; the carried amount sat in bill history and in the
loan details inside paid bills. Instead of asking customers to understand several
loans, the experience presented one repayment decision.

### Making a business trade-off discoverable instead of hidden
Removing complexity didn't mean stripping things away. It meant choosing what
needs to be there, who needs it, and why — and those answers weren't the same for
the customer, the business and the system.

The slider's default position is the clearest example. Starting at Minimum Amount
Due was better for the business, because more of the balance stayed outstanding.
But making the lowest repayment the default could quietly push customers into
paying more interest. Rather than hide the trade-off, I made it discoverable: on
first use the slider started at the full amount, travelled through the available
range, and settled at MAD. The animation said what a static screen couldn't — pay
in full and there's no future interest; pay MAD and today's payment is lower but
interest continues. A small interaction, but it let us balance the business goal
against customer understanding. That kind of negotiation ran through the whole
project.

### Reworking the journey end to end
The new construct made the maths much harder. A customer could have an EMI from a
previous cycle, a new spend, another EMI, interest on the outstanding amount and a
different repayment obligation, all moving through the same credit line. So I
revisited the repayment experience end to end, adding screens and reworking
existing ones until the pieces connected: what you owed, what you paid, what it
covered, what remained, and what happened next. That meant clearer copy and real
explainers across payment success, transaction details, dues and loan details.
The goal wasn't to show more — it was to be transparent and make what mattered
easier to understand.

Before moving to final screens I built an early stakeholder walkthrough that
simulated the customer journey across multiple repayment cycles, including the
underlying repayment maths and different usage scenarios. It moved the
conversation from "does this screen make sense?" to "what actually happens to the
customer after the change?" The screens evolved considerably from those
explorations. The core experience didn't.

### What testing changed
The first versions looked straightforward to us. They weren't always
straightforward to customers. The information was technically there;
understanding wasn't.

Testing showed people struggled to connect total due → MAD → remaining amount →
future EMI. Some expected interest to reduce differently as they moved the
slider. Others couldn't tell what would happen to their future payments. So I
iterated:

- Showed the bill amount right after the selected amount, and highlighted the
  remaining amount in the nudge text, so the maths was legible.
- Moved repayment details into a timeline that conveyed the part-payment
  schedule, with total interest visible upfront.
- Showed the full schedule rather than just the next EMI, including the amount
  the customer had selected.
- Put EMI details and the amount carried to the next cycle on the repayment
  success page.
- Animated the slider handle to establish the relationship between total due,
  minimum due and the instalment amount.
- Added a quick route to support and FAQs *before* someone chose to revolve, plus
  better slider behaviour and tap targets.

### Where it landed
By launch the complexity had largely disappeared from the customer's path. They
opened their bill, saw the amount due and the MAD, moved the slider, and the
experience showed what they were paying now, what remained, the resulting EMI and
the interest involved. They didn't need to understand the underlying loans, pick a
tenure, or manage several repayment constructs. Revolve had changed underneath. It
still felt like Revolve on top.

The goal was to complete a mandatory transition without permanently damaging
repayment behaviour or the economics around it. On migration:

- 225,000 active balances were affected in total. Those 225,000 split three ways:
  203,000 migrated or closed before the cut-off, 15,000 moved into assisted
  resolution, and 7,000 remained unresolved.
- The 203,000 that migrated or closed split three ways again: 51K repaid in full,
  117K moved to finite Revolve, and 35K entered fixed repayment.

(Those two breakdowns are at different levels — the 15,000 and the 7,000 are part
of the 225,000, not part of the 203,000. Don't nest them under it.)

Earlier warning meant fewer people were caught at the last cycle, more recovered
before default, and fewer confused customers called in. We did not restore the
old economics completely — I wouldn't claim that. What we prevented was a
mandatory product change turning into a lasting collapse in repayment.

### What I took away
The hardest part wasn't making the new financial construct understandable. It was
deciding which complexity the customer should never have to see. Design became
the translation layer between a complicated system and a familiar customer
behaviour.`,
};

/* No `project` mapping: `projects.ts` has no LazyCard line. "Credit Growth
 * Engine" is about acquisition and activation across LazyPay's credit products,
 * which is adjacent but not the same thing, so claiming the match would be a
 * small lie. Worth adding a LazyCard line to the index. */
const LAZYCARD: CaseStudy = {
  cues: ["lazycard", "credit card", "325k", "325,000", "card launch"],
  company: "LazyPay by PayU",
  title: "Building LazyPay's credit card from 0 to 325K customers (LazyCard)",
  period: "Programme ran Nov 2020 – Nov 2022",
  role:
    "Led product design. Worth being precise: I joined LazyPay in April 2021, " +
    "so the original pitch and the earliest research predate me — my work on it " +
    "runs from around the internal launch onward.",
  team:
    "Around 60 people over 12 months. Design was 4 product designers, 2 UX " +
    "researchers, 1 UX writer and 1 motion designer.",
  body: `### The problem we set ourselves
Create a credit card alternative for young Indians that's easy to use,
aspirational and transparent.

LazyCard existed to supercharge what LazyPay could already offer customers, on
three fronts:

- **Ubiquity** — LazyPay acceptance across both offline and online merchants,
  rather than only where BNPL was integrated.
- **Rewarding** — earning money while spending.
- **Credit profile builder** — a route to graduate to long-form credit by
  repaying on time.

The business case sat alongside that: retention and engagement to drive organic
cross-sell of other financial products; higher earnings per transaction than
LazyPay's other transaction-credit products; acquisition channels beyond merchant
checkout; and a way to graduate credit-ineligible customers into long-form credit
through a starting product — a fixed-deposit-backed card.

We worked inside two hard constraints: the banking partner's infrastructure, and
building on the existing front-end and back-end architecture rather than new
rails. Roughly 300 screens shipped across the programme.

### How it got built
The programme ran about a year from pitch to public launch: the product pitch for
buy-in and build funding in Nov 2020, user research and partner-bank discussions
in Jan 2021, an internal launch with RBL to lay the rails in May 2021, and the
public launch with SBM Bank in Dec 2021. (Those are the programme's dates. Mine
start in April 2021.)

### The design decisions that mattered
**Positioning the card as a primary LazyPay offering.** I revamped the app's
information architecture so the credit limit and the card became an anchor in the
header, which is what drove discovery and utilisation.

**A memorable unboxing, to create organic referral loops.** We crafted a distinct
LazyCard design and kit customers would actually talk about — balancing the right
material against keeping printing costs low.

**Card controls upfront, to ease anxiety.** Card controls and the block-card
option were made easy to find, which gives a sense of security and control when
someone is using an unfamiliar financial product.

**Borrowed trust from known institutions.** "RBI-approved Bank", Visa, and
certifications appeared repeatedly through the journey to build trust around SBM
Bank, which customers didn't know.

**A prominent virtual card.** Customers could copy the card number and CVV, which
cut the friction of a first transaction and captured more online usage before the
physical card ever arrived.

### What we changed after launch
- **Auto-ordering the physical card during onboarding.** Early reads showed more
  customers activated after delivery, so we added it even though it meant more
  steps.
- **Tap & Pay prompts** in-app and via notifications on the card details page.
  Tap & Pay usage went from **32% to 54%**.
- **A rewards insert in the card kit**, so the first-transaction cashback was
  front of mind when the card arrived — aimed at activation rate.
- **Rewriting the secured-card pitch.** We'd built it around "skip the waitlist",
  which read as disingenuous and hurt take-up. We tested alternatives; naming the
  actual reason someone was ineligible performed best.

### What the numbers said
Programme metrics:

- **325K cards in 3 months.**
- **₹270 Cr+ monthly spend run rate within 3 months.**
- Activation rates of **74% in month 1** and **80% in month 2**.

Early reads from the public launch:

- Monthly online transaction value ran **70% higher than offline**.
- Average spend per customer rose, and so did their average spend on UPI and BNPL
  — the card lifted the rest of the relationship rather than cannibalising it.
- Customers on lower limits (under ₹20K) showed high retention.
- Customers with physical cards had **5% higher** first-transaction activation.
- Feature usage among monthly transacting users: copy card number ~35–40%
  (3+ times per customer per month), tap to view CVV and expiry ~70–80%
  (3+ times), view cashback earned ~45–50% (~2 times).
- Around **65% of customers came from Tier 2 cities**, and around **66%
  self-reported as salaried**.

### How it ended
LazyCard was **discontinued in November 2022** because of changes in RBI
regulation, and was replaced with a co-brand programme built in partnership with
RBL. Worth saying plainly: the product was shut down by regulation, not by
performance.`,
};

const ELEVATE: CaseStudy = {
  cues: ["elevate", "design system", "design language", "component library", "design tokens"],
  project: "Common Design System",
  company: "LazyPay by PayU",
  title: "Elevate — LazyPay's unified design language",
  period:
    "The audit snapshot is from 2021 and adoption was tracked toward Q2 FY24. " +
    "If someone asks for a precise start year, say you don't have it rather than " +
    "guessing.",
  role: "Led the design system work",
  team: "Design, with engineering on handoff and implementation",
  body: `### Why it was needed
We'd spent years continuously building and shipping features on the LazyPay app,
and many of those were individual launches driven by a specific business
requirement. Legacy tech architecture — a by-product of M&A — layered more
inconsistency on top, so the product ended up carrying several visual styles at
once. It was time to refresh the visual language in line with our brand
positioning, and to build credibility and trust through an experience that felt
like one product.

### How we went about it
- Defined a visual-language moodboard in line with the brand positioning:
  new-age credit products that fast-forward you to a better financial life.
- Audited the existing app screens to build components that were scalable and
  flexible rather than one-off.
- Defined the foundations — typography, colour, spacing, corner radius,
  iconography, 3D illustrations, motion — plus content guidelines and tone of
  voice.
- Streamlined the dev-handoff process, because a system that isn't implemented
  faithfully isn't a system.
- Rolled modules out **in order of business priority rather than as a big-bang
  redesign**. That was the call that made it survivable: no freeze, no
  all-or-nothing migration.

### What it contained
Three layers: **content** (voice, tone and style guidelines for designing with
words), **components** (atomic units — buttons, text fields, lists), and
**patterns** (plug-and-play functional modules: pages, screens, modals).

We named it **Elevate**, for the philosophy of progress — the ability to keep
moving onwards and upwards.

Three design principles ran through it:

1. **Simplicity.** Above all, our experiences are simple — clear, frictionless
   design that empowers users to take control of their credit journey.
2. **Transparency.** We believe in fostering openness and trust, so customers can
   keep relying on us for their financial needs, worry-free.
3. **Delight.** Life's too short not to have fun. We keep delight at the heart of
   the design so users are happy and enjoying themselves.

The voice was genuine, friendly and light-hearted.

### Where it got to
**60% of live modules had moved onto the new design system**, targeting 100% by
Q2 FY24.`,
};

const ZINC_ADA: CaseStudy = {
  cues: ["ada", "counsellor", "counselor", "wealth", "global indians", "nri"],
  project: "Zinc Ada (the whole group in the index, plus Zinc Wealth)",
  company: "Zinc",
  title: "Building wealth for global Indians, and Ada, the AI counsellor in front of it",
  period: "2023–24",
  role: "Led product design",
  team: "Product, Engineering, Compliance, Finance and Marketing",
  body: `### The idea Zinc started with
Help Indians invest globally, diversify beyond INR, and build assets closer to
the currency of their future lives.

We were building a global wealth experience around a fairly simple idea: people
don't just invest money — they invest *towards* something. Education is the clean
example. If a parent is saving for a child who may study abroad, or planning for a
future where the family may earn and spend in different currencies, concentrating
their wealth in INR creates a mismatch between where their money is invested and
where their future expenses will be. Zinc was building the infrastructure to close
that gap: GIFT City licences, an Airwallex integration, a Global Scholar UCITS
ETF, remittance rails, and the PSP account and regulatory setup underneath.

The core product was goal-based investing built around a future need — investing,
holdings and tracking in one experience, with a dedicated fund for higher
education that preserved wealth in USD. That part was already taking shape: the
licences, the funds, the banking and investment infrastructure, and the journeys
needed to make global wealth accessible to Indian customers.

### The problem that wasn't a product problem
We had the financial product. But the financial decision happens *years* before
the transaction, and parents weren't ready to have a wealth conversation yet.

The research showed us why. Parents don't begin with "how should I invest for
overseas education?" They begin with "what will my child do?" One parent put it
this way:

> "Property, gold, savings, sab already hai... aur dusre investments bhi hai...
> lekin abhi clarity nahi hai ke bacche ko kya karna hai, kya padhna hai..."

For a parent planning to send their child abroad, the questions come first: where
should they study, what should they study, what will it cost in five years, and
how should the family prepare financially?

That's where Ada came in. **Ada wasn't a separate product — it was the
acquisition layer for wealth.** It gave us a way to enter the relationship at the
moment the need first becomes real.

### What Ada was
An AI education counsellor for students and parents. It understood their goals,
interests, academic background, preferences and constraints, and used that context
to help them explore what came next.

It started as a quick AI chatbot experiment by the data and backend team. The
founder and the team liked what they saw, and design came in to turn it into a
real product. We deliberately didn't set out to polish the chatbot — we wanted to
evolve it into a counsellor that could deliver the experience of a genuinely good
human one.

### The design problems worth naming
**Getting real context out of an open-ended conversation.** The first version was
an open-ended voice interview across five areas — academic background,
non-academics, past experience, goals and aspirations, and college and course
preferences — with the system tracking what had already been covered rather than
marching through a form. The hard part was pairing that openness with guided next
steps so every conversation still produced a concrete outcome.

**Making an open conversation produce a meaningful artefact.** We showed people
how complete their picture was — which sections were done, which were still thin,
and what specifically would make a difference — so an unstructured chat resolved
into something they could act on.

**Two conversations, one shared plan.** Parents and students both talked to Ada
about the same child, which raised a question that isn't really a UI question:
who gets to change what?

**The journey around it.** Register, an assessment call with Ada, then a
CollegePath — the plan itself — and a 1:1 with a human counsellor, with a
counsellor dashboard behind it so the generated context was usable in a real
conversation.

### Building a visual world instead of writing better prompts
The work didn't stop at product screens. Ada was going to show up everywhere — in
CollegePath reports, university pages, school campaigns, landing pages,
presentations and eventually printed material. We needed a *lot* of imagery.

Generative image models were still rough then. They'd produce something beautiful
one moment and completely unusable the next: faces would change, details would
drift, styles would break. Getting one good image was possible. Getting a hundred
that felt like they belonged together was much harder.

I didn't want to solve that by writing better prompts for every image. I wanted to
build a world. I'd come across an Airbnb illustration system built on a similar
idea — instead of making every illustration identical, they created a common
universe, where the setting, characters and foreground can change but the
underlying visual world stays familiar. That became an interesting way to think
about Ada: what if a university campus in one image, a student studying in
another, and an illustration inside a CollegePath report could all feel like they
came from the same universe? Different stories, same visual world.

It let us move quickly across CollegePath reports, university recommendation
pages, school campaigns, landing pages, and social and sales material — a visual
system that scaled without one-off image production. And it wasn't limited to
images; I extended the same thinking into typography, interaction, motion and the
broader visual behaviour of the product.

### Turning Ada into an experimentation system
Once the core experience worked, I helped turn Ada into a flexible way to test new
audiences and acquisition channels. Rather than rebuilding the product for every
hypothesis, we reused the underlying conversational model and redesigned the
experience around it.

**Schools.** Schools got Ada for free, wrapped in a full acquisition experience I
built end to end — pitches, assessment journeys, certificates, event material,
parent communication.

**Reports at volume.** School assessments created a scaling problem: every student
needed a personalised, multi-page report. I designed the report template in Figma,
mapped its variables to a Google Sheet, and used a Figma plugin so student data
could populate the template and generate hundreds of personalised pages.

The rest was still manual — combining six or seven pages into one PDF, renaming
every file, organising by school and student, exporting different resolutions — so
I used ChatGPT to build a lightweight automation that combined each student's
pages, renamed files from school and student details, organised them into folders,
exported both 100 DPI and 300 DPI versions, and processed hundreds in batches. I
also designed a simple interface so counsellors could edit and regenerate reports
without waiting on design or engineering.

**Student-first vs parent-first.** We tested both propositions through events,
webinars, kiosks and digital marketing, with end-to-end pitches and event
material. Students engaged with the exploration itself; parents were more
interested in progress, outcomes and future costs.

### Where it landed — and this part matters
Ada became a functioning AI counselling product used by students, parents and
counsellors. The strongest signals were qualitative:

- Users completed substantial voice interviews.
- Students came back for follow-up conversations.
- Parents asked for counselling.
- The recommendations were generally trusted.
- Counsellors used the generated context in real interactions.
- It contributed a small number of wealth customers.

**It did not become the scalable acquisition loop Zinc needed.** The path from
education guidance to wealth stayed long, and external conditions around studying
abroad weakened at the same time. I'd rather say that plainly than dress it up.

What it did give me is hands-on experience designing an AI-native product across
adaptive conversation, memory, editability, generated artefacts, human review, and
implementing quickly.`,
};

const LAZYPAY_APP_REVAMP: CaseStudy = {
  cues: ["homepage", "home page", "app revamp", "super app", "credit limit", "paylater", "pay later", "beyond paylater", "app redesign"],
  project: "LazyPay App Revamp",
  company: "LazyPay by PayU",
  title: "Redesigning India's credit super app — LazyPay beyond PayLater",
  period: "2023",
  role:
    "Senior Product Design Manager, split roughly evenly between leading the " +
    "programme's design and hands-on execution",
  team: "Product, Engineering, Research, Content, Brand and Marketing",
  body: `### A credit super app trapped inside a PayLater experience
LazyPay began as a simple proposition: use PayLater for everyday purchases and
settle the bill later. The business didn't stay simple. Over time it expanded into
a much broader credit ecosystem — XpressCash, BillPay, Cards, Revolve, Rewards and
several new lending experiences. The business had successfully created more ways
for customers to access credit. The app still behaved as though PayLater was the
only product that mattered.

Customers kept describing us as "that PayLater app". New products were hard to
discover. Different credit lines introduced conflicting mental models. Every launch
needed another banner, card or shortcut on the homepage.

Internally the same problem showed up in a different form. Every product team
wanted visibility. Every campaign wanted the top banner. Every roadmap added
another component. Every urgent message competed with a promotion. The homepage had
become less of a customer experience and more of a negotiation between teams.

LazyPay had outgrown its interface. Together with Kanupriya, our Head of Design, we
started a redesign of the consumer app — not to make it look better, but to build
an experience that could carry the next phase of growth. The central question:

> How do we turn a PayLater-led app into a multi-product credit platform without
> overwhelming customers or rebuilding the homepage for every new launch?

### My role
I managed product design across the programme — aligning teams, shaping direction,
reviewing work, holding coherence across products — while directly designing
several critical journeys and contributing to the product architecture itself. My
hands-on scope covered information architecture and the product model, homepage
strategy, profile and credit management, XpressCash and BillPay, PayLater and
Revolve, onboarding/activation/KYC, repayments, and the UX and interaction design.

Within the design team ownership was distributed across products and journeys. I
led the hands-on design of XpressCash and BillPay, and contributed to the homepage,
the shared interaction patterns and the system-level decisions connecting
everything. Alongside that I helped the team establish a shared direction,
facilitated critiques and cross-functional reviews, resolved dependencies across
journeys, and made sure work from different designers stayed part of one coherent
system.

Unlike most large redesigns, this one didn't start from a detailed PRD. We began by
investigating the existing experience, studying customer behaviour, testing
different product models and building prototypes. As the direction firmed up,
Design and Product turned the emerging framework into an implementation PRD. The
strategy developed through research and experimentation instead of being boxed in
by predetermined screen requirements.

### The real problem wasn't clutter
At a glance it looked like a crowded homepage — too many banners, too many cards,
too many competing calls to action. But the clutter was a symptom. The deeper
problem was that the app no longer had an organising idea. PayLater, XpressCash,
BillPay and Cards had different journeys, different credit models and different
eligibility rules, and all of them were being inserted into an interface designed
for one product. The result was disconnected experiences competing inside the same
shell.

Four underlying problems:

1. **LazyPay was memorable. Its products were not.** Customers knew the parent
   brand but couldn't recall or explain what was inside it.
2. **One small credit limit defined the entire platform.** The PayLater limit
   dominated the homepage, so customers read it as the total value LazyPay could
   offer them.
3. **Important communication had no hierarchy.** Repayment alerts, KYC issues,
   abandoned applications and promotions all competed for the same few surfaces.
4. **Every business change created more interface debt.** New launches needed
   bespoke layouts, which increased inconsistency and slowed Design and Engineering
   both.

So we set a broader ambition: move LazyPay from a collection of credit features to
an understandable, scalable product ecosystem.

### The strategic shift
Three foundational decisions, made before redesigning any component:

- **Home would be organised around products, not a credit limit.** Its job was to
  help customers discover what LazyPay could do for them, not display a single
  PayLater number.
- **Credit management would move into Profile,** which became a financial
  dashboard for limits, eligibility and relationships across products.
- **The interface would behave like a system.** Every major region of the homepage
  would have a defined purpose, priority and set of rules.

That gave us a simple mental model. Home: discover and use products. Profile:
understand and manage credit. Product pages: learn, activate and transact. Alerts:
resolve important issues. Promotions: discover relevant opportunities.

### Replacing cross-sell with product discovery
Research showed a consistent pattern: customers opened LazyPay regularly, but
mostly to repay an existing bill. They rarely explored what else was there. The
easy instinct would have been to make the promotions bigger. Instead we asked what
would make customers understand that LazyPay contains multiple distinct products.
The answer wasn't another campaign. It was architecture.

We introduced a dedicated **product grid** as the primary navigation layer of the
homepage, so every major product got a stable, recognisable position instead of
temporary visibility through a banner. That changed the homepage's job: it used to
push whichever product needed attention that month, and now it taught customers how
LazyPay was structured. Products could then use their own landing pages to explain
what they were, what problem they solved, whether the customer was eligible, how
they differed from other LazyPay offerings and what to do next.

### Taking the credit limit out of the centre
The PayLater limit had always been the most prominent thing on the homepage. That
made sense when PayLater was most of LazyPay's value. It stopped making sense once
different products had different credit lines and eligibility models. A customer
might have a small PayLater limit, a larger XpressCash offer, a Card with its own
limit and another product awaiting activation — and the first thing they saw was
one number attached to PayLater, which anchored their view of the whole platform.

We explored showing multiple limits together, but it read as a financial dashboard
rather than a useful homepage, and it forced customers to understand the
relationships between several credit products before they could do anything.

So we made the more decisive call: **we removed credit limits from the homepage
altogether.** Home became product-led; credit management moved into a redesigned
Profile showing all active products, available limits, account states and relevant
actions in one place. That stopped one product's limit defining LazyPay, and it
created a cleaner split — the homepage answers "what can I do?", Profile answers
"what credit do I have?". It felt like a big shift, but it simplified the mental
model and gave every product an equal chance to stand on its own.

### Recognisable products inside one brand
The old experience treated PayLater, BillPay, Cards and XpressCash as features
inside LazyPay, but customers needed to recognise them as distinct products.
Working with Vikas Sinha, we explored how far each product's identity should
extend. If every product looked identical, customers wouldn't remember them. If
every product behaved like a separate brand, the ecosystem would fragment.

We landed on a **parent-and-product model**. LazyPay stayed the trusted parent
brand, and each product got its own name, icon, visual cues, illustration language,
personality and educational narrative — without bolting "LazyPay" onto every
product name. The app established the parent context; the products became
individually recognisable inside it.

Underneath, we unified the foundations: typography, spacing, layout principles,
icon construction, illustration style, motion, component behaviour, interaction
patterns. The aim wasn't uniformity. It was **coherence with distinction** —
customers should be able to tell products apart while immediately understanding
they belong to the same family.

### Designing rules instead of adding components
Earlier versions of the app had accumulated one-off solutions: a new campaign got a
new banner, a new journey got another card, a new alert got a custom state. Each
one solved something immediate and made the homepage harder to maintain.

We stopped designing the homepage as a fixed composition and designed it as a set
of systems with clear responsibilities — brand and trust, product navigation,
critical alerts, lifecycle nudges, promotions, product education, recommendations.
Every system had documented rules: its purpose, where it appeared, what priority it
got, which formats it supported, what could vary, what had to stay fixed, and when
it shouldn't be used at all. That made the homepage flexible without making it
chaotic.

**The header: trust before promotion.** With the limit gone, we reconsidered what
someone needs to feel on opening a credit app. The answer was reassurance. The new
header carried clear LazyPay brand presence, visible KYC and account status,
persistent access to Help, and flexible visual treatments for different states and
campaigns. Putting KYC status next to the brand let customers see whether their
account was ready without digging through settings or hitting an error later.
Keeping Help always available took some anxiety out of payments, credit and
verification. Three interchangeable background treatments meant launches, festivals
and campaigns could be supported by swapping assets rather than restructuring the
interface.

**Alerts: urgency had to be earned.** There had been one prominent banner area and
one repayment-alert component, and teams had started using them for everything —
overdue repayments, incomplete KYC, abandoned applications, card shutdowns, journey
continuation, launches, promotions. Critical issues and optional messages looked
alike, so customers couldn't tell what actually needed attention.

We built a framework on two ideas. **Priority determined placement:**

- **P0 — critical and blocking.** Ignoring it creates an immediate financial or
  functional consequence: overdue repayments, restricted account access, failed
  mandatory verification. A P0 could interrupt or block the primary action.
- **P1 — important but non-blocking.** Incomplete onboarding, KYC expiry,
  application continuation, pending setup. These went through a dedicated nudge
  system rather than taking promotional space.
- **Promotional.** Optional opportunities, offers and product education, kept
  visually and behaviourally separate from alerts.

**Severity determined emphasis** — the visual treatment reflected the actual
consequence of inaction, so an overdue bill that could attract a penalty got far
more weight than an incomplete application or a recommendation. It protected
customers from manufactured urgency, gave genuinely important information the
prominence it deserved, and stopped operational messages eating the marketing
surfaces.

**The product grid: navigation that teaches.** This was the most important
structural change, and it wasn't just a set of shortcuts. It had three jobs: make
products discoverable, build long-term product recall, and explain how the
ecosystem was organised. We made differentiated icons so customers could start
associating a visual identity with each product. Usability testing showed larger
tiles with short descriptions helped people understand unfamiliar offerings better
than compact icons alone — especially when a new product sat beside something they
already knew, like PayLater, because the familiar product gave the unfamiliar ones
context.

The grid was dynamic too, adapting to product availability, customer eligibility,
activation status, lifecycle stage, current launches and business priorities. For
someone meeting the ecosystem for the first time it appeared expanded — larger
tiles, descriptions, subtle motion — and condensed into a more efficient pattern as
familiarity grew. **The interface got simpler as the customer got more
knowledgeable.**

**Product stories.** A small "New" badge can't explain a credit product. We adapted
a familiar pattern: a highlighted product tile signalled new information, and
tapping it opened a fullscreen sequence that could introduce a launch, a major
update, a new benefit, eligibility, a use case or the next action. It let us
educate richly without permanently increasing homepage density, and gave launches a
repeatable interaction model instead of a new campaign format every time.

**Promotions: one surface, multiple formats.** A fixed square container that could
carry static artwork, Lottie animation, muted video, video with sound, or expand
into a fullscreen story. A simple offer works as a static image; something like
one-tap payment without an OTP is easier to grasp in motion. Fixed container,
variable content — Marketing and Product got room to experiment without new
layouts.

**First-use education: useful once, invisible afterwards.** A dismissible,
lightweight, usually animation-led card, contextual to a product or state, shown
sparingly and designed to disappear once understood. We also made educational
banners showing products in real situations rather than in financial terminology —
shifting the message from "here is another credit product" to "here is a problem
this product can help you solve."

### Beyond the homepage
Activation and repayments were two of LazyPay's most consequential journeys, and
both followed the same principle: **reduce ambiguity before adding speed.** Each
eventually became a substantial project of its own.

**Making activation feel less like a black box.** Credit activation involves
compliance checks, underwriting, document collection and external dependencies. Not
every step can be removed or made instant — but the uncertainty around them can be
reduced. Customers previously had little visibility into what they'd completed,
what remained, why information was needed, whether something was still running in
the background, or what to do when a step failed. We rebuilt the journey around
continuity and transparency: a persistent progress summary covering completed,
pending and failed steps; direct journey recovery so an expired session meant
returning to the step rather than restarting; contextual explanations for sensitive
information and document requests; visible background states so verification and
underwriting communicated rather than appearing frozen; and actionable errors that
explained both the issue and the next step. The objective wasn't to make a
regulated journey feel artificially effortless. It was to make it feel predictable.

**Making repayments understandable before making them faster.** Customers could see
an amount due but often couldn't tell how it was calculated, which product it
belonged to, whether an automatic payment had started, what would remain after
paying, or what a partial repayment would change. We reorganised repayments around
three questions: what do I owe, why do I owe it, what happens next. The overview
pulled together the due amount, bill status, payment method, active credit products
and the relevant primary actions.

For **PayLater** we separated current utilisation from previously billed amounts
and surfaced the due-amount breakdown upfront, so nobody had to infer how their
bill was calculated. For **XpressCash** we added explicit autopay states — request
raised to bank, payment in progress, settlement pending, payment completed — which
took away the anxiety of money having left the account while the loan status hadn't
updated. We also combined multiple active loan instalments into a single repayment
flow where possible.

**Making partial repayment an informed choice.** The old journey defaulted people
towards the minimum amount due, which made partial repayment easy to pick without
helping anyone understand what it meant. We made paying less than the full amount
an explicit decision: removed minimum due as the default selection, introduced a
custom repayment slider, showed how the chosen amount affected the remaining
balance, and explained the calculation through a timeline-style summary. The goal
wasn't to discourage partial repayment — it was to stop an important financial
decision feeling like a harmless default.

### How we worked
The redesign ran over several months across multiple teams, and rather than
disappearing into a design phase and presenting a finished solution we kept the
work visible from the start: weekly design critiques, bi-weekly cross-functional
reviews, interactive prototypes, Slack feedback, early engineering involvement, and
ongoing decision documentation.

Engineers took part while the framework was still being shaped, not once the
screens were done. Researchers helped us test whether customers understood the
*product model*, not just whether they could complete a task. Content, Brand and
Product helped define how the ecosystem explained itself. Less a sequence of
handoffs, more a continuous conversation — which mattered because the main design
challenge was organisational as much as visual. The system had to work for
customers *and* give internal teams a shared set of rules.

### Outcome, including what I can't claim
The redesign became the foundation for the next generation of the LazyPay consumer
app: a product-first information architecture, a clear separation between product
discovery and credit management, a stable home for every major product, distinct
but connected product identities, a unified visual and interaction language, a
priority-based communication framework, reusable modules for launches and
campaigns, more transparent activation, more comprehensible repayments, and a
scalable base for future products.

The most meaningful shift was conceptual. LazyPay stopped presenting itself as one
PayLater product surrounded by extra features and started behaving like a family of
financial products on a common platform.

**I left PayU shortly after launch, so I don't have reliable post-launch engagement
or repayment metrics I can attribute to this work. I'd rather be explicit about
that than quote directional numbers without enough context.** Say exactly this if
someone asks for the results — don't reach for a number.

There is another measure, though. The homepage kept running on largely the same
underlying architecture for **about three years**, supporting new products,
campaigns and customer states without needing another fundamental redesign. The
framework was built to absorb change without losing coherence, and its longevity
suggests it did.

### Reflection
The hardest part of redesigning a homepage is rarely the homepage. It's deciding
what the company wants customers to understand, which product deserves permanence,
which message deserves urgency, what should stay stable, what should be allowed to
change, and how future teams should extend the experience.

The most important outcome wasn't a cleaner interface. It was a shared product
model — one that helped customers understand what LazyPay had become, and helped
the organisation keep building without turning every new priority into another
layer of clutter.

We didn't just redesign the app for the products LazyPay already had. We designed a
system for the products it hadn't launched yet.`,
};

/* Zinc's second phase. This one is different in kind from the others: the outcome
 * is a way of working and a converged product direction, not a shipped result, and
 * Rajiv is explicit that the current product isn't proven. The assistant needs to
 * carry that caveat, so it's stated inside the body rather than left to inference. */
const ZINC_2: CaseStudy = {
  cues: ["zinc 2.0", "zinc 2", "twelve", "12 opportunities", "12+ opportunities", "dozen", "what to build next", "opportunity space"],
  project:
    "Most of the Zinc groups in the index — the AI wealth work, Volo, the agent " +
    "infrastructure, Donna, the community experiments and the tech-worker wealth " +
    "platform are all experiments from this phase.",
  company: "Zinc",
  title:
    "Zinc 2.0 — designing through ambiguity: evaluating 12+ opportunities and " +
    "converging on a new wealth product",
  period: "2025–26",
  role: "Principal Product Designer, owning product definition as well as design",
  team: "Founders, Design, Engineering, AI and Operations",
  body: `### What the job actually was
Over seven to eight months we explored more than a dozen domains. Some ideas
lasted a month. Others gave us an answer within weeks.

On paper that could look like a catalogue of pivots. In practice it forced a
fundamental change in how I worked. My responsibility was no longer to design a
product after the opportunity had been defined. I had to help the team enter
unfamiliar markets, turn ambiguous ideas into testable propositions, and generate
enough evidence to decide what deserved further investment.

The challenge was not moving quickly. It was building a system in which speed
produced learning rather than simply producing more software.

### Why Zinc had to change
Zinc's first phase connected education, remittance and global investing into a
cross-border wealth proposition. The need was real, but the model became difficult
to scale. Investing for a child's education involved a large financial commitment
and significant trust, and as a new company, converting families often took months
of conversations, face-to-face meetings and relationship-building beyond the
product. Growing uncertainty in the study-abroad market made the opportunity less
compelling over time.

Our global-investing products reached customers too, but maintaining the financial
licences needed to operate them made the model expensive. We decided to use
regulated partners rather than keep carrying that infrastructure ourselves.

At the same time AI capabilities were advancing quickly, and we saw an opportunity
to build products that could understand complex information, hold context and
complete work conventional software couldn't. Most of the team moved to Singapore,
and Zinc became smaller, more generalist and deliberately AI-native.

We broadly knew the territory: complex, context-heavy problems where AI could make
a fundamentally better product. What we didn't have was the customer insight to
build a durable business around. Finding that insight became the work of Zinc 2.0.

### My role changed with the problem
There were no dedicated product managers in this phase. As Principal Product
Designer I increasingly owned both product definition and execution — working with
the founders to turn early ideas into hypotheses, researching unfamiliar markets,
speaking with users, mapping business and regulatory constraints, prioritising
scope, and helping engineering decide what to build first.

I also got directly involved in development: using coding agents to build
interactive experiences, generating product-specific visual material, and working
inside the implementation rather than treating design delivery as the end of my
job.

Research, product management, design and development stopped being separate
stages. They became one continuous loop:

**ambiguous opportunity → system model → product thesis → working experience →
customer evidence → decision**

That changed the question I opened a project with. Instead of "what should we
design?", I started with "what do we need to learn, and what's the fastest
credible way to learn it?"

### The one repeatable loop
Every exploration began differently, but the same framework gave it structure.

**1. Frame the opportunity.** Start with the change that made the idea possible —
a new AI capability, a shift in customer behaviour, an underserved community, a
workflow that had outgrown its software. Turn a broad possibility into a clear
product question.

**2. Map the system.** Before designing an interface, map the people, incentives,
information, constraints and decisions around the problem. This is how I learned
unfamiliar domains without pretending to be an expert, and it gave founders and
engineers a shared model to work from.

**3. Isolate the riskiest assumption.** Separate what we knew from what we were
assuming. For one product the risk was whether customers would trust an agent to
act for them; for another, whether community data could support a financial
decision. The most important assumption decided what we built next.

**4. Build the minimum credible experience.** Not abstract feature descriptions,
and not polished screens disconnected from real behaviour. Exploring document
intelligence meant building a realistic document flow. Exploring an agent meant
making it perform a meaningful task. Exploring a financial workflow meant
representing the decisions and consequences a customer would actually meet. The
objective wasn't the smallest interface — it was the smallest experience capable
of producing an honest reaction.

**5. Turn evidence into a decision.** After each test I documented what we'd
learned, what was still uncertain, and what should happen next. Continue, change
the thesis, or stop — and stopping wasn't failure if the experiment had resolved
an important question. That kept every exploration from turning into an open-ended
roadmap, and let useful insight survive even when the product didn't.

### How AI compressed the loop
I started out using AI as a conversational tool for research, ideation and
writing. That helped, but it wasn't consistent enough for the pace we needed.

So I began treating AI as a set of specialised collaborators. One context helped me
build a working understanding of a domain. Another generated competing product
directions. Image models produced visual material specific to the experience.
Coding agents turned flows into interactive products. Independent critique loops
compared the output against references, requirements and explicit quality criteria.

I deliberately separated exploration from evaluation: one context expanded the
possibility space, another challenged the assumptions, a third reviewed the result
against the original thesis.

I still made the calls on hierarchy, interaction, scope, taste and what to remove.
**AI increased the surface area I could cover; it didn't replace judgement.** What
it did buy us was the ability to go from a loosely defined opportunity to a
working, customer-ready experience without waiting on a sequence of research,
design and engineering handoffs — which shortened the distance between an idea and
the evidence needed to judge it.

### The products were the evidence
We applied this across employee health with **Volo**, tax planning, professional
networking through **Donna**, automated prospecting, WhatsApp operations through
**Business in a Box**, and agent infrastructure through **OpenClaw**. We also
explored community-specific financial products: **Runner** combined social
running, community rewards and an affinity card, and **Creator Finance** examined
whether creator income, engagement and platform activity could support more
relevant rewards and credit.

These weren't independent bets competing for attention. Each tested a different
part of the same AI-native thesis.

- **Agent products tested whether software could complete work.** Donna,
  Prospecting and Business in a Box showed that a useful agent needs more than a
  conversational interface — it needs persistent context, permission to act, and a
  position inside an existing workflow.
- **Community products tested whether identity could create relevance.** Runner
  and Creator Finance asked whether a shared identity or behavioural signal could
  make a financial product more useful. We chose not to continue them as
  standalone propositions, but they reinforced that context improves relevance only
  when it's attached to a problem consequential and recurring enough to matter.
- **Complex workflows tested the value of understanding.** Volo, Tax Copilot and
  OpenClaw each exposed a version of the same challenge: AI can act reliably only
  when it understands the surrounding documents, relationships, history,
  permissions and constraints.

Across all of them I looked for the same signals: did the product have enough
context to be useful; was the problem frequent and consequential enough to change
behaviour; could the system complete work rather than just generate information;
did the workflow create a natural path to adoption; and could we explain the value
clearly enough for someone to trust it?

### Speed only counted when it changed a decision
AI let us build almost anything, which made deciding what *not* to build the more
important skill. So the process ran at two speeds: fast while researching
possibilities and making something testable, slow while interpreting evidence,
judging whether a signal was meaningful, and deciding what should survive into the
next exploration.

Over time the recurring patterns became more valuable than any single product.
Context, memory, trust, fragmented information and the ability to act showed up
again and again across otherwise unrelated domains.

By early 2026 we'd shown we could execute across unfamiliar markets. The next step
wasn't another broad exploration — it was narrowing the search around the
strongest accumulated signal.

### 125+ conversations created the convergence
We focused on technology professionals whose wealth had been created through RSUs,
ESOPs and global equities. **More than 125 conversations** revealed a repeated
pattern: their wealth had grown faster than the financial system serving them.

Their assets were fragmented across employers, brokerages, countries and
currencies. Many had significant concentration in a single company, limited
understanding of their estate-tax exposure, and no clear way to unlock liquidity
without selling the equity that had created their wealth. After moving to
Singapore, a lot of us could relate to the problem personally.

We turned those conversations into focused product probes. **OneView** consolidated
global holdings. **Wealth Map** modelled the people, assets, liabilities and
jurisdictions around a customer. Estate and tax tools made hidden risks visible.
Lending concepts explored liquidity against global equity.

Unlike the earlier experiments, these didn't point in different directions. They
were different views into the same underlying system.

### The deeper problem was context
As we connected them, our understanding of wealth management changed. Wealth wasn't
a portfolio. It was a living system of people, ownership, documents, decisions and
future goals.

We first explored this as a direct-to-consumer proposition. But complex financial
decisions kept depending on trust — and that trust already existed, between
families, advisers, wealth managers and family offices. The opportunity wasn't to
replace those relationships. It was to give the professionals inside them a more
complete and actionable understanding of every customer.

That was the clearest reframe Zinc 2.0 produced.

### The experiments became the foundation
We now think about wealth through three connected dimensions:

- **People** — family members, entities, advisers, ownership and relationships.
- **Portfolio** — public and private assets, liabilities, custodians and documents.
- **Pursuit** — the goals, beliefs, obligations and life decisions that wealth has
  to support.

Zinc is becoming a system of context for wealth managers and family offices. A
family CRM maps people, entities, assets and ownership. Document intelligence
interprets statements, capital calls, trusts, wills and tax documents. Persistent
memory learns from meetings, emails and decisions. Composable applications use that
shared context for portfolio reviews, meeting preparation, risk alerts and
opportunity discovery.

The direction carries forward ideas from nearly every earlier exploration: Ada's
memory, Tax Copilot's document understanding, Prospecting's continuous agents,
Business in a Box's workflow automation, and OneView's financial aggregation. The
experiments weren't a catalogue. They became the product's foundations.

### What the process produced — and what it hasn't yet
**The current product is still being developed and validated, so I wouldn't
present it as proven market impact.** Be straight about that if anyone asks.

What we have demonstrated is a coherent product direction and a different capacity
for building. In a recent two-week push the team brought a family CRM, an
interactions timeline, a private-document parser, a memory workbench and a
composable-application runtime together into one working demonstration.

The next evidence has to come from adoption: how much time the system saves wealth
managers, how reliably it understands private documents, whether it surfaces
valuable actions, and whether it lets each relationship manager serve more families
without losing context.

### What I took away
Zinc 2.0 made me less attached to any particular product and more accountable for
finding the right one.

I learned to enter unfamiliar domains, identify their underlying systems, and
create a shared structure the wider team could move on. I learned to combine
customer needs, business requirements and technical constraints without waiting for
a complete brief. My role expanded across research, product management, design and
implementation, and AI let me operate across those boundaries at a speed that would
previously have needed a much larger team.

More than any of that, I developed a repeatable way to work through uncertainty:
turn a vague opportunity into a system model, the model into a testable thesis, and
the thesis into an experience that can generate evidence.

The most important lesson wasn't how quickly I could build something. It was
learning how to build quickly without confusing output with progress.

**Speed allowed us to explore. The process turned exploration into evidence.
Judgement determined what we carried forward.**`,
};

export const CASE_STUDIES: CaseStudy[] = [
  LAZYPAY_REVOLVE,
  LAZYPAY_APP_REVAMP,
  LAZYCARD,
  ELEVATE,
  ZINC_ADA,
  ZINC_2,
];

/* Work Rajiv has scoped as a case study but hasn't written out yet. The summary
 * is real and his own words; the detail behind it isn't here. This exists so the
 * assistant knows these projects exist and can describe them accurately at one
 * line, instead of either not knowing about them or padding them out. */
export type PlannedCaseStudy = {
  title: string;
  company: string;
  period: string;
  tags: string[];
  summary: string;
};

export const PLANNED_CASE_STUDIES: PlannedCaseStudy[] = [
  {
    title: "Designing one of LazyPay's biggest revenue engines (XpressCash)",
    company: "LazyPay by PayU",
    period: "2022",
    tags: ["Loans", "Compliance"],
    summary: `Designed XpressCash, one of LazyPay's highest-revenue products,
simplifying a complex journey spanning eligibility, KYC, income verification,
repayment setup and regulatory compliance.`,
  },
  {
    title: "Rethinking rewards for everyday engagement",
    company: "LazyPay by PayU",
    period: "2022",
    tags: ["Rewards", "Engagement"],
    summary: `Redesigned the rewards experience to create clearer value, stronger
discovery, and more reasons for users to engage repeatedly.`,
  },
  {
    title: "Turning revolving credit card debt into structured repayment",
    company: "LazyPay by PayU",
    period: "2022",
    tags: ["Credit card", "Loans", "Compliance"],
    summary: `Designed a financing experience that helped users avoid compounding
credit card interest and repay outstanding balances through a structured plan.`,
  },
];
