/* Content for the four role cards on the Summary section's second screen, and
 * for the modal each one opens. Kept out of the component so the copy can be
 * edited without touching layout or animation code.
 *
 * Each modal section is an accordion panel: intro paragraphs, then a "What I
 * did" list. Both are present for every panel, so the modal doesn't need to
 * handle a panel that's missing one. */
export type RolePanel = {
  /** Accordion header. */
  title: string;
  /** Paragraphs above the "What I did" list. */
  intro: string[];
  did: string[];
};

export type Role = {
  /** Stable key — used for React keys and the modal's aria ids. */
  key: string;
  /** Card title, reused as the modal's heading. */
  title: string;
  /** Card blurb. Not repeated in the modal. */
  blurb: string;
  panels: RolePanel[];
};

export const ROLES: Role[] = [
  {
    key: "strategy",
    title: "Product strategy",
    blurb:
      "I frame ambiguous problems, evaluate business and technical trade-offs, and help teams decide what should be built.",
    panels: [
      {
        title: "Defining Zinc’s early wealth platform",
        intro: [
          "During Zinc’s early stages, the wealth product depended on several external systems, including Valuefy and GTN. I helped define what Zinc should build internally, what could be powered by partners, and how the different systems would work together.",
          "I evaluated architecture options such as building Zinc’s customer experience over Valuefy’s APIs and back-office infrastructure versus integrating more directly with GTN and owning additional capabilities internally.",
        ],
        did: [
          "I defined the boundaries between Zinc, Valuefy, and GTN.",
          "I helped decide which capabilities we should build, integrate, or operate manually.",
          "I connected product requirements with technical and operational implications.",
          "I identified partner limitations before they became customer-experience problems.",
          "I helped prioritise launch-critical capabilities against longer-term platform investments.",
        ],
      },
      {
        title: "Turning partner limitations into product decisions",
        intro: [
          "Valuefy supported capabilities such as order management, portfolio views, basket creation, reporting, and back-office operations. However, it did not fully support Zinc’s requirements around settlements, pay-ins, payouts, transaction states, basket-level performance, calculations, and branded reporting.",
          "I helped translate these limitations into product, engineering, and operational decisions for Zinc.",
        ],
        did: [
          "I mapped gaps between the intended customer experience and partner capabilities.",
          "I helped define Zinc-owned services for settlements, fees, payments, calculations, and reporting.",
          "I balanced launch speed against long-term platform ownership.",
          "I ensured technical decisions continued to support the intended product experience.",
          "I helped turn an unclear partner integration into an actionable product roadmap.",
        ],
      },
    ],
  },
  {
    key: "systems",
    title: "System thinking",
    blurb:
      "I think in systems. I connect customer experiences with technology, operations, partner platforms, and reusable design foundations.",
    panels: [
      {
        title: "Designing the Zinc–Valuefy–GTN ecosystem",
        intro: [
          "I was not designing a single customer journey. I was helping shape how customer interfaces, partner APIs, authentication, order management, market data, settlements, operations, reporting, and regulatory workflows worked together as one system.",
        ],
        did: [
          "I mapped responsibilities across customers, Zinc, Valuefy, GTN, banking partners, and operations teams.",
          "I connected front-end journeys with backend states and operational processes.",
          "I accounted for both automated and manually operated parts of the experience.",
          "I identified where Zinc needed orchestration layers rather than another isolated interface.",
          "I helped create an integrated roadmap across advisory, brokerage, payments, and onboarding.",
          "I considered how identity, consent, transactions, communications, and reporting would move across regulated entities.",
          "The roadmap included a unified experience across products and the infrastructure required to support onboarding, transactions, compliance, communications, and operations.",
        ],
      },
      {
        title: "Building LazyPay’s design system",
        intro: [
          "LazyPay had accumulated multiple visual styles because products had been launched independently and parts of the platform were built on legacy technology inherited through acquisitions.",
          "I approached the redesign as a system-level problem rather than a collection of individual screen improvements.",
        ],
        did: [
          "I defined a visual direction aligned with LazyPay’s evolving brand positioning.",
          "I established foundations for colour, typography, spacing, corner radius, tone of voice, iconography, illustration, and motion.",
          "I audited existing app screens to identify repeated patterns and inconsistent components.",
          "I created reusable and flexible components instead of redesigning every screen independently.",
          "I improved the design-to-development handoff process to reduce implementation gaps.",
          "I prioritised migration according to active product and business roadmaps.",
          "I helped move 60% of live modules onto the new design system without requiring a big-bang redesign.",
        ],
      },
    ],
  },
  {
    key: "leadership",
    title: "Hands-on leadership",
    blurb:
      "I’ve led multidisciplinary teams while continuing to shape strategy, systems, interactions, and execution.",
    panels: [
      {
        title: "Leading a multidisciplinary design team",
        intro: [
          "At LazyPay, I managed a team of product designers, researchers, and illustrators working across different products and business areas.",
          "I remained closely involved in the work rather than moving entirely into people management.",
        ],
        did: [
          "I created clarity and direction across multiple product areas.",
          "I reviewed work and maintained a consistent quality bar.",
          "I helped designers navigate product, business, technical, and regulatory constraints.",
          "I connected research, product design, visual design, and illustration.",
          "I supported the development and growth of individual team members.",
          "I represented design in discussions with product, engineering, business, risk, and compliance.",
        ],
      },
      {
        title: "Leading the LazyPay design-system initiative",
        intro: [
          "The design system required alignment across designers, illustrators, engineers, product teams, and business priorities.",
        ],
        did: [
          "I established a shared visual direction across different product teams.",
          "I guided designers working across multiple modules.",
          "I worked with engineers to translate design foundations into reusable components.",
          "I improved the handoff and implementation-review process.",
          "I prioritised adoption according to business requirements.",
          "I continued designing and reviewing critical components myself.",
        ],
      },
      {
        title: "Leading through ambiguity at Zinc",
        intro: [
          "At early-stage Zinc, leadership frequently meant working beyond the conventional boundaries of product design.",
        ],
        did: [
          "I participated in product and technical architecture decisions.",
          "I helped structure ambiguous product requirements.",
          "I worked across partner evaluation, operations, product flows, and interface design.",
          "I translated technical limitations into customer-experience decisions.",
          "I took initiatives from early problem definition through detailed execution.",
          "I stepped into areas where ownership and processes had not yet been established.",
        ],
      },
    ],
  },
  {
    key: "scale",
    title: "Designing at scale",
    blurb:
      "I design for large user bases while accounting for legacy systems, business continuity, regulation, and operational complexity.",
    panels: [
      {
        title: "Migrating LazyPay while the product continued to evolve",
        intro: [
          "The design-system work happened inside an actively used financial product with multiple teams, live customers, legacy patterns, and ongoing business priorities.",
          "The challenge was not simply creating a cleaner interface. It was improving consistency without slowing down product development or introducing unnecessary migration risk.",
        ],
        did: [
          "I designed for an existing product with multiple teams and legacy patterns.",
          "I created components flexible enough to support different financial products and journeys.",
          "I aligned migration priorities with active business roadmaps.",
          "I avoided a high-risk organisation-wide redesign.",
          "I established consistency while teams continued shipping new features.",
          "I built foundations that could support future modules without repeatedly starting from scratch.",
        ],
      },
      {
        title: "Designing financial infrastructure for future scale",
        intro: [
          "At Zinc, the platform needed to support more than the initial wealth launch. It had to evolve across products, regulated entities, partners, customer types, currencies, and geographies.",
        ],
        did: [
          "I designed flows that could work across advisory, brokerage, and payments.",
          "I considered shared identity and onboarding across multiple applications.",
          "I accounted for compliance, audit trails, reporting, and operational state management.",
          "I helped shape architecture that could expand beyond the first release.",
          "I designed customer experiences while considering the systems and teams required to operate them.",
        ],
      },
      {
        title: "Shipping products used by millions",
        intro: [
          "At LazyPay and PaySense, I worked on high-frequency financial journeys across credit, lending, repayments, cards, and money management.",
        ],
        did: [
          "I designed for products where small decisions could affect a large number of customers.",
          "I accounted for different repayment states, eligibility rules, risk policies, and edge cases.",
          "I balanced customer clarity with business, technology, compliance, and operational constraints.",
          "I worked on products where errors could directly affect customers’ money and trust.",
        ],
      },
    ],
  },
];
