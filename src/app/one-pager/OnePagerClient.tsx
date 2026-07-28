"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

const projects = [
  {
    title: "Tax Copilot",
    description: "AI-native tax product for filing, computation, and proactive planning.",
    tags: ["AI", "Fintech"],
    href: "/one-pager/tax-copilot",
  },
  {
    title: "Portfolio Analyzer",
    description: "Multi-document wealth analysis with scenario simulation.",
    tags: ["Wealth", "AI"],
  },
  {
    title: "Ada",
    description: "AI-first education counselling platform for students, parents, and counsellors.",
    tags: ["AI", "Edtech"],
    href: "/one-pager/ada",
  },
  {
    title: "LazyPay App Revamp",
    description: "Complete redesign of consumer credit app for 250M+ users.",
    tags: ["Consumer", "Fintech"],
  },
  {
    title: "Porter for Business",
    description: "Enterprise logistics platform for bookings and fulfillment.",
    tags: ["Enterprise", "B2B"],
  },
  {
    title: "Zinc Edu-Wealth",
    description: "Save, invest, and plan in the currency you'll spend — for education abroad.",
    tags: ["Fintech", "Edu-Wealth"],
    href: "/one-pager/zinc-cross-border",
  },
];

const sideProjects = [
  { name: "Design System Kit", description: "Reusable component library" },
  { name: "Motion Lab", description: "Animation experiments" },
  { name: "Portfolio Grid", description: "GSAP scroll study" },
  { name: "Type Explorer", description: "Typography playground" },
];

const experience = [
  {
    period: "2025 — PRESENT",
    months: "Dec 25 – Present",
    role: "Principal Product Designer",
    company: "Zinc Singapore",
    logo: "/logos/zinc.jpeg",
    summary:
      "Working directly with the CEO to shape Zinc's future. In a lean team of 10, I own the full spectrum — from deep problem exploration to design to shipping. Building AI-native financial products across tax, wealth, agents, health, and more.",
  },
  {
    period: "2024 — 2025",
    months: "Jul 24 – Nov 24",
    role: "Principal Product Designer",
    company: "Zinc India",
    logo: "/logos/zinc.jpeg",
    summary:
      "Led 0→1 development across Zinc's core fintech products. Built the foundation for a new kind of financial platform — from education financing and AI-guided counselling to wealth management and GTM micro-applications.",
  },
  {
    period: "2023 — 2024",
    months: "Apr 23 – Jun 24",
    role: "Senior Product Design Manager",
    company: "LazyPay + PaySense",
    logo: "/logos/lazypay.jpeg",
    summary:
      "Led the design org for PayU's credit products. Managed a team of product, illustration, and marketing designers while driving strategy across growth, revenue, retention, and lending verticals reaching 250M+ users.",
  },
  {
    period: "2022 — 2023",
    months: "Apr 22 – Mar 23",
    role: "Product Design Manager",
    company: "LazyPay + PaySense",
    logo: "/logos/lazypay.jpeg",
    summary:
      "Led growth, revenue, retention, repayments, common platforms, and all cash loans. Built full-fledged credit solutions for over 250 million users. Shipped the LazyPay app revamp and credit growth engine.",
  },
  {
    period: "2021 — 2022",
    months: "Apr 21 – Mar 22",
    role: "Lead Product Designer",
    company: "LazyPay + PaySense",
    logo: "/logos/lazypay.jpeg",
    summary:
      "Led growth, revenue, retention, repayments, common platforms, and all cash loans. Built full-fledged credit solutions for over 250 million users. Shipped the repayment experience redesign and common design system.",
  },
  {
    period: "2019 — 2021",
    months: "Jul 19 – Apr 21",
    role: "Product Design Lead",
    company: "Porter",
    logo: "/logos/porter.jpeg",
    summary:
      "Led design across Porter's full ecosystem: customer apps, partner apps, enterprise logistics, and internal tools. Serving 3M+ customers monthly and 300K+ driver-partners across 35+ cities. Shipped customer app redesign, partner app, Porter for Business, Porter Fleet, and CRM redesign.",
  },
  {
    period: "2019 — 2020",
    months: "Dec 19 – Feb 20",
    role: "Volunteer Designer",
    company: "Nirvana.work",
    logo: "/logos/nirvana.jpeg",
    summary:
      "Worked directly with founders to shape a workspace collaboration and task management tool designed to help teams control projects with minimum effort.",
  },
  {
    period: "2019",
    months: "Aug 19 – Dec 19",
    role: "Founding Designer",
    company: "Blackboard Radio",
    logo: "/logos/blackboard-radio.jpeg",
    summary:
      "AI-powered personalized spoken English coach (long before AI went mainstream). Worked directly with founders to help raise funding by conceptualizing, architecting, and revamping the entire product.",
  },
  {
    period: "2019",
    months: "Mar 19 – Jul 19",
    role: "Senior Product Designer",
    company: "OYO Rooms",
    logo: "/logos/oyo.jpeg",
    summary:
      "Worked on new initiatives at OYO to expand the business globally. Contributed to product strategy and design for international market entry across 35+ countries.",
  },
  {
    period: "2018 — 2019",
    months: "Sep 18 – Mar 19",
    role: "Product Designer",
    company: "Porter",
    logo: "/logos/porter.jpeg",
    summary:
      "First stint at Porter. Worked on core product experiences for India's leading intra-city logistics platform serving 3M+ customers monthly.",
  },
  {
    period: "2017 — 2018",
    months: "Jan 17 – Aug 18",
    role: "Founding Designer",
    company: "Coding Ninjas",
    logo: "/logos/coding-ninjas.jpeg",
    summary:
      "Built and scaled the product from 0 to 30K+ daily active users. Sole product designer leading end-to-end product thinking, innovation, and execution for India's leading coding education platform.",
  },
  {
    period: "2016",
    months: "Oct 16 – Dec 16",
    role: "Product Designer",
    company: "MapleGraph (Acq. by Zomato)",
    logo: "/logos/maplegraph.jpeg",
    summary:
      "Led brand identity and product design for a cloud-based POS and hospitality technology platform. Designed Maple DigiSign and Maple Mobile POS. The company was later acquired by Zomato to become Zomato Base.",
  },
  {
    period: "2016",
    months: "Jun 16 – Aug 16",
    role: "Designer & Innovator",
    company: "La Musique",
    logo: null,
    summary:
      "Led the redesign of a music streaming app, driving a breakthrough user experience that contributed to 4M+ downloads. Introduced innovative social and engagement features that set new benchmarks for interaction in music apps.",
  },
];

