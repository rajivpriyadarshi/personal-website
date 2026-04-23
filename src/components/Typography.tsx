import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface BaseProps {
  children: ReactNode;
  className?: string;
}

// ============================================================================
// DISPLAY / HEADLINE COMPONENTS
// ============================================================================

interface DisplayProps extends BaseProps {
  as?: HeadingLevel;
  size?: "xl" | "lg" | "md" | "sm";
}

/**
 * Display - Large editorial headlines
 * Uses PP Editorial New font
 * Sizes: xl (96px), lg (72px), md (48px), sm (36px)
 */
export function Display({
  children,
  className,
  as: Tag = "h1",
  size = "lg",
}: DisplayProps) {
  const sizeClasses = {
    xl: "headline-xl", // 96px
    lg: "headline-lg", // 72px
    md: "headline-md", // 48px
    sm: "headline-sm", // 36px
  };

  return (
    <Tag className={cn("display", sizeClasses[size], "text-text", className)}>
      {children}
    </Tag>
  );
}

// ============================================================================
// TITLE COMPONENTS
// ============================================================================

interface TitleProps extends BaseProps {
  as?: HeadingLevel;
  size?: "lg" | "md" | "sm";
}

/**
 * Title - Section and card titles
 * Uses PP Editorial New font
 * Sizes: lg (30px), md (24px), sm (20px)
 */
export function Title({
  children,
  className,
  as: Tag = "h3",
  size = "md",
}: TitleProps) {
  const sizeClasses = {
    lg: "text-3xl",  // 30px
    md: "text-2xl",  // 24px
    sm: "text-xl",   // 20px
  };

  return (
    <Tag className={cn("font-editorial", sizeClasses[size], "text-text", className)}>
      {children}
    </Tag>
  );
}

// ============================================================================
// BODY TEXT COMPONENTS
// ============================================================================

interface BodyProps extends BaseProps {
  size?: "lg" | "base" | "sm";
  muted?: boolean;
}

/**
 * Body - Body text paragraphs
 * Uses Sohne font
 * Sizes: lg (18px), base (16px), sm (14px)
 */
export function Body({
  children,
  className,
  size = "base",
  muted = true,
}: BodyProps) {
  const sizeClasses = {
    lg: "body-lg",     // 18px
    base: "body-base", // 16px
    sm: "body-sm",     // 14px
  };

  return (
    <p className={cn(sizeClasses[size], muted ? "text-text-muted" : "text-text", className)}>
      {children}
    </p>
  );
}

// ============================================================================
// LABEL COMPONENTS
// ============================================================================

interface LabelProps extends BaseProps {
  size?: "base" | "sm";
  variant?: "default" | "accent" | "muted" | "light";
}

/**
 * Label - UI labels, categories, metadata
 * Uses Sohne font with tracking
 * Sizes: base (12px), sm (10px)
 */
export function Label({
  children,
  className,
  size = "base",
  variant = "default",
}: LabelProps) {
  const sizeClasses = {
    base: "label",    // 12px
    sm: "label-sm",   // 10px
  };

  const variantClasses = {
    default: "text-text",
    accent: "text-accent",
    muted: "text-text-muted",
    light: "text-text-light",
  };

  return (
    <span className={cn(sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
}

// ============================================================================
// TAG COMPONENT
// ============================================================================

interface TagProps extends BaseProps {
  variant?: "default" | "outline";
}

/**
 * Tag - Small tags for categories and metadata
 */
export function Tag({
  children,
  className,
  variant = "default",
}: TagProps) {
  const variantClasses = {
    default: "label-sm text-text-light",
    outline: "label-sm text-text-light px-2 py-1 border border-border",
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  );
}

// ============================================================================
// HIGHLIGHT / EMPHASIS COMPONENTS
// ============================================================================

interface TextProps extends BaseProps {
  variant?: "default" | "accent" | "muted" | "light";
}

/**
 * Text - Inline text with color variants
 * Use inside Body or other text components for emphasis
 */
export function Text({
  children,
  className,
  variant = "default",
}: TextProps) {
  const variantClasses = {
    default: "text-text",
    accent: "text-accent",
    muted: "text-text-muted",
    light: "text-text-light",
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
  titleSize?: "xl" | "lg" | "md" | "sm";
  layout?: "stacked" | "inline";
}

/**
 * SectionHeader - Consistent section headers with label, title, and optional description
 */
export function SectionHeader({
  label,
  title,
  description,
  className,
  titleSize = "md",
  layout = "stacked",
}: SectionHeaderProps) {
  if (layout === "inline") {
    return (
      <div className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-6", className)}>
        <div>
          <Label variant="muted" className="mb-4 block">{label}</Label>
          <Display as="h2" size={titleSize}>{title}</Display>
        </div>
        {description && (
          <Body className="max-w-md">{description}</Body>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Label variant="muted" className="mb-4 block">{label}</Label>
      <Display as="h2" size={titleSize}>{title}</Display>
      {description && (
        <Body className="mt-4 max-w-2xl">{description}</Body>
      )}
    </div>
  );
}

// ============================================================================
// METADATA ROW COMPONENT
// ============================================================================

interface MetadataProps {
  items: (string | undefined)[];
  separator?: string;
  className?: string;
}

/**
 * Metadata - Row of metadata items with separators
 * Automatically filters out undefined items
 */
export function Metadata({
  items,
  separator = "·",
  className,
}: MetadataProps) {
  const filteredItems = items.filter(Boolean) as string[];

  return (
    <div className={cn("flex gap-3 text-text-muted body-sm", className)}>
      {filteredItems.map((item, index) => (
        <span key={index} className="flex items-center gap-3">
          {index > 0 && <span className="text-text-light">{separator}</span>}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// HIGHLIGHT LIST COMPONENT
// ============================================================================

interface HighlightListProps {
  items: string[];
  className?: string;
}

/**
 * HighlightList - List of highlights with arrow indicators
 */
export function HighlightList({
  items,
  className,
}: HighlightListProps) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 body-sm text-text-muted">
          <span className="text-accent mt-1">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// TAG LIST COMPONENT
// ============================================================================

interface TagListProps {
  tags: string[];
  variant?: "default" | "outline";
  className?: string;
}

/**
 * TagList - Row of tags
 */
export function TagList({
  tags,
  variant = "default",
  className,
}: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, index) => (
        <Tag key={index} variant={variant}>
          {tag}
        </Tag>
      ))}
    </div>
  );
}

export default {
  Display,
  Title,
  Body,
  Label,
  Tag,
  Text,
  SectionHeader,
  Metadata,
  HighlightList,
  TagList,
};
