"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    // Phase 3 wires this to POST /auth/login. Simulated here so the
    // error and loading states are real to review now.
    setTimeout(() => {
      setSubmitting(false);
      if (!email || !password) {
        setError("Enter your email and password to continue.");
        return;
      }
      showToast("Signed in.", "success");
    }, 600);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Access your enquiries, saved properties, and listings.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="max-w-none"
        />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error || undefined}
            className="max-w-none"
          />
          <Link href="/reset-password" className="mt-2 inline-block text-xs font-semibold text-patina hover:text-patina-deep">
            Forgot your password
          </Link>
        </div>
        <Button type="submit" loading={submitting} className="w-full justify-center">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link href="/register" className="font-semibold text-patina hover:text-patina-deep">Create an account</Link>
      </p>
    </div>
  );
}
