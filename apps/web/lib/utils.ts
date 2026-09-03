/**
 * Joins class names, dropping falsy values. Kept dependency-free
 * (no clsx/cva) since the variant maps in components/ui are small
 * enough to write out directly.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNaira(amountInKobo: number): string {
  const naira = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}
