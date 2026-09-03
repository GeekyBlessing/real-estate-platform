import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patina-deep " +
  "disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-parchment hover:bg-[#291d13] active:translate-y-px disabled:bg-clay disabled:text-parchment",
  secondary:
    "bg-transparent text-ink border border-ink hover:bg-paper-deep disabled:text-clay disabled:border-line-strong",
  ghost: "bg-transparent text-ink-soft hover:bg-paper-deep hover:text-ink",
  danger: "bg-transparent text-danger border border-danger hover:bg-danger-bg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
};

/**
 * One filled (`primary`) action per screen is the rule the design
 * system is built around. Reach for `secondary` or `ghost` for
 * every other action on the same view.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], loading && "relative text-transparent", className)}
      {...props}
    >
      {loading && (
        <span
          className="absolute h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});
