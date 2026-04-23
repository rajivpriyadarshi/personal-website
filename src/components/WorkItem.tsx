"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder, LogoPlaceholder } from "./ImagePlaceholder";

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  title: string;
  description: string;
  tags?: string[];
}

interface WorkItemProps {
  company: string | ReactNode;
  role: string;
  period: string;
  location?: string;
  description: ReactNode;
  projects?: Project[];
  highlights?: string[];
  tags?: string[];
  logo?: string;
  companyUrl?: string;
  companyTooltip?: string;
}

// ============================================================================
// COMPANY LINK COMPONENT
// ============================================================================

import { Tooltip } from "./Tooltip";

interface CompanyLinkProps {
  href: string;
  children: ReactNode;
  tooltip?: ReactNode;
}

export function CompanyLink({ href, children, tooltip }: CompanyLinkProps) {
  const link = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-accent hover:underline transition-colors"
    >
      {children}
    </a>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{link}</Tooltip>;
  }

  return link;
}

// ============================================================================
// ICONS
// ============================================================================

function ArrowLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ============================================================================
// WORK HEADER - SINGLE CONSISTENT LAYOUT
// ============================================================================

interface WorkHeaderProps {
  company: string | ReactNode;
  role: string;
  period: string;
  location?: string;
  description: ReactNode;
  highlights?: string[];
  tags?: string[];
  hasProjects: boolean;
  logo?: string;
  companyUrl?: string;
  companyTooltip?: string;
}

function WorkHeader({
  company,
  role,
  period,
  location,
  description,
  highlights,
  tags,
  hasProjects,
  logo,
  companyUrl,
  companyTooltip,
}: WorkHeaderProps) {
  return (
    <div className="container-wide" style={{ marginBottom: "42px", paddingBottom: "0px" }}>
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        {/* Logo */}
        {logo ? (
          <img
            src={logo}
            alt={`${company} logo`}
            className="shrink-0 w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <LogoPlaceholder className="shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1">
          {/* Row 1: Company + Period/Location */}
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
            {companyUrl ? (
              companyTooltip ? (
                <Tooltip content={companyTooltip}>
                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-editorial text-3xl text-text hover:text-accent hover:underline transition-colors"
                  >
                    {company}
                  </a>
                </Tooltip>
              ) : (
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-editorial text-3xl text-text hover:text-accent hover:underline transition-colors"
                >
                  {company}
                </a>
              )
            ) : companyTooltip ? (
              <Tooltip content={companyTooltip}>
                <h3 className="font-editorial text-3xl text-text cursor-help">{company}</h3>
              </Tooltip>
            ) : (
              <h3 className="font-editorial text-3xl text-text">{company}</h3>
            )}
            <div className="flex items-center gap-3 text-text-muted body-sm">
              <span>{period}</span>
              {location && (
                <>
                  <span className="text-text-light">·</span>
                  <span>{location}</span>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Role */}
          <p className="label text-accent mb-4">{role}</p>

          {/* Row 3: Description */}
          <p className="body-base text-text-muted max-w-3xl mb-4">{description}</p>

          {/* Row 4: Highlights (if any) */}
          {highlights && highlights.length > 0 && (
            <ul className="space-y-2 mb-4">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3 body-sm text-text-muted">
                  <span className="text-accent shrink-0">→</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Row 5: Tags (if any) */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="label-sm text-text-light px-2 py-1 border border-border rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROJECT GRID
// ============================================================================

interface ProjectGridProps {
  projects: Project[];
}

function ProjectGrid({ projects }: ProjectGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleItems(prev => new Set([...prev, index]));
              observer.unobserve(ref);
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, [projects.length]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {projects.map((project, index) => (
          <div
            key={index}
            ref={el => { itemRefs.current[index] = el; }}
            className="flex gap-5 items-center"
            style={{
              opacity: visibleItems.has(index) ? 1 : 0,
              transform: visibleItems.has(index) ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease-out ${(index % 6) * 100}ms, transform 0.5s ease-out ${(index % 6) * 100}ms`,
            }}
          >
            {/* Image */}
            <div className="shrink-0 w-24 h-24 bg-bg-alt rounded-lg" />
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-editorial text-lg text-text mb-0">{project.title}</h4>
              <p className="text-text-muted line-clamp-4 leading-relaxed" style={{ fontSize: "13px" }}>{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WorkItem({
  company,
  role,
  period,
  location,
  description,
  projects,
  highlights,
  tags,
  logo,
  companyUrl,
  companyTooltip,
}: WorkItemProps) {
  const companySlug = typeof company === "string"
    ? company.toLowerCase().replace(/\s+/g, "-")
    : "work-item";
  const hasProjects = !!(projects && projects.length > 0);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (itemRef.current) {
            observer.unobserve(itemRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={itemRef}
      id={`work-item-${companySlug}`}
      className={cn(
        "work-item border-t-hairline",
        hasProjects ? "pt-12 pb-16" : "py-10"
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      <WorkHeader
        company={company}
        role={role}
        period={period}
        location={location}
        description={description}
        highlights={highlights}
        tags={tags}
        hasProjects={hasProjects}
        logo={logo}
        companyUrl={companyUrl}
        companyTooltip={companyTooltip}
      />

      {hasProjects && <ProjectGrid projects={projects} />}
    </div>
  );
}

export default WorkItem;
