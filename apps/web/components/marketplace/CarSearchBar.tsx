"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VEHICLE_MAKES } from "@/lib/vehicles";

const PRICE_CEILINGS = [
  { value: "", label: "Any price" },
  { value: "3000000", label: "Up to 3,000,000" },
  { value: "10000000", label: "Up to 10,000,000" },
  { value: "25000000", label: "Up to 25,000,000" },
  { value: "60000000", label: "Up to 60,000,000" },
];

export interface CarSearchBarProps {
  compact?: boolean;
}

/**
 * The car equivalent of SearchBar (components/marketplace/SearchBar.tsx).
 * Deliberately its own set of essentials rather than the property
 * search bar with relabeled fields: location, make, and a price
 * ceiling eliminate most irrelevant results for a car search on
 * their own, model, year, mileage, transmission, fuel, body type,
 * and condition live behind the Filters control on the results page.
 */
export function CarSearchBar({ compact = false }: CarSearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (make) params.set("make", make);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/cars?${params.toString()}`);
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
        <label htmlFor="car-search-location" className="sr-only">Location</label>
        <input
          id="car-search-location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Lekki, Abeokuta, Port Harcourt"
          className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-clay focus:outline-none"
        />
      </div>

      <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 px-2">
        <label htmlFor="car-search-make" className="sr-only">Make</label>
        <select
          id="car-search-make"
          value={make}
          onChange={(event) => setMake(event.target.value)}
          className="bg-transparent py-2 text-sm text-ink focus:outline-none"
        >
          <option value="">Any make</option>
          {VEHICLE_MAKES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 px-2">
        <label htmlFor="car-search-price" className="sr-only">Maximum price</label>
        <select
          id="car-search-price"
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
