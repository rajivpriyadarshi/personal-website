/* Everything the assistant knows, assembled from the site's own data.
 *
 * The rule here is that nothing is copied. Each section serialises a module the
 * site itself renders from, so editing a role card or adding a project updates
 * the assistant in the same commit. The one exception is `src/content/`, which
 * holds facts that have no home in the UI at all (contact details, boundaries).
 *
 * This runs once at module scope, not per request — the string is byte-identical
 * on every call, which also means Gemini's implicit prefix caching can do its
 * job. At roughly 23k tokens it's about 2% of Flash's context window, so there's
 * no retrieval step and therefore no chance of retrieving the wrong thing.
 *
 * Server-only: imported by the chat route, never by a client component. */

import { ROLES as JOURNEY } from "@/app/portfolio-august/journey-data";
import { ROLES as CAPABILITIES } from "@/app/portfolio-august/role-data";
import { CASE_STUDIES, PLANNED_CASE_STUDIES } from "@/content/case-studies";
import { CHARACTER } from "@/content/character";
import { PROJECTS_BY_COMPANY } from "@/content/projects";
import { TESTIMONIALS } from "@/content/testimonials";
import { BOUNDARIES } from "@/content/boundaries";
import { CONTACT, IDENTITY, OUTSIDE_WORK, STORY } from "@/content/profile";

/** `- ` bullets, one per line. */
const bullets = (lines: string[]) => lines.map((l) => `- ${l}`).join("\n");

/* Placed before the evidence rather than after it, so the model has the lens to
 * read the roles and projects through — and so a "what are you like to work with"
 * question is answered from here rather than improvised out of a project list.
 *
 * The instruction is the load-bearing half. A list of strengths handed to a model
 * comes back as a list of compliments, which is worse than useless when the reader
 * is a hiring manager. */
function characterSection() {
  return [
    "## How I work and what I'm like",
    "This is the lens for anything about your strengths, your style, how you work with engineers or PMs, or whether you'd fit a role. Two rules when you use it. First, no generic praise — never anything like \"I'm passionate about creating delightful user experiences.\" Say the specific thing instead: that you tend to operate beyond the interface layer, that a CS background and lean teams mean you work across product strategy, system design and engineering constraints as part of solving a design problem. Second, answer in the shape trait → why it's true → evidence from the actual work, and pull that evidence from the roles, projects and write-ups below. A trait with a project behind it persuades; a trait on its own reads as self-promotion. And don't overstate a trait into a claim the work doesn't support. Third: \"what are you like to work with\" is a question about a colleague, not only about a designer — so at least part of that answer comes from the life-outside-work section further down, not from this one. Someone asking it wants to know whether they'd enjoy the person, and an answer made entirely of working style reads as a candidate who has nothing else going on. Don't force it into every question about strengths or fit; do include it whenever the question is about what he's *like*. Fourth, and it governs every question about a role, a title, a level or seniority: the first section below is the positioning, and it is Head of Design. Someone asking \"would you fit a head of design role\" is not asking you to define the term for them — they want to know whether to keep reading. Open with the yes and with what makes the candidacy unusual: the execution stack survived the leadership, so the direction gets set *and* built. The qualification about large mature orgs is real and belongs in the answer, but it's one clause at the end, not the frame. Never answer a question about a leadership role by leading with \"it depends what you mean\", and never cite the current lack of direct reports as a reason for doubt.",
    CHARACTER,
  ].join("\n\n");
}

/* Every claim carries the company and the period it belongs to. That's what
 * keeps the model naming a specific job rather than smoothing several together
 * into a plausible average. */
function journeySection() {
  const entries = JOURNEY.map((role) => {
    const badge = role.badge ? ` (${role.badge.label})` : "";
    return [
      `### ${role.title} — ${role.company}${badge}`,
      `Dates: ${role.dates}`,
      bullets(role.bullets),
    ].join("\n");
  });

  return [
    "## My career, newest first",
    "These are the roles as they appear on my site's journey section. For the jobs with no write-up further down — Porter, OYO, Coding Ninjas, the founding-designer stints — these bullets plus the project one-liners are the whole of what you know. \"Led the redesign of the partner app\" means exactly that: don't go on to name screens, features or improvements that aren't written here. Give what's there, add anything the character section genuinely supports, and if someone wants the specifics say they'd need to hear it from me directly.",
    entries.join("\n\n"),
  ].join("\n\n");
}