const skillsRow1 = [
  "Product Strategy",
  "Systems Design",
  "Interaction Design",
  "User Research",
  "Prototyping",
  "Design Systems",
  "Visual Design",
  "Information Architecture",
  "Data Analytics",
  "Usability Testing",
];

const skillsRow2: string[] = [];

const cardPhotos = [
  { src: "/rajiv.jpg", caption: "Me at Mount Titlis, Switzerland" },
  { src: "/photos/1-spiderman.jpeg", caption: "My wanna be spiderman look" },
  { src: "/photos/2-friends.png", caption: "Me with friends" },
  { src: "/photos/3-amsterdam.png", caption: "Me in Amsterdam" },
  { src: "/photos/4-pushups-everest.png", caption: "Pushups around Everest base camp" },
  { src: "/photos/5-everest.jpg", caption: "Near Everest Base Camp" },
];

function PhotoStack() {
  const totalCards = cardPhotos.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const visibleRef = useRef([0, 1, 2]);
  const isAnimating = useRef(false);
  const dragStart = useRef<{ x: number; y: number; cardIdx: number } | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visible, setVisible] = useState([0, 1, 2]);

  const getPositionProps = (posIdx: number) => {
    if (posIdx === 0) return { rotate: -12, x: -28, scale: 0.88, opacity: 0.7, zIndex: 10 };
    if (posIdx === 1) return { rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 30 };
    return { rotate: 12, x: 28, scale: 0.88, opacity: 0.7, zIndex: 10 };
  };

  const animateToPositions = useCallback((visCards: number[]) => {
    visCards.forEach((photoIdx, posIdx) => {
      const card = cardsRef.current[photoIdx];
      if (!card) return;
      const props = getPositionProps(posIdx);
      gsap.to(card, {
        rotation: props.rotate,
        x: props.x,
        scale: props.scale,
        opacity: props.opacity,
        zIndex: props.zIndex,
        duration: 0.5,
        ease: "back.out(1.2)",
      });
    });
  }, []);

  const cycleRight = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const curr = visibleRef.current;
    const next = [(curr[1]), (curr[2]), ((curr[2] + 1) % totalCards)];
    visibleRef.current = next;
    setVisible([...next]);
    animateToPositions(next);
    setTimeout(() => { isAnimating.current = false; }, 500);
  }, [animateToPositions, totalCards]);

  const cycleLeft = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const curr = visibleRef.current;
    const next = [((curr[0] - 1 + totalCards) % totalCards), curr[0], curr[1]];
    visibleRef.current = next;
    setVisible([...next]);
    animateToPositions(next);
    setTimeout(() => { isAnimating.current = false; }, 500);
  }, [animateToPositions, totalCards]);

  const handleClick = useCallback(
    (photoIdx: number) => {
      const posIdx = visibleRef.current.indexOf(photoIdx);
      if (posIdx === 0) cycleLeft();
      else if (posIdx === 2) cycleRight();
    },
    [cycleLeft, cycleRight]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent, photoIdx: number) => {
    dragStart.current = { x: e.clientX, y: e.clientY, cardIdx: photoIdx };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent, photoIdx: number) => {
      if (!dragStart.current || dragStart.current.cardIdx !== photoIdx) return;
      const dx = e.clientX - dragStart.current.x;
      const card = cardsRef.current[photoIdx];
      if (!card) return;

      const posIdx = visibleRef.current.indexOf(photoIdx);
      const baseProps = getPositionProps(posIdx);

      gsap.set(card, {
        x: baseProps.x + dx,
        rotation: baseProps.rotate + dx * 0.08,
      });
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, photoIdx: number) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const threshold = 30;

      if (Math.abs(dx) > threshold) {
        const posIdx = visibleRef.current.indexOf(photoIdx);
        if (posIdx === 1) {
          if (dx < 0) cycleRight();
          else cycleLeft();
        } else {
          handleClick(photoIdx);
        }
      } else if (Math.abs(dx) < 5) {
        handleClick(photoIdx);
      } else {
        const posIdx = visibleRef.current.indexOf(photoIdx);
        const props = getPositionProps(posIdx);
        const card = cardsRef.current[photoIdx];
        if (card) {
          gsap.to(card, {
            x: props.x,
            rotation: props.rotate,
            duration: 0.4,
            ease: "back.out(1.5)",
          });
        }
      }

      dragStart.current = null;
    },
    [handleClick, cycleLeft, cycleRight]
  );

  return (
    <div className="relative w-[160px] h-[160px] shrink-0 flex items-center justify-center">
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        {visible.map((photoIdx, posIdx) => {
          const props = getPositionProps(posIdx);
          return (
            <div
              key={photoIdx}
              ref={(el) => { cardsRef.current[photoIdx] = el; }}
              onPointerDown={(e) => handlePointerDown(e, photoIdx)}
              onPointerMove={(e) => handlePointerMove(e, photoIdx)}
              onPointerUp={(e) => handlePointerUp(e, photoIdx)}
              onMouseEnter={() => setHoveredCard(photoIdx)}
              onMouseLeave={() => setHoveredCard(null)}
              className="absolute w-[120px] h-[120px] rounded-[18px] overflow-hidden border-[3px] border-white shadow-xl cursor-grab active:cursor-grabbing select-none touch-none"
              style={{
                transform: `rotate(${props.rotate}deg) translateX(${props.x}px) scale(${props.scale})`,
                opacity: props.opacity,
                zIndex: props.zIndex,
              }}
            >
              <Image
                src={cardPhotos[photoIdx].src}
                alt={cardPhotos[photoIdx].caption}
                fill
                className="object-cover pointer-events-none"
                sizes="120px"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
      {/* Caption tooltip — above the stack */}
      {hoveredCard !== null && visibleRef.current.indexOf(hoveredCard) === 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-full z-50 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-md text-xs text-zinc-600 whitespace-nowrap pointer-events-none">
          {cardPhotos[hoveredCard].caption}
        </div>
      )}
    </div>
  );
}

export function OnePagerClient() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center font-sans px-4 md:px-0 relative" style={{ lineHeight: "160%" }}>
      {/* Fixed background */}
      {/* <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url(/one-pager-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      /> */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: "#f7f7f7" }} />
      <main className="flex min-h-screen w-full max-w-4xl flex-col gap-8 border-r border-l border-dashed border-zinc-300 py-6 px-4 sm:items-stretch md:px-16 md:py-12" style={{ backgroundColor: "color-mix(in oklab, var(--color-white) 100%, transparent)" }}>

        {/* ─── Hero ─── */}
        <div className="flex items-center md:items-center justify-between flex-col md:flex-row gap-4 w-full">
          <div className="flex items-center md:items-center flex-col md:flex-row gap-4 md:gap-5">
            {/* Photo card stack */}
            <PhotoStack />

            {/* Name / role / badges */}
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 m-0">
                Rajiv Priyadarshi
              </h1>
              <p className="text-sm text-zinc-500 m-0">
                Product Design Generalist
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-zinc-200 bg-white text-zinc-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#A3E635] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#A3E635]" />
                  </span>
                  Open to opportunities
                </span>
                <a
                  href="/resume.pdf"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors no-underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Resume
                </a>
              </div>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href="mailto:rajivpriyadarshi@outlook.com" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/rajivpriyadarshi/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.instagram.com/rajivpriyadarshi" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* ─── About ─── */}
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-zinc-500 m-0 p-0">
            Hey, I'm Rajiv, a{" "}
            <strong className="font-medium text-zinc-700">Product Design Generalist</strong>{" "}
            based in{" "}
            <strong className="font-medium text-zinc-700">Singapore</strong>{" "}
            who's been building digital products for over 10 years across fintech, logistics, edtech, hospitality, and SaaS. I thrive in complex, ambiguous spaces where the problem isn't clearly defined and the stakes are high. Today I work directly with the CEO at{" "}
            <span className="inline-flex items-center gap-1 align-middle">
              <Image src="/logos/zinc.jpeg" alt="Zinc" width={18} height={18} className="rounded-sm border border-zinc-200/90 inline-block" />
              <strong className="font-medium text-zinc-700">Zinc</strong>
            </span>{" "}
            shaping AI-native financial products across tax, wealth, agents, and more.
          </p>
          <p className="text-zinc-500 m-0 p-0">
            I also collaborate with startups and lean teams on 0→1 products. I care deeply about craft, and I bring a systems-thinking approach shaped by years of building at scale — from products reaching <strong className="font-medium text-zinc-700">250M+ users</strong> to scrappy teams of 10.
          </p>
        </div>

        {/* ─── Projects ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold m-0 p-0 text-zinc-600 text-sm uppercase tracking-wide">
              PROJECTS
            </h2>
            <p className="text-zinc-500 m-0 p-0 text-sm">
              Selected work showcasing product design across fintech, AI, and enterprise platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {projects.map((project) => {
              const Wrapper = project.href ? Link : "div";
              const wrapperProps = project.href
                ? { href: project.href, className: "flex flex-col gap-2.5 no-underline group" }
                : { className: "flex flex-col gap-2.5" };
              return (
                <Wrapper key={project.title} {...(wrapperProps as any)}>
                  <div className="relative aspect-[4/3] rounded-lg border border-zinc-200 bg-white overflow-hidden transition-all duration-200 group-hover:border-zinc-300 group-hover:shadow-sm">
                    <div className="w-full h-full bg-gradient-to-b from-zinc-50 to-zinc-100" />
                    <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 bg-white/95 text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {project.href && (
                      <div className="absolute top-2.5 right-2.5 opacity-0 translate-y-0.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-800 m-0">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-500 m-0 mt-0.5 ">
                      {project.description}
                    </p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>

        {/* ─── Side Projects ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold m-0 p-0 text-zinc-600 text-sm uppercase tracking-wide">
              SIDE PROJECTS
            </h2>
            <p className="text-zinc-500 m-0 p-0 text-sm">
              Personal products, experiments and explorations built between work and daily life.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sideProjects.map((sp) => (
              <a
                key={sp.name}
                href="#"
                className="relative flex flex-col rounded-lg border border-zinc-200 bg-white/80 p-4 overflow-hidden aspect-square transition-colors hover:bg-zinc-50 hover:border-zinc-300 no-underline"
              >
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
                <div className="mt-auto">
                  <h3 className="text-sm font-medium text-zinc-800 m-0">
                    {sp.name}
                  </h3>
                  <p className="text-xs text-zinc-500 m-0 mt-0.5">
                    {sp.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ─── Experiences ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold m-0 p-0 text-zinc-600 text-sm uppercase tracking-wide">
              EXPERIENCES
            </h2>
            <p className="text-zinc-500 m-0 p-0 text-sm">
              A quick tour of my professional life, designing user-centered experiences across products, platforms, and industries.
            </p>
          </div>
          <div className="flex flex-col w-full divide-y divide-zinc-100">
            {experience.map((item, idx) => (
              <div key={`${item.company}-${item.period}`}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIdx(expandedIdx === idx ? null : idx)
                  }
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8 w-full py-4 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80"
                  style={{ paddingBottom: expandedIdx === idx ? "2px" : undefined }}
                >
                  <div className="w-full sm:w-32 shrink-0 pt-0.5">
                    <p
                      className="text-sm text-zinc-400 m-0 p-0 transition-colors duration-200 group-hover:text-zinc-600"
                      style={{ color: expandedIdx === idx ? "#52525d" : undefined }}
                    >
                      {item.period}
                    </p>
                    {expandedIdx === idx && (
                      <p className="text-xs text-zinc-400 m-0 p-0 mt-0.5">
                        {item.months}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                    <h3 className="flex items-center flex-wrap font-medium m-0 p-0 tracking-tight text-zinc-600 gap-2 transition-colors duration-200 group-hover:text-zinc-800 text-sm">
                      {item.role} at{" "}
                      {item.logo ? (
                        <Image
                          src={item.logo}
                          alt={item.company}
                          width={22}
                          height={22}
                          className="rounded-sm border border-zinc-200/90 select-none"
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-sm border border-zinc-200/90 bg-zinc-100 text-zinc-500 shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/></svg>
                        </span>
                      )}
                      {item.company}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block text-[11px] uppercase tracking-wide text-zinc-400 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        Details
                      </span>
                      <span className="flex items-center justify-center size-7 rounded-md border border-zinc-200/80 bg-zinc-50/60 text-zinc-400 transition-colors duration-200 group-hover:border-zinc-300 group-hover:bg-zinc-100 group-hover:text-zinc-600">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200"
                          style={{
                            transform:
                              expandedIdx === idx
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: expandedIdx === idx ? "200px" : "0",
                    opacity: expandedIdx === idx ? 1 : 0,
                  }}
                >
                  <div className="pb-4 pl-0 sm:pl-[calc(8rem+2rem)]">
                    <p className="text-sm text-zinc-500  m-0">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Skills / Stack ─── */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold m-0 p-0 text-zinc-600 text-sm uppercase tracking-wide">
            SKILLS / STACK
          </h2>
          <div className="relative w-full overflow-hidden">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 flex-wrap">
                {skillsRow1.map((skill) => (
                  <span
                    key={skill}
                    className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 text-zinc-700 border border-zinc-200" style={{ fontSize: "12px" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                {skillsRow2.map((skill) => (
                  <span
                    key={skill}
                    className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 text-zinc-700 border border-zinc-200" style={{ fontSize: "12px" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Get in Touch ─── */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold m-0 p-0 text-zinc-600 text-sm uppercase tracking-wide">
            GET IN TOUCH
          </h2>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <p className="text-sm text-zinc-500 m-0 max-w-md">
              Always open to a chat, whether it's about an idea, a collaboration, or just an interesting conversation. Particularly interested in fast-moving teams solving exciting problems in fintech, AI, and enterprise. Say hi anytime!
            </p>
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-zinc-200 bg-white text-zinc-700">
                <span>rajivpriyadarshi@outlook.com</span>
                <button
                  className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  aria-label="Copy email"
                  onClick={() => navigator.clipboard.writeText("rajivpriyadarshi@outlook.com")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-zinc-100 mt-4">
          <div className="flex items-center gap-4">
            <a href="mailto:rajivpriyadarshi@outlook.com" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Email">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/rajivpriyadarshi/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.instagram.com/rajivpriyadarshi" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-700 transition-colors" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="/resume.pdf" className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 transition-colors no-underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Resume
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Singapore</span>
            <span className="text-zinc-300">·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
