const SIZE_CLASSES = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-lg",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

/**
 * The initials-on-a-solid-circle treatment used for a person with no
 * real photo yet: a seller on a listing card, an agent on their card,
 * the signed-in account button. Four call sites each recomputed the
 * same split(" ").map(part => part[0]) logic and the same bg-patina
 * circle independently before this existed, which meant the "same
 * person" pattern was implemented four slightly different ways
 * rather than sharing one component; a fifth call site could easily
 * have drifted (wrong slice length, a different background token)
 * without anyone noticing.
 */
export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full bg-patina font-mono font-bold text-white ${SIZE_CLASSES[size]} ${className ?? ""}`}
    >
      {initials}
    </span>
  );
}
