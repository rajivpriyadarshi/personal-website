export type Role = {
  dates: string;
  title: string;
  company: string;
  logo: string;
  /** Tinted plate behind the logo, where the mark needs one to read. */
  logoBg?: string;
  badge?: { label: string; tone: "volunteer" | "freelance" };
  bullets: string[];
};

/* Newest first, matching the design. Tilt alternates by index in the component
 * rather than being stored here, so reordering can't break the rhythm. */
export const ROLES: Role[] = [
  {
    dates: "Dec 25 → Present",
    title: "Principal product designer",
    company: "Zinc · 🇸🇬 Singapore",
    logo: "/portfolio-august/journey/logos/zinc.svg",
    bullets: [
      "Working to shape future of Zinc. Building AI-native financial products across tax, wealth, agents, health, and more.",
      "In a lean team of 10, I own the full spectrum, from deep problem exploration to design to shipping.",
    ],
  },
  {
    dates: "Jul 24 → Nov 25",
    title: "Principal product designer",
    company: "Zinc · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/zinc.svg",
    bullets: [
      "Led 0→1 development across Zinc's core fintech products.",
      "Built the foundation for a new kind of financial platform — from education financing and AI-guided counseling to wealth management and GTM micro-applications.",
      "Led the orchestration of defining the tech architecture of a bunch of projects with a lot of ambiguity around partner systems, ops processes, etc.",
    ],
  },
  {
    dates: "Apr 23 → Jun 24",
    title: "Senior Product Design manager",
    company: "LazyPay + PaySense · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/lazypay.webp",
    bullets: [
      "Led product design across PayU’s credit products—combining hands-on execution with team leadership, design direction and product strategy.",
      "Managed a team spanning product, research, content and brand design while driving strategy across growth, revenue, retention, and cash loans — the revenue engine of the business — reaching 250M+ users.",
    ],
  },
  {
    dates: "Apr 22 → Mar 23",
    title: "Product Design manager",
    company: "LazyPay + PaySense · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/lazypay.webp",
    bullets: [
      "Led the design of growth, revenue, retention, repayments, common platforms, and cash loans — the lending line the business made its money on.",
      "Built full-fledged credit solutions for over 250 million users. Shipped the LazyPay app revamp and credit growth engine.",
    ],
  },
  {
    dates: "Apr 21 → Mar 22",
    title: "Lead Product Designer",
    company: "LazyPay + PaySense · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/lazypay.webp",
    bullets: [
      "Led the design of growth, revenue, retention, repayments, common platforms, and cash loans — the lending line the business made its money on.",
      "Built full-fledged credit solutions for over 250 million users. Shipped the LazyPay app revamp and credit growth engine.",
    ],
  },
  {
    dates: "Jul 19 → Apr 21",
    title: "Lead Product Designer",
    company: "Porter · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/porter.webp",
    logoBg: "#2962ff",
    bullets: [
      "Led design across Porter's full ecosystem: customer apps, partner apps, enterprise logistics, and internal tools serving 3M+ customers monthly and 300K+ driver-partners across 35+ cities.",
      "Led the redesign of customer app and partner app.",
      "Led the design of Porter for business, Porter Fleet, and CRM redesign.",
    ],
  },
  {
    dates: "Jul 19 → Feb 20",
    title: "Founding designer",
    company: "Nirvana.work · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/nirvana.webp",
    badge: { label: "Volunteer work", tone: "volunteer" },
    bullets: [
      "Worked with founders to shape the vision of workspace collaboration and task management tool designed to help teams control projects with minimum effort. This was pre-AI.",
    ],
  },
  {
    dates: "Aug 19 → Dec 19",
    title: "Founding designer",
    company: "Blackboard Radio · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/blackboard.webp",
    badge: { label: "Volunteer work", tone: "volunteer" },
    bullets: [
      "Worked with founders shape the vision of an AI-powered personalized spoken English coach (long before AI went mainstream).",
      "Helped raise funding by conceptualizing, architecting, and revamping the entire product.",
    ],
  },
  {
    dates: "Mar 19 → Jul 19",
    title: "Senior Product Designer",
    company: "OYO Rooms · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/oyo.webp",
    bullets: [
      "Worked on new initiatives at OYO to expand the business globally.",
      "Contributed to product strategy and design for international market entry across 35+ countries.",
    ],
  },
  {
    dates: "Sep 18 → Mar 19",
    title: "Product Designer",
    company: "Porter · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/porter.webp",
    logoBg: "#2962ff",
    bullets: [
      "First stint at Porter. Worked on core product experiences for India's leading intra-city logistics platform serving 3M+ customers monthly.",
    ],
  },
  {
    dates: "Jan 17 → Aug 18",
    title: "Founding Designer",
    company: "Coding Ninjas · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/codingninjas.webp",
    bullets: [
      "As the founding designer, owned the entire product lifecycle, from identifying user problems and shaping the product vision to designing experiences, building the front end, analyzing user behavior, and prioritizing the roadmap.",
      "Scaled the platform from an idea to 30,000+ daily active users.",
      "Served as the sole product designer, driving product strategy, innovation, and execution across the organization.",
    ],
  },
  {
    dates: "Oct 16 → Dec 16",
    title: "Product Designer",
    company: "MapleGraph (Acq. by Zomato) · 🇮🇳 India",
    logo: "/portfolio-august/journey/logos/maplegraph.webp",
    bullets: [
      "Led brand identity and product design for a cloud-based POS and hospitality technology platform.",
      "Designed Maple DigiSign and Maple Mobile POS. The company was later acquired by Zomato to become Zomato Base.",
    ],
  },
  {
    dates: "Jul 19 → Feb 20",
    title: "UX/UI Designer",
    company: "La Musique Music App",
    logo: "/portfolio-august/journey/logos/lamusique.svg",
    logoBg: "#000",
    badge: { label: "Freelance work", tone: "freelance" },
    bullets: [
      "Led the redesign of a music streaming app, driving a breakthrough user experience that contributed to 4M+ downloads.",
      "Introduced innovative social and engagement features that set new benchmarks for interaction in music apps.",
    ],
  },
];
