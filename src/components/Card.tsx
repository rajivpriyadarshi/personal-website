import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

type CardVariant = "default" | "glass" | "outline" | "solid";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: "none" | "sm" | "default" | "lg";
  hover?: boolean;
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

/**
 * Card - Container with consistent styling
 * Variants: default (glass), glass, outline, solid
 */
export function Card({
  children,
  variant = "default",
  className,
  padding = "default",
  hover = false,
}: CardProps) {
  const variantClasses = {
    default: "card",
    glass: "glass",
    outline: "card-outline",
    solid: "bg-surface border border-border rounded-card",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8 md:p-12",
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover-lift cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * CardHeader - Header section of a card
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// CARD CONTENT COMPONENT
// ============================================================================

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * CardContent - Main content area of a card
 */
export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

/**
 * CardFooter - Footer section of a card
 */
export function CardFooter({ children, className, bordered = false }: CardFooterProps) {
  return (
    <div className={cn("mt-auto pt-4", bordered && "border-t-hairline", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

interface FeatureCardProps {
  number?: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * FeatureCard - Card with number, title, and description
 * Used for skills, features, etc.
 */
export function FeatureCard({
  number,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card variant="outline" className={className}>
      {number && (
        <span className="label-sm text-accent mb-4 block">{number}</span>
      )}
      <h3 className="font-editorial text-xl text-text mb-3">{title}</h3>
      <p className="body-sm text-text-muted">{description}</p>
    </Card>
  );
}

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================

interface ProjectCardProps {
  title: string;
  description: string;
  tags?: string[];
  image?: ReactNode;
  className?: string;
}

/**
 * ProjectCard - Card for project items in carousels
 */
export function ProjectCard({
  title,
  description,
  tags,
  image,
  className,
}: ProjectCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {image && <div className="mb-6">{image}</div>}
      <CardContent>
        <h4 className="font-editorial text-xl text-text mb-3">{title}</h4>
        <p className="body-sm text-text-muted mb-4 line-clamp-3">{description}</p>
      </CardContent>
      {tags && tags.length > 0 && (
        <CardFooter bordered>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="label-sm text-text-light">{tag}</span>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default Card;
