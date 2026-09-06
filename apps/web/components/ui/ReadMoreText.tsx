"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ReadMoreTextProps {
  text: string;
  className?: string;
}

/**
 * Truncates long copy to three lines with a "Read more" toggle,
 * rather than always showing the full paragraph and letting it eat
 * the top of the screen before a user has decided the listing is
 * worth reading about in detail.
 */
export function ReadMoreText({ text, className }: ReadMoreTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p className={cn("text-body leading-relaxed text-ink-soft", !expanded && "line-clamp-3", className)}>{text}</p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-1.5 text-body-sm font-semibold text-patina hover:text-patina-deep"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
