import { VerificationState } from "@/components/ui/Badge";

const SHIELD_PATH = "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z";

const marks: Record<VerificationState, JSX.Element | null> = {
  unverified: null,
  pending: <path d="M12 9v4l2.5 1.5" />,
  verified: <path d="M9 12l2 2 4-4" />,
  rejected: <path d="M10 10l4 4M14 10l-4 4" />,
  flagged: <path d="M12 8v4M12 15h.01" />,
  suspended: <path d="M9.5 11h5" />,
};

export interface ShieldIconProps {
  state: VerificationState;
  size?: number;
  className?: string;
}

/**
 * One glyph family for every verification state, so meaning never
 * depends on badge color alone. The shield outline is constant; only
 * the mark inside it changes, which is what lets a user learn the
 * language once and read it anywhere it appears.
 */
export function ShieldIcon({ state, size = 15, className }: ShieldIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={SHIELD_PATH} />
      {marks[state]}
    </svg>
  );
}
