/* The project index — every named piece of work, grouped by the company it was
 * done at.
 *
 * This lived inline in `src/app/archive/page.tsx` until the assistant needed it
 * too. It's the only place the specific projects are written down (journey-data
 * has the roles, role-data has the capabilities, neither names the work), so it
 * moved out here to be read by both the archive page and the agent's corpus.
 *
 * Keep this the single source. A second copy authored for the assistant would
 * start drifting from the site the day it was written.
 *
 * Types mirror `WorkItem`'s props, which are structural rather than exported. */

export type Project = {
  title: string;
  description: string;
  tags?: string[];
};

export type ProjectGroup = {
  groupTitle: string;
  groupDescription?: string;
  projects: Project[];
};

export type CompanyProjects = {
  /** Plain-text company name. The archive page renders its own linked version. */
  company: string;
  role: string;
  period: string;
  /** Grouped by theme, where there's enough work to need themes. */
  groups?: ProjectGroup[];
  /** A flat list, where there isn't. */
  projects?: Project[];
};

export const ZINC_SINGAPORE: CompanyProjects = {
  company: "Zinc, Singapore",
  role: "Principal Product Designer",
  period: "Dec 2025 – Present",
  groups: [
    {
      groupTitle: "AI Wealth & Portfolio Intelligence",
      groupDescription:
        "Suite of products helping users understand, analyze, and act on their wealth, particularly for tech workers with complex portfolios.",
      projects: [
        {
          title: "Tax Copilot",
          description:
            "AI-native tax product focused on reducing tax anxiety. Covers filing, document-based tax computation, advance tax, residency-change scenarios, and proactive planning.",
        },
        {
          title: "RSU & Estate Planning",
          description:
            "Wealth product for tech workers with concentrated U.S. stock exposure: estate tax risk, diversification, custody, and cross-border planning for RSU-heavy portfolios.",
        },
        {
          title: "Portfolio Analyzer",
          description:
            "Multi-document uploads, multi-currency normalization, concentration and fragmentation metrics, market sensitivity, scoring, and scenario simulation.",
        },
        {
          title: "Wealth Map",
          description:
            "Guided private-bank-style discovery product that builds a complete picture of family, assets, tax, goals, liabilities, then turns it into a structured wealth map.",
        },
        {
          title: "AlphaPeek",
          description:
            "Portfolio intelligence from uploaded statements: performance insights, drivers and detractors, tax optimization ideas, and peer group comparison.",
        },
        {
          title: "NSDL/CDSL Portfolio Parsing",
          description:
            "Wealth tool built around parsing depository statements, unlocking portfolio views with PAN, and generating allocation, trend, and advisory insights.",
        },
        {
          title: "Lending Against Securities",
          description:
            "Giving users liquidity against financial assets, especially stock holdings, without forcing them to sell, for large purchases or funding needs.",
        },
      ],
    },
    {
      groupTitle: "Credit Stress, Bureau, and Collections",
      groupDescription:
        "Products around credit health, bureau data, and lender-side workflows.",
      projects: [
        {
          title: "Consumer Bureau Apps",
          description:
            "Consumer-facing credit products bringing users through bureau-led value propositions: score awareness, credit understanding, and adjacent financial actions.",
        },
        {
          title: "Collections Platform",
          description:
            "Lender-facing collections workstream: bureau scrubs, delinquency targeting, settlement scoring, decision logic, and tools to improve recovery workflows.",
        },
      ],
    },
    {
      groupTitle: "Volo / Employee Benefits",
      groupDescription:
        "Zinc-powered employee benefits experience built around health, insurance, and programmable benefits infrastructure.",
      projects: [
        {
          title: "Volo Health Benefits",
          description:
            "Zinc-powered employee benefits experience: insurance, wallet, concierge, protection flows, onboarding, and account management built on Volo.",
        },
        {
          title: "Health AI Assistant",
          description:
            "Intelligence layer explaining policy coverage, helping with claims, organizing health artifacts, and improving insurance usability.",
        },
        {
          title: "Benefits Fintech Rails",
          description:
            "Supporting infrastructure including bureau, CKYC, account aggregator, wallet, payment, and identity rails for programmable benefits.",
        },
      ],
    },
    {
      groupTitle: "Agentic Infrastructure",
      groupDescription:
        "Building the foundation for AI agents: runtime, finance, and consumer-friendly packaging.",
      projects: [
        {
          title: "OpenClaw Agent Runtime",
          description:
            "Major agent-infrastructure exploration: hosted agents, browser control, memory, cloud setup, skills, and non-technical agent experiences.",
        },
        {
          title: "WhatsApp OpenClaw",
          description:
            "Consumer-friendly packaging of the agent runtime, letting users connect an AI agent to WhatsApp with minimal setup and simpler controls.",
        },
        {
          title: "Agent Treasury",
          description:
            "Finance infrastructure for AI agents: programmable wallets, sub-wallets, policies, payment intents, stablecoins, approvals, and audit trails.",
        },
        {
          title: "Document Graph",
          description:
            "Structured-document intelligence layer for extracting claims, facts, gaps, evidence, and linked outputs across documents for diligence and onboarding.",
        },
      ],
    },
    {
      groupTitle: "AI-Native Networking and Prospecting",
      groupDescription:
        "Rethinking professional networking and prospecting in an AI-native world.",
      projects: [
        {
          title: "Donna / LinkedIn Agent",
          description:
            "Professional networking concept for an AI-native world, centered on reachability, reputation, trust, and intelligent representation rather than static profiles.",
        },
        {
          title: "Donna for Builders & Funders",
          description:
            "Narrower version focused on connecting builders, founders, engineers, and investors inside trusted or semi-curated networks.",
        },
        {
          title: "Prospect Agent",
          description:
            "Workflow product for prospect generation, enrichment, interview flow, due diligence, and structured movement from discovery into action.",
        },
        {
          title: "Goldman Onboarding Agent",
          description:
            "Bank-oriented onboarding and diligence workflow aimed at reducing time and cost of prospecting, verification, documentation, and SOW/SOF generation.",
        },
      ],
    },
    {
      groupTitle: "Community-Led Product Experiments",
      groupDescription:
        "Exploring community-driven fintech, fitness, and discovery products.",
      projects: [
        {
          title: "Running App",
          description:
            "Consumer running product that evolved from a social/community concept into a more personal rewards-led running experience.",
        },
        {
          title: "Community Event Discovery",
          description:
            "Singapore-focused consumer product around discovering curated fitness, wellness, and social events with community-led experience.",
        },
        {
          title: "Community Fintech",
          description:
            "Vertical-fintech exploration around community-led financial products, affinity cards, rewards, and partner APIs for specific user groups.",
        },
        {
          title: "Creator Finance Data",
          description:
            "Creator-economy investigation into whether creator-platform data and network signals could support financial products or underwriting.",
        },
      ],
    },
    {
      groupTitle: "Small Business Growth Systems",
      groupDescription:
        "Products for SMBs and brands selling across fragmented channels.",
      projects: [
        {
          title: "USD Accounts for SMBs",
          description:
            "Cross-border SMB finance: USD accounts and commercial cards for international spending like ads, software, and cloud services.",
        },
        {
          title: "Multi-channel Brand Ops",
          description:
            "Operations intelligence for brands selling across fragmented channels: inventory coordination, carrier decisions, forecasting, and founder visibility.",
        },
      ],
    },
    {
      groupTitle: "Tech Worker Wealth Platform",
      groupDescription:
        "AI-first private banking and wealth products for tech workers.",
      projects: [
        {
          title: "Private Banking for Tech Workers",
          description:
            "AI-first private banking concept using specialist agents across equities, tax, cash, credit, and planning. A lighter alternative to traditional private banks.",
        },
        {
          title: "Social Feed for Wealth",
          description:
            "Feed-like layer for wealth products: portfolio-related signals, comparisons, and contextual insights in a social or dynamic format.",
        },
        {
          title: "Peer-group Benchmarking",
          description:
            "Showing users how they compare to relevant peers rather than only broad market benchmarks for more meaningful wealth context.",
        },
      ],
    },
    {
      groupTitle: "Smaller Edge Explorations",
      groupDescription:
        "Varied experiments across education, housing, travel, and productivity.",
      projects: [
        {
          title: "Youth Financial Education",
          description:
            "Structured educational concept teaching financial skills progressively across age groups with parent-child control and profile building.",
        },
        {
          title: "Ada Education",
          description:
            "Broader education product line connecting to learning support, guidance flows, and personalized AI-driven education experiences.",
        },
        {
          title: "Explainer Video Learning",
          description:
            "Learning product built around generating short AI-powered explainer videos for a student's specific question or problem.",
        },
        {
          title: "Tourist UPI Concierge",
          description:
            "Travel-fintech concept helping foreign tourists in India navigate payments through an AI concierge over local payment rails.",
        },
        {
          title: "Tenant/Landlord Verification",
          description:
            "Trust product for housing using bureau, employment, income signals to generate structured verification reports.",
        },
        {
          title: "Rental Finance",
          description:
            "Housing product around deposits, rent timing stress, conflict reduction, and creating a trusted intermediary layer in rentals.",
        },
        {
          title: "LifeOS / AI Email",
          description:
            "Turning email into a semantic, AI-driven life system: bills, travel, subscriptions, receipts, warranties, and financial records.",
        },
        {
          title: "Chrome Extension Assistant",
          description:
            "Browser-native assistant understanding the current page and suggesting actions, especially across Gmail, Reddit, and task-heavy interfaces.",
        },
        {
          title: "Order Tracking Manager",
          description:
            "Consumer utility unifying order tracking across multiple ecommerce platforms, extending into warranties and post-purchase workflows.",
        },
        {
          title: "AI Persona Testing",
          description:
            "Research concept where simulated AI users with different traits test products and funnels before launch.",
        },
      ],
    },
  ],
};

