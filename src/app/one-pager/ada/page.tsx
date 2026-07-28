import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ada — Case Study | Rajiv Priyadarshi",
  description:
    "How we designed an AI-first education counselling platform for students, parents, and counsellors.",
};

export default function AdaPage() {
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
              Edtech
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white text-zinc-600">
              Case Study
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 m-0">
            Ada
          </h1>
          <p className="text-base text-zinc-500 m-0 max-w-xl">
            An AI-first education counselling platform that turned fragmented
            guidance into a structured, personalized journey for students and
            families.
          </p>
        </div>

        {/* Hero image placeholder */}
        <div className="w-full aspect-[16/8] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Hero image — Ada product overview
          </span>
        </div>

        {/* Problem */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Problem</h2>
          <div className="flex flex-col gap-3 text-sm text-zinc-600">
            <p className="m-0">
              Students and parents making college and study-abroad decisions
              often face a messy, high-stakes process with fragmented guidance.
              Traditional counselling is expensive, inconsistent, and hard to
              scale, while generic online content is too broad to be useful for
              an individual student.
            </p>
            <p className="m-0">
              Families need help understanding the right path — what colleges
              fit, how to build a stronger profile, and what actions to take next
              — but there is rarely a structured, personalized system that stays
              with them over time.
            </p>
          </div>
        </section>

        {/* Problem illustration placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — fragmented counselling landscape
          </span>
        </div>

        {/* Hypothesis */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Hypothesis
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            If education counselling could be turned into an AI-first,
            structured, and ongoing product, students could get earlier and more
            personalized guidance, parents could get more clarity, and human
            counsellors could operate at much higher quality and scale. Instead
            of replacing counsellors, AI could become the intelligence layer that
            gathered context, generated plans, and made the overall counselling
            journey more consistent.
          </p>
        </section>

        {/* Solution */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">Solution</h2>
          <p className="text-sm text-zinc-600 m-0">
            We designed Ada as an AI-first education and counselling platform for
            students and parents navigating college and study-abroad planning.
            The product started by understanding the student through guided
            conversations and assessment inputs, then translated that into
            structured outputs such as a College Path, personal development
            recommendations, and next-step guidance.
          </p>
          <p className="text-sm text-zinc-600 m-0">
            Over time, Ada evolved from a student-facing AI counsellor into a
            broader system that also supported parents and human counsellors,
            making the product both self-serve and service-enabled.
          </p>
        </section>

        {/* Product flow placeholder */}
        <div className="w-full aspect-[16/7] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — product architecture / user journey flow
          </span>
        </div>

        {/* Key Features */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                AI-guided counselling
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Guided students through college, career, and study-abroad
                decisions with conversational support.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Personalized planning
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Generated structured outputs like college paths, development
                plans, and fit-based recommendations.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Parent &amp; counsellor workflows
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Created shared context, reports, and dedicated support layers for
                families and human counsellors.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Assessment &amp; reporting
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Turned conversations into usable outputs such as reports,
                dockets, and student profiles.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 sm:col-span-2">
              <h4 className="text-sm font-medium text-zinc-700 m-0">
                Service-assisted model
              </h4>
              <p className="text-xs text-zinc-500 m-0">
                Supported a premium counselling layer where AI improved the
                quality and scalability of human guidance.
              </p>
            </div>
          </div>
        </section>

        {/* Screens placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — student onboarding conversation
            </span>
          </div>
          <div className="aspect-[4/3] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
            <span className="text-sm text-zinc-400 text-center px-4">
              Screen — college path output
            </span>
          </div>
        </div>

        {/* Why It Mattered */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-800 m-0">
            Why It Mattered
          </h2>
          <p className="text-sm text-zinc-600 m-0">
            Ada mattered because it turned education counselling from a
            fragmented service into a scalable product. It gave Zinc an upstream
            wedge into students and affluent families, built trust early in an
            important life decision, and created a natural bridge into broader
            offerings like Zinc Honors, education financing, and long-term family
            financial planning.
          </p>
          <p className="text-sm text-zinc-600 m-0">
            More than a chatbot, Ada was positioned as the intelligence and
            coordination layer behind a more structured education journey.
          </p>
        </section>

        {/* Impact visual placeholder */}
        <div className="w-full aspect-[16/6] rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <span className="text-sm text-zinc-400">
            Image — product ecosystem / expansion into Zinc Honors and financing
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
