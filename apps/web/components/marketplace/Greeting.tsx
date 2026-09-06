"use client";

import { useEffect, useState } from "react";

/**
 * Renders a time-agnostic default on the server and the first client
 * render, then swaps to the real time-of-day greeting once mounted.
 * A greeting computed from the server's clock would not reliably
 * match the visitor's own local time anyway, so this avoids both a
 * hydration mismatch and a greeting that's wrong for the person
 * actually looking at it.
 */
export function Greeting() {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return <>{greeting}</>;
}
