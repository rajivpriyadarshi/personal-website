import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tax Copilot — Case Study | Rajiv Priyadarshi",
  description:
    "How we designed an AI-native tax assistant that turned filing into year-round financial guidance.",
};

export default function TaxCopilotPage() {
  return (
    <div
      className="min-h-screen flex items-start justify-center font-sans px-4 md:px-0"
      style={{ lineHeight: "170%" }}
    >
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "#f7f7f7" }}
      />
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-10 border-r border-l border-dashed border-zinc-300 py-8 px-4 md:px-16 md:py-14 bg-white">
        {/* Back link */}
        <Link
          href="/one-pager"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors no-underline w-fit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to portfolio
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              AI
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              Fintech
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              Case Study
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 m-0">
            Tax Copilot
          </h1>
          <p className="text-base text-zinc-500 m-0 max-w-xl">
            An AI-native tax assistant that turned filing into year-round
            financial guidance for complex users.
          </p>
        </div>

        {/* Hero image placeholder */}
        <div className="w-full aspect-[16/8] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Hero image — product overview
          </span>
        </div>

        {/* Problem */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Problem</h2>
          <div className="flex flex-col gap-3 text-sm text-zinc-600">
            <p className="m-0">
              Tax is one of the most recurring and stressful financial problems
              for working professionals, but most products treat it as a
              once-a-year filing task. In reality, users struggle much earlier
              and much more often: they do not know how much tax they owe,
              whether they need to pay advance tax, whether they are making
              avoidable mistakes, or how changes in salary, investments, stock
              compensation, or residency affect their final liability.
            </p>
            <p className="m-0">
              This problem becomes even sharper for globally mobile and
              financially complex users — tech workers, professionals with equity
              compensation, and people managing income across multiple sources.
              Their financial information is fragmented across payslips, Form
              16s, brokerage statements, bank accounts, and emails, while the
              tools available to them are either too manual, too
              compliance-focused, or too generic.
            </p>
            <p className="m-0">
              The result is anxiety, poor planning, and frequent last-minute
              decision-making.
            </p>
            <p className="m-0 font-medium text-zinc-700">
              The core question:{" "}
              <em>how do we help users stop getting surprised by tax?</em>
            </p>
          </div>
        </section>

        {/* Problem illustration placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — fragmented tax data across documents and platforms
          </span>
        </div>

        {/* Hypothesis */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Hypothesis
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            If tax could be turned into a year-round, AI-driven guidance product
            instead of a once-a-year compliance workflow, users would feel more
            in control, make better decisions earlier, and build trust in the
            product far beyond filing season.
          </p>
        </section>

        {/* Approach */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Approach</h2>
          <p className="text-sm text-zinc-600 m-0">
            We designed Tax Copilot as an AI-native tax assistant that worked
            more like a year-round decision-support product than a filing
            utility. Instead of starting with forms and static workflows, the
            product started with the user&apos;s financial context.
          </p>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                1. Aggregate fragmented tax context
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The product pulled together information from tax documents,
                salary records, statements, and other financial inputs to create
                a unified picture of the user&apos;s tax situation.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                2. Turn compliance into guidance
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                Rather than only showing outputs, the system helped users
                understand what those outputs meant: whether they were
                underpaying, whether advance tax was due, what caused the
                liability, and what actions they should take next.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                3. Create a proactive planning loop
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The goal was to move tax from an annual event to an ongoing
                product experience. Users could check in periodically, understand
                changes as they happened, and make decisions before problems
                compounded.
              </p>
            </div>
          </div>
        </section>

        {/* Approach diagram placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — system architecture / product flow diagram
          </span>
        </div>

        {/* Product Concept */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Product Concept
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            Tax Copilot was imagined as a persistent layer sitting between raw
            financial data and tax decisions. A user could upload or connect
            relevant documents, and the system would interpret them, compute
            their current position, highlight issues, and explain the
            implications in plain language.
          </p>
          <p className="text-sm text-zinc-600 m-0">
            Instead of forcing users to understand tax logic on their own, the
            product translated complexity into a guided workflow:
          </p>
          <ul className="flex flex-col gap-2 text-sm text-zinc-600 m-0 pl-4 list-disc">
            <li>What we know</li>
            <li>What is missing</li>
            <li>What your estimated liability looks like</li>
            <li>What you should do now</li>
            <li>What may become a problem later</li>
          </ul>
          <p className="text-sm text-zinc-500 m-0">
            This made the product especially useful for users with non-trivial
            financial lives, where simple filing tools break down.
          </p>
        </section>

        {/* Product screens placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — tax visibility dashboard
            </span>
          </div>
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — guided action recommendations
            </span>
          </div>
        </div>

        {/* Key Capabilities */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Key Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Tax visibility
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                A clear view of current tax position rather than leaving users
                blind until filing season.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Advance tax planning
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Guidance on whether advance tax was due and what action to take,
                reducing surprise penalties.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Document intelligence
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Turned unstructured tax and financial documents into usable,
                structured tax inputs.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Scenario awareness
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Help for stock sales, bonuses, relocation, or multi-source
                income changes.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 sm:col-span-2">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Action-oriented guidance
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Focused less on static reports and more on helping users know
                what to do next.
              </p>
            </div>
          </div>
        </section>

        {/* Feature detail placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — document intelligence extraction flow
          </span>
        </div>

        {/* Why This Was a Good Wedge */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Why This Was a Good Wedge
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            Tax had three advantages as a product wedge:
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  High pain
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  Users already feel anxiety around tax — the problem is real and
                  urgent.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  High frequency
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  Even if filing is annual, tax decisions and uncertainty show up
                  throughout the year.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  Strategic adjacency
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  Understanding a user&apos;s tax situation naturally expands
                  into wealth planning, RSU decisions, estate-risk awareness, and
                  lending.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-600 m-0 mt-2">
            That made Tax Copilot more than a compliance product — it was a
            trust-building entry point into a broader financial relationship.
          </p>
        </section>

        {/* Outcome */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Outcome</h2>
          <p className="text-sm text-zinc-600 m-0">
            Tax Copilot represented a shift from{" "}
            <strong className="font-medium text-zinc-700">tax filing</strong> to{" "}
            <strong className="font-medium text-zinc-700">
              tax intelligence
            </strong>
            . The product reframed tax as an ongoing financial guidance problem
            instead of a seasonal paperwork problem.
          </p>
          <p className="text-sm text-zinc-600 m-0">
            That framing made it one of the strongest wedges for serving
            high-value users with complex financial lives, and it fit naturally
            into Zinc&apos;s broader move toward AI-first wealth and advisory
            products.
          </p>
        </section>

        {/* Outcome visual placeholder */}
        <div className="w-full aspect-[16/6] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — before/after positioning or product evolution diagram
          </span>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
          <Link
            href="/one-pager"
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors no-underline"
          >
            &larr; All projects
          </Link>
        </div>
      </main>
    </div>
  );
}
