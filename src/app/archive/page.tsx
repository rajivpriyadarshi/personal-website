import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { WorkItem, CompanyLink } from "@/components/WorkItem";
import {
  CODING_NINJAS,
  LAZYPAY,
  PORTER,
  ZINC_INDIA,
  ZINC_SINGAPORE,
} from "@/content/projects";
import { AnimateOnScroll, StaggerChildren } from "@/components/AnimateOnScroll";
import { Highlight } from "@/components/Highlight";
import { WorkViewProvider, WorkViewToggle } from "@/components/WorkViewToggle";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive — Rajiv Priyadarshi",
  description: "An earlier version of my portfolio, kept for reference.",
  // Superseded by the current site, so keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ArchivePage() {
  return (
    <div id="page-root" className="min-h-screen px-4 md:px-20">
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="hero-section min-h-screen flex items-center justify-center">
        <div id="hero-container" className="hero-container container-wide">
          <div id="hero-grid" className="hero-grid grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Hero Text Content */}
            <div id="hero-content" className="hero-content lg:col-span-7 order-2 lg:order-1">
              <h1 id="hero-title" className="hero-title display text-text mb-8 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both", fontSize: "7rem" }}>
                Hi, I'm Rajiv
              </h1>
              <div id="hero-accent-line" className="hero-accent-line line-accent w-16 mb-8 animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "both" }} />
              <p id="hero-intro" className="hero-intro body-lg text-text-muted max-w-xl mb-6 animate-fade-in-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
                A versatile product design generalist based in Singapore, with{" "}
                <Highlight>10 years</Highlight> of building digital
                products across fintech, logistics, edtech, hospitality, and
                SaaS.
              </p>
              <p id="hero-description" className="hero-description body-base text-text-muted max-w-xl mb-10 animate-fade-in-up" style={{ animationDelay: "500ms", animationFillMode: "both" }}>
                I thrive in complex, ambiguous spaces where the problem isn't
                clearly defined and the stakes are high. From{" "}
                <Highlight>0→1 products</Highlight> to{" "}
                <Highlight>large-scale systems</Highlight>, I switch
                fluidly between strategy, hands-on design, and cross-functional
                alignment.
              </p>
              <div id="hero-cta" className="hero-cta flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
                <a href="#work" className="hero-cta-primary btn-primary hover-lift">See My Work</a>
                <a href="https://wa.me/918852078989" target="_blank" rel="noopener noreferrer" className="hero-cta-secondary btn-secondary hover-lift">Get in Touch</a>
              </div>
            </div>

            {/* Hero Photo */}
            <div id="hero-photo" className="hero-photo lg:col-span-5 order-1 lg:order-2 animate-scale-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              <PhotoCarousel />
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ABOUT SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="about-section section-xl border-t-hairline">
        <div id="about-container" className="about-container container-base">

          {/* About Section Label */}
          <AnimateOnScroll animation="fade-up">
            <div id="about-header" className="about-header flex items-center gap-4 mb-16">
              <span className="about-label label text-text-muted">About</span>
              <div className="about-header-line line-hairline flex-1" />
            </div>
          </AnimateOnScroll>

          {/* Origin Story Block */}
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div id="about-origin" className="about-origin grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
              <div id="about-origin-heading" className="about-origin-heading lg:col-span-4">
                <h2 className="display headline-sm text-text">The origin story</h2>
              </div>
              <div id="about-origin-content" className="about-origin-content lg:col-span-8">
                <div id="about-origin-card" className="about-origin-card glass p-8 md:p-12">
                  <p className="body-lg text-text-muted leading-relaxed mb-6">
                    It started long back when my grandfather used to bring broken
                    tools and machines from his steel plant. He taught me how to
                    rebuild things, how to make something out of scrap.{" "}
                    <Highlight>
                      That's where my obsession with building things began.
                    </Highlight>
                  </p>
                  <p className="body-base text-text-muted leading-relaxed mb-6">
                    I still have a toolbox at my home from when I was a child -
                    filled with tools, broken machines, toys. Most of which I used
                    to break just to learn how they worked.
                  </p>
                  <p className="body-base text-text-muted leading-relaxed mb-6">
                    In school, I got obsessed with space science. Read everything
                    I could find. Wrote a bunch of theories about the universe,
                    stars, and planets. Looking back, they were probably terrible.
                    But the curiosity was real.
                  </p>
                  <p className="body-base text-text-muted leading-relaxed">
                    Eventually in college, I joined a creative club. Started
                    designing posters for festivals, UI mockups to help friends
                    out.{" "}
                    <Highlight>
                      And that's how I discovered design.
                    </Highlight>
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* What I Bring Block */}
          <AnimateOnScroll animation="fade-up" delay={200}>
            <div id="about-skills" className="about-skills grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div id="about-skills-heading" className="about-skills-heading lg:col-span-4">
                <h2 className="display headline-sm text-text">What I bring</h2>
              </div>
              <div id="about-skills-grid" className="about-skills-grid lg:col-span-8">
                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={100}>
                  <div id="skill-card-1" className="skill-card card-outline p-6">
                    <span className="skill-number label-sm text-accent mb-4 block">01</span>
                    <h3 className="skill-title font-editorial text-xl text-text mb-3">Product Thinking</h3>
                    <div className="skill-description body-sm text-text-muted space-y-3">
                      <p>Working mostly in 0→1 environments has shaped how I think. <Highlight>Deep problem exploration</Highlight>, <Highlight>user research</Highlight>, and <Highlight>strategic framing</Highlight> aren't steps I follow; they're instinctive at this point.</p>
                      <p>I'm most comfortable in ambiguous, high-stakes spaces, where the <Highlight>problem isn't clearly defined</Highlight> and clarity has to be built from scratch.</p>
                    </div>
                  </div>
                  <div id="skill-card-2" className="skill-card card-outline p-6">
                    <span className="skill-number label-sm text-accent mb-4 block">02</span>
                    <h3 className="skill-title font-editorial text-xl text-text mb-3">Systems Design</h3>
                    <div className="skill-description body-sm text-text-muted space-y-3">
                      <p>Having worked on products with <Highlight>millions of users</Highlight> and large, evolving codebases, I've learned that design doesn't scale unless systems do.</p>
                      <p>I focus on building design systems, component architectures, and patterns that don't just solve for today, but hold up as the product grows in complexity and scale.</p>
                    </div>
                  </div>
                  <div id="skill-card-3" className="skill-card card-outline p-6">
                    <span className="skill-number label-sm text-accent mb-4 block">03</span>
                    <h3 className="skill-title font-editorial text-xl text-text mb-3">0→1 Execution</h3>
                    <div className="skill-description body-sm text-text-muted space-y-3">
                      <p>Most of my career has been about <Highlight>building from zero</Highlight>. Taking something from a <Highlight>vague idea to a shipped product</Highlight>, figuring out what matters, moving fast, and making trade-offs along the way.</p>
                      <p>I'm used to <Highlight>high ownership</Highlight> and <Highlight>rapid iteration</Highlight>, where execution is as important as thinking.</p>
                    </div>
                  </div>
                  <div id="skill-card-4" className="skill-card card-outline p-6">
                    <span className="skill-number label-sm text-accent mb-4 block">04</span>
                    <h3 className="skill-title font-editorial text-xl text-text mb-3">Cross-functional Leadership</h3>
                    <div className="skill-description body-sm text-text-muted space-y-3">
                      <p>I've worked across both <Highlight>lean teams</Highlight> and <Highlight>large product organizations</Highlight>, often spanning multiple products and workstreams.</p>
                      <p>My role naturally extends into bridging design, engineering, and business, helping teams stay aligned, move fast, and still maintain a <Highlight>high bar for quality</Highlight>.</p>
                    </div>
                  </div>
                </StaggerChildren>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CRAFT SECTION - Bento Grid
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="craft" className="craft-section section-xl border-t-rule">
        <div id="craft-container" className="craft-container container-wide">

          {/* Craft Section Header */}
          <AnimateOnScroll animation="fade-up">
            <div id="craft-header" className="craft-header flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div id="craft-header-left" className="craft-header-left">
                <span className="craft-label label text-text-muted mb-4 block">Craft</span>
                <h2 className="craft-title display headline-md text-text">Selected visuals</h2>
              </div>
              <p id="craft-header-description" className="craft-header-description body-base text-text-muted max-w-md">
                A curated collection of my most visually compelling work: product
                interfaces, design explorations, and creative experiments.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Craft Bento Grid */}
          <AnimateOnScroll animation="fade-up" delay={150}>
            <div id="craft-bento-grid" className="craft-bento-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Large feature - spans 2x2 */}
            <div id="bento-item-1" className="bento-item bento-featured col-span-2 row-span-2">
              <ImagePlaceholder aspectRatio="1/1" className="w-full h-full" label="Featured" />
            </div>

            {/* Tall item */}
            <div id="bento-item-2" className="bento-item bento-tall col-span-1 row-span-2">
              <ImagePlaceholder aspectRatio="1/2" className="w-full h-full" label="Vertical" />
            </div>

            {/* Regular items */}
            <div id="bento-item-3" className="bento-item col-span-1">
              <ImagePlaceholder aspectRatio="1/1" className="w-full" />
            </div>
            <div id="bento-item-4" className="bento-item bento-wide col-span-2">
              <ImagePlaceholder aspectRatio="2/1" className="w-full" />
            </div>

            {/* Wide item */}
            <div id="bento-item-5" className="bento-item bento-wide col-span-2">
              <ImagePlaceholder aspectRatio="2/1" className="w-full" label="Wide" />
            </div>

            {/* Regular items */}
            <div id="bento-item-6" className="bento-item col-span-1">
              <ImagePlaceholder aspectRatio="1/1" className="w-full" />
            </div>

            {/* Large feature 2 */}
            <div id="bento-item-7" className="bento-item bento-featured col-span-2 row-span-2">
              <ImagePlaceholder aspectRatio="1/1" className="w-full h-full" label="Featured" />
            </div>

            <div id="bento-item-8" className="bento-item col-span-1">
              <ImagePlaceholder aspectRatio="1/1" className="w-full" />
            </div>

            {/* Tall item 2 */}
            <div id="bento-item-9" className="bento-item bento-tall col-span-1 row-span-2">
              <ImagePlaceholder aspectRatio="1/2" className="w-full h-full" label="Vertical" />
            </div>

            <div id="bento-item-10" className="bento-item col-span-1">
              <ImagePlaceholder aspectRatio="1/1" className="w-full" />
            </div>
            <div id="bento-item-11" className="bento-item col-span-1">
              <ImagePlaceholder aspectRatio="1/1" className="w-full" />
            </div>

            {/* Bottom wide */}
            <div id="bento-item-12" className="bento-item bento-wide col-span-2">
              <ImagePlaceholder aspectRatio="2/1" className="w-full" />
            </div>
            <div id="bento-item-13" className="bento-item bento-wide col-span-2">
              <ImagePlaceholder aspectRatio="2/1" className="w-full" />
            </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WORK SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <WorkViewProvider>
      <section id="work" className="work-section section-lg border-t-rule">

        {/* Work Section Header */}
        <AnimateOnScroll animation="fade-up">
          <div id="work-header" className="work-header container-wide mb-16" style={{ paddingBottom: "32px" }}>
            <div id="work-header-inner" className="work-header-inner flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div id="work-header-left" className="work-header-left">
                <span className="work-label label text-text-muted mb-4 block">Work</span>
                <h2 className="work-title display headline-md text-text">10 years of building</h2>
              </div>
              <p id="work-header-description" className="work-header-description body-base text-text-muted max-w-lg">
                From fintech and logistics to edtech and hospitality, a decade of
                solving complex problems and shipping products that matter.
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Work Company Sections */}
        <div id="work-companies" className="work-companies">
          <WorkItem
            company="Zinc Singapore"
            role="Principal Product Designer"
            period="Dec 2025 – Present"
            logo="/logos/zinc.jpeg"
            companyUrl="https://www.linkedin.com/company/zincmoney/"
            companyTooltip="Zinc started by solving the study abroad journey end-to-end: helping students decide the right college/path via AI, helping parents plan, finance, and invest for education. From this foundation, Zinc expanded into building a broader fintech platform (banking, credit, wealth) on top of that core use case."
            description={<>Working <Highlight>directly with the CEO</Highlight> to shape the future of Zinc. In a <Highlight>lean team of 10</Highlight>, I <Highlight>own the full spectrum</Highlight>, from deep problem exploration to design to shipping. Fast iterations, rapid testing, and building <Highlight>AI-native financial products</Highlight> across tax, wealth, agents, health, and more.</>}

            projectGroups={ZINC_SINGAPORE.groups}
          />

          <WorkItem
            company="Zinc India"
            role="Principal Product Designer"
            period="Jul 2024 – Nov 2024"
            logo="/logos/zinc.jpeg"
            companyUrl="https://www.linkedin.com/company/zincmoney/"
            companyTooltip="Zinc started by solving the study abroad journey end-to-end: helping students decide the right college/path via AI, helping parents plan, finance, and invest for education. From this foundation, Zinc expanded into building a broader fintech platform (banking, credit, wealth) on top of that core use case."
            description={<>Led <Highlight>0→1 development</Highlight> across Zinc's core fintech products. From education financing to wealth management, <Highlight>building the foundation</Highlight> for a new kind of financial platform.</>}

            projectGroups={ZINC_INDIA.groups}
          />

          <WorkItem
            company={<><CompanyLink href="https://www.linkedin.com/company/lazypay/" tooltip="LazyPay is India's new age digital credit provider. It truly is the fastest way to get credit in a single tap. LazyPay's One tap digital checkout process is available at over 250+ leading apps in India including the likes of Swiggy, Zomato, Book My Show, Make My Trip, Vodafone, TataSky and many more!">LazyPay</CompanyLink> & <CompanyLink href="https://www.linkedin.com/company/paysense/" tooltip="Founded in 2015 and based out of Mumbai, Paysense is a venture backed, financial services startup. We are an amazing team of highly diverse, like minded people solving the fundamental problem of not having simple, convenient and transparent access to credit in India today.">PaySense</CompanyLink> (By <CompanyLink href="https://www.linkedin.com/company/payu/" tooltip="A leading online payment service provider operating in 50+ high-growth markets, dedicated to creating cutting-edge financial services tailored to the needs of over 450,000 merchants and millions of consumers.">PayU</CompanyLink>)</>}
            role="Senior Manager → Manager → Lead"
            period="Apr 2021 – Jun 2024"
            location="India"
            logo="/logos/lazypay.jpeg"
            description={<>Led <Highlight>growth, revenue, retention, and lending design</Highlight> for PayU's credit products. Enabled full-fledged credit solutions reaching <Highlight>250M+ users</Highlight> in India. <Highlight>Grew from IC to leading a team</Highlight> of product, illustration, and marketing designers.</>}

            projects={LAZYPAY.projects}
          />

          <WorkItem
            company="Porter"
            role="Product Design Lead"
            period="Jul 2019 – Apr 2021"
            location="India"
            logo="/logos/porter.jpeg"
            companyUrl="https://www.linkedin.com/company/theporter-in/"
            companyTooltip="Porter is one of India's leading players in the intra-city logistics market, connecting businesses and individuals with local truckers for last-mile deliveries. It serves 30 lakh+ (3M+) customers every month and works with 3 lakh+ (300k+) driver-partners, operating across 35+ cities in India."
            description={<><Highlight>Led design across Porter's ecosystem</Highlight>: customer apps, partner apps, enterprise logistics, and internal tools. Serving <Highlight>3M+ customers monthly</Highlight> and <Highlight>300K+ driver-partners</Highlight> across 35+ cities.</>}

            projects={PORTER.projects}
          />

          {/* Nirvana.work - Volunteer */}
          <WorkItem
            company="Nirvana.work"
            role="Volunteer Designer"
            period="Dec 2019 – Feb 2020"
            logo="/logos/nirvana.jpeg"
            companyUrl="https://www.linkedin.com/company/nirvanaatwork/"
            companyTooltip="Nirvana was a workspace collaboration and task management tool. It was designed to help teams control projects with minimum effort, save precious time and get the clarity they need to build the next big thing at maximum speed."
            description={<>Worked <Highlight>directly with founders</Highlight> to shape a workspace collaboration and task management tool. Designed to help teams control projects with minimum effort and build at maximum speed.</>}
            tags={["Productivity", "SaaS", "0→1", "Volunteer"]}
            showGallery
          />

          {/* Blackboard Radio - Volunteer */}
          <WorkItem
            company="Blackboard Radio"
            role="Founding Designer"
            period="Aug 2019 – Dec 2019"
            logo="/logos/blackboard-radio.jpeg"
            companyUrl="https://www.linkedin.com/company/blackboard-radio/"
            companyTooltip="Blackboard Radio was an AI-powered personalized spoken English coach (long before AI got mainstream). It enabled conversational-English mastery by providing interactive, personalized instruction over a basic smartphone to young children from all socio-economic backgrounds, opening the door to a lifetime of improved employment opportunities."
            description={<><Highlight>AI-powered</Highlight> personalized spoken English coach (long before AI went mainstream). Worked <Highlight>directly with founders</Highlight> to <Highlight>help raise funding</Highlight> by conceptualizing, architecting, and revamping the entire product.</>}
            highlights={[
              "Helped the team raise funding through design vision and product architecture",
              "Pioneered conversational-English mastery for children from all socio-economic backgrounds",
            ]}
            tags={["Edtech", "AI", "0→1", "Volunteer"]}
            showGallery
          />

          {/* OYO Rooms */}
          <WorkItem
            company="OYO Rooms"
            role="Senior Product Designer"
            period="Mar 2019 – Jul 2019"
            location="India"
            logo="/logos/oyo.jpeg"
            companyUrl="https://www.linkedin.com/company/oyo-rooms/"
            companyTooltip="OYO is a global platform that empowers entrepreneurs and small businesses with hotels and homes by providing full-stack technology products and services. OYO offers 40+ integrated products and solutions to patrons who operate over 157K hotel and home storefronts in more than 35 countries including India, Europe, and Southeast Asia."
            description={<>Worked on new initiatives at OYO to <Highlight>expand the business globally</Highlight>. Contributed to product strategy and design for <Highlight>international market entry</Highlight>.</>}
            tags={["Travel", "Hospitality", "Global Expansion"]}
            showGallery
          />

          {/* Porter - First stint */}
          <WorkItem
            company="Porter"
            role="Product Designer"
            period="Sep 2018 – Mar 2019"
            location="India"
            logo="/logos/porter.jpeg"
            companyUrl="https://www.linkedin.com/company/theporter-in/"
            companyTooltip="Porter is one of India's leading players in the intra-city logistics market, connecting businesses and individuals with local truckers for last-mile deliveries. It serves 30 lakh+ (3M+) customers every month and works with 3 lakh+ (300k+) driver-partners, operating across 35+ cities in India."
            description={<>First stint at Porter before returning as Design Lead. Worked on core product experiences for <Highlight>India's leading intra-city logistics platform</Highlight> serving <Highlight>3M+ customers monthly</Highlight>.</>}
            tags={["Logistics", "Consumer", "Mobile"]}
            showGallery
          />

          {/* Coding Ninjas */}
          <WorkItem
            company="Coding Ninjas"
            role="Founding Designer"
            period="Jan 2017 – Aug 2018"
            location="India"
            logo="/logos/coding-ninjas.jpeg"
            companyUrl="https://www.linkedin.com/school/codingninjas/"
            companyTooltip="Coding Ninjas is a leading edtech platform in India focused on teaching programming and tech skills to students and professionals. It has served 50K+ paid learners and a broader community of 1M+ registered users, offering structured courses, live classes, and mentorship to help learners build real-world skills."
            description={<>Built and scaled the product from <Highlight>0 to 30K+ daily active users</Highlight>. <Highlight>Sole product designer</Highlight> leading end-to-end product thinking, innovation, and execution for India's leading coding education platform.</>}

            projects={CODING_NINJAS.projects}
          />

          {/* MapleGraph */}
          <WorkItem
            company="MapleGraph"
            role="Product Designer"
            period="Oct 2016 – Dec 2016"
            location="India"
            logo="/logos/maplegraph.jpeg"
            companyUrl="https://www.linkedin.com/company/maplegraph-solutions-pvt-ltd-/"
            companyTooltip="MapleGraph is a cloud-based POS and hospitality technology platform offering tools for restaurants to manage operations end-to-end, including billing, menu management, inventory, CRM, and analytics."
            description={<>Led brand identity and product design for MapleGraph, a cloud-based POS and hospitality technology platform. The company was later <Highlight>acquired by Zomato</Highlight> to become Zomato Base.</>}
            highlights={[
              "Designed Maple DigiSign, a digital signage product simplified for retail operators",
              "Built Maple Mobile POS (Queue Buster) for faster checkout and on-the-go billing",
            ]}
            tags={["Hospitality", "POS", "Acquired by Zomato"]}
            showGallery
          />

          {/* La Musique */}
          <WorkItem
            company="La Musique"
            role="Designer & Innovator"
            period="Jun 2016 – Aug 2016"
            companyTooltip="La Musique was a famous Android music app back in the days before streaming music became mainstream. It had over 4 million downloads."
            description={<>Led the redesign of a music streaming app, driving a breakthrough user experience that contributed to <Highlight>4M+ downloads</Highlight>. Introduced <Highlight>innovative social and engagement features</Highlight> that set new benchmarks for interaction in music apps.</>}
            highlights={[
              "Redesign contributed to 4M+ downloads",
              "Pioneered social features that transformed passive listening into community-driven experiences",
            ]}
            tags={["Consumer", "Music", "Social", "Freelance"]}
            showGallery
          />
        </div>
      </section>
      <WorkViewToggle />
      </WorkViewProvider>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONTACT SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="contact-section section-xl border-t-rule">
        <div id="contact-container" className="contact-container container-narrow text-center">
          <AnimateOnScroll animation="fade-up">
            <span id="contact-label" className="contact-label label text-text-muted mb-6 block">Contact</span>
            <h2 id="contact-title" className="contact-title display headline-md text-text mb-6">
              Let's build something
            </h2>
            <p id="contact-description" className="contact-description body-lg text-text-muted mb-12 max-w-md mx-auto">
              Whether you're working on a 0→1 product, scaling a platform, or just
              want to chat about design, I'd love to hear from you.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={150}>
            <div id="contact-cta" className="contact-cta flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="https://wa.me/918852078989" target="_blank" rel="noopener noreferrer" className="contact-cta-primary btn-primary">Say Hello</a>
              <a href="#" className="contact-cta-secondary btn-secondary">Download Resume</a>
            </div>
          </AnimateOnScroll>

          {/* Social Links */}
          <AnimateOnScroll animation="fade-in" delay={300}>
            <div id="contact-divider" className="contact-divider line-hairline mb-8" />
            <div id="contact-social" className="contact-social flex justify-center gap-8">
              <a href="https://www.linkedin.com/in/rajivpriyadarshi/" target="_blank" rel="noopener noreferrer" className="social-link link-subtle body-sm">LinkedIn</a>
              <a href="https://www.instagram.com/rajivpriyadarshi" target="_blank" rel="noopener noreferrer" className="social-link link-subtle body-sm">Instagram</a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer id="footer" className="footer border-t-hairline py-8">
        <div id="footer-container" className="footer-container container-wide flex flex-col md:flex-row justify-between items-center gap-4">
          <span id="footer-credit" className="footer-credit label-sm text-text-light">Designed & built by Rajiv</span>
          <span id="footer-location" className="footer-location label-sm text-text-light">Singapore · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