export const ZINC_INDIA: CompanyProjects = {
  company: "Zinc, India",
  role: "Principal Product Designer",
  period: "Jul 2024 – Nov 2024",
  groups: [
    {
      groupTitle: "Zinc's Global Finance Solution",
      groupDescription:
        "The foundation Zinc was built on: solving the study abroad journey end-to-end, helping students decide the right college/path via AI, helping parents plan, finance, and invest for education.",
      projects: [
        {
          title: "Zinc Honors",
          description:
            "All-in-one support for a global education dream, helping parents plan, save, and invest for their children's study abroad journey.",
        },
        {
          title: "Zinc Pay",
          description:
            "Multi-currency account enabling seamless international transactions for students and families abroad.",
        },
        {
          title: "Zinc Wealth",
          description:
            "Invest seamlessly in global markets. Diversify your portfolio with access to international markets, with investment plans tailored to your specific needs.",
        },
        {
          title: "GTM Mini-Apps",
          description:
            "AI-powered micro-applications for user acquisition, increasing top-of-funnel through targeted, value-first experiences.",
        },
      ],
    },
    {
      groupTitle: "Zinc Ada",
      groupDescription:
        "An intelligent assistant that helps students discover the right subjects, choose the right university, and map their unique path. It continuously monitors academic progress, recommends the best subject choices, and nudges students to build the skills needed to get into their target universities. Essentially, a 24/7 mentor guiding students toward achieving their goals.",
      projects: [
        {
          title: "AI-Guided Counselling",
          description:
            "Ada helped students navigate college, career, and study-abroad decisions through guided conversations and ongoing personalized support.",
        },
        {
          title: "Personalized College Planning",
          description:
            "Ada generated structured outputs like college paths, development plans, and recommendations tailored to each student's profile and goals.",
        },
        {
          title: "Parent & Counsellor Collaboration",
          description:
            "Ada supported parents and human counsellors with shared context, reports, and dedicated workflows so guidance could be more coordinated and actionable.",
        },
        {
          title: "Assessment & Reporting",
          description:
            "A key part of the product was turning conversations into useful outputs such as assessment reports, dockets, and student profiles that families could use for decision-making.",
        },
      ],
    },
  ],
};

