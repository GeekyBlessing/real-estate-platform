import { SearchBar } from "./SearchBar";

/**
 * States what the platform does and why it can be trusted in one
 * sentence, per the blueprint's homepage rule against generic hero
 * copy. The search bar lives inside the hero itself, not below a
 * photo, so the page's first real action is available immediately.
 */
export function Hero() {
  return (
    <section className="border-b border-line bg-paper-deep px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          Search verified properties across Nigeria, and talk to the person who owns or manages them.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
          Every listing shows exactly what has been checked, identity, ownership documents, and listing accuracy,
          before you ever contact an agent or request an inspection.
        </p>
        <div className="mx-auto mt-8 max-w-2xl text-left">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
