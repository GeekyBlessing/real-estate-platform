import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-150 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-patina-deep " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:active:scale-100";

/**
 * Every variant carries its own default/hover/active/disabled quartet
 * so a press always gives visible feedback, not just primary. Ghost
 * fills the "tertiary" role the brief asks for (text/icon action, no
 * fill or border) rather than introducing a fifth variant name for
 * exactly the same visual job.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-parchment shadow-float hover:bg-[#291d13] active:bg-[#1c130c] disabled:bg-clay disabled:text-parchment/80 disabled:shadow-none",
  secondary:
    "bg-parchment text-ink border border-line-strong hover:border-ink hover:bg-paper-deep active:bg-paper-deep disabled:text-clay disabled:border-line disabled:bg-parchment",
  ghost:
    "bg-transparent text-ink-soft hover:bg-paper-deep hover:text-ink active:bg-paper-deep disabled:text-clay disabled:bg-transparent",
  danger:
    "bg-transparent text-danger border border-danger hover:bg-danger-bg active:bg-danger-bg disabled:text-clay disabled:border-line",
};

/** Comfortable touch heights throughout: even `sm` clears the 40px floor, `md` and `lg` clear 44 and 52. */
const sizes: Record<ButtonSize, string> = {
  sm: "h-10 text-body-sm px-4",
  md: "h-11 text-sm px-5",
  lg: "h-14 text-body px-6",
};

/**
 * One filled (`primary`) action per screen is the rule the design
 * system is built around. Reach for `secondary` for the next most
 * important action on the same view, and `ghost` for a quiet
 * text/icon action such as "Clear all" or "Read more".
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