export const LAZYPAY: CompanyProjects = {
  company: "LazyPay & PaySense (by PayU), India",
  role: "Senior Manager → Manager → Lead",
  period: "Apr 2021 – Jun 2024",
  projects: [
    /* First, because it's the one that paid for the rest. Every other project here
       is a product decision; this one is the company's revenue line. */
    {
      title: "Cash Loans",
      description:
        "Owned design for cash loans — the lending product LazyPay actually made its money on.",
      tags: ["Lending", "Revenue"],
    },
    {
      title: "LazyPay App Revamp",
      description:
        "Complete redesign of the LazyPay customer app, modernizing the experience, improving usability, and aligning with the evolved brand identity.",
      tags: ["Consumer", "Redesign"],
    },
    {
      title: "Credit Growth Engine",
      description:
        "Designed acquisition and activation flows that drove significant user growth across LazyPay's credit products.",
      tags: ["Growth", "Credit"],
    },
    {
      title: "Repayment Experience",
      description:
        "Redesigned the repayment journey to reduce defaults and improve user experience during the most critical touchpoint.",
      tags: ["Fintech", "UX"],
    },
    {
      title: "Lending Platform",
      description:
        "Core lending infrastructure and user experience for personal loans, buy-now-pay-later, and credit lines.",
      tags: ["Lending", "Platform"],
    },
    {
      title: "Common Design System",
      description:
        "Built and scaled the design system across LazyPay and PaySense products, enabling faster shipping.",
      tags: ["Systems", "Scale"],
    },
    {
      title: "Retention & Re-engagement",
      description:
        "Designed lifecycle campaigns and product interventions to improve user retention and reduce churn.",
      tags: ["Retention", "Growth"],
    },
  ],
};

