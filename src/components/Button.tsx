import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  lift?: boolean;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: "button";
    href?: never;
  };

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: "a";
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

/**
 * Button - Consistent button styling
 * Variants: primary, secondary, ghost, link
 * Sizes: sm, default, lg
 */
export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  lift = true,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "bg-transparent text-text hover:bg-surface-light transition-colors",
    link: "link-subtle link-animated",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "",
    lg: "px-8 py-4 text-base",
  };

  const baseClasses = cn(
    variantClasses[variant],
    variant !== "link" && sizeClasses[size],
    lift && variant !== "link" && "hover-lift",
    className
  );

  if (props.as === "a") {
    const { as, ...anchorProps } = props;
    return (
      <a className={baseClasses} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { as, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={baseClasses} {...buttonProps}>
      {children}
    </button>
  );
}

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  label: string;
  variant?: "default" | "glass";
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * IconButton - Button with only an icon
 */
export function IconButton({
  icon,
  label,
  variant = "default",
  size = "default",
  className,
  ...props
}: IconButtonProps) {
  const variantClasses = {
    default: "bg-surface-light text-text hover:text-accent",
    glass: "glass-strong text-text hover:text-accent",
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-10 h-10 md:w-12 md:h-12",
    lg: "w-14 h-14",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center transition-all",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  direction?: "row" | "column";
}

/**
 * ButtonGroup - Container for multiple buttons
 */
export function ButtonGroup({
  children,
  className,
  direction = "row",
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-4",
        direction === "column" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Button;
