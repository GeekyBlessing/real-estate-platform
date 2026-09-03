import Link from "next/link";

const COLUMNS = [
  {
    heading: "Marketplace",
    links: [
      { label: "Buy", href: "/search?type=sale" },
      { label: "Rent", href: "/search?type=rent" },
      { label: "List a property", href: "/list-a-property" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { label: "How verification works", href: "/verification" },
      { label: "Report a listing", href: "/report" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <p className="font-mono text-xs uppercase tracking-wider text-bark">{column.heading}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-xs text-clay">
        Ile is a placeholder name pending the client's brand decision. Verification reduces risk and confirms
        specific checks were performed; it is not a guarantee against fraud or a legal guarantee of ownership.
      </p>
    </footer>
  );
}