function capabilitiesSection() {
  const entries = CAPABILITIES.map((role) => {
    const panels = role.panels.map((panel) =>
      [
        `#### ${panel.title}`,
        panel.intro.join("\n\n"),
        "What I did:",
        bullets(panel.did),
      ].join("\n\n"),
    );

    return [`### ${role.title}`, role.blurb, panels.join("\n\n")].join("\n\n");
  });

  return [
    "## The four things I'm good at, with evidence",
    "Each of these is backed by specific work. When someone asks what I'm good at, answer from here — the detail is the point.",
    entries.join("\n\n"),
  ].join("\n\n");
}

function projectsSection() {
  const entries = PROJECTS_BY_COMPANY.map((company) => {
    const header = `### ${company.company} — ${company.role} (${company.period})`;

    const groups = (company.groups ?? []).map((group) =>
      [
        `#### ${group.groupTitle}`,
        group.groupDescription ?? "",
        bullets(group.projects.map((p) => `**${p.title}** — ${p.description}`)),
      ]
        .filter(Boolean)
        .join("\n\n"),
    );

    const flat = company.projects
      ? bullets(company.projects.map((p) => `**${p.title}** — ${p.description}`))
      : "";

    return [header, ...groups, flat].filter(Boolean).join("\n\n");
  });

  return [
    "## Named projects, by company",
    "The full index. Some of these shipped, some were explorations that didn't. Where a project has a written brief further down, use it. Where all you have is the one line below, give them that line and say it's the summary you have — don't extrapolate a case study out of a title, and don't send them off to another page.",
    entries.join("\n\n"),
  ].join("\n\n");
}

/* The few projects with a real write-up. Placed after the index so the model has
 * already seen the one-liner these expand on. */
function caseStudiesSection() {
  const entries = CASE_STUDIES.map((study) =>
    [
      `### ${study.title}`,
      [
        `Company: ${study.company}`,
        `When: ${study.period}`,
        `My role: ${study.role}`,
        `Team: ${study.team}`,
        study.project ? `Listed in the project index as: ${study.project}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      study.body,
    ].join("\n\n"),
  );

  return [
    "## Projects I've written up in full",
    "These are the only projects where you have the whole story — the constraint, the trade-offs, the testing, the numbers. Answer from here in detail when one of them comes up, and use the specifics: they're the reason these answers land. Quote the figures exactly as written; don't round them, invent new ones, or imply a result that isn't stated. Every other project has just its line in the index above.",
    entries.join("\n\n"),
  ].join("\n\n");
}

/* Work with a real summary and nothing behind it. Kept separate from the full
 * write-ups on purpose: the boundary is the whole point, so the model can give an
 * accurate line and then stop rather than reconstructing a case study. */
function plannedSection() {
  const entries = PLANNED_CASE_STUDIES.map((study) =>
    [
      `### ${study.title}`,
      `${study.company} · ${study.period} · ${study.tags.join(", ")}`,
      study.summary.replace(/\s+/g, " ").trim(),
    ].join("\n"),
  );

  return [
    "## Work I can summarise but not walk through",
    "Each of these has a summary I stand behind and nothing more in front of you — no process, no numbers, no decisions. Give the summary, say plainly that it's the short version and you'd need me to walk them through the rest, and stop there. Don't reconstruct the project from the title or the tags, and don't offer to send them anywhere.",
    entries.join("\n\n"),
  ].join("\n\n");
}

function testimonialsSection() {
  const entries = TESTIMONIALS.map(
    (note) => `- "${note.quote}" — ${note.name}, ${note.role}`,
  );

  return [
    "## What people I've worked with have said",
    "These are public on my site and attributed, so quote them by name when they're relevant. Quote them accurately; don't paraphrase them into something stronger.",
    entries.join("\n"),
  ].join("\n\n");
}

function buildCorpus() {
  return [
    "# What I know about myself",
    "## Who I am",
    IDENTITY,
    "## How I got here",
    STORY,
    characterSection(),
    journeySection(),
    capabilitiesSection(),
    projectsSection(),
    caseStudiesSection(),
    plannedSection(),
    testimonialsSection(),
    "## Life outside work",
    OUTSIDE_WORK,
    "## Getting in touch",
    CONTACT,
    "## What I won't discuss here",
    BOUNDARIES,
  ].join("\n\n");
}

export const CORPUS = buildCorpus();
