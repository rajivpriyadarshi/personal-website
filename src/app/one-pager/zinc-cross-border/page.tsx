import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zinc — Case Study | Rajiv Priyadarshi",
  description:
    "How we designed Zinc's edu-wealth platform to help Indian families save, invest, and plan in the currency they'll spend — for their child's education abroad.",
};

export default function ZincCrossBorderPage() {
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
              Fintech
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              Edu-Wealth
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              Case Study
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 m-0">
            Zinc
          </h1>
          <p className="text-base text-zinc-500 m-0 max-w-xl">
            A platform that helps Indian families save, invest, and plan in the
            currency they&apos;ll eventually spend — for their child&apos;s
            education abroad.
          </p>
        </div>

        {/* Hero image placeholder */}
        <div className="w-full aspect-[16/8] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Hero image — Zinc platform overview
          </span>
        </div>

        {/* Problem */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Problem</h2>
          <div className="flex flex-col gap-3 text-sm text-zinc-600">
            <p className="m-0">
              An Indian parent planning to send their child to the US for a
              degree faces a fundamental currency mismatch. They earn in INR, but
              the eventual expense — tuition, living costs, deposits — is in USD.
              If they save and invest in INR for 5–10 years, they&apos;re exposed
              to currency depreciation the entire time. By the time the money is
              needed, the rupee may have lost 20–30% of its purchasing power
              against the dollar.
            </p>
            <p className="m-0">
              Yet there&apos;s no simple product that lets a family in India
              save, invest, and grow their money in the currency they&apos;ll
              actually spend it in. Banks offer FD rates in INR. Mutual funds are
              rupee-denominated. Opening a foreign account is complicated and
              disconnected from the goal. And when it&apos;s finally time to send
              money abroad, the remittance process is opaque, expensive, and
              filled with compliance friction.
            </p>
            <p className="m-0">
              Beyond the financial mechanics, there&apos;s the planning gap.
              Families don&apos;t just need to save — they need to know{" "}
              <em>how much</em> to save, <em>which universities</em> are
              realistic, <em>what profile</em> their child should build, and{" "}
              <em>when</em> to start taking action. This guidance is either
              expensive (human counsellors), inconsistent, or too generic to be
              useful.
            </p>
            <p className="m-0 font-medium text-zinc-700">
              The core problem:{" "}
              <em>
                Indian families planning for education abroad have no unified
                product to save in the right currency, invest for the right goal,
                transfer when the time comes, and get guidance along the way.
              </em>
            </p>
          </div>
        </section>

        {/* Problem illustration placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — the currency mismatch: earning in INR, spending in USD, and
            the depreciation gap over time
          </span>
        </div>

        {/* Hypothesis */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Hypothesis
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            If a single platform could let Indian families save and invest in
            foreign currencies from day one — tied to the specific goal of their
            child&apos;s education abroad — and layer on guided transfers, AI
            counselling, and personalized planning, it would become the default
            financial relationship for a large, underserved, and high-value
            segment. The insight was simple: don&apos;t save in rupees if
            you&apos;re going to spend in dollars.
          </p>
        </section>

        {/* Solution */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Solution</h2>
          <p className="text-sm text-zinc-600 m-0">
            We designed Zinc as an edu-wealth platform — a single product that
            brought together everything a family needs from the moment they
            decide their child will study abroad, all the way through to the
            final tuition payment. Rather than solving one piece (just
            remittance, just investing, just counselling), Zinc connected the
            entire journey into a coherent system.
          </p>
        </section>

        {/* Platform pillars */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            The Platform
          </h2>
          <div className="flex flex-col gap-5 mt-1">
            <div className="flex flex-col gap-1.5 p-5 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-semibold text-zinc-700 m-0">
                Multi-Currency Account
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The foundation. A foreign currency account that let families hold
                USD, GBP, EUR, AUD, and other currencies directly — not as a
                conversion at the end, but as the native format of their savings
                from the start. This eliminated the currency mismatch at the
                root.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-5 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-semibold text-zinc-700 m-0">
                Invest Abroad
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                Goal-based investing in foreign-denominated instruments. Instead
                of growing money in INR and hoping the exchange rate holds,
                families could invest in USD-denominated assets directly — tied
                to a target amount, timeline, and university cost estimate.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-5 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-semibold text-zinc-700 m-0">
                Save Abroad
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                Structured savings in foreign currency with goal tracking. Set a
                target (e.g. $200K for a 4-year US degree), save regularly in
                USD, and watch progress against the actual cost — not an
                INR-equivalent that drifts with exchange rates.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-5 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-semibold text-zinc-700 m-0">
                Remittance
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The transfer rail. When it was time to pay — tuition deposits,
                semester fees, living expenses — families could move money
                abroad with transparent pricing, guided compliance (Form A2, LRS
                declarations), and real-time tracking. Not a standalone product,
                but the natural action layer for money that was already saved and
                invested in the right currency.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-5 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-semibold text-zinc-700 m-0">
                Ada — AI Education Counsellor
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The guidance layer. An AI-first counselling product that helped
                students and families from early on — understanding which
                universities fit, what profile to build, what actions to take
                each year, and how the financial plan mapped to the academic
                plan. Ada wasn&apos;t a bolt-on; it was what made the platform
                feel like a partner in the family&apos;s journey, not just a
                financial utility.
              </p>
            </div>
          </div>
        </section>

        {/* Platform architecture placeholder */}
        <div className="w-full aspect-[16/8] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — platform architecture: multi-currency account at the center,
            with save, invest, remit, and counsel as connected layers
          </span>
        </div>

        {/* How it worked together */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            How It Worked Together
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            The power of Zinc wasn&apos;t any single feature — it was the
            connection between them. A typical journey looked like:
          </p>
          <ol className="flex flex-col gap-3 text-sm text-zinc-600 m-0 pl-5 list-decimal mt-2">
            <li>
              A parent decides their child (say, class 8) will study abroad in
              5–6 years.
            </li>
            <li>
              <strong className="font-medium text-zinc-700">Ada</strong> helps
              them understand realistic university options, costs, and what
              profile the child should build starting now.
            </li>
            <li>
              Based on the target university and cost, the family opens a{" "}
              <strong className="font-medium text-zinc-700">
                multi-currency account
              </strong>{" "}
              and starts{" "}
              <strong className="font-medium text-zinc-700">
                saving in USD
              </strong>{" "}
              monthly.
            </li>
            <li>
              A portion is{" "}
              <strong className="font-medium text-zinc-700">
                invested abroad
              </strong>{" "}
              in goal-linked instruments to grow faster than a savings account.
            </li>
            <li>
              Over the years, Ada continues guiding the student — extracurriculars,
              test prep timing, application strategy.
            </li>
            <li>
              When acceptance comes, the family already has the money in the
              right currency.{" "}
              <strong className="font-medium text-zinc-700">Remittance</strong>{" "}
              handles the tuition transfer — transparent, compliant, and
              tracked.
            </li>
          </ol>
          <p className="text-sm text-zinc-500 m-0 mt-2">
            No last-minute scramble. No currency shock. No disconnected tools.
            One product, one journey, one relationship.
          </p>
        </section>

        {/* Journey screens placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — goal setup: target university + savings plan
            </span>
          </div>
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — multi-currency account dashboard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — invest abroad portfolio with goal tracking
            </span>
          </div>
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — remittance transfer with compliance guidance
            </span>
          </div>
        </div>

        {/* Design approach */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Design Approach
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            Designing Zinc meant designing for a long-term relationship, not a
            one-time transaction. The product needed to feel trustworthy enough
            for a family to park their life savings, simple enough for a
            first-time investor, and sophisticated enough for someone comparing
            it to a private bank.
          </p>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Goal-first, not product-first
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The entry point was the family&apos;s goal (&ldquo;my child will
                study in the US&rdquo;), not a financial product (&ldquo;open a
                multi-currency account&rdquo;). Products were introduced in the
                context of progress toward the goal.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Calm and institutional
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                For large sums of family money, the visual language needed to say
                &ldquo;we take this seriously&rdquo; — not &ldquo;look how fast
                we are.&rdquo; The brand system (developed with a brand agency)
                used custom illustrations, purposeful motion, and a palette that
                felt premium without being intimidating.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Progressive disclosure
              </h4>
              <p className="text-sm text-zinc-500 m-0">
                The platform had depth — investing, compliance, multi-currency
                management — but surfaced complexity only when relevant. A new
                user saw their goal and next action. Power came later, as they
                grew with the product.
              </p>
            </div>
          </div>
        </section>

        {/* Brand placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — brand and design language: visual system, illustrations,
            typography
          </span>
        </div>

        {/* Why It Mattered */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Why It Mattered
          </h2>
          <div className="flex flex-col gap-3 text-sm text-zinc-600">
            <p className="m-0">
              Zinc addressed a problem that was hiding in plain sight. Millions
              of Indian families are planning to send their children abroad, and
              every single one of them is losing money to currency depreciation
              because there&apos;s no product designed around this specific need.
            </p>
            <p className="m-0">
              By combining financial products (save, invest, remit) with
              intelligence (Ada), Zinc became more than a fintech app — it became
              a planning partner for one of the most important decisions a family
              makes.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  Solved the currency mismatch
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  Families could save and invest in USD from the start — no more
                  losing 20–30% to depreciation over a decade.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  Connected money to meaning
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  Every rupee saved was tied to a university, a timeline, a
                  child&apos;s future — not abstract portfolio growth.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  Built a long-term relationship
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  A family that joins when their child is in class 8 stays for
                  6–8 years — through saving, investing, counselling, and
                  finally transferring.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                4
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-700 m-0">
                  Created expansion paths
                </p>
                <p className="text-xs text-zinc-500 m-0">
                  From education savings into wealth management, tax planning,
                  estate advisory, and lending — Zinc&apos;s wedge opened the
                  door to a full financial relationship with affluent families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Outcome */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Outcome</h2>
          <p className="text-sm text-zinc-600 m-0">
            Zinc secured{" "}
            <strong className="font-medium text-zinc-700">
              $25.5 million in seed funding
            </strong>{" "}
            on the strength of this vision. The platform proved that there was a
            massive, underserved market of Indian families who needed a
            purpose-built financial product for education abroad — not a generic
            savings app, not a standalone remittance tool, but a connected
            system that understood their specific goal and designed every layer
            around it.
          </p>
        </section>

        {/* Outcome visual placeholder */}
        <div className="w-full aspect-[16/6] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — the full Zinc ecosystem: counsel &rarr; save &rarr; invest
            &rarr; remit &rarr; arrive
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
