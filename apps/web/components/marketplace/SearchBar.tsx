"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

const PRICE_CEILINGS = [
  { value: "", label: "Any price" },
  { value: "5000000", label: "Up to 5,000,000" },
  { value: "20000000", label: "Up to 20,000,000" },
  { value: "50000000", label: "Up to 50,000,000" },
  { value: "150000000", label: "Up to 150,000,000" },
];

export interface SearchBarProps {
  compact?: boolean;
}

/**
 * The three filters that eliminate most irrelevant results on their
 * own: location, rent or sale, and a price ceiling. Everything else
 * (bedrooms, bathrooms, amenities, furnishing, size) lives behind the
 * Filters control on the results page, per the blueprint's
 * progressive disclosure rule for search.
 */
export function SearchBar({ compact = false }: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [transactionType, setTransactionType] = useState("rent");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    params.set("type", transactionType);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "flex flex-col gap-2 rounded border border-line bg-parchment p-3 sm:flex-row sm:items-center"
          : "flex flex-col gap-3 rounded-md border border-line bg-parchment p-4 shadow-float sm:flex-row sm:items-center sm:p-2"
      }
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-none text-bark" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <label htmlFor="search-location" className="sr-only">Location</label>
        <input
          id="search-location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Lekki, Wuse, Port Harcourt"
          className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-clay focus:outline-none"
        />
      </div>

      <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 px-2">
        <label htmlFor="search-type" className="sr-only">Rent or sale</label>
        <select
          id="search-type"
          value={transactionType}
          onChange={(event) => setTransactionType(event.target.value)}
          className="bg-transparent py-2 text-sm text-ink focus:outline-none"
        >
          <option value="rent">Rent</option>
          <option value="sale">Buy</option>
        </select>
      </div>

      <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 px-2">
        <label htmlFor="search-price" className="sr-only">Maximum price</label>
        <select
          id="search-price"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="bg-transparent py-2 text-sm text-ink focus:outline-none"
        >
          {PRICE_CEILINGS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <Button type="submit" className="sm:ml-1">Search</Button>
    </form>
  );
}