export const PORTER: CompanyProjects = {
  company: "Porter, India",
  role: "Product Design Lead",
  period: "Jul 2019 – Apr 2021",
  projects: [
    {
      title: "Customer App Redesign",
      description:
        "Complete redesign making the app lighter and more intuitive for first-time smartphone users in India.",
      tags: ["Consumer", "Mobile"],
    },
    {
      title: "Partner App",
      description:
        "Redesigned the driver-partner experience for better earnings visibility, navigation, and daily operations.",
      tags: ["Partner", "Mobile"],
    },
    {
      title: "Porter for Business",
      description:
        "Enterprise logistics platform enabling businesses to manage bookings, track fulfillment, and improve ETAs.",
      tags: ["Enterprise", "B2B"],
    },
    {
      title: "Porter Fleet",
      description:
        "Built from scratch to digitize enterprise logistics. Introduced a bidding model for better pricing and quality.",
      tags: ["Enterprise", "0→1"],
    },
    {
      title: "CRM Redesign",
      description:
        "Revamped internal CRM workflows, reducing agent task time and improving operational efficiency.",
      tags: ["Internal", "Operations"],
    },
  ],
};

export const CODING_NINJAS: CompanyProjects = {
  company: "Coding Ninjas, India",
  role: "Founding Designer",
  period: "Jan 2017 – Aug 2018",
  projects: [
    {
      title: "Learning Platform",
      description:
        "Designed a first-of-its-kind online learning platform for tech education in India, from scratch to 30K+ DAU.",
      tags: ["Edtech", "0→1"],
    },
    {
      title: "Classroom Experience",
      description:
        "Created an online classroom experience enabling students to learn, collaborate, and grow as a community.",
      tags: ["Education", "Social"],
    },
    {
      title: "Course Design",
      description:
        "Designed the course structure, progression, and learning flows that made complex programming concepts accessible.",
      tags: ["Learning", "UX"],
    },
    {
      title: "Community Features",
      description:
        "Built community and collaboration features that transformed passive learning into an engaging, social experience.",
      tags: ["Community", "Engagement"],
    },
  ],
};

/* Newest first, matching the archive page's order. */
export const PROJECTS_BY_COMPANY: CompanyProjects[] = [
  ZINC_SINGAPORE,
  ZINC_INDIA,
  LAZYPAY,
  PORTER,
  CODING_NINJAS,
];
