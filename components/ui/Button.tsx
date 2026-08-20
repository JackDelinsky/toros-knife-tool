import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "oxblood";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-toros-brass text-toros-black hover:bg-toros-brass-light hover:shadow-[0_0_24px_rgba(168,137,74,0.25)] disabled:opacity-40",
  secondary:
    "border border-toros-border bg-toros-surface/50 text-toros-parchment hover:border-toros-brass/50 hover:text-toros-brass-light backdrop-blur-sm",
  ghost: "text-toros-brass hover:text-toros-brass-light",
  oxblood:
    "border border-toros-oxblood-light/50 bg-toros-oxblood/30 text-toros-parchment hover:border-toros-brass/40 hover:bg-toros-oxblood/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm",
};

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = BaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = BaseProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-sm font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-toros-brass disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  const buttonProps = props as ComponentPropsWithoutRef<"button">;
  return <button type="button" className={classes} {...buttonProps} />;
}
