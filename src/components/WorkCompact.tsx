"use client";

import { LogoPlaceholder } from "./ImagePlaceholder";

interface WorkCompactProps {
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string;
  highlights?: string[];
  tags?: string[];
}

export function WorkCompact({
  company,
  role,
  period,
  location,
  description,
  highlights,
  tags,
}: WorkCompactProps) {
  const companySlug = company.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      id={`work-compact-${companySlug}`}
      className="work-compact border-t-hairline pt-12 pb-12"
    >
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Logo + Meta */}
          <div
            id={`compact-header-${companySlug}`}
            className="compact-header lg:col-span-4 flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <LogoPlaceholder className="shrink-0" />
              <div>
                <h3
                  id={`compact-company-${companySlug}`}
                  className="compact-company font-editorial text-2xl md:text-3xl text-text"
                >
                  {company}
                </h3>
                <p className="compact-role label text-accent mt-1">{role}</p>
              </div>
            </div>
            <div className="compact-meta flex gap-3 text-text-muted body-sm">
              <span>{period}</span>
              {location && (
                <>
                  <span className="text-text-light">·</span>
                  <span>{location}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Content */}
          <div
            id={`compact-content-${companySlug}`}
            className="compact-content lg:col-span-8"
          >
            <p className="compact-description body-base text-text-muted mb-6">
              {description}
            </p>

            {highlights && highlights.length > 0 && (
              <ul className="compact-highlights space-y-2 mb-6">
                {highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex gap-3 body-sm text-text-muted"
                  >
                    <span className="text-accent mt-1">→</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {tags && tags.length > 0 && (
              <div className="compact-tags flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="label-sm text-text-light px-2 py-1 border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkMini({
  company,
  role,
  period,
  location,
  description,
  tags,
}: Omit<WorkCompactProps, "highlights">) {
  const companySlug = company.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      id={`work-mini-${companySlug}`}
      className="work-mini border-t-hairline py-8"
    >
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          {/* Logo */}
          <LogoPlaceholder className="shrink-0" />

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
              <h3 className="font-editorial text-2xl text-text">{company}</h3>
              <div className="flex gap-3 text-text-muted body-sm">
                <span>{period}</span>
                {location && (
                  <>
                    <span className="text-text-light">·</span>
                    <span>{location}</span>
                  </>
                )}
              </div>
            </div>
            <p className="label text-accent mb-3">{role}</p>
            <p className="body-sm text-text-muted max-w-2xl">{description}</p>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, index) => (
                  <span key={index} className="label-sm text-text-light">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
